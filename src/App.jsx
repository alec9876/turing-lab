import { useEffect, useMemo, useState } from "react";
import { LESSONS } from "./lessons";
import { parse, init, step, sym, tapeStr, runTests, MV } from "./engine";
import "./App.css";

const KEY = "tmlab";
const fresh = (input) => ({ hist: [init(input.replace(/_/g, ""))], pos: 0 });

function loadStore() {
  try { 
    return { 
      done: {}, 
      rules: {}, 
      ...JSON.parse(localStorage.getItem(KEY) || "{}") 
    }; 
  } catch { 
    return { 
      done: {}, 
      rules: {} 
    }; 
  }
}

export default function App() {
  const [idx, setIdx] = useState(0);
  const [store, setStore] = useState(loadStore);
  useEffect(() => {
    try { 
      localStorage.setItem(KEY, JSON.stringify(store)); 
    } catch { /* storage unavailable */ }
  }, [store]);

  const lesson = LESSONS[idx];

  return (
    <>
      <header>
        <h1>Turing Machine Lab</h1>
        <p>Read a machine, predict what it does, then build your own.</p>
      </header>
      <nav aria-label="Lessons">
        {LESSONS.map((l, i) => (
          <button key={l.id} 
                  aria-current={i === idx} 
                  onClick={() => setIdx(i)}>
            {store.done[l.id] ? "Done!" : ""}{l.title}
          </button>
        ))}
      </nav>
      {/* key remounts LessonView, resetting hints, results and the machine per lesson */}
      <LessonView
        key={lesson.id}
        lesson={lesson}
        savedRules={store.rules[lesson.id]}
        done={!!store.done[lesson.id]}
        onRules={(t) => setStore((s) => ({ ...s, rules: { ...s.rules, [lesson.id]: t } }))}
        onPass={() => setStore((s) => ({ ...s, done: { ...s.done, [lesson.id]: true } }))}
      />
    </>
  );
}

