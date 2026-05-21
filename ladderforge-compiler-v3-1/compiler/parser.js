import { getInstructionInfo } from "./instruction-db.js";

export function parse(tokens) {
  const ast = [];
  const diagnostics = [];

  const state = {
    currentNetwork: null,
    currentBlock: null,
    pendingLabel: null,
    bracketDepth: 0,
    maxBracketDepth: 0,
    networks: 0,
    blocks: 0,
    labels: 0
  };

  for (const token of tokens) {
    if (token.kind === "LABEL") {
      state.labels++;
      state.pendingLabel = token.value;

      ast.push({
        type: "Label",
        name: token.value,
        line: token.line
      });

      continue;
    }

    if (token.kind === "CALL_PARAM") {
      ast.push({
        type: "CallParam",
        param: token.param,
        value: normalizeOperand(token.value),
        line: token.line,
        raw: token.raw,
        networkTitle: state.currentNetwork?.title || null,
        block: state.currentBlock
      });

      continue;
    }

    const node = parseInstruction(token.value, token.line, token.raw);

    if (state.pendingLabel) {
      node.label = state.pendingLabel;
      state.pendingLabel = null;
    }

    handleParserState(node, state, ast, diagnostics);
  }

  if (state.bracketDepth > 0) {
    diagnostics.push({
      severity: "error",
      message: `${state.bracketDepth} unclosed bracket expression(s).`,
      suggestion: "Check A( / AN( / O( / ON( / X( / XN( and matching )."
    });
  }

  return {
    ast,
    diagnostics,
    summary: {
      blocks: state.blocks,
      networks: state.networks,
      labels: state.labels,
      maxBracketDepth: state.maxBracketDepth,
      unclosedBrackets: state.bracketDepth
    }
  };
}

function parseInstruction(text, line, raw) {
  const trimmed = text.trim();

  const titleMatch = trimmed.match(/^TITLE\s*=?\s*(.*)$/i);
  if (titleMatch) {
    return baseNode("TITLE", titleMatch[1].trim(), line, raw, trimmed);
  }

  const metaMatch = trimmed.match(/^(VERSION|AUTHOR|FAMILY|NAME)\s*[:=]?\s*(.*)$/i);
  if (metaMatch) {
    return baseNode(metaMatch[1].toUpperCase(), metaMatch[2].trim(), line, raw, trimmed);
  }

  if (/^\)$/.test(trimmed)) {
    return baseNode(")", "", line, raw, trimmed);
  }

  if (/^\)MCR$/i.test(trimmed)) {
    return baseNode(")MCR", "", line, raw, trimmed);
  }

  const bracketOpen = trimmed.match(/^(A|AN|O|ON|X|XN|MCR)\s*\($/i);
  if (bracketOpen) {
    const op = bracketOpen[1].toUpperCase();
    return baseNode(op === "MCR" ? "MCR(" : `${op}(`, "", line, raw, trimmed);
  }

  const parts = trimmed.split(/\s+/);

  let opcode = (parts[0] || "").toUpperCase();
  let operand = parts.slice(1).join(" ");

  // Support compare format like: > I, <= D, == R
  if ([">", "<", ">=", "<=", "==", "<>"].includes(opcode) && ["I", "D", "R"].includes((parts[1] || "").toUpperCase())) {
    opcode = opcode + parts[1].toUpperCase();
    operand = parts.slice(2).join(" ");
  }

  opcode = normalizeOpcode(opcode, operand);
  operand = normalizeOperand(operand);

  return baseNode(opcode, operand, line, raw, trimmed);
}

