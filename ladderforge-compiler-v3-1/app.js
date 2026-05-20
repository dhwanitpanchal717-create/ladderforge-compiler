import { lex } from "./compiler/lexer.js";
import { parse } from "./compiler/parser.js";
import { analyze } from "./compiler/analyzer.js";
import { buildCFG } from "./compiler/cfg.js";
import { buildLadderIR } from "./compiler/ladder-ir.js";
import { renderLadderText, renderVisualLadder } from "./renderers/ladder-renderer.js";
import { generateSTLFromLadderText } from "./compiler/stl-generator.js";
import { supportRows } from "./compiler/instruction-db.js";
import { builtInExamples } from "./examples/examples.js";
import { runAllTests } from "./tests/test-runner.js";

const el = id => document.getElementById(id);

const sourceInput = el("sourceInput");
const outputBox = el("outputBox");
const diagnosticsBox = el("diagnosticsBox");
const diagnosticsCount = el("diagnosticsCount");
const parserSummary = el("parserSummary");
const supportMatrix = el("supportMatrix");
const confidenceScore = el("confidenceScore");
const statusBadge = el("statusBadge");
const sourceBadge = el("sourceBadge");
const modeSelect = el("modeSelect");
const fileInput = el("fileInput");
const debugSelect = el("debugSelect");
const debugBox = el("debugBox");
const visualCanvas = el("visualCanvas");
const exampleSelect = el("exampleSelect");
const testResults = el("testResults");
const testSummary = el("testSummary");

let lastCompile = {
  tokens: [],
  ast: [],
  cfg: {},
  ir: [],
  diagnostics: [],
  symbols: {},
  summary: {},
  output: ""
};

sourceInput.value = builtInExamples["V3.1 Nested Bracket + Compare"].source;

el("compileBtn").addEventListener("click", compile);
el("copyBtn").addEventListener("click", copyOutput);
el("downloadBtn").addEventListener("click", downloadOutput);
el("saveProjectBtn").addEventListener("click", saveProject);
el("exportIrBtn").addEventListener("click", exportIR);
el("exportReportBtn").addEventListener("click", exportReport);
el("runTestsBtn").addEventListener("click", runTests);
el("loadExampleBtn").addEventListener("click", loadExample);
el("clearVisualBtn").addEventListener("click", () => visualCanvas.innerHTML = "");
debugSelect.addEventListener("change", updateDebug);
modeSelect.addEventListener("change", () => {
  sourceBadge.textContent = modeSelect.value === "stl-to-ladder" ? "STL/AWL" : "Ladder Text";
});

document.querySelectorAll("[data-add]").forEach(button => {
  button.addEventListener("click", () => addVisualElement(button.dataset.add));
});

fileInput.addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();

  if (file.name.endsWith(".lfproj") || file.name.endsWith(".json")) {
    try {
      const project = JSON.parse(text);
      sourceInput.value = project.source || project.sourceCode || "";
      modeSelect.value = project.mode || "stl-to-ladder";
      compile();
      return;
    } catch {
      alert("Invalid JSON/project file.");
      return;
    }
  }

  sourceInput.value = text;
});

function compile() {
  const mode = modeSelect.value;
  const source = sourceInput.value;

  if (mode === "ladder-to-stl") {
    const result = generateSTLFromLadderText(source);
    outputBox.textContent = result.output;
    lastCompile = {
      tokens: [],
      ast: [],
      cfg: {},
      ir: result.ir,
      diagnostics: result.diagnostics,
      symbols: {},
      summary: { mode: "Ladder Text → STL", confidence: result.confidence },
      output: result.output
    };
    confidenceScore.textContent = `${result.confidence}%`;
    statusBadge.textContent = "Ladder → STL";
    renderDiagnostics(result.diagnostics);
    renderSummary(lastCompile.summary);
    renderVisualLadder(result.ir, visualCanvas);
    updateDebug();
    return;
  }

  try {
    const tokens = lex(source);
    const parsed = parse(tokens);
    const analysis = analyze(parsed.ast);
    const cfg = buildCFG(parsed.ast);
    const irResult = buildLadderIR(parsed.ast, analysis, cfg);
    const output = renderLadderText(irResult.ir);

    const diagnostics = [
      ...parsed.diagnostics,
      ...analysis.diagnostics,
      ...irResult.diagnostics
    ];

    lastCompile = {
      tokens,
      ast: parsed.ast,
      cfg,
      ir: irResult.ir,
      diagnostics,
      symbols: analysis.symbols,
      summary: {
        ...parsed.summary,
        confidence: irResult.confidence,
        mode: irResult.mode,
        stats: analysis.stats
      },
      output
    };

    outputBox.textContent = output;
    confidenceScore.textContent = `${irResult.confidence}%`;
    statusBadge.textContent = irResult.mode;
    renderDiagnostics(diagnostics);
    renderSummary(lastCompile.summary);
    renderVisualLadder(irResult.ir, visualCanvas);
    updateDebug();
  } catch (error) {
    outputBox.textContent = "Compiler Error";
    renderDiagnostics([{
      severity: "error",
      message: error.message,
      suggestion: "Check source formatting or report this parser edge case."
    }]);
    console.error(error);
  }
}

