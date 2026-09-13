# Agent Handover Log

Last updated by: Claude Code on 12 September 2026 (module 10)

## Protocol for Claude Code and Antigravity

1. **Before starting work**:
   - Read `CLAUDE.md` for project instructions, pedagogical constraints, visual tokens, and Dave's calibration guidelines.
   - Read `term-ledger.md` for strict vocabulary rules. No term appears before the module that defines it.
   - Read this file (`AGENTS.md`) for current state, recent changes, and open notes from the previous agent.

2. **When completing work**:
   - Update the `Last updated by: (Agent) on (Date) at (Time)` line at the very top of this file.
   - Update the **Current Project Status** section if the active state changed.
   - Add an entry to the top of the **Change Log** summarizing what was built, refactored, or decided.
   - Run `npm run build` so that the standalone `index.html` stays in sync with changes in `src/`.

---

## Current Project Status

- **Live Modules**: Modules 1, 2, 3, 4, 5, 6, 7, 8, 9, and 10 are built, interactive, and integrated.
- **Architecture**:
  - `src/`: Modular React components (`App.jsx`, `StartPage.jsx`, `Navigation.jsx`, `modulesData.js`, `styles.css`).
  - `src/modules/`: Module components (`Module01Sampling.jsx`, `Module02RandomWalk.jsx`, `Module03Qubit.jsx`, `Module04Measurement.jsx`).
  - `build.js`: Standalone esbuild script producing a self-contained `index.html`.
  - `index.html`: Fully self-contained single file that runs locally directly via `file://` (no local dev server needed).
- **Navigation**:
  - Top header with overview link and module selector dropdown.
  - Hash routing (`#start`, `#module-1`, `#module-2`, `#module-3`, `#module-4`).
  - Bottom pagination stepping between active modules.
  - Buttons and selector options for unbuilt modules (Module 0 and Modules 5 to 12) are disabled.
- **Next up**: Module 11 (*Entanglement, and the sphere*).

---

## Change Log

### 12 September 2026 (module 10) — Claude Code
- Built Module 10: *The quantum walk* (`src/modules/Module10QuantumWalk.jsx`).
- Simulation: Hadamard coin, |0⟩ start at position 0, real-amplitude state arrays of size 41 (positions −20 to +20). `doStep` applies H then conditional shift (coin=0 left, coin=1 right) per position. Classical binomial probabilities computed analytically for comparison.
- Interactive: step counter, +1/+5/+10 buttons (capped at 20), Reset. SVG bar chart: blue filled bars (quantum), plum outline bars (classical, same step count). Stat row below chart: quantum peak position/%, classical peak position/%, quantum spread (n/√2), classical spread (√n).
- Honest about the asymmetric lean: starting coin |0⟩ is not symmetric; walk drifts left. Aside defers the symmetric complex-coin version to module 11.
- Prose: what changed (coin→qubit, H each step, controlled shift), why centre empties (destructive interference on routes to central positions), how fast it spreads (linear n vs √n), connection to quantum search.
- Defined "quantum walk" in term-ledger.md.
- Updated App.jsx, modulesData.js, AGENTS.md.
- Rebuild: index.html 370 KB.

### 12 September 2026 (module 9) — Claude Code
- Built Module 9: *Controlled operations* (`src/modules/Module09Controlled.jsx`).
- Interactive: two-wire circuit with SVG diagram (control wire, target wire, CNOT symbol); control prep selector (|0⟩ / H / |1⟩), target prep selector (|0⟩ / |1⟩), CNOT toggle on/off; live "true distribution" panel showing exact four-way percentages; "Run 500 shots" four-bar histogram (|00⟩, |01⟩, |10⟩, |11⟩).
- SVG circuit diagram: draws prep gate boxes or passes wire through when no gate; CNOT shown as filled control dot + ⊕ target circle + vertical line; "no CNOT" label when off; measurement M boxes at end of each wire.
- Prose: CNOT definition (controlled-X), truth table (four rows, annotated "fires/silent"), two-qubit state space (four outcomes, four amplitudes), three walk-through cases (control=0, control=1, control=H), forward reference to module 11 for the correlated state name.
- Aside: CNOT is universal with single-qubit gates; forward ref to module 10 (quantum walk coin mechanism).
- Defined "controlled operation" in term-ledger.md.
- Updated App.jsx, modulesData.js, AGENTS.md.
- Rebuild: index.html 353 KB.

### 12 September 2026 (module 8) — Claude Code
- Built Module 8: *Circuits as scores* (`src/modules/Module08Circuits.jsx`).
- Interactive: gate palette (H, X, R+45°, R+90°, R−90°, R+180°), three-slot circuit wire with |0⟩ start and M measurement box, live state readout updating as gates are placed, "Run 500 shots" button producing a two-bar histogram (result 0 blue, result 1 soft blue).
- Wire: fixed 3-slot positions shown always (filled = dark badge, empty = dashed placeholder); click palette to add, click gate on wire to remove; gates compact left to right.
- State readout shows exact amplitudes + percentages before measurement, updating live as gates change.
- Prose: circuit definition (starting state + ordered gates + measurement), score metaphor (wire = instrument line, gates = notes, time = left to right), running many shots = sampling from module 1, suggested circuits to explore (H→H, H→X→H, rotation compositions).
- Aside: real hardware compiles circuit to pulses; notation is standard across platforms.
- Defined "circuit" in term-ledger.md.
- Updated App.jsx, modulesData.js, AGENTS.md.
- Rebuild: index.html 328 KB.

