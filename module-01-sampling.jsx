import React, { useState, useRef, useEffect, useCallback } from "react";

/*
  Quantum explainer, module 1: probability and sampling.
  One idea: a distribution is a set of hidden numbers, and the only way to
  learn them is to sample many times. Introduces shots, squares and roots
  before any of those words carry quantum baggage.
*/

const FACES = [1, 2, 3, 4, 5, 6];

function makeWeights() {
  // Loaded, but not absurdly so: every face between roughly 6% and 32%.
  for (let attempt = 0; attempt < 200; attempt++) {
    const raw = FACES.map(() => 0.5 + Math.random() * 1.9);
    const total = raw.reduce((a, b) => a + b, 0);
    const w = raw.map((v) => v / total);
    if (Math.max(...w) <= 0.32 && Math.min(...w) >= 0.06) return w;
  }
  return [0.1, 0.12, 0.14, 0.18, 0.22, 0.24];
}

function drawFace(weights) {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (r < acc) return i;
  }
  return weights.length - 1;
}

// Typical error on a single face's percentage, in percentage points,
// using p ~ 1/6 as a stand-in. sqrt(p(1-p)/n) = 0.3727 / sqrt(n).
function typicalError(n) {
  if (n <= 0) return null;
  return (37.27 / Math.sqrt(n));
}

const PLOT = {
  w: 640,
  h: 280,
  left: 46,
  right: 12,
  top: 16,
  bottom: 46,
  yMax: 40,
};
const INNER_W = PLOT.w - PLOT.left - PLOT.right;
const INNER_H = PLOT.h - PLOT.top - PLOT.bottom;
const SLOT = INNER_W / 6;
const BAR_W = 54;

function yFor(pct) {
  const clamped = Math.min(pct, PLOT.yMax);
  return PLOT.top + INNER_H * (1 - clamped / PLOT.yMax);
}

