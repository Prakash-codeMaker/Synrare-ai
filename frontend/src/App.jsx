import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";

/* ─── Google Fonts injection ─────────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

/* ─── Global styles ──────────────────────────────────────────────────────── */
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black:    #03050a;
    --deep:     #070c15;
    --navy:     #0a1120;
    --panel:    #0d1626;
    --panel2:   #101c30;
    --gold:     #b8965a;
    --gold-dim: rgba(184,150,90,0.12);
    --gold-brd: rgba(184,150,90,0.28);
    --steel:    #1e3050;
    --line:     rgba(255,255,255,0.06);
    --line2:    rgba(255,255,255,0.10);
    --text:     #c4d4e8;
    --text-br:  #e8f0fc;
    --muted:    #3a5272;
    --muted2:   #526880;
    --teal:     #2dd4bf;
    --teal-dim: rgba(45,212,191,0.08);
    --teal-brd: rgba(45,212,191,0.22);
    --red:      #e05454;
    --amber:    #d4924a;
  }
  body { background: var(--black); font-family: 'Sora', sans-serif; color: var(--text); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--navy); }
  ::-webkit-scrollbar-thumb { background: var(--steel); border-radius: 2px; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanline { 0%{background-position:0 0} 100%{background-position:0 100%} }
  .fade-in { animation: fadeIn .4s ease both; }
`;
document.head.appendChild(globalStyle);

/* ─── Data ───────────────────────────────────────────────────────────────── */
const DISEASES = [
  { id:"hsp",     name:"Henoch-Schönlein Purpura", cat:"Autoimmune",  prev:"1 : 5,000",  color:"#8b6fcb" },
  { id:"wilson",  name:"Wilson's Disease",          cat:"Metabolic",   prev:"1 : 30,000", color:"#2e9fc4" },
  { id:"gaucher", name:"Gaucher's Disease",         cat:"Lysosomal",   prev:"1 : 40,000", color:"#2dd4bf" },
  { id:"pompe",   name:"Pompe Disease",             cat:"Glycogen",    prev:"1 : 40,000", color:"#b8965a" },
  { id:"fabry",   name:"Fabry Disease",             cat:"Lysosomal",   prev:"1 : 50,000", color:"#c06060" },
];

const AGENTS = [
  { id:"orch", label:"Orchestrator",   desc:"Pipeline coordination",      col:"#8b6fcb" },
  { id:"syn",  label:"SynData",        desc:"Synthetic generation",       col:"#2e9fc4" },
  { id:"priv", label:"Privacy Guard",  desc:"Differential privacy",       col:"#2dd4bf" },
  { id:"clf",  label:"Classifier",     desc:"Pattern recognition",        col:"#b8965a" },
  { id:"rep",  label:"Report",         desc:"Clinical synthesis",         col:"#c06060" },
  { id:"val",  label:"Validator",      desc:"Quality assurance",          col:"#4ab8a8" },
];

const buildLogs = (name) => [
  { a:"orch", m:`Pipeline v1.0 initialised  ·  target: ${name}` },
  { a:"orch", m:`Input schema validated  ·  47 records  ·  12 features` },
  { a:"orch", m:`Routing to SynData Agent  →  task: generate_synthetic_batch` },
  { a:"syn",  m:`Latent diffusion backbone loaded  ·  3.2s` },
  { a:"syn",  m:`Seeding generator with disease morphology priors` },
  { a:"syn",  m:`Batch 1/5 complete  ·  SSIM: 0.847  ·  FID: 12.3` },
  { a:"syn",  m:`Batch 2/5 complete  ·  SSIM: 0.861  ·  FID: 11.7` },
  { a:"syn",  m:`Tabular synthesis via GaussianCopulaSynthesizer` },
  { a:"syn",  m:`Batch 3/5 complete  ·  SSIM: 0.869  ·  FID: 11.2` },
  { a:"syn",  m:`Batch 4/5 complete  ·  SSIM: 0.874  ·  FID: 10.9` },
  { a:"syn",  m:`2,500 synthetic samples generated  ·  all batches complete` },
  { a:"priv", m:`Differential privacy engine initialised  ·  ε = 0.3  ·  δ = 1e-5` },
  { a:"priv", m:`Computing L2 sensitivity bounds for feature vectors` },
  { a:"priv", m:`Gaussian noise applied  ·  σ = 8.2` },
  { a:"priv", m:`Membership inference attack simulation running` },
  { a:"priv", m:`Attack accuracy: 51.2%  ≈  random guessing  ·  PASSED` },
  { a:"priv", m:`DPDP Act 2023 compliance verified  ·  PASSED` },
  { a:"priv", m:`Composite privacy score: 94.7 / 100` },
  { a:"clf",  m:`ResNet-50 backbone loaded  ·  fine-tuned: rare-disease-v3` },
  { a:"clf",  m:`Baseline inference  ·  real data only  ·  n = 47` },
  { a:"clf",  m:`Baseline accuracy: 61.3%  ·  AUC: 0.71` },
  { a:"clf",  m:`Augmenting training set with 2,500 synthetic samples` },
  { a:"clf",  m:`5-fold cross-validation running on augmented dataset` },
  { a:"clf",  m:`Augmented accuracy: 84.7%  ·  AUC: 0.92` },
  { a:"clf",  m:`Delta accuracy: +23.4%  ·  Delta AUC: +0.21` },
  { a:"rep",  m:`Clinical template loaded  ·  ${name} Diagnostic Protocol v2.1` },
  { a:"rep",  m:`LLM diagnostic summary generation in progress` },
  { a:"rep",  m:`DPDP-compliant data lineage metadata embedded` },
  { a:"rep",  m:`Report generated  ·  1,247 tokens` },
  { a:"val",  m:`Output quality gate running` },
  { a:"val",  m:`Synthetic quality: PASS  ·  Privacy: PASS  ·  Accuracy: PASS` },
  { a:"val",  m:`DPDP compliance: PASS  ·  Schema validation: PASS` },
  { a:"orch", m:`Pipeline complete  ·  8.4s  ·  all checks passed` },
];

const SEQUENCE = [
  { id:"orch", idx:[0,1,2],           t:0     },
  { id:"syn",  idx:[3,4,5,6,7,8,9,10], t:1200 },
  { id:"priv", idx:[11,12,13,14,15,16,17], t:4200 },
  { id:"clf",  idx:[18,19,20,21,22,23,24], t:7000 },
  { id:"rep",  idx:[25,26,27,28],     t:9800  },
  { id:"val",  idx:[29,30,31,32],     t:11800 },
];

const logCol = { orch:"#8b6fcb", syn:"#2e9fc4", priv:"#2dd4bf", clf:"#b8965a", rep:"#c06060", val:"#4ab8a8" };
const ts = () => new Date().toISOString().replace("T"," ").slice(0,23);

/* ─── Synthetic canvas grid ──────────────────────────────────────────────── */
function SynGrid({ n=12 }) {
  const refs = useRef([]);
  useEffect(() => {
    refs.current.forEach((c,i) => {
      if (!c) return;
      const ctx = c.getContext("2d");
      const {width:w,height:h} = c;
      ctx.fillStyle = "#020508"; ctx.fillRect(0,0,w,h);
      [[.38,.48,.20,.55+((i*31)%5)*.08],[.62,.52,.16,.45+((i*17)%6)*.07],[.5,.65,.14,.5]].forEach(([bx,by,br,op])=>{
        const g = ctx.createRadialGradient(bx*w,by*h,0,bx*w,by*h,br*w);
        const hue=[185,200,215,170,155][i%5];
        g.addColorStop(0,`hsla(${hue},65%,62%,${op})`); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      });
      const img=ctx.getImageData(0,0,w,h);
      for(let p=0;p<img.data.length;p+=4){const v=(Math.random()-.5)*14;img.data[p]=Math.max(0,Math.min(255,img.data[p]+v));img.data[p+1]=Math.max(0,Math.min(255,img.data[p+1]+v));img.data[p+2]=Math.max(0,Math.min(255,img.data[p+2]+v));}
      ctx.putImageData(img,0,0);
      ctx.strokeStyle="rgba(45,212,191,.12)"; ctx.lineWidth=.4;
      ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();
      ctx.fillStyle="rgba(184,150,90,.5)"; ctx.font="6px 'JetBrains Mono',monospace";
      ctx.fillText(`SYN·${((i*137)%999).toString().padStart(3,"0")}`,3,9);
    });
  },[n]);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"3px"}}>
      {Array.from({length:n}).map((_,i)=>(
        <canvas key={i} ref={el=>refs.current[i]=el} width={72} height={72}
          style={{width:"100%",aspectRatio:"1",borderRadius:"2px",border:"1px solid var(--steel)"}}/>
      ))}
    </div>
  );
}

/* ─── Reusable primitives ────────────────────────────────────────────────── */
const Label = ({children,style={}}) => (
  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".2em",color:"var(--muted2)",textTransform:"uppercase",marginBottom:"10px",...style}}>{children}</div>
);

const Divider = () => <div style={{height:"1px",background:"var(--line)",margin:"16px 0"}}/>;

const Tag = ({children,color}) => (
  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".12em",color:color||"var(--muted2)",border:`1px solid ${color||"var(--muted)"}33`,borderRadius:"2px",padding:"2px 7px"}}>{children}</span>
);

const StatCard = ({label,value,sub,accent}) => (
  <div style={{background:"var(--panel)",border:"1px solid var(--line2)",borderTop:`2px solid ${accent||"var(--gold)"}`,borderRadius:"4px",padding:"18px 20px"}}>
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".18em",color:"var(--muted2)",marginBottom:"10px"}}>{label}</div>
    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"34px",fontWeight:"300",color:accent||"var(--gold)",lineHeight:1,marginBottom:"4px"}}>{value}</div>
    {sub && <div style={{fontSize:"10px",color:"var(--muted2)",fontFamily:"'JetBrains Mono',monospace"}}>{sub}</div>}
  </div>
);

/* ─── Main App ───────────────────────────────────────────────────────────── */
export default function SynRareAI() {
  const [tab,setTab]         = useState("setup");
  const [disease,setDisease] = useState(null);
  const [uploaded,setUpload] = useState(false);
  const [running,setRunning] = useState(false);
  const [done,setDone]       = useState(false);
  const [logs,setLogs]       = useState([]);
  const [agSt,setAgSt]       = useState({});
  const [active,setActive]   = useState(null);
  const logEl  = useRef(null);
  const timers = useRef([]);
  const dis = DISEASES.find(d=>d.id===disease);

  useEffect(()=>{ if(logEl.current) logEl.current.scrollTop=logEl.current.scrollHeight; },[logs]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current=[]; };

  const runPipeline = () => {
    if(!disease) return;
    clear();
    setRunning(true); setDone(false); setLogs([]); setAgSt({}); setActive(null);
    const tpl = buildLogs(dis.name);
    SEQUENCE.forEach(({id,idx,t})=>{
      const t1=setTimeout(()=>{
        setActive(id); setAgSt(p=>({...p,[id]:"running"}));
        idx.forEach((li,pos)=>{
          const t2=setTimeout(()=>setLogs(p=>[...p,{ts:ts(),a:tpl[li].a,m:tpl[li].m}]),pos*320);
          timers.current.push(t2);
        });
        const t3=setTimeout(()=>setAgSt(p=>({...p,[id]:"done"})),idx.length*320+300);
        timers.current.push(t3);
      },t);
      timers.current.push(t1);
    });
    const tf=setTimeout(()=>{ setActive(null);setRunning(false);setDone(true);setTimeout(()=>setTab("results"),1000); },13500);
    timers.current.push(tf);
  };

  const reset=()=>{ clear();setTab("setup");setDisease(null);setUpload(false);setRunning(false);setDone(false);setLogs([]);setAgSt({});setActive(null); };

  const accData=[{name:"Baseline",acc:61.3},{name:"Augmented",acc:84.7}];
  const curveData=[{ep:1,b:42,a:58},{ep:2,b:51,a:67},{ep:3,b:56,a:74},{ep:4,b:59,a:79},{ep:5,b:61.3,a:84.7}];

  return (
    <div style={{background:"var(--black)",minHeight:"100vh",display:"flex",flexDirection:"column"}}>

      {/* ── Top bar ── */}
      <header style={{background:"var(--deep)",borderBottom:"1px solid var(--line2)",height:"56px",display:"flex",alignItems:"center",padding:"0 32px",gap:"0",flexShrink:0,position:"sticky",top:0,zIndex:100}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginRight:"48px"}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" stroke="var(--gold)" strokeWidth=".8"/>
            <path d="M11 3 L11 19 M3 11 L19 11" stroke="var(--gold)" strokeWidth=".8"/>
            <circle cx="11" cy="11" r="3" fill="none" stroke="var(--teal)" strokeWidth=".8"/>
          </svg>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",fontWeight:"500",color:"var(--text-br)",letterSpacing:".06em",lineHeight:1}}>SynRare<span style={{color:"var(--gold)"}}>AI</span></div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",letterSpacing:".18em",color:"var(--muted2)",marginTop:"2px"}}>DIAGNOSTIC INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{display:"flex",height:"100%",flex:1}}>
          {[["setup","01  Setup"],["pipeline","02  Pipeline"],["results","03  Results"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              background:"none",border:"none",cursor:"pointer",padding:"0 24px",
              fontFamily:"'Sora',sans-serif",fontSize:"11px",letterSpacing:".08em",
              color:tab===id?"var(--text-br)":"var(--muted2)",
              borderBottom:tab===id?"2px solid var(--gold)":"2px solid transparent",
              transition:"all .2s",height:"100%"
            }}>{label}</button>
          ))}
        </nav>

        {/* Status bar right */}
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
            {AGENTS.map(a=>(
              <div key={a.id} title={a.label} style={{
                width:"5px",height:"5px",borderRadius:"50%",
                background:agSt[a.id]==="running"?a.col:agSt[a.id]==="done"?"#1a4038":"var(--steel)",
                boxShadow:agSt[a.id]==="running"?`0 0 5px ${a.col}`:"none",
                transition:"all .3s"
              }}/>
            ))}
          </div>
          {running && (
            <div style={{display:"flex",alignItems:"center",gap:"6px",background:"rgba(184,150,90,.08)",border:"1px solid var(--gold-brd)",borderRadius:"3px",padding:"4px 12px"}}>
              <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"var(--gold)",animation:"pulse 1.2s ease-in-out infinite"}}/>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".14em",color:"var(--gold)"}}>PROCESSING</span>
            </div>
          )}
          {done && (
            <div style={{display:"flex",alignItems:"center",gap:"6px",background:"var(--teal-dim)",border:"1px solid var(--teal-brd)",borderRadius:"3px",padding:"4px 12px"}}>
              <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4L3 6L7 2" stroke="var(--teal)" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".14em",color:"var(--teal)"}}>COMPLETE</span>
            </div>
          )}
          <button onClick={reset} style={{background:"none",border:"1px solid var(--steel)",borderRadius:"3px",padding:"5px 14px",fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".12em",color:"var(--muted2)",cursor:"pointer",transition:"all .2s"}}>RESET</button>
        </div>
      </header>

      {/* ── Page ── */}
      <main style={{flex:1,overflowY:"auto",padding:"32px",maxWidth:"1200px",width:"100%",margin:"0 auto",boxSizing:"border-box"}}>

        {/* ══════════════════════════ SETUP ══════════════════════════════ */}
        {tab==="setup" && (
          <div className="fade-in">
            {/* Section: disease */}
            <div style={{display:"flex",alignItems:"baseline",gap:"16px",marginBottom:"20px"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",fontWeight:"300",color:"var(--text-br)",letterSpacing:".02em"}}>Select Target Pathology</h2>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--muted2)",letterSpacing:".14em"}}>5 RARE DISEASE TARGETS</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"8px",marginBottom:"36px"}}>
              {DISEASES.map(d=>(
                <div key={d.id} onClick={()=>setDisease(d.id)} style={{
                  background:disease===d.id?`${d.color}0d`:"var(--panel)",
                  border:`1px solid ${disease===d.id?d.color:"var(--line2)"}`,
                  borderTop:`3px solid ${disease===d.id?d.color:"var(--steel)"}`,
                  borderRadius:"4px",padding:"18px 16px",cursor:"pointer",transition:"all .22s"
                }}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",letterSpacing:".14em",color:disease===d.id?d.color:"var(--muted2)",marginBottom:"10px"}}>{d.cat.toUpperCase()}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"14px",fontWeight:"500",color:disease===d.id?d.color:"var(--text-br)",lineHeight:"1.4",marginBottom:"12px"}}>{d.name}</div>
                  <div style={{height:"1px",background:disease===d.id?`${d.color}33`:"var(--line)",marginBottom:"10px"}}/>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--muted2)",letterSpacing:".06em"}}>Prev. {d.prev}</div>
                </div>
              ))}
            </div>

            {/* Section: upload */}
            <div style={{display:"flex",alignItems:"baseline",gap:"16px",marginBottom:"20px"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",fontWeight:"300",color:"var(--text-br)",letterSpacing:".02em"}}>Patient Data Upload</h2>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--muted2)",letterSpacing:".14em"}}>DPDP ACT 2023 COMPLIANT</span>
            </div>

            <div onClick={()=>setUpload(true)} style={{
              background:uploaded?"var(--teal-dim)":"var(--panel)",
              border:`1px solid ${uploaded?"var(--teal-brd)":"var(--steel)"}`,
              borderRadius:"4px",padding:"32px",textAlign:"center",cursor:"pointer",
              marginBottom:"28px",transition:"all .25s",position:"relative",overflow:"hidden"
            }}>
              {/* Grid bg */}
              <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",backgroundSize:"40px 40px",opacity:.4}}/>
              <div style={{position:"relative"}}>
                {uploaded ? (
                  <>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{margin:"0 auto 14px"}}>
                      <circle cx="16" cy="16" r="15" stroke="var(--teal)" strokeWidth=".8"/>
                      <path d="M10 16L14 20L22 12" stroke="var(--teal)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color:"var(--teal)",letterSpacing:".1em",marginBottom:"6px"}}>patient_data_sample.csv</div>
                    <div style={{fontSize:"11px",color:"var(--muted2)"}}>47 records  ·  12 features  ·  3 diagnostic classes  ·  PII stripped</div>
                  </>
                ) : (
                  <>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{margin:"0 auto 14px"}}>
                      <rect x="6" y="4" width="20" height="24" rx="2" stroke="var(--muted)" strokeWidth=".8"/>
                      <path d="M16 10L16 22M11 16L16 10L21 16" stroke="var(--muted2)" strokeWidth=".8" fill="none" strokeLinecap="round"/>
                    </svg>
                    <div style={{fontFamily:"'Sora',sans-serif",fontSize:"12px",color:"var(--muted2)",marginBottom:"4px"}}>Click to simulate data upload</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--muted)",letterSpacing:".1em"}}>CSV  ·  DICOM  ·  NIfTI  ·  FHIR</div>
                  </>
                )}
              </div>
            </div>

            {/* Data preview table */}
            {uploaded && (
              <div style={{background:"var(--panel)",border:"1px solid var(--line2)",borderRadius:"4px",padding:"20px",marginBottom:"28px"}} className="fade-in">
                <Label>Data preview — anonymised</Label>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px"}}>
                    <thead>
                      <tr>
                        {["PATIENT ID","AGE","SEX","BIOMARKER 1","BIOMARKER 2","WBC","CRP","LABEL"].map(h=>(
                          <th key={h} style={{textAlign:"left",padding:"6px 12px",color:"var(--gold)",borderBottom:"1px solid var(--steel)",fontWeight:"400",letterSpacing:".1em",whiteSpace:"nowrap"}}>{h}</th>
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
                        <tr key={i} style={{borderBottom:"1px solid var(--line)"}}>
                          {row.map((cell,j)=>(
                            <td key={j} style={{padding:"8px 12px",color:j===7?(cell==="Positive"?"#e07070":cell==="Borderline"?"var(--amber)":"var(--teal)"):"var(--text)"}}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={()=>{setTab("pipeline");setTimeout(runPipeline,500);}}
              disabled={!disease}
              style={{
                width:"100%",padding:"16px",border:"none",borderRadius:"4px",
                background:disease?"var(--gold)":"var(--panel2)",
                color:disease?"#07090f":"var(--muted)",
                fontFamily:"'Sora',sans-serif",fontSize:"13px",fontWeight:"500",
                letterSpacing:".18em",textTransform:"uppercase",
                cursor:disease?"pointer":"not-allowed",transition:"all .25s"
              }}
            >{disease?"Initiate Pipeline":"Select a Disease to Continue"}</button>
          </div>
        )}

        {/* ══════════════════════════ PIPELINE ═══════════════════════════ */}
        {tab==="pipeline" && (
          <div className="fade-in">
            <div style={{display:"flex",alignItems:"baseline",gap:"16px",marginBottom:"24px"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",fontWeight:"300",color:"var(--text-br)"}}>Agent Execution Matrix</h2>
              {running && <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--gold)",letterSpacing:".14em",animation:"pulse 1.4s ease-in-out infinite"}}>LIVE</span>}
            </div>

            {/* Agent cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"28px"}}>
              {AGENTS.map(a=>{
                const st=agSt[a.id];
                const isA=active===a.id;
                return (
                  <div key={a.id} style={{
                    background:isA?`${a.col}0a`:"var(--panel)",
                    border:`1px solid ${isA?a.col:st==="done"?"#0d2820":"var(--line2)"}`,
                    borderLeft:`3px solid ${isA?a.col:st==="done"?"#1a4830":"var(--steel)"}`,
                    borderRadius:"4px",padding:"16px 18px",transition:"all .3s"
                  }}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",fontWeight:"500",color:isA?a.col:st==="done"?"#4ab8a8":"var(--text-br)"}}>{a.label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",letterSpacing:".1em",
                        color:st==="running"?"var(--gold)":st==="done"?"var(--teal)":"var(--muted)"}}>
                        {st==="running"?"ACTIVE":st==="done"?"COMPLETE":"STANDBY"}
                      </span>
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--muted2)",letterSpacing:".06em",marginBottom:isA?"12px":"0"}}>{a.desc}</div>
                    {isA && <div style={{height:"1px",background:`linear-gradient(90deg,${a.col},transparent)`}}/>}
                  </div>
                );
              })}
            </div>

            {/* Log terminal */}
            <Label>System log — real-time stream</Label>
            <div ref={logEl} style={{
              background:"#020508",border:"1px solid var(--steel)",
              borderRadius:"4px",padding:"18px",height:"400px",overflowY:"auto",
              fontFamily:"'JetBrains Mono',monospace",position:"relative"
            }}>
              {/* scanline overlay */}
              <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px)",pointerEvents:"none",borderRadius:"4px"}}/>
              {logs.length===0 && <div style={{color:"var(--muted)",fontSize:"11px"}}>// awaiting pipeline initialisation</div>}
              {logs.map((l,i)=>(
                <div key={i} style={{marginBottom:"4px",fontSize:"11px",lineHeight:"1.7",display:"flex",gap:"10px"}}>
                  <span style={{color:"var(--muted)",flexShrink:0,fontSize:"10px"}}>{l.ts}</span>
                  <span style={{color:logCol[l.a]||"var(--teal)"}}>
                    <span style={{color:"var(--muted2)",marginRight:"6px"}}>[{l.a.toUpperCase().padEnd(4)}]</span>
                    {l.m}
                  </span>
                </div>
              ))}
              {running && <span style={{color:"var(--gold)",fontSize:"12px",animation:"pulse .8s ease-in-out infinite"}}>_</span>}
              {done && (
                <div style={{marginTop:"12px",paddingTop:"12px",borderTop:"1px solid var(--steel)",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--teal)",letterSpacing:".08em"}}>
                  Pipeline execution complete  ·  Transferring to results view
                </div>
              )}
            </div>

            {!running && !done && logs.length===0 && (
              <div style={{textAlign:"center",marginTop:"24px"}}>
                <button onClick={()=>{if(disease)runPipeline();else setTab("setup");}} style={{
                  background:"var(--gold)",color:"#07090f",border:"none",borderRadius:"4px",
                  padding:"12px 32px",fontFamily:"'Sora',sans-serif",fontSize:"12px",
                  fontWeight:"500",letterSpacing:".18em",textTransform:"uppercase",cursor:"pointer"
                }}>{disease?"Start Pipeline":"Select Disease First"}</button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════ RESULTS ════════════════════════════ */}
        {tab==="results" && (
          <div className="fade-in">
            {/* KPI strip */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"28px"}}>
              <StatCard label="ACCURACY GAIN"      value="+23.4%"   sub="vs 61.3% baseline"        accent="var(--teal)"/>
              <StatCard label="SYNTHETIC SAMPLES"  value="2,500"    sub="from 47 real records"      accent="var(--gold)"/>
              <StatCard label="PRIVACY SCORE"      value="94.7"     sub="out of 100  ·  ε = 0.3"   accent="#8b6fcb"/>
              <StatCard label="PIPELINE TIME"      value="8.4s"     sub="end-to-end execution"      accent="var(--amber)"/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
              {/* Accuracy chart */}
              <div style={{background:"var(--panel)",border:"1px solid var(--line2)",borderRadius:"4px",padding:"20px"}}>
                <Label style={{marginBottom:"16px"}}>Diagnostic accuracy — baseline vs augmented</Label>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={accData} margin={{top:0,right:0,left:-24,bottom:0}}>
                    <CartesianGrid strokeDasharray="2 4" stroke="var(--line)"/>
                    <XAxis dataKey="name" tick={{fill:"var(--muted2)",fontSize:10,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"var(--muted2)",fontSize:10,fontFamily:"JetBrains Mono"}} domain={[0,100]} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:"var(--navy)",border:"1px solid var(--steel)",color:"var(--text)",fontFamily:"JetBrains Mono",fontSize:"11px"}} formatter={v=>[`${v}%`,"Accuracy"]}/>
                    <Bar dataKey="acc" radius={[2,2,0,0]}>
                      <Cell fill="var(--steel)"/>
                      <Cell fill="var(--teal)"/>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Training curve */}
              <div style={{background:"var(--panel)",border:"1px solid var(--line2)",borderRadius:"4px",padding:"20px"}}>
                <Label style={{marginBottom:"16px"}}>Training convergence — 5-fold cross-validation</Label>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={curveData} margin={{top:0,right:0,left:-24,bottom:0}}>
                    <CartesianGrid strokeDasharray="2 4" stroke="var(--line)"/>
                    <XAxis dataKey="ep" tick={{fill:"var(--muted2)",fontSize:10,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} label={{value:"epoch",position:"insideBottom",offset:-2,fill:"var(--muted)",fontSize:9}}/>
                    <YAxis tick={{fill:"var(--muted2)",fontSize:10,fontFamily:"JetBrains Mono"}} domain={[35,90]} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:"var(--navy)",border:"1px solid var(--steel)",color:"var(--text)",fontFamily:"JetBrains Mono",fontSize:"11px"}} formatter={v=>[`${v}%`]}/>
                    <Legend wrapperStyle={{fontFamily:"JetBrains Mono",fontSize:"10px",color:"var(--muted2)"}}/>
                    <Line type="monotone" dataKey="b" stroke="var(--muted)" strokeWidth={1.5} dot={{r:2,fill:"var(--muted)"}} name="Baseline"/>
                    <Line type="monotone" dataKey="a" stroke="var(--teal)"  strokeWidth={1.5} dot={{r:2,fill:"var(--teal)"}}  name="Augmented"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
              {/* Privacy */}
              <div style={{background:"var(--panel)",border:"1px solid var(--line2)",borderRadius:"4px",padding:"20px"}}>
                <Label style={{marginBottom:"16px"}}>Privacy compliance — DPDP Act 2023</Label>
                <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px"}}>
                  {[
                    ["Differential Privacy (ε=0.3, δ=1e-5)","Gaussian mechanism applied"],
                    ["Membership Inference Test","51.2% attack acc. ≈ random"],
                    ["DPDP Act 2023 §7 – §16","All clauses satisfied"],
                    ["Data Minimisation","PII stripped  ·  12 features only"],
                    ["Synthetic Fidelity SSIM","0.854 average across batches"],
                  ].map(([label,val])=>(
                    <div key={label} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",background:"var(--panel2)",borderRadius:"3px",border:"1px solid var(--line)"}}>
                      <svg width="10" height="10" viewBox="0 0 10 10" style={{flexShrink:0}}>
                        <circle cx="5" cy="5" r="4.5" stroke="var(--teal)" strokeWidth=".7" fill="none"/>
                        <path d="M2.5 5L4 6.5L7.5 3.5" stroke="var(--teal)" strokeWidth=".9" fill="none" strokeLinecap="round"/>
                      </svg>
                      <span style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--text)",letterSpacing:".04em"}}>{label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--muted2)"}}>{val}</span>
                    </div>
                  ))}
                </div>
                <Divider/>
                <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginBottom:"6px"}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"38px",fontWeight:"300",color:"#8b6fcb",lineHeight:1}}>94.7</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--muted2)"}}>/ 100</span>
                </div>
                <div style={{background:"var(--panel2)",borderRadius:"2px",height:"4px"}}>
                  <div style={{width:"94.7%",background:"linear-gradient(90deg,#8b6fcb,#2dd4bf)",height:"100%",borderRadius:"2px"}}/>
                </div>
              </div>

              {/* Synthetic preview */}
              <div style={{background:"var(--panel)",border:"1px solid var(--line2)",borderRadius:"4px",padding:"20px"}}>
                <Label style={{marginBottom:"16px"}}>Synthetic image sample — 12 of 2,500</Label>
                <SynGrid n={12}/>
                <Divider/>
                <div style={{display:"flex",gap:"16px"}}>
                  {[["SSIM","0.854"],["FID","12.1"],["SAMPLES","2,500"],["BATCH TIME","1.6s"]].map(([k,v])=>(
                    <div key={k}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--muted2)",letterSpacing:".12em",marginBottom:"2px"}}>{k}</div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"17px",fontWeight:"400",color:"var(--gold)"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinical report */}
            <div style={{background:"var(--panel)",border:"1px solid var(--line2)",borderRadius:"4px",padding:"24px"}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:"16px"}}>
                <Label style={{marginBottom:0}}>Generated clinical report</Label>
                <Tag color="var(--teal)">NOT FOR CLINICAL USE</Tag>
              </div>
              <Divider/>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",lineHeight:"2",color:"var(--muted2)"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"17px",fontWeight:"500",color:"var(--text-br)",marginBottom:"16px",letterSpacing:".03em"}}>
                  SynRareAI Diagnostic Summary  ·  {dis?.name || "—"}
                </div>
                {[
                  ["Generated",           new Date().toLocaleString()],
                  ["Patient population",  "47 real  +  2,500 privacy-preserved synthetic records"],
                  ["Model architecture",  "ResNet-50  +  Synthetic Augmentation  (SynRareAI v1.0)"],
                  ["Baseline accuracy",   "61.3%  (real data only, n = 47, 5-fold CV)"],
                  ["Augmented accuracy",  "84.7%  (+23.4%)  —  5-fold cross-validation"],
                  ["ROC-AUC",             "0.92  vs  0.71 baseline  (+0.21)"],
                  ["Privacy guarantee",   "(ε=0.3, δ=1e-5)  Differential Privacy  ·  Score: 94.7 / 100"],
                  ["Compliance",          "DPDP Act 2023  ·  HIPAA-aligned  ·  ISO 27001"],
                  ["Membership inference","51.2% attack accuracy  (≈ random  —  no re-identification possible)"],
                  ["Data lineage",        "Embedded in synthetic metadata per DPDP §7(b)"],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",gap:"12px",marginBottom:"2px"}}>
                    <span style={{color:"var(--gold)",minWidth:"220px",flexShrink:0}}>{k}</span>
                    <span style={{color:"var(--text)"}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:"16px",paddingTop:"12px",borderTop:"1px solid var(--line)",fontSize:"9px",color:"var(--muted)",letterSpacing:".06em"}}>
                  Report ID: {Math.random().toString(36).slice(2,10).toUpperCase()}  ·  SynRareAI Report Agent v1.0  ·  This report is for research purposes only
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}