### 12 September 2026 (module 7) — Claude Code
- Built Module 7: *Interference* (`src/modules/Module07Interference.jsx`).
- Interactive: three-phase predict-before-reveal. Phase 1 shows the intermediate state after first H with three prediction buttons. Phase 2 reveals the path table and totals, with per-prediction feedback.
- Path table: four rows showing each slot-to-result contribution with signed values (+0.5000, +0.5000, +0.5000, −0.5000). Totals panel: result 0 = 1.0000 (certain), result 1 = 0.0000 (impossible).
- Prose: what just happened (same-sign paths reinforce, opposite-sign paths cancel), why this cannot happen with probabilities (classical paths always positive), minus sign in the gate not the state (contrast with module 5's signed state).
- Defined "interference" for the first time. "Superposition" introduced in an aside only, with explicit note about why the word is used sparingly.
- Updated App.jsx (import, hash routing, render case for module 7), modulesData.js (status → built).
- term-ledger.md: interference and superposition moved from Queued to Defined.
- Rebuild: index.html 307 KB.

### 12 September 2026 (module 6) — Claude Code
- Built Module 6: *Gates as rotations* (`src/modules/Module06Gates.jsx`).
- Interactive: state circle (read-only), rotation gate with angle slider (−180° to +180°), five angle presets, Apply Rotation button, X and H buttons, Undo Last and Reset. Operation trail badges below the panel show gate history back to |0⟩.
- Rotation preview: dashed arc and ghost dot on the circle show where the state will land before the button is pressed.
- Prose: rotation gate (genuine rotation of the circle point), X gate (swap rule + table of four examples), Hadamard (reflection over 22.5° + table), reversibility (contrast with classical AND), aside on the rotation label and where it becomes fully precise (module 11).
- Honest about the metaphor: on the real circle X and H are reflections; the aside names this and defers the full reconciliation to module 11 when the sphere arrives.
- Appended `RY` note in aside: the rotation gate is the R_Y family; +90° takes |0⟩ to |1⟩; +180° reaches the antipodal point.
- Updated App.jsx (import, hash routing, render case for module 6), modulesData.js (status → built).
- Rebuild: index.html 286 KB.

### 12 September 2026 (quiz) — Claude Code
- Created shared `src/components/Quiz.jsx`: self-contained multiple-choice component. Takes a `questions` array; locks on first click; shows per-option feedback in green (correct) or plum (wrong). No score tracking.
- Question design: applied retrieval-practice-generator (recognition type, calibrate distractors to real misconceptions), assessment-validity-checker (test understanding not recall), and erroneous-example-designer (each wrong option targets one specific realistic error).
- Added 3 MCQ questions to each of modules 1–4 (none had comprehension checks before).
- Replaced module 5's open-ended comprehension checks with the MCQ format.
- All 15 questions validated against term ledger — no queued terms used.
- Removed now-unused qx-checks CSS from Module05Amplitudes.
- Rebuild: index.html 263 KB.

### 12 September 2026 (gate fix) — Claude Code
- Module 5: introduced the word "gate" with context — "a gate: a mathematical operation that takes a qubit's two numbers and produces a new pair". Forward pointer to module 6 for full treatment (rotations, reversibility). This corrects an over-strict application of the term ledger: the ledger prevents unexplained jargon, not properly contextualised introductions.
- term-ledger.md: gate row added to "Defined so far" table (introduced in 5, full treatment in 6). Plain substitute for gate removed as no longer needed.
- Rebuild: index.html 246 KB.

### 12 September 2026 (revision) — Claude Code
- Module 5: clarified the nature of "the operation" in lead prose. Added three paragraphs explaining that: (1) measurement is not the only thing a quantum computer does, (2) between preparation and measurement the computer manipulates the numbers directly, (3) the operation here is a specific real one that will be named in module 6. Section heading updated from "How the operation works" to "What the manipulation does to the numbers". Panel prompt text updated to match.
- Rebuild: index.html 246 KB.

### 12 September 2026 — Claude Code
- Built Module 5: *Amplitudes are not probabilities* (`src/modules/Module05Amplitudes.jsx`).
- Interactive: two states (State A: 0.7071, 0.7071 / State B: −0.7071, 0.7071) with identical measurement tallies before the operation, then one operation applied to both, showing State A becomes certain-0 and State B becomes certain-1.
- Operation described mechanically by its rule (new_0 = (amp0+amp1)/√2, new_1 = (amp0−amp1)/√2) without naming it; naming arrives in module 6.
- Amplitude properly defined for the first time (named only in module 3). Superposition deliberately omitted.
- Arithmetic tables show the cancellation step by step for both states.
- Three comprehension checks at end, per Dave's working style.
- Updated `src/App.jsx` (import + hash routing + render for module 5), `src/modulesData.js` (status → built), `AGENTS.md`.
- `npm run build` succeeded: index.html 245 KB.

### 12 September 2026, 10:55 BST — Antigravity
- Created standalone local web architecture answering user question (dev server is avoidable via self-contained IIFE bundle).
- Created `src/components/StartPage.jsx` introducing the explainer, its target audience, and the 12-module roadmap.
- Created `src/components/Navigation.jsx` providing sticky header navigation, hash-based URL routing, and bottom module pagination.
- Disabled buttons and dropdown items for all unbuilt modules (0 and 5 to 12) with status indicators ("Build last", "Next up", "Not built yet").
- Created `build.js` and generated standalone root `index.html` (223 KB) runnable by double-clicking in Explorer or dragging to any browser.
- Created `AGENTS.md` and updated `CLAUDE.md` to establish the cross-agent handover protocol between Claude Code and Antigravity.