function LessonView({ lesson, savedRules, done, onRules, onPass }) {
  const [rulesText, setRulesText] = useState(savedRules ?? lesson.rules);
  const [draft, setDraft] = useState(lesson.input);
  const [loaded, setLoaded] = useState(lesson.input);
  const [sim, setSim] = useState(() => fresh(lesson.input));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(60);
  const [predictOn, setPredictOn] = useState(false);
  const [note, setNote] = useState("");
  const [hintN, setHintN] = useState(0);
  const [results, setResults] = useState(null);

  const parsed = useMemo(() => parse(rulesText), [rulesText]);
  const { hist, pos } = sim;
  const m = hist[pos];
  const atEnd = pos === hist.length - 1;
  const rule = m.status === "running" ? parsed.rules[`${m.state},${sym(m)}`] : null;
  const asking = predictOn && !!rule && atEnd;

  // Any change to the rules or loaded input restarts the machine.
  useEffect(() => { setSim(fresh(loaded)); setRunning(false); setNote(""); }, [rulesText, loaded]);

  const forward = () =>
    setSim((s) => {
      if (s.pos < s.hist.length - 1) return { ...s, pos: s.pos + 1 };
      const cur = s.hist[s.pos];
      const next = step(cur, parsed.rules);
      if (next === cur || s.hist.length >= 5000) return s;
      return { hist: [...s.hist, next], pos: s.pos + 1 };
    });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(forward, 1100 - speed * 10);
    return () => clearInterval(id);
  }, [running, speed, parsed]);

  useEffect(() => {
    if (running && m.status !== "running" && atEnd) setRunning(false);
  }, [running, m.status, atEnd]);

  const reset = () => { 
    setSim(fresh(loaded)); 
    setRunning(false); 
    setNote(""); 
  };

  const answer = (mv) => {
    setNote(mv === rule.move ? `Correct, the head moves ${MV[rule.move]}.`
      : `Not quite: the rule moves ${MV[rule.move]}, not ${MV[mv]}.`);
    forward();
  };
  const check = () => {
    if (parsed.errs.length) return setResults("errors");
    const r = runTests(lesson, parsed.rules);
    setResults(r);
    if (r.every((x) => x.ok)) onPass();
  };

  let explain;
  if (m.status === "running" && rule)
    explain = `In state ${m.state}, reading ‘${sym(m)}’. The rule says: write ‘${rule.write}’, move ${MV[rule.move]}, go to state ${rule.next}.`;
  else if (m.status === "running")
    explain = `In state ${m.state}, reading ‘${sym(m)}’, but there is no rule for that. The machine will get stuck here and reject.`;
  else if (m.status === "halted")
    explain = `Halted in state “${m.state}” after ${m.steps} steps. Tape: ${tapeStr(m) || "(empty)"}.`;
  else
    explain = `Stuck: there is no rule for (${m.state}, ${sym(m)}), so the machine stops and rejects. Add a rule for this case.`;

  const offsets = Array.from({ length: 15 }, (_, i) => i - 7);

  return (
    <main>
      <div>
        <section>
          <h2>{lesson.title}</h2>
          <p>{lesson.text}</p>
          <div className="goal">{lesson.goal}</div>
          <div className="row">
            <button className="b" disabled={hintN >= lesson.hints.length} onClick={() => setHintN((n) => n + 1)}>
              {hintN < lesson.hints.length ? `Show a hint (${hintN}/${lesson.hints.length})` : "No more hints"}
            </button>
          </div>
          <ul className="plain">
            {lesson.hints.slice(0, hintN).map((h, i) => <li key={i}><b>Hint {i + 1}:</b> {h}</li>)}
          </ul>
        </section>

        <section>
          <h2>Check your machine</h2>
          <div className="row"><button className="b primary" onClick={check}>Run all tests</button></div>
          <ul className="plain">
            {results === null && <li className="muted">No tests run yet.</li>}
            {results === "errors" && <li className="bad">Fix the rule errors first.</li>}
            {Array.isArray(results) && results.map((r, i) => (
              <li key={i}>
                <span className={r.ok ? "ok" : "bad"}>{r.ok ? "✓" : "✗"}</span>{" "}
                <span className="mono">{r.input || "(empty)"}</span>{" "}
                {r.ok ? <span className="muted">passed in {r.steps} steps</span> : r.msg}
              </li>
            ))}
          </ul>
          {done && <div className="ok">Lesson complete. Nice work.</div>}
        </section>
      </div>

      <div>
        <section>
          <h2>Machine</h2>
          <div className="row">
            <label htmlFor="inp">Input tape</label>
            <input id="inp" type="text" value={draft} autoComplete="off" spellCheck={false}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setLoaded(draft)} />
            <button className="b" onClick={() => setLoaded(draft)}>Load</button>
          </div>

          <div className="tape" aria-label="Tape">
            {offsets.map((o) => {
              const c = m.tape.get(m.head + o) ?? "_";
              return <div key={o} className={`cell${o === 0 ? " on" : ""}${c === "_" ? " blank" : ""}`}>{c}</div>;
            })}
          </div>
          <div className="ptr" aria-hidden="true">
            {offsets.map((o) => <div key={o}>{o === 0 ? "▲" : ""}</div>)}
          </div>

          <div className="status">
            <span>State: <b className="mono">{m.state}</b></span>
            <span>Steps: <b>{m.steps}</b></span>
            <span>Status: <b>{m.status === "running" ? "running" : m.status === "stuck" ? "stuck (no rule)" : "halted"}</b></span>
          </div>
          <div className="explain" aria-live="polite">{note} {explain}</div>

          {asking && (
            <div className="predict">
              <div><b>Predict:</b> which way will the head move next?</div>
              <div className="row">
                {["L", "S", "R"].map((mv) => (
                  <button key={mv} className="b" onClick={() => answer(mv)}>
                    {{ L: "Left", S: "Stay", R: "Right" }[mv]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="row">
            <button className="b" disabled={pos === 0}
              onClick={() => { setRunning(false); setNote(""); setSim((s) => ({ ...s, pos: Math.max(0, s.pos - 1) })); }}>
              Back
            </button>
            <button className="b primary" disabled={asking || (m.status !== "running" && atEnd)}
              onClick={() => { setNote(""); forward(); }}>
              Step
            </button>
            <button className="b" disabled={predictOn} onClick={() => setRunning((r) => !r)}>
              {running ? "Pause" : "Run"}
            </button>
            <button className="b" onClick={reset}>Reset</button>
            <label className="muted">Speed{" "}
              <input type="range" min="1" max="100" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
            </label>
          </div>
          <div className="row">
            <label>
              <input type="checkbox" checked={predictOn}
                onChange={(e) => { setPredictOn(e.target.checked); setRunning(false); }} />{" "}
              Predict mode: guess each move before it happens
            </label>
          </div>
        </section>

        <section>
          <h2>Rules</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            One rule per line: <span className="mono">state symbol -&gt; write move next</span>. Move is L, R or S.
            Use <span className="mono">_</span> for blank. Reach <span className="mono">halt</span>,{" "}
            <span className="mono">accept</span> or <span className="mono">reject</span> to stop. Start state is{" "}
            <span className="mono">q0</span>.
          </p>
          <textarea value={rulesText} readOnly={!!lesson.readOnly} spellCheck={false} aria-label="Rules"
            onChange={(e) => { setRulesText(e.target.value); onRules(e.target.value); }} />
          {parsed.errs.map((e, i) => <div key={i} className="err">{e}</div>)}
          <div className="scroll">
            <table className="rules">
              <thead><tr><th>State</th><th>Read</th><th>Write</th><th>Move</th><th>Next</th></tr></thead>
              <tbody>
                {parsed.list.map((r, i) => (
                  <tr key={i} className={rule && rule.state === r.state && rule.read === r.read ? "act" : ""}>
                    <td>{r.state}</td><td>{r.read}</td><td>{r.write}</td><td>{r.move}</td><td>{r.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
