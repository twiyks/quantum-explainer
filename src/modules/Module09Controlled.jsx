import React, { useState } from "react";
import Quiz from "../components/Quiz.jsx";

/*
  Quantum explainer, module 9: controlled operations.
  One idea: a gate that only fires when a second qubit says so.
  The CNOT gate. Two-qubit state space, four-bar histogram.

  Terms defined here: controlled operation (CNOT specifically).
  Terms deliberately absent: entanglement (11), phase (11).
  Forward reference: the correlated state (H + CNOT) is named in module 11.
*/

const INV_SQRT2 = 1 / Math.sqrt(2);

// Two-qubit state: {a00, a01, a10, a11}
// First index = control qubit result, second index = target qubit result.
// |00⟩ = both give 0, |01⟩ = control 0 target 1, |10⟩ = control 1 target 0, |11⟩ = both give 1.

const STATE_00 = { a00: 1, a01: 0, a10: 0, a11: 0 };

function prepControl(choice, state) {
  // choice: "0" | "1" | "H"
  // Applied to fresh |00⟩ state (so state is always STATE_00 here, but write generally)
  if (choice === "1") {
    // X on control: swap (a00,a01) ↔ (a10,a11)
    return { a00: state.a10, a01: state.a11, a10: state.a00, a11: state.a01 };
  }
  if (choice === "H") {
    // H on control
    const s = INV_SQRT2;
    return {
      a00: (state.a00 + state.a10) * s,
      a01: (state.a01 + state.a11) * s,
      a10: (state.a00 - state.a10) * s,
      a11: (state.a01 - state.a11) * s,
    };
  }
  return state; // "0" = leave as is
}

function prepTarget(choice, state) {
  // choice: "0" | "1"
  if (choice === "1") {
    // X on target: swap (a00,a10) ↔ (a01,a11)
    return { a00: state.a01, a01: state.a00, a10: state.a11, a11: state.a10 };
  }
  return state;
}

function applyCNOT(state) {
  // CNOT: if control=1, flip target.
  // |00⟩→|00⟩, |01⟩→|01⟩, |10⟩→|11⟩, |11⟩→|10⟩
  return { a00: state.a00, a01: state.a01, a10: state.a11, a11: state.a10 };
}

function tidy(v) { return Math.abs(v) < 1e-10 ? 0 : v; }

function computeState(ctrlPrep, tgtPrep, cnotOn) {
  let s = STATE_00;
  s = prepControl(ctrlPrep, s);
  s = prepTarget(tgtPrep, s);
  if (cnotOn) s = applyCNOT(s);
  return { a00: tidy(s.a00), a01: tidy(s.a01), a10: tidy(s.a10), a11: tidy(s.a11) };
}

function runShots(ctrlPrep, tgtPrep, cnotOn, n) {
  const s = computeState(ctrlPrep, tgtPrep, cnotOn);
  const p00 = s.a00 * s.a00;
  const p01 = s.a01 * s.a01;
  const p10 = s.a10 * s.a10;
  // p11 = 1 - p00 - p01 - p10 (but compute directly)
  const p11 = s.a11 * s.a11;
  let c00 = 0, c01 = 0, c10 = 0, c11 = 0;
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    if (r < p00) c00++;
    else if (r < p00 + p01) c01++;
    else if (r < p00 + p01 + p10) c10++;
    else c11++;
  }
  return { c00, c01, c10, c11, s };
}

function fmtPct(v) {
  const p = v * v * 100;
  if (p < 0.005) return "0%";
  if (p > 99.995) return "100%";
  return p.toFixed(1) + "%";
}

const NUM_SHOTS = 500;
const BAR_MAX_H = 96;

