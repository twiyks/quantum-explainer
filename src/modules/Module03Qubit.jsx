import React, { useState, useRef, useCallback } from "react";
import Quiz from "../components/Quiz.jsx";

const QUIZ_QUESTIONS = [
  {
    q: "A qubit should give result 0 and result 1 each with 50% chance. Someone suggests the state should be (0.5, 0.5). What is wrong with this?",
    options: [
      "Nothing — 0.5 and 0.5 each represent 50%, so the state is correct",
      "The numbers should add to 1, not their squares — so (0.5, 0.5) is actually fine",
      "The squares of the two numbers must add to 1. 0.5² + 0.5² = 0.5, not 1. The correct pair for a 50/50 split is (0.7071, 0.7071)",
      "The two numbers must always be equal, but they should each be 1, not 0.5"
    ],
    answer: 2,
    feedback: [
      "The numbers in a qubit state are not probabilities. The chance of a result is the number squared. 0.5 squared is 0.25, so (0.5, 0.5) gives a 25% chance for each result, which adds to 50%, not 100%.",
      "The rule is that the squares add to 1. If the numbers themselves added to 1, you could have states like (0.9, 0.1) giving 81% and 1% — which adds to 82%, not 100%.",
      "Correct. The chances are the squares of the numbers, and the squares must add to 1 (total chance = 100%). 0.7071² ≈ 0.5, so 0.7071² + 0.7071² = 1. The state (0.5, 0.5) fails this test: 0.25 + 0.25 = 0.5.",
      "(1, 1) fails even more severely: 1² + 1² = 2, not 1."
    ]
  },
  {
    q: "Why does the pair of numbers in a qubit state sit on a circle?",
    options: [
      "Qubits are physically circular, so their states trace out a circle",
      "The two numbers squaring to 1 when added is the equation of a circle — every point satisfying it sits on one",
      "The probabilities must be between 0% and 100%, and plotting that range traces a circle",
      "Rotation is central to how quantum gates work, so the state space must be circular"
    ],
    answer: 1,
    feedback: [
      "The geometry comes from the mathematical constraint on the numbers, not the physical shape of the hardware.",
      "Correct. If you call the two numbers x and y, the rule x² + y² = 1 is Pythagoras. The set of all points (x, y) satisfying this is a circle of radius 1. The qubit state is always one point on that circle.",
      "The numbers are not probabilities — they are something whose squares give probabilities. And the constraint applies to the numbers directly.",
      "Gates are not introduced until module six. The circle geometry follows purely from two numbers satisfying x² + y² = 1."
    ]
  },
  {
    q: "A qubit is in state (0.6000, 0.8000). What is the chance of getting result 1 when measured?",
    options: [
      "80.00% — the second number directly gives the chance of result 1",
      "60.00% — the first number gives the chance of result 0, so result 1 must be 40%",
      "64.00% — the second number corresponds to result 1, and 0.8000² = 0.6400",
      "36.00% — 0.6000² = 0.3600, and result 1 is what remains"
    ],
    answer: 2,
    feedback: [
      "The amplitude is not the probability. The chance is the amplitude squared: 0.8000² = 0.64, which is 64%, not 80%.",
      "0.6000² = 0.36, so result 0 has a 36% chance — not 60%. The remaining chance (64%) goes to result 1, which matches squaring the second number directly.",
      "Correct. The second number (0.8000) corresponds to result 1. Squaring it: 0.8000² = 0.6400, so there is a 64% chance of getting result 1.",
      "0.6000² = 0.36 is the chance of result 0. Result 1 corresponds to the second number, 0.8000."
    ]
  }
];

/*
  Quantum explainer, module 3: the qubit.
  One idea: a qubit's state is a pair of numbers whose squares add to 1.
  The constraint is Pythagoras, so the pair lives on a circle. Measurement
  is deliberately held back until module four. No complex numbers yet, and
  the circle is presented honestly as a circle.
*/

const PAD = 380;
const CX = 190;
const CY = 190;
const R = 140;
const DEG = 180 / Math.PI;

