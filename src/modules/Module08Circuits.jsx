import React, { useState } from "react";
import Quiz from "../components/Quiz.jsx";

/*
  Quantum explainer, module 8: circuits as scores.
  One idea: a circuit is a complete description of what happens to a qubit,
  read left to right. Running it many times produces a histogram.

  Terms defined here: circuit.
  Terms deliberately absent: controlled operation (9), entanglement (11).
*/

const INV_SQRT2 = 1 / Math.sqrt(2);
const D2R = Math.PI / 180;

function applyGate(state, gate) {
  const a = state.amp0, b = state.amp1;
  if (gate.type === "H") {
    return { amp0: (a + b) * INV_SQRT2, amp1: (a - b) * INV_SQRT2 };
  }
  if (gate.type === "X") {
    return { amp0: b, amp1: a };
  }
  if (gate.type === "R") {
    const t = gate.angle * D2R;
    const c = Math.cos(t), s = Math.sin(t);
    return { amp0: a * c - b * s, amp1: a * s + b * c };
  }
  return state;
}

function tidy(v) { return Math.abs(v) < 1e-10 ? 0 : v; }

function computeState(gates) {
  let s = { amp0: 1, amp1: 0 };
  for (const g of gates) s = applyGate(s, g);
  return { amp0: tidy(s.amp0), amp1: tidy(s.amp1) };
}

function runShots(gates, n) {
  const s = computeState(gates);
  const p0 = s.amp0 * s.amp0;
  let c0 = 0;
  for (let i = 0; i < n; i++) { if (Math.random() < p0) c0++; }
  return { count0: c0, count1: n - c0, state: s };
}

function fmt(v) {
  if (Math.abs(v) < 1e-10) return "0.0000";
  return (v < 0 ? "\u2212" : "") + Math.abs(v).toFixed(4);
}

const PALETTE = [
  { label: "H", type: "H" },
  { label: "X", type: "X" },
  { label: "R +45\u00B0", type: "R", angle: 45 },
  { label: "R +90\u00B0", type: "R", angle: 90 },
  { label: "R \u221290\u00B0", type: "R", angle: -90 },
  { label: "R +180\u00B0", type: "R", angle: 180 },
];

const MAX_SLOTS = 3;
const NUM_SHOTS = 500;

const QUIZ_QUESTIONS = [
  {
    q: "You build the circuit H \u2192 H and run it 500 times. The histogram shows result 0 almost every time. Which earlier module explained why this happens?",
    options: [
      "Module 4 \u2014 measurement always collapses to the most likely result after two gates",
      "Module 6 \u2014 H applied twice is the identity, so the state stays at |0\u27E9 throughout",
      "Module 7 \u2014 the four amplitude paths produce destructive interference at result 1 and constructive interference at result 0",
      "Module 3 \u2014 two equal amplitudes always produce a certain result when measured"
    ],
    answer: 2,
    feedback: [
      "Measurement does not favour the most likely result; it samples according to the squared amplitudes. Module 4 covered this.",
      "H applied twice is the identity, which is correct \u2014 but this option does not explain the mechanism. The state does pass through (0.7071, 0.7071) between the two gates. The reason it returns to certainty is interference, not that nothing happened.",
      "Correct. Module 7 showed the four paths: two feeding result 0 with the same sign (constructive), two feeding result 1 with opposite signs (destructive). The circuit is just the same mechanism written as a diagram.",
      "Two equal amplitudes give 50% chance each, not certainty. A state with a certain result has one amplitude equal to 1 and the other equal to 0."
    ]
  },
  {
    q: "The circuit H \u2192 H produces certain result 0. You add X as a third gate: H \u2192 H \u2192 X. What does the histogram show now?",
    options: [
      "Still certain result 0 \u2014 X has no effect on a state that is already certain",
      "Certain result 1 \u2014 H \u2192 H returns the state to |0\u27E9 = (1, 0) and then X swaps the amplitudes",
      "50/50 \u2014 adding a third gate disrupts the interference pattern",
      "Certain result 1 only sometimes \u2014 the extra gate introduces randomness"
    ],
    answer: 1,
    feedback: [
      "X applied to (1, 0) produces (0, 1), which is certain result 1. The state is not unchanged by X.",
      "Correct. H \u2192 H returns the qubit to (1, 0). X then swaps the two amplitudes, giving (0, 1) = |1\u27E9. The histogram will be near-certain result 1. The circuit is deterministic: the same gates always give the same final state.",
      "Adding X after H \u2192 H does not introduce randomness. Gates are deterministic. H \u2192 H has already done its work before X acts.",
      "Gates are deterministic. The same circuit always produces the same final state, and therefore the same distribution. Only measurement introduces variation, not gates."
    ]
  },
  {
    q: "You run a circuit 500 times and the histogram shows 241 zeros and 259 ones. What does this tell you?",
    options: [
      "The true amplitude for result 1 is exactly 0.5180 (259/500 = 0.518, square root \u2248 0.7197)",
      "The histogram is an estimate. The result is consistent with a 50/50 state, but more shots would narrow the uncertainty.",
      "The circuit is slightly broken \u2014 a correct quantum gate should produce whole-number probabilities",
      "You need exactly 1000 shots to draw any conclusion about the amplitudes"
    ],
    answer: 1,
    feedback: [
      "The histogram gives an estimate of the chance, not the true amplitude. As module 1 showed, sampling produces a distribution that gets closer to the truth with more shots, but never lands exactly on it.",
      "Correct. 241/500 and 259/500 are both close to 50%. This is consistent with a 50/50 state \u2014 for example, (0.7071, 0.7071). Running more shots would narrow the gap between the estimate and the true distribution, just as in module 1.",
      "Quantum gates produce exact amplitudes, but measurement is probabilistic. A 50/50 state will almost never produce exactly 250 zeros and 250 ones in 500 shots.",
      "More shots always improve the estimate, but there is no special number that makes conclusions valid. Even 100 shots gives a rough picture; 10\u202C000 gives a fine one."
    ]
  }
];

