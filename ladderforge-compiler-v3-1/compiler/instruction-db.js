export const instructionSet = {
  // Logic
  "A": { type: "logic", support: "full", description: "AND normally open contact" },
  "AN": { type: "logic", support: "full", description: "AND normally closed contact" },
  "O": { type: "logic", support: "partial", description: "OR branch/contact foundation" },
  "ON": { type: "logic", support: "partial", description: "OR NOT branch/contact foundation" },
  "X": { type: "logic", support: "partial", description: "XOR logic foundation" },
  "XN": { type: "logic", support: "partial", description: "XOR NOT logic foundation" },

  // Brackets
  "A(": { type: "bracket", support: "partial", description: "Open AND bracket expression" },
  "O(": { type: "bracket", support: "partial", description: "Open OR bracket expression" },
  "X(": { type: "bracket", support: "partial", description: "Open XOR bracket expression" },
  ")": { type: "bracket", support: "partial", description: "Close bracket expression" },

  // Outputs
  "=": { type: "coil", support: "full", description: "Output coil" },
  "S": { type: "coil", support: "full", description: "Set coil / latch" },
  "R": { type: "coil", support: "full", description: "Reset coil / unlatch" },
  "FP": { type: "edge", support: "partial", description: "Positive edge detection foundation" },
  "FN": { type: "edge", support: "partial", description: "Negative edge detection foundation" },

  // Accumulator / transfer
  "L": { type: "accumulator", support: "partial", description: "Load value into accumulator" },
  "T": { type: "accumulator", support: "partial", description: "Transfer accumulator to destination" },
  "TAK": { type: "accumulator", support: "partial", description: "Swap accumulators foundation" },

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

  // Compare
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

  // Control flow
  "JC": { type: "control_flow", support: "partial", description: "Jump if RLO true" },
  "JCN": { type: "control_flow", support: "partial", description: "Jump if RLO false" },
  "JU": { type: "control_flow", support: "partial", description: "Unconditional jump" },
  "JL": { type: "control_flow", support: "partial", description: "Jump list foundation" },
  "LOOP": { type: "control_flow", support: "partial", description: "Loop foundation" },

  // Timers / counters
  "SD": { type: "timer", support: "partial", description: "On-delay timer foundation" },
  "SE": { type: "timer", support: "partial", description: "Extended pulse timer foundation" },
  "SF": { type: "timer", support: "partial", description: "Off-delay timer foundation" },
  "SP": { type: "timer", support: "partial", description: "Pulse timer foundation" },
  "SS": { type: "timer", support: "partial", description: "Retentive on-delay timer foundation" },
  "CU": { type: "counter", support: "partial", description: "Counter up foundation" },
  "CD": { type: "counter", support: "partial", description: "Counter down foundation" },

  // DB / block
  "OPN": { type: "db", support: "partial", description: "Open data block foundation" },
  "CALL": { type: "block_call", support: "none", description: "FB/FC call diagnostic / block-box only" },
  "UC": { type: "block_call", support: "none", description: "Unconditional block call diagnostic" },
  "CC": { type: "block_call", support: "none", description: "Conditional block call diagnostic" },

  // Metadata
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
