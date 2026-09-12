import React, { useState, useRef, useEffect } from "react";
import Quiz from "../components/Quiz.jsx";

const QUIZ_QUESTIONS = [
  {
    q: "State A started as (0.7071, 0.7071) and after the Hadamard became (1.0000, 0.0000). What is the chance of getting result 1?",
    options: [
      "100% — both original amplitudes were positive, so all the chance goes to result 1",
      "50% — there were two amplitudes before, so there is still a 50/50 chance",
      "0% — the amplitude for result 1 is now 0.0000, and 0 squared is 0",
      "70.71% — the original amplitude for result 1 was 0.7071, and that is the relevant number"
    ],
    answer: 2,
    feedback: [
      "After the Hadamard, State A is (1.0000, 0.0000) — not the original state. The chance is based on the new amplitudes, not the old ones.",
      "The 50/50 split was before the operation. The Hadamard changed the state. Chances are based on the new amplitudes.",
      "Correct. After the Hadamard, the amplitude for result 1 is 0.0000. The chance is 0.0000² = 0. State A is now certain to give result 0.",
      "After the Hadamard, the original amplitudes no longer apply. The new state is (1.0000, 0.0000), and the new amplitude for result 1 is 0.0000."
    ]
  },
  {
    q: "State B had amplitudes (\u22120.7071, 0.7071). When the Hadamard added the two amplitudes together to produce the new first amplitude, what happened?",
    options: [
      "The two negatives combined to give a larger positive — two negatives make a positive",
      "The opposite signs cancelled, giving 0 as the new first amplitude",
      "The negative was ignored — the operation only works with the magnitude, not the sign",
      "The sum came out to \u22121.4142, since the negative dominated the positive"
    ],
    answer: 1,
    feedback: [
      "Only one of the two amplitudes is negative (\u22120.7071). Adding a negative and a positive of equal size: \u22120.7071 + 0.7071 = 0. Two negatives making a positive applies to multiplication, not addition.",
      "Correct. \u22120.7071 + 0.7071 = 0. Divided by \u221a2, the new first amplitude is 0.0000. The minus sign determined which result would be cancelled — and therefore which result State B would land on.",
      "The sign is essential. The entire point of this module is that the sign does real work when amplitudes are combined.",
      "\u22120.7071 \u2212 0.7071 would give \u22121.4142. But the operation adds the two amplitudes for the first result: \u22120.7071 + 0.7071 = 0."
    ]
  },
  {
    q: "You run 10,000 measurements on a qubit with amplitudes (0.6000, 0.8000). Could the amplitudes actually be (0.6000, \u22120.8000) instead?",
    options: [
      "Yes — if the minus sign is there, the tally for result 1 will be slightly lower than 64%",
      "Yes — a negative amplitude shifts the distribution noticeably across many runs",
      "No — measurement squares the amplitudes, erasing the sign. Both states give identical tallies",
      "No — but only because 10,000 shots is not enough. With billions of shots you could tell them apart"
    ],
    answer: 2,
    feedback: [
      "Squaring removes the sign completely: (\u22120.8000)² = 0.6400, exactly the same as 0.8000² = 0.6400. The tallies are identical.",
      "A negative amplitude does not shift the distribution. Measurement squares, and squaring removes the sign.",
      "Correct. (\u22120.8000)² = 0.6400, the same as 0.8000² = 0.6400. No number of measurements can separate these two states — the difference can only be revealed by an operation that works with the amplitudes directly, not their squares.",
      "This is a fundamental limitation, not a statistical one. No amount of measurement reveals the sign, because measurement only ever sees the squares."
    ]
  }
];

/*
  Quantum explainer, module 5: amplitudes are not probabilities.
  One idea: two states with identical measurement statistics diverge completely
  under one operation, because the minus sign in one of them does work that
  squaring discards.

  Terms defined here: amplitude (properly, not just named as in module 3).
  Terms introduced here: gate (named and briefly contextualised; full treatment in module 6).
  Terms deliberately absent: circuit (module 8), interference (module 7), superposition.
  The Hadamard is named and its rule is shown.
*/

const INV_SQRT2 = 1 / Math.sqrt(2); // 0.70710678...

