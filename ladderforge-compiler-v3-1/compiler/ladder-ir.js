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
      ir.push({ kind: "network", title: networkTitle || "Untitled", line: node.line });
      continue;
    }

    if (node.type === "NetworkTitle") {
      networkTitle = node.title || "Untitled";
      ir.push({ kind: "network", title: networkTitle, line: node.line });
      continue;
    }

    if (node.type === "Label") {
      ir.push({ kind: "label", name: node.name, line: node.line, network: networkTitle });
      continue;
    }

    if (node.type === "CallParam") {
      ir.push({ kind: "callParam", param: node.param, value: node.value, line: node.line, network: networkTitle });
      partialPenalty += 3;
      continue;
    }

    if (node.type !== "Instruction") continue;

    switch (node.opcode) {
      case "ORGANIZATION_BLOCK":
      case "FUNCTION_BLOCK":
      case "FUNCTION":
      case "DATA_BLOCK":
        block = { type: node.opcode, name: node.operand, line: node.line };
        ir.push({ kind: "blockStart", block, line: node.line });
        partialPenalty += 2;
        break;

      case "END_ORGANIZATION_BLOCK":
      case "END_FUNCTION_BLOCK":
      case "END_FUNCTION":
      case "END_DATA_BLOCK":
        ir.push({ kind: "blockEnd", block, line: node.line });
        block = null;
        partialPenalty += 1;
        break;

      case "VERSION":
      case "AUTHOR":
      case "FAMILY":
      case "NAME":
      case "BEGIN":
      case "NOP":
        ir.push({ kind: "meta", opcode: node.opcode, operand: node.operand, line: node.line, network: networkTitle });
        break;

      case "A(":
      case "O(":
      case "X(":
        exprStack.push({ op: node.opcode.replace("(", ""), contacts: contacts.splice(0), line: node.line });
        ir.push({ kind: "bracketOpen", opcode: node.opcode, line: node.line, network: networkTitle });
        partialPenalty += 2;
        break;

      case ")":
        const group = exprStack.pop();
        ir.push({ kind: "bracketClose", line: node.line, network: networkTitle });
        contacts.push({
          kind: "groupContact",
          op: group?.op || "GROUP",
          contacts: group?.contacts || [],
          line: node.line
        });
        partialPenalty += 2;
        break;

      case "A":
      case "AN":
      case "O":
      case "ON":
      case "X":
      case "XN":
        contacts.push({
          kind: "contact",
          address: node.operand,
          inverted: node.opcode.endsWith("N"),
          branch: ["O", "ON"].includes(node.opcode) ? "OR" : ["X", "XN"].includes(node.opcode) ? "XOR" : "AND",
          line: node.line
        });
        if (!["A", "AN"].includes(node.opcode)) partialPenalty += 2;
        break;

      case "=":
      case "S":
      case "R":
        ir.push({
          kind: "rung",
          network: networkTitle,
          contacts: [...contacts],
          action: {
            type: node.opcode === "=" ? "coil" : node.opcode === "S" ? "set" : "reset",
            target: node.operand
          },
          line: node.line
        });
        contacts = [];
        break;

      case "FP":
      case "FN":
        contacts.push({
          kind: "edgeContact",
          edge: node.opcode,
          memory: node.operand,
          line: node.line
        });
        partialPenalty += 4;
        break;

      case "JC":
      case "JCN":
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

      case "L":
        accumulator.push(node.operand);
        ir.push({ kind: "operation", op: "LOAD", value: node.operand, line: node.line, network: networkTitle });
        partialPenalty += 1;
        break;

      case "T":
        ir.push({
          kind: "assignment",
          target: node.operand,
          expression: buildExpression(accumulator),
          line: node.line,
          network: networkTitle
        });
        accumulator = [];
        partialPenalty += 2;
        break;

      case "INC":
      case "DEC":
      case "+I":
      case "-I":
      case "*I":
      case "/I":
      case "+R":
      case "-R":
      case "*R":
      case "/R":
      case "TAK":
        accumulator.push(node.opcode + (node.operand ? " " + node.operand : ""));
        ir.push({ kind: "operation", op: node.opcode, value: node.operand, line: node.line, network: networkTitle });
        partialPenalty += 3;
        break;

      case ">I":
      case "<I":
      case ">=I":
      case "<=I":
      case "==I":
      case "<>I":
      case ">R":
      case "<R":
      case ">=R":
      case "<=R":
      case "==R":
      case "<>R":
        const cmp = makeCompare(node.opcode, accumulator);
        contacts.push({ kind: "compareContact", expression: cmp, line: node.line });
        ir.push({ kind: "compare", expression: cmp, line: node.line, network: networkTitle });
        accumulator = [];
        partialPenalty += 3;
        break;

      case "SD":
      case "SE":
      case "SF":
      case "SP":
      case "SS":
        ir.push({
          kind: "timer",
          timerType: node.opcode,
          timer: node.operand,
          condition: [...contacts],
          preset: findLastTimerPreset(ir),
          line: node.line,
          network: networkTitle
        });
        contacts = [];
        partialPenalty += 4;
        break;

      case "CU":
      case "CD":
        ir.push({
          kind: "counter",
          counterType: node.opcode,
          counter: node.operand,
          condition: [...contacts],
          preset: findLastCounterPreset(ir),
          line: node.line,
          network: networkTitle
        });
        contacts = [];
        partialPenalty += 4;
        break;

      case "OPN":
        ir.push({ kind: "db", db: node.operand, line: node.line, network: networkTitle });
        partialPenalty += 5;
        break;

      case "CALL":
      case "UC":
      case "CC":
        ir.push({ kind: "functionBlockCall", callType: node.opcode, target: node.operand, line: node.line, network: networkTitle });
        unsupportedPenalty += 10;
        break;

      default:
        ir.push({ kind: "unsupported", raw: node.raw, line: node.line, network: networkTitle });
        unsupportedPenalty += 10;
        diagnostics.push({
          severity: "error",
          line: node.line,
          message: `No Ladder IR handler for ${node.opcode}.`,
          suggestion: "Add this instruction to instruction-db and ladder-ir builder."
        });
    }
  }

  if (contacts.length) {
    ir.push({ kind: "rlo", contacts: [...contacts], network: networkTitle, line: contacts[0]?.line || null });
  }

  const analysisPenalty = (analysis.stats?.partial || 0) * 1.4 + (analysis.stats?.unsupported || 0) * 8;
  const cfgPenalty = countUnresolvedJumps(cfg) * 6;
  const confidence = Math.round(Math.max(8, Math.min(100, 100 - partialPenalty - unsupportedPenalty - analysisPenalty - cfgPenalty)));

  return {
    ir,
    diagnostics,
    confidence,
    mode: confidence >= 94 ? "Clean Ladder" : confidence >= 70 ? "Pseudo-Ladder Review" : "Manual Review Required"
  };
}

