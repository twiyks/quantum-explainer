import React, { useState, useRef, useCallback, useEffect } from "react";

/*
  Quantum explainer, module 4: measurement.
  One idea: the only thing you can ever get out of a qubit is a single bit,
  the chance of each result is the square of its number, and the qubit is
  left sitting on whichever result came up.

  Terms defined here: measurement, chance/probability.
  Terms deliberately absent: gate, circuit, interference, superposition.
*/

const PAD = 300;
const CX = 150;
const CY = 150;
const R = 108;
const DEG = 180 / Math.PI;

const PRESETS = [
  { label: "all on 0", deg: 0 },
  { label: "all on 1", deg: 90 },
  { label: "even split", deg: 45 },
  { label: "even split, one negative", deg: 135 },
  {
    label: "a third and two thirds",
    deg: Math.atan2(Math.sqrt(2 / 3), Math.sqrt(1 / 3)) * DEG,
  },
];

const TALLY = { w: 300, h: 190, left: 44, right: 10, top: 14, bottom: 34 };
const TW = TALLY.w - TALLY.left - TALLY.right;
const TH = TALLY.h - TALLY.top - TALLY.bottom;

export default function ModuleFourMeasurement() {
  const [deg, setDeg] = useState(45);
  const [ghost, setGhost] = useState(null);
  const [locked, setLocked] = useState(null);
  const [repeats, setRepeats] = useState(0);
  const [counts, setCounts] = useState([0, 0]);
  const [shots, setShots] = useState(0);
  const [busy, setBusy] = useState(false);
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const timer = useRef(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => () => clearInterval(timer.current), []);

  const t = deg / DEG;
  const a = Math.cos(t);
  const b = Math.sin(t);
  const p0 = a * a;
  const p1 = b * b;

  const shownDeg = locked === 0 ? 0 : locked === 1 ? 90 : deg;
  const st = shownDeg / DEG;
  const px = CX + R * Math.cos(st);
  const py = CY - R * Math.sin(st);

  const fmt = (v) => (Math.abs(v) < 1e-10 ? "0.0000" : v.toFixed(4));
  const signed = (v) => (v < 0 ? "\u2212" + fmt(Math.abs(v)) : fmt(v));
  const pct = (v) => (v * 100).toFixed(2) + "%";

  function reprepare(nextDeg) {
    clearInterval(timer.current);
    setBusy(false);
    setLocked(null);
    setRepeats(0);
    if (nextDeg !== undefined && nextDeg !== deg) {
      setDeg(nextDeg);
      setCounts([0, 0]);
      setShots(0);
    }
  }

  const fromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scale = PAD / rect.width;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  }, []);

  function setFromPoint(pt) {
    const dx = pt.x - CX;
    const dy = CY - pt.y;
    let d = Math.atan2(dy, dx) * DEG;
    if (d < 0) d += 360;
    const nearest = Math.round(d / 45) * 45;
    if (Math.abs(d - nearest) < 4) d = nearest % 360;
    setDeg(d);
    setLocked(null);
    setRepeats(0);
    setCounts([0, 0]);
    setShots(0);
  }

  function onPointerDown(e) {
    const pt = fromEvent(e);
    if (!pt || busy) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setGhost(pt);
    setFromPoint(pt);
  }
  function onPointerMove(e) {
    if (!dragging.current) return;
    const pt = fromEvent(e);
    if (!pt) return;
    setGhost(pt);
    setFromPoint(pt);
  }
  function onPointerUp() {
    dragging.current = false;
    setGhost(null);
  }

  function measureOnce() {
    if (busy) return;
    if (locked !== null) {
      setRepeats((r) => r + 1);
      return;
    }
    const result = Math.random() < p0 ? 0 : 1;
    setLocked(result);
    setCounts((c) => (result === 0 ? [c[0] + 1, c[1]] : [c[0], c[1] + 1]));
    setShots((s) => s + 1);
  }

  function batch(n) {
    if (busy) return;
    setLocked(null);
    setRepeats(0);
    const run = (k) => {
      let zeros = 0;
      for (let i = 0; i < k; i++) if (Math.random() < p0) zeros += 1;
      setCounts((c) => [c[0] + zeros, c[1] + (k - zeros)]);
      setShots((s) => s + k);
    };
    if (reduced) {
      run(n);
      return;
    }
    const frames = 20;
    const per = Math.floor(n / frames);
    const rem = n - per * frames;
    let done = 0;
    setBusy(true);
    timer.current = setInterval(() => {
      run(done === 0 ? per + rem : per);
      done += 1;
      if (done >= frames) {
        clearInterval(timer.current);
        setBusy(false);
      }
    }, 28);
  }

  const obs = [
    shots > 0 ? counts[0] / shots : 0,
    shots > 0 ? counts[1] / shots : 0,
  ];
  const yMaxT = 1;
  const yT = (v) => TALLY.top + TH * (1 - v / yMaxT);

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
          --data-soft: #93A8B8;
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
          border-radius: 3px; padding: 22px; margin: 28px 0 30px;
        }
        .qx-sans {
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-variant-numeric: tabular-nums;
        }
        .qx-split { display: flex; gap: 22px; align-items: flex-start; flex-wrap: wrap; }
        .qx-col { flex: 1 1 280px; min-width: 260px; }
        .qx-framed { background: var(--plot); border: 1px solid var(--rule); border-radius: 2px; }
        .qx-svg { display: block; width: 100%; height: auto; touch-action: none; }
        .qx-svg.grab { cursor: grab; }
        .qx-svg.grab:active { cursor: grabbing; }

        .qx-num { display: flex; justify-content: space-between; align-items: baseline;
          padding: 6px 0; border-bottom: 1px solid #E1E6EA; font-size: 15px; }
        .qx-num span:first-child { color: var(--muted); font-size: 14px; }
        .qx-num span:last-child { font-weight: 500; }

        .qx-result {
          border: 1px solid var(--rule); background: #FFFFFF; border-radius: 2px;
          padding: 12px 14px; margin: 14px 0; min-height: 58px;
        }
        .qx-result .big { font-size: 30px; font-weight: 600; line-height: 1.1; }
        .qx-result .sub { font-size: 13px; color: var(--muted); margin-top: 4px; line-height: 1.45; }
        .qx-result .waiting { font-size: 15px; color: var(--muted); }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
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
        .qx-btn.primary { background: var(--data); border-color: var(--data); color: #FFFFFF; }
        .qx-btn.primary:hover:not(:disabled) { color: #FFFFFF; opacity: 0.9; }
        .qx-btn.quiet { background: transparent; color: var(--muted); }
        .qx-seglabel { font-size: 13px; color: var(--muted); width: 100%; margin: 14px 0 -4px; }

        .qx-note { font-size: 13.5px; line-height: 1.5; color: var(--muted); margin: 12px 0 0; }
        .qx-note b { color: var(--ink); font-weight: 600; }
        .qx-flag { font-size: 13.5px; line-height: 1.5; color: var(--accent); margin: 12px 0 0; }

        .qx-aside {
          border-left: 2px solid var(--rule); padding: 2px 0 2px 18px;
          margin: 30px 0; max-width: 60ch;
        }
        .qx-aside p { font-size: 16px; line-height: 1.6; color: var(--muted); margin: 0 0 10px; }
        .qx-aside p:last-child { margin-bottom: 0; }

        .qx-table { width: 100%; border-collapse: collapse; margin: 16px 0 18px; font-size: 15px; }
        .qx-table td { padding: 5px 14px 5px 0; }
        .qx-table td:first-child { color: var(--muted); width: 13em; }

        .qx-rule { border: none; border-top: 1px solid var(--rule); margin: 40px 0 0; }
        .qx-footer { font-size: 15px; color: var(--muted); margin: 18px 0 0; }

        @media (max-width: 560px) {
          .qx-h1 { font-size: 31px; max-width: 18ch; }
          .qx-p { font-size: 17px; }
          .qx-panel { padding: 16px 14px; }
        }
      `}</style>

      <div className="qx-wrap">
        <p className="qx-eyebrow qx-sans">Module four of twelve</p>
        <h1 className="qx-h1">Asking a question that only has two answers</h1>

        <p className="qx-p lead">
          The qubit from the last module is still here, with its two numbers. You cannot
          read those numbers. Nobody can. The only thing a quantum computer will ever hand
          you is a single bit: a 0 or a 1. Set the qubit up however you like, then press
          Measure and see what comes back.
        </p>

        <div className="qx-panel">
          <div className="qx-split">
            <div className="qx-col">
              <div className="qx-framed">
                <svg
                  ref={svgRef}
                  className={"qx-svg" + (locked === null ? " grab" : "")}
                  viewBox={`0 0 ${PAD} ${PAD}`}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  role="img"
                  aria-label="The prepared qubit on its circle"
                >
                  <circle cx={CX} cy={CY} r={R} fill="none" stroke="#C6CCD2" />
                  <line x1={CX - R - 14} x2={CX + R + 14} y1={CY} y2={CY} stroke="#D5DBE0" />
                  <line x1={CX} x2={CX} y1={CY - R - 14} y2={CY + R + 14} stroke="#D5DBE0" />
                  <text x={CX + R + 4} y={CY + 18} textAnchor="end" className="qx-sans" fontSize="11" fill="#5C6872">
                    number for result 0
                  </text>
                  <text x={CX + 6} y={CY - R - 6} className="qx-sans" fontSize="11" fill="#5C6872">
                    number for result 1
                  </text>

                  <line x1={CX} x2={px} y1={CY} y2={CY} stroke="#2A4C6B" strokeWidth="2.5" />
                  <line x1={px} x2={px} y1={CY} y2={py} stroke="#93A8B8" strokeWidth="2.5" />

                  {ghost && locked === null && (
                    <>
                      <line x1={ghost.x} y1={ghost.y} x2={px} y2={py} stroke="#C6CCD2" />
                      <circle cx={ghost.x} cy={ghost.y} r="3.5" fill="#C6CCD2" />
                    </>
                  )}

                  <circle cx={px} cy={py} r="7" fill={locked === null ? "#8A4262" : "#161B22"} />

                  <text x={12} y={22} className="qx-sans" fontSize="12" fill="#5C6872">
                    {locked === null
                      ? "prepared, not yet measured"
                      : `measured, now sitting on ${locked}`}
                  </text>
                </svg>
              </div>

              <div className="qx-controls">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    className="qx-btn"
                    onClick={() => reprepare(p.deg)}
                    disabled={busy}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="qx-num" style={{ marginTop: 16 }}>
                <span>number for the 0 result</span>
                <span style={{ color: "#2A4C6B" }}>{signed(locked === null ? a : locked === 0 ? 1 : 0)}</span>
              </div>
              <div className="qx-num">
                <span>number for the 1 result</span>
                <span style={{ color: "#5C6872" }}>{signed(locked === null ? b : locked === 1 ? 1 : 0)}</span>
              </div>
              <div className="qx-num">
                <span>chance of getting 0</span>
                <span style={{ color: "#2A4C6B" }}>{pct(locked === null ? p0 : locked === 0 ? 1 : 0)}</span>
              </div>
              <div className="qx-num">
                <span>chance of getting 1</span>
                <span style={{ color: "#5C6872" }}>{pct(locked === null ? p1 : locked === 1 ? 1 : 0)}</span>
              </div>
            </div>

            <div className="qx-col qx-sans">
              <div className="qx-result">
                {locked === null ? (
                  <div className="waiting">Nothing measured yet.</div>
                ) : (
                  <>
                    <div className="big" style={{ color: "#8A4262" }}>{locked}</div>
                    <div className="sub">
                      {repeats === 0
                        ? "One bit. That is the entire output."
                        : `Measured again ${repeats === 1 ? "once" : repeats + " times"} without re-preparing, and it has come back ${locked} every single time.`}
                    </div>
                  </>
                )}
              </div>

              <div className="qx-controls" style={{ marginTop: 0 }}>
                <button className="qx-btn primary" onClick={measureOnce} disabled={busy}>
                  {locked === null ? "Measure" : "Measure the same qubit again"}
                </button>
                {locked !== null && (
                  <button className="qx-btn" onClick={() => reprepare()} disabled={busy}>
                    Prepare a fresh one
                  </button>
                )}
              </div>

              <p className="qx-seglabel">many runs</p>
              <div className="qx-controls" style={{ marginTop: 4 }}>
                <button className="qx-btn" onClick={() => batch(100)} disabled={busy}>
                  Prepare and measure 100 times
                </button>
                <button className="qx-btn" onClick={() => batch(1000)} disabled={busy}>
                  1,000 times
                </button>
                <button
                  className="qx-btn quiet"
                  onClick={() => {
                    setCounts([0, 0]);
                    setShots(0);
                  }}
                  disabled={busy}
                >
                  Clear
                </button>
              </div>

              <div className="qx-framed" style={{ marginTop: 14 }}>
                <svg
                  className="qx-svg"
                  viewBox={`0 0 ${TALLY.w} ${TALLY.h}`}
                  role="img"
                  aria-label={`Tally of ${shots} measurements`}
                >
                  {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                    <g key={v}>
                      <line
                        x1={TALLY.left}
                        x2={TALLY.w - TALLY.right}
                        y1={yT(v)}
                        y2={yT(v)}
                        stroke={v === 0 ? "#161B22" : "#E1E6EA"}
                      />
                      <text
                        x={TALLY.left - 8}
                        y={yT(v) + 4}
                        textAnchor="end"
                        className="qx-sans"
                        fontSize="11"
                        fill="#5C6872"
                      >
                        {v * 100}%
                      </text>
                    </g>
                  ))}
                  {[0, 1].map((i) => {
                    const slot = TW / 2;
                    const cx = TALLY.left + slot * i + slot / 2;
                    const top = yT(obs[i]);
                    const truth = i === 0 ? p0 : p1;
                    return (
                      <g key={i}>
                        <rect
                          x={cx - 34}
                          y={top}
                          width={68}
                          height={Math.max(0, yT(0) - top)}
                          fill={i === 0 ? "#2A4C6B" : "#93A8B8"}
                        />
                        {shots > 0 && (
                          <text x={cx} y={top - 6} textAnchor="middle" className="qx-sans" fontSize="12" fill="#161B22">
                            {(obs[i] * 100).toFixed(1)}%
                          </text>
                        )}
                        <line
                          x1={cx - 42}
                          x2={cx + 42}
                          y1={yT(truth)}
                          y2={yT(truth)}
                          stroke="#8A4262"
                          strokeWidth="2"
                        />
                        <text x={cx} y={yT(0) + 18} textAnchor="middle" className="qx-sans" fontSize="12.5" fill="#161B22">
                          {i}
                        </text>
                      </g>
                    );
                  })}
                  {shots === 0 && (
                    <text
                      x={TALLY.left + TW / 2}
                      y={TALLY.top + TH / 2}
                      textAnchor="middle"
                      className="qx-sans"
                      fontSize="12.5"
                      fill="#5C6872"
                    >
                      no measurements yet
                    </text>
                  )}
                </svg>
              </div>
              <p className="qx-note">
                {shots === 0 ? (
                  <>The plum marks are the two chances, squared straight off the numbers on the left.</>
                ) : (
                  <>
                    <b>{shots.toLocaleString("en-GB")}</b> measurements, which needed{" "}
                    <b>{shots.toLocaleString("en-GB")}</b> separately prepared qubits. The
                    plum marks are where the bars are heading.
                  </>
                )}
              </p>
              {b < -1e-10 || a < -1e-10 ? (
                <p className="qx-flag">
                  One of the two numbers is negative, and the plum marks have not moved.
                  Hold on to that.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <h2 className="qx-h2">Where the chances come from</h2>
        <p className="qx-p">
          Square the number for a result, and that is the chance of getting it. That is
          the whole rule, and it is the reason the squares were worth watching in the last
          module.
        </p>
        <table className="qx-table qx-sans">
          <tbody>
            <tr><td>even split</td><td>0.7071 squared is 0.5, so a 50% chance of each</td></tr>
            <tr><td>a third and two thirds</td><td>0.5774 squared is 0.3333, so a 33.33% chance of 0</td></tr>
            <tr><td>all on 0</td><td>1 squared is 1, so a 100% chance of 0 and no surprises</td></tr>
          </tbody>
        </table>
        <p className="qx-p">
          Now the rule from module three stops looking arbitrary. The chances of the two
          results have to add up to 1, because something has to happen. The squares are
          the chances. So the squares have to add up to 1. The circle was never a quantum
          fact, it was bookkeeping.
        </p>

        <h2 className="qx-h2">One qubit, one answer</h2>
        <p className="qx-p">
          Measure, then press Measure again without preparing a fresh one. The same
          result comes back, and it will keep coming back forever. Look at the numbers on
          the left while you do it: whichever result you got now has 1 next to it, and the
          other has 0. Everything you dialled in has gone.
        </p>
        <p className="qx-p">
          This is where the loaded die from module one has to be handed back. A die
          survives being rolled. You can roll the same die ten thousand times and slowly
          learn its hidden percentages, and the die does not care. A qubit is not like
          that. One preparation gives you exactly one bit, and then the thing you prepared
          is no longer there to ask again.
        </p>
        <p className="qx-p">
          Which is why the buttons say prepare and measure. Those thousand bars in the
          tally are not one qubit measured a thousand times. They are a thousand qubits,
          each built to the same specification, each asked once, each finished.
        </p>

        <h2 className="qx-h2">What measuring can never tell you</h2>
        <p className="qx-p">
          Press even split and run a thousand measurements. Then press even split, one
          negative, and run a thousand more. Both come out at roughly fifty fifty, because
          squaring a negative number gives the same answer as squaring the positive one.
          Minus 0.7071 squared is 0.5, exactly like 0.7071 squared.
        </p>
        <p className="qx-p">
          So those two qubits are genuinely different objects, sitting at different places
          on the circle, holding different pairs of numbers, and no amount of measuring
          will ever separate them. Not a thousand runs, not a billion. The difference is
          real and it is invisible.
        </p>
        <p className="qx-p">
          That should feel like a problem. If a difference can never be observed, a
          reasonable person concludes it is not a difference worth having. The next module
          is about why that reasonable conclusion is wrong, and it is the point where this
          stops being probability with unusual notation.
        </p>

        <div className="qx-aside">
          <p>
            A note on the word measurement, because it is doing something odd here. In
            ordinary life, measuring is passive. You put a ruler against a table and the
            table is unaffected, and the number you get was true before you looked.
          </p>
          <p>
            Neither half of that holds here. The result did not exist before you asked,
            and asking leaves the qubit somewhere else. Physicists kept the word anyway.
            It is the single most misleading piece of vocabulary in the subject and you
            are stuck with it.
          </p>
        </div>

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: the two numbers get their proper name, and the invisible difference turns
          out to be the most important thing about them.
        </p>
      </div>
    </div>
  );
}
