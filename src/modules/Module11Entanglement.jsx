import React, { useState } from "react";
import Quiz from "../components/Quiz.jsx";

/*
  Quantum explainer, module 11: entanglement, and the sphere.
  Two ideas forced into one module by the plan:
  (1) The circle grows into the Bloch sphere via complex amplitudes.
      The sphere angle doubles — acknowledged explicitly (CLAUDE.md debt).
  (2) The Bell state names the correlated two-qubit state from module 9.
      Entanglement defined as inability to factorise.

  Terms defined here: phase, Bloch sphere (full treatment), entanglement.
  Terms deliberately absent: noise, depth (12).
*/

const INV_SQRT2 = 1 / Math.sqrt(2); // 0.7071...

// Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
const BELL = { a00: INV_SQRT2, a01: 0, a10: 0, a11: INV_SQRT2 };

// Measure qubit 1 in Bell state:
// P(q1=0) = a00² + a01² = 0.5  → collapses to |00⟩
// P(q1=1) = a10² + a11² = 0.5  → collapses to |11⟩
function measureQ1() {
  return Math.random() < 0.5 ? 0 : 1;
}

// Bloch sphere: static SVG diagram
function BlochSphere() {
  const cx = 120, cy = 118, r = 78;

  // Oblique projection. 3D (X right, Y into-page, Z up) → 2D screen.
  // screen_x = cx + r*(X - 0.35*Y)
  // screen_y = cy - r*(Z - 0.18*Y)
  function proj(X, Y, Z) {
    return [cx + r * (X - 0.35 * Y), cy - r * (Z - 0.18 * Y)];
  }

  const north = proj(0, 0, 1);      // |0⟩
  const south = proj(0, 0, -1);     // |1⟩
  const xFront = proj(1, 0, 0);     // +X = H|0⟩ front equator
  const xBack = proj(-1, 0, 0);     // -X = H|1⟩ back equator
  const yRight = proj(0, 1, 0);     // +Y = symmetric walk coin (into page)
  const yLeft = proj(0, -1, 0);     // -Y (out of page)

  // Equatorial ellipse semi-axes after projection:
  // X direction stays horizontal → rx ≈ r
  // Y direction foreshortened → ry ≈ r*0.18 in vertical, r*0.35 in horizontal
  // Approximate as: rx=r, ry=r*0.21
  const eRx = r;
  const eRy = Math.round(r * 0.21);

  const f = (n) => n.toFixed(1);
  const dot = (p, fill, r2 = 5) =>
    <circle cx={f(p[0])} cy={f(p[1])} r={r2} fill={fill} />;

  return (
    <svg viewBox="0 0 240 240" style={{ width: "100%", maxWidth: 240, height: "auto", display: "block" }} aria-hidden="true">
      {/* Sphere outline */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#C6CCD2" strokeWidth="1.5" />

      {/* Back equatorial ellipse (dashed) */}
      <ellipse cx={cx} cy={cy} rx={eRx} ry={eRy} fill="none" stroke="#C6CCD2" strokeWidth="1" strokeDasharray="4 3" />

      {/* Z axis */}
      <line x1={cx} y1={north[1] - 10} x2={cx} y2={south[1] + 10} stroke="#C6CCD2" strokeWidth="1" />

      {/* X axis (equator horizontal) */}
      <line x1={xBack[0] - 6} y1={cy} x2={xFront[0] + 6} y2={cy} stroke="#C6CCD2" strokeWidth="1" />

      {/* Y axis (oblique, dashed into page) */}
      <line x1={cx} y1={cy} x2={f(yRight[0])} y2={f(yRight[1])} stroke="#C6CCD2" strokeWidth="1" strokeDasharray="3 2" />
      <line x1={cx} y1={cy} x2={f(yLeft[0])} y2={f(yLeft[1])} stroke="#C6CCD2" strokeWidth="1" />

      {/* Front equatorial arc (solid override) */}
      <path
        d={`M ${f(xBack[0])} ${cy} A ${eRx} ${eRy} 0 0 1 ${f(xFront[0])} ${cy}`}
        fill="none" stroke="#C6CCD2" strokeWidth="1.5"
      />

      {/* State dots */}
      {dot(north, "#2A4C6B")}
      {dot(south, "#2A4C6B")}
      {dot(xFront, "#2A4C6B", 4)}
      {dot(xBack, "#5C6872", 4)}
      {dot(yRight, "#8A4262", 4.5)}
      {dot(yLeft, "#93A8B8", 3.5)}

      {/* Labels */}
      <text x={cx + 6} y={north[1] - 8} fontFamily="IBM Plex Sans, sans-serif" fontSize="11" fontWeight="600" fill="#2A4C6B">|0⟩</text>
      <text x={cx + 6} y={south[1] + 16} fontFamily="IBM Plex Sans, sans-serif" fontSize="11" fontWeight="600" fill="#2A4C6B">|1⟩</text>
      <text x={f(xFront[0]) + 6} y={cy + 4} fontFamily="IBM Plex Sans, sans-serif" fontSize="9.5" fill="#2A4C6B">H|0⟩</text>
      <text x={f(xBack[0]) - 34} y={cy - 4} fontFamily="IBM Plex Sans, sans-serif" fontSize="9.5" fill="#5C6872">H|1⟩</text>
      <text x={f(yRight[0]) + 4} y={f(yRight[1]) + 4} fontFamily="IBM Plex Sans, sans-serif" fontSize="9.5" fill="#8A4262">+Y coin</text>
      <text x={f(yLeft[0]) - 36} y={f(yLeft[1]) - 4} fontFamily="IBM Plex Sans, sans-serif" fontSize="9.5" fill="#93A8B8">&minus;Y</text>

      {/* Axis labels */}
      <text x={cx + 2} y={north[1] - 18} fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#C6CCD2">Z</text>
      <text x={f(xFront[0]) + 7} y={cy - 6} fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#C6CCD2">X</text>
      <text x={f(yLeft[0]) - 12} y={f(yLeft[1]) + 14} fontFamily="IBM Plex Sans, sans-serif" fontSize="9" fill="#C6CCD2">Y</text>
    </svg>
  );
}

const QUIZ_QUESTIONS = [
  {
    q: "Two states: (0.7071, 0.7071) and (0.7071, i\u22C50.7071). Both give 50% chance of each result. How do they differ?",
    options: [
      "They do not differ \u2014 identical measurement statistics means identical states",
      "They have different phases: the second has an imaginary component in amp\u2081, placing it at a different point on the Bloch sphere",
      "The second state is invalid because amplitudes must be real numbers",
      "The second state gives 100% result 1 because the imaginary part adds to the chance"
    ],
    answer: 1,
    feedback: [
      "Measurement statistics only reveal the squared magnitudes. Two states can share those and differ in phase \u2014 the difference shows up under gates, as the quantum walk demonstrated.",
      "Correct. (0.7071, 0.7071) is on the +X axis of the sphere. (0.7071, i\u00B70.7071) is on the +Y axis. Same measurement chances, different phase, different behaviour under subsequent gates.",
      "Amplitudes can be complex. Module 3\u2019s circle used real numbers because complex numbers were not yet needed. The sphere requires them.",
      "The chance is the squared magnitude: |i\u00B70.7071|\u00B2 = 0.7071\u00B2 = 0.5. The imaginary unit i has magnitude 1, so it does not change the squared magnitude."
    ]
  },
  {
    q: "On the old circle, |0\u27E9 and |1\u27E9 were 90\u00B0 apart. On the Bloch sphere they are 180\u00B0 apart. Why?",
    options: [
      "The sphere uses a different unit of angle",
      "The state on the sphere is cos(\u03B8/2)|0\u27E9 + sin(\u03B8/2)|1\u27E9. For |1\u27E9, sin(\u03B8/2) must equal 1, so \u03B8/2 = 90\u00B0, making \u03B8 = 180\u00B0",
      "The sphere adds an extra dimension which stretches all angles",
      "It is a convention choice and has no physical meaning"
    ],
    answer: 1,
    feedback: [
      "The sphere uses the same degrees. The doubling comes from how amplitudes are parametrised, not from a change of unit.",
      "Correct. The sphere parametrises amp\u2080 = cos(\u03B8/2). On the old circle, amp\u2080 = cos(\u03C6). So \u03B8 = 2\u03C6. A 90\u00B0 step on the circle (\u03C6) corresponds to a 180\u00B0 step on the sphere (\u03B8). The angle doubles.",
      "The extra dimension is phase, not an angle-stretching. The doubling is specifically in how the polar angle relates to the amplitude.",
      "The doubling has physical consequences: gates that produce 360\u00B0 rotations on the sphere return a qubit to its original state, but with a sign change. At 720\u00B0 it fully returns. This is a measurable physical fact, not a convention."
    ]
  },
  {
    q: "The Bell state is measured: qubit 1 gives result 0. What can you say about qubit 2 before looking at it?",
    options: [
      "Nothing \u2014 qubit 2 is independent and could give either result",
      "Qubit 2 is certainly 0 \u2014 the Bell state links the two qubits so their results always agree",
      "Qubit 2 is certainly 1 \u2014 measuring one qubit flips the other",
      "Qubit 2 has a 75% chance of being 0 \u2014 the measurement shifts the odds but does not lock them"
    ],
    answer: 1,
    feedback: [
      "The qubits are entangled. The Bell state cannot be written as a product of two independent qubit states. Measuring one tells you the other with certainty.",
      "Correct. In the Bell state |00\u27E9 and |11\u27E9 are the only outcomes. Once qubit 1 is measured as 0, the state is |00\u27E9 with certainty, so qubit 2 is certainly 0.",
      "The Bell state used here is |00\u27E9 + |11\u27E9. The two qubits agree, not disagree. A different Bell state, |01\u27E9 + |10\u27E9, would produce the anticorrelated result.",
      "Entanglement does not shift odds \u2014 it locks them completely once one qubit is measured. The chance was 50/50 before any measurement; after it is 100/0."
    ]
  }
];

export default function ModuleElevenEntanglement() {
  const [tally, setTally] = useState({ c00: 0, c11: 0 });
  const [lastResult, setLastResult] = useState(null); // null | {q1, q2}

  function measure() {
    const q1 = measureQ1();
    const q2 = q1; // Bell state: both always agree
    setTally((t) => q1 === 0
      ? { c00: t.c00 + 1, c11: t.c11 }
      : { c00: t.c00, c11: t.c11 + 1 }
    );
    setLastResult({ q1, q2 });
  }

  function resetTally() {
    setTally({ c00: 0, c11: 0 });
    setLastResult(null);
  }

  const total = tally.c00 + tally.c11;

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
          letter-spacing: -0.012em; margin: 0 0 24px; max-width: 18ch;
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

        /* Sphere + prose two-col */
        .qx-sphere-row {
          display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;
          margin: 20px 0 30px;
        }
        .qx-sphere-col { flex: 0 0 180px; min-width: 140px; }
        .qx-sphere-prose { flex: 1 1 240px; }

        .qx-state-table {
          width: 100%; border-collapse: collapse;
          font-family: 'IBM Plex Sans', sans-serif;
          font-variant-numeric: tabular-nums; font-size: 13.5px;
          margin: 10px 0 18px;
        }
        .qx-state-table th {
          text-align: left; font-weight: 600; color: var(--muted); font-size: 12px;
          padding: 4px 10px 6px 0; border-bottom: 1px solid var(--rule);
        }
        .qx-state-table td { padding: 5px 10px 5px 0; border-bottom: 1px solid #E4E8EB; }
        .qx-state-table tr:last-child td { border-bottom: none; }
        .qx-state-table .note { color: var(--muted); font-size: 12px; }
        .qx-state-table .hilite { color: var(--accent); font-weight: 600; }

        /* Bell state interactive */
        .qx-bell-state {
          font-family: 'IBM Plex Sans', sans-serif;
          font-variant-numeric: tabular-nums;
          font-size: 14px; margin-bottom: 16px;
        }
        .qx-bell-row {
          display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
          padding: 10px 0; border-bottom: 1px solid #E4E8EB;
        }
        .qx-bell-row:last-child { border-bottom: none; }
        .qx-bell-ket {
          font-weight: 600; color: var(--data); min-width: 36px;
        }
        .qx-bell-bar-wrap { flex: 1; min-width: 80px; }
        .qx-bell-bar {
          height: 10px; background: var(--data); border-radius: 1px;
          transition: width 0.2s;
        }
        .qx-bell-pct { color: var(--muted); font-size: 12px; min-width: 42px; }

        .qx-result-box {
          background: #FFFFFF; border: 1px solid var(--rule); border-radius: 2px;
          padding: 12px 16px; margin: 12px 0;
          font-family: 'IBM Plex Sans', sans-serif; font-variant-numeric: tabular-nums;
        }
        .qx-result-box .headline {
          font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 4px;
        }
        .qx-result-box .sub {
          font-size: 13px; color: var(--muted);
        }
        .qx-result-box.locked .headline { color: #1A4A28; }

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
        .qx-btn.accent:hover { background: #1e374f; }
        .qx-btn.quiet { background: transparent; color: var(--muted); }

        .qx-tally {
          display: flex; gap: 16px; flex-wrap: wrap; margin-top: 14px;
        }
        .qx-tally-cell {
          font-family: 'IBM Plex Sans', sans-serif; font-variant-numeric: tabular-nums;
          font-size: 13px; background: #FFFFFF; border: 1px solid var(--rule);
          border-radius: 2px; padding: 6px 12px; text-align: center;
        }
        .qx-tally-cell .ket { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.03em; }
        .qx-tally-cell .count { font-size: 18px; font-weight: 600; color: var(--data); }

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
        <p className="qx-eyebrow qx-sans">Module eleven of twelve</p>
        <h1 className="qx-h1">Entanglement, and the sphere</h1>

        <p className="qx-p lead">
          Two things have been held back. The circle used from module three onwards
          is missing a degree of freedom. And the correlated two-qubit state from
          module nine has a name. This module delivers both.
        </p>

        {/* === SPHERE SECTION === */}
        <h2 className="qx-h2">The state the circle missed</h2>
        <p className="qx-p">
          The circle represented a qubit's state as (amp&#8320;, amp&#8321;) where
          both numbers were real. That was enough to show interference, gates, and
          the quantum walk. But it is not the full picture.
        </p>
        <p className="qx-p">
          Amplitudes can be complex numbers. A complex number has a magnitude and
          an angle. The magnitude is what the squaring rule uses: chance =
          magnitude squared. The angle &mdash; called the <b>phase</b> &mdash; is
          invisible to measurement but changes how the state responds to gates.
        </p>
        <p className="qx-p">
          Two states with the same magnitudes but different phases look identical
          in a histogram. They are not identical states. Consider:
        </p>

        <table className="qx-state-table qx-sans">
          <thead>
            <tr>
              <th>State</th>
              <th>amp&#8320;</th>
              <th>amp&#8321;</th>
              <th>Chance of 0</th>
              <th style={{ color: "#5C6872", fontWeight: 400 }}>Location on sphere</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>H|0&#10217;</td>
              <td>0.7071</td>
              <td>0.7071</td>
              <td>50%</td>
              <td className="note">+X axis (equator, front)</td>
            </tr>
            <tr>
              <td>+Y state</td>
              <td>0.7071</td>
              <td className="hilite"><i>i</i> &times; 0.7071</td>
              <td>50%</td>
              <td className="note">+Y axis (equator, right)</td>
            </tr>
          </tbody>
        </table>

        <p className="qx-p">
          The +Y state has the same measurement statistics as H|0&#10217;. You
          cannot tell them apart by measuring. But apply an H gate to each and the
          two states diverge: H applied to H|0&#10217; returns |0&#10217;;
          H applied to the +Y state produces a different state entirely.
          Phase is real, and gates reveal it.
        </p>

        <h2 className="qx-h2">The Bloch sphere</h2>

        <div className="qx-sphere-row">
          <div className="qx-sphere-col">
            <BlochSphere />
          </div>
          <div className="qx-sphere-prose">
            <p className="qx-p" style={{ marginTop: 0 }}>
              The full single-qubit state space is a sphere. |0&#10217; sits at the
              north pole and |1&#10217; at the south pole. The equator contains all
              states with equal measurement chances. Phase corresponds to the
              compass direction around the equator: H|0&#10217; is due east (+X),
              H|1&#10217; is due west (&minus;X), and the +Y state is the one
              the circle could not reach.
            </p>
            <p className="qx-p">
              Every single-qubit gate is a rotation of this sphere. X rotates
              180&deg; around the X axis. H rotates 180&deg; around the axis
              halfway between X and Z. The R&#x2091; gates rotate around the Y
              axis &mdash; which is exactly what was drawn in modules 3 and 6.
            </p>
          </div>
        </div>

        <h2 className="qx-h2">Why the angle doubled</h2>
        <p className="qx-p">
          On the circle in modules 3 and 4, |0&#10217; sat at one end and
          |1&#10217; sat 90&deg; away. On the Bloch sphere they are 180&deg;
          apart &mdash; at opposite poles. This was flagged as a debt when the
          circle was introduced. Here is why it happens.
        </p>
        <p className="qx-p">
          The sphere uses the parametrisation: amp&#8320; = cos(&theta;/2),
          amp&#8321; = sin(&theta;/2). For |1&#10217;, amp&#8320; must be zero,
          so cos(&theta;/2) = 0, which means &theta;/2 = 90&deg; and therefore
          &theta; = 180&deg;. The angle &theta; on the sphere is exactly twice
          the angle &phi; on the old circle. Every angle you measured on the circle
          was half the corresponding sphere angle.
        </p>
        <p className="qx-p">
          The circle was not wrong; it was a cross-section through the sphere,
          using only real amplitudes. The factor of two is the price of embedding
          a simpler picture into the full one.
        </p>

        {/* === ENTANGLEMENT SECTION === */}
        <h2 className="qx-h2">The Bell state</h2>
        <p className="qx-p">
          Module nine showed a two-qubit state produced by H on the control qubit
          followed by a CNOT. The histogram showed only |00&#10217; and |11&#10217;
          &mdash; the two qubits always agreed on measurement. That state now has a
          name: the <b>Bell state</b>, written |&#934;&#8314;&#10217; = (|00&#10217;
          + |11&#10217;) / &radic;2.
        </p>
        <p className="qx-p">
          Its four amplitudes are: 1/&radic;2 for |00&#10217;, zero for |01&#10217;,
          zero for |10&#10217;, and 1/&radic;2 for |11&#10217;. The two
          impossible outcomes have amplitude zero.
        </p>
        <p className="qx-p">
          Press "Measure qubit 1" below. Each press resets the pair to the Bell
          state and measures qubit 1. Watch what happens to qubit 2.
        </p>

        {/* === INTERACTIVE PANEL === */}
        <div className="qx-panel">
          <p className="qx-panel-label qx-sans">Bell state amplitudes</p>
          <div className="qx-bell-state qx-sans" style={{ marginBottom: 12 }}>
            {[
              { ket: "|00\u27E9", amp: INV_SQRT2 },
              { ket: "|01\u27E9", amp: 0 },
              { ket: "|10\u27E9", amp: 0 },
              { ket: "|11\u27E9", amp: INV_SQRT2 },
            ].map(({ ket, amp }) => (
              <div key={ket} className="qx-bell-row">
                <div className="qx-bell-ket">{ket}</div>
                <div className="qx-bell-bar-wrap">
                  <div className="qx-bell-bar" style={{ width: `${amp * 100 * Math.SQRT2}%` }} />
                </div>
                <div className="qx-bell-pct">{amp > 0 ? "0.7071" : "0.0000"}</div>
              </div>
            ))}
          </div>

          <div className="qx-divider" />

          <div className="qx-controls" style={{ marginBottom: 12 }}>
            <button className="qx-btn accent" onClick={measure}>
              Measure qubit 1
            </button>
            <button className="qx-btn quiet" onClick={resetTally} disabled={total === 0}>
              Reset tally
            </button>
          </div>

          {lastResult !== null && (
            <div className="qx-result-box locked qx-sans">
              <div className="headline">
                Qubit 1 gave {lastResult.q1} &mdash; qubit 2 is certainly {lastResult.q2}
              </div>
              <div className="sub">
                State is now |{lastResult.q1}{lastResult.q2}&#10217; with certainty.
                Reset to Bell state to measure again.
              </div>
            </div>
          )}

          {total > 0 && (
            <>
              <p className="qx-panel-label qx-sans" style={{ marginTop: 14 }}>
                Tally after {total} measurement{total !== 1 ? "s" : ""}
              </p>
              <div className="qx-tally qx-sans">
                <div className="qx-tally-cell">
                  <div className="ket">|00&#10217;</div>
                  <div className="count">{tally.c00}</div>
                </div>
                <div className="qx-tally-cell">
                  <div className="ket">|01&#10217;</div>
                  <div className="count" style={{ color: "#C6CCD2" }}>0</div>
                </div>
                <div className="qx-tally-cell">
                  <div className="ket">|10&#10217;</div>
                  <div className="count" style={{ color: "#C6CCD2" }}>0</div>
                </div>
                <div className="qx-tally-cell">
                  <div className="ket">|11&#10217;</div>
                  <div className="count">{tally.c11}</div>
                </div>
              </div>
            </>
          )}
        </div>

        <h2 className="qx-h2">What entanglement means</h2>
        <p className="qx-p">
          A two-qubit state is <b>entangled</b> if it cannot be written as a
          product of two independent single-qubit states. The Bell state cannot.
          There is no way to pick amplitudes (a, b) for qubit 1 and (c, d) for
          qubit 2 such that the product (a, b) &otimes; (c, d) gives
          (1/&radic;2, 0, 0, 1/&radic;2). The two qubits do not have separate
          states. The state belongs to the pair.
        </p>
        <p className="qx-p">
          This is what produces the measurement correlation. When qubit 1 is
          measured and gives 0, the only remaining term in the state is |00&#10217;.
          Qubit 2 is therefore certainly 0 &mdash; not because a signal passed
          between them, but because the joint state never had |01&#10217; as a
          possibility.
        </p>
        <p className="qx-p">
          The correlation is real and measurable. It is not the same as two coins
          that happen to land heads together more often. The statistics of
          entangled measurements violate inequalities that any classical correlation
          must satisfy. This has been tested and confirmed experimentally. The
          phenomenon is not a metaphor.
        </p>

        <h2 className="qx-h2">What entanglement is not</h2>
        <p className="qx-p">
          Measuring qubit 1 does not send a signal to qubit 2. No information
          travels. If two people each hold one qubit of a Bell pair and one of
          them measures, they learn something about what the other will see &mdash;
          but only after the two results are compared through an ordinary classical
          channel. Before that comparison, neither person can extract any useful
          information from their measurement alone.
        </p>
        <p className="qx-p">
          Entanglement enables quantum cryptography, quantum teleportation of
          states (not matter), and parts of certain quantum algorithms. None of
          these require faster-than-light signalling, and none of them permit it.
        </p>

        <div className="qx-aside">
          <p>
            The +Y state on the sphere &mdash; (1/&radic;2, <em>i</em>/&radic;2)
            &mdash; is the symmetric quantum walk coin from module ten's aside.
            Starting the walk with this coin, rather than |0&#10217;, produces
            the double-humped distribution shown in most textbooks. The
            asymmetric lean in module ten came from using |0&#10217; = (1, 0)
            as the coin, which has no imaginary component and sits at the north
            pole rather than on the equator.
          </p>
          <p>
            There are four Bell states in total, one for each combination of
            correlation (matching or opposite) and phase. The one shown here,
            |&#934;&#8314;&#10217; = (|00&#10217; + |11&#10217;) / &radic;2, is
            the simplest.
          </p>
        </div>

        <Quiz questions={QUIZ_QUESTIONS} />

        <hr className="qx-rule" />
        <p className="qx-footer qx-sans">
          Next: reality check. Noise, real hardware, and what the limits look like
          in practice.
        </p>
      </div>
    </div>
  );
}
