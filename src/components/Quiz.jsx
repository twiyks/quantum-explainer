import React, { useState } from "react";

/*
  Shared multiple-choice quiz component.
  Self-contained: includes its own styles via an inline <style> tag.
  Designed to sit at the bottom of each module before the rule and footer.

  Props:
    questions — array of {
      q:        string   question text
      options:  string[] four answer options
      answer:   number   index (0–3) of the correct option
      feedback: string[] one string per option — shown after answering.
                         The feedback for the correct answer serves as
                         the "correct" confirmation text.
    }
*/

const STYLES = `
  .qxq-wrap {
    background: #F6F7F8; border: 1px solid #C6CCD2;
    border-radius: 3px; padding: 18px 20px; margin: 32px 0 0;
  }
  .qxq-label {
    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
    text-transform: uppercase; color: #5C6872; margin: 0 0 18px;
  }
  .qxq-item { margin: 0 0 26px; }
  .qxq-item:last-child { margin-bottom: 0; }
  .qxq-q {
    font-size: 17px; line-height: 1.6; color: #222A31; margin: 0 0 10px;
    font-family: 'Newsreader', Iowan Old Style, Palatino, Georgia, serif;
  }
  .qxq-opts { display: flex; flex-direction: column; gap: 5px; }
  .qxq-opt {
    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    font-size: 14px; line-height: 1.5; font-weight: 400; font-variant-numeric: tabular-nums;
    background: #FFFFFF; color: #161B22;
    border: 1px solid #C6CCD2; border-radius: 2px;
    padding: 8px 12px; cursor: pointer; text-align: left;
  }
  .qxq-opt:hover:not(:disabled) { border-color: #2A4C6B; color: #2A4C6B; }
  .qxq-opt:focus-visible { outline: 2px solid #2A4C6B; outline-offset: 2px; }
  .qxq-opt:disabled { cursor: default; }
  .qxq-opt.qxq-right { background: #EBF4EE; border-color: #2A6B3A; color: #1A4A28; }
  .qxq-opt.qxq-wrong { background: #F6EFF3; border-color: #8A4262; color: #5A2040; }
  .qxq-fb {
    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    font-size: 13.5px; line-height: 1.55; margin: 7px 0 0;
    padding: 8px 11px; border-radius: 2px;
  }
  .qxq-fb-right { background: #EBF4EE; color: #1A4A28; }
  .qxq-fb-wrong { background: #F6EFF3; color: #5A2040; }
`;

export default function Quiz({ questions }) {
  const [answers, setAnswers] = useState({});

  function pick(qi, oi) {
    if (answers[qi] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qi]: oi }));
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="qxq-wrap">
        <p className="qxq-label">Check your understanding</p>
        {questions.map((item, qi) => {
          const chosen = answers[qi];
          const answered = chosen !== undefined;
          const correct = answered && chosen === item.answer;

          return (
            <div key={qi} className="qxq-item">
              <p className="qxq-q">
                {qi + 1}.{"\u2002"}
                {item.q}
              </p>
              <div className="qxq-opts">
                {item.options.map((opt, oi) => {
                  let cls = "qxq-opt";
                  if (answered) {
                    if (oi === item.answer) cls += " qxq-right";
                    else if (oi === chosen) cls += " qxq-wrong";
                  }
                  return (
                    <button
                      key={oi}
                      className={cls}
                      onClick={() => pick(qi, oi)}
                      disabled={answered}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <p className={`qxq-fb ${correct ? "qxq-fb-right" : "qxq-fb-wrong"}`}>
                  {item.feedback[chosen]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
