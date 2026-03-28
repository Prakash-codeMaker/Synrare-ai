import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────
const DISEASES = [
  { id: "hsp",     name: "Henoch-Schönlein Purpura", prev: "1:5,000",  cat: "Autoimmune",  icon: "🩸", color: "#c026d3" },
  { id: "wilson",  name: "Wilson's Disease",          prev: "1:30,000", cat: "Metabolic",   icon: "🧬", color: "#0891b2" },
  { id: "gaucher", name: "Gaucher's Disease",         prev: "1:40,000", cat: "Lysosomal",   icon: "🔬", color: "#059669" },
  { id: "pompe",   name: "Pompe Disease",             prev: "1:40,000", cat: "Glycogen",    icon: "💊", color: "#d97706" },
  { id: "fabry",   name: "Fabry Disease",             prev: "1:50,000", cat: "Lysosomal",   icon: "🧪", color: "#dc2626" },
];

const AGENTS = [
  { id: "orch",  name: "Orchestrator",   role: "Pipeline coordinator & router",         icon: "⚡", col: "#7c3aed" },
  { id: "syn",   name: "SynData Agent",  role: "Synthetic image & tabular data gen",    icon: "🔄", col: "#0891b2" },
  { id: "priv",  name: "Privacy Guard",  role: "Differential privacy + compliance",     icon: "🔒", col: "#059669" },
  { id: "clf",   name: "Classifier",     role: "Rare disease pattern recognition",      icon: "🧠", col: "#d97706" },
  { id: "rep",   name: "Report Agent",   role: "Clinical report synthesis via LLM",     icon: "📋", col: "#e11d48" },
  { id: "val",   name: "Validator",      role: "Quality assurance & output validation", icon: "✅", col: "#0d9488" },
];

const buildLogs = (diseaseName) => [
  { a: "orch", m: `[ORCHESTRATOR] ═══ Pipeline v1.0 initialised for: ${diseaseName} ═══` },
  { a: "orch", m: `[ORCHESTRATOR] Validating input schema... OK (47 records, 12 features)` },
  { a: "orch", m: `[ORCHESTRATOR] Routing to SynData Agent → task: generate_synthetic_batch` },
  { a: "syn",  m: `[SYNDATA] Loading latent diffusion backbone (med-imagen-v2)... ✓ 3.2s` },
  { a: "syn",  m: `[SYNDATA] Seeding generator with rare disease morphology priors` },
  { a: "syn",  m: `[SYNDATA] Generating batch 1/5... (500 synthetic samples)` },
  { a: "syn",  m: `[SYNDATA] ↳ Structural Similarity (SSIM): 0.847 | FID: 12.3` },
  { a: "syn",  m: `[SYNDATA] Generating batch 2/5... (500 synthetic samples)` },
  { a: "syn",  m: `[SYNDATA] ↳ SSIM: 0.861 | FID: 11.7` },
  { a: "syn",  m: `[SYNDATA] Generating tabular features (GaussianCopulaSynthesizer)...` },
  { a: "syn",  m: `[SYNDATA] ✓ Total 2,500 synthetic samples ready` },
  { a: "priv", m: `[PRIVACY] Initialising differential privacy engine (ε=0.3, δ=1e-5)` },
  { a: "priv", m: `[PRIVACY] Computing sensitivity bounds for feature vectors...` },
  { a: "priv", m: `[PRIVACY] Applying calibrated Gaussian noise (σ=1.2) to outputs` },
  { a: "priv", m: `[PRIVACY] Running membership inference attack simulation...` },
  { a: "priv", m: `[PRIVACY] ↳ Attack accuracy: 51.2% ≈ random guessing → PASSED ✓` },
  { a: "priv", m: `[PRIVACY] DPDP Act 2023 compliance check → PASSED ✓` },
  { a: "priv", m: `[PRIVACY] Privacy score: 94.7 / 100` },
  { a: "clf",  m: `[CLASSIFIER] Loading ResNet-50 backbone (fine-tuned: rare-disease-v3)` },
  { a: "clf",  m: `[CLASSIFIER] Running baseline inference (real data only, n=47)...` },
  { a: "clf",  m: `[CLASSIFIER] ↳ Baseline accuracy: 61.3% | AUC: 0.71` },
  { a: "clf",  m: `[CLASSIFIER] Augmenting training set with 2,500 synthetic samples` },
  { a: "clf",  m: `[CLASSIFIER] Retraining with augmented dataset (5-fold CV)...` },
  { a: "clf",  m: `[CLASSIFIER] ↳ Augmented accuracy: 84.7% | AUC: 0.92` },
  { a: "clf",  m: `[CLASSIFIER] Δ accuracy: +23.4% ↑ | Δ AUC: +0.21 ↑` },
  { a: "rep",  m: `[REPORT] Loading clinical template: ${diseaseName} Diagnostic Protocol v2.1` },
  { a: "rep",  m: `[REPORT] Generating LLM-powered diagnostic summary...` },
  { a: "rep",  m: `[REPORT] Embedding DPDP-compliant data lineage metadata` },
  { a: "rep",  m: `[REPORT] ✓ Report generated (1,247 tokens)` },
  { a: "val",  m: `[VALIDATOR] Running output quality checks...` },
  { a: "val",  m: `[VALIDATOR] ↳ Synthetic quality: PASS | Privacy: PASS | Accuracy: PASS` },
  { a: "val",  m: `[VALIDATOR] ↳ DPDP compliance: PASS | Schema validation: PASS` },
  { a: "orch", m: `[ORCHESTRATOR] ═══ Pipeline complete in 8.4s ═══ Routing to results ═══` },
];

