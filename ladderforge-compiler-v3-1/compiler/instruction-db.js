export const instructionSet = {
  // Logic - Siemens style
  "A": { type: "logic", support: "full", description: "AND normally open contact" },
  "AN": { type: "logic", support: "full", description: "AND normally closed contact" },
  "O": { type: "logic", support: "partial", description: "OR branch/contact foundation" },
  "ON": { type: "logic", support: "partial", description: "OR NOT branch/contact foundation" },
  "X": { type: "logic", support: "partial", description: "XOR logic foundation" },
  "XN": { type: "logic", support: "partial", description: "XOR NOT logic foundation" },

  // Logic - industry/vendor style aliases
  "LD": { type: "logic", support: "full", description: "Load normally open contact / start rung" },
  "LDN": { type: "logic", support: "full", description: "Load normally closed contact / start rung" },
  "AND": { type: "logic", support: "full", description: "AND contact alias" },
  "ANDN": { type: "logic", support: "full", description: "AND NOT contact alias" },
  "ANI": { type: "logic", support: "full", description: "AND NOT contact alias" },
  "OR": { type: "logic", support: "partial", description: "OR contact alias" },
  "ORN": { type: "logic", support: "partial", description: "OR NOT contact alias" },
  "ORI": { type: "logic", support: "partial", description: "OR contact alias" },
  "ORNI": { type: "logic", support: "partial", description: "OR NOT contact alias" },

  // Brackets
  "A(": { type: "bracket", support: "partial", description: "Open AND bracket expression" },
  "O(": { type: "bracket", support: "partial", description: "Open OR bracket expression" },
  "X(": { type: "bracket", support: "partial", description: "Open XOR bracket expression" },
  ")": { type: "bracket", support: "partial", description: "Close bracket expression" },

  // Coils / outputs
  "=": { type: "coil", support: "full", description: "Output coil" },
  "S": { type: "coil", support: "full", description: "Set coil / latch" },
  "R": { type: "coil", support: "full", description: "Reset coil / unlatch" },

  // Coil aliases
  "OUT": { type: "coil", support: "full", description: "Output coil alias" },
  "OTE": { type: "coil", support: "full", description: "Output energize coil alias" },
  "SET": { type: "coil", support: "full", description: "Set coil alias" },
  "RST": { type: "coil", support: "full", description: "Reset coil alias" },
  "RES": { type: "coil", support: "full", description: "Reset coil alias" },

  // Edge detection
  "FP": { type: "edge", support: "partial", description: "Positive edge detection foundation" },
  "FN": { type: "edge", support: "partial", description: "Negative edge detection foundation" },
  "ONS": { type: "edge", support: "partial", description: "One-shot rising edge foundation" },

  // Accumulator / transfer
  "L": { type: "accumulator", support: "partial", description: "Load value into accumulator" },
  "T": { type: "accumulator", support: "partial", description: "Transfer accumulator to destination" },
  "TAK": { type: "accumulator", support: "partial", description: "Swap accumulators foundation" },

  // Move aliases
  "MOV": { type: "accumulator", support: "partial", description: "Move value foundation" },
  "MOVE": { type: "accumulator", support: "partial", description: "Move value foundation" },

  // Integer math
  "INC": { type: "math", support: "partial", description: "Increment accumulator" },
  "DEC": { type: "math", support: "partial", description: "Decrement accumulator" },
  "+I": { type: "math", support: "partial", description: "Integer add" },
  "-I": { type: "math", support: "partial", description: "Integer subtract" },
  "*I": { type: "math", support: "partial", description: "Integer multiply" },
  "/I": { type: "math", support: "partial", description: "Integer divide" },

  // Real math
  "+R": { type: "math", support: "partial", description: "Real add" },
  "-R": { type: "math", support: "partial", description: "Real subtract" },
  "*R": { type: "math", support: "partial", description: "Real multiply" },
  "/R": { type: "math", support: "partial", description: "Real divide" },

  // Math aliases
  "ADD": { type: "math", support: "partial", description: "Add instruction foundation" },
  "SUB": { type: "math", support: "partial", description: "Subtract instruction foundation" },
  "MUL": { type: "math", support: "partial", description: "Multiply instruction foundation" },
  "DIV": { type: "math", support: "partial", description: "Divide instruction foundation" },

  // Siemens compare
  ">I": { type: "compare", support: "partial", description: "Integer greater than" },
  "<I": { type: "compare", support: "partial", description: "Integer less than" },
  ">=I": { type: "compare", support: "partial", description: "Integer greater/equal" },
  "<=I": { type: "compare", support: "partial", description: "Integer less/equal" },
  "==I": { type: "compare", support: "partial", description: "Integer equal" },
  "<>I": { type: "compare", support: "partial", description: "Integer not equal" },

  ">R": { type: "compare", support: "partial", description: "Real greater than" },
  "<R": { type: "compare", support: "partial", description: "Real less than" },
  ">=R": { type: "compare", support: "partial", description: "Real greater/equal" },
  "<=R": { type: "compare", support: "partial", description: "Real less/equal" },
  "==R": { type: "compare", support: "partial", description: "Real equal" },
  "<>R": { type: "compare", support: "partial", description: "Real not equal" },

  // Compare aliases
  "EQ": { type: "compare", support: "partial", description: "Equal compare foundation" },
  "NE": { type: "compare", support: "partial", description: "Not equal compare foundation" },
  "GT": { type: "compare", support: "partial", description: "Greater than compare foundation" },
  "GE": { type: "compare", support: "partial", description: "Greater/equal compare foundation" },
  "LT": { type: "compare", support: "partial", description: "Less than compare foundation" },
  "LE": { type: "compare", support: "partial", description: "Less/equal compare foundation" },

  // Control flow
  "JC": { type: "control_flow", support: "partial", description: "Jump if RLO true" },
  "JCN": { type: "control_flow", support: "partial", description: "Jump if RLO false" },
  "JU": { type: "control_flow", support: "partial", description: "Unconditional jump" },
  "JMP": { type: "control_flow", support: "partial", description: "Jump alias" },
  "JMPC": { type: "control_flow", support: "partial", description: "Conditional jump alias" },
  "JL": { type: "control_flow", support: "partial", description: "Jump list foundation" },
  "LOOP": { type: "control_flow", support: "partial", description: "Loop foundation" },

  // Siemens timers
  "SD": { type: "timer", support: "partial", description: "On-delay timer foundation" },
  "SE": { type: "timer", support: "partial", description: "Extended pulse timer foundation" },
  "SF": { type: "timer", support: "partial", description: "Off-delay timer foundation" },
  "SP": { type: "timer", support: "partial", description: "Pulse timer foundation" },
  "SS": { type: "timer", support: "partial", description: "Retentive on-delay timer foundation" },

  // Timer aliases
  "TON": { type: "timer", support: "partial", description: "On-delay timer foundation" },
  "TOF": { type: "timer", support: "partial", description: "Off-delay timer foundation" },
  "TP": { type: "timer", support: "partial", description: "Pulse timer foundation" },
  "RTO": { type: "timer", support: "partial", description: "Retentive timer foundation" },

  // Siemens counters
  "CU": { type: "counter", support: "partial", description: "Counter up foundation" },
  "CD": { type: "counter", support: "partial", description: "Counter down foundation" },

  // Counter aliases
  "CTU": { type: "counter", support: "partial", description: "Count-up counter foundation" },
  "CTD": { type: "counter", support: "partial", description: "Count-down counter foundation" },
  "CTUD": { type: "counter", support: "partial", description: "Up/down counter foundation" },

  // DB / block
  "OPN": { type: "db", support: "partial", description: "Open data block foundation" },
  "CALL": { type: "block_call", support: "none", description: "FB/FC call diagnostic / block-box only" },
  "UC": { type: "block_call", support: "none", description: "Unconditional block call diagnostic" },
  "CC": { type: "block_call", support: "none", description: "Conditional block call diagnostic" },

  // Metadata / Siemens blocks
  "NETWORK": { type: "meta", support: "full", description: "Network separator" },
  "TITLE": { type: "meta", support: "full", description: "Network title" },
  "ORGANIZATION_BLOCK": { type: "block", support: "partial", description: "OB header" },
  "FUNCTION_BLOCK": { type: "block", support: "partial", description: "FB header" },
  "FUNCTION": { type: "block", support: "partial", description: "FC header" },
  "DATA_BLOCK": { type: "block", support: "partial", description: "DB header" },
  "BEGIN": { type: "meta", support: "partial", description: "Block begin" },
  "END_ORGANIZATION_BLOCK": { type: "block", support: "partial", description: "OB footer" },
  "END_FUNCTION_BLOCK": { type: "block", support: "partial", description: "FB footer" },
  "END_FUNCTION": { type: "block", support: "partial", description: "FC footer" },
  "END_DATA_BLOCK": { type: "block", support: "partial", description: "DB footer" },
  "NOP": { type: "meta", support: "full", description: "No operation" },
  "VERSION": { type: "meta", support: "partial", description: "Version metadata" },
  "AUTHOR": { type: "meta", support: "partial", description: "Author metadata" },
  "FAMILY": { type: "meta", support: "partial", description: "Family metadata" },
  "NAME": { type: "meta", support: "partial", description: "Name metadata" }
};

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
