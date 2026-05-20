export function generateSTLFromLadderText(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const stl = [];
  const ir = [];
  const diagnostics = [];

  for (const line of lines) {
    const network = line.match(/^NETWORK\s*:?\s*(.*)$/i);
    if (network) {
      stl.push("NETWORK");
      stl.push(`TITLE = ${network[1] || "Converted Network"}`);
      ir.push({ kind: "network", title: network[1] || "Converted Network" });
      continue;
    }

    const contacts = [...line.matchAll(/\[(\/)?\s*([^\]]+)\]/g)].map(match => ({
      inverted: Boolean(match[1]),
      address: match[2].trim()
    }));

    const coil = line.match(/\((S|R)?\s*([^)]+?)\s*\)/);

    if (!contacts.length && !coil) {
      diagnostics.push({
        severity: "warning",
        message: `Could not parse ladder line: ${line}`,
        suggestion: "Use format: |----[ I 0.0 ]----[/ I 0.1 ]----( Q 0.0 )----|"
      });
      continue;
    }

    contacts.forEach(c => {
      stl.push(`${c.inverted ? "AN" : "A"} ${c.address}`);
    });

    if (coil) {
      const coilType = coil[1];
      const target = coil[2].trim();
      stl.push(coilType === "S" ? `S ${target}` : coilType === "R" ? `R ${target}` : `= ${target}`);
      ir.push({
        kind: "rung",
        contacts: contacts.map(c => ({ kind: "contact", ...c })),
        action: {
          type: coilType === "S" ? "set" : coilType === "R" ? "reset" : "coil",
          target
        }
      });
    }
  }

  return {
    output: stl.join("\n"),
    ir,
    diagnostics,
    confidence: diagnostics.length ? 74 : 92
  };
}
