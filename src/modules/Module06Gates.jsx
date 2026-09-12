import React, { useState } from "react";
import Quiz from "../components/Quiz.jsx";

/*
  Quantum explainer, module 6: gates as rotations.
  One idea: a gate is a reversible geometric transformation of the state circle.
  Every gate can be undone.

  Terms fully treated here: gate (introduced in module 5).
  Terms deliberately absent: superposition (7), interference (7), circuit (8).
*/

const INV_SQRT2 = 1 / Math.sqrt(2);
const D2R = Math.PI / 180;

function applyRotation(s, deg) {
  const t = deg * D2R;
  const c = Math.cos(t), si = Math.sin(t);
  return {
    amp0: s.amp0 * c - s.amp1 * si,
    amp1: s.amp0 * si + s.amp1 * c,
  };
}

function applyX(s) {
  return { amp0: s.amp1, amp1: s.amp0 };
}

function applyH(s) {
  return {
    amp0: (s.amp0 + s.amp1) * INV_SQRT2,
    amp1: (s.amp0 - s.amp1) * INV_SQRT2,
  };
}

function tidy(v) {
  return Math.abs(v) < 1e-10 ? 0 : v;
}

function tidyState(s) {
  return { amp0: tidy(s.amp0), amp1: tidy(s.amp1) };
}

function fmt(v) {
  if (Math.abs(v) < 1e-10) return "0.0000";
  return (v < 0 ? "\u2212" : "") + Math.abs(v).toFixed(4);
}

const INIT = { amp0: 1, amp1: 0 }; // |0⟩
const CC = { w: 220, cx: 110, cy: 110, r: 80 };

const ROT_PRESETS = [
  { label: "\u221290\u00B0", val: -90 },
  { label: "\u221245\u00B0", val: -45 },
  { label: "+45\u00B0", val: 45 },
  { label: "+90\u00B0", val: 90 },
  { label: "+180\u00B0", val: 180 },
];