const QUIZ_QUESTIONS = [
  {
    q: "CNOT is applied with the control qubit in state |0\u27E9 and the target qubit in state |1\u27E9. What is the output?",
    options: [
      "|00\u27E9 \u2014 CNOT always resets the target to 0",
      "|01\u27E9 \u2014 control is 0 so nothing happens to the target",
      "|10\u27E9 \u2014 CNOT moves the 1 from target to control",
      "|11\u27E9 \u2014 CNOT flips both qubits"
    ],
    answer: 1,
    feedback: [
      "CNOT only fires when the control is |1\u27E9. Here the control is |0\u27E9, so the target is left exactly as it was.",
      "Correct. The rule is: if control = |1\u27E9, flip the target; if control = |0\u27E9, do nothing. Control is |0\u27E9 here, so the target stays at |1\u27E9. Output: |01\u27E9.",
      "CNOT does not transfer the value from one qubit to the other. It uses the control to decide whether to flip the target.",
      "CNOT only flips the target, never the control. And it only does that when the control is |1\u27E9."
    ]
  },
  {
    q: "Control qubit is prepared with H (even superposition), target stays at |0\u27E9, then CNOT is applied. The histogram shows |00\u27E9 and |11\u27E9 but never |01\u27E9 or |10\u27E9. Why are |01\u27E9 and |10\u27E9 absent?",
    options: [
      "H and CNOT together always produce the most extreme outcomes",
      "When the control gives 0 on measurement, CNOT left the target at 0, giving |00\u27E9. When the control gives 1, CNOT flipped the target to 1, giving |11\u27E9. There is no path that produces a mismatch.",
      "The target qubit copies the control qubit\u2019s value, so they always end up equal",
      "|01\u27E9 and |10\u27E9 require a different gate \u2014 CNOT can only produce matching pairs"
    ],
    answer: 1,
    feedback: [
      "There is no general rule that gates produce extreme outcomes. The absence of |01\u27E9 and |10\u27E9 follows specifically from how CNOT links the two qubits here.",
      "Correct. CNOT fires or doesn\u2019t fire based on the control, and that links the results. If control = 0, target stays 0: gives |00\u27E9. If control = 1, target is flipped to 1: gives |11\u27E9. Neither path ends with control and target disagreeing.",
      "The target does not \u2018copy\u2019 the control. It is flipped when control = 1 and untouched when control = 0. Starting from target = |0\u27E9, that produces 0 when control is 0 and 1 when control is 1 \u2014 which happens to match here, but the mechanism is conditional flipping, not copying.",
      "CNOT can produce all four outcomes depending on preparation. If the control starts at |1\u27E9 and the target is prepared with H, CNOT will produce |10\u27E9 and |11\u27E9."
    ]
  },
  {
    q: "A one-qubit circuit produces a histogram with two bars. A two-qubit circuit produces a histogram with four bars. How many bars would a three-qubit circuit\u2019s histogram have?",
    options: [
      "Six \u2014 two more per extra qubit",
      "Nine \u2014 three qubits, three bars each",
      "Eight \u2014 three bits give eight possible values (000, 001, 010, 011, 100, 101, 110, 111)",
      "Four \u2014 the number of bars does not change after two qubits"
    ],
    answer: 2,
    feedback: [
      "Each qubit doubles the number of possible outcomes, not adds two. One qubit: 2 outcomes. Two qubits: 4. Three qubits: 8.",
      "The outcomes are combinations of all qubits, not separate bars per qubit. Three bits can form 2\u00B3 = 8 distinct patterns.",
      "Correct. Each additional qubit doubles the number of possible outcomes. One qubit: 2\u00B9 = 2. Two qubits: 2\u00B2 = 4. Three qubits: 2\u00B3 = 8. The number of amplitudes grows the same way.",
      "Every qubit doubles the count. Two qubits give 4 bars; three qubits give 8."
    ]
  }
];

