# LadderForge Compiler V3.1 — Parser Accuracy Upgrade

This version focuses on making LadderForge more tolerant of real-world AWL/STL files.

## Added in V3.1

- Improved parser state machine
- Better `NETWORK` / `TITLE` detection
- Block header/footer parsing:
  - `ORGANIZATION_BLOCK`
  - `FUNCTION_BLOCK`
  - `FUNCTION`
  - `DATA_BLOCK`
  - matching `END_*`
- Better label handling:
  - `LABEL: L 0`
  - `LABEL: NOP 0`
- Nested bracket tracking:
  - `A(`
  - `O(`
  - `X(`
  - `)`
- Better symbol extraction
- More complete instruction database
- Cleaner parser summary panel
- Improved diagnostics
- More realistic stress examples
- Test runner updated for parser cases

## Run

```bash
cd ladderforge-compiler-v3-1
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## What to test first

Use built-in examples:

1. V3.1 Nested Bracket + Compare
2. Messy Real-World Formatting
3. Timer Counter Foundation
4. DB and CALL Stress

Also upload:

```text
examples/v3-1-realistic-stress.awl
```

## Honest status

This is still not production-certified. It is a stronger serious prototype.

V3.1 improves parser accuracy. Next upgrade should be:

## V3.2 — Timer / Counter Engine

- Better S5 timer handling
- Counter presets
- Reset behavior
- Timer/counter visual ladder blocks