// State A: ( 0.7071,  0.7071) — angle 45°, both positive
// State B: (−0.7071,  0.7071) — angle 135°, one negative
// Both have squares 0.5 and 0.5: identical measurement statistics.
const INIT_A = { amp0:  INV_SQRT2, amp1: INV_SQRT2 };
const INIT_B = { amp0: -INV_SQRT2, amp1: INV_SQRT2 };

// The operation: new_0 = (amp0 + amp1) / √2, new_1 = (amp0 − amp1) / √2
// (This is the Hadamard transform. It is not named here; that comes in module 6.)
function applyOp({ amp0, amp1 }) {
  return {
    amp0: (amp0 + amp1) * INV_SQRT2,
    amp1: (amp0 - amp1) * INV_SQRT2,
  };
}

const AFTER_A = applyOp(INIT_A); // { amp0: 1, amp1: 0 }  — certain to give 0
const AFTER_B = applyOp(INIT_B); // { amp0: 0, amp1: -1 } — certain to give 1

// Circle SVG dimensions
const CC = { w: 186, cx: 93, cy: 93, r: 66 };

// Tally chart dimensions
const TC = { w: 210, h: 136, l: 34, r: 8, t: 10, b: 24 };
const TW = TC.w - TC.l - TC.r;
const TH = TC.h - TC.t - TC.b;

function fmt(v) {
  if (Math.abs(v) < 1e-10) return "0.0000";
  return (v < 0 ? "\u2212" : "") + Math.abs(v).toFixed(4);
}

