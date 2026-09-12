import React, { useState } from "react";
import Quiz from "../components/Quiz.jsx";

/*
  Quantum explainer, module 7: interference.
  One idea: amplitudes on two paths can cancel each other out.
  The smallest complete story: H then H on |0⟩.

  Terms defined here: interference, superposition (if it earns its place).
  Terms deliberately absent: circuit (8), entanglement (11).
*/

const INV_SQRT2 = 1 / Math.sqrt(2); // 0.7071...

function fmt(v) {
  if (Math.abs(v) < 1e-10) return "0.0000";
  return (v < 0 ? "\u2212" : "+") + Math.abs(v).toFixed(4);
}

function fmtPlain(v) {
  if (Math.abs(v) < 1e-10) return "0.0000";
  return (v < 0 ? "\u2212" : "") + Math.abs(v).toFixed(4);
}

// The four path contributions from H then H, starting at |0⟩ = (1, 0):
// After first H: slot0 = 0.7071, slot1 = 0.7071
// Second H distributes each slot to both results:
//   slot0 → result0: +INV_SQRT2 * slot0 = +0.5000
//   slot1 → result0: +INV_SQRT2 * slot1 = +0.5000
//   slot0 → result1: +INV_SQRT2 * slot0 = +0.5000
//   slot1 → result1: -INV_SQRT2 * slot1 = -0.5000
const SLOT0 = INV_SQRT2; // 0.7071
const SLOT1 = INV_SQRT2; // 0.7071
const PATH_S0_R0 = +INV_SQRT2 * SLOT0; // +0.5000
const PATH_S1_R0 = +INV_SQRT2 * SLOT1; // +0.5000
const PATH_S0_R1 = +INV_SQRT2 * SLOT0; // +0.5000
const PATH_S1_R1 = -INV_SQRT2 * SLOT1; // -0.5000

const QUIZ_QUESTIONS = [
  {
    q: "What is the contribution of slot 1 towards result 1, in the second H?",
    options: [
      "+0.5000 — both results receive the same positive contribution",
      "\u22120.5000 — the H rule applies a minus sign on the path from slot 1 to result 1",
      "0.0000 — slot 1 only feeds result 1, never result 0",
      "+0.7071 — the contribution is the slot value itself, not half of it"
    ],
    answer: 1,
    feedback: [
      "The H rule for result 1 is (slot0 \u2212 slot1) \u00D7 (1/\u221a2). The slot 1 term carries a minus sign.",
      "Correct. H's rule for result 1 is (slot0 \u2212 slot1) / \u221a2. The minus sign is part of the gate's definition, not a coincidence.",
      "Each slot feeds both results. Slot 1 contributes to result 0 with a plus sign and to result 1 with a minus sign.",
      "Each contribution is the slot value multiplied by 1/\u221a2. Since the slot value is already 1/\u221a2, the contribution is (1/\u221a2)\u00B2 = 0.5."
    ]
  },
  {
    q: "Why does result 1 end up with a total amplitude of 0.0000?",
    options: [
      "Because result 1 receives no contributions from either slot",
      "Because the two contributions arrive with opposite signs and cancel exactly",
      "Because the H gate always sends |0\u27E9 directly to |0\u27E9",
      "Because the second H undoes the first H for result 1 only"
    ],
    answer: 1,
    feedback: [
      "Result 1 receives two contributions: +0.5000 from slot 0 and \u22120.5000 from slot 1.",
      "Correct. +0.5000 and \u22120.5000 sum to exactly zero. Both paths are real and active \u2014 they arrive at the same destination and destroy each other. This is destructive interference.",
      "H does not send |0\u27E9 directly anywhere \u2014 it first creates the intermediate state with both slots occupied. The cancellation happens in the second gate.",
      "The second H undoes the first H for both results simultaneously. The zero for result 1 and the certainty for result 0 are two sides of the same cancellation."
    ]
  },
  {
    q: "What is the key difference between amplitude paths and classical probability paths?",
    options: [
      "Classical paths can also cancel, but quantum paths cancel more completely",
      "Amplitude paths carry signed numbers, so two paths can arrive at the same destination and cancel. Classical probabilities are always positive, so two paths always add.",
      "Quantum paths only combine when a measurement is made; classical paths combine continuously",
      "Classical paths always lead to bell curves; amplitude paths lead to other shapes"
    ],
    answer: 1,
    feedback: [
      "Classical probabilities cannot cancel. They are always non-negative, so adding two paths always increases the total. Cancellation is unique to signed amplitudes.",
      "Correct. This is the core difference. Signed amplitudes allow destructive interference. No classical model with positive probabilities can reproduce it.",
      "Amplitude paths combine as the gates are applied, before any measurement. Measurement is what turns the final amplitudes into observable chances.",
      "Bell curves are one consequence of how classical paths add, but the fundamental difference is the sign. A signed path system would not produce a bell curve."
    ]
  }
];

