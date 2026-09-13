import React, { useState } from "react";
import Quiz from "../components/Quiz.jsx";

/*
  Quantum explainer, module 10: the quantum walk.
  One idea: replace the classical coin with a qubit and the bell curve inverts.
  Interference suppresses the centre; peaks spread to the edges.

  Terms defined here: quantum walk.
  Terms deliberately absent: entanglement (11), phase (11).

  Design note from CLAUDE.md: the symmetric double-humped walk requires a
  complex starting coin. The walk shown here is honest: Hadamard coin, |0⟩
  start, asymmetric lean to the left. The aside names this and defers the
  fix to module 11 (complex numbers / Bloch sphere).
*/

const INV_SQRT2 = 1 / Math.sqrt(2);
const MAX_STEPS = 20;
const N = MAX_STEPS; // positions run from -N to +N; array index = pos + N

function makeInitState() {
  const size = 2 * N + 1;
  const a = new Array(size).fill(0); // coin=0 amplitudes at each position
  const b = new Array(size).fill(0); // coin=1 amplitudes at each position
  a[N] = 1; // position 0, coin |0⟩, amplitude 1
  return { a, b };
}

function doStep({ a, b }) {
  const size = 2 * N + 1;
  const na = new Array(size).fill(0);
  const nb = new Array(size).fill(0);
  for (let i = 0; i < size; i++) {
    // Apply H to coin
    const ha = (a[i] + b[i]) * INV_SQRT2; // new coin=0 amp
    const hb = (a[i] - b[i]) * INV_SQRT2; // new coin=1 amp
    // Conditional shift: coin=0 → left (i−1), coin=1 → right (i+1)
    if (i > 0) na[i - 1] += ha;
    if (i < size - 1) nb[i + 1] += hb;
  }
  return { a: na, b: nb };
}

function getQProbs({ a, b }) {
  const size = 2 * N + 1;
  return Array.from({ length: size }, (_, i) => a[i] * a[i] + b[i] * b[i]);
}

function binomCoeff(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < Math.min(k, n - k); i++) r = r * (n - i) / (i + 1);
  return r;
}

function getClassicalProbs(steps) {
  const size = 2 * N + 1;
  const probs = new Array(size).fill(0);
  if (steps === 0) { probs[N] = 1; return probs; }
  const denom = Math.pow(2, steps);
  for (let pos = -steps; pos <= steps; pos += 2) {
    const k = (steps + pos) / 2;
    probs[pos + N] = binomCoeff(steps, k) / denom;
  }
  return probs;
}

