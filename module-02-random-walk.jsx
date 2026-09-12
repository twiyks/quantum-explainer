import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

/*
  Quantum explainer, module 2: bits and the classical random walk.
  One idea: many different routes arrive at the same place, classically you
  just count them, and counting them gives a bell curve. Plants the three
  facts that module ten will break.
*/

const STEP_OPTIONS = [4, 10, 30, 100];

const logFact = (() => {
  const t = [0];
  for (let i = 1; i <= 200; i++) t[i] = t[i - 1] + Math.log(i);
  return t;
})();

function binomProb(n, k) {
  return Math.exp(logFact[n] - logFact[k] - logFact[n - k] - n * Math.LN2);
}

function routeCount(n, k) {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

const PLOT = { w: 640, h: 250, left: 46, right: 14, top: 16, bottom: 42 };
const INNER_W = PLOT.w - PLOT.left - PLOT.right;
const INNER_H = PLOT.h - PLOT.top - PLOT.bottom;
const STRIP_H = 52;

export default function ModuleTwoRandomWalk() {
  const [steps, setSteps] = useState(10);
  const [counts, setCounts] = useState(() => new Array(11).fill(0));
  const [walks, setWalks] = useState(0);
  const [sumSq, setSumSq] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [walkerPos, setWalkerPos] = useState(null);
  const [visited, setVisited] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const timer = useRef(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => () => clearInterval(timer.current), []);

  const positions = useMemo(
    () => Array.from({ length: steps + 1 }, (_, i) => -steps + 2 * i),
    [steps]
  );

  const theory = useMemo(
    () => positions.map((_, i) => binomProb(steps, i) * 100),
    [positions, steps]
  );

  const yMax = useMemo(() => {
    const peak = Math.max(...theory);
    return Math.max(10, Math.ceil(peak / 10) * 10);
  }, [theory]);

  const slot = INNER_W / (steps + 1);
  const barW = Math.max(2, Math.min(slot - Math.min(6, slot * 0.3), 54));

  const xFor = (i) => PLOT.left + slot * i + slot / 2;
  const yFor = (pct) => PLOT.top + INNER_H * (1 - Math.min(pct, yMax) / yMax);
  const baseY = yFor(0);

  function reset(nextSteps) {
    clearInterval(timer.current);
    setBusy(false);
    setSteps(nextSteps);
    setCounts(new Array(nextSteps + 1).fill(0));
    setWalks(0);
    setSumSq(0);
    setRevealed(false);
    setWalkerPos(null);
    setVisited([]);
    setStepIndex(0);
  }

  const record = useCallback(
    (endings) => {
      setCounts((prev) => {
        const next = prev.slice();
        endings.forEach((p) => {
          next[(p + steps) / 2] += 1;
        });
        return next;
      });
      setWalks((prev) => prev + endings.length);
      setSumSq((prev) => prev + endings.reduce((a, p) => a + p * p, 0));
    },
    [steps]
  );

  function simulate() {
    let pos = 0;
    for (let i = 0; i < steps; i++) pos += Math.random() < 0.5 ? -1 : 1;
    return pos;
  }

  function walkOnce() {
    if (busy) return;
    if (reduced) {
      const p = simulate();
      setWalkerPos(p);
      setVisited([p]);
      setStepIndex(steps);
      record([p]);
      return;
    }
    setBusy(true);
    let pos = 0;
    let i = 0;
    setWalkerPos(0);
    setVisited([0]);
    setStepIndex(0);
    const gap = Math.max(14, Math.round(1600 / steps));
    timer.current = setInterval(() => {
      pos += Math.random() < 0.5 ? -1 : 1;
      i += 1;
      setWalkerPos(pos);
      setStepIndex(i);
      setVisited((v) => (v.includes(pos) ? v : v.concat(pos)));
      if (i >= steps) {
        clearInterval(timer.current);
        record([pos]);
        setBusy(false);
      }
    }, gap);
  }

  function walkMany(n) {
    if (busy) return;
    setWalkerPos(null);
    setVisited([]);
    if (reduced) {
      record(Array.from({ length: n }, simulate));
      return;
    }
    const frames = 20;
    const per = Math.floor(n / frames);
    const remainder = n - per * frames;
    let done = 0;
    setBusy(true);
    timer.current = setInterval(() => {
      const chunk = done === 0 ? per + remainder : per;
      record(Array.from({ length: chunk }, simulate));
      done += 1;
      if (done >= frames) {
        clearInterval(timer.current);
        setBusy(false);
      }
    }, 28);
  }

  const observed = counts.map((c) => (walks > 0 ? (c / walks) * 100 : 0));
  const rms = walks > 0 ? Math.sqrt(sumSq / walks) : null;
  const labelEvery = steps <= 10 ? 1 : steps <= 30 ? 3 : 10;

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
          font-size: 13px; font-weight: 500; color: var(--muted); margin: 0 0 14px;
        }
        .qx-h1 {
          font-size: 40px; line-height: 1.12; font-weight: 400;
          letter-spacing: -0.012em; margin: 0 0 24px; max-width: 15ch;
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
          border-radius: 3px; padding: 22px 22px 18px; margin: 28px 0 30px;
        }
        .qx-sans {
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-variant-numeric: tabular-nums;
        }
        .qx-bar-row {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; margin-bottom: 14px;
        }
        .qx-tally { font-size: 14px; color: var(--muted); }
        .qx-tally strong { color: var(--ink); font-weight: 600; font-size: 15px; }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
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
        .qx-btn.on { background: var(--data); border-color: var(--data); color: #FFFFFF; }
        .qx-seg { display: flex; gap: 6px; align-items: center; }
        .qx-seglabel { font-size: 13px; color: var(--muted); margin-right: 2px; }

        .qx-plotwrap {
          background: var(--plot); border: 1px solid var(--rule);
          border-radius: 2px; margin: 4px 0 14px;
        }
        .qx-svg { display: block; width: 100%; height: auto; }
        .qx-note { font-size: 14px; line-height: 1.5; color: var(--muted); margin: 0; max-width: 58ch; }
        .qx-note b { color: var(--ink); font-weight: 600; }

        .qx-table { width: 100%; border-collapse: collapse; margin: 16px 0 4px; font-size: 15px; }
        .qx-table td { padding: 5px 14px 5px 0; }
        .qx-table td:first-child { color: var(--muted); width: 9em; }

        .qx-list { max-width: 62ch; margin: 0 0 18px; padding: 0; list-style: none; }
        .qx-list li {
          font-size: 18px; line-height: 1.6; padding: 10px 0 10px 18px;
          border-top: 1px solid var(--rule); color: #222A31;
          position: relative;
        }
        .qx-list li:last-child { border-bottom: 1px solid var(--rule); }
        .qx-list li:before {
          content: ""; position: absolute; left: 0; top: 20px;
          width: 7px; height: 1px; background: var(--accent);
        }

        .qx-rule { border: none; border-top: 1px solid var(--rule); margin: 40px 0 0; }
        .qx-footer { font-size: 15px; color: var(--muted); margin: 18px 0 0; }

        @media (max-width: 560px) {
          .qx-h1 { font-size: 31px; max-width: 18ch; }
          .qx-p { font-size: 17px; }
          .qx-panel { padding: 16px 14px 14px; }
        }
      `}</style>

      <div className="qx-wrap">
        <p className="qx-eyebrow qx-sans">Module two of twelve</p>
        <h1 className="qx-h1">Many routes to the same place</h1>

        <p className="qx-p lead">
          A bit is a thing with two states. Here it is a fair coin, and a person who
          steps forward on heads and backward on tails. Flip, step, repeat. The strip
          at the top of the panel is the person moving along the line. The bars below
          record where they end up.
        </p>

        <div className="qx-panel">
          <div className="qx-bar-row">
            <div className="qx-seg qx-sans">
              <span className="qx-seglabel">steps per walk</span>
              {STEP_OPTIONS.map((s) => (
                <button
                  key={s}
                  className={"qx-btn" + (s === steps ? " on" : "")}
                  onClick={() => reset(s)}
                  disabled={busy}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="qx-tally qx-sans">
              {walks === 0 ? (
                "no walks yet"
              ) : (
                <>
                  <strong>{walks.toLocaleString("en-GB")}</strong> walks
                </>
              )}
            </div>
          </div>

          <div className="qx-plotwrap">
            <svg
              className="qx-svg"
              viewBox={`0 0 ${PLOT.w} ${PLOT.h + STRIP_H}`}
              role="img"
              aria-label={`A person stepping forward and back along a line, and a histogram of ${walks} finishing positions`}
            >
              {/* walker strip, sharing the position axis with the histogram below */}
              <line
                x1={PLOT.left}
                x2={PLOT.w - PLOT.right}
                y1={STRIP_H - 16}
                y2={STRIP_H - 16}
                stroke="#D5DBE0"
                strokeWidth="1"
              />
              {positions.map((p, i) =>
                visited.includes(p) ? (
                  <circle key={p} cx={xFor(i)} cy={STRIP_H - 16} r="2.5" fill="#A9B7C2" />
                ) : null
              )}
              {walkerPos !== null && (
                <>
                  <circle
                    cx={xFor((walkerPos + steps) / 2)}
                    cy={STRIP_H - 16}
                    r="6"
                    fill="#8A4262"
                  />
                  <text
                    x={PLOT.left}
                    y={16}
                    className="qx-sans"
                    fontSize="12.5"
                    fill="#5C6872"
                  >
                    step {stepIndex} of {steps}, position {walkerPos > 0 ? "+" : ""}
                    {walkerPos}
                  </text>
                </>
              )}
              {walkerPos === null && (
                <text x={PLOT.left} y={16} className="qx-sans" fontSize="12.5" fill="#5C6872">
                  person
                </text>
              )}

              <g transform={`translate(0, ${STRIP_H})`}>
                {[0, 1, 2, 3, 4].map((k) => {
                  const v = (yMax / 4) * k;
                  return (
                    <g key={k}>
                      <line
                        x1={PLOT.left}
                        x2={PLOT.w - PLOT.right}
                        y1={yFor(v)}
                        y2={yFor(v)}
                        stroke={k === 0 ? "#161B22" : "#E1E6EA"}
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
                  );
                })}

                {walks === 0 && (
                  <text
                    x={PLOT.left + INNER_W / 2}
                    y={PLOT.top + INNER_H / 2}
                    textAnchor="middle"
                    className="qx-sans"
                    fontSize="14"
                    fill="#5C6872"
                  >
                    Walk once to see a single ending. Then walk a thousand times.
                  </text>
                )}

                {positions.map((p, i) => {
                  const top = yFor(observed[i]);
                  return (
                    <rect
                      key={p}
                      x={xFor(i) - barW / 2}
                      y={top}
                      width={barW}
                      height={Math.max(0, baseY - top)}
                      fill="#2A4C6B"
                    />
                  );
                })}

                {revealed &&
                  positions.map((p, i) => (
                    <line
                      key={"t" + p}
                      x1={xFor(i) - barW / 2 - (steps <= 30 ? 5 : 1)}
                      x2={xFor(i) + barW / 2 + (steps <= 30 ? 5 : 1)}
                      y1={yFor(theory[i])}
                      y2={yFor(theory[i])}
                      stroke="#8A4262"
                      strokeWidth="2"
                    />
                  ))}

                {positions.map((p, i) =>
                  i % labelEvery === 0 || i === positions.length - 1 ? (
                    <text
                      key={"l" + p}
                      x={xFor(i)}
                      y={baseY + 18}
                      textAnchor="middle"
                      className="qx-sans"
                      fontSize="12"
                      fill="#161B22"
                    >
                      {p > 0 ? "+" + p : p}
                    </text>
                  ) : null
                )}

                {revealed && steps <= 10 &&
                  positions.map((p, i) => (
                    <text
                      key={"r" + p}
                      x={xFor(i)}
                      y={baseY + 34}
                      textAnchor="middle"
                      className="qx-sans"
                      fontSize="11.5"
                      fill="#8A4262"
                    >
                      {routeCount(steps, i).toLocaleString("en-GB")}
                    </text>
                  ))}

                <text
                  x={PLOT.left + INNER_W / 2}
                  y={PLOT.h - 4}
                  textAnchor="middle"
                  className="qx-sans"
                  fontSize="12"
                  fill="#5C6872"
                >
                  {revealed && steps <= 10
                    ? "finishing position, and the number of routes that reach it"
                    : "finishing position, forward to the right of the start"}
                </text>
              </g>
            </svg>
          </div>

          <div className="qx-bar-row" style={{ marginBottom: 0 }}>
            <div className="qx-controls">
              <button className="qx-btn" onClick={walkOnce} disabled={busy}>
                Walk once
              </button>
              <button className="qx-btn" onClick={() => walkMany(100)} disabled={busy}>
                Walk 100 times
              </button>
              <button className="qx-btn" onClick={() => walkMany(1000)} disabled={busy}>
                Walk 1,000 times
              </button>
              <button
                className="qx-btn"
                onClick={() => setRevealed(true)}
                disabled={revealed}
              >
                Show the exact shape
              </button>
              <button className="qx-btn quiet" onClick={() => reset(steps)}>
                Clear
              </button>
            </div>
          </div>

          <p className="qx-note qx-sans" style={{ marginTop: 14 }}>
            {walks === 0 ? (
              "Nothing is loaded here. The coin is fair, and a step forward is exactly as likely as a step back, every single time."
            ) : (
              <>
                Typical distance from the start after {steps} steps:{" "}
                <b>{rms.toFixed(2)}</b>. The square root of {steps} is{" "}
                <b>{Math.sqrt(steps).toFixed(2)}</b>.
              </>
            )}
          </p>
        </div>

        <h2 className="qx-h2">One walk is a story, not a shape</h2>
        <p className="qx-p">
          Walk once and you get a number. The number tells you almost nothing about the
          coin, the same way one roll told you nothing about the die. The interesting
          object is never the ending, it is the pile of endings.
        </p>

        <h2 className="qx-h2">Why the middle is crowded</h2>
        <p className="qx-p">
          Nothing pulls the person towards the centre. The coin has no memory, no
          preference and no idea where the person currently is. The middle fills up for
          one reason only: there are more ways of getting there.
        </p>
        <p className="qx-p">
          Take ten steps. To finish ten steps forward, the coin has to land heads
          ten times in a row, and there is exactly <b>one</b> sequence that does that.
          To finish back where you started you need five steps forward and five back in
          any order, and there are <b>252</b> different sequences that do that. Same coin,
          same ten flips, 252 routes to one destination and a single route to the other.
        </p>
        <p className="qx-p">
          Select 10 steps and press Show the exact shape. The route counts appear under
          the bars. The bell curve is not a law of nature sitting on top of the walk. It
          is the number of routes, drawn to scale.
        </p>

        <h2 className="qx-h2">How far a person actually gets</h2>
        <p className="qx-p">
          Square each person's finishing distance from the start, average those squares,
          then take the square root. That is the ordinary way to measure the spread of a
          pile of numbers, and for this walk it lands on a very clean answer: the square
          root of the number of steps.
        </p>
        <table className="qx-table qx-sans">
          <tbody>
            <tr><td>4 steps</td><td>typical distance 2</td></tr>
            <tr><td>100 steps</td><td>typical distance 10</td></tr>
            <tr><td>10,000 steps</td><td>typical distance 100</td></tr>
          </tbody>
        </table>
        <p className="qx-p">
          A hundred steps leaves the typical person about ten steps from where they started, not fifty. To get
          twice as far you need four times as many steps, which is the same unwelcome
          arithmetic as module one, and it comes from the same place: things that are
          built out of many small independent events pile up slowly.
        </p>

        <h2 className="qx-h2">Three things to hold on to</h2>
        <ul className="qx-list">
          <li>Every route counts. Nothing in this walk removes a possibility.</li>
          <li>
            Routes only ever add. Two routes arriving at the same place make that place
            more likely, never less.
          </li>
          <li>The spread grows like the square root of the number of steps.</li>
        </ul>
        <p className="qx-p">
          In module ten we walk this line again. Same person, same number of steps, and
          a coin that is still perfectly fair. The only thing that changes is what kind
          of thing the coin is.
        </p>
        <p className="qx-p">
          All three statements above stop being true. Routes start cancelling each other
          out, so a second route arriving somewhere can make that place less likely
          instead of more. Destinations with hundreds of routes leading to them come out
          empty, which is why the middle of the line goes hollow. And the spread stops
          following the square root: after a hundred steps the typical person is about
          seventy steps from the start rather than ten.
        </p>
        <p className="qx-p">
          Everything between here and module ten exists to explain how a coin can do
          that.
        </p>

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: the qubit. Two numbers, one constraint you cannot break, and a point you
          can drag.
        </p>
      </div>
    </div>
  );
}
