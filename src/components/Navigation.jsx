import React from "react";
import { MODULES } from "../modulesData.js";

export function HeaderNav({ activeView, onSelectModule, onGoHome }) {
  const currentModule = typeof activeView === "number" 
    ? MODULES.find((m) => m.id === activeView) 
    : null;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          className="app-brand"
          onClick={onGoHome}
          aria-label="Return to Quantum Explainer overview"
        >
          <span className="app-brand-title">Quantum explainer</span>
          <span className="app-brand-tag">First Principles</span>
        </button>

        <div className="app-nav-controls">
          <button
            className={`nav-home-btn ${activeView === "start" ? "active" : ""}`}
            onClick={onGoHome}
          >
            Overview
          </button>

          <div className="nav-module-select-wrap">
            <select
              className="nav-select"
              value={typeof activeView === "number" ? activeView : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  onGoHome();
                } else {
                  onSelectModule(Number(val));
                }
              }}
              aria-label="Select module"
            >
              <option value="">Overview (Curriculum)</option>
              {MODULES.map((mod) => {
                const isBuilt = mod.status === "built";
                return (
                  <option
                    key={mod.id}
                    value={mod.id}
                    disabled={!isBuilt}
                  >
                    {mod.id === 0 ? "Mod 0" : `Mod ${mod.id}`}: {mod.title} {!isBuilt ? `(${mod.statusLabel})` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

export function ModulePagination({ activeModuleId, onSelectModule, onGoHome }) {
  const currentIndex = MODULES.findIndex((m) => m.id === activeModuleId);
  const prevModule = currentIndex > 0 ? MODULES[currentIndex - 1] : null;
  const nextModule = currentIndex < MODULES.length - 1 ? MODULES[currentIndex + 1] : null;

  const canGoPrev = prevModule && prevModule.status === "built";
  const canGoNext = nextModule && nextModule.status === "built";

  return (
    <footer className="module-pagination-wrap">
      <div className="module-pagination-inner">
        <div>
          {canGoPrev ? (
            <button
              className="pagination-btn"
              onClick={() => onSelectModule(prevModule.id)}
            >
              &larr; Previous: Module {prevModule.id}
            </button>
          ) : (
            <button
              className="pagination-btn"
              onClick={onGoHome}
            >
              &larr; Back to Overview
            </button>
          )}
        </div>

        <div className="pagination-info">
          Module {activeModuleId} of 12
        </div>

        <div>
          {canGoNext ? (
            <button
              className="pagination-btn primary"
              onClick={() => onSelectModule(nextModule.id)}
            >
              Next: Module {nextModule.id} &rarr;
            </button>
          ) : (
            <button
              className="pagination-btn"
              disabled
              aria-disabled="true"
              title="Next module is not built yet"
            >
              {nextModule ? `Module ${nextModule.id}: ${nextModule.statusLabel}` : "End of curriculum"} &rarr;
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
