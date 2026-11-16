import { useState } from "react";
import { QUESTIONS } from "../constants/quiz";
 
export default function Quiz({ best, onFinish }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]);
  const [finished, setFinished] = useState(false);
  const q = QUESTIONS[i];
  const total = QUESTIONS.length;
 
  const check = () => {
    setChecked(true);
    if (picked === q.answer) setScore((s) => s + 1);
    else setMissed((m) => [...m, q]);
  };
  const next = () => {
    if (i === total - 1) { setFinished(true); onFinish(score); return; }
    setI(i + 1); setPicked(null); setChecked(false);
  };
  const retake = () => { setI(0); setPicked(null); setChecked(false); setScore(0); setMissed([]); setFinished(false); };
 
  if (finished) {
    return (
      <section>
        <h2>Quiz results</h2>
        <p className="big">{score} / {total}</p>
        <p>{score === total ? "Perfect score. You have the core ideas down."
          : score >= total * 0.7 ? "Solid. Review the questions you missed below."
          : "Worth another pass through the lessons, then try again."}</p>
        {best != null && <p className="muted">Best score: {best} / {total}</p>}
        {missed.length > 0 && (
          <ul className="plain">
            {missed.map((m) => (
              <li key={m.id}><b>{m.prompt}</b><br />
                <span className="ok">Answer: {m.options[m.answer]}</span><br />
                <span className="muted">{m.explanation}</span></li>
            ))}
          </ul>
        )}
        <div className="row"><button className="b primary" onClick={retake}>Retake quiz</button></div>
      </section>
    );
  }
 
  return (
    <section>
      <h2>Quiz: question {i + 1} of {total}</h2>
      <fieldset className="quiz" disabled={checked}>
        <legend>{q.prompt}</legend>
        {q.options.map((o, k) => {
          const cls = "opt" + (checked && k === q.answer ? " right" : checked && k === picked ? " wrong" : picked === k ? " sel" : "");
          return (
            <label key={k} className={cls}>
              <input type="radio" name={q.id} checked={picked === k} onChange={() => setPicked(k)} /> {o}
            </label>
          );
        })}
      </fieldset>
      {checked && (
        <div className="explain">
          <b className={picked === q.answer ? "ok" : "bad"}>{picked === q.answer ? "Correct. " : "Not quite. "}</b>
          {q.explanation}
        </div>
      )}
      <div className="row">
        {!checked
          ? <button className="b primary" disabled={picked === null} onClick={check}>Check answer</button>
          : <button className="b primary" onClick={next}>{i === total - 1 ? "See results" : "Next question"}</button>}
        <span className="muted">Score so far: {score}</span>
      </div>
    </section>
  );
}
 