const AGENT_SEQUENCE = [
  { id: "orch", logs: [0, 1, 2],               start: 0 },
  { id: "syn",  logs: [3, 4, 5, 6, 7, 8, 9, 10], start: 1200 },
  { id: "priv", logs: [11, 12, 13, 14, 15, 16, 17], start: 4500 },
  { id: "clf",  logs: [18, 19, 20, 21, 22, 23, 24], start: 7200 },
  { id: "rep",  logs: [25, 26, 27, 28],          start: 10000 },
  { id: "val",  logs: [29, 30, 31, 32],           start: 12000 },
];

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:       "#06080f",
  surface:  "#0b1120",
  surface2: "#0f1829",
  surface3: "#121e32",
  teal:     "#00d4aa",
  tealDim:  "#00d4aa18",
  tealBord: "#00d4aa44",
  amber:    "#f59e0b",
  muted:    "#3d5070",
  mutedTx:  "#5a7090",
  text:     "#c8d8ee",
  textBr:   "#e8f0fb",
  border:   "#1a2a42",
};

const logColor = (a) => ({ orch:"#a78bfa", syn:"#22d3ee", priv:"#34d399", clf:"#fbbf24", rep:"#f87171", val:"#2dd4bf" }[a] || C.teal);
const ts = () => new Date().toISOString().replace("T", " ").slice(0, 23);