function CircleDisplay({ amp0, amp1 }) {
  const px = CC.cx + CC.r * amp0;
  const py = CC.cy - CC.r * amp1;
  return (
    <svg
      viewBox={`0 0 ${CC.w} ${CC.w}`}
      style={{ display: "block", width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      <circle cx={CC.cx} cy={CC.cy} r={CC.r} fill="none" stroke="#C6CCD2" strokeWidth="1" />
      <line x1={CC.cx - CC.r - 9} x2={CC.cx + CC.r + 9} y1={CC.cy} y2={CC.cy} stroke="#D5DBE0" />
      <line x1={CC.cx} x2={CC.cx} y1={CC.cy - CC.r - 9} y2={CC.cy + CC.r + 9} stroke="#D5DBE0" />
      <line x1={CC.cx} x2={px} y1={CC.cy} y2={CC.cy} stroke="#2A4C6B" strokeWidth="2.5" />
      <line x1={px} x2={px} y1={CC.cy} y2={py} stroke="#93A8B8" strokeWidth="2.5" />
      <circle cx={px} cy={py} r="5" fill="#8A4262" />
      <text x={CC.cx + CC.r} y={CC.cy + 13} textAnchor="middle" fontSize="9" fill="#8894A0" fontFamily="IBM Plex Sans, sans-serif">1</text>
      <text x={CC.cx - CC.r} y={CC.cy + 13} textAnchor="middle" fontSize="9" fill="#8894A0" fontFamily="IBM Plex Sans, sans-serif">{"\u22121"}</text>
      <text x={CC.cx - 7} y={CC.cy - CC.r + 4} textAnchor="end" fontSize="9" fill="#8894A0" fontFamily="IBM Plex Sans, sans-serif">1</text>
      <text x={CC.cx - 7} y={CC.cy + CC.r + 4} textAnchor="end" fontSize="9" fill="#8894A0" fontFamily="IBM Plex Sans, sans-serif">{"\u22121"}</text>
    </svg>
  );
}

function TallyChart({ counts, shots, p0truth }) {
  const yFor = (v) => TC.t + TH * (1 - Math.min(v, 1));
  const baseY = yFor(0);
  const slotW = TW / 2;
  const obs0 = shots > 0 ? counts[0] / shots : 0;
  const obs1 = shots > 0 ? counts[1] / shots : 0;

  return (
    <svg
      viewBox={`0 0 ${TC.w} ${TC.h}`}
      style={{ display: "block", width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      {[0, 0.5, 1].map((v) => (
        <g key={v}>
          <line
            x1={TC.l} x2={TC.w - TC.r} y1={yFor(v)} y2={yFor(v)}
            stroke={v === 0 ? "#161B22" : "#E1E6EA"} strokeWidth="1"
          />
          {v > 0 && (
            <text x={TC.l - 5} y={yFor(v) + 4} textAnchor="end" fontSize="9" fill="#5C6872"
              fontFamily="IBM Plex Sans, sans-serif">
              {v * 100}%
            </text>
          )}
        </g>
      ))}

      {shots === 0 && (
        <text x={TC.l + TW / 2} y={TC.t + TH / 2 + 4} textAnchor="middle"
          fontSize="9.5" fill="#5C6872" fontFamily="IBM Plex Sans, sans-serif">
          no measurements yet
        </text>
      )}

      {[0, 1].map((i) => {
        const obs = i === 0 ? obs0 : obs1;
        const truth = i === 0 ? p0truth : 1 - p0truth;
        const cx = TC.l + slotW * i + slotW / 2;
        const barTop = yFor(obs);
        return (
          <g key={i}>
            <rect
              x={cx - 17} y={barTop} width={34}
              height={Math.max(0, baseY - barTop)}
              fill={i === 0 ? "#2A4C6B" : "#93A8B8"}
            />
            {shots > 0 && (
              <text x={cx} y={barTop - 4} textAnchor="middle" fontSize="9" fill="#161B22"
                fontFamily="IBM Plex Sans, sans-serif">
                {(obs * 100).toFixed(1)}%
              </text>
            )}
            <line
              x1={cx - 24} x2={cx + 24} y1={yFor(truth)} y2={yFor(truth)}
              stroke="#8A4262" strokeWidth="2"
            />
            <text x={cx} y={baseY + 17} textAnchor="middle" fontSize="10" fill="#161B22"
              fontFamily="IBM Plex Sans, sans-serif">
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ModuleFiveAmplitudes() {
  const [applied, setApplied] = useState(false);
  const [countsA, setCountsA] = useState([0, 0]);
  const [countsB, setCountsB] = useState([0, 0]);
  const [shotsA, setShotsA] = useState(0);
  const [shotsB, setShotsB] = useState(0);
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => () => clearInterval(timer.current), []);

  const stateA = applied ? AFTER_A : INIT_A;
  const stateB = applied ? AFTER_B : INIT_B;
  const p0A = stateA.amp0 * stateA.amp0;
  const p0B = stateB.amp0 * stateB.amp0;

  function runBatch(n) {
    if (busy) return;
    // Capture current p0 values before async work begins
    const curP0A = p0A;
    const curP0B = p0B;

    function doChunk(k) {
      let zA = 0, zB = 0;
      for (let i = 0; i < k; i++) {
        if (Math.random() < curP0A) zA++;
        if (Math.random() < curP0B) zB++;
      }
      setCountsA((c) => [c[0] + zA, c[1] + (k - zA)]);
      setCountsB((c) => [c[0] + zB, c[1] + (k - zB)]);
      setShotsA((s) => s + k);
      setShotsB((s) => s + k);
    }

    if (reduced) { doChunk(n); return; }

    const frames = 20;
    const per = Math.floor(n / frames);
    const rem = n - per * frames;
    let done = 0;
    setBusy(true);
    timer.current = setInterval(() => {
      doChunk(done === 0 ? per + rem : per);
      done++;
      if (done >= frames) { clearInterval(timer.current); setBusy(false); }
    }, 28);
  }

  function applyOperation() {
    if (busy) return;
    setApplied(true);
    setCountsA([0, 0]);
    setCountsB([0, 0]);
    setShotsA(0);
    setShotsB(0);
  }

  function reset() {
    clearInterval(timer.current);
    setBusy(false);
    setApplied(false);
    setCountsA([0, 0]);
    setCountsB([0, 0]);
    setShotsA(0);
    setShotsB(0);
  }

  const hasMeasured = shotsA > 0;

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

        .qx-phase {
          font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase; color: var(--muted); margin: 0 0 16px;
        }
        .qx-phase.after { color: var(--accent); }

        .qx-two-col {
          display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;
        }
        .qx-state-col {
          flex: 1 1 220px; min-width: 200px;
        }
        .qx-state-label {
          font-size: 13px; font-weight: 600; color: var(--muted);
          margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.03em;
        }
        .qx-framed {
          background: var(--plot); border: 1px solid var(--rule); border-radius: 2px;
        }

        .qx-num {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: 5px 0; border-bottom: 1px solid #E1E6EA; font-size: 14px;
        }
        .qx-num:last-child { border-bottom: none; }
        .qx-num span:first-child { color: var(--muted); font-size: 13px; }
        .qx-num span:last-child { font-weight: 500; }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; }
        .qx-btn {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums;
          background: #FFFFFF; color: var(--ink);
          border: 1px solid var(--rule); border-radius: 2px;
          padding: 8px 13px; cursor: pointer;
        }
        .qx-btn:hover:not(:disabled) { border-color: var(--data); color: var(--data); }
        .qx-btn:disabled { opacity: 0.45; cursor: default; }
        .qx-btn:focus-visible { outline: 2px solid var(--data); outline-offset: 2px; }
        .qx-btn.accent { background: var(--data); border-color: var(--data); color: #FFFFFF; }
        .qx-btn.accent:hover:not(:disabled) { background: #1e374f; border-color: #1e374f; color: #FFFFFF; }
        .qx-btn.quiet { background: transparent; color: var(--muted); }

        .qx-divider {
          border: none; border-top: 1px solid var(--rule); margin: 18px 0;
        }
        .qx-apply-row {
          display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap;
        }
        .qx-apply-note {
          font-size: 14px; line-height: 1.5; color: var(--muted);
          margin: 0; flex: 1 1 200px; max-width: 50ch;
        }
        .qx-apply-note b { color: var(--ink); font-weight: 600; }
        .qx-apply-note.revealed { color: var(--accent); }

        .qx-calc {
          background: #FFFFFF; border: 1px solid var(--rule); border-radius: 2px;
          padding: 14px 16px; margin: 18px 0; max-width: 62ch;
        }
        .qx-calc-label {
          font-size: 13px; font-weight: 600; color: var(--muted);
          text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 10px;
        }
        .qx-calc-row {
          font-size: 14.5px; line-height: 1.6; margin: 0 0 4px;
          font-variant-numeric: tabular-nums;
        }
        .qx-calc-row:last-child { margin-bottom: 0; }
        .qx-calc-row b { font-weight: 600; color: var(--ink); }
        .qx-calc-row .dim { color: var(--muted); }
        .qx-calc-result {
          font-size: 15px; font-weight: 600; color: var(--accent);
          margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--rule);
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
        <p className="qx-eyebrow qx-sans">Module five of twelve</p>
        <h1 className="qx-h1">What the minus sign does</h1>

        <p className="qx-p lead">
          In module four, you measured an even split and an even split with one
          negative number, and both came out near fifty-fifty every time. That left
          an open question: if squaring removes the minus sign, and measurement
          works by squaring, does the sign do anything at all?
        </p>
        <p className="qx-p">
          The answer depends on what else you can do to a qubit. Measurement is
          not the only thing a quantum computer does with one. Between preparing a
          qubit and measuring it, the computer can manipulate the two numbers
          directly: mix them, transform them, feed the output of one step as the
          input to the next. That manipulation is where the computation actually
          happens. Measurement just reads the result out at the end.
        </p>
        <p className="qx-p">
          The manipulation used here is called the Hadamard, named after the
          French mathematician Jacques Hadamard. It is a gate: a mathematical
          operation that takes a qubit's two numbers and produces a new pair.
          Gates are the thing a quantum computer actually does between preparation
          and measurement. Module six is about gates in full: how they work as
          rotations on the circle and how every one of them can be undone. For
          now, what matters is what the Hadamard does: it adds the two numbers to
          get a new first number, subtracts to get a new second number, and divides
          both by the square root of 2. That is enough to prove whether the minus
          sign matters.
        </p>
        <p className="qx-p">
          Here are those same two states. Measure both to confirm they are
          identical. Then apply the Hadamard to both and look again.
        </p>

        <div className="qx-panel">
          <p className={`qx-phase qx-sans${applied ? " after" : ""}`}>
            {applied ? "after the operation" : "before the operation"}
          </p>

          <div className="qx-two-col">
            {/* State A */}
            <div className="qx-state-col">
              <p className="qx-state-label qx-sans">State A</p>
              <div className="qx-framed">
                <CircleDisplay amp0={stateA.amp0} amp1={stateA.amp1} />
              </div>
              <div className="qx-sans" style={{ marginTop: 8 }}>
                <div className="qx-num">
                  <span>number for result 0</span>
                  <span style={{ color: "#2A4C6B" }}>{fmt(stateA.amp0)}</span>
                </div>
                <div className="qx-num">
                  <span>number for result 1</span>
                  <span style={{ color: "#5C6872" }}>{fmt(stateA.amp1)}</span>
                </div>
                <div className="qx-num">
                  <span>chance of 0 (squared)</span>
                  <span>{(p0A * 100).toFixed(2)}%</span>
                </div>
                <div className="qx-num">
                  <span>chance of 1 (squared)</span>
                  <span>{((1 - p0A) * 100).toFixed(2)}%</span>
                </div>
              </div>
              <div className="qx-framed" style={{ marginTop: 10 }}>
                <TallyChart counts={countsA} shots={shotsA} p0truth={p0A} />
              </div>
              {shotsA > 0 && (
                <p className="qx-sans" style={{ fontSize: 12, color: "#5C6872", margin: "5px 0 0" }}>
                  {shotsA.toLocaleString("en-GB")} measurements
                </p>
              )}
            </div>

            {/* State B */}
            <div className="qx-state-col">
              <p className="qx-state-label qx-sans">State B</p>
              <div className="qx-framed">
                <CircleDisplay amp0={stateB.amp0} amp1={stateB.amp1} />
              </div>
              <div className="qx-sans" style={{ marginTop: 8 }}>
                <div className="qx-num">
                  <span>number for result 0</span>
                  <span style={{ color: "#2A4C6B" }}>{fmt(stateB.amp0)}</span>
                </div>
                <div className="qx-num">
                  <span>number for result 1</span>
                  <span style={{ color: "#5C6872" }}>{fmt(stateB.amp1)}</span>
                </div>
                <div className="qx-num">
                  <span>chance of 0 (squared)</span>
                  <span>{(p0B * 100).toFixed(2)}%</span>
                </div>
                <div className="qx-num">
                  <span>chance of 1 (squared)</span>
                  <span>{((1 - p0B) * 100).toFixed(2)}%</span>
                </div>
              </div>
              <div className="qx-framed" style={{ marginTop: 10 }}>
                <TallyChart counts={countsB} shots={shotsB} p0truth={p0B} />
              </div>
              {shotsB > 0 && (
                <p className="qx-sans" style={{ fontSize: 12, color: "#5C6872", margin: "5px 0 0" }}>
                  {shotsB.toLocaleString("en-GB")} measurements
                </p>
              )}
            </div>
          </div>

          <hr className="qx-divider" />

          <div className="qx-controls" style={{ marginBottom: 14 }}>
            <button className="qx-btn" onClick={() => runBatch(1000)} disabled={busy}>
              Measure each 1,000 times
            </button>
            <button className="qx-btn" onClick={() => runBatch(5000)} disabled={busy}>
              Measure each 5,000 times
            </button>
            {applied && (
              <button className="qx-btn quiet" onClick={reset} disabled={busy}>
                Reset
              </button>
            )}
          </div>

          <div className="qx-apply-row">
            <p className={`qx-apply-note qx-sans${applied ? " revealed" : ""}`}>
              {!applied && !hasMeasured &&
                "Measure both states. Watch the tallies settle. Then consider what you expect to happen when the same manipulation is applied to both at once."}
              {!applied && hasMeasured &&
                <>Both states are landing near <b>50%</b> each. The plum marks confirm it. Now apply the operation to both.</>}
              {applied &&
                <>State A is now <b>certain to give 0</b>. State B is now <b>certain to give 1</b>. The plum marks have moved to the edges. Measure to confirm.</>}
            </p>
            {!applied && (
              <button
                className="qx-btn accent"
                onClick={applyOperation}
                disabled={busy}
              >
                Apply the Hadamard
              </button>
            )}
          </div>
        </div>

        <h2 className="qx-h2">What the Hadamard does to the numbers</h2>
        <p className="qx-p">
          Here is the arithmetic rule:
        </p>
        <p className="qx-p">
          The new number for result 0 is the old pair added together, divided by the
          square root of 2. The new number for result 1 is the old pair subtracted,
          divided by the square root of 2.
        </p>
        <p className="qx-p">
          That rule produces different results from each state, because their signs are different.
        </p>

        <div className="qx-calc qx-sans">
          <p className="qx-calc-label">State A: ( 0.7071, 0.7071 ) — same sign</p>
          <p className="qx-calc-row"><span className="dim">new 0: </span>( 0.7071 + 0.7071 ) {"\u00F7"} 1.4142 = <b>1.4142 {"\u00F7"} 1.4142 = 1.0000</b></p>
          <p className="qx-calc-row"><span className="dim">new 1: </span>( 0.7071 {"\u2212"} 0.7071 ) {"\u00F7"} 1.4142 = <b>0.0000 {"\u00F7"} 1.4142 = 0.0000</b></p>
          <p className="qx-calc-result">Certain to give 0. The two numbers added to something, then subtracted to nothing.</p>
        </div>

        <div className="qx-calc qx-sans">
          <p className="qx-calc-label">State B: ( {"\u2212"}0.7071, 0.7071 ) — opposite signs</p>
          <p className="qx-calc-row"><span className="dim">new 0: </span>( {"\u2212"}0.7071 + 0.7071 ) {"\u00F7"} 1.4142 = <b>0.0000 {"\u00F7"} 1.4142 = 0.0000</b></p>
          <p className="qx-calc-row"><span className="dim">new 1: </span>( {"\u2212"}0.7071 {"\u2212"} 0.7071 ) {"\u00F7"} 1.4142 = <b>{"\u2212"}1.4142 {"\u00F7"} 1.4142 = {"\u2212"}1.0000</b></p>
          <p className="qx-calc-result">Certain to give 1. The two numbers added to nothing, then subtracted to something.</p>
        </div>

        <p className="qx-p">
          The minus sign in State B meant the two numbers had opposite signs. Adding them cancelled. Subtracting them doubled. The minus sign was not sitting there passively. It was determining which result would survive.
        </p>

        <h2 className="qx-h2">What an amplitude is</h2>
        <p className="qx-p">
          The two numbers in a qubit's state are called amplitudes. The word appeared in module three and was flagged as one to keep at arm's length until here. The reason was this: amplitude is almost always explained as if it were a kind of probability, and it is not.
        </p>
        <p className="qx-p">
          A probability is always between 0 and 1. An amplitude can be negative, and it can be greater than 1 in intermediate steps (the {"\u2212"}1.0000 in State B after the operation is a legal amplitude). The chance you observe is the amplitude squared, so the range shrinks back to 0 to 1 at the moment of measurement, and the minus sign disappears. But between operations, the sign is real and it does work.
        </p>
        <p className="qx-p">
          When two amplitudes combine, the signs determine whether they add to something or subtract to nothing. Same sign: they reinforce. Opposite signs: they cancel. Classical probability has no equivalent of cancellation. Two paths arriving at the same place always make it more likely. With amplitudes, a second path can make it less likely, down to zero.
        </p>

        <h2 className="qx-h2">What measuring can and cannot tell you</h2>
        <p className="qx-p">
          No measurement, run however many times, can separate State A from State B in their original form. The minus sign is erased when you square, and squaring is all measurement does.
        </p>
        <p className="qx-p">
          But the sign is not meaningless. The operation above revealed it, because the operation works with the amplitudes directly rather than with their squares. Give the minus sign room to act and it completely changes the result.
        </p>
        <p className="qx-p">
          The word for what happens when amplitudes add to something or cancel to nothing arrives in module seven, after module six has shown how operations work in general. What you have seen here is the mechanism. It turns out to be the whole point of quantum computing.
        </p>

        <div className="qx-aside">
          <p>
            A note on the number {"\u2212"}1.0000 that appeared as State B's amplitude for result 1 after the operation. Its square is 1, so the chance of getting result 1 is 100%. The minus sign is gone. The qubit sits at angle 270 degrees on the circle, straight down, and it measures as 1 every single time.
          </p>
          <p>
            The state (0, {"\u2212"}1) and the state (0, 1) are genuinely different objects at different positions on the circle. They give identical measurement outcomes. Module eleven is where that difference acquires a physical meaning: it is a phase relationship, and it becomes visible when this qubit is combined with another.
          </p>
        </div>

        <Quiz questions={QUIZ_QUESTIONS} />

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: gates as rotations. The operation used here gets its name, and you
          will see how every operation of this kind can be undone.
        </p>
      </div>
    </div>
  );
}
