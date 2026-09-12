import React from "react";
import { MODULES } from "../modulesData.js";

export default function StartPage({ onSelectModule }) {
  const activeModulesCount = MODULES.filter((m) => m.status === "built").length;

  return (
    <div className="start-page-container">
      <div className="start-page-wrap">
        <p className="start-eyebrow">Interactive Explainer</p>
        <h1 className="start-title">
          How quantum computing actually works, from first principles
        </h1>

        <p className="start-lead">
          Twelve short modules, each built around one idea, each ending in an
          interactive instrument you can manipulate yourself.
        </p>

        <p className="start-prose">
          The goal of this project is straightforward: that a curious non-specialist
          comes away understanding <strong>why interference is the point</strong>,
          rather than simply repeating that a qubit is "both 0 and 1 at once".
        </p>

        <p className="start-prose">
          This is not a marketing explainer, not a metaphor-only explainer, and not
          a physics lecture. It is designed for design students, creative professionals,
          and anyone who wants a clear, honest foothold in quantum concepts. Every idea
          starts from a very basic level and builds slowly, showing real numbers rather
          than hand-waving gestures.
        </p>

        <div className="start-callout">
          <div className="start-callout-title">The pedagogy</div>
          <p>
            <strong>One idea per module:</strong> Every module isolates a single concept.
          </p>
          <p>
            <strong>Manipulate before explain:</strong> You drive the instrument, form a
            hunch, and then read the reasoning.
          </p>
          <p>
            <strong>Real numbers, simple maths:</strong> GCSE arithmetic (squares and square
            roots) is all this series relies on.
          </p>
        </div>

        <div className="start-cta-bar">
          <button
            className="btn-primary"
            onClick={() => onSelectModule(1)}
            aria-label="Begin with Module 1: Probability and sampling"
          >
            <span>Begin with Module 1</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
          <span className="start-cta-meta">
            {activeModulesCount} of 12 modules ready to explore
          </span>
        </div>

        <h2 className="curriculum-heading">The 12 Modules</h2>
        <p className="curriculum-subtitle">
          Modules 1 to 4 are built and interactive. The rest are planned and queued in sequence.
        </p>

        <div className="module-list" role="list">
          {MODULES.map((mod) => {
            const isBuilt = mod.status === "built";
            return (
              <div
                key={mod.id}
                className={`module-card ${isBuilt ? "is-built" : "is-unbuilt"}`}
                role="listitem"
                onClick={isBuilt ? () => onSelectModule(mod.id) : undefined}
              >
                <div className="module-card-header">
                  <div className="module-card-num-title">
                    <span className="module-card-num">
                      {mod.id === 0 ? "Module 0" : `Module ${mod.id}`}
                    </span>
                    <h3 className="module-card-title">{mod.title}</h3>
                  </div>
                  <span
                    className={`module-status-badge ${
                      isBuilt
                        ? "badge-built"
                        : mod.id === 5
                        ? "badge-next"
                        : "badge-unbuilt"
                    }`}
                  >
                    {mod.statusLabel}
                  </span>
                </div>

                <p className="module-card-idea">{mod.idea}</p>

                <div className="module-card-action">
                  {isBuilt ? (
                    <button
                      className="module-btn-launch"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectModule(mod.id);
                      }}
                      aria-label={`Open Module ${mod.id}: ${mod.title}`}
                    >
                      Open module &rarr;
                    </button>
                  ) : (
                    <button
                      className="module-btn-disabled"
                      disabled
                      aria-disabled="true"
                      title={
                        mod.id === 0
                          ? "Module 0 will be built last to display the quantum walk distribution."
                          : mod.id === 5
                          ? "Module 5 is next in line to be built."
                          : "This module is not built yet."
                      }
                    >
                      {mod.id === 5 ? "Next in development" : "Not built yet"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
