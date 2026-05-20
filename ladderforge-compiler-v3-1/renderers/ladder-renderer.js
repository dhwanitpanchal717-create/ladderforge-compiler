export function renderLadderText(ir) {
  let out = "";

  for (const item of ir) {
    switch (item.kind) {
      case "network":
        out += `\nNETWORK: ${item.title || "Untitled"}\n${"-".repeat(72)}\n`;
        break;

      case "blockStart":
        out += `// BLOCK START: ${item.block?.type || ""} ${item.block?.name || ""}\n`;
        break;

      case "blockEnd":
        out += `// BLOCK END\n`;
        break;

      case "meta":
        out += `// META: ${item.opcode} ${item.operand || ""}\n`;
        break;

      case "label":
        out += `${item.name}:\n`;
        break;

      case "rung":
        out += renderContacts(item.contacts) + renderAction(item.action) + "\n";
        break;

      case "jump":
        out += renderContacts(item.condition) + `----( ${item.jumpType} ${item.target} )----|\n`;
        break;

      case "assignment":
        out += `|----------------------------( ${item.target} = ${item.expression} )----|\n`;
        break;

      case "operation":
        out += `// OP: ${item.op} ${item.value || ""}\n`;
        break;

      case "compare":
        out += `// COMPARE: ${item.expression}\n`;
        break;

      case "timer":
        out += renderContacts(item.condition) + `----[ TIMER ${item.timerType} ${item.timer}${item.preset ? ", PT=" + item.preset : ""} ]----|\n`;
        break;

      case "counter":
        out += renderContacts(item.condition) + `----[ COUNTER ${item.counterType} ${item.counter}${item.preset ? ", PV=" + item.preset : ""} ]----|\n`;
        break;

      case "db":
        out += `// OPEN DB: ${item.db}\n`;
        break;

      case "functionBlockCall":
        out += `|----------------------------[ ${item.callType} ${item.target} ]----|\n`;
        break;

      case "callParam":
        out += `//   ${item.param} := ${item.value}\n`;
        break;

      case "bracketOpen":
        out += `// Bracket open: ${item.opcode}\n`;
        break;

      case "bracketClose":
        out += `// Bracket close\n`;
        break;

      case "rlo":
        out += renderContacts(item.contacts) + `----( RLO )----|\n`;
        break;

      case "unsupported":
        out += `// UNSUPPORTED: ${item.raw}\n`;
        break;
    }
  }

  return out.trim();
}

function renderContacts(contacts = []) {
  if (!contacts.length) return "|";

  return contacts.map(c => {
    if (c.kind === "compareContact") return `|----[ ${c.expression} ]`;
    if (c.kind === "edgeContact") return `|----[ ${c.edge} ${c.memory} ]`;
    if (c.kind === "groupContact") return `|----[ ${c.op} GROUP ]`;

    const branch = c.branch === "OR" ? " OR " : c.branch === "XOR" ? " XOR " : "";
    return `${branch}|----[${c.inverted ? "/" : ""}${c.address}]`;
  }).join("");
}

function renderAction(action) {
  if (!action) return "----( ? )----|";
  if (action.type === "set") return `----(S ${action.target})----|`;
  if (action.type === "reset") return `----(R ${action.target})----|`;
  return `----( ${action.target} )----|`;
}

export function renderVisualLadder(ir, target) {
  target.innerHTML = "";

  for (const item of ir) {
    if (item.kind === "network") {
      const header = document.createElement("div");
      header.className = "elem";
      header.textContent = `NETWORK: ${item.title || "Untitled"}`;
      target.appendChild(header);
      continue;
    }

    if (["rung", "jump", "timer", "counter"].includes(item.kind)) {
      const rung = document.createElement("div");
      rung.className = "rung";

      const left = document.createElement("div");
      left.className = "line";
      rung.appendChild(left);

      const contacts = item.contacts || item.condition || [];
      contacts.forEach(contact => {
        const el = document.createElement("div");
        el.className = "elem";
        if (contact.kind === "compareContact") el.textContent = `[ ${contact.expression} ]`;
        else if (contact.kind === "edgeContact") el.textContent = `[ ${contact.edge} ${contact.memory} ]`;
        else if (contact.kind === "groupContact") el.textContent = `[ ${contact.op} GROUP ]`;
        else el.textContent = `[${contact.inverted ? "/" : ""} ${contact.address || "?"} ]`;
        rung.appendChild(el);
      });

      const action = document.createElement("div");
      action.className = "elem";
      if (item.kind === "rung") action.textContent = item.action.type === "set" ? `(S ${item.action.target})` : item.action.type === "reset" ? `(R ${item.action.target})` : `( ${item.action.target} )`;
      if (item.kind === "jump") action.textContent = `( ${item.jumpType} ${item.target} )`;
      if (item.kind === "timer") action.textContent = `[ ${item.timerType} ${item.timer} ]`;
      if (item.kind === "counter") action.textContent = `[ ${item.counterType} ${item.counter} ]`;
      rung.appendChild(action);

      const right = document.createElement("div");
      right.className = "line";
      rung.appendChild(right);

      target.appendChild(rung);
      continue;
    }

    if (["assignment", "label", "functionBlockCall", "unsupported", "db"].includes(item.kind)) {
      const el = document.createElement("div");
      el.className = "elem";
      el.textContent = item.kind === "assignment"
        ? `${item.target} = ${item.expression}`
        : item.kind === "label"
          ? `${item.name}:`
          : item.kind === "functionBlockCall"
            ? `${item.callType} ${item.target}`
            : item.kind === "db"
              ? `OPEN DB ${item.db}`
              : `Manual: ${item.raw}`;
      target.appendChild(el);
    }
  }
}
