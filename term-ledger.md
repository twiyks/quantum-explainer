# Term ledger

The rule: no term appears in any module before the module that defines it.
Forward references are allowed only if they name a module number and use a
plain description rather than the term itself.

Check this file before writing any module, and add to it after.

## Defined so far

| Term | Defined in | How it is introduced |
| --- | --- | --- |
| distribution | 1 | the fixed hidden percentages, as opposed to the bars you build |
| estimate | 1 | the bars you build from sampling |
| shot | 1 | named at the end as the word for one run, after a whole module of rolls |
| bit | 2 | a thing with two states, here a coin |
| route | 2 | one particular sequence of coin results |
| qubit | 3 | glossed as quantum bit, then defined by contrast with a bit |
| state | 3 | the two numbers taken together |
| amplitude | 3 (named), 5 (defined) | named in module 3's closing aside, flagged as a word to distrust; properly defined in module 5 as a number that can be negative, whose square gives the chance |
| ket notation | 3 | the matched pair of marks, with the label inside |
| Bloch sphere | 3 | named as the thing this circle is deliberately not, yet |
| measurement | 4 | the only output a qubit gives, plus an aside on why the word misleads |
| chance | 4 | the square of a result's number; the word probability is not used |
| preparation | 4 | setting the two numbers before measuring, one qubit per run |
| gate | 5 (introduced), 6 (full treatment) | named in module 5 as "a mathematical operation that takes a qubit's two numbers and produces a new pair"; full treatment as rotations in module 6 |
| interference | 7 | defined as "the combining of signed amplitude contributions arriving at the same destination"; constructive (same sign, reinforce) and destructive (opposite sign, cancel) |
| superposition | 7 (aside) | used in aside only; glossed as "both amplitudes are non-zero at the same time"; word noted as attracting mystical readings |
| circuit | 8 | "a complete description of what a quantum computer does": starting state, ordered gates, measurement; score metaphor introduced |
| controlled operation | 9 | CNOT defined: gate that only acts on a target qubit when a control qubit is |1⟩; two-qubit state space introduced |
| quantum walk | 10 | defined as the classical walk with the coin replaced by a qubit; H applied to coin each step, then conditional shift; interference suppresses centre and concentrates probability at edges |

## Queued, do not use early

| Term | Will be defined in |
| --- | --- |

| controlled operation | 9 |
| entanglement | 11 |
| phase | 11 |
| noise, depth | 12 |

## Plain substitutes used in the meantime

- circuit: "a quantum computer" or "a run"
- measurement, before module 4: "the moment a pair of numbers turns into a single bit"

## Words being avoided on purpose

- superposition, until there is something concrete for it to name. The brief's
  whole complaint is about people repeating "both 0 and 1 at once", so the word
  arrives late or not at all.
- collapse, which sounds like damage. Module 4 uses plainer language.
