export function lex(source) {
  const tokens = [];
  const lines = source.split(/\r?\n/);

  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const cleaned = cleanLine(raw);

    if (!cleaned.trim()) return;

    // Split multiple statements in one line only when safe.
    // Keeps CALL parameters intact.
    const parts = splitStatements(cleaned);

    for (const part of parts) {
      tokenizeStatement(part.trim(), raw, lineNo, tokens);
    }
  });

  return tokens;
}

function cleanLine(raw) {
  return raw
    .replace(/\/\/.*$/g, "")
    .replace(/;.*$/g, "")
    .trim();
}

function splitStatements(line) {
  // AWL often has one instruction per line. This keeps it simple but tolerates repeated spaces.
  return [line];
}

function tokenizeStatement(text, raw, line, tokens) {
  // Label with inline instruction: RESET: L 0
  const labelMatch = text.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
  if (labelMatch) {
    tokens.push({
      kind: "LABEL",
      value: labelMatch[1],
      line,
      raw
    });

    if (labelMatch[2].trim()) {
      tokens.push({
        kind: "INSTRUCTION_TEXT",
        value: labelMatch[2].trim(),
        line,
        raw
      });
    }
    return;
  }

  // CALL parameter line: Start := I 0.0
  const callParamMatch = text.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:=\s*(.+)$/);
  if (callParamMatch) {
    tokens.push({
      kind: "CALL_PARAM",
      param: callParamMatch[1],
      value: callParamMatch[2].trim(),
      line,
      raw
    });
    return;
  }

  tokens.push({
    kind: "INSTRUCTION_TEXT",
    value: text,
    line,
    raw
  });
}
