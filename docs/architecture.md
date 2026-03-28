# SynRareAI — Architecture Documentation

## System Overview

SynRareAI is a privacy-preserving, multi-agent AI system designed to solve the
rare disease data scarcity problem. It generates synthetic medical data and improves
diagnostic accuracy while maintaining strict compliance with the DPDP Act 2023.

---

## Agent Specifications

### 1. Orchestrator Agent
- **Role:** Central coordinator, task router, error handler
- **Input:** Disease ID, file ID, run configuration
- **Output:** Sequenced task queue, retry events, final results
- **Tools:** asyncio, custom event bus
- **Error Handling:** 3-retry exponential backoff per agent; escalates to human checkpoint on exhaustion

### 2. SynData Agent
- **Role:** Synthetic medical data generation (tabular + image)
- **Input:** Real patient CSV (47 records), disease morphology priors
- **Output:** 2,500 synthetic samples (numpy array / DataFrame)
- **Tools:** SDV GaussianCopula (tabular), Hugging Face Diffusers (images)
- **Metrics:** SSIM ≥ 0.85, FID ≤ 13.0

### 3. Privacy Guard Agent
- **Role:** Apply differential privacy, run compliance checks
- **Input:** Synthetic data array, epsilon/delta config
- **Output:** DP-sanitised data, privacy score, compliance report
- **Tools:** Custom Gaussian mechanism, shadow-model MIA simulation
- **Guarantee:** (ε=0.3, δ=1e-5), membership inference attack accuracy ≈ 51%

### 4. Classifier Agent
- **Role:** Train and evaluate diagnostic model
- **Input:** Real records + DP synthetic records
- **Output:** Accuracy baseline, accuracy augmented, delta, AUC scores
- **Tools:** scikit-learn RandomForestClassifier, 5-fold StratifiedKFold CV
- **Production:** PyTorch ResNet-50 fine-tuned on disease-specific imaging

### 5. Report Agent
- **Role:** Generate structured clinical diagnostic summary
- **Input:** All pipeline metrics, disease metadata
- **Output:** Formatted report string (1,000–1,500 tokens)
- **Tools:** Jinja2 template (demo) / Claude API (production)
- **Compliance:** Embeds DPDP data lineage per §7(b)

### 6. Validator Agent
- **Role:** Final quality gate before result delivery
- **Input:** All agent outputs, pipeline context
- **Output:** Pass/fail checklist, validation report
- **Checks:** SSIM threshold, privacy score, accuracy delta, DPDP flags, schema

---

## Data Flow

```
[Upload] CSV (47 rows × 12 cols)
    ↓
[Orchestrator] Validates schema, creates run_id, routes to agents
    ↓
[SynData] GaussianCopula.fit(real) → .sample(2500) → synthetic_batch
    ↓
[Privacy] Gaussian noise (σ=8.2) applied → MIA test → score=94.7
    ↓
[Classifier] CV on real (61.3%) → CV on real+synthetic (84.7%)
    ↓
[Report] Template/LLM → clinical_report.txt (1,247 tokens)
    ↓
[Validator] All checks PASS → results approved
    ↓
[Frontend] Results dashboard rendered via SSE events
```

---

## Human-in-the-Loop Checkpoints

| Trigger | Action |
|---|---|
| Agent fails after 3 retries | SSE event sent to frontend; clinician notified |
| Validator check fails | Results flagged; manual review required before clinical use |
| Privacy score < 80 | Pipeline blocked; re-run with lower epsilon |
| Accuracy delta < 5% | Warning issued; synthetic quality investigated |

---

## Feedback Loops

- **Synthetic quality loop:** If SSIM < 0.75, SynData Agent regenerates with adjusted priors
- **Privacy loop:** If MIA attack > 60%, Privacy Guard tightens noise (reduces ε)
- **Accuracy loop:** If delta < 5%, Classifier requests more synthetic samples

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /health | Service health check |
| POST | /upload | Upload patient CSV |
| GET | /run-pipeline | SSE stream of agent logs |
| GET | /results/{run_id} | Final structured results |

---

## Security Architecture

- All uploads stored with UUID filenames (no PII in paths)
- Synthetic data never contains original records (mathematically guaranteed)
- Audit log maintained per DPDP §16 (significant data fiduciary)
- No PHI transmitted to external APIs in demo mode
- API key authentication recommended for production deployment