export default function ModuleSevenInterference() {
  // phase: "start" | "predict" | "revealed"
  const [phase, setPhase] = useState("start");
  const [prediction, setPrediction] = useState(null); // 0 = "50/50", 1 = "result 0", 2 = "result 1"

  function handlePredict(choice) {
    setPrediction(choice);
    setPhase("revealed");
  }

  function reset() {
    setPhase("start");
    setPrediction(null);
  }

  const predictionLabels = [
    "Still 50/50 \u2014 nothing will change",
    "Result 0 becomes more likely",
    "Result 1 becomes more likely"
  ];

  const predictionCorrect = prediction === 1; // result 0 becomes certain

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
        .qx-btn.predict-opt {
          width: 100%; text-align: left; padding: 10px 14px;
          font-size: 15px; margin-bottom: 6px; line-height: 1.4;
        }
        .qx-btn.predict-opt.correct { border-color: #2A6B3A; color: #1A4A28; background: #EFF7F1; }
        .qx-btn.predict-opt.wrong { border-color: var(--accent); color: #5C1E36; background: #F8EFF3; }

        .qx-state-row {
          display: flex; align-items: center; gap: 16px;
          padding: 14px 0; flex-wrap: wrap;
        }
        .qx-state-box {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          background: #FFFFFF; border: 1px solid var(--rule);
          border-radius: 2px; padding: 10px 14px; font-size: 14px;
          line-height: 1.7;
        }
        .qx-state-box .label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 4px;
        }
        .qx-state-box .amp0 { color: var(--data); font-weight: 500; }
        .qx-state-box .amp1 { color: var(--muted); font-weight: 500; }
        .qx-arrow {
          font-size: 22px; color: var(--muted); flex-shrink: 0;
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
        }
        .qx-gate-badge {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 13px; font-weight: 600;
          background: var(--data); color: #FFF;
          border-radius: 2px; padding: 3px 8px;
        }
        .qx-gate-badge.ghost {
          background: transparent; border: 1px dashed var(--rule);
          color: var(--muted);
        }

        .qx-panel-label {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--muted); margin: 0 0 14px;
        }
        .qx-predict-prompt {
          font-size: 16px; line-height: 1.5; margin: 0 0 16px; color: var(--ink);
          font-family: 'Newsreader', Georgia, serif;
        }

        /* Path diagram */
        .qx-path-diagram {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0 8px;
          align-items: center;
          margin: 16px 0 8px;
        }
        .qx-path-col-label {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--muted);
          padding-bottom: 8px; text-align: center;
        }
        .qx-sources {
          display: flex; flex-direction: column; gap: 28px;
          padding: 12px 0;
        }
        .qx-dests {
          display: flex; flex-direction: column; gap: 28px;
          padding: 12px 0;
        }
        .qx-source-node, .qx-dest-node {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 13.5px; font-weight: 500;
          background: #FFFFFF; border: 1px solid var(--rule);
          border-radius: 2px; padding: 6px 10px; white-space: nowrap;
        }
        .qx-source-node .val { color: var(--data); }
        .qx-source-node .val.neg { color: var(--accent); }
        .qx-dest-node .sum { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .qx-dest-node .total { color: var(--data); font-weight: 600; }
        .qx-dest-node .total.zero { color: var(--muted); }
        .qx-dest-node .total.neg { color: var(--accent); }

        .qx-path-label {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 12px; fill: var(--muted);
        }

        .qx-result-note {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 13px; color: var(--muted);
          margin: 4px 0 0;
        }
        .qx-result-note.certain { color: #1A4A28; font-weight: 500; }
        .qx-result-note.impossible { color: var(--muted); }

        .qx-feedback-box {
          border-left: 3px solid;
          padding: 10px 14px; margin: 16px 0 4px;
          font-size: 15px; line-height: 1.55;
          font-family: 'Newsreader', Georgia, serif;
        }
        .qx-feedback-box.right { border-color: #2A6B3A; background: #EFF7F1; color: #1A4A28; }
        .qx-feedback-box.wrong { border-color: var(--accent); background: #F8EFF3; color: #5C1E36; }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; }

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
        <p className="qx-eyebrow qx-sans">Module seven of twelve</p>
        <h1 className="qx-h1">Interference</h1>

        <p className="qx-p lead">
          The Hadamard takes |0&#10217; to an even split: both results have a 50%
          chance. Apply H a second time and the chances are no longer equal. Before
          you see the result, try to predict what happens.
        </p>
        <p className="qx-p">
          The panel below shows the state after the first H. A second H is queued.
          Make your prediction, then see the paths.
        </p>

        {/* === INTERACTIVE PANEL === */}
        <div className="qx-panel">

          {/* Always visible: the state after the first H */}
          <p className="qx-panel-label qx-sans">State after first H</p>
          <div className="qx-state-row qx-sans">
            <div className="qx-state-box">
              <div className="qx-label">|0&#10217; start</div>
              <div className="amp0">result 0: 1.0000</div>
              <div className="amp1">result 1: 0.0000</div>
            </div>
            <span className="qx-arrow">&rarr;</span>
            <span className="qx-gate-badge">H</span>
            <span className="qx-arrow">&rarr;</span>
            <div className="qx-state-box">
              <div className="qx-label">after first H</div>
              <div className="amp0">result 0: 0.7071</div>
              <div className="amp1">result 1: 0.7071</div>
            </div>
            <span className="qx-arrow">&rarr;</span>
            <span className="qx-gate-badge ghost">H ?</span>
          </div>

          {phase === "start" && (
            <div style={{ marginTop: 16 }}>
              <p className="qx-predict-prompt">
                Both results are equally likely now. A second H is applied next.
                What will the measurement chances be after the second H?
              </p>
              <div className="qx-controls" style={{ flexDirection: "column", maxWidth: 380 }}>
                {predictionLabels.map((label, i) => (
                  <button key={i} className="qx-btn predict-opt" onClick={() => handlePredict(i)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === "revealed" && (
            <div style={{ marginTop: 16 }}>
              {/* Prediction feedback */}
              <div className={`qx-feedback-box ${predictionCorrect ? "right" : "wrong"}`}>
                {predictionCorrect
                  ? "Yes. After the second H, result 0 is certain and result 1 is impossible."
                  : prediction === 0
                    ? "Not quite. The second H is not neutral — it produces a definite result, not a 50/50 split."
                    : "Not quite. Result 0 does not merely become more likely — it becomes certain."
                }
              </div>

              {/* Path diagram */}
              <p className="qx-panel-label qx-sans" style={{ marginTop: 20 }}>
                How the second H combines the paths
              </p>
              <p style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: 15, lineHeight: 1.55, color: "#222A31", margin: "0 0 14px"
              }}>
                The second H sends each intermediate slot to both results.
                Each contribution is the slot's value multiplied by 1/&radic;2.
                The slot 1 contribution to result 1 carries a minus sign — that is part of the H rule.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%", borderCollapse: "collapse",
                  fontFamily: "'IBM Plex Sans', sans-serif", fontVariantNumeric: "tabular-nums",
                  fontSize: 13.5
                }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", color: "#5C6872", fontWeight: 600, fontSize: 12, padding: "4px 10px 6px 0", borderBottom: "1px solid #C6CCD2" }}>From</th>
                      <th style={{ textAlign: "left", color: "#5C6872", fontWeight: 600, fontSize: 12, padding: "4px 10px 6px 0", borderBottom: "1px solid #C6CCD2" }}>To</th>
                      <th style={{ textAlign: "right", color: "#5C6872", fontWeight: 600, fontSize: 12, padding: "4px 0 6px 0", borderBottom: "1px solid #C6CCD2" }}>Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "6px 10px 6px 0", borderBottom: "1px solid #E4E8EB" }}>slot 0 (0.7071)</td>
                      <td style={{ padding: "6px 10px 6px 0", borderBottom: "1px solid #E4E8EB", color: "#2A4C6B" }}>result 0</td>
                      <td style={{ padding: "6px 0 6px 0", borderBottom: "1px solid #E4E8EB", textAlign: "right", color: "#2A4C6B", fontWeight: 500 }}>+0.5000</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 10px 6px 0", borderBottom: "1px solid #E4E8EB" }}>slot 1 (0.7071)</td>
                      <td style={{ padding: "6px 10px 6px 0", borderBottom: "1px solid #E4E8EB", color: "#2A4C6B" }}>result 0</td>
                      <td style={{ padding: "6px 0 6px 0", borderBottom: "1px solid #E4E8EB", textAlign: "right", color: "#2A4C6B", fontWeight: 500 }}>+0.5000</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 10px 6px 0", borderBottom: "1px solid #E4E8EB" }}>slot 0 (0.7071)</td>
                      <td style={{ padding: "6px 10px 6px 0", borderBottom: "1px solid #E4E8EB", color: "#8A4262" }}>result 1</td>
                      <td style={{ padding: "6px 0 6px 0", borderBottom: "1px solid #E4E8EB", textAlign: "right", color: "#8A4262", fontWeight: 500 }}>+0.5000</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 10px 6px 0" }}>slot 1 (0.7071)</td>
                      <td style={{ padding: "6px 10px 6px 0", color: "#8A4262" }}>result 1</td>
                      <td style={{ padding: "6px 0 6px 0", textAlign: "right", color: "#8A4262", fontWeight: 500 }}>{"\u2212"}0.5000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{
                display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap"
              }}>
                <div className="qx-state-box qx-sans" style={{ flex: "1 1 140px" }}>
                  <div className="label">result 0 total</div>
                  <div style={{ color: "#2A4C6B", fontWeight: 600, fontSize: 16 }}>
                    +0.5000 + 0.5000 = 1.0000
                  </div>
                  <div className="qx-result-note certain">certain (100%)</div>
                </div>
                <div className="qx-state-box qx-sans" style={{ flex: "1 1 140px" }}>
                  <div className="label">result 1 total</div>
                  <div style={{ color: "#5C6872", fontWeight: 600, fontSize: 16 }}>
                    +0.5000 {"\u2212"} 0.5000 = 0.0000
                  </div>
                  <div className="qx-result-note impossible">impossible (0%)</div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <button className="qx-btn quiet" onClick={reset}>Start again</button>
              </div>
            </div>
          )}
        </div>

        {/* === PROSE === */}
        <h2 className="qx-h2">What just happened</h2>
        <p className="qx-p">
          After the first H, the qubit holds two non-zero amplitudes: 0.7071 in
          both slots. Both results are equally likely. Then the second H runs, and
          each slot sends a contribution to both possible results.
        </p>
        <p className="qx-p">
          The two contributions arriving at result 0 have the same sign: both are
          +0.5000. They add to 1.0000. The chance of result 0 squares to 100%.
        </p>
        <p className="qx-p">
          The two contributions arriving at result 1 have opposite signs: +0.5000
          from slot 0, and &minus;0.5000 from slot 1. They sum to exactly zero. The
          chance of result 1 is 0%.
        </p>
        <p className="qx-p">
          When contributions with the same sign meet, they reinforce. When
          contributions with opposite signs meet, they cancel. This is
          <b> interference</b>: the combining of signed amplitude contributions
          arriving at the same destination. The result at the top, where paths
          reinforce, is called constructive interference. The result at the bottom,
          where they cancel, is destructive interference.
        </p>

        <h2 className="qx-h2">Why this cannot happen with probabilities</h2>
        <p className="qx-p">
          In the classical walk from module two, every route added positively to the
          total. More routes reaching a position meant a higher count. There was no
          mechanism to reach a position and make it less likely.
        </p>
        <p className="qx-p">
          Probabilities are always positive or zero. Two paths arriving at the same
          place always add. You cannot have a path that reduces the probability of
          an outcome. Cancellation is simply not available.
        </p>
        <p className="qx-p">
          Amplitudes are signed. A path can carry a negative contribution. When that
          meets a positive contribution at the same destination, they cancel and the
          result becomes unreachable. This is what makes quantum computing worth
          building: a quantum computer can be arranged so that wrong answers
          accumulate destructive interference and right answers accumulate
          constructive interference. The machine does not check all answers and
          discard the wrong ones. It constructs a situation where the wrong answers
          are suppressed by their own arithmetic.
        </p>

        <h2 className="qx-h2">The minus sign is in the gate, not the state</h2>
        <p className="qx-p">
          The minus sign that causes the cancellation came from the H gate itself.
          The rule for result 1 is (slot0 &minus; slot1) / &radic;2. The minus is
          fixed into the gate's definition; it is not a property of the input.
        </p>
        <p className="qx-p">
          Module five showed a state where the amplitude for result 1 was negative
          from the start: &minus;0.7071. The interference here is different. The
          input state had no negative amplitudes at all. The negative contribution
          arose from the gate, not the state.
        </p>
        <p className="qx-p">
          Both kinds of negative number matter: signed states, and gates that
          introduce minus signs in the contributions they send out. Any route to
          interference needs at least one of them.
        </p>

        <div className="qx-aside">
          <p>
            The word <em>superposition</em> is often used to describe a qubit in an
            intermediate state like (0.7071, 0.7071). It means nothing more than
            "both amplitudes are non-zero at the same time". The word tends to attract
            mystical readings, which is why this explainer has avoided it. The
            amplitude pair is just two numbers obeying a constraint. Superposition
            names the situation; interference is what makes it useful.
          </p>
        </div>

        <Quiz questions={QUIZ_QUESTIONS} />

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: circuits. Gates on a wire, read left to right.
        </p>
      </div>
    </div>
  );
}