export default function ModuleNineControlled() {
  const [ctrlPrep, setCtrlPrep] = useState("0"); // "0" | "1" | "H"
  const [tgtPrep, setTgtPrep] = useState("0");   // "0" | "1"
  const [cnotOn, setCnotOn] = useState(false);
  const [result, setResult] = useState(null);

  const currentState = computeState(ctrlPrep, tgtPrep, cnotOn);
  const { a00, a01, a10, a11 } = currentState;

  function handleRun() {
    setResult(runShots(ctrlPrep, tgtPrep, cnotOn, NUM_SHOTS));
  }

  function handleChange(setter) {
    return (val) => {
      setter(val);
      setResult(null);
    };
  }

  const bars = result
    ? [
        { label: "|00\u27E9", count: result.c00, cls: "r00" },
        { label: "|01\u27E9", count: result.c01, cls: "r01" },
        { label: "|10\u27E9", count: result.c10, cls: "r10" },
        { label: "|11\u27E9", count: result.c11, cls: "r11" },
      ]
    : [];

  const maxCount = result ? Math.max(result.c00, result.c01, result.c10, result.c11, 1) : 1;

  // Exact percentages for the truth readout (no random sampling)
  const exact = [
    { label: "|00\u27E9", pct: (a00 * a00 * 100).toFixed(1) },
    { label: "|01\u27E9", pct: (a01 * a01 * 100).toFixed(1) },
    { label: "|10\u27E9", pct: (a10 * a10 * 100).toFixed(1) },
    { label: "|11\u27E9", pct: (a11 * a11 * 100).toFixed(1) },
  ];

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
          letter-spacing: -0.012em; margin: 0 0 24px; max-width: 20ch;
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
          text-transform: uppercase; color: var(--muted); margin: 0 0 10px;
        }
        .qx-divider { border: none; border-top: 1px solid var(--rule); margin: 16px 0; }

        /* Circuit diagram */
        .qx-circuit {
          display: grid;
          grid-template-columns: auto 1fr auto auto 1fr auto;
          row-gap: 0; column-gap: 0;
          align-items: center;
          margin: 0 0 18px;
        }
        .qx-wire-label {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 13px; font-weight: 500; color: var(--muted);
          padding-right: 6px; white-space: nowrap;
        }
        .qx-wire-line {
          height: 2px; background: var(--rule);
        }
        .qx-circ-gate {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 13px; font-weight: 600;
          width: 40px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 2px; flex-shrink: 0; position: relative; z-index: 1;
        }
        .qx-circ-gate.filled { background: var(--data); color: #FFF; border: 1px solid var(--data); }
        .qx-circ-gate.empty { background: transparent; border: 1.5px dashed var(--rule); color: var(--rule); }
        .qx-circ-gate.measure { background: transparent; border: 1.5px solid var(--accent); color: var(--accent); }
        .qx-circ-gate.cnot-ctrl {
          background: var(--data); color: #FFF; border: 1px solid var(--data);
          border-radius: 50%; width: 14px; height: 14px; font-size: 0;
        }
        .qx-circ-gate.cnot-tgt {
          border: 2px solid var(--data); border-radius: 50%;
          width: 28px; height: 28px; font-size: 16px; color: var(--data);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
        }
        .qx-cnot-col {
          display: flex; flex-direction: column; align-items: center;
          position: relative; flex-shrink: 0; width: 40px;
        }
        .qx-cnot-col .wire-h {
          width: 100%; height: 2px; background: var(--rule);
        }
        .qx-cnot-col .vert-line {
          width: 2px; background: var(--data);
          position: absolute; top: 50%; left: 50%; transform: translateX(-50%);
        }
        .qx-cnot-inactive {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 11px; color: var(--rule); font-weight: 400;
          width: 40px; text-align: center;
        }

        /* Controls */
        .qx-prep-row {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .qx-prep-lbl {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 13px; font-weight: 500; color: var(--muted);
          min-width: 90px; flex-shrink: 0;
        }
        .qx-btn-group { display: flex; gap: 4px; }

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
        .qx-btn.active { background: var(--data); border-color: var(--data); color: #FFFFFF; }
        .qx-btn.sm { font-size: 13px; padding: 6px 11px; }
        .qx-btn.toggle-on { background: #2A6B3A; border-color: #2A6B3A; color: #FFF; }
        .qx-btn.toggle-on:hover { background: #1e5029; }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

        /* Truth table */
        .qx-truth {
          display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 16px;
        }
        .qx-truth-cell {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 13px; background: #FFFFFF; border: 1px solid var(--rule);
          border-radius: 2px; padding: 5px 10px; text-align: center;
          min-width: 52px;
        }
        .qx-truth-cell .ket { color: var(--muted); font-size: 12px; }
        .qx-truth-cell .pct { font-weight: 600; color: var(--data); font-size: 14px; margin-top: 1px; }
        .qx-truth-cell .pct.zero { color: var(--rule); font-weight: 400; }

        /* Histogram */
        .qx-histo-wrap {
          background: var(--plot); border: 1px solid var(--rule);
          border-radius: 2px; padding: 16px 16px 10px;
        }
        .qx-histo { display: flex; gap: 12px; align-items: flex-end; height: 126px; }
        .qx-bar-col { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
        .qx-bar-pct {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 12px; font-weight: 600; color: var(--ink); min-height: 16px;
        }
        .qx-bar { width: 100%; max-width: 52px; border-radius: 1px 1px 0 0; }
        .qx-bar.r00 { background: var(--data); }
        .qx-bar.r01 { background: #3D6E91; }
        .qx-bar.r10 { background: var(--data-soft); }
        .qx-bar.r11 { background: #7A9BB0; }
        .qx-bar-lbl {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 12px; color: var(--muted); margin-top: 4px; text-align: center;
        }
        .qx-histo-empty {
          display: flex; align-items: center; justify-content: center;
          height: 126px; color: var(--muted);
          font-family: 'IBM Plex Sans', -apple-system, sans-serif; font-size: 14px;
        }
        .qx-shot-count {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 12px; color: var(--muted); text-align: right; margin-top: 8px;
        }

        /* CNOT table */
        .qx-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 14px; }
        .qx-table th {
          text-align: left; font-weight: 600; color: var(--muted);
          padding: 5px 8px 5px 0; border-bottom: 1px solid var(--rule); font-size: 13px;
        }
        .qx-table td { padding: 6px 8px 6px 0; border-bottom: 1px solid #E4E8EB; }
        .qx-table tr:last-child td { border-bottom: none; }
        .qx-table .note { color: var(--muted); font-size: 12.5px; }
        .qx-table .fired { color: #1A4A28; font-weight: 600; }
        .qx-table .silent { color: var(--muted); }

        .qx-aside {
          border-left: 2px solid var(--rule); padding: 2px 0 2px 18px;
          margin: 30px 0; max-width: 60ch;
        }
        .qx-aside p { font-size: 16px; line-height: 1.6; color: var(--muted); margin: 0 0 10px; }
        .qx-aside p:last-child { margin-bottom: 0; }

        .qx-rule { border: none; border-top: 1px solid var(--rule); margin: 40px 0 0; }
        .qx-footer { font-size: 15px; color: var(--muted); margin: 18px 0 0; }

        @media (max-width: 560px) {
          .qx-h1 { font-size: 31px; }
          .qx-p { font-size: 17px; }
          .qx-panel { padding: 16px 14px 14px; }
        }
      `}</style>

      <div className="qx-wrap">
        <p className="qx-eyebrow qx-sans">Module nine of twelve</p>
        <h1 className="qx-h1">Controlled operations</h1>

        <p className="qx-p lead">
          Every gate so far has acted on a single qubit regardless of anything else.
          A <b>controlled operation</b> is different: it checks the state of one
          qubit and only applies a gate to a second qubit if the first is |1&#10217;.
        </p>
        <p className="qx-p">
          Below are two qubits. The top wire is the control; the bottom is the
          target. Prepare each qubit, toggle the CNOT gate on or off, and run
          to see the four-bar histogram.
        </p>

        {/* === INTERACTIVE PANEL === */}
        <div className="qx-panel">

          {/* Circuit diagram */}
          <p className="qx-panel-label qx-sans">Circuit</p>
          <CircuitDiagram ctrlPrep={ctrlPrep} tgtPrep={tgtPrep} cnotOn={cnotOn} />

          <div className="qx-divider" />

          {/* Controls */}
          <div className="qx-prep-row qx-sans">
            <span className="qx-prep-lbl">Control qubit</span>
            <div className="qx-btn-group">
              {["0", "H", "1"].map((v) => (
                <button
                  key={v}
                  className={`qx-btn sm${ctrlPrep === v ? " active" : ""}`}
                  onClick={() => { handleChange(setCtrlPrep)(v); }}
                >
                  {v === "0" ? "|0\u27E9" : v === "1" ? "|1\u27E9" : "H"}
                </button>
              ))}
            </div>
          </div>

          <div className="qx-prep-row qx-sans">
            <span className="qx-prep-lbl">Target qubit</span>
            <div className="qx-btn-group">
              {["0", "1"].map((v) => (
                <button
                  key={v}
                  className={`qx-btn sm${tgtPrep === v ? " active" : ""}`}
                  onClick={() => { handleChange(setTgtPrep)(v); }}
                >
                  {v === "0" ? "|0\u27E9" : "|1\u27E9"}
                </button>
              ))}
            </div>
          </div>

          <div className="qx-prep-row qx-sans">
            <span className="qx-prep-lbl">CNOT gate</span>
            <button
              className={`qx-btn sm${cnotOn ? " toggle-on" : ""}`}
              onClick={() => { handleChange(setCnotOn)(!cnotOn); }}
            >
              {cnotOn ? "On \u2014 click to remove" : "Off \u2014 click to add"}
            </button>
          </div>

          <div className="qx-divider" />

          {/* Exact distribution */}
          <p className="qx-panel-label qx-sans">True distribution (calculated)</p>
          <div className="qx-truth qx-sans">
            {exact.map(({ label, pct }) => (
              <div key={label} className="qx-truth-cell">
                <div className="ket">{label}</div>
                <div className={`pct${pct === "0.0" ? " zero" : ""}`}>{pct}%</div>
              </div>
            ))}
          </div>

          {/* Run */}
          <div className="qx-controls" style={{ marginBottom: 16 }}>
            <button className="qx-btn accent" onClick={handleRun}>
              Run {NUM_SHOTS} shots
            </button>
          </div>

          {/* Histogram */}
          <div className="qx-histo-wrap">
            {result ? (
              <>
                <div className="qx-histo">
                  {bars.map(({ label, count, cls }) => {
                    const h = Math.max((count / maxCount) * BAR_MAX_H, count > 0 ? 2 : 0);
                    const pctStr = (count / NUM_SHOTS * 100).toFixed(1) + "%";
                    return (
                      <div key={label} className="qx-bar-col">
                        <div className="qx-bar-pct">{count > 0 ? pctStr : ""}</div>
                        <div className={`qx-bar ${cls}`} style={{ height: h }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  {bars.map(({ label }) => (
                    <div key={label} className="qx-bar-lbl" style={{ flex: 1 }}>{label}</div>
                  ))}
                </div>
                <div className="qx-shot-count">
                  {NUM_SHOTS} shots &mdash; {result.c00} &middot; {result.c01} &middot; {result.c10} &middot; {result.c11}
                </div>
              </>
            ) : (
              <div className="qx-histo-empty">Press &ldquo;Run {NUM_SHOTS} shots&rdquo; to see results</div>
            )}
          </div>
        </div>

        {/* === PROSE === */}
        <h2 className="qx-h2">The CNOT gate</h2>
        <p className="qx-p">
          CNOT stands for controlled-NOT. The NOT here is the X gate from module
          six: it swaps the two amplitudes, flipping |0&#10217; to |1&#10217; and
          vice versa. The "controlled" part means this only happens when the control
          qubit is |1&#10217;. When the control is |0&#10217;, the target is left
          exactly as it was.
        </p>

        <table className="qx-table qx-sans">
          <thead>
            <tr>
              <th>Control in</th>
              <th>Target in</th>
              <th>Control out</th>
              <th>Target out</th>
              <th style={{ color: "#5C6872", fontWeight: 400 }}>Gate fires?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>|0&#10217;</td><td>|0&#10217;</td><td>|0&#10217;</td><td>|0&#10217;</td>
              <td className="silent">no</td>
            </tr>
            <tr>
              <td>|0&#10217;</td><td>|1&#10217;</td><td>|0&#10217;</td><td>|1&#10217;</td>
              <td className="silent">no</td>
            </tr>
            <tr>
              <td>|1&#10217;</td><td>|0&#10217;</td><td>|1&#10217;</td><td>|1&#10217;</td>
              <td className="fired">yes &mdash; target flipped</td>
            </tr>
            <tr>
              <td>|1&#10217;</td><td>|1&#10217;</td><td>|1&#10217;</td><td>|0&#10217;</td>
              <td className="fired">yes &mdash; target flipped</td>
            </tr>
          </tbody>
        </table>

        <p className="qx-p">
          The control qubit is never altered. CNOT reads it but does not touch it.
          Only the target changes, and only when the control is |1&#10217;.
        </p>

        <h2 className="qx-h2">Two qubits, four outcomes</h2>
        <p className="qx-p">
          One qubit has two possible results: 0 or 1. Two qubits have four: both
          give 0 (|00&#10217;), first gives 0 and second gives 1 (|01&#10217;),
          first gives 1 and second gives 0 (|10&#10217;), or both give 1
          (|11&#10217;). The first symbol is the control result, the second is the
          target result.
        </p>
        <p className="qx-p">
          The full two-qubit state has four amplitudes, one for each outcome.
          The squares of all four add to 1. The histogram now needs four bars.
        </p>

        <h2 className="qx-h2">What the toggle reveals</h2>
        <p className="qx-p">
          With control at |0&#10217; and CNOT on: nothing changes. The gate
          never fires. The histogram is the same as without CNOT.
        </p>
        <p className="qx-p">
          With control at |1&#10217; and CNOT on: the gate always fires, flipping
          the target on every shot. The bar shifts from |10&#10217; to |11&#10217;
          (or from |11&#10217; to |10&#10217;, depending on the target preparation).
        </p>
        <p className="qx-p">
          The interesting case is control prepared with H, target at |0&#10217;,
          CNOT on. The histogram shows only |00&#10217; and |11&#10217;. The two
          qubits always agree. When the control gives 0, CNOT did not fire and the
          target stayed 0. When the control gives 1, CNOT fired and the target was
          flipped to 1. There is no shot where they disagree.
        </p>
        <p className="qx-p">
          This pairing is the first example of something that has no classical
          equivalent. Module eleven will name it and explain what it means for
          pairs of qubits.
        </p>

        <div className="qx-aside">
          <p>
            CNOT is the two-qubit gate that appears in almost every quantum
            algorithm. Along with single-qubit gates, it is enough to build any
            circuit whatsoever. The quantum walk in the next module uses exactly
            this mechanism: a coin qubit controls whether a position qubit steps
            forward or back.
          </p>
        </div>

        <Quiz questions={QUIZ_QUESTIONS} />

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: the quantum walk. Module two's stepping line, with the coin swapped
          for a qubit.
        </p>
      </div>
    </div>
  );
}

/* ---- Circuit diagram component ---- */
function CircuitDiagram({ ctrlPrep, tgtPrep, cnotOn }) {
  const ctrlLabel = ctrlPrep === "H" ? "H" : ctrlPrep === "1" ? "X" : null;
  const tgtLabel = tgtPrep === "1" ? "X" : null;

  // Heights for the two wires; CNOT column spans between them
  // We lay it out as an SVG to handle the vertical line cleanly
  const W = 320, PAD = 12;
  const cy = 28;   // control wire y
  const ty = 68;   // target wire y
  const h = 96;
  const gateW = 28, gateH = 22;

  // x positions
  const x0 = PAD;          // "|0⟩" labels right edge ~x0+30
  const labelW = 36;
  const xGate1 = x0 + labelW + 16; // prep gate column
  const xCnot = xGate1 + gateW + 20;
  const xM = xCnot + 34 + 16;
  const totalW = xM + gateW + PAD;

  const gateBox = (x, y, label, filled) => {
    if (!label) return (
      <line key={`wire-${x}-${y}`} x1={x} x2={x + gateW} y1={y} y2={y} stroke="#C6CCD2" strokeWidth="2" />
    );
    return (
      <g key={`gate-${x}-${y}`}>
        <rect x={x} y={y - gateH / 2} width={gateW} height={gateH} rx="2"
          fill={filled ? "#2A4C6B" : "white"} stroke="#2A4C6B" strokeWidth="1.5" />
        <text x={x + gateW / 2} y={y + 4.5} textAnchor="middle"
          fontFamily="IBM Plex Sans, sans-serif" fontSize="12" fontWeight="600"
          fill={filled ? "white" : "#2A4C6B"}>
          {label}
        </text>
      </g>
    );
  };

  const measureBox = (x, y) => (
    <g key={`m-${x}-${y}`}>
      <rect x={x} y={y - gateH / 2} width={gateW} height={gateH} rx="2"
        fill="none" stroke="#8A4262" strokeWidth="1.5" />
      <text x={x + gateW / 2} y={y + 4.5} textAnchor="middle"
        fontFamily="IBM Plex Sans, sans-serif" fontSize="11" fontWeight="600"
        fill="#8A4262">M</text>
    </g>
  );

  return (
    <svg viewBox={`0 0 ${totalW} ${h}`} style={{ width: "100%", maxWidth: totalW, height: "auto", display: "block", marginBottom: 8 }} aria-hidden="true">
      {/* Wire lines */}
      <line x1={x0 + labelW} x2={totalW - PAD} y1={cy} y2={cy} stroke="#C6CCD2" strokeWidth="2" />
      <line x1={x0 + labelW} x2={totalW - PAD} y1={ty} y2={ty} stroke="#C6CCD2" strokeWidth="2" />

      {/* Labels */}
      <text x={x0} y={cy + 4.5} fontFamily="IBM Plex Sans, sans-serif" fontSize="12" fontWeight="500" fill="#5C6872">|0&#10217;</text>
      <text x={x0} y={ty + 4.5} fontFamily="IBM Plex Sans, sans-serif" fontSize="12" fontWeight="500" fill="#5C6872">|0&#10217;</text>
      <text x={x0 + 2} y={cy - 9} fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#5C6872">control</text>
      <text x={x0 + 2} y={ty - 9} fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#5C6872">target</text>

      {/* Prep gates */}
      {gateBox(xGate1, cy, ctrlLabel, true)}
      {gateBox(xGate1, ty, tgtLabel, true)}

      {/* CNOT column */}
      {cnotOn ? (
        <g>
          {/* Vertical line */}
          <line x1={xCnot + 14} x2={xCnot + 14} y1={cy} y2={ty} stroke="#2A4C6B" strokeWidth="2" />
          {/* Control dot */}
          <circle cx={xCnot + 14} cy={cy} r="5" fill="#2A4C6B" />
          {/* Target circle (⊕) */}
          <circle cx={xCnot + 14} cy={ty} r="10" fill="white" stroke="#2A4C6B" strokeWidth="2" />
          <line x1={xCnot + 4} x2={xCnot + 24} y1={ty} y2={ty} stroke="#2A4C6B" strokeWidth="1.5" />
          <line x1={xCnot + 14} x2={xCnot + 14} y1={ty - 10} y2={ty + 10} stroke="#2A4C6B" strokeWidth="1.5" />
        </g>
      ) : (
        <g>
          <line x1={xCnot} x2={xCnot + 28} y1={cy} y2={cy} stroke="#C6CCD2" strokeWidth="2" />
          <line x1={xCnot} x2={xCnot + 28} y1={ty} y2={ty} stroke="#C6CCD2" strokeWidth="2" />
          <text x={xCnot + 14} y={(cy + ty) / 2 + 4} textAnchor="middle"
            fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#C6CCD2">
            no CNOT
          </text>
        </g>
      )}

      {/* Measure boxes */}
      {measureBox(xM, cy)}
      {measureBox(xM, ty)}
    </svg>
  );
}
