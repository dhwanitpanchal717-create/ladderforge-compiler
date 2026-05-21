export function buildLadderIR(ast, analysis, cfg) {
  const ir = [];
  const diagnostics = [];

  const exprStack = [];

  let contacts = [];
  let accumulator = [];
  let networkTitle = "Main";
  let block = null;

  let partialPenalty = 0;
  let unsupportedPenalty = 0;

  for (const node of ast) {
    if (node.type === "NetworkStart") {
      ir.push({
        kind: "network",
        title: networkTitle || "Untitled",
        line: node.line
      });

      continue;
    }

    if (node.type === "NetworkTitle") {
      networkTitle = node.title || "Untitled";

      ir.push({
        kind: "network",
        title: networkTitle,
        line: node.line
      });

      continue;
    }

    if (node.type === "Label") {
      ir.push({
        kind: "label",
        name: node.name,
        line: node.line,
        network: networkTitle
      });

      continue;
    }

    if (node.type === "CallParam") {
      ir.push({
        kind: "callParam",
        param: node.param,
        value: normalizeAddress(node.value),
        line: node.line,
        network: networkTitle
      });

      partialPenalty += 3;
      continue;
    }

    if (node.type !== "Instruction") continue;

    switch (node.opcode) {
      // =========================
      // BLOCKS / META
      // =========================
      case "ORGANIZATION_BLOCK":
      case "FUNCTION_BLOCK":
      case "FUNCTION":
      case "DATA_BLOCK":
        block = {
          type: node.opcode,
          name: node.operand,
          line: node.line
        };

        ir.push({
          kind: "blockStart",
          block,
          line: node.line
        });

        partialPenalty += 2;
        break;

      case "END_ORGANIZATION_BLOCK":
      case "END_FUNCTION_BLOCK":
      case "END_FUNCTION":
      case "END_DATA_BLOCK":
        ir.push({
          kind: "blockEnd",
          block,
          line: node.line
        });

        block = null;
        partialPenalty += 1;
        break;

      case "VERSION":
      case "AUTHOR":
      case "FAMILY":
      case "NAME":
      case "BEGIN":
      case "BLD":
      case "NOP":
        ir.push({
          kind: "meta",
          opcode: node.opcode,
          operand: node.operand,
          line: node.line,
          network: networkTitle
        });

        break;

      // =========================
      // BRACKETS
      // =========================
      case "A(":
      case "AN(":
      case "O(":
      case "ON(":
      case "X(":
      case "XN(":
      case "MCR(":
        exprStack.push({
          op: node.opcode.replace("(", ""),
          inverted: ["AN(", "ON(", "XN("].includes(node.opcode),
          contacts: contacts.splice(0),
          line: node.line
        });

        ir.push({
          kind: "bracketOpen",
          opcode: node.opcode,
          line: node.line,
          network: networkTitle
        });

        partialPenalty += 2;
        break;

      case ")":
      case ")MCR": {
        const group = exprStack.pop();

        ir.push({
          kind: "bracketClose",
          opcode: node.opcode,
          line: node.line,
          network: networkTitle
        });

        contacts.push({
          kind: "groupContact",
          op: group?.op || "GROUP",
          inverted: group?.inverted || false,
          contacts: group?.contacts || [],
          line: node.line
        });

        partialPenalty += 2;
        break;
      }

      // =========================
      // LOGIC CONTACTS
      // =========================
      case "LD":
      case "LDN":
      case "A":
      case "AN":
      case "O":
      case "ON":
      case "X":
      case "XN":
        contacts.push({
          kind: "contact",
          address: normalizeAddress(node.operand),
          inverted: ["LDN", "AN", "ON", "XN"].includes(node.opcode),
          branch: ["O", "ON"].includes(node.opcode)
            ? "OR"
            : ["X", "XN"].includes(node.opcode)
              ? "XOR"
              : "AND",
          line: node.line
        });

        if (!["LD", "LDN", "A", "AN"].includes(node.opcode)) {
          partialPenalty += 2;
        }

        break;

      // =========================
      // COILS
      // =========================
      case "=":
      case "S":
      case "R":
        ir.push({
          kind: "rung",
          network: networkTitle,
          contacts: [...contacts],
          action: {
            type: node.opcode === "="
              ? "coil"
              : node.opcode === "S"
                ? "set"
                : "reset",
            target: normalizeAddress(node.operand)
          },
          line: node.line
        });

        contacts = [];
        break;

      // =========================
      // RLO CONTROL
      // =========================
      case "NOT":
      case "SET":
      case "CLR":
      case "SAVE":
        ir.push({
          kind: "rloControl",
          op: node.opcode,
          line: node.line,
          network: networkTitle
        });

        partialPenalty += 3;
        break;

      // =========================
      // EDGE
      // =========================
      case "FP":
      case "FN":
      case "ONS":
        contacts.push({
          kind: "edgeContact",
          edge: node.opcode,
          memory: normalizeAddress(node.operand),
          line: node.line
        });

        partialPenalty += 4;
        break;

      // =========================
      // JUMPS / CONTROL FLOW
      // =========================
      case "JC":
      case "JCN":
      case "JCB":
      case "JNB":
      case "JBI":
      case "JNBI":
      case "JO":
      case "JOS":
      case "JZ":
      case "JN":
      case "JP":
      case "JM":
      case "JPZ":
      case "JMZ":
      case "JUO":
        ir.push({
          kind: "jump",
          network: networkTitle,
          jumpType: node.opcode,
          condition: [...contacts],
          target: node.operand,
          line: node.line
        });

        contacts = [];
        partialPenalty += 8;
        break;

      case "JU":
      case "JL":
      case "LOOP":
        ir.push({
          kind: "jump",
          network: networkTitle,
          jumpType: node.opcode,
          condition: [],
          target: node.operand,
          line: node.line
        });

        partialPenalty += 6;
        break;

      // =========================
      // LOAD / TRANSFER
      // =========================
      case "L":
      case "LC":
        accumulator.push(normalizeAddress(node.operand));

        ir.push({
          kind: "operation",
          op: node.opcode === "LC" ? "LOAD_BCD" : "LOAD",
          value: normalizeAddress(node.operand),
          line: node.line,
          network: networkTitle
        });

        partialPenalty += 1;
        break;

      case "T":
        ir.push({
          kind: "assignment",
          target: normalizeAddress(node.operand),
          expression: buildExpression(accumulator),
          line: node.line,
          network: networkTitle
        });

        accumulator = [];
        partialPenalty += 2;
        break;

      case "MOV":
        accumulator.push(normalizeAddress(node.operand));

        ir.push({
          kind: "operation",
          op: "MOV",
          value: normalizeAddress(node.operand),
          line: node.line,
          network: networkTitle
        });

        partialPenalty += 2;
        break;

      // =========================
      // MATH / CONVERSION / SHIFT / WORD LOGIC
      // =========================
      case "INC":
      case "DEC":
      case "+":
      case "+I":
      case "-I":
      case "*I":
      case "/I":
      case "+D":
      case "-D":
      case "*D":
      case "/D":
      case "MOD":
      case "+R":
      case "-R":
      case "*R":
      case "/R":
      case "ADD":
      case "SUB":
      case "MUL":
      case "DIV":
      case "ABS":
      case "SQR":
      case "SQRT":
      case "EXP":
      case "LN":
      case "SIN":
      case "COS":
      case "TAN":
      case "ASIN":
      case "ACOS":
      case "ATAN":
      case "BTI":
      case "ITB":
      case "BTD":
      case "ITD":
      case "DTB":
      case "DTR":
      case "INVI":
      case "INVD":
      case "NEGI":
      case "NEGD":
      case "NEGR":
      case "CAW":
      case "CAD":
      case "RND":
      case "TRUNC":
      case "RND+":
      case "RND-":
      case "SSI":
      case "SSD":
      case "SLW":
      case "SRW":
      case "SLD":
      case "SRD":
      case "RLD":
      case "RRD":
      case "RLDA":
      case "RRDA":
      case "AW":
      case "OW":
      case "XOW":
      case "AD":
      case "OD":
      case "XOD":
      case "TAK":
      case "POP":
      case "PUSH":
      case "ENT":
      case "LEAVE":
      case "+AR1":
      case "+AR2":
      case "LAR1":
      case "LAR2":
      case "TAR1":
      case "TAR2":
      case "CAR":
        accumulator.push(node.opcode + (node.operand ? " " + normalizeAddress(node.operand) : ""));

        ir.push({
          kind: "operation",
          op: node.opcode,
          value: normalizeAddress(node.operand),
          line: node.line,
          network: networkTitle
        });

        partialPenalty += 3;
        break;

      // =========================
      // COMPARE
      // =========================
      case "==I":
      case "<>I":
      case ">I":
      case "<I":
      case ">=I":
      case "<=I":
      case "==D":
      case "<>D":
      case ">D":
      case "<D":
      case ">=D":
      case "<=D":
      case "==R":
      case "<>R":
      case ">R":
      case "<R":
      case ">=R":
      case "<=R":
      case "GT":
      case "GE":
      case "LT":
      case "LE":
      case "EQ":
      case "NE": {
        const cmp = makeCompare(node.opcode, accumulator);

        contacts.push({
          kind: "compareContact",
          expression: cmp,
          line: node.line
        });

        ir.push({
          kind: "compare",
          expression: cmp,
          line: node.line,
          network: networkTitle
        });

        accumulator = [];
        partialPenalty += 3;
        break;
      }

      // =========================
      // TIMER / COUNTER
      // =========================
      case "SP":
      case "SE":
      case "SD":
      case "SS":
      case "SF":
      case "TON":
      case "TOF":
      case "TP":
      case "RTO":
        ir.push({
          kind: "timer",
          timerType: node.opcode,
          timer: normalizeAddress(node.operand),
          condition: [...contacts],
          preset: findLastTimerPreset(ir),
          line: node.line,
          network: networkTitle
        });

        contacts = [];
        partialPenalty += 4;
        break;

      case "FR":
        ir.push({
          kind: "timerCounterEnable",
          target: normalizeAddress(node.operand),
          condition: [...contacts],
          line: node.line,
          network: networkTitle
        });

        contacts = [];
        partialPenalty += 3;
        break;

      case "CU":
      case "CD":
      case "CTU":
      case "CTD":
      case "CTUD":
        ir.push({
          kind: "counter",
          counterType: node.opcode,
          counter: normalizeAddress(node.operand),
          condition: [...contacts],
          preset: findLastCounterPreset(ir),
          line: node.line,
          network: networkTitle
        });

        contacts = [];
        partialPenalty += 4;
        break;

      // =========================
      // DATA BLOCK
      // =========================
      case "OPN":
      case "CDB":
        ir.push({
          kind: "db",
          op: node.opcode,
          db: normalizeAddress(node.operand),
          line: node.line,
          network: networkTitle
        });

        partialPenalty += 5;
        break;

      // =========================
      // PROGRAM CONTROL / CALL
      // =========================
      case "BE":
      case "BEC":
      case "BEU":
        ir.push({
          kind: "programControl",
          op: node.opcode,
          line: node.line,
          network: networkTitle
        });

        partialPenalty += 4;
        break;

      case "CALL":
      case "UC":
      case "CC":
        ir.push({
          kind: "functionBlockCall",
          callType: node.opcode,
          target: normalizeAddress(node.operand),
          line: node.line,
          network: networkTitle
        });

        unsupportedPenalty += 10;
        break;

      case "MCR":
      case "MCR(":
      case ")MCR":
      case "MCRA":
      case "MCRD":
        ir.push({
          kind: "mcr",
          op: node.opcode,
          line: node.line,
          network: networkTitle
        });

        partialPenalty += 5;
        break;

      default:
        ir.push({
          kind: "unsupported",
          raw: node.raw,
          line: node.line,
          network: networkTitle
        });

        unsupportedPenalty += 10;

        diagnostics.push({
          severity: "error",
          line: node.line,
          message: `No Ladder IR handler for ${node.opcode}.`,
          suggestion: "Instruction exists but needs a dedicated IR conversion rule."
        });
    }
  }

  if (contacts.length) {
    ir.push({
      kind: "rlo",
      contacts: [...contacts],
      network: networkTitle,
      line: contacts[0]?.line || null
    });
  }

  const analysisPenalty =
    (analysis.stats?.partial || 0) * 1.15 +
    (analysis.stats?.unsupported || 0) * 8;

  const cfgPenalty = countUnresolvedJumps(cfg) * 6;

  const confidence = Math.round(
    Math.max(
      8,
      Math.min(
        100,
        100 - partialPenalty - unsupportedPenalty - analysisPenalty - cfgPenalty
      )
    )
  );

  return {
    ir,
    diagnostics,
    confidence,
    mode: confidence >= 94
      ? "Clean Ladder"
      : confidence >= 70
        ? "Pseudo-Ladder Review"
        : "Manual Review Required"
  };
}