function buildExpression(accumulator) {
  if (!accumulator.length) return "ACC";
  if (accumulator.length === 1) return accumulator[0];

  let values = accumulator.filter(v => !/^[+\-*/][IR]/.test(v) && !["TAK"].includes(v));
  let ops = accumulator.filter(v => /^[+\-*/][IR]/.test(v));

  if (ops.length && values.length >= 2) {
    const op = ops[ops.length - 1][0];
    return `${values[0]} ${op} ${values[1]}`;
  }

  let expr = values[0] || accumulator[0];
  for (const part of accumulator.slice(1)) {
    if (part.startsWith("INC")) expr = `${expr} + ${part.split(/\s+/)[1] || "1"}`;
    else if (part.startsWith("DEC")) expr = `${expr} - ${part.split(/\s+/)[1] || "1"}`;
    else expr += ` ${part}`;
  }
  return expr;
}

function makeCompare(opcode, accumulator) {
  const left = accumulator[0] || "ACC1";
  const right = accumulator[1] || "ACC2";
  const map = { ">I": ">", "<I": "<", ">=I": ">=", "<=I": "<=", "==I": "==", "<>I": "!=", ">R": ">", "<R": "<", ">=R": ">=", "<=R": "<=", "==R": "==", "<>R": "!=" };
  return `${left} ${map[opcode] || opcode} ${right}`;
}

function findLastTimerPreset(ir) {
  for (let i = ir.length - 1; i >= 0; i--) {
    if (ir[i].kind === "operation" && /^S5T#/i.test(ir[i].value || "")) return ir[i].value;
  }
  return null;
}

function findLastCounterPreset(ir) {
  for (let i = ir.length - 1; i >= 0; i--) {
    if (ir[i].kind === "operation" && /^C#/i.test(ir[i].value || "")) return ir[i].value;
  }
  return null;
}

function countUnresolvedJumps(cfg) {
  return (cfg.nodes || []).reduce((count, node) => {
    return count + (node.edges || []).filter(e => e.resolved === false).length;
  }, 0);
}
