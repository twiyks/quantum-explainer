import React, { useState, useEffect } from "react";
import StartPage from "./components/StartPage.jsx";
import { HeaderNav, ModulePagination } from "./components/Navigation.jsx";
import ModuleOneSampling from "./modules/Module01Sampling.jsx";
import ModuleTwoRandomWalk from "./modules/Module02RandomWalk.jsx";
import ModuleThreeQubit from "./modules/Module03Qubit.jsx";
import ModuleFourMeasurement from "./modules/Module04Measurement.jsx";
import ModuleFiveAmplitudes from "./modules/Module05Amplitudes.jsx";
import ModuleSixGates from "./modules/Module06Gates.jsx";
import ModuleSevenInterference from "./modules/Module07Interference.jsx";
import ModuleEightCircuits from "./modules/Module08Circuits.jsx";
import ModuleNineControlled from "./modules/Module09Controlled.jsx";

function getInitialView() {
  if (typeof window === "undefined") return "start";
  const hash = window.location.hash.toLowerCase();
  if (hash === "#module-1" || hash === "#1") return 1;
  if (hash === "#module-2" || hash === "#2") return 2;
  if (hash === "#module-3" || hash === "#3") return 3;
  if (hash === "#module-4" || hash === "#4") return 4;
  if (hash === "#module-5" || hash === "#5") return 5;
  if (hash === "#module-6" || hash === "#6") return 6;
  if (hash === "#module-7" || hash === "#7") return 7;
  if (hash === "#module-8" || hash === "#8") return 8;
  if (hash === "#module-9" || hash === "#9") return 9;
  return "start";
}

export default function App() {
  const [activeView, setActiveView] = useState(getInitialView);

  useEffect(() => {
    function handleHashChange() {
      const view = getInitialView();
      setActiveView(view);
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (view) => {
    setActiveView(view);
    if (view === "start") {
      window.location.hash = "#start";
    } else {
      window.location.hash = `#module-${view}`;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <HeaderNav
        activeView={activeView}
        onSelectModule={(id) => navigateTo(id)}
        onGoHome={() => navigateTo("start")}
      />

      <main className="app-main-content">
        {activeView === "start" && (
          <StartPage onSelectModule={(id) => navigateTo(id)} />
        )}

        {activeView === 1 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleOneSampling />
            </div>
            <ModulePagination
              activeModuleId={1}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}

        {activeView === 2 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleTwoRandomWalk />
            </div>
            <ModulePagination
              activeModuleId={2}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}

        {activeView === 3 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleThreeQubit />
            </div>
            <ModulePagination
              activeModuleId={3}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}

        {activeView === 4 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleFourMeasurement />
            </div>
            <ModulePagination
              activeModuleId={4}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}

        {activeView === 5 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleFiveAmplitudes />
            </div>
            <ModulePagination
              activeModuleId={5}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}

        {activeView === 6 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleSixGates />
            </div>
            <ModulePagination
              activeModuleId={6}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}

        {activeView === 7 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleSevenInterference />
            </div>
            <ModulePagination
              activeModuleId={7}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}

        {activeView === 8 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleEightCircuits />
            </div>
            <ModulePagination
              activeModuleId={8}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}

        {activeView === 9 && (
          <div className="module-container">
            <div className="module-content-area">
              <ModuleNineControlled />
            </div>
            <ModulePagination
              activeModuleId={9}
              onSelectModule={(id) => navigateTo(id)}
              onGoHome={() => navigateTo("start")}
            />
          </div>
        )}
      </main>
    </div>
  );
}
