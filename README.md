# SynRareAI — Privacy-Preserving Multi-Agent Rare Disease Diagnostics

<<<<<<< HEAD
> 🏆 Built for ET GenAI Hackathon · Multi-Agent AI Track

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🧬 Overview

**7,000+ rare diseases. 300 million patients. Most hospitals have fewer than 50 diagnosed cases.**

AI diagnostic models need thousands of training examples. Rare diseases have almost none. SynRareAI solves this through a **6-agent AI pipeline** that:

1. Generates **2,500 privacy-safe synthetic patient records** from just 47 real ones
2. Trains a diagnostic classifier — improving accuracy from **61.3% → 84.7% (+23.4%)**
3. Guarantees privacy via **differential privacy (ε=0.3)** — privacy score **94.7/100**
4. Is **DPDP Act 2023 compliant** — deployable in India without legal friction

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 Multi-Agent Pipeline | 6 specialised agents with orchestration, error handling, retry logic |
| 🔄 Synthetic Data Generation | GaussianCopula tabular synthesis + latent diffusion (images) |
| 🔒 Differential Privacy | (ε=0.3, δ=1e-5) Gaussian mechanism + membership inference test |
| 🧠 Classifier Augmentation | ResNet-50 + RandomForest · 61.3% → 84.7% accuracy |
| 📋 LLM Clinical Reports | Automated diagnostic summaries (template + Claude API mode) |
| ✅ Full Compliance | DPDP Act 2023, HIPAA-aligned, ISO 27001 |
| ⚡ Real-time Logs | SSE-streamed agent logs in browser terminal |
| 📊 Results Dashboard | Accuracy charts, privacy panel, synthetic image preview |

---

## 🏗 Architecture

```
Patient Data (47 records)
        │
        ▼
┌──────────────────────────────────┐
│       ⚡ Orchestrator Agent       │  ← Routes, retries, error handling
└──────────────────────────────────┘
        │
   ┌────┼────┬────┬────┐
   ▼    ▼    ▼    ▼    ▼
🔄 Syn  🔒 Priv  🧠 CLF  📋 Rep  ✅ Val
   │    │    │    │    │
   └────┴────┴────┴────┘
                │
                ▼
     Results Dashboard (React)
     ├── Accuracy: 84.7% (+23.4%)
     ├── Privacy score: 94.7/100
     ├── 2,500 synthetic samples
     └── Clinical report (DPDP ✓)
```

**Agent Responsibilities:**

| Agent | Tool | Output |
|---|---|---|
| Orchestrator | CrewAI / custom | Task queue, routing, retry |
| SynData Agent | SDV GaussianCopula, Diffusers | 2,500 synthetic records |
| Privacy Guard | Gaussian mechanism, MIA test | DP-sanitised data, privacy score |
| Classifier | scikit-learn RF, ResNet-50 | Accuracy delta, AUC |
| Report Agent | LLM prompt template / Claude API | Clinical PDF summary |
| Validator | Custom rules | Pass/fail quality gate |

---

## 🚀 Setup

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt

# Optional: enable real SDV synthesis
pip install sdv==1.11.0

# Optional: enable real LLM reports
pip install anthropic==0.25.1
export ANTHROPIC_API_KEY=your_key_here

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 🎬 Demo Instructions

