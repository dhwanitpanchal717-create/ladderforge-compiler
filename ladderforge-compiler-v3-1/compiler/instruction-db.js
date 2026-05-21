export const instructionSet = {
  // =========================
  // BIT LOGIC
  // =========================
  "A": i("logic", "full", "AND normally open contact"),
  "AN": i("logic", "full", "AND normally closed contact"),
  "O": i("logic", "partial", "OR contact / OR branch foundation"),
  "ON": i("logic", "partial", "OR NOT contact / OR branch foundation"),
  "X": i("logic", "partial", "XOR contact foundation"),
  "XN": i("logic", "partial", "XOR NOT contact foundation"),
  "LD": i("logic", "full", "Load normally open contact alias"),
  "LDN": i("logic", "full", "Load normally closed contact alias"),

  "A(": i("bracket", "partial", "AND nesting open"),
  "AN(": i("bracket", "partial", "AND NOT nesting open"),
  "O(": i("bracket", "partial", "OR nesting open"),
  "ON(": i("bracket", "partial", "OR NOT nesting open"),
  "X(": i("bracket", "partial", "XOR nesting open"),
  "XN(": i("bracket", "partial", "XOR NOT nesting open"),
  ")": i("bracket", "partial", "Nesting closed"),

  "=": i("coil", "full", "Assign / output coil"),
  "S": i("coil", "full", "Set bit / latch"),
  "R": i("coil", "full", "Reset bit / unlatch"),

  "NOT": i("rlo", "partial", "Negate RLO"),
  "SET": i("rlo", "partial", "Set RLO to 1"),
  "CLR": i("rlo", "partial", "Clear RLO to 0"),
  "SAVE": i("rlo", "partial", "Save RLO into BR register"),
  "FN": i("edge", "partial", "Negative edge detection"),
  "FP": i("edge", "partial", "Positive edge detection"),
  "ONS": i("edge", "partial", "One-shot alias"),

  // =========================
  // COMPARISON
  // =========================
  "==I": i("compare", "partial", "Integer equal"),
  "<>I": i("compare", "partial", "Integer not equal"),
  ">I": i("compare", "partial", "Integer greater than"),
  "<I": i("compare", "partial", "Integer less than"),
  ">=I": i("compare", "partial", "Integer greater or equal"),
  "<=I": i("compare", "partial", "Integer less or equal"),

  "==D": i("compare", "partial", "Double integer equal"),
  "<>D": i("compare", "partial", "Double integer not equal"),
  ">D": i("compare", "partial", "Double integer greater than"),
  "<D": i("compare", "partial", "Double integer less than"),
  ">=D": i("compare", "partial", "Double integer greater or equal"),
  "<=D": i("compare", "partial", "Double integer less or equal"),

  "==R": i("compare", "partial", "Real equal"),
  "<>R": i("compare", "partial", "Real not equal"),
  ">R": i("compare", "partial", "Real greater than"),
  "<R": i("compare", "partial", "Real less than"),
  ">=R": i("compare", "partial", "Real greater or equal"),
  "<=R": i("compare", "partial", "Real less or equal"),

  "EQ": i("compare", "partial", "Equal compare alias"),
  "NE": i("compare", "partial", "Not equal compare alias"),
  "GT": i("compare", "partial", "Greater than compare alias"),
  "GE": i("compare", "partial", "Greater or equal compare alias"),
  "LT": i("compare", "partial", "Less than compare alias"),
  "LE": i("compare", "partial", "Less or equal compare alias"),

  // =========================
  // CONVERSION
  // =========================
  "BTI": i("conversion", "partial", "BCD to integer"),
  "ITB": i("conversion", "partial", "Integer to BCD"),
  "BTD": i("conversion", "partial", "BCD to double integer"),
  "ITD": i("conversion", "partial", "Integer to double integer"),
  "DTB": i("conversion", "partial", "Double integer to BCD"),
  "DTR": i("conversion", "partial", "Double integer to real"),
  "INVI": i("conversion", "partial", "One's complement integer"),
  "INVD": i("conversion", "partial", "One's complement double integer"),
  "NEGI": i("conversion", "partial", "Two's complement integer"),
  "NEGD": i("conversion", "partial", "Two's complement double integer"),
  "NEGR": i("conversion", "partial", "Negate real"),
  "CAW": i("conversion", "partial", "Change byte sequence word"),
  "CAD": i("conversion", "partial", "Change byte sequence double word"),
  "RND": i("conversion", "partial", "Round real to double integer"),
  "TRUNC": i("conversion", "partial", "Truncate real to double integer"),
  "RND+": i("conversion", "partial", "Round up"),
  "RND-": i("conversion", "partial", "Round down"),

  // =========================
  // COUNTERS
  // =========================
  "FR": i("timerCounter", "partial", "Enable timer/counter"),
  "LC": i("timerCounter", "partial", "Load timer/counter value as BCD"),
  "CU": i("counter", "partial", "Counter up"),
  "CD": i("counter", "partial", "Counter down"),
  "CTU": i("counter", "partial", "Count-up alias"),
  "CTD": i("counter", "partial", "Count-down alias"),
  "CTUD": i("counter", "partial", "Up/down counter alias"),

  // =========================
  // DATA BLOCK
  // =========================
  "OPN": i("db", "partial", "Open data block"),
  "CDB": i("db", "partial", "Exchange shared DB and instance DB"),

  // =========================
  // LOGIC CONTROL / JUMPS
  // =========================
  "JU": i("control_flow", "partial", "Jump unconditional"),
  "JL": i("control_flow", "partial", "Jump to labels"),
  "JC": i("control_flow", "partial", "Jump if RLO is 1"),
  "JCN": i("control_flow", "partial", "Jump if RLO is 0"),
  "JCB": i("control_flow", "partial", "Jump if RLO is 1 with BR"),
  "JNB": i("control_flow", "partial", "Jump if RLO is 0 with BR"),
  "JBI": i("control_flow", "partial", "Jump if BR is 1"),
  "JNBI": i("control_flow", "partial", "Jump if BR is 0"),
  "JO": i("control_flow", "partial", "Jump if overflow"),
  "JOS": i("control_flow", "partial", "Jump if stored overflow"),
  "JZ": i("control_flow", "partial", "Jump if zero"),
  "JN": i("control_flow", "partial", "Jump if not zero"),
  "JP": i("control_flow", "partial", "Jump if plus"),
  "JM": i("control_flow", "partial", "Jump if minus"),
  "JPZ": i("control_flow", "partial", "Jump if plus or zero"),
  "JMZ": i("control_flow", "partial", "Jump if minus or zero"),
  "JUO": i("control_flow", "partial", "Jump if unordered"),
  "LOOP": i("control_flow", "partial", "Loop"),

  // common aliases
  "JMP": i("control_flow", "partial", "Jump alias"),
  "JMPC": i("control_flow", "partial", "Conditional jump alias"),

  // =========================
  // INTEGER MATH
  // =========================
  "+": i("math", "partial", "Add integer constant"),
  "+I": i("math", "partial", "Integer add"),
  "-I": i("math", "partial", "Integer subtract"),
  "*I": i("math", "partial", "Integer multiply"),
  "/I": i("math", "partial", "Integer divide"),
  "+D": i("math", "partial", "Double integer add"),
  "-D": i("math", "partial", "Double integer subtract"),
  "*D": i("math", "partial", "Double integer multiply"),
  "/D": i("math", "partial", "Double integer divide"),
  "MOD": i("math", "partial", "Modulo"),

  // aliases
  "ADD": i("math", "partial", "Add alias"),
  "SUB": i("math", "partial", "Subtract alias"),
  "MUL": i("math", "partial", "Multiply alias"),
  "DIV": i("math", "partial", "Divide alias"),

  // =========================
  // FLOATING POINT MATH
  // =========================
  "+R": i("math", "partial", "Real add"),
  "-R": i("math", "partial", "Real subtract"),
  "*R": i("math", "partial", "Real multiply"),
  "/R": i("math", "partial", "Real divide"),
  "ABS": i("math", "partial", "Absolute value"),
  "SQR": i("math", "partial", "Square"),
  "SQRT": i("math", "partial", "Square root"),
  "EXP": i("math", "partial", "Exponential"),
  "LN": i("math", "partial", "Natural logarithm"),
  "SIN": i("math", "partial", "Sine"),
  "COS": i("math", "partial", "Cosine"),
  "TAN": i("math", "partial", "Tangent"),
  "ASIN": i("math", "partial", "Arc sine"),
  "ACOS": i("math", "partial", "Arc cosine"),
  "ATAN": i("math", "partial", "Arc tangent"),

  // =========================
  // LOAD / TRANSFER
  // =========================
  "L": i("load", "partial", "Load into accumulator"),
  "T": i("transfer", "partial", "Transfer accumulator"),
  "MOV": i("transfer", "partial", "Move alias"),
  "MOVE": i("transfer", "partial", "Move alias"),
  "LAR1": i("addressRegister", "partial", "Load address register 1"),
  "LAR2": i("addressRegister", "partial", "Load address register 2"),
  "TAR1": i("addressRegister", "partial", "Transfer address register 1"),
  "TAR2": i("addressRegister", "partial", "Transfer address register 2"),
  "CAR": i("addressRegister", "partial", "Exchange AR1 and AR2"),

  // =========================
  // PROGRAM CONTROL
  // =========================
  "BE": i("program_control", "partial", "Block end"),
  "BEC": i("program_control", "partial", "Block end conditional"),
  "BEU": i("program_control", "partial", "Block end unconditional"),
  "CALL": i("block_call", "none", "Block call diagnostic / block-box only"),
  "CC": i("block_call", "none", "Conditional block call"),
  "UC": i("block_call", "none", "Unconditional block call"),

  "MCR": i("mcr", "partial", "Master control relay"),
  "MCR(": i("mcr", "partial", "Begin MCR area"),
  ")MCR": i("mcr", "partial", "End MCR area"),
  "MCRA": i("mcr", "partial", "Activate MCR area"),
  "MCRD": i("mcr", "partial", "Deactivate MCR area"),

  // =========================
  // SHIFT / ROTATE
  // =========================
  "SSI": i("shift", "partial", "Shift sign integer"),
  "SSD": i("shift", "partial", "Shift sign double integer"),
  "SLW": i("shift", "partial", "Shift left word"),
  "SRW": i("shift", "partial", "Shift right word"),
  "SLD": i("shift", "partial", "Shift left double word"),
  "SRD": i("shift", "partial", "Shift right double word"),
  "RLD": i("rotate", "partial", "Rotate left double word"),
  "RRD": i("rotate", "partial", "Rotate right double word"),
  "RLDA": i("rotate", "partial", "Rotate left via CC1"),
  "RRDA": i("rotate", "partial", "Rotate right via CC1"),

  // =========================
  // TIMERS
  // =========================
  "SP": i("timer", "partial", "Pulse timer"),
  "SE": i("timer", "partial", "Extended pulse timer"),
  "SD": i("timer", "partial", "On-delay timer"),
  "SS": i("timer", "partial", "Retentive on-delay timer"),
  "SF": i("timer", "partial", "Off-delay timer"),

  // common aliases
  "TON": i("timer", "partial", "On-delay timer alias"),
  "TOF": i("timer", "partial", "Off-delay timer alias"),
  "TP": i("timer", "partial", "Pulse timer alias"),
  "RTO": i("timer", "partial", "Retentive timer alias"),

  // =========================
  // WORD LOGIC
  // =========================
  "AW": i("wordLogic", "partial", "AND word"),
  "OW": i("wordLogic", "partial", "OR word"),
  "XOW": i("wordLogic", "partial", "XOR word"),
  "AD": i("wordLogic", "partial", "AND double word"),
  "OD": i("wordLogic", "partial", "OR double word"),
  "XOD": i("wordLogic", "partial", "XOR double word"),

  // =========================
  // ACCUMULATOR
  // =========================
  "TAK": i("accumulator", "partial", "Toggle ACCU 1 and ACCU 2"),
  "POP": i("accumulator", "partial", "Pop accumulator stack"),
  "PUSH": i("accumulator", "partial", "Push accumulator stack"),
  "ENT": i("accumulator", "partial", "Enter accumulator stack"),
  "LEAVE": i("accumulator", "partial", "Leave accumulator stack"),
  "INC": i("accumulator", "partial", "Increment ACCU 1-L-L"),
  "DEC": i("accumulator", "partial", "Decrement ACCU 1-L-L"),
  "+AR1": i("addressRegister", "partial", "Add ACCU 1 to AR1"),
  "+AR2": i("addressRegister", "partial", "Add ACCU 1 to AR2"),
  "BLD": i("meta", "full", "Program display instruction"),
  "NOP": i("meta", "full", "No operation"),

  // =========================
  // BLOCK / META
  // =========================
  "NETWORK": i("meta", "full", "Network separator"),
  "TITLE": i("meta", "full", "Network title"),
  "ORGANIZATION_BLOCK": i("block", "partial", "OB header"),
  "FUNCTION_BLOCK": i("block", "partial", "FB header"),
  "FUNCTION": i("block", "partial", "FC header"),
  "DATA_BLOCK": i("block", "partial", "DB header"),
  "BEGIN": i("meta", "partial", "Block begin"),
  "END_ORGANIZATION_BLOCK": i("block", "partial", "OB footer"),
  "END_FUNCTION_BLOCK": i("block", "partial", "FB footer"),
  "END_FUNCTION": i("block", "partial", "FC footer"),
  "END_DATA_BLOCK": i("block", "partial", "DB footer"),
  "VERSION": i("meta", "partial", "Version metadata"),
  "AUTHOR": i("meta", "partial", "Author metadata"),
  "FAMILY": i("meta", "partial", "Family metadata"),
  "NAME": i("meta", "partial", "Name metadata")
};

function i(type, support, description) {
  return { type, support, description };
}

export function getInstructionInfo(opcode) {
  return instructionSet[opcode] || {
    type: "unknown",
    support: "none",
    description: "Unknown or unsupported instruction"
  };
}

export function supportRows() {
  return Object.entries(instructionSet)
    .map(([opcode, data]) => ({ opcode, ...data }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.opcode.localeCompare(b.opcode));
} 
