# SynRareAI — API Specification

Base URL: `http://localhost:8000`

---

## GET /health

Health check.

**Response 200:**
```json
{
  "status": "ok",
  "service": "SynRareAI",
  "version": "1.0.0"
}
```

---

## POST /upload

Upload a patient data CSV file.

**Request:** `multipart/form-data`
- `file` — CSV file (max 10MB)

**Response 200:**
```json
{
  "file_id": "a3f9c2d1",
  "filename": "patients.csv",
  "rows": 47,
  "features": 12,
  "status": "uploaded"
}
```

---

## GET /run-pipeline

Run the full 6-agent pipeline. Returns a **Server-Sent Events (SSE)** stream.

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| disease | string | ✅ | Disease ID (hsp, wilson, gaucher, pompe, fabry) |
| file_id | string | ✅ | File ID from /upload |

**SSE Event format:**
```
data: {"type": "log", "agent": "syn", "msg": "[SYNDATA] ...", "ts": 1718000000.0}
```

**Event types:**
| Type | Description |
|---|---|
| `log` | Agent log message (agent, msg, ts) |
| `checkpoint` | Human-in-the-loop trigger |
| `results` | Final structured results (run_id, data{}) |
| `done` | Pipeline complete (run_id) |

**Frontend (JavaScript):**
```js
const es = new EventSource('/run-pipeline?disease=gaucher&file_id=a3f9c2d1');
es.onmessage = (e) => {
  const event = JSON.parse(e.data);
  if (event.type === 'log') console.log(event.msg);
  if (event.type === 'done') es.close();
};
```

---

## GET /results/{run_id}

Retrieve final results for a completed pipeline run.

**Response 200:**
```json
{
  "run_id": "b7e4a1c9",
  "disease": "gaucher",
  "accuracy_baseline": 61.3,
  "accuracy_augmented": 84.7,
  "delta_accuracy": 23.4,
  "synthetic_count": 2500,
  "privacy_score": 94.7,
  "epsilon": 0.3,
  "delta": 1e-5,
  "membership_inference_acc": 51.2,
  "ssim_avg": 0.847,
  "fid_score": 12.3,
  "pipeline_time_s": 8.4,
  "dpdp_compliant": true
}
```
