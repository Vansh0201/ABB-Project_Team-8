# ABB Project – React (Vite) + FastAPI (ML)

Real-time predictive quality inspection prototype.  
**Frontend:** React (Vite) · **Backend:** Python FastAPI · **Model:** XGBoost / scikit-learn

> End-to-end flow: **Upload → Validate Ranges → Train → Live Simulation**.  
> Frontend is **React (Vite)** (not Angular). Backend is **Python FastAPI**.

---

##  Features
- Upload CSV/XLSX dataset (choose label column via `targetColumn` if not named `Response`)
- Auto-normalizes labels to 0/1 (maps Pass/Fail, Yes/No, True/False)
- Auto-creates a **1-second synthetic Timestamp** column if the dataset lacks time
- Validates **Training → Testing → Simulation** date windows (sequential, within data range)
- Trains an **XGBoost** classifier and returns **Accuracy / Precision / Recall / F1** (in %)
- Streams the Simulation window at ~**1 row per second** via **Server-Sent Events (SSE)**

---

## Repository Layout

```
.
├─ frontend/             # React (Vite) app (your UI)
│  ├─ src/
│  ├─ index.html
│  ├─ package.json
│  └─ .env.example       # VITE_API_BASE_URL=http://localhost:8000
└─ ml-backend/           # FastAPI + ML service
   ├─ main.py
   ├─ requirements.txt   # fastapi, uvicorn, pandas, scikit-learn, xgboost, python-multipart, openpyxl, etc.
   └─ README_BACKEND.txt (optional)
```

> If your folders are named slightly differently, the steps are the same—just `cd` into the right paths.

---

## Quick Start (Local)

### 0) Prerequisites
- **Node 18+** (for Vite)
- **Python 3.10+**

### 1) Start the **Backend** (FastAPI)

#### Windows (PowerShell)
```powershell
cd ml-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### macOS / Linux
```bash
cd ml-backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000/docs**.

### 2) Start the **Frontend** (Vite)

```bash
cd frontend
cp .env.example .env   # or create .env manually with the line below
# .env content:
# VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

Open the printed local URL (usually **http://localhost:5173**).

---

## Connecting Frontend → Backend

The frontend reads the API base URL from `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

In your request code (e.g., `src/api.ts`):
```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// example:
const res = await fetch(`${API_BASE}/health`);
```

> After editing `.env`, **restart** `npm run dev`.

---

## 📡 API Reference (FastAPI)

**Base URL:** `http://localhost:8000`

### `GET /health`
Health check →
```json
{ "status": "ok" }
```

### `POST /api/upload?targetColumn=Response`
- **Form-data:** `file` = CSV/XLSX
- **Query:** `targetColumn` (optional; default `Response`)
- Adds/normalizes the label to `Response` (0/1). Creates a synthetic `Timestamp` if missing.
- Returns dataset metadata:
```json
{
  "fileName": "data.csv",
  "targetColumn": "Response",
  "totalRecords": 14704,
  "totalColumns": 25,
  "passRate": 70.12,
  "startTimestamp": "2021-01-01 00:00:00",
  "endTimestamp": "2021-06-01 00:00:00"
}
```

### `POST /api/validate-date-ranges`
Body:
```json
{
  "trainStart": "2021-01-01T00:00:00",
  "trainEnd":   "2021-03-01T00:00:00",
  "testStart":  "2021-03-01T00:00:01",
  "testEnd":    "2021-04-01T00:00:00",
  "simStart":   "2021-04-01T00:00:01",
  "simEnd":     "2021-05-01T00:00:00"
}
```
Response:
```json
{ "status": "valid", "counts": { "training": 5000, "testing": 2000, "simulation": 3000 } }
```

### `POST /api/train-model`
- Body: same timestamps as above (training + testing).  
- Returns evaluation metrics (percentages):
```json
{
  "status": "model_trained",
  "metrics": { "accuracy": 92.3, "precision": 90.1, "recall": 93.5, "f1Score": 91.8 }
}
```

### `GET /api/simulate`
- Streams the Simulation window at ~**1 row/second** via **SSE**.
- Example messages:
```
data: {"timestamp":"2021-04-01 00:00:01","predicted":1,"actual":1}
```

---

## 🧪 Demo Walk-Through
1. **/api/upload** → choose CSV/XLSX (set `targetColumn` if needed).  
2. **/api/validate-date-ranges** → paste 6 ISO timestamps → Execute.  
3. **/api/train-model** → same timestamps → get metrics.  
4. **/api/simulate** → open in browser; watch streaming predictions.

---

## ⚠️ Troubleshooting
- **CORS:** Backend allows all origins. Keep API on `http://localhost:8000`.  
- **Upload error about `Response`:** Use `?targetColumn=YourLabel` or rename the label to `Response` (0/1).  
- **Packages missing:** Ensure `(.venv)` appears before installing with `pip`.  
- **Vite env vars:** Restart `npm run dev` after editing `.env`.

---

## .gitignore (recommended)
At repo root:

```gitignore
# Frontend
node_modules/
dist/
.vite/
*.log

# Backend
.venv/
__pycache__/
*.pyc
*.egg-info/

# Env & local data
.env
.env.*.local
*.csv
*.xlsx
```

Include `frontend/.env.example` with:
```
VITE_API_BASE_URL=http://localhost:8000
```