function normalizeAddress(address = "") {
  return String(address)
    .trim()
    .replace(/^([IQM])(\d+\.\d+)$/i, "$1 $2")
    .replace(/^(MW|MB|MD|IW|IB|ID|QW|QB|QD)(\d+)$/i, "$1 $2")
    .replace(/^(DBX|DBB|DBW|DBD)(\d+(?:\.\d+)?)$/i, "$1 $2")
    .replace(/^(T|C)(\d+)$/i, "$1 $2")
    .replace(/\s+/g, " ");
}

function buildExpression(accumulator) {
  if (!accumulator.length) return "ACC";
  if (accumulator.length === 1) return accumulator[0];

  const values = accumulator.filter(
    value => !/^(ADD|SUB|MUL|DIV|[+\-*/][IDR]|\+|-|\*|\/|MOD)/.test(value)
      && !["TAK", "POP", "PUSH", "ENT", "LEAVE"].includes(value)
  );

  const ops = accumulator.filter(
    value => /^(ADD|SUB|MUL|DIV|[+\-*/][IDR]|\+|-|\*|\/|MOD)/.test(value)
  );

  if (ops.length && values.length >= 2) {
    const opToken = ops[ops.length - 1].split(/\s+/)[0];

    const opMap = {
      "+": "+",
      "+I": "+",
      "-I": "-",
      "*I": "*",
      "/I": "/",
      "+D": "+",
      "-D": "-",
      "*D": "*",
      "/D": "/",
      "+R": "+",
      "-R": "-",
      "*R": "*",
      "/R": "/",
      "ADD": "+",
      "SUB": "-",
      "MUL": "*",
      "DIV": "/",
      "MOD": "%"
    };

    const op = opMap[opToken] || opToken;
    return `${values[0]} ${op} ${values[1]}`;
  }

  let expression = values[0] || accumulator[0];

  for (const part of accumulator.slice(1)) {
    if (part.startsWith("INC")) {
      expression = `${expression} + ${part.split(/\s+/)[1] || "1"}`;
    } else if (part.startsWith("DEC")) {
      expression = `${expression} - ${part.split(/\s+/)[1] || "1"}`;
    } else {
      expression += ` ${part}`;
    }
  }

  return expression;
}

