export function buildCFG(ast) {
  const nodes = [];
  const labels = {};

  ast.forEach((node, index) => {
    if (node.type === "Label") labels[node.name] = index;

    nodes.push({
      id: index,
      line: node.line || null,
      kind: node.type,
      label: labelFor(node),
      edges: []
    });
  });

  ast.forEach((node, index) => {
    const cfgNode = nodes[index];
    if (!cfgNode) return;

    if (node.type === "Instruction") {
      if (node.opcode === "JU") {
        addJumpEdge(cfgNode, labels, node.operand, "jump");
        return;
      }

      if (node.opcode === "JC") {
        addJumpEdge(cfgNode, labels, node.operand, "true");
        addNextEdge(nodes, index, "false/fallthrough");
        return;
      }

      if (node.opcode === "JCN") {
        addJumpEdge(cfgNode, labels, node.operand, "false");
        addNextEdge(nodes, index, "true/fallthrough");
        return;
      }
    }

    addNextEdge(nodes, index, "next");
  });

  return { nodes, labels };
}

function addJumpEdge(node, labels, target, type) {
  const to = labels[target];
  node.edges.push({
    to: to ?? null,
    target,
    type,
    resolved: to !== undefined
  });
}

function addNextEdge(nodes, index, type) {
  if (nodes[index + 1]) {
    nodes[index].edges.push({
      to: index + 1,
      type,
      resolved: true
    });
  }
}

function labelFor(node) {
  if (node.type === "Instruction") return `${node.opcode}${node.operand ? " " + node.operand : ""}`;
  if (node.type === "Label") return `${node.name}:`;
  if (node.type === "NetworkTitle") return `TITLE = ${node.title}`;
  if (node.type === "NetworkStart") return "NETWORK";
  if (node.type === "CallParam") return `${node.param} := ${node.value}`;
  return node.type;
}