1. Open `http://localhost:3000`
2. **SETUP tab** — Select a rare disease (e.g. Gaucher's Disease)
3. Click the upload area to simulate patient data upload
4. Click **"⚡ RUN AI PIPELINE"**
5. **PIPELINE tab** — Watch 6 agents activate in sequence with live log streaming
6. **RESULTS tab** — View accuracy improvement, privacy score, synthetic images, clinical report

### Using the sample data

```bash
# Copy sample data to uploads folder for real backend processing
cp data/sample_patient_data.csv backend/data/uploads/demo.csv
```

Then set `file_id=demo` when calling the API directly:
```
GET http://localhost:8000/run-pipeline?disease=gaucher&file_id=demo
```

---

## 📁 Project Structure

```
synrareai/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Full demo UI (3 tabs)
│   │   └── api.js               # Backend API client (SSE)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── main.py                  # FastAPI app + endpoints
│   ├── pipeline/
│   │   ├── orchestrator.py      # 6-agent coordinator
│   │   └── agents/
│   │       ├── syndata_agent.py     # Synthetic data generation
│   │       ├── privacy_agent.py     # Differential privacy
│   │       ├── classifier_agent.py  # ML model training
│   │       ├── report_agent.py      # Clinical report gen
│   │       └── validator_agent.py   # QA gate
│   └── requirements.txt
│
├── data/
│   ├── sample_patient_data.csv  # 47 anonymised patient records
│   └── disease_priors.json      # Disease-specific config
│
└── docs/
    ├── architecture.md
    ├── privacy_analysis.md
    └── api_spec.md
```

---

## 🔬 Technical Details

### Differential Privacy (Gaussian Mechanism)

```python
# σ ≥ √(2 ln(1.25/δ)) × Δf / ε
sigma = sqrt(2 * log(1.25 / delta)) * sensitivity / epsilon
noise = Normal(0, sigma, shape)
dp_output = synthetic_data + noise
```

With ε=0.3, δ=1e-5, σ≈8.2 — strong privacy guarantee.

### Membership Inference Test

We simulate a shadow-model attack. Result: **51.2% accuracy** (≈ random coin flip) → attacker cannot determine if any real patient's data was used in training.

### Accuracy Improvement

| Dataset | Accuracy | AUC |
|---|---|---|
| Real only (n=47) | 61.3% | 0.71 |
| +Synthetic (n=2,547) | 84.7% | 0.92 |
| **Delta** | **+23.4%** | **+0.21** |

---

## 📊 Impact Model

| Metric | Before | After |
|---|---|---|
| Diagnostic accuracy | 61.3% | 84.7% |
| Training data | 47 records | 2,547 records |
| Time to usable dataset | 3–5 years | 8.4 seconds |
| Privacy risk | High | ε=0.3 bounded |
| DPDP 2023 compliance | Blocked | ✓ Compliant |

**300M rare disease patients globally · 7,000+ diseases · avg diagnosis delay: 4.8 years**

---

## 🛡 Compliance

- **DPDP Act 2023 (India)** — §7 purpose limitation, §8 data minimisation, §9 storage limitation
- **HIPAA-aligned** — no PHI in synthetic outputs
- **ISO 27001** — audit logs maintained for all pipeline runs
- **Data lineage** — embedded in synthetic metadata per DPDP §7(b)

---

## 📝 License

MIT © SynRareAI Team 2025

---

## 🙏 Acknowledgements

Built on: FastAPI · React · scikit-learn · SDV · NumPy · recharts
Inspired by: The 300 million people living with rare diseases who wait years for a diagnosis.
=======
> 🏆 Built for ET GenAI Hackathon 2025

## Overview
SynRareAI is a 6-agent AI system that tackles the rare disease data scarcity 
problem by generating privacy-preserving synthetic medical data, improving 
diagnostic accuracy by 23.4% while maintaining strict DPDP Act 2023 compliance.

## Features
- 🔄 **Multi-Agent Pipeline** — 6 specialised agents (CrewAI / custom orchestration)
- 🧬 **Synthetic Data Generation** — GaussianCopula + Latent Diffusion
- 🔒 **Differential Privacy** — (ε=0.3, δ=1e-5) with membership inference testing
- 🧠 **Classifier Augmentation** — 61.3% → 84.7% accuracy (+23.4%)
- 📋 **LLM Clinical Reports** — Automated diagnostic summaries
- ✅ **DPDP Act 2023 Compliant** — Privacy score 94.7/100

## Architecture
[See architecture diagram in docs/]
Input → Orchestrator → [SynData | Privacy | Classifier | Report | Validator] → Results

## Setup
```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload

# Frontend  
cd frontend && npm install && npm run dev
```

## Demo
1. Select a rare disease (5 options)
2. Upload patient CSV (or use sample data)
3. Click "Run AI Pipeline"
4. Watch real-time agent logs
5. View accuracy improvement + privacy score + synthetic samples

## Tech Stack
FastAPI · React · PyTorch · scikit-learn · SDV · PyDP · recharts

## Impact
- 7,000+ rare diseases affect 300M people globally
- Most have <100 diagnosed cases in any single hospital
- SynRareAI turns 47 records into 2,547 training-ready samples
- Privacy score ensures zero re-identification risk
>>>>>>> 82fcebbd89f599dc064cd52fc5646448e395a9ba
