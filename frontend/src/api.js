const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  return res.json();
}

/**
 * runPipeline — connects to the SSE endpoint and streams log events.
 * @param {string} disease  - disease ID
 * @param {string} fileId   - file ID from uploadFile()
 * @param {function} onLog  - callback(event) called for each log line
 * @param {function} onDone - called when the stream ends
 */
export function runPipeline(disease, fileId, onLog, onDone) {
  const url = `${BASE}/run-pipeline?disease=${encodeURIComponent(disease)}&file_id=${encodeURIComponent(fileId)}`;
  const es = new EventSource(url);
  es.onmessage = (e) => {
    try { onLog(JSON.parse(e.data)); } catch { /* skip */ }
  };
  es.onerror = () => { es.close(); if (onDone) onDone(); };
  return () => es.close(); // returns cleanup function
}

export async function getResults(runId) {
  const res = await fetch(`${BASE}/results/${runId}`);
  return res.json();
}
