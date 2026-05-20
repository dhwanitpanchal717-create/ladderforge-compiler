import { builtInExamples } from "../examples/examples.js";
import { lex } from "../compiler/lexer.js";
import { parse } from "../compiler/parser.js";
import { analyze } from "../compiler/analyzer.js";
import { buildCFG } from "../compiler/cfg.js";
import { buildLadderIR } from "../compiler/ladder-ir.js";
import { generateSTLFromLadderText } from "../compiler/stl-generator.js";

export function runAllTests() {
  const results = [];

  for (const [name, example] of Object.entries(builtInExamples)) {
    try {
      if (example.mode === "ladder-to-stl") {
        const result = generateSTLFromLadderText(example.source);
        results.push({
          name,
          status: result.confidence >= 85 ? "pass" : "partial",
          note: `Ladder→STL confidence ${result.confidence}%`
        });
        continue;
      }

      const tokens = lex(example.source);
      const parsed = parse(tokens);
      const analysis = analyze(parsed.ast);
      const cfg = buildCFG(parsed.ast);
      const ir = buildLadderIR(parsed.ast, analysis, cfg);

      const errors = [...parsed.diagnostics, ...analysis.diagnostics, ...ir.diagnostics]
        .filter(d => d.severity === "error").length;

      if (ir.confidence >= 85 && errors === 0) {
        results.push({ name, status: "pass", note: `Confidence ${ir.confidence}%` });
      } else if (ir.confidence >= 45) {
        results.push({ name, status: "partial", note: `Confidence ${ir.confidence}%, errors ${errors}` });
      } else {
        results.push({ name, status: "fail", note: `Confidence ${ir.confidence}%, errors ${errors}` });
      }
    } catch (err) {
      results.push({ name, status: "fail", note: err.message });
    }
  }

  return {
    pass: results.filter(r => r.status === "pass").length,
    partial: results.filter(r => r.status === "partial").length,
    fail: results.filter(r => r.status === "fail").length,
    results
  };
}
