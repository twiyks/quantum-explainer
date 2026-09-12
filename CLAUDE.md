# Quantum explainer: project instructions

Read this file, `term-ledger.md`, and `AGENTS.md` before writing anything.

## Cross-agent workflow

We use both Claude Code and Antigravity collaboratively on this project.
Always check `AGENTS.md` at the start of every session, and update the handover log in `AGENTS.md` (including the "Last updated" line at the top) whenever finishing your turn.

## What this is

An interactive web explainer that teaches how quantum computing actually works,
from first principles. Twelve short modules, each one idea, each ending in
something the reader can manipulate. The goal is that a smart non-specialist
comes out understanding why interference is the point, rather than repeating
"it's both 0 and 1 at once".

Not a marketing explainer. Not a metaphor-only explainer. Not a physics lecture.

## Who it is for, and a warning about calibration

Two audiences: design students and creative professionals who keep hearing about
quantum and have no foothold, and Dave himself, as a way of consolidating his own
understanding.

Dave is Course Leader for BSc UX Design and BA Graphic Communication at Norwich
University of the Arts, with a background in motion graphics, 3D and animation.
His maths is GCSE level and a long time ago. Start every technical idea from a
very basic level and build slowly. He is comfortable being shown real numbers and
prefers precision to hand-waving, so do not round, fudge or gesture.

**The calibration trap.** Dave is the only reader available until the first build
is user-tested, but he is not the target reader. Every module he reviews leaves
him better informed than the audience, and it is very easy to start writing for
the person you have been talking to for two hours. This has already happened once
in this project. The term ledger exists as a mechanical guard against it. It
catches vocabulary, not conceptual load, so the real fix is user testing with
actual students once the first build exists.

## How Dave wants to work

- Plan first, build second. Pressure-test before implementing.
- One module at a time. He reads it, checks his own understanding, feeds back,
  then the next one starts. Do not run ahead and build three.
- Be direct about what is weak. He would rather get the pedagogy right than
  defend his own outline, and he has changed the plan several times already on
  the strength of an argument.
- Ask when scope is ambiguous rather than guessing.
- End each module handover with two or three comprehension checks he should be
  able to answer. If he cannot, that is a fault in the module.
- If he suggests wording that is inaccurate or would undermine a later module,
  say so and explain why rather than implementing it. He has been right to push
  back and he expects the same in return.

## Writing rules

- No em dashes anywhere in copy.
- British English.
- No corporate or marketing language. No AI-associated stylistic tropes: no
  "not X, but Y" constructions, no scare-quoted invented labels, no "it's worth
  noting".
- Conversational, plain, concise. Text bloat is a live risk in this project and
  he has flagged it. Explanations should be clear and short, not thorough.
- One idea per module. If a module has two, split it.
- Manipulate before explain. The reader drives something, forms a hunch, then
  reads why.
- Predict before reveal, especially at the interference moment.
- Show real numbers. 0.7071 and its square beat vague talk.
- Metaphors must be load-bearing and retired honestly when they stop being
  accurate. Say where each one breaks, in the module, at the point it breaks.
- No equations before the intuition that motivates them.

### Metaphors in play

- A circuit is a musical score: parts stacked vertically, time left to right.
- A gate is a rotation, not a decision.
- Reading a bitstring is reading a fixed-width data format.
- Already retired: the loaded die from module 1, handed back in module 4,
  because a die survives being rolled and a qubit does not.

## The term ledger rule

No term appears before the module that defines it. This is not a style
preference, it is a hard rule Dave set after two breaches.

Workflow for every module:

1. Read `term-ledger.md` before writing.
2. Write, using the plain substitutes listed there for anything not yet defined.
3. Grep the finished file for queued terms and fix any hits.
4. Add whatever the module defines to the ledger.

Forward references are fine if they name a module number and describe the thing
in plain words instead of using the term.

## Module plan

Twelve modules. The original brief had nine; this sequence is the revised one and
the reasoning is in the notes below it.

| # | Module | Interactive | Status |
| --- | --- | --- | --- |
| 0 | Cold open | Two histograms side by side, one bell, one hollow, one button, no explanation | Not built, build last |
| 1 | Probability and sampling | Hidden-bias die, shots buttons, histogram, truth reveal | Built |
| 2 | Bits and the classical walk | Person stepping forward and back, step presets, histogram, route counts | Built |
| 3 | The qubit as two numbers | Draggable point on a circle, live squares, presets | Built |
| 4 | Measurement | Same circle plus a Measure button that locks the state, tally | Built |
| 5 | Amplitudes are not probabilities | Two states with identical statistics that diverge under one operation | Next |
| 6 | Gates as rotations | Angle dial, X and H presets, visible undo for reversibility | Not built |
| 7 | Interference | H then H path tracker, four numbers, predict before reveal | Not built |
| 8 | Circuits as scores | Drag three gates onto a wire, run, histogram | Not built |
| 9 | Controlled operations | Four-bar histogram, CNOT toggle | Not built |
| 10 | The quantum walk | Module 2's interface with the coin swapped, classical result pinned alongside | Not built |
| 11 | Entanglement, and the sphere | Bell state, plus the circle growing its third axis | Not built |
| 12 | Reality check | Noise slider degrading the walk, real API output | Not built |

