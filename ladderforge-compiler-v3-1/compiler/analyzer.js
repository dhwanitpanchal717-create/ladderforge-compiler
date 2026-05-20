import { getInstructionInfo } from "./instruction-db.js";

export function analyze(ast) {
  const diagnostics = [];
  const symbols = {};
  let full = 0;
  let partial = 0;
  let unsupported = 0;

  for (const node of ast) {
    if (node.type === "CallParam") {
      partial++;
      addSymbol(symbols, node.value, "call-param");
      diagnostics.push({
        severity: "warning",
        line: node.line,
        message: `CALL parameter mapped: ${node.param} := ${node.value}`,
        suggestion: "V3.1 preserves this as block parameter. V3.6 will convert it into function block visual box."
      });
      continue;
    }

    if (node.type !== "Instruction") continue;

    const info = getInstructionInfo(node.opcode);

    if (info.support === "full") full++;
    if (info.support === "partial") {
      partial++;
      diagnostics.push({
        severity: "warning",
        line: node.line,
        message: `${node.opcode} is partially supported: ${info.description}`,
        suggestion: suggestionFor(info.type)
      });
    }

    if (info.support === "none") {
      unsupported++;
      diagnostics.push({
        severity: "error",
        line: node.line,
        message: `${node.opcode} is not safely convertible yet: ${info.description}`,
        suggestion: suggestionFor(info.type)
      });
    }

    collectSymbols(symbols, node.operand, info.type);
  }

  return {
    diagnostics,
    symbols,
    stats: { full, partial, unsupported }
  };
}

function collectSymbols(symbols, operand = "", context = "operand") {
  const patterns = [
    /\b[IQM]\s*\d+\.\d+\b/gi,
    /\b(MW|MB|MD|IW|IB|ID|QW|QB|QD)\s*\d+\b/gi,
    /\b(DBX|DBB|DBW|DBD)\s*\d+(?:\.\d+)?\b/gi,
    /\bDB\s*\d+\b/gi,
    /\bT\s*\d+\b/gi,
    /\bC\s*\d+\b/gi,
    /\bS5T#[A-Za-z0-9_]+\b/gi,
    /\bC#\d+\b/gi,
    /\bFB\s*\d+\b/gi,
    /\bFC\s*\d+\b/gi
  ];

  for (const pattern of patterns) {
    const matches = String(operand).match(pattern);
    if (!matches) continue;
    for (const match of matches) addSymbol(symbols, match, context);
  }
}

function addSymbol(symbols, raw, context) {
  const key = String(raw).replace(/\s+/g, " ").trim();
  if (!key) return;

  symbols[key] = symbols[key] || {
    alias: null,
    contexts: []
  };

  if (!symbols[key].contexts.includes(context)) {
    symbols[key].contexts.push(context);
  }
}

function suggestionFor(type) {
  const map = {
    logic: "OR/XOR logic is preserved, but complex branches may need manual review.",
    bracket: "Bracket expression is parsed and preserved. Clean branch simplification comes in later CFG/expression upgrade.",
    math: "Accumulator math is represented as pseudo-ladder expression.",
    compare: "Compare is converted into compare-contact foundation.",
    control_flow: "Jump is represented in CFG/pseudo-ladder. Manual review recommended.",
    timer: "Timer foundation is shown, but exact Siemens timer semantics should be verified.",
    counter: "Counter foundation is shown, but preset/reset behavior should be verified.",
    db: "DB access needs DB structure import for readable names.",
    block_call: "FB/FC calls are preserved as diagnostics/block placeholders.",
    block: "Block header/footer is parsed for structure only.",
    meta: "Metadata is parsed and preserved."
  };

  return map[type] || "Add a handler for this instruction type in the compiler.";
}
