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
        value: token.value,
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
      suggestion: "Check A( / O( / X( and matching ) instructions."
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

  // Handle TITLE = ...
  const titleMatch = trimmed.match(/^TITLE\s*=?\s*(.*)$/i);
  if (titleMatch) {
    return baseNode("TITLE", titleMatch[1].trim(), line, raw, trimmed);
  }

  // Handle VERSION : 0.1 / VERSION = 0.1
  const metaMatch = trimmed.match(/^(VERSION|AUTHOR|FAMILY|NAME)\s*[:=]?\s*(.*)$/i);
  if (metaMatch) {
    return baseNode(metaMatch[1].toUpperCase(), metaMatch[2].trim(), line, raw, trimmed);
  }

  // Bracket forms: A(, A (, O(, O (, X(, )
  if (/^\)$/.test(trimmed)) {
    return baseNode(")", "", line, raw, trimmed);
  }

  const bracketOpen = trimmed.match(/^(A|O|X)\s*\($/i);
  if (bracketOpen) {
    return baseNode(`${bracketOpen[1].toUpperCase()}(`, "", line, raw, trimmed);
  }

  // CALL FB 10, DB 10 etc.
  const parts = trimmed.split(/\s+/);
  const opcode = (parts[0] || "").toUpperCase();
  const operand = parts.slice(1).join(" ");

  return baseNode(opcode, operand, line, raw, trimmed);
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

  if (["A(", "O(", "X("].includes(node.opcode)) {
    state.bracketDepth++;
    state.maxBracketDepth = Math.max(state.maxBracketDepth, state.bracketDepth);
  }

  if (node.opcode === ")") {
    state.bracketDepth--;
    if (state.bracketDepth < 0) {
      diagnostics.push({
        severity: "error",
        line: node.line,
        message: "Closing bracket found without matching opening bracket.",
        suggestion: "Remove extra ')' or add matching A( / O( before it."
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
  return ["ORGANIZATION_BLOCK", "FUNCTION_BLOCK", "FUNCTION", "DATA_BLOCK"].includes(opcode);
}

function isBlockEnd(opcode) {
  return ["END_ORGANIZATION_BLOCK", "END_FUNCTION_BLOCK", "END_FUNCTION", "END_DATA_BLOCK"].includes(opcode);
}