Reasoning behind the changes from the nine-module brief:

- Module 3 in the brief claimed the sphere falls out of two amplitudes squaring
  to 1. It does not. Two real numbers give a circle. The sphere needs the third
  quantity, so the circle is presented honestly as a circle and the sphere is
  promised for module 11.
- Negative and complex amplitudes were bundled together. Negatives are essential
  and easy, complex is a real step up, so they are split.
- The smallest complete interference story (H then H) was missing. It is now
  module 7, before the walk, so the reader sees the mechanism at four-number
  scale before seeing it at scale.
- Entanglement moved after the walk so it does not delay the payoff. Controlled
  operations stay before it because the walk needs them mechanically.

## Visual system

Restrained, not neon sci-fi. The instrument is the hero on every page.

```
--paper      #E6E8EB   page ground
--panel      #F6F7F8   the instrument panel
--plot       #FCFCFC   inside chart frames
--ink        #161B22   text, baselines
--muted      #5C6872   secondary text, axis labels
--rule       #C6CCD2   hairlines and borders
--data       #2A4C6B   primary data (bars, the first number)
--data-soft  #93A8B8   secondary data (the second number)
--accent     #8A4262   the truth, and the current state point
```

Type: Newsreader for prose and headings, IBM Plex Sans for anything numeric or
interface, always with `font-variant-numeric: tabular-nums` so live readouts do
not jitter. Fallbacks Georgia and the system sans stack.

Chart grammar, consistent across modules and worth protecting:

- Blue bars are what the reader built by sampling.
- Plum marks are the truth they were estimating. Same meaning in every module.
- Plum dot is the current state.
- Gridlines #E1E6EA, baseline in ink.
- Percentages sit above bars, not in a legend.
- Empty states say what to press, inside the plot area.

Layout: single column, 680px max, prose at 62ch, left aligned. Panels have a 1px
rule and 3px radius. Chart frames 2px radius. Values quoted exactly in copy must
have a preset button behind them, never a drag instruction.

## Code conventions

The four built modules were made as standalone Claude artifacts, which forced
constraints that no longer apply in VS Code:

- Each file duplicates the entire style block.
- Fonts come in via a Google Fonts `@import` inside that block.
- No Tailwind, because arbitrary values were unavailable.
- No browser storage of any kind.

**The refactor is now due.** Suggested structure: Vite and React, a shared
`tokens.css`, shared components for the histogram, the panel, the state circle
and the readout rows, and one file per module holding only its logic and copy.
The histogram in particular now exists in three slightly different forms across
modules 1, 2 and 4 and should be one component before module 10 needs a fourth.

Carry over: pointer capture for dragging, `touch-action: none` on draggable SVG,
`prefers-reduced-motion` respected by skipping animation rather than removing
function, visible keyboard focus, arrow key control on anything draggable.

## Open decisions and debts

- **The sphere angle doubles.** On the circle used in modules 3 and 4, the two
  opposite results sit 90 degrees apart. On a Bloch sphere they sit 180 degrees
  apart. Module 11 has to say this out loud and explain why, rather than quietly
  swapping pictures. This debt was taken on deliberately.
- **The cold open needs the walk.** Module 0 shows the quantum walk distribution,
  so it cannot be built until module 10 exists. Build it last and drop it on the
  front.
- **The symmetric walk needs a complex coin.** A Hadamard-coin walk starting from
  a plain 0 coin is asymmetric and drifts to one side. The tidy double-humped
  shape everyone puts in their slides requires a complex component in the
  starting coin state. Decide in module 10 whether to show the asymmetric walk
  honestly and explain the lean, or show the symmetric one with the complex coin
  behind an optional panel. Dave has said the sphere is in, so complex numbers
  are in the main line eventually, which makes either option viable.
- **Module 12 wants real output.** Dave does client work for Moth Quantum and has
  access to their platform and API, including the OpenAPI spec. Decide whether
  module 12 shows genuine returned counts or a faithful simulation.
- **Navigation.** Not yet decided: single scrolling page or discrete modules with
  navigation between them.

## Things already learned the hard way

- **0.33 and 0.66 is not a legal qubit state.** Squares give 0.5445. The instinct
  to reach for numbers that look like the split you want is the exact
  misconception module 3 exists to break, so it is now in the copy as a worked
  trap rather than a warning.
- **Never tell a reader to drag to a value.** Dave followed "drag to about 55
  degrees" and got numbers that contradicted the text, because the honest angle
  is 54.7356. Anything quoted exactly gets a preset button.
- **Reassurance keeps producing falsehoods.** Three sentences in this project
  have been wrong for the same reason: they were trying to make the maths feel
  less intimidating. "Nothing else to know about a qubit" is false at two qubits.
  "Nothing is really being added" would sabotage module 7, where the plus sign is
  the whole point. "You cannot collapse it into a single number" is false, and
  the collapsed form is the point on the circle. State things plainly instead.
  The notation is exactly as mathematical as it looks and is simply not difficult.
- **Forward and back beats left and right** for the walk, because a step forward
  and a step back obviously cancel, which is the intuition module 7 needs.
- **Check what a metaphor licenses, not just what it illustrates.** Several of
  the above were caught by Dave, not by the writing.