// ─── Synthetic Image Grid (canvas-based) ─────────────────────────────────────
function SyntheticGrid({ n = 12 }) {
  const refs = useRef([]);
  useEffect(() => {
    refs.current.forEach((canvas, i) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const { width: w, height: h } = canvas;
      const seed = i * 137;
      ctx.fillStyle = "#040812";
      ctx.fillRect(0, 0, w, h);
      [[.4,.5,.22,.7+((seed*3)%3)*.1],[.6,.4,.15,.5+((seed*7)%4)*.1],[.5,.6,.18,.6]].forEach(([bx,by,br,op])=>{
        const grd = ctx.createRadialGradient(bx*w,by*h,0,bx*w,by*h,br*w);
        const hue = [180,200,220,160,140][i%5];
        grd.addColorStop(0,`hsla(${hue},80%,70%,${op})`);
        grd.addColorStop(1,"transparent");
        ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
      });
      const img = ctx.getImageData(0,0,w,h);
      for(let p=0;p<img.data.length;p+=4){ const v=(Math.random()-.5)*18; img.data[p]=Math.max(0,Math.min(255,img.data[p]+v)); img.data[p+1]=Math.max(0,Math.min(255,img.data[p+1]+v)); img.data[p+2]=Math.max(0,Math.min(255,img.data[p+2]+v)); }
      ctx.putImageData(img,0,0);
      ctx.strokeStyle="rgba(0,212,170,.2)"; ctx.lineWidth=.5;
      ctx.beginPath(); ctx.moveTo(w/2,0); ctx.lineTo(w/2,h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke();
      ctx.fillStyle="rgba(0,212,170,.6)"; ctx.font="7px monospace";
      ctx.fillText(`SYN-${(seed%999).toString().padStart(3,"0")}`,2,8);
    });
  }, [n]);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"4px"}}>
      {Array.from({length:n}).map((_,i)=>(
        <canvas key={i} ref={el=>refs.current[i]=el} width={64} height={64}
          style={{width:"100%",aspectRatio:"1",borderRadius:"3px",border:`1px solid ${C.border}`}}/>
      ))}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHead({ children, style={} }) {
  return <div style={{color:C.teal,fontSize:"10px",letterSpacing:".18em",marginBottom:"10px",marginTop:"4px",...style}}>{children}</div>;
}
function InfoLine({ label, val }) {
  return (
    <div style={{display:"flex",gap:"8px",marginBottom:"2px"}}>
      <span style={{color:C.teal,minWidth:"210px",flexShrink:0}}>{label}:</span>
      <span style={{color:"#8aa0be"}}>{val}</span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function SynRareAI() {
  const [tab, setTab]             = useState("setup");
  const [diseaseId, setDiseaseId] = useState(null);
  const [uploaded, setUploaded]   = useState(false);
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const [logs, setLogs]           = useState([]);
  const [agentSt, setAgentSt]     = useState({});
  const [activeAgent, setActive]  = useState(null);
  const logEl  = useRef(null);
  const timers = useRef([]);

  const disease = DISEASES.find(d => d.id === diseaseId);

  useEffect(() => {
    if (logEl.current) logEl.current.scrollTop = logEl.current.scrollHeight;
  }, [logs]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const runPipeline = () => {
    if (!diseaseId) return;
    clearTimers();
    setRunning(true); setDone(false); setLogs([]); setAgentSt({}); setActive(null);
    const template = buildLogs(disease.name);

    AGENT_SEQUENCE.forEach(({ id, logs: idxs, start }) => {
      const t1 = setTimeout(() => {
        setActive(id);
        setAgentSt(p => ({ ...p, [id]: "running" }));
        idxs.forEach((li, pos) => {
          const t2 = setTimeout(() => {
            const entry = template[li];
            setLogs(p => [...p, { ts: ts(), a: entry.a, m: entry.m }]);
          }, pos * 350);
          timers.current.push(t2);
        });
        const t3 = setTimeout(() => setAgentSt(p => ({ ...p, [id]: "done" })), idxs.length * 350 + 300);
        timers.current.push(t3);
      }, start);
      timers.current.push(t1);
    });

    const tFinal = setTimeout(() => {
      setActive(null); setRunning(false); setDone(true);
      setTimeout(() => setTab("results"), 1200);
    }, 14500);
    timers.current.push(tFinal);
  };

  const reset = () => {
    clearTimers();
    setTab("setup"); setDiseaseId(null); setUploaded(false);
    setRunning(false); setDone(false); setLogs([]); setAgentSt({}); setActive(null);
  };

  const accData = [
    { name: "Baseline (real only)", acc: 61.3 },
    { name: "SynRareAI (+synthetic)", acc: 84.7 },
  ];
  const epochData = [
    {ep:1,base:42,aug:58},{ep:2,base:51,aug:67},{ep:3,base:56,aug:74},
    {ep:4,base:59,aug:79},{ep:5,base:61.3,aug:84.7},
  ];

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Courier New',Courier,monospace",color:C.text,display:"flex",flexDirection:"column"}}>

      {/* ── Header ── */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"52px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"7px",height:"7px",borderRadius:"50%",background:C.teal,boxShadow:`0 0 10px ${C.teal}`}}/>
          <span style={{color:C.teal,fontWeight:"800",fontSize:"16px",letterSpacing:".12em"}}>SYNRARE<span style={{color:C.textBr}}>AI</span></span>
          <span style={{color:C.muted,fontSize:"11px",letterSpacing:".06em"}}>// MULTI-AGENT RARE DISEASE DIAGNOSTIC SYSTEM</span>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          {running && <div style={{background:"#f59e0b18",border:`1px solid ${C.amber}`,borderRadius:"5px",padding:"3px 10px",fontSize:"11px",color:C.amber,letterSpacing:".08em"}}>⟳ PIPELINE RUNNING</div>}
          {done    && <div style={{background:C.tealDim,border:`1px solid ${C.teal}`,borderRadius:"5px",padding:"3px 10px",fontSize:"11px",color:C.teal,letterSpacing:".08em"}}>✓ COMPLETE</div>}
          <button onClick={reset} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:"5px",padding:"3px 10px",fontSize:"11px",color:C.mutedTx,cursor:"pointer",fontFamily:"inherit",letterSpacing:".06em"}}>RESET</button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",padding:"0 24px",flexShrink:0}}>
        {[["setup","01 // SETUP"],["pipeline","02 // PIPELINE"],["results","03 // RESULTS"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{background:"none",border:"none",cursor:"pointer",padding:"11px 20px",fontSize:"11px",letterSpacing:".1em",fontFamily:"inherit",color:tab===id?C.teal:C.mutedTx,borderBottom:tab===id?`2px solid ${C.teal}`:"2px solid transparent",transition:"all .2s"}}>{label}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"8px"}}>
          {AGENTS.map(a=>(
            <div key={a.id} title={a.name} style={{width:"6px",height:"6px",borderRadius:"50%",background:agentSt[a.id]==="running"?a.col:agentSt[a.id]==="done"?"#1a4a30":C.border,boxShadow:agentSt[a.id]==="running"?`0 0 6px ${a.col}`:"none",transition:"all .3s"}}/>
          ))}
        </div>
      </div>

      {/* ── Page Content ── */}
      <div style={{flex:1,overflowY:"auto",padding:"24px",maxWidth:"1160px",width:"100%",margin:"0 auto",boxSizing:"border-box"}}>

        {/* ══════════════════ SETUP TAB ══════════════════ */}
        {tab === "setup" && (
          <div>
            <SectionHead>SELECT TARGET DISEASE</SectionHead>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"10px",marginBottom:"24px"}}>
              {DISEASES.map(d=>(
                <div key={d.id} onClick={()=>setDiseaseId(d.id)} style={{background:diseaseId===d.id?`${d.color}15`:C.surface2,border:`1px solid ${diseaseId===d.id?d.color:C.border}`,borderRadius:"8px",padding:"14px",cursor:"pointer",transition:"all .2s"}}>
                  <div style={{fontSize:"22px",marginBottom:"8px"}}>{d.icon}</div>
                  <div style={{fontSize:"12px",fontWeight:"700",color:diseaseId===d.id?d.color:C.textBr,marginBottom:"4px",lineHeight:"1.3"}}>{d.name}</div>
                  <div style={{fontSize:"10px",color:C.mutedTx}}>{d.cat}</div>
                  <div style={{fontSize:"10px",color:C.mutedTx}}>Prevalence {d.prev}</div>
                </div>
              ))}
            </div>

            <SectionHead>UPLOAD PATIENT DATA</SectionHead>
            <div onClick={()=>setUploaded(true)} style={{background:C.surface2,border:`2px dashed ${uploaded?C.teal:C.border}`,borderRadius:"8px",padding:"28px",textAlign:"center",cursor:"pointer",marginBottom:"24px",transition:"all .2s"}}>
              {uploaded ? (
                <div>
                  <div style={{fontSize:"28px",marginBottom:"8px",color:C.teal}}>✓</div>
                  <div style={{color:C.teal,fontSize:"13px",marginBottom:"4px"}}>patient_data_sample.csv</div>
                  <div style={{color:C.mutedTx,fontSize:"11px"}}>47 real patient records · 12 features · 3 diagnostic classes · DPDP compliant</div>
                </div>
              ) : (
                <div>
                  <div style={{fontSize:"28px",marginBottom:"8px"}}>📁</div>
                  <div style={{color:C.mutedTx,fontSize:"13px"}}>Click to simulate data upload</div>
                  <div style={{color:C.muted,fontSize:"11px",marginTop:"4px"}}>Supports CSV · DICOM · NIfTI · FHIR · DPDP Act 2023 compliant</div>
                </div>
              )}
            </div>

            {uploaded && (
              <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"16px",marginBottom:"24px"}}>
                <SectionHead style={{marginTop:0}}>DATA PREVIEW (ANONYMISED)</SectionHead>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px"}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${C.border}`}}>
                        {["patient_id","age","gender","biomarker_1","biomarker_2","wbc_count","crp_level","label"].map(h=>(
                          <th key={h} style={{textAlign:"left",padding:"6px 10px",color:C.teal,fontWeight:"700",letterSpacing:".06em"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["ANON-001","42","M","0.87","1.23","8.2","12.4","Positive"],
                        ["ANON-002","31","F","0.45","0.78","6.1","4.2","Negative"],
                        ["ANON-003","55","M","1.12","1.56","9.4","18.7","Positive"],
                        ["ANON-004","28","F","0.32","0.61","5.8","2.1","Negative"],
                        ["ANON-005","67","M","0.94","1.34","8.8","15.3","Borderline"],
                      ].map((row,i)=>(
                        <tr key={i} style={{borderBottom:`1px solid ${C.border}30`}}>
                          {row.map((cell,j)=>(
                            <td key={j} style={{padding:"5px 10px",color:j===7?(cell==="Positive"?"#f87171":cell==="Borderline"?C.amber:C.teal):C.text}}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={()=>{ setTab("pipeline"); setTimeout(runPipeline, 600); }}
              disabled={!diseaseId}
              style={{background:diseaseId?C.teal:C.surface3,color:diseaseId?"#000":C.mutedTx,border:"none",borderRadius:"8px",padding:"14px 32px",fontSize:"14px",fontWeight:"800",letterSpacing:".12em",cursor:diseaseId?"pointer":"not-allowed",fontFamily:"inherit",width:"100%",transition:"all .2s"}}
            >⚡ RUN AI PIPELINE{!diseaseId && " — SELECT DISEASE FIRST"}</button>
          </div>
        )}

        {/* ══════════════════ PIPELINE TAB ══════════════════ */}
        {tab === "pipeline" && (
          <div>
            <SectionHead>AGENT STATUS MATRIX</SectionHead>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"24px"}}>
              {AGENTS.map(a=>{
                const st = agentSt[a.id];
                const isActive = activeAgent === a.id;
                return (
                  <div key={a.id} style={{background:isActive?`${a.col}12`:C.surface2,border:`1px solid ${isActive?a.col:st==="done"?"#0d3020":C.border}`,borderRadius:"8px",padding:"14px",transition:"all .3s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
                      <span style={{fontSize:"18px"}}>{a.icon}</span>
                      <span style={{fontSize:"12px",fontWeight:"700",color:isActive?a.col:st==="done"?"#34d399":C.textBr}}>{a.name}</span>
                      <div style={{marginLeft:"auto",fontSize:"10px",letterSpacing:".08em"}}>
                        {st==="running" && <span style={{color:C.amber}}>● ACTIVE</span>}
                        {st==="done"    && <span style={{color:C.teal}}>✓ DONE</span>}
                        {!st           && <span style={{color:C.muted}}>○ IDLE</span>}
                      </div>
                    </div>
                    <div style={{fontSize:"11px",color:C.mutedTx}}>{a.role}</div>
                    {isActive && <div style={{height:"2px",background:`linear-gradient(90deg,${a.col},transparent)`,marginTop:"10px",borderRadius:"1px"}}/>}
                  </div>
                );
              })}
            </div>

            <SectionHead>SYSTEM LOG STREAM {running && <span style={{color:C.amber,marginLeft:"8px"}}>● LIVE</span>}</SectionHead>
            <div ref={logEl} style={{background:"#020408",border:`1px solid ${C.border}`,borderRadius:"8px",padding:"14px 16px",height:"380px",overflowY:"auto",fontFamily:"'Courier New',Courier,monospace"}}>
              {logs.length === 0 && <div style={{color:C.muted,fontSize:"12px"}}>// Awaiting pipeline start…</div>}
              {logs.map((l,i)=>(
                <div key={i} style={{marginBottom:"3px",fontSize:"11.5px",lineHeight:"1.6"}}>
                  <span style={{color:"#2a3a50"}}>{l.ts} </span>
                  <span style={{color:logColor(l.a)}}>{l.m}</span>
                </div>
              ))}
              {running && <span style={{color:C.teal}}>█</span>}
              {done && <div style={{color:C.teal,fontSize:"11.5px",marginTop:"8px",borderTop:`1px solid ${C.tealBord}`,paddingTop:"8px"}}>═══ PIPELINE COMPLETE — Switching to Results dashboard… ═══</div>}
            </div>

            {!running && !done && logs.length === 0 && (
              <div style={{textAlign:"center",marginTop:"24px"}}>
                <button onClick={()=>{if(diseaseId)runPipeline();else setTab("setup");}} style={{background:C.teal,color:"#000",border:"none",borderRadius:"8px",padding:"12px 28px",fontSize:"13px",fontWeight:"800",letterSpacing:".1em",cursor:"pointer",fontFamily:"inherit"}}>
                  {diseaseId ? "⚡ START PIPELINE" : "← SELECT DISEASE FIRST"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ RESULTS TAB ══════════════════ */}
        {tab === "results" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"24px"}}>
              {[
                {label:"ACCURACY GAIN",     val:"+23.4%",   col:C.teal},
                {label:"SYNTHETIC SAMPLES", val:"2,500",    col:"#22d3ee"},
                {label:"PRIVACY SCORE",     val:"94.7/100", col:"#34d399"},
                {label:"PIPELINE TIME",     val:"8.4s",     col:C.amber},
              ].map(m=>(
                <div key={m.label} style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"16px"}}>
                  <div style={{fontSize:"10px",color:C.mutedTx,letterSpacing:".15em",marginBottom:"8px"}}>{m.label}</div>
                  <div style={{fontSize:"26px",fontWeight:"800",color:m.col,letterSpacing:".02em"}}>{m.val}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
              <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px"}}>
                <SectionHead style={{marginTop:0}}>DIAGNOSTIC ACCURACY</SectionHead>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={accData} margin={{top:0,right:10,left:-20,bottom:30}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                    <XAxis dataKey="name" tick={{fill:C.mutedTx,fontSize:9}} interval={0} angle={-8} textAnchor="end"/>
                    <YAxis tick={{fill:C.mutedTx,fontSize:10}} domain={[0,100]}/>
                    <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:"12px"}} formatter={v=>[`${v}%`,"Accuracy"]}/>
                    <Bar dataKey="acc" radius={[4,4,0,0]}>
                      <Cell fill="#3d5070"/>
                      <Cell fill={C.teal}/>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px"}}>
                <SectionHead style={{marginTop:0}}>TRAINING CURVE (5-FOLD CV)</SectionHead>
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={epochData} margin={{top:0,right:10,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                    <XAxis dataKey="ep" tick={{fill:C.mutedTx,fontSize:10}} label={{value:"Epoch",position:"insideBottom",offset:-2,fill:C.mutedTx,fontSize:10}}/>
                    <YAxis tick={{fill:C.mutedTx,fontSize:10}} domain={[35,90]}/>
                    <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:"11px"}} formatter={v=>[`${v}%`]}/>
                    <Legend wrapperStyle={{fontSize:"11px",color:C.mutedTx}}/>
                    <Line type="monotone" dataKey="base" stroke="#3d5070" strokeWidth={2} dot={{r:3,fill:"#3d5070"}} name="Baseline"/>
                    <Line type="monotone" dataKey="aug"  stroke={C.teal}  strokeWidth={2} dot={{r:3,fill:C.teal}}  name="+Synthetic"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
              <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px"}}>
                <SectionHead style={{marginTop:0}}>PRIVACY COMPLIANCE DASHBOARD</SectionHead>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {[
                    {label:"Differential Privacy",          val:"ε=0.3, δ=1e-5"},
                    {label:"Membership Inference Test",     val:"51.2% ≈ random"},
                    {label:"DPDP Act 2023",                val:"Compliant"},
                    {label:"Data Minimisation",            val:"PII stripped"},
                    {label:"Synthetic Fidelity (SSIM)",    val:"0.854 avg"},
                  ].map(p=>(
                    <div key={p.label} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 12px",background:C.surface3,borderRadius:"6px",border:`1px solid ${C.border}`}}>
                      <span style={{color:"#34d399",fontSize:"12px",fontWeight:"700",minWidth:"40px"}}>PASS</span>
                      <span style={{flex:1,fontSize:"11px",color:C.text}}>{p.label}</span>
                      <span style={{fontSize:"11px",color:C.mutedTx}}>{p.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:"12px",padding:"10px",border:`1px solid ${C.tealBord}`,borderRadius:"6px"}}>
                  <div style={{fontSize:"10px",color:C.mutedTx,marginBottom:"4px"}}>COMPOSITE PRIVACY SCORE</div>
                  <div style={{fontSize:"28px",fontWeight:"800",color:C.teal}}>94.7<span style={{fontSize:"14px",color:C.mutedTx}}>/100</span></div>
                  <div style={{background:C.surface3,borderRadius:"4px",height:"6px",marginTop:"8px"}}>
                    <div style={{width:"94.7%",background:`linear-gradient(90deg,${C.teal},#22d3ee)`,height:"100%",borderRadius:"4px"}}/>
                  </div>
                </div>
              </div>

              <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px"}}>
                <SectionHead style={{marginTop:0}}>SYNTHETIC IMAGE PREVIEW (12 of 2,500)</SectionHead>
                <SyntheticGrid n={12}/>
                <div style={{marginTop:"10px",fontSize:"10px",color:C.mutedTx}}>
                  Privacy-preserved synthetic {disease?.name || "disease"} samples · Latent diffusion · SSIM 0.847 avg · FID 12.1
                </div>
              </div>
            </div>

            <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"20px"}}>
              <SectionHead style={{marginTop:0}}>GENERATED CLINICAL REPORT</SectionHead>
              <div style={{background:"#020408",borderRadius:"6px",padding:"16px",fontSize:"12px",lineHeight:"1.9",fontFamily:"'Courier New',monospace"}}>
                <div style={{color:C.textBr,fontWeight:"800",fontSize:"13px",marginBottom:"10px",borderBottom:`1px solid ${C.border}`,paddingBottom:"8px"}}>
                  SynRareAI DIAGNOSTIC SUMMARY · {disease?.name || "[No disease selected]"}
                </div>
                <InfoLine label="Generated"            val={new Date().toLocaleString()}/>
                <InfoLine label="Patient Population"   val="47 real + 2,500 privacy-preserved synthetic records"/>
                <InfoLine label="Model Architecture"   val="ResNet-50 + Synthetic Augmentation (SynRareAI v1.0)"/>
                <InfoLine label="Baseline Accuracy"    val="61.3% (real data only, n=47)"/>
                <InfoLine label="Augmented Accuracy"   val="84.7% (+23.4%) — 5-fold cross-validation"/>
                <InfoLine label="ROC-AUC"              val="0.92 (vs 0.71 baseline)"/>
                <InfoLine label="Privacy Guarantee"    val="(ε=0.3, δ=1e-5)-Differential Privacy · Score: 94.7/100"/>
                <InfoLine label="Compliance"           val="DPDP Act 2023 (India) · HIPAA-aligned · ISO 27001"/>
                <InfoLine label="Membership Inference" val="51.2% attack accuracy (≈ random — data cannot be re-identified)"/>
                <InfoLine label="Data Lineage"         val="Embedded in synthetic metadata per DPDP §7(b)"/>
                <div style={{marginTop:"12px",borderTop:`1px solid ${C.border}`,paddingTop:"8px",fontSize:"10px",color:C.muted}}>
                  Report generated by SynRareAI Report Agent v1.0 · Pipeline ID: {Math.random().toString(36).slice(2,10).toUpperCase()} · NOT FOR CLINICAL USE
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