function StateCircle({ state, rotPreview }) {
  const { amp0, amp1 } = state;
  const px = CC.cx + CC.r * amp0;
  const py = CC.cy - CC.r * amp1;

  let arcD = null;
  let gx = null, gy = null;

  if (
    rotPreview &&
    (Math.abs(rotPreview.amp0 - amp0) > 0.001 ||
      Math.abs(rotPreview.amp1 - amp1) > 0.001)
  ) {
    const ppx = CC.cx + CC.r * rotPreview.amp0;
    const ppy = CC.cy - CC.r * rotPreview.amp1;
    const phi0 = Math.atan2(amp1, amp0);
    const phi1 = Math.atan2(rotPreview.amp1, rotPreview.amp0);
    let dPhi = phi1 - phi0;
    while (dPhi > Math.PI) dPhi -= 2 * Math.PI;
    while (dPhi < -Math.PI) dPhi += 2 * Math.PI;
    const largeArc = Math.abs(dPhi) > Math.PI ? 1 : 0;
    const sweep = dPhi < 0 ? 1 : 0;
    arcD = `M ${px.toFixed(1)} ${py.toFixed(1)} A ${CC.r} ${CC.r} 0 ${largeArc} ${sweep} ${ppx.toFixed(1)} ${ppy.toFixed(1)}`;
    gx = ppx; gy = ppy;
  }

  return (
    <svg
      viewBox={`0 0 ${CC.w} ${CC.w}`}
      style={{ display: "block", width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      <circle cx={CC.cx} cy={CC.cy} r={CC.r} fill="none" stroke="#C6CCD2" strokeWidth="1" />
      <line x1={CC.cx - CC.r - 10} x2={CC.cx + CC.r + 10} y1={CC.cy} y2={CC.cy} stroke="#D5DBE0" strokeWidth="1" />
      <line x1={CC.cx} x2={CC.cx} y1={CC.cy - CC.r - 10} y2={CC.cy + CC.r + 10} stroke="#D5DBE0" strokeWidth="1" />

      {/* Arms */}
      <line x1={CC.cx} x2={px} y1={CC.cy} y2={CC.cy} stroke="#2A4C6B" strokeWidth="2.5" />
      <line x1={px} x2={px} y1={CC.cy} y2={py} stroke="#93A8B8" strokeWidth="2.5" />

      {/* Rotation preview arc */}
      {arcD && (
        <path d={arcD} fill="none" stroke="#8A4262" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      )}
      {gx !== null && (
        <circle cx={gx} cy={gy} r="5" fill="none" stroke="#8A4262" strokeWidth="1.5" opacity="0.5" />
      )}

      {/* Current state */}
      <circle cx={px} cy={py} r="5.5" fill="#8A4262" />

      {/* State labels */}
      <text x={CC.cx + CC.r + 5} y={CC.cy + 12} fontSize="9" fill="#5C6872"
        fontFamily="IBM Plex Sans, sans-serif">|0&#10217;</text>
      <text x={CC.cx + 4} y={CC.cy - CC.r - 4} fontSize="9" fill="#5C6872"
        fontFamily="IBM Plex Sans, sans-serif">|1&#10217;</text>

      {/* Axis value labels */}
      <text x={CC.cx + CC.r + 4} y={CC.cy - 2} fontSize="8" fill="#C6CCD2"
        fontFamily="IBM Plex Sans, sans-serif">1</text>
      <text x={CC.cx - CC.r - 4} y={CC.cy + 11} textAnchor="end" fontSize="8" fill="#C6CCD2"
        fontFamily="IBM Plex Sans, sans-serif">{"\u22121"}</text>
      <text x={CC.cx - 4} y={CC.cy + CC.r + 12} textAnchor="end" fontSize="8" fill="#C6CCD2"
        fontFamily="IBM Plex Sans, sans-serif">{"\u22121"}</text>
    </svg>
  );
}

const QUIZ_QUESTIONS = [
  {
    q: "The X gate is applied to state (0.6000, 0.8000). What is the resulting state?",
    options: [
      "(0.6000, \u22120.8000) \u2014 X negates the second amplitude",
      "(0.8000, 0.6000) \u2014 X swaps the two amplitudes",
      "(\u22120.8000, \u22120.6000) \u2014 X negates both amplitudes",
      "(0.0000, 1.0000) \u2014 X always sends the state to |1\u27E9"
    ],
    answer: 1,
    feedback: [
      "X swaps, not negates. The second amplitude moves to the first slot and the first to the second.",
      "Correct. The X rule is (a, b) \u2192 (b, a). Both numbers keep their values; they just swap positions.",
      "X does not alter the sign of either number. It only moves them to opposite slots.",
      "X maps |0\u27E9 to |1\u27E9 specifically because |0\u27E9 = (1, 0), and swapping gives (0, 1) = |1\u27E9. For any other starting state, X produces a different result."
    ]
  },
  {
    q: "A classical AND gate cannot be reversed. Why not?",
    options: [
      "Classical gates consume too much energy to be run backwards",
      "An output of 0 could have come from inputs (0,0), (0,1), or (1,0) \u2014 the original pair cannot be recovered",
      "Classical computers are not built with the hardware to run gates in reverse",
      "AND can be reversed in principle \u2014 it simply requires a quantum computer to do so"
    ],
    answer: 1,
    feedback: [
      "Reversibility is an information question, not an energy one. AND loses information regardless of the hardware.",
      "Correct. AND maps three different input pairs to the same output (0). Given only that output, there is no way to know which pair went in. Information is gone, so the operation cannot be inverted.",
      "This describes a practical limitation, not the real reason. The reason is informational: AND destroys knowledge of its inputs.",
      "No quantum computer can reverse AND either. The information is simply absent from the output. Quantum gates are reversible because they are constructed with that constraint from the start."
    ]
  },
  {
    q: "You apply H to a state, then apply H again. Where does the state end up?",
    options: [
      "Further around the circle \u2014 each H moves it by the same angle",
      "At |0\u27E9 = (1.0000, 0.0000) \u2014 H always resets to the start",
      "Exactly where it started \u2014 H applied twice is the identity",
      "Back at the start only if the original state was |0\u27E9 or |1\u27E9"
    ],
    answer: 2,
    feedback: [
      "H does not add angles. It reflects over a fixed line. A second reflection over the same line undoes the first.",
      "H returns to wherever it started, not to |0\u27E9. Applying H to |1\u27E9 = (0, 1) gives (0.7071, \u22120.7071), not |0\u27E9. Applying H again returns to |1\u27E9.",
      "Correct. H is its own inverse. Applied twice to any state on the circle, it returns exactly to the starting position \u2014 for every state, without exception.",
      "H applied twice is the identity for every state on the circle. There are no special cases."
    ]
  }
];

export default function ModuleSixGates() {
  const [state, setState] = useState(INIT);
  const [history, setHistory] = useState([]);
  const [rotAngle, setRotAngle] = useState(45);

  const rotPreview = applyRotation(state, rotAngle);
  const p0 = state.amp0 * state.amp0;
  const p1 = state.amp1 * state.amp1;

  function applyGate(newState, label) {
    setHistory((h) => [...h.slice(-9), { ...state, label }]);
    setState(tidyState(newState));
  }

  function undo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setState({ amp0: prev.amp0, amp1: prev.amp1 });
    setHistory((h) => h.slice(0, -1));
  }

  function reset() {
    setState(INIT);
    setHistory([]);
    setRotAngle(45);
  }

  const trail = history.map((h) => h.label);
  const canUndo = history.length > 0;

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

        .qx-two-col {
          display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;
        }
        .qx-circle-col { flex: 0 0 180px; min-width: 140px; }
        .qx-controls-col { flex: 1 1 220px; min-width: 200px; display: flex; flex-direction: column; gap: 14px; }

        .qx-num {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: 5px 0; border-bottom: 1px solid #E1E6EA; font-size: 14px;
        }
        .qx-num:last-child { border-bottom: none; }
        .qx-num span:first-child { color: var(--muted); font-size: 13px; }

        .qx-gate-section { display: flex; flex-direction: column; gap: 8px; }
        .qx-gate-section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--muted);
        }

        .qx-rot-row { display: flex; align-items: center; gap: 10px; }
        .qx-rot-val {
          font-size: 20px; font-weight: 400; font-variant-numeric: tabular-nums;
          min-width: 56px; color: var(--data); text-align: right;
        }
        .qx-rot-slider {
          flex: 1; height: 4px; accent-color: var(--data); cursor: pointer;
        }
        .qx-presets { display: flex; flex-wrap: wrap; gap: 5px; }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; }
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
        .qx-btn.sm { font-size: 12.5px; padding: 5px 9px; }

        .qx-divider { border: none; border-top: 1px solid var(--rule); margin: 4px 0; }

        .qx-trail {
          display: flex; flex-wrap: wrap; align-items: center; gap: 3px;
          padding: 12px 0 0; font-size: 12.5px; min-height: 32px;
        }
        .qx-trail-badge {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          background: #FFFFFF; border: 1px solid var(--rule);
          border-radius: 2px; padding: 2px 7px;
          font-size: 12px; color: var(--ink);
        }
        .qx-trail-badge.start { background: transparent; border-color: transparent; color: var(--muted); }
        .qx-trail-badge.now { background: var(--accent); border-color: var(--accent); color: #FFFFFF; }
        .qx-trail-sep { color: var(--rule); font-size: 11px; }

        .qx-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 14px; }
        .qx-table th {
          text-align: left; font-weight: 600; color: var(--muted);
          padding: 5px 8px 5px 0; border-bottom: 1px solid var(--rule); font-size: 13px;
        }
        .qx-table td { padding: 6px 8px 6px 0; border-bottom: 1px solid #E4E8EB; }
        .qx-table tr:last-child td { border-bottom: none; }
        .qx-table .note { color: var(--muted); font-size: 12.5px; }

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
        <p className="qx-eyebrow qx-sans">Module six of twelve</p>
        <h1 className="qx-h1">Gates as rotations</h1>

        <p className="qx-p lead">
          Module five showed the Hadamard doing two specific things to two specific states.
          This module asks what kind of thing it is. The answer is geometry: a gate is a
          transformation of the state circle. It moves the point from one position to
          another by a fixed rule.
        </p>
        <p className="qx-p">
          Three transformations are available below. The rotation gate moves the point by
          a chosen angle — counterclockwise for a positive angle, clockwise for negative.
          The X and H buttons apply their own fixed rules. All three share the property
          that matters most: every one of them can be undone.
        </p>
        <p className="qx-p">
          Try rotating first. Then try applying X twice in a row, or H twice in a row.
          Notice where the state ends up.
        </p>

        {/* === INTERACTIVE PANEL === */}
        <div className="qx-panel">
          <div className="qx-two-col">
            {/* Circle */}
            <div className="qx-circle-col">
              <StateCircle state={state} rotPreview={rotPreview} />
            </div>

            {/* Controls */}
            <div className="qx-controls-col">
              {/* Amplitude readout */}
              <div className="qx-sans">
                <div className="qx-num">
                  <span>number for result 0</span>
                  <span style={{ color: "#2A4C6B", fontWeight: 500 }}>{fmt(state.amp0)}</span>
                </div>
                <div className="qx-num">
                  <span>number for result 1</span>
                  <span style={{ color: "#5C6872", fontWeight: 500 }}>{fmt(state.amp1)}</span>
                </div>
                <div className="qx-num">
                  <span>chance of 0 (squared)</span>
                  <span>{(p0 * 100).toFixed(2)}%</span>
                </div>
                <div className="qx-num">
                  <span>chance of 1 (squared)</span>
                  <span>{(p1 * 100).toFixed(2)}%</span>
                </div>
              </div>

              <hr className="qx-divider" />

              {/* Rotation control */}
              <div className="qx-gate-section">
                <p className="qx-gate-section-label qx-sans">Rotate by</p>
                <div className="qx-rot-row qx-sans">
                  <span className="qx-rot-val">
                    {rotAngle > 0 ? "+" : ""}{rotAngle}&deg;
                  </span>
                  <input
                    type="range"
                    className="qx-rot-slider"
                    min="-180" max="180" step="1"
                    value={rotAngle}
                    onChange={(e) => setRotAngle(Number(e.target.value))}
                    aria-label="Rotation angle"
                  />
                </div>
                <div className="qx-presets">
                  {ROT_PRESETS.map((p) => (
                    <button
                      key={p.val}
                      className="qx-btn sm"
                      onClick={() => setRotAngle(p.val)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div>
                  <button
                    className="qx-btn accent"
                    onClick={() => applyGate(applyRotation(state, rotAngle), `Rotate ${rotAngle > 0 ? "+" : ""}${rotAngle}\u00B0`)}
                  >
                    Apply rotation
                  </button>
                </div>
              </div>

              <hr className="qx-divider" />

              {/* X and H */}
              <div className="qx-gate-section">
                <p className="qx-gate-section-label qx-sans">Preset gates</p>
                <div className="qx-controls">
                  <button className="qx-btn" onClick={() => applyGate(applyX(state), "X")}>
                    Apply X
                  </button>
                  <button className="qx-btn" onClick={() => applyGate(applyH(state), "H")}>
                    Apply H
                  </button>
                </div>
              </div>

              <hr className="qx-divider" />

              {/* Undo and reset */}
              <div className="qx-controls">
                <button className="qx-btn" onClick={undo} disabled={!canUndo}>
                  Undo last
                </button>
                <button className="qx-btn quiet" onClick={reset}>
                  Reset to |0&#10217;
                </button>
              </div>
            </div>
          </div>

          {/* Operation trail */}
          {(trail.length > 0) && (
            <div className="qx-trail qx-sans">
              <span className="qx-trail-badge start">|0&#10217;</span>
              {trail.map((label, i) => (
                <React.Fragment key={i}>
                  <span className="qx-trail-sep">&rarr;</span>
                  <span className="qx-trail-badge">{label}</span>
                </React.Fragment>
              ))}
              <span className="qx-trail-sep">&rarr;</span>
              <span className="qx-trail-badge now">now</span>
            </div>
          )}
        </div>

        {/* === PROSE === */}
        <h2 className="qx-h2">What a gate does</h2>
        <p className="qx-p">
          A gate takes the qubit's two numbers and produces a new pair. The result always
          sits on the circle: the squares still add to 1. This is not incidental. It is the
          defining constraint of a gate. Any operation that moves the state off the circle
          is not a valid quantum gate.
        </p>
        <p className="qx-p">
          The rule is the same regardless of where the state is. Apply the rotation gate to
          |0&#10217; and it moves by your chosen angle. Apply it to any other starting
          point and it moves by the same angle from there. The gate does not adjust based
          on its input; it just applies its transformation to whatever it finds.
        </p>
        <p className="qx-p">
          That is what distinguishes a gate from a measurement. Measurement gives a random
          result. A gate gives an exact, deterministic result. You can calculate in advance
          exactly where the state will end up.
        </p>

        <h2 className="qx-h2">The X gate</h2>
        <p className="qx-p">
          X swaps the two amplitudes. The number for result 0 moves into the result 1 slot,
          and vice versa.
        </p>

        <table className="qx-table qx-sans">
          <thead>
            <tr>
              <th>Input state</th>
              <th>After X</th>
              <th style={{ color: "#5C6872", fontWeight: 400 }}>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>(1.0000, 0.0000)</td>
              <td>(0.0000, 1.0000)</td>
              <td className="note">certain 0 &rarr; certain 1</td>
            </tr>
            <tr>
              <td>(0.0000, 1.0000)</td>
              <td>(1.0000, 0.0000)</td>
              <td className="note">certain 1 &rarr; certain 0</td>
            </tr>
            <tr>
              <td>(0.7071, 0.7071)</td>
              <td>(0.7071, 0.7071)</td>
              <td className="note">even split is unchanged</td>
            </tr>
            <tr>
              <td>(0.6000, 0.8000)</td>
              <td>(0.8000, 0.6000)</td>
              <td className="note">36% and 64% swap</td>
            </tr>
          </tbody>
        </table>

        <p className="qx-p">
          On the circle, X reflects the point across the 45&deg; line. States sitting on
          that line (like the even split) do not move. States anywhere else swap to the
          symmetric position.
        </p>
        <p className="qx-p">
          Apply X twice from any starting position and the state returns exactly to where
          it was. X is its own inverse.
        </p>

        <h2 className="qx-h2">The Hadamard</h2>
        <p className="qx-p">
          The rule is the one from module five: new amplitudes are the old pair added and
          subtracted, each result divided by &radic;2. On the circle, this is a reflection
          across the 22.5&deg; line &mdash; halfway between the |0&#10217; position and
          the even-split position.
        </p>

        <table className="qx-table qx-sans">
          <thead>
            <tr>
              <th>Input state</th>
              <th>After H</th>
              <th style={{ color: "#5C6872", fontWeight: 400 }}>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>(1.0000, 0.0000)</td>
              <td>(0.7071, 0.7071)</td>
              <td className="note">|0&#10217; &rarr; even split</td>
            </tr>
            <tr>
              <td>(0.0000, 1.0000)</td>
              <td>(0.7071, &minus;0.7071)</td>
              <td className="note">|1&#10217; &rarr; negative even split</td>
            </tr>
            <tr>
              <td>(0.7071, 0.7071)</td>
              <td>(1.0000, 0.0000)</td>
              <td className="note">even split &rarr; |0&#10217;</td>
            </tr>
            <tr>
              <td>(&minus;0.7071, 0.7071)</td>
              <td>(0.0000, &minus;1.0000)</td>
              <td className="note">State B from module 5</td>
            </tr>
          </tbody>
        </table>

        <p className="qx-p">
          The last row is the State B from module five. The Hadamard took it to (0,
          &minus;1.0000) — certain to give 1. Apply H again from there and it returns to
          (&minus;0.7071, 0.7071) exactly. H applied twice is always the identity.
        </p>

        <h2 className="qx-h2">Every gate can be undone</h2>
        <p className="qx-p">
          For the rotation gate, the inverse is a rotation by the same angle in the
          opposite direction. For X and H, the gate is its own inverse: applying it twice
          returns the state to the start.
        </p>
        <p className="qx-p">
          Classical gates are not like this. A classical AND gate takes two input bits and
          produces one output bit. If the output is 0, the inputs could have been (0, 0),
          (0, 1), or (1, 0). Given only the output, there is no way to recover the
          original pair. Information has been destroyed, and no process can reverse that.
        </p>
        <p className="qx-p">
          Quantum gates never destroy information. They transform the state exactly and
          reversibly. This is not just a convenient property &mdash; it is a mathematical
          requirement. The constraint that the squares must add to 1 forces every valid
          gate to be invertible.
        </p>

        <div className="qx-aside">
          <p>
            On this circle, the rotation gate genuinely rotates the point, while X and H
            move it by reflection. Most descriptions of quantum computing call all gates
            &lsquo;rotations&rsquo;, and in module eleven, when the circle grows into a
            sphere, that turns out to be exactly right: every single-qubit gate is a
            rotation of the sphere. The word works as a label now and becomes precise
            later.
          </p>
          <p>
            The rotation gate used here corresponds to the R<sub>Y</sub> family of gates.
            At +90&deg; it takes |0&#10217; to |1&#10217;. At &minus;90&deg; it takes
            |1&#10217; back to |0&#10217;. At +180&deg; it sends the state to the
            antipodal point, which has the same measurement statistics but different
            amplitudes &mdash; the same invisible difference introduced in module four.
          </p>
        </div>

        <Quiz questions={QUIZ_QUESTIONS} />

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: interference. Two paths meeting at a plus sign, and the result that makes
          quantum computing worth building.
        </p>
      </div>
    </div>
  );
}