export default function ModuleOneSampling() {
  const [weights, setWeights] = useState(makeWeights);
  const [counts, setCounts] = useState([0, 0, 0, 0, 0, 0]);
  const [rolls, setRolls] = useState(0);
  const [lastFace, setLastFace] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => () => clearInterval(timer.current), []);

  const applyBatch = useCallback((n, w) => {
    const add = [0, 0, 0, 0, 0, 0];
    let last = null;
    for (let i = 0; i < n; i++) {
      last = drawFace(w);
      add[last] += 1;
    }
    setCounts((prev) => prev.map((c, i) => c + add[i]));
    setRolls((prev) => prev + n);
    setLastFace(last);
  }, []);

  function roll(n) {
    if (busy) return;
    if (n <= 1 || reduced) {
      applyBatch(n, weights);
      return;
    }
    const frames = 20;
    const per = Math.floor(n / frames);
    const remainder = n - per * frames;
    let done = 0;
    setBusy(true);
    timer.current = setInterval(() => {
      const chunk = done === 0 ? per + remainder : per;
      applyBatch(chunk, weights);
      done += 1;
      if (done >= frames) {
        clearInterval(timer.current);
        setBusy(false);
      }
    }, 28);
  }

  function newDie() {
    clearInterval(timer.current);
    setBusy(false);
    setWeights(makeWeights());
    setCounts([0, 0, 0, 0, 0, 0]);
    setRolls(0);
    setLastFace(null);
    setRevealed(false);
  }

  const observed = counts.map((c) => (rolls > 0 ? (c / rolls) * 100 : 0));
  const err = typicalError(rolls);

  return (
    <div className="qx-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&display=swap');

        .qx-root {
          --paper: #E6E8EB;
          --panel: #F6F7F8;
          --plot: #FCFCFC;
          --ink: #161B22;
          --muted: #5C6872;
          --rule: #C6CCD2;
          --data: #2A4C6B;
          --data-soft: #8FA6B8;
          --accent: #8A4262;
          background: var(--paper);
          color: var(--ink);
          font-family: 'Newsreader', Iowan Old Style, Palatino, Georgia, serif;
          padding: 40px 20px 72px;
          min-height: 100%;
          box-sizing: border-box;
        }
        .qx-wrap { max-width: 680px; margin: 0 auto; }

        .qx-eyebrow {
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-size: 13px; font-weight: 500; letter-spacing: 0.01em;
          color: var(--muted); margin: 0 0 14px;
        }
        .qx-h1 {
          font-size: 40px; line-height: 1.12; font-weight: 400;
          letter-spacing: -0.012em; margin: 0 0 24px; max-width: 14ch;
        }
        .qx-h2 {
          font-size: 23px; line-height: 1.25; font-weight: 500;
          margin: 44px 0 12px; letter-spacing: -0.006em;
        }
        .qx-p {
          font-size: 18px; line-height: 1.66; margin: 0 0 18px;
          max-width: 62ch; color: #222A31;
        }
        .qx-p.lead { font-size: 19.5px; }

        .qx-panel {
          background: var(--panel);
          border: 1px solid var(--rule);
          border-radius: 3px;
          padding: 22px 22px 18px;
          margin: 28px 0 30px;
        }
        .qx-sans {
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-variant-numeric: tabular-nums;
        }
        .qx-bar-row {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; margin-bottom: 16px;
        }
        .qx-tally { font-size: 14px; color: var(--muted); }
        .qx-tally strong { color: var(--ink); font-weight: 600; font-size: 15px; }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; }
        .qx-btn {
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums;
          background: #FFFFFF; color: var(--ink);
          border: 1px solid var(--rule); border-radius: 2px;
          padding: 8px 13px; cursor: pointer;
        }
        .qx-btn:hover:not(:disabled) { border-color: var(--data); color: var(--data); }
        .qx-btn:disabled { opacity: 0.45; cursor: default; }
        .qx-btn:focus-visible { outline: 2px solid var(--data); outline-offset: 2px; }
        .qx-btn.quiet { background: transparent; color: var(--muted); }

        .qx-plotwrap {
          background: var(--plot); border: 1px solid var(--rule);
          border-radius: 2px; margin: 4px 0 14px; padding: 4px 0 0;
        }
        .qx-svg { display: block; width: 100%; height: auto; }
        .qx-empty {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 14px; fill: var(--muted);
        }
        .qx-note {
          font-size: 14px; line-height: 1.5; color: var(--muted);
          margin: 0; max-width: 60ch;
        }
        .qx-note b { color: var(--ink); font-weight: 600; }

        .qx-table { width: 100%; border-collapse: collapse; margin: 16px 0 4px; font-size: 14px; }
        .qx-table th {
          text-align: right; font-weight: 500; color: var(--muted);
          padding: 6px 8px; border-bottom: 1px solid var(--rule); font-size: 13px;
        }
        .qx-table th:first-child, .qx-table td:first-child { text-align: left; }
        .qx-table td { text-align: right; padding: 6px 8px; border-bottom: 1px solid #E4E8EB; }
        .qx-table tr:last-child td { border-bottom: none; }
        .qx-truth { color: var(--accent); }

        .qx-scale { margin: 18px 0 6px; font-size: 15px; }
        .qx-scale td { padding: 5px 14px 5px 0; }
        .qx-scale td:first-child { color: var(--muted); }

        .qx-rule { border: none; border-top: 1px solid var(--rule); margin: 40px 0 0; }
        .qx-footer { font-size: 15px; color: var(--muted); margin: 18px 0 0; }

        @media (max-width: 560px) {
          .qx-h1 { font-size: 31px; max-width: 18ch; }
          .qx-p { font-size: 17px; }
          .qx-panel { padding: 16px 14px 14px; }
        }
      `}</style>

      <div className="qx-wrap">
        <p className="qx-eyebrow qx-sans">Module one of twelve</p>
        <h1 className="qx-h1">A shape you can only see by looking many times</h1>

        <p className="qx-p lead">
          This die is weighted. Six faces, six hidden percentages, and nothing on the
          outside to tell you which face it favours. The only instrument you have is
          rolling it and keeping count.
        </p>

        <div className="qx-panel">
          <div className="qx-bar-row">
            <div className="qx-controls">
              <button className="qx-btn" onClick={() => roll(1)} disabled={busy}>
                Roll once
              </button>
              <button className="qx-btn" onClick={() => roll(10)} disabled={busy}>
                Roll 10
              </button>
              <button className="qx-btn" onClick={() => roll(100)} disabled={busy}>
                Roll 100
              </button>
              <button className="qx-btn" onClick={() => roll(1000)} disabled={busy}>
                Roll 1,000
              </button>
            </div>
            <div className="qx-tally qx-sans">
              {rolls === 0 ? (
                "no rolls yet"
              ) : (
                <>
                  <strong>{rolls.toLocaleString("en-GB")}</strong> rolls
                  {lastFace !== null && rolls > 0 ? `, last face ${lastFace + 1}` : ""}
                </>
              )}
            </div>
          </div>

          <div className="qx-plotwrap">
            <svg
              className="qx-svg"
              viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
              role="img"
              aria-label={`Histogram of ${rolls} die rolls across six faces`}
            >
              {[0, 10, 20, 30, 40].map((v) => (
                <g key={v}>
                  <line
                    x1={PLOT.left}
                    x2={PLOT.w - PLOT.right}
                    y1={yFor(v)}
                    y2={yFor(v)}
                    stroke={v === 0 ? "#161B22" : "#E1E6EA"}
                    strokeWidth={v === 0 ? 1 : 1}
                  />
                  <text
                    x={PLOT.left - 10}
                    y={yFor(v) + 4}
                    textAnchor="end"
                    className="qx-sans"
                    fontSize="12"
                    fill="#5C6872"
                  >
                    {v}%
                  </text>
                </g>
              ))}

              {rolls === 0 && (
                <text
                  x={PLOT.left + INNER_W / 2}
                  y={PLOT.top + INNER_H / 2}
                  textAnchor="middle"
                  className="qx-empty qx-sans"
                >
                  Roll the die to start building the shape.
                </text>
              )}

              {FACES.map((face, i) => {
                const cx = PLOT.left + SLOT * i + SLOT / 2;
                const pct = observed[i];
                const top = yFor(pct);
                const base = yFor(0);
                const truth = weights[i] * 100;
                return (
                  <g key={face}>
                    <rect
                      x={cx - BAR_W / 2}
                      y={top}
                      width={BAR_W}
                      height={Math.max(0, base - top)}
                      fill="#2A4C6B"
                    />
                    {rolls > 0 && (
                      <text
                        x={cx}
                        y={top - 7}
                        textAnchor="middle"
                        className="qx-sans"
                        fontSize="12.5"
                        fill="#2A4C6B"
                      >
                        {pct.toFixed(1)}%
                      </text>
                    )}
                    {revealed && (
                      <line
                        x1={cx - BAR_W / 2 - 7}
                        x2={cx + BAR_W / 2 + 7}
                        y1={yFor(truth)}
                        y2={yFor(truth)}
                        stroke="#8A4262"
                        strokeWidth="2"
                      />
                    )}
                    <text
                      x={cx}
                      y={base + 22}
                      textAnchor="middle"
                      className="qx-sans"
                      fontSize="13.5"
                      fill="#161B22"
                    >
                      {face}
                    </text>
                  </g>
                );
              })}

              <text
                x={PLOT.left + INNER_W / 2}
                y={PLOT.h - 8}
                textAnchor="middle"
                className="qx-sans"
                fontSize="12"
                fill="#5C6872"
              >
                face
              </text>
            </svg>
          </div>

          <div className="qx-bar-row" style={{ marginBottom: 0 }}>
            <p className="qx-note qx-sans">
              {rolls === 0 ? (
                "Start with one roll. Then ten. Watch how much the shape changes each time you add more."
              ) : revealed ? (
                <>
                  The horizontal marks are the true percentages. Your bars are an
                  estimate of them, built from <b>{rolls.toLocaleString("en-GB")}</b>{" "}
                  rolls.
                </>
              ) : (
                <>
                  With {rolls.toLocaleString("en-GB")} rolls, each percentage is
                  typically within about <b>{err.toFixed(1)}</b> points of the truth.
                </>
              )}
            </p>
            <div className="qx-controls">
              <button
                className="qx-btn"
                onClick={() => setRevealed(true)}
                disabled={revealed || rolls === 0}
              >
                Reveal the true weights
              </button>
              <button className="qx-btn quiet" onClick={newDie}>
                Start a new die
              </button>
            </div>
          </div>

          {revealed && (
            <table className="qx-table qx-sans">
              <thead>
                <tr>
                  <th>Face</th>
                  <th>Times rolled</th>
                  <th>Your estimate</th>
                  <th>True weight</th>
                  <th>Off by</th>
                </tr>
              </thead>
              <tbody>
                {FACES.map((face, i) => {
                  const truth = weights[i] * 100;
                  const diff = observed[i] - truth;
                  return (
                    <tr key={face}>
                      <td>{face}</td>
                      <td>{counts[i].toLocaleString("en-GB")}</td>
                      <td>{observed[i].toFixed(1)}%</td>
                      <td className="qx-truth">{truth.toFixed(1)}%</td>
                      <td>
                        {diff >= 0 ? "+" : "\u2212"}
                        {Math.abs(diff).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <h2 className="qx-h2">What just happened</h2>
        <p className="qx-p">
          One roll told you one thing: a face came up. That is not a bias, it is an
          anecdote. Ten rolls gave you a shape, and the shape was probably wrong.
          A thousand rolls and the bars stopped moving much, because by then each new
          roll was a small correction to a large pile rather than a large correction to
          a small one.
        </p>
        <p className="qx-p">
          Two different things have been sitting on the screen. The hidden percentages
          are the distribution: fixed, real, and invisible. The bars are your estimate
          of it, assembled one roll at a time. Everything in this series lives in the
          gap between those two.
        </p>

        <h2 className="qx-h2">Precision is expensive</h2>
        <p className="qx-p">
          The error in your estimate does not fall with the number of rolls. It falls
          with the square root of the number of rolls, and square roots grow slowly.
        </p>
        <table className="qx-table qx-scale qx-sans">
          <tbody>
            <tr>
              <td>10 rolls</td>
              <td>each percentage typically within about 12 points</td>
            </tr>
            <tr>
              <td>100 rolls</td>
              <td>about 3.7 points</td>
            </tr>
            <tr>
              <td>1,000 rolls</td>
              <td>about 1.2 points</td>
            </tr>
            <tr>
              <td>10,000 rolls</td>
              <td>about 0.4 points</td>
            </tr>
          </tbody>
        </table>
        <p className="qx-p">
          Four times the rolls to halve the error. A hundred times the rolls to get ten
          times closer. When someone quotes you a result to within a tenth of a percent,
          you can now work out roughly what it cost them.
        </p>
        <p className="qx-p">
          Squares and square roots are the only two pieces of maths this whole series
          rests on. They have already turned up once, in the paragraph above. They will
          keep turning up, and by the end you will have used them often enough that they
          stop feeling like maths.
        </p>

        <h2 className="qx-h2">Why this is here</h2>
        <p className="qx-p">
          Later, the thing being sampled is a quantum computer, and the rolls are called
          shots. None of the logic above changes. A quantum computer gets run a thousand
          or ten thousand times for the same reason you had to roll a thousand times:
          one run returns one outcome, and one outcome is not a distribution.
        </p>
        <p className="qx-p">
          It is worth noticing what this die is not doing. It has a fixed set of
          percentages sitting inside it, and every roll is drawn straight from that set.
          When we reach qubits, the numbers sitting inside will not be percentages, and
          they will not behave like percentages. That difference is the entire reason
          quantum computing exists, and it arrives in module five.
        </p>

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: bits, coin flips, and a walker on a line. The baseline that quantum will
          later break.
        </p>
      </div>
    </div>
  );
}