export default function ModuleEightCircuits() {
  const [slots, setSlots] = useState([]); // array of gate objects, max 3
  const [result, setResult] = useState(null);

  function addGate(gate) {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [...prev, gate]);
    setResult(null);
  }

  function removeGate(i) {
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
    setResult(null);
  }

  function handleRun() {
    setResult(runShots(slots, NUM_SHOTS));
  }

  function clearAll() {
    setSlots([]);
    setResult(null);
  }

  const currentState = computeState(slots);
  const p0 = currentState.amp0 * currentState.amp0;
  const p1 = currentState.amp1 * currentState.amp1;

  const pct0 = result ? (result.count0 / NUM_SHOTS * 100) : 0;
  const pct1 = result ? (result.count1 / NUM_SHOTS * 100) : 0;
  const maxPct = result ? Math.max(pct0, pct1, 1) : 1;
  const BAR_MAX_H = 96; // px

  return (
    <div className="qx-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&display=swap');

        .qx-root {
          --paper: #E6E8EB; --panel: #F6F7F8; --plot: #FCFCFC;
          --ink: #161B22; --muted: #5C6872; --rule: #C6CCD2;
          --data: #2A4C6B; --data-soft: #93A8B8; --accent: #8A4262;
          background: var(--paper); color: var(--ink);
          font-family: 'Newsreader', Iowan Old Style, Palatino, Georgia, serif;
          padding: 40px 20px 72px; min-height: 100%; box-sizing: border-box;
        }
        .qx-wrap { max-width: 680px; margin: 0 auto; }

        .qx-eyebrow {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 13px; font-weight: 500; color: var(--muted); margin: 0 0 14px;
        }
        .qx-h1 {
          font-size: 40px; line-height: 1.12; font-weight: 400;
          letter-spacing: -0.012em; margin: 0 0 24px; max-width: 16ch;
        }
        .qx-h2 {
          font-size: 23px; line-height: 1.25; font-weight: 500;
          margin: 44px 0 12px; letter-spacing: -0.006em;
        }
        .qx-p { font-size: 18px; line-height: 1.66; margin: 0 0 18px; max-width: 62ch; color: #222A31; }
        .qx-p.lead { font-size: 19.5px; }
        .qx-p b { font-weight: 600; }

        .qx-panel {
          background: var(--panel); border: 1px solid var(--rule);
          border-radius: 3px; padding: 20px 22px 18px; margin: 28px 0 30px;
        }
        .qx-sans {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
        }

        .qx-panel-label {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--muted); margin: 0 0 12px;
        }

        /* Wire */
        .qx-wire-row {
          display: flex; align-items: center; gap: 0;
          padding: 8px 0 16px; overflow-x: auto;
        }
        .qx-wire-end {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 14px; font-weight: 500; color: var(--muted);
          white-space: nowrap; flex-shrink: 0;
        }
        .qx-wire-seg {
          flex: 1; min-width: 12px; height: 2px; background: var(--rule);
          flex-shrink: 0; align-self: center;
        }
        .qx-wire-seg.short { min-width: 8px; max-width: 24px; }
        .qx-gate-slot {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 13px; font-weight: 600;
          width: 48px; height: 34px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 2px; position: relative;
        }
        .qx-gate-slot.filled {
          background: var(--data); color: #FFF;
          border: 1px solid var(--data); cursor: pointer;
        }
        .qx-gate-slot.filled:hover { background: #1e374f; }
        .qx-gate-slot.filled:focus-visible { outline: 2px solid var(--data); outline-offset: 2px; }
        .qx-gate-slot.empty {
          background: transparent; color: var(--rule);
          border: 1.5px dashed var(--rule);
        }
        .qx-measure-box {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 13px; font-weight: 600; color: var(--accent);
          width: 34px; height: 34px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--accent); border-radius: 2px;
        }
        .qx-remove-hint {
          font-size: 9px; font-weight: 400; font-family: 'IBM Plex Sans', sans-serif;
          position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%);
          color: var(--muted); white-space: nowrap; opacity: 0;
          pointer-events: none;
        }
        .qx-gate-slot.filled:hover .qx-remove-hint { opacity: 1; }

        /* Palette */
        .qx-palette { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 0; }

        .qx-btn {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums;
          background: #FFFFFF; color: var(--ink);
          border: 1px solid var(--rule); border-radius: 2px;
          padding: 8px 13px; cursor: pointer;
        }
        .qx-btn:hover:not(:disabled) { border-color: var(--data); color: var(--data); }
        .qx-btn:disabled { opacity: 0.4; cursor: default; }
        .qx-btn:focus-visible { outline: 2px solid var(--data); outline-offset: 2px; }
        .qx-btn.accent { background: var(--data); border-color: var(--data); color: #FFFFFF; }
        .qx-btn.accent:hover:not(:disabled) { background: #1e374f; }
        .qx-btn.quiet { background: transparent; color: var(--muted); }
        .qx-btn.sm { font-size: 13px; padding: 6px 11px; }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .qx-divider { border: none; border-top: 1px solid var(--rule); margin: 16px 0; }

        /* State readout */
        .qx-state-row {
          display: flex; gap: 20px; flex-wrap: wrap;
        }
        .qx-state-cell {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 13.5px; line-height: 1.6;
        }
        .qx-state-cell .lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
        .qx-state-cell .val { font-weight: 500; }
        .qx-state-cell .val.c0 { color: var(--data); }
        .qx-state-cell .val.c1 { color: var(--muted); }

        /* Histogram */
        .qx-histo-wrap {
          background: var(--plot); border: 1px solid var(--rule);
          border-radius: 2px; padding: 16px 16px 10px;
          margin: 0;
        }
        .qx-histo {
          display: flex; gap: 28px; align-items: flex-end;
          height: ${BAR_MAX_H + 30}px; padding-bottom: 0;
        }
        .qx-bar-col {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          flex: 0 0 56px;
        }
        .qx-bar-pct {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 13px; font-weight: 600; color: var(--ink);
          min-height: 18px;
        }
        .qx-bar {
          width: 56px; border-radius: 1px 1px 0 0;
          transition: height 0.2s ease;
        }
        .qx-bar.r0 { background: var(--data); }
        .qx-bar.r1 { background: var(--data-soft); }
        .qx-bar-baseline { width: 100%; height: 1px; background: var(--ink); margin-top: 0; }
        .qx-bar-lbl {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 12px; color: var(--muted); margin-top: 5px;
        }
        .qx-histo-empty {
          display: flex; align-items: center; justify-content: center;
          height: ${BAR_MAX_H + 30}px;
          color: var(--muted);
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 14px;
        }
        .qx-shot-count {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 12px; color: var(--muted);
          text-align: right; margin-top: 8px;
        }

        .qx-aside {
          border-left: 2px solid var(--rule); padding: 2px 0 2px 18px;
          margin: 30px 0; max-width: 60ch;
        }
        .qx-aside p { font-size: 16px; line-height: 1.6; color: var(--muted); margin: 0 0 10px; }
        .qx-aside p:last-child { margin-bottom: 0; }

        .qx-rule { border: none; border-top: 1px solid var(--rule); margin: 40px 0 0; }
        .qx-footer { font-size: 15px; color: var(--muted); margin: 18px 0 0; }

        @media (max-width: 560px) {
          .qx-h1 { font-size: 31px; max-width: 18ch; }
          .qx-p { font-size: 17px; }
          .qx-panel { padding: 16px 14px 14px; }
        }
      `}</style>

      <div className="qx-wrap">
        <p className="qx-eyebrow qx-sans">Module eight of twelve</p>
        <h1 className="qx-h1">Circuits as scores</h1>

        <p className="qx-p lead">
          So far each module has applied one gate at a time. A <b>circuit</b> is
          the full sequence: which gates, in which order, applied to which qubit,
          followed by a measurement. Build one below, then run it.
        </p>
        <p className="qx-p">
          Click a gate from the palette to add it to the wire. Click a gate on
          the wire to remove it. The qubit starts at |0&#10217; = (1, 0) every time.
        </p>

        {/* === INTERACTIVE PANEL === */}
        <div className="qx-panel">

          {/* Wire */}
          <p className="qx-panel-label qx-sans">Circuit wire</p>
          <div className="qx-wire-row qx-sans">
            <span className="qx-wire-end">|0&#10217;</span>
            <div className="qx-wire-seg" />
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                {slots[i] ? (
                  <button
                    className="qx-gate-slot filled"
                    onClick={() => removeGate(i)}
                    aria-label={`Remove ${slots[i].label}`}
                    title="Click to remove"
                  >
                    {slots[i].label}
                    <span className="qx-remove-hint">remove</span>
                  </button>
                ) : (
                  <div className="qx-gate-slot empty" aria-hidden="true">&middot;</div>
                )}
                <div className="qx-wire-seg" />
              </React.Fragment>
            ))}
            <div className="qx-measure-box" aria-label="Measurement">M</div>
          </div>

          {/* Palette */}
          <p className="qx-panel-label qx-sans" style={{ marginBottom: 8 }}>
            Gate palette &mdash; click to add
            <span style={{
              fontWeight: 400, letterSpacing: 0, textTransform: "none",
              marginLeft: 8, fontSize: 11
            }}>
              ({slots.length}/{MAX_SLOTS} placed)
            </span>
          </p>
          <div className="qx-palette">
            {PALETTE.map((g, i) => (
              <button
                key={i}
                className="qx-btn sm"
                onClick={() => addGate(g)}
                disabled={slots.length >= MAX_SLOTS}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="qx-divider" />

          {/* State readout */}
          <p className="qx-panel-label qx-sans">State before measurement</p>
          <div className="qx-state-row qx-sans" style={{ marginBottom: 16 }}>
            <div className="qx-state-cell">
              <div className="lbl">result 0</div>
              <div className="val c0">{fmt(currentState.amp0)} &nbsp; ({(p0 * 100).toFixed(2)}%)</div>
            </div>
            <div className="qx-state-cell">
              <div className="lbl">result 1</div>
              <div className="val c1">{fmt(currentState.amp1)} &nbsp; ({(p1 * 100).toFixed(2)}%)</div>
            </div>
          </div>

          {/* Controls */}
          <div className="qx-controls" style={{ marginBottom: 20 }}>
            <button className="qx-btn accent" onClick={handleRun}>
              Run {NUM_SHOTS} shots
            </button>
            <button className="qx-btn quiet" onClick={clearAll} disabled={slots.length === 0 && result === null}>
              Clear
            </button>
          </div>

          {/* Histogram */}
          <div className="qx-histo-wrap">
            {result ? (
              <>
                <div className="qx-histo">
                  <div className="qx-bar-col">
                    <div className="qx-bar-pct">{pct0.toFixed(1)}%</div>
                    <div
                      className="qx-bar r0"
                      style={{ height: Math.max((pct0 / maxPct) * BAR_MAX_H, pct0 > 0 ? 2 : 0) }}
                    />
                  </div>
                  <div className="qx-bar-col">
                    <div className="qx-bar-pct">{pct1.toFixed(1)}%</div>
                    <div
                      className="qx-bar r1"
                      style={{ height: Math.max((pct1 / maxPct) * BAR_MAX_H, pct1 > 0 ? 2 : 0) }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 28, marginTop: 4 }}>
                  <div className="qx-bar-lbl" style={{ width: 56, textAlign: "center" }}>result 0</div>
                  <div className="qx-bar-lbl" style={{ width: 56, textAlign: "center" }}>result 1</div>
                </div>
                <div className="qx-shot-count">{NUM_SHOTS} shots &mdash; {result.count0} zeros, {result.count1} ones</div>
              </>
            ) : (
              <div className="qx-histo-empty">Press &ldquo;Run {NUM_SHOTS} shots&rdquo; to see results</div>
            )}
          </div>
        </div>

        {/* === PROSE === */}
        <h2 className="qx-h2">Reading a circuit</h2>
        <p className="qx-p">
          A <b>circuit</b> is a complete description of what a quantum computer
          does. It names the qubit's starting state, lists the gates applied in
          order, and ends with a measurement. The diagram above is the standard
          way to draw one: the qubit's history runs along a horizontal wire, left
          to right. Gates appear as boxes on the wire. The M box at the right end
          is the measurement.
        </p>
        <p className="qx-p">
          Think of it like a musical score. A single qubit is one instrument: one
          horizontal line. The gates are the notes written on it, ordered in time
          from left to right. Empty space on the wire means the qubit is being
          carried forward unchanged. The circuit is the score; running it is the
          performance.
        </p>
        <p className="qx-p">
          Reading left to right: the qubit enters as |0&#10217; = (1, 0). Each
          gate transforms the pair of numbers in sequence. The measurement at the
          end draws a single bit from whatever state the qubit has reached.
        </p>

        <h2 className="qx-h2">Running the circuit many times</h2>
        <p className="qx-p">
          Gates are deterministic. The same circuit run twice produces exactly the
          same pair of amplitudes before measurement. What the histogram shows is
          not variation in the gates &mdash; it is the probabilistic nature of
          measurement. Each run is one shot: the gates are applied, the qubit is
          measured, and the result is recorded. The circuit is then reset and run
          again from |0&#10217;.
        </p>
        <p className="qx-p">
          This is the same process as module one. A distribution is a set of
          hidden numbers, and sampling many times produces an estimate. Here the
          hidden numbers are the squared amplitudes. The histogram is the estimate.
          More shots bring it closer to the true distribution.
        </p>
        <p className="qx-p">
          The "state before measurement" readout above the histogram shows the
          exact amplitudes the circuit produces. That is the truth; the histogram
          is the estimate you would be left with if you could not calculate the
          amplitudes directly.
        </p>

        <h2 className="qx-h2">Some circuits to try</h2>
        <p className="qx-p">
          With no gates, the circuit measures |0&#10217; every time: result 0 is
          certain. A single H gives 50/50. H then H gives near-certain result 0,
          by the interference mechanism from module seven. H then X then H: work
          out the amplitudes step by step before running it and see if the
          histogram matches your calculation.
        </p>
        <p className="qx-p">
          The rotation gate gives more control. R +90&deg; from |0&#10217; reaches
          the same state as H: the amplitudes are both 0.7071. R +180&deg; reaches
          (0, 1) = |1&#10217;, certain result 1. R +45&deg; followed by R +45&deg;
          is the same as R +90&deg;. Rotations compose by addition.
        </p>

        <div className="qx-aside">
          <p>
            On a real quantum computer a circuit is compiled into a sequence of
            hardware pulses before being sent to the device. The circuit notation
            describes the logical intent; the hardware implementation depends on the
            physical qubit technology. The notation used here is the standard one,
            and the same diagram would be accepted by any major quantum computing
            platform.
          </p>
        </div>

        <Quiz questions={QUIZ_QUESTIONS} />

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: controlled operations. A gate that only fires when a second qubit
          says so.
        </p>
      </div>
    </div>
  );
}