function renderDiagnostics(items) {
  diagnosticsCount.textContent = items.length;

  if (!items.length) {
    diagnosticsBox.innerHTML = `<div class="diag good"><strong>GOOD</strong><br>No issues found.</div>`;
    return;
  }

  diagnosticsBox.innerHTML = items.map(d => {
    const severity = d.severity || "warning";
    return `<div class="diag ${severity}">
      <strong>${severity.toUpperCase()}</strong>${d.line ? ` • Line ${d.line}` : ""}<br/>
      ${escapeHtml(d.message || "")}
      ${d.suggestion ? `<br/><small>Suggestion: ${escapeHtml(d.suggestion)}</small>` : ""}
    </div>`;
  }).join("");
}

function renderSummary(summary) {
  const rows = [
    ["Mode", summary.mode || "-"],
    ["Confidence", `${summary.confidence ?? 0}%`],
    ["Blocks", summary.blocks ?? 0],
    ["Networks", summary.networks ?? 0],
    ["Labels", summary.labels ?? 0],
    ["Bracket Max Depth", summary.maxBracketDepth ?? 0],
    ["Unclosed Brackets", summary.unclosedBrackets ?? 0],
    ["Unsupported", summary.stats?.unsupported ?? 0],
    ["Partial", summary.stats?.partial ?? 0],
    ["Full", summary.stats?.full ?? 0]
  ];

  parserSummary.innerHTML = rows.map(([k, v]) => `
    <div class="summary-row"><strong>${k}:</strong> ${escapeHtml(String(v))}</div>
  `).join("");
}

function updateDebug() {
  const key = debugSelect.value;
  debugBox.textContent = JSON.stringify(lastCompile[key], null, 2);
}

function copyOutput() {
  navigator.clipboard.writeText(outputBox.textContent || "");
}

function downloadOutput() {
  const ext = modeSelect.value === "ladder-to-stl" ? "awl" : "txt";
  downloadFile(`ladderforge-output.${ext}`, outputBox.textContent);
}

function saveProject() {
  const project = {
    name: "LadderForge Project",
    version: "3.1",
    mode: modeSelect.value,
    source: sourceInput.value,
    output: outputBox.textContent,
    tokens: lastCompile.tokens,
    ast: lastCompile.ast,
    cfg: lastCompile.cfg,
    ir: lastCompile.ir,
    diagnostics: lastCompile.diagnostics,
    symbols: lastCompile.symbols,
    summary: lastCompile.summary,
    createdAt: new Date().toISOString()
  };

  downloadFile("project.lfproj", JSON.stringify(project, null, 2));
}

function exportIR() {
  downloadFile("ladder-ir.json", JSON.stringify(lastCompile.ir, null, 2));
}

function exportReport() {
  const report = `LadderForge Compiler V3.1 Report
Generated: ${new Date().toLocaleString()}

SUMMARY:
${JSON.stringify(lastCompile.summary, null, 2)}

SOURCE:
${sourceInput.value}

OUTPUT:
${outputBox.textContent}

DIAGNOSTICS:
${JSON.stringify(lastCompile.diagnostics, null, 2)}

SYMBOLS:
${JSON.stringify(lastCompile.symbols, null, 2)}

IR:
${JSON.stringify(lastCompile.ir, null, 2)}
`;

  downloadFile("ladderforge-v3-1-report.txt", report);
}

function downloadFile(filename, content) {
  const blob = new Blob([content || ""], { type: "text/plain" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function renderSupportMatrix() {
  supportMatrix.innerHTML = supportRows().map(row => {
    const cls = row.support === "full" ? "good" : row.support === "partial" ? "warn" : "bad";
    return `<div class="matrix-card">
      <strong>${escapeHtml(row.opcode)}</strong>
      <span class="${cls}">${row.support}</span>
      <small>${escapeHtml(row.description)}</small>
    </div>`;
  }).join("");
}

function setupExamples() {
  exampleSelect.innerHTML = Object.keys(builtInExamples)
    .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("");
}

function loadExample() {
  const name = exampleSelect.value;
  const example = builtInExamples[name];
  sourceInput.value = example.source;
  modeSelect.value = example.mode || "stl-to-ladder";
  compile();
}

function runTests() {
  const result = runAllTests();
  testSummary.textContent = `${result.pass} pass • ${result.partial} partial • ${result.fail} fail`;
  testResults.innerHTML = result.results.map(r => {
    const cls = r.status === "pass" ? "good" : r.status === "partial" ? "warn" : "bad";
    return `<div class="test-row ${cls}">● ${escapeHtml(r.name)}: ${escapeHtml(r.status)} — ${escapeHtml(r.note)}</div>`;
  }).join("");
}

function addVisualElement(type) {
  let rung = visualCanvas.querySelector(".rung");
  if (!rung) {
    rung = document.createElement("div");
    rung.className = "rung";
    rung.innerHTML = `<div class="line"></div><div class="line"></div>`;
    visualCanvas.appendChild(rung);
  }

  const addr = prompt(`Address for ${type}`, type === "COIL" ? "Q 0.0" : "I 0.0");
  if (!addr) return;

  const elem = document.createElement("div");
  elem.className = "elem";
  elem.textContent = type === "NO" ? `[ ${addr} ]`
    : type === "NC" ? `[/ ${addr} ]`
    : type === "SET" ? `(S ${addr})`
    : type === "RESET" ? `(R ${addr})`
    : `( ${addr} )`;

  elem.title = "Click to delete";
  elem.addEventListener("click", () => elem.remove());
  rung.insertBefore(elem, rung.lastElementChild);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[ch]));
}

renderSupportMatrix();
setupExamples();
compile();
