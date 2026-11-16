// Every question is tied to a lesson (by id) and tests only what that lesson teaches.
//
// Fields:
//   lesson      id of the lesson the question comes from (see lessons.js)
//   id          unique id for the question
//   prompt      the question text
//   options     the answer choices
//   answer      index of the correct option in `options` (0 = first)
//   explanation shown after the learner checks their answer

export const QUESTIONS = [
  // ---------------------------------------------------------------
  // Lesson 1: Read a machine
  // ---------------------------------------------------------------
  {
    lesson: "read",
    id: "r1",
    prompt: "To pick which rule to run next, what does the machine look at?",
    options: [
      "The input length and the step count",
      "Its current state and the symbol under the head",
      "Only the symbol under the head",
      "The rule at the top of the table",
    ],
    answer: 1,
    explanation:
      "A rule applies when both its state and its read symbol match the machine’s " +
      "current state and the cell under the head. The highlighted row in the table " +
      "shows which one matched.",
  },
  {
    lesson: "read",
    id: "r2",
    prompt: "What does the rule  q1 0 -> 1 L q2  mean?",
    options: [
      "In state q2 reading 1: write 0, move left, go to q1",
      "In state q1 reading 0: write 1, move right, go to q2",
      "In state q1 reading 0: write 1, move left, go to q2",
      "In state q1 reading 1: write 0, move left, stay in q1",
    ],
    answer: 2,
    explanation:
      "The format is: state, symbol read -> symbol to write, move, next state.",
  },
  {
    lesson: "read",
    id: "r3",
    prompt:
      "The increment machine moves right over the 1s. What does it do when it reaches the first blank?",
    options: [
      "Writes a 1 and halts, making the number one longer",
      "Erases the last 1 and halts",
      "Moves left to the start of the tape",
      "Gets stuck, because no rule covers a blank",
    ],
    answer: 0,
    explanation:
      "Adding one in unary means adding one more 1. The rule q0 _ -> 1 R halt " +
      "writes it at the end and stops.",
  },

  // ---------------------------------------------------------------
  // Lesson 2: Flip every bit
  // ---------------------------------------------------------------
  {
    lesson: "flip",
    id: "f1",
    prompt:
      "Flip machine: q0 0 -> 1 R q0 and q0 1 -> 0 R q0. The input is 01. " +
      "After exactly 2 steps, what is the tape and where is the head?",
    options: [
      "Tape 01, head on the first cell",
      "Tape 10, head on the first cell",
      "Tape 11, head on the second cell",
      "Tape 10, head on the blank after the last symbol",
    ],
    answer: 3,
    explanation:
      "Step 1 flips 0 to 1 and moves right. Step 2 flips 1 to 0 and moves right. " +
      "The head now sits on the blank.",
  },
  {
    lesson: "flip",
    id: "f2",
    prompt:
      "A flip machine has rules for 0 and 1 but none for the blank. " +
      "What happens when it reaches the end of the input?",
    options: [
      "It halts normally",
      "It loops back to the start",
      "It gets stuck, because there is no rule for (q0, _)",
      "It flips the blank into a 1",
    ],
    answer: 2,
    explanation:
      "A missing rule means the machine cannot continue, so the tests fail. " +
      "You need a rule for the blank that goes to halt.",
  },
  {
    lesson: "flip",
    id: "f3",
    prompt: "Why does the flip machine only need one state?",
    options: [
      "It repeats the same action on every cell, so it never needs to remember anything",
      "Machines are limited to one state per lesson",
      "The tape stores the state",
      "It halts after the first cell",
    ],
    answer: 0,
    explanation:
      "Every cell is handled the same way, so q0 covers it. The machine needs more " +
      "states only when it must remember something, as in the next lesson.",
  },

  // ---------------------------------------------------------------
  // Lesson 3: Even or odd 1s
  // ---------------------------------------------------------------
  {
    lesson: "parity",
    id: "p1",
    prompt: "Why does the parity machine need two states?",
    options: [
      "One state reads and one writes",
      "The state is its only memory, so it must remember even versus odd so far",
      "Two states make it run faster",
      "The tape cannot store 1s",
    ],
    answer: 1,
    explanation:
      "While scanning, nothing else records how many 1s were seen. " +
      "The state carries that one bit of memory.",
  },
  {
    lesson: "parity",
    id: "p2",
    prompt:
      "A parity machine switches between q0 (even so far) and q1 (odd so far) on each 1, " +
      "ignores 0s, and at the blank accepts in q0 and rejects in q1. " +
      "What happens on input 101?",
    options: [
      "It rejects, because the input has an odd length",
      "It accepts, because there are two 1s",
      "It halts with 101 on the tape",
      "It gets stuck at the first 0",
    ],
    answer: 1,
    explanation:
      "q0 → q1 on the first 1, stays in q1 on the 0, → q0 on the last 1. " +
      "It ends in q0 at the blank, so it accepts.",
  },
  {
    lesson: "parity",
    id: "p3",
    prompt: "When should a machine end in accept or reject instead of halt?",
    options: [
      "When it should rewrite the tape",
      "When it should answer a yes/no question",
      "When the input is empty",
      "When it has fewer than two states",
    ],
    answer: 1,
    explanation:
      "Machines that produce output (flip bits, increment) halt and leave the result " +
      "on the tape. Machines that answer a yes/no question, like this one, accept or reject.",
  },
];