function makeCompare(opcode, accumulator) {
  const left = accumulator[0] || "ACC1";
  const right = accumulator[1] || "ACC2";

  const map = {
    "==I": "==",
    "<>I": "!=",
    ">I": ">",
    "<I": "<",
    ">=I": ">=",
    "<=I": "<=",

    "==D": "==",
    "<>D": "!=",
    ">D": ">",
    "<D": "<",
    ">=D": ">=",
    "<=D": "<=",

    "==R": "==",
    "<>R": "!=",
    ">R": ">",
    "<R": "<",
    ">=R": ">=",
    "<=R": "<=",

    "GT": ">",
    "GE": ">=",
    "LT": "<",
    "LE": "<=",
    "EQ": "==",
    "NE": "!="
  };

  return `${left} ${map[opcode] || opcode} ${right}`;
}

function findLastTimerPreset(ir) {
  for (let i = ir.length - 1; i >= 0; i--) {
    if (
      ir[i].kind === "operation" &&
      /^S5T#/i.test(ir[i].value || "")
    ) {
      return ir[i].value;
    }
  }

  return null;
}

function findLastCounterPreset(ir) {
  for (let i = ir.length - 1; i >= 0; i--) {
    if (
      ir[i].kind === "operation" &&
      /^C#/i.test(ir[i].value || "")
    ) {
      return ir[i].value;
    }
  }

  return null;
}

function countUnresolvedJumps(cfg) {
  return (cfg.nodes || []).reduce((count, node) => {
    return count + (node.edges || []).filter(edge => edge.resolved === false).length;
  }, 0);
} 