const PRESETS = [
  { label: "all on 0", deg: 0 },
  { label: "all on 1", deg: 90 },
  { label: "even split", deg: 45 },
  { label: "even split, one negative", deg: 135 },
  { label: "a third and two thirds", deg: Math.atan2(Math.sqrt(2 / 3), Math.sqrt(1 / 3)) * (180 / Math.PI) },
];

export default function ModuleThreeQubit() {
  const [deg, setDeg] = useState(35);
  const [ghost, setGhost] = useState(null);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const t = deg / DEG;
  const a = Math.cos(t);
  const b = Math.sin(t);
  const px = CX + R * a;
  const py = CY - R * b;

  const fmt = (v) => (Math.abs(v) < 1e-10 ? "0.0000" : v.toFixed(4));
  const signed = (v) => (v < 0 ? "\u2212" + fmt(Math.abs(v)) : fmt(v));

  const fromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scale = PAD / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    return { x, y };
  }, []);

  const setFromPoint = useCallback((pt) => {
    const dx = pt.x - CX;
    const dy = CY - pt.y;
    let d = Math.atan2(dy, dx) * DEG;
    if (d < 0) d += 360;
    const nearest = Math.round(d / 45) * 45;
    if (Math.abs(d - nearest) < 4) d = nearest % 360;
    setDeg(d);
  }, []);

  function onPointerDown(e) {
    const pt = fromEvent(e);
    if (!pt) return;
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

  function onKeyDown(e) {
    const big = e.shiftKey ? 15 : 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      setDeg((d) => (d + big) % 360);
      e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      setDeg((d) => (d - big + 360) % 360);
      e.preventDefault();
    }
  }

  const negative = a < -1e-10 || b < -1e-10;
  const aSq = a * a;
  const bSq = b * b;
  const barW = 100;

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
        .qx-split { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
        .qx-padwrap {
          background: var(--plot); border: 1px solid var(--rule); border-radius: 2px;
          flex: 1 1 300px; min-width: 260px;
        }
        .qx-svg { display: block; width: 100%; height: auto; touch-action: none; cursor: grab; }
        .qx-svg:active { cursor: grabbing; }
        .qx-readout { flex: 1 1 250px; min-width: 240px; }

        .qx-num { display: flex; justify-content: space-between; align-items: baseline;
          padding: 7px 0; border-bottom: 1px solid #E1E6EA; font-size: 15px; }
        .qx-num span:first-child { color: var(--muted); font-size: 14px; }
        .qx-num span:last-child { font-weight: 500; }
        .qx-num.total {
          border-bottom: none; border-top: 1px solid var(--ink);
          margin-top: 4px; padding-top: 10px; font-size: 17px;
        }
        .qx-num.total span:first-child { color: var(--ink); font-size: 15px; }
        .qx-num.total span:last-child { font-weight: 600; }

        .qx-unitbar { display: flex; height: 22px; margin: 18px 0 6px; border: 1px solid var(--rule); }
        .qx-unitbar div { height: 100%; }
        .qx-barnote { font-size: 13px; color: var(--muted); margin: 0 0 14px; }

        .qx-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .qx-btn {
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums;
          background: #FFFFFF; color: var(--ink);
          border: 1px solid var(--rule); border-radius: 2px;
          padding: 8px 13px; cursor: pointer;
        }
        .qx-btn:hover { border-color: var(--data); color: var(--data); }
        .qx-btn:focus-visible { outline: 2px solid var(--data); outline-offset: 2px; }

        .qx-flag {
          font-size: 13.5px; line-height: 1.5; color: var(--accent);
          margin: 14px 0 0; max-width: 46ch;
        }
        .qx-hint { font-size: 13.5px; color: var(--muted); margin: 14px 0 0; }

        .qx-aside {
          border-left: 2px solid var(--rule); padding: 2px 0 2px 18px;
          margin: 30px 0; max-width: 60ch;
        }
        .qx-aside p { font-size: 16px; line-height: 1.6; color: var(--muted); margin: 0 0 10px; }
        .qx-aside p:last-child { margin-bottom: 0; }
        .qx-aside .qx-eq {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          font-size: 16px; color: var(--ink); font-variant-numeric: tabular-nums;
        }

        .qx-table { width: 100%; border-collapse: collapse; margin: 16px 0 18px; font-size: 15px; }
        .qx-table td { padding: 5px 14px 5px 0; }
        .qx-table td:first-child { color: var(--muted); width: 11em; }

        .qx-rule { border: none; border-top: 1px solid var(--rule); margin: 40px 0 0; }
        .qx-footer { font-size: 15px; color: var(--muted); margin: 18px 0 0; }

        @media (max-width: 560px) {
          .qx-h1 { font-size: 31px; max-width: 18ch; }
          .qx-p { font-size: 17px; }
          .qx-panel { padding: 16px 14px; }
        }
      `}</style>

      <div className="qx-wrap">
        <p className="qx-eyebrow qx-sans">Module three of twelve</p>
        <h1 className="qx-h1">Two numbers and one rule</h1>

        <p className="qx-p lead">
          A bit is a value. It is 0 or it is 1, heads or tails, one thing or the other.
          A qubit, short for quantum bit, is not a value. A qubit still has those same two possible results, 0
          and 1, but instead of being one of them it carries a number for each: one
          number for the 0 result, a second number for the 1 result. Drag the point and
          watch both of them move.
        </p>

        <div className="qx-panel">
          <div className="qx-split">
            <div className="qx-padwrap">
              <svg
                ref={svgRef}
                className="qx-svg"
                viewBox={`0 0 ${PAD} ${PAD}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={onKeyDown}
                tabIndex={0}
                role="slider"
                aria-label="Qubit state angle"
                aria-valuenow={Math.round(deg)}
                aria-valuemin={0}
                aria-valuemax={360}
              >
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#C6CCD2" strokeWidth="1" />
                <line x1={CX - R - 18} x2={CX + R + 18} y1={CY} y2={CY} stroke="#D5DBE0" />
                <line x1={CX} x2={CX} y1={CY - R - 18} y2={CY + R + 18} stroke="#D5DBE0" />

                <text x={CX + R + 6} y={CY + 20} className="qx-sans" fontSize="11.5" fill="#5C6872" textAnchor="end">
                  number for result 0
                </text>
                <text x={CX + 8} y={CY - R - 8} className="qx-sans" fontSize="11.5" fill="#5C6872">
                  number for result 1
                </text>
                <text x={CX + R} y={CY + 16} className="qx-sans" fontSize="11" fill="#8894A0" textAnchor="middle">1</text>
                <text x={CX - R} y={CY + 16} className="qx-sans" fontSize="11" fill="#8894A0" textAnchor="middle">&#8722;1</text>
                <text x={CX - 12} y={CY - R + 4} className="qx-sans" fontSize="11" fill="#8894A0" textAnchor="end">1</text>
                <text x={CX - 12} y={CY + R + 4} className="qx-sans" fontSize="11" fill="#8894A0" textAnchor="end">&#8722;1</text>

                {/* the right triangle: the two numbers are the two short sides */}
                <line x1={CX} x2={px} y1={CY} y2={CY} stroke="#2A4C6B" strokeWidth="2.5" />
                <line x1={px} x2={px} y1={CY} y2={py} stroke="#93A8B8" strokeWidth="2.5" />
                <line x1={CX} x2={px} y1={CY} y2={py} stroke="#161B22" strokeWidth="1" strokeDasharray="3 3" />

                {ghost && (
                  <>
                    <line x1={ghost.x} y1={ghost.y} x2={px} y2={py} stroke="#C6CCD2" strokeWidth="1" />
                    <circle cx={ghost.x} cy={ghost.y} r="3.5" fill="#C6CCD2" />
                  </>
                )}

                <circle cx={px} cy={py} r="7" fill="#8A4262" />

                <text x={16} y={26} className="qx-sans" fontSize="12.5" fill="#5C6872">
                  angle {deg.toFixed(1)}&#176;
                </text>
              </svg>
            </div>

            <div className="qx-readout qx-sans">
              <div className="qx-num">
                <span>number for the 0 result</span>
                <span style={{ color: "#2A4C6B" }}>{signed(a)}</span>
              </div>
              <div className="qx-num">
                <span>number for the 1 result</span>
                <span style={{ color: "#5C6872" }}>{signed(b)}</span>
              </div>
              <div className="qx-num">
                <span>that number squared</span>
                <span style={{ color: "#2A4C6B" }}>{fmt(aSq)}</span>
              </div>
              <div className="qx-num">
                <span>and that one squared</span>
                <span style={{ color: "#5C6872" }}>{fmt(bSq)}</span>
              </div>
              <div className="qx-num total">
                <span>the two squares added</span>
                <span>{fmt(aSq + bSq)}</span>
              </div>

              <div className="qx-unitbar">
                <div style={{ width: `${aSq * barW}%`, background: "#2A4C6B" }} />
                <div style={{ width: `${bSq * barW}%`, background: "#93A8B8" }} />
              </div>
              <p className="qx-barnote">
                The two squares, stacked. The bar is always exactly full.
              </p>

              <div className="qx-controls">
                {PRESETS.map((p) => (
                  <button key={p.label} className="qx-btn" onClick={() => setDeg(p.deg)}>
                    {p.label}
                  </button>
                ))}
              </div>

              {negative ? (
                <p className="qx-flag">
                  One of these numbers is now negative. Squaring removes the minus sign,
                  so the rule holds exactly as before. Whether the minus sign matters for
                  anything else is module five.
                </p>
              ) : (
                <p className="qx-hint">
                  Drag anywhere in the square, including outside the circle. Arrow keys
                  work too.
                </p>
              )}
            </div>
          </div>
        </div>

        <h2 className="qx-h2">The rule you cannot break</h2>
        <p className="qx-p">
          Those two numbers taken together are called the qubit's state. A particular
          qubit might have 0.5774 for the 0 result and 0.8165 for the 1 result, and that
          pair is the object we are talking about. There is no hidden value underneath
          it, no secret 0 or 1 sitting behind the numbers waiting to be uncovered.
        </p>
        <p className="qx-p">
          You can put the point anywhere on that circle. You cannot put it anywhere else.
          Drag outside and it drops straight back onto the ring, because the pair of
          numbers has to satisfy one condition: square them both, add the squares, get 1.
          Not 0.98. Not 1.02. Exactly 1, at every position, forever.
        </p>
        <p className="qx-p">
          Which is where those two example numbers come from, because they look arbitrary
          and are not. Suppose you want a qubit that leans towards 1, roughly one third to
          two thirds. The obvious pair to reach for is 0.33 and 0.67. Square those and you
          get 0.1089 and 0.4489, which add up to 0.5578, so that pair breaks the rule and
          there is no point on the circle for it. The pair that actually gives you a one
          third to two thirds split is 0.5774 and 0.8165, because those square to 0.3333
          and 0.6667. Press the third and two thirds preset in the panel and watch the
          squares land on exactly those values.
        </p>
        <p className="qx-p">
          The angle that does it is 54.7 degrees, not 55. Drag to a whole 55 and the
          squares read 0.3290 and 0.6710 instead, which is close enough for most
          purposes and is still not a third. Nothing in this subject rounds in your
          favour, and it is worth getting used to that early.
        </p>
        <p className="qx-p">
          Any split you have in mind lives in the squares. It never lives in the two
          numbers themselves, and a pair that looks like the split you wanted is almost
          certainly not a legal state at all.
        </p>
        <p className="qx-p">
          That condition is not quantum mysticism bolted onto the numbers. It is
          Pythagoras' theorem, the school rule about right angled triangles: square the
          two short sides, add them together, and you get the square of the long side.
        </p>
        <p className="qx-p">
          The two solid lines in the panel are the short sides. The dashed line is the
          long one, and it is always exactly 1 because it is the radius of the circle. So
          the two squares always add to 1. The rule and the circle are the same fact said
          twice.
        </p>

        <h2 className="qx-h2">The number that will keep coming back</h2>
        <p className="qx-p">
          Press the even split preset. Both numbers read 0.7071, and both squares read
          0.5000. That is the only pair of identical positive numbers that can satisfy
          the rule, and 0.7071 is going to appear in nearly every module from here on.
        </p>
        <table className="qx-table qx-sans">
          <tbody>
            <tr><td>0.7071 squared</td><td>0.5</td></tr>
            <tr><td>0.5 plus 0.5</td><td>1</td></tr>
            <tr><td>the square root of 0.5</td><td>0.7071</td></tr>
          </tbody>
        </table>
        <p className="qx-p">
          It is worth doing that arithmetic yourself once, on a calculator, rather than
          taking my word for it. The number looks arbitrary and is not. It is simply what
          you get when you split something evenly between two places and the rule is about
          squares rather than about the numbers themselves.
        </p>

        <h2 className="qx-h2">What the squares are for</h2>
        <p className="qx-p">
          You now have a sensible question: why squares? Why should a state be described
          by two numbers that are awkward, when the squares are tidy and add up to
          something that looks like a percentage split?
        </p>
        <p className="qx-p">
          Hold that thought until the next module, because the answer is the whole of it.
          Short version: the squares are the only part of this you will ever be able to
          observe. The numbers themselves are real, they do the work, and you cannot see
          them directly.
        </p>

        <h2 className="qx-h2">Why this is a circle and not a sphere</h2>
        <p className="qx-p">
          Many articles about quantum computing explain a qubit using a sphere with an
          arrow in it, known as a Bloch sphere. This is not that, yet, and the difference
          is honest rather than a simplification. Two numbers whose squares add to 1
          describe a circle. That is all the geometry two numbers can support.
        </p>
        <p className="qx-p">
          The sphere appears later in the series, when there is a third quantity that
          deserves an axis of its own. At that point the circle grows a direction and
          becomes the picture you have seen elsewhere, and you will know exactly what the
          new direction represents rather than accepting it as decoration. Until then, a
          circle is the truthful picture.
        </p>

        <div className="qx-aside">
          <p>A quantum state is written like this:</p>
          <p className="qx-eq">0.7071 |0&#10217; + 0.7071 |1&#10217;</p>
          <p>
            The vertical line and the angled bracket are a matched pair, an opening mark
            and a closing mark like any other bracket, and whatever sits between them is
            a label. So |0&#10217; is the label for the 0 result, |1&#10217; is the label
            for the 1 result, and each one has its number written in front of it. The
            line says 0.7071 for the 0 result and 0.7071 for the 1 result, and that is
            its whole content.
          </p>
          <p>
            The pair of marks is called a ket, which is the back end of the word bracket.
            That is genuinely where the name comes from.
          </p>
          <p>
            It reads like a sum because it is one. Three miles east plus two miles north
            is a sum in the same way, and you can collapse that into a single arrow
            pointing north east. The quantum version collapses too, and you have already
            seen what it collapses into: the point on the circle, with the extra rule
            that the arrow is always exactly one unit long.
          </p>
          <p>
            The two forms are the same object written two ways. The point is easier to
            look at. The written line keeps the two numbers visible and separate, which
            is the form you need once things start being done to the two numbers
            separately, and which is why in module seven two numbers meeting at a plus
            sign can cancel each other to nothing.
          </p>
          <p>
            The numbers have a name. They are called amplitudes, and the word is worth
            keeping at arm's length until module five, because most of what people assume
            it means is wrong.
          </p>
        </div>

        <Quiz questions={QUIZ_QUESTIONS} />

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: measurement. The moment a pair of numbers turns into a single bit, and the
          pair is gone.
        </p>
      </div>
    </div>
  );
}
