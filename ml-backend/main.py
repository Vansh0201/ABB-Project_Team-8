from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from datetime import datetime, timedelta

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# in-memory dataset
dataset_df = None

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Accept .csv/.xlsx, ensure 'Response' column exists,
    add 1-second synthetic Timestamp if needed, store in memory,
    and return metadata for the UI.
    """
    global dataset_df

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    raw = await file.read()

    
    try:
        if file.filename.lower().endswith(".csv"):
            df = pd.read_csv(io.BytesIO(raw))
        else:
            df = pd.read_excel(io.BytesIO(raw))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {e}")

    if "Response" not in df.columns:
        raise HTTPException(status_code=400, detail="Dataset must contain a 'Response' column.")

    # detect an existing time column, else create one
    ts_col = next((c for c in df.columns if "time" in c.lower() or "date" in c.lower()), None)
    if ts_col:
        df[ts_col] = pd.to_datetime(df[ts_col])
        df = df.sort_values(ts_col).rename(columns={ts_col: "Timestamp"})
    else:
        start = datetime(2021, 1, 1, 0, 0, 0)
        df.insert(0, "Timestamp", [start + timedelta(seconds=i) for i in range(len(df))])

    df["Timestamp"] = pd.to_datetime(df["Timestamp"])
    df = df.sort_values("Timestamp").reset_index(drop=True)

    dataset_df = df  

    total = len(df)
    cols = len(df.columns)
    pass_rate = (df["Response"].sum() / total * 100) if total else 0.0
    start_ts = df["Timestamp"].iloc[0] if total else None
    end_ts = df["Timestamp"].iloc[-1] if total else None

    return {
        "fileName": file.filename,
        "totalRecords": total,
        "totalColumns": cols,
        "passRate": round(pass_rate, 2),
        "startTimestamp": str(start_ts) if start_ts is not None else None,
        "endTimestamp": str(end_ts) if end_ts is not None else None,
    }
    
from pydantic import BaseModel

train_df = None
test_df = None
sim_df = None

class DateRanges(BaseModel):
    trainStart: datetime
    trainEnd: datetime
    testStart: datetime
    testEnd: datetime
    simStart: datetime
    simEnd: datetime

@app.post("/api/validate-date-ranges")
def validate_date_ranges(r: DateRanges):
    """
    Check that train -> test -> sim are sequential, inside data bounds,
    and return how many rows fall in each window.
    """
    global dataset_df, train_df, test_df, sim_df
    if dataset_df is None:
        raise HTTPException(status_code=400, detail="Upload a dataset first.")


    if not (r.trainStart <= r.trainEnd and r.testStart <= r.testEnd and r.simStart <= r.simEnd):
        return {"status": "invalid", "message": "Each period's start must be <= end."}

    
    if not (r.trainEnd < r.testStart and r.testEnd < r.simStart):
        return {"status": "invalid", "message": "Ranges must be sequential (train ends before test starts, etc.)."}


    data_start = dataset_df["Timestamp"].min()
    data_end = dataset_df["Timestamp"].max()
    if r.trainStart < data_start or r.simEnd > data_end:
        return {"status": "invalid", "message": "Selected dates are outside the dataset range."}

    # 4) make the splits we’ll reuse later
    train_df = dataset_df[(dataset_df["Timestamp"] >= r.trainStart) & (dataset_df["Timestamp"] <= r.trainEnd)].copy()
    test_df  = dataset_df[(dataset_df["Timestamp"] >= r.testStart)  & (dataset_df["Timestamp"] <= r.testEnd)].copy()
    sim_df   = dataset_df[(dataset_df["Timestamp"] >= r.simStart)   & (dataset_df["Timestamp"] <= r.simEnd)].copy()

    return {
        "status": "valid",
        "counts": {
            "training": int(len(train_df)),
            "testing": int(len(test_df)),
            "simulation": int(len(sim_df)),
        }
    }
    
    
    
# Model Training
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np
import pandas as pd 
@app.post("/api/train-model")
def train_model(r: DateRanges):
    """
    Train XGBoost on the training window and evaluate on the testing window.
    Returns accuracy, precision, recall, f1 (percent).
    """
    global train_df, test_df, model
    if train_df is None or test_df is None:
        raise HTTPException(status_code=400, detail="Validate date ranges first.")

    # selecting features (everything except Timestamp/Response)
    feature_cols = [c for c in train_df.columns if c not in ("Timestamp", "Response")]
    X_train_raw = train_df[feature_cols].copy()
    X_test_raw  = test_df[feature_cols].copy()
    y_train = train_df["Response"].astype(int)
    y_test  = test_df["Response"].astype(int)

    
    X_all = pd.get_dummies(pd.concat([X_train_raw, X_test_raw], ignore_index=True))
    X_train = X_all.iloc[:len(X_train_raw), :]
    X_test  = X_all.iloc[len(X_train_raw):, :]
    X_test  = X_test.reindex(columns=X_train.columns, fill_value=0)

    # training the model
    model = XGBClassifier(
        use_label_encoder=False,
        eval_metric="logloss",
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.9,
        colsample_bytree=0.9,
        tree_method="hist"
    )
    model.fit(X_train, y_train)

    #evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    return {
        "status": "model_trained",
        "metrics": {
            "accuracy": round(acc * 100, 2),
            "precision": round(prec * 100, 2),
            "recall": round(rec * 100, 2),
            "f1Score": round(f1 * 100, 2)
        }
    }
    
    
from fastapi.responses import StreamingResponse
import asyncio
import json

@app.get("/api/simulate")
async def simulate_stream():
    """
    Stream row-by-row predictions from the test set with ~1 second delay.
    Client (React) can connect and listen for live updates.
    """
    global test_df, model
    if test_df is None or model is None:
        raise HTTPException(status_code=400, detail="Train model first.")

    # features
    feature_cols = [c for c in test_df.columns if c not in ("Timestamp", "Response")]
    X_raw = test_df[feature_cols].copy()
    y_true = test_df["Response"].tolist()

    # performing one-hot encoding
    X_all = pd.get_dummies(X_raw)
    X_all = X_all.reindex(columns=model.get_booster().feature_names, fill_value=0)

    async def event_generator():
        for i, row in X_all.iterrows():
            features = row.values.reshape(1, -1)
            pred = int(model.predict(features)[0])
            actual = int(y_true[i])
            ts = str(test_df.iloc[i]["Timestamp"])
            out = {
                "timestamp": ts,
                "predicted": pred,
                "actual": actual
            }
            yield f"data: {json.dumps(out)}\n\n"
            await asyncio.sleep(1)  # 1 second delay

    return StreamingResponse(event_generator(), media_type="text/event-stream")



