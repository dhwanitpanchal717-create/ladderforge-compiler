export const builtInExamples = {
  "V3.1 Nested Bracket + Compare": {
    mode: "stl-to-ladder",
    source: `ORGANIZATION_BLOCK OB1
TITLE = Main Program
VERSION : 0.1

NETWORK
TITLE = Nested Bracket Logic
A(
A I 0.0
O I 0.1
)
AN I 0.2
= Q 0.0

NETWORK
TITLE = Compare Word Value
L MW20
L 100
>I
= Q 2.0

END_ORGANIZATION_BLOCK`
  },

  "Messy Real-World Formatting": {
    mode: "stl-to-ladder",
    source: `ORGANIZATION_BLOCK OB1
TITLE = Messy Code

NETWORK
TITLE =    Motor Logic With Spaces
      A      I 0.0       // start
      O      Q 0.0
      AN     I 0.1
      =      Q 0.0

NETWORK
TITLE = Label Inline
A I 1.0
JC RESET
L MB10
INC 1
T MB10
JU END_LABEL
RESET: L 0
T MB10
END_LABEL: NOP 0

END_ORGANIZATION_BLOCK`
  },

  "Timer Counter Foundation": {
    mode: "stl-to-ladder",
    source: `NETWORK
TITLE = Timer Counter
A I 3.0
L S5T#5S
SD T1
A T1
= Q 3.0

A I 4.0
CU C1
L C#10
S C1
A C1
= Q 4.0`
  },

  "DB and CALL Stress": {
    mode: "stl-to-ladder",
    source: `FUNCTION_BLOCK FB 10
TITLE = Motor Block Call Stress

NETWORK
TITLE = DB Access
OPN DB 10
L DBW 0
L 250
>=I
= Q 6.0

NETWORK
TITLE = Function Block Call
CALL FB 20, DB 20
 Start := I 7.0
 Speed := MW40
 Done := Q 7.0

END_FUNCTION_BLOCK`
  },

  "Ladder Text Example": {
    mode: "ladder-to-stl",
    source: `NETWORK Motor Start
|----[ I 0.0 ]----[/ I 0.1 ]----( Q 0.0 )----|
NETWORK Fault Latch
|----[ I 0.2 ]----(S M 0.0)----|
|----[ I 0.3 ]----(R M 0.0)----|`
  }
};