function normalizeOpcode(opcode, operand = "") {
  const hasOperand = String(operand).trim().length > 0;

  // Important: Siemens SET has no operand and means set RLO.
  // Industry SET with operand means set coil.
  if (opcode === "SET" && hasOperand) return "S";
  if (opcode === "RST" || opcode === "RES") return "R";
  if (opcode === "OUT" || opcode === "OTE") return "=";

  const aliases = {
    // Industry aliases
    "AND": "A",
    "ANDN": "AN",
    "ANI": "AN",
    "OR": "O",
    "ORN": "ON",
    "ORI": "O",
    "ORNI": "ON",
    "MOVE": "MOV",

    // Jump aliases
    "JMP": "JU",
    "JMPC": "JC",

    // German/SIMATIC common aliases
    "U": "A",
    "UN": "AN",
    "U(": "A(",
    "UN(": "AN(",
    "AUF": "OPN",
    "BEA": "BEU",
    "BEB": "BEC",
    "SPA": "JU",
    "SPB": "JC",
    "SPBN": "JCN"
  };

  return aliases[opcode] || opcode;
}

function normalizeOperand(operand = "") {
  return String(operand)
    .trim()

    // Bit addresses: I0.0 -> I 0.0
    .replace(/^([IQM])(\d+\.\d+)$/i, "$1 $2")

    // Word/byte/dword addresses: MW10 -> MW 10
    .replace(/^(MW|MB|MD|IW|IB|ID|QW|QB|QD)(\d+)$/i, "$1 $2")

    // DB addresses: DBW0 -> DBW 0, DBX2.0 -> DBX 2.0
    .replace(/^(DBX|DBB|DBW|DBD)(\d+(?:\.\d+)?)$/i, "$1 $2")

    // Timer / counter: T1 -> T 1, C1 -> C 1
    .replace(/^(T|C)(\d+)$/i, "$1 $2")

    .replace(/\s+/g, " ");
}

function baseNode(opcode, operand, line, raw, text) {
  const info = getInstructionInfo(opcode);

  return {
    type: "Instruction",
    opcode,
    operand,
    line,
    raw: text,
    originalRaw: raw,
    support: info.support,
    instructionType: info.type,
    label: null,
    networkTitle: null,
    block: null
  };
}

function handleParserState(node, state, ast, diagnostics) {
  if (isBlockStart(node.opcode)) {
    state.blocks++;

    state.currentBlock = {
      type: node.opcode,
      name: node.operand || "",
      line: node.line
    };

    node.block = state.currentBlock;
    ast.push(node);
    return;
  }

  if (isBlockEnd(node.opcode)) {
    node.block = state.currentBlock;
    ast.push(node);
    state.currentBlock = null;
    return;
  }

  if (node.opcode === "NETWORK") {
    state.networks++;

    state.currentNetwork = {
      title: "",
      line: node.line
    };

    ast.push({
      type: "NetworkStart",
      title: "",
      line: node.line,
      block: state.currentBlock
    });

    return;
  }

  if (node.opcode === "TITLE") {
    if (state.currentNetwork) {
      state.currentNetwork.title = node.operand;

      ast.push({
        type: "NetworkTitle",
        title: node.operand,
        line: node.line,
        block: state.currentBlock
      });
    } else {
      ast.push(node);
    }

    return;
  }

  if (["A(", "AN(", "O(", "ON(", "X(", "XN(", "MCR("].includes(node.opcode)) {
    state.bracketDepth++;
    state.maxBracketDepth = Math.max(state.maxBracketDepth, state.bracketDepth);
  }

  if (node.opcode === ")" || node.opcode === ")MCR") {
    state.bracketDepth--;

    if (state.bracketDepth < 0) {
      diagnostics.push({
        severity: "error",
        line: node.line,
        message: "Closing bracket found without matching opening bracket.",
        suggestion: "Remove extra ')' or add matching A( / O( / MCR( before it."
      });

      state.bracketDepth = 0;
    }
  }

  node.networkTitle = state.currentNetwork?.title || null;
  node.block = state.currentBlock;
  node.bracketDepth = state.bracketDepth;

  ast.push(node);
}

function isBlockStart(opcode) {
  return [
    "ORGANIZATION_BLOCK",
    "FUNCTION_BLOCK",
    "FUNCTION",
    "DATA_BLOCK"
  ].includes(opcode);
}

function isBlockEnd(opcode) {
  return [
    "END_ORGANIZATION_BLOCK",
    "END_FUNCTION_BLOCK",
    "END_FUNCTION",
    "END_DATA_BLOCK"
  ].includes(opcode);
} 