function WalkChart({ step, qProbs, cProbs }) {
  if (step === 0) {
    return (
      <div style={{
        fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13,
        color: "#5C6872", textAlign: "center", padding: "28px 0"
      }}>
        Press a step button to start the walk.
      </div>
    );
  }

  // Only positions reachable at this step (same parity as step, within ±step)
  const positions = [];
  for (let pos = -step; pos <= step; pos += 2) positions.push(pos);

  const maxProb = Math.max(
    ...positions.map(p => qProbs[p + N]),
    ...positions.map(p => cProbs[p + N]),
    0.001
  );

  const W = 600, H = 130;
  const PAD_L = 4, PAD_R = 4, PAD_TOP = 20, PAD_BOT = 26;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_TOP - PAD_BOT;
  const numBars = positions.length;
  const slot = chartW / numBars;
  const barW = Math.max(3, slot * 0.72);

  const bx = (idx) => PAD_L + idx * slot + slot / 2 - barW / 2;
  const bh = (p) => Math.max((p / maxProb) * chartH, p > 0.0005 ? 1.5 : 0);
  const by = (p) => PAD_TOP + chartH - bh(p);

  // Show position labels: all if ≤13 bars, else every other
  const showLabel = (idx) => numBars <= 13 || idx % 2 === 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} aria-hidden="true">
      {/* Baseline */}
      <line x1={PAD_L} x2={W - PAD_R} y1={PAD_TOP + chartH} y2={PAD_TOP + chartH} stroke="#161B22" strokeWidth="1" />

      {positions.map((pos, idx) => {
        const qi = pos + N;
        const qp = qProbs[qi] || 0;
        const cp = cProbs[qi] || 0;
        const x = bx(idx);

        return (
          <g key={pos}>
            {/* Classical bar — plum outline */}
            {cp > 0.0005 && (
              <rect x={x} y={by(cp)} width={barW} height={bh(cp)}
                fill="none" stroke="#8A4262" strokeWidth="1.5" opacity="0.6" />
            )}
            {/* Quantum bar — blue filled */}
            {qp > 0.0001 && (
              <rect x={x} y={by(qp)} width={barW} height={bh(qp)} fill="#2A4C6B" />
            )}
            {showLabel(idx) && (
              <text x={x + barW / 2} y={PAD_TOP + chartH + 17}
                textAnchor="middle"
                fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#5C6872">
                {pos}
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <rect x={PAD_L} y={2} width={10} height={8} fill="#2A4C6B" />
      <text x={PAD_L + 13} y={10} fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#5C6872">quantum walk</text>
      <rect x={PAD_L + 90} y={2} width={10} height={8} fill="none" stroke="#8A4262" strokeWidth="1.5" opacity="0.6" />
      <text x={PAD_L + 103} y={10} fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#5C6872">classical walk</text>
    </svg>
  );
}

const QUIZ_QUESTIONS = [
  {
    q: "After many steps of the quantum walk, where is most of the probability?",
    options: [
      "Near the centre, the same as the classical walk",
      "Near the edges, roughly \u00B1n/\u221a2 positions from the start",
      "Spread evenly across all reachable positions",
      "At the maximum distance \u00B1n \u2014 every step went the same way"
    ],
    answer: 1,
    feedback: [
      "That is the classical result. The quantum walk produces the opposite: a hollow centre with peaks near the edges.",
      "Correct. The quantum walk peaks at roughly \u00B1n/\u221a2. At 20 steps that is around \u00B114. Amplitude paths arriving at central positions cancel; paths to the edges reinforce.",
      "Uniform spread would mean equal bars at all positions. The quantum walk concentrates probability at the edges, not evenly.",
      "Position \u00B1n would require every single step to go in one direction, with no interference at all. The quantum walk spreads fast but not that fast."
    ]
  },
  {
    q: "The centre of the quantum walk becomes hollow because:",
    options: [
      "The qubit coin \u2018prefers\u2019 to move outward",
      "Amplitude paths arriving at central positions carry opposite signs and cancel",
      "The Hadamard gate only moves the state away from where it started",
      "Quantum mechanics prohibits a particle from staying near its starting point"
    ],
    answer: 1,
    feedback: [
      "The coin has no preference. The hollow centre is a mathematical consequence of how signed amplitudes combine, not a tendency of the gate.",
      "Correct. This is destructive interference \u2014 the same mechanism as module 7. The multiple routes to central positions arrive with opposite signs and sum to nearly zero.",
      "H applied twice returns the state exactly to where it started. The spreading comes from the shift operation, not a directional preference in H.",
      "There is no such prohibition. The suppression at the centre comes from cancellation of signed amplitudes, not from a physical rule about proximity to the starting point."
    ]
  },
  {
    q: "After n steps, quantum walk peaks are near \u00B1n/\u221a2 while classical spread is roughly \u00B1\u221an. What happens to the quantum walk\u2019s advantage as n grows?",
    options: [
      "The advantage stays constant \u2014 both grow at the same ratio",
      "The quantum walk pulls further ahead \u2014 its peaks grow as n while classical spread grows as \u221an",
      "The classical walk catches up eventually",
      "The advantage shrinks \u2014 interference becomes less effective over many steps"
    ],
    answer: 1,
    feedback: [
      "The ratio (n/\u221a2) \u00F7 \u221an = \u221an/\u221a2, which grows with n. The advantage increases, not stays constant.",
      "Correct. Classical spread \u221d \u221an; quantum peaks \u221d n. Their ratio grows as \u221an. At step 4 the quantum walk is about 1.4\u00D7 further out; at step 100 about 5\u00D7 further; at step 10\u202C000 about 50\u00D7 further.",
      "The gap keeps growing. Classical spread can never outpace linear growth.",
      "More steps produce more accumulated interference, not less. The peaks continue to sharpen and move outward."
    ]
  }
];

export default function ModuleTenQuantumWalk() {
  const [step, setStep] = useState(0);
  const [qState, setQState] = useState(makeInitState);

  function addSteps(n) {
    const actual = Math.min(n, MAX_STEPS - step);
    if (actual <= 0) return;
    let s = qState;
    for (let i = 0; i < actual; i++) s = doStep(s);
    setQState(s);
    setStep(step + actual);
  }

  function reset() {
    setStep(0);
    setQState(makeInitState());
  }

  const qProbs = getQProbs(qState);
  const cProbs = getClassicalProbs(step);

  // Peak positions for the readout
  let qPeak = 0, qPeakVal = 0;
  for (let i = 0; i < qProbs.length; i++) {
    if (qProbs[i] > qPeakVal) { qPeakVal = qProbs[i]; qPeak = i - N; }
  }

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
          text-transform: uppercase; color: var(--muted); margin: 0 0 10px;
        }
        .qx-divider { border: none; border-top: 1px solid var(--rule); margin: 14px 0; }

        .qx-step-row {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .qx-step-counter {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 28px; font-weight: 300; color: var(--data);
          min-width: 48px;
        }
        .qx-step-label {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 12px; color: var(--muted); margin-top: 2px;
        }
        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; }

        .qx-btn {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums;
          background: #FFFFFF; color: var(--ink);
          border: 1px solid var(--rule); border-radius: 2px;
          padding: 8px 13px; cursor: pointer;
        }
        .qx-btn:hover:not(:disabled) { border-color: var(--data); color: var(--data); }
        .qx-btn:disabled { opacity: 0.35; cursor: default; }
        .qx-btn:focus-visible { outline: 2px solid var(--data); outline-offset: 2px; }
        .qx-btn.accent { background: var(--data); border-color: var(--data); color: #FFFFFF; }
        .qx-btn.accent:hover:not(:disabled) { background: #1e374f; }
        .qx-btn.quiet { background: transparent; color: var(--muted); }

        .qx-histo-wrap {
          background: var(--plot); border: 1px solid var(--rule);
          border-radius: 2px; padding: 12px 12px 6px;
          margin: 0;
        }

        .qx-stat-row {
          display: flex; gap: 20px; flex-wrap: wrap; margin-top: 14px;
        }
        .qx-stat {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 13px; line-height: 1.6;
        }
        .qx-stat .lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
        .qx-stat .val { font-weight: 500; color: var(--data); }
        .qx-stat .val.classical { color: var(--accent); }

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
        <p className="qx-eyebrow qx-sans">Module ten of twelve</p>
        <h1 className="qx-h1">The quantum walk</h1>

        <p className="qx-p lead">
          Module two walked a line with a classical coin: many routes to the same
          position added up to produce a bell curve, tall in the centre and thin at
          the edges. This module swaps the coin for a qubit. The result is the
          opposite shape.
        </p>
        <p className="qx-p">
          Add steps below and watch what happens to the two distributions.
        </p>

        {/* === INTERACTIVE PANEL === */}
        <div className="qx-panel">
          <div className="qx-step-row qx-sans">
            <div>
              <div className="qx-step-counter">{step}</div>
              <div className="qx-step-label">steps taken</div>
            </div>
            <div className="qx-controls">
              <button className="qx-btn accent" onClick={() => addSteps(1)} disabled={step >= MAX_STEPS}>
                +1 step
              </button>
              <button className="qx-btn" onClick={() => addSteps(5)} disabled={step >= MAX_STEPS}>
                +5 steps
              </button>
              <button className="qx-btn" onClick={() => addSteps(10)} disabled={step >= MAX_STEPS}>
                +10 steps
              </button>
              <button className="qx-btn quiet" onClick={reset} disabled={step === 0}>
                Reset
              </button>
            </div>
          </div>

          <div className="qx-histo-wrap">
            <WalkChart step={step} qProbs={qProbs} cProbs={cProbs} />
          </div>

          {step > 0 && (
            <div className="qx-stat-row qx-sans">
              <div className="qx-stat">
                <div className="lbl">quantum peak position</div>
                <div className="val">{qPeak > 0 ? "+" : ""}{qPeak} &nbsp; ({(qPeakVal * 100).toFixed(1)}%)</div>
              </div>
              <div className="qx-stat">
                <div className="lbl">classical peak position</div>
                <div className="val classical">0 &nbsp; ({(cProbs[N] * 100).toFixed(1)}%)</div>
              </div>
              <div className="qx-stat">
                <div className="lbl">quantum spread (n/\u221a2)</div>
                <div className="val">\u00B1{(step / Math.sqrt(2)).toFixed(1)}</div>
              </div>
              <div className="qx-stat">
                <div className="lbl">classical spread (\u221an)</div>
                <div className="val classical">\u00B1{Math.sqrt(step).toFixed(1)}</div>
              </div>
            </div>
          )}
        </div>

        {/* === PROSE === */}
        <h2 className="qx-h2">What changed</h2>
        <p className="qx-p">
          In the classical walk, each step flipped a fair coin. The coin gave 0
          or 1, and the walker stepped left or right accordingly. The coin had no
          memory and no connection to any previous flip.
        </p>
        <p className="qx-p">
          In the <b>quantum walk</b>, the coin is a qubit. At each step, the
          Hadamard gate is applied to the coin qubit, and then a controlled
          operation (the mechanism from module nine) shifts the walker: coin result
          0 goes left, coin result 1 goes right. The coin is not measured between
          steps. Its amplitudes are carried forward and interfere with each other
          on the next step.
        </p>
        <p className="qx-p">
          This is the only change. Everything else is the same line, the same
          two directions, the same starting position. The difference in the
          histogram comes entirely from signed amplitudes accumulating instead of
          positive probabilities accumulating.
        </p>

        <h2 className="qx-h2">Why the centre empties</h2>
        <p className="qx-p">
          In the classical walk, many routes reach the centre because there are
          many ways to take equal numbers of left and right steps. More routes
          means higher probability. The bell curve peaks at the middle for exactly
          this reason.
        </p>
        <p className="qx-p">
          In the quantum walk, routes still exist and still reach the centre. But
          routes are now amplitude paths, not probability paths. The multiple paths
          arriving at central positions carry amplitudes with opposite signs. They
          cancel. This is destructive interference, the same mechanism as module
          seven: two contributions arriving at the same destination, one positive
          and one negative, summing to nearly zero.
        </p>
        <p className="qx-p">
          The edge positions are the complement. The fewer, longer routes arriving
          there tend to carry amplitudes with the same sign. They reinforce. The
          probability piles up at the edges rather than the centre.
        </p>

        <h2 className="qx-h2">How fast it spreads</h2>
        <p className="qx-p">
          The classical walk's spread grows as the square root of the number of
          steps. After 100 steps, the distribution is roughly 10 positions wide.
          The quantum walk's peaks move outward as the number of steps itself:
          after 100 steps, the peaks are near position &plusmn;70. The quantum
          walk spreads faster, and the advantage grows the longer the walk runs.
        </p>
        <p className="qx-p">
          This faster spreading is not an accident. It is a direct consequence of
          amplitude paths reinforcing at the edges. A quantum algorithm that needs
          to search across a large space can exploit this: structure the problem
          so that correct answers sit where the quantum walk concentrates, and the
          walk finds them faster than any classical search.
        </p>

        <div className="qx-aside">
          <p>
            The walk shown here leans to the left. This happens because the coin
            qubit starts at |0&#10217; = (1, 0), which is not symmetric between
            the two directions. The result is a slightly asymmetric distribution
            that runs further left than right.
          </p>
          <p>
            The symmetric double-humped walk shown in most textbooks uses a
            starting coin that has a complex number in one of its amplitudes.
            Complex amplitudes need a third axis on the state circle &mdash; the
            Bloch sphere from module eleven. Once that arrives, the symmetric
            walk becomes straightforward.
          </p>
        </div>

        <Quiz questions={QUIZ_QUESTIONS} />

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: entanglement, and the sphere. The circle grows its third axis,
          and pairs of qubits become correlated in a way that has no classical
          equivalent.
        </p>
      </div>
    </div>
  );
}
