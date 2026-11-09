// Pure Turing machine engine: no React, no DOM.
export const HALT = new Set(["halt", "accept", "reject"]);
export const CAP = 2000; // max steps per test run
export const MV = { L: "left", R: "right", S: "stay in place" };

export function parse(text){
  const rules={},list=[],errs=[];

  text.split("\n")
    .forEach((raw,i)=>{const l=raw
    .replace(/#.*/,"")
    .trim();

    if(!l)return;

    const m=l.match(/^(\S+)\s+(\S)\s*->\s*(\S)\s+([LRSlrs])\s+(\S+)$/);

    if(!m){
      errs.push("Line "+(i+1)+": can’t read “"+l+"”. Expected: state symbol -> write move next");
      return
    }

    const k=m[1]+","+m[2];

    if(rules[k]){
      errs.push("Line "+(i+1)+": a rule for ("+m[1]+", "+m[2]+") already exists");
      return
    }

    const r={
      state:m[1],
      read:m[2],
      write:m[3],
      move:m[4].toUpperCase(),
      next:m[5]
    };

    rules[k]=r;
    list.push(r)}
  );

 return{rules,list,errs}
}

export const init=s=>({
  tape:new Map([...s].map((c,i)=>[i,c])),
  head:0,state:"q0",
  steps:0,
  status:"running"
});

export const sym=m=>m.tape.get(m.head)??"_";

export function step(m,rules){
  if(m.status!=="running") return m;

  const r=rules[m.state+","+sym(m)];
  
  if(!r)return{...m,status:"stuck"};

  const tape=new Map(m.tape);

  if(r.write==="_") {
    tape.delete(m.head);
  } else{
    tape.set(m.head,r.write);
  } 
  return{
    tape,
    head:m.head+(r.move==="R"?1:r.move==="L"?-1:0),
    state:r.next,
    steps:m.steps+1,
    status:HALT.has(r.next)?"halted":"running"
  }
}

export function tapeStr(m){
  const k=[...m.tape.keys()].sort((a,b)=>a-b);
  if(!k.length)return"";

  let s="";
  
  for(let i=k[0];i<=k[k.length-1];i++) {
    s+=m.tape.get(i)??"_";
    return s
  }
}

// Run every test in a lesson against a parsed rule set.
export function runTests(lesson, rules) {
  return lesson.tests.map((t) => {
    let m = init(t.input), n = 0;
    
    while (m.status === "running" && n++ < CAP) {
      m = step(m, rules);
    }
    
    let ok = false, msg = "";
    
    if (m.status === "running"){ 
      msg = `never halted (stopped after ${CAP} steps). Check for a loop.`;
    } else if (lesson.mode === "tape") {
      const got = tapeStr(m);
      ok = m.state === "halt" && got === t.expect;
      msg = m.status === "stuck" ? `stuck: no rule for (${m.state}, ${sym(m)})`
        : m.state !== "halt" ? `ended in "${m.state}", expected halt`
        : ok ? "" : `tape was "${got || "(empty)"}", expected "${t.expect || "(empty)"}"`;
    } else if (m.state === "halt") { 
      msg = "ended in halt. Use accept or reject for yes/no answers.";
    } else {
      const acc = m.state === "accept";
      ok = acc === t.expect;
      msg = ok ? "" : `${acc ? "accepted" : "rejected"}, expected ${t.expect ? "accept" : "reject"}`;
    }
    return { input: t.input, ok, msg, steps: m.steps };
  });
}
