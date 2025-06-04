from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import umap
import numba
from concurrent.futures import ThreadPoolExecutor
from fastapi.middleware.cors import CORSMiddleware
import os

numba.config.THREADING_LAYER = "workqueue"
numba.set_num_threads(1)

app = FastAPI()
executor = ThreadPoolExecutor(max_workers=1)  

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UMAPRequest(BaseModel):
    filename: str
    n_neighbors: int = 15
    min_dist: float = 0.1
    metric: str = "euclidean"
    selectedFeature: Optional[str] = None

def run_umap(umap_df, n_neighbors, min_dist, metric):
    reducer = umap.UMAP(
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric=metric,
        n_jobs=1,
        random_state=42,
        low_memory=True
    )
    return reducer.fit_transform(umap_df).tolist()

def format_item(row):
    return f"{row.indicator}: {row.reasonWhy} → {row.actionWhat}"

@app.get("/")
def root():
    return {"message": "Up and running!"}

@app.post("/umap")
def compute_umap(req: UMAPRequest):
    filepath = os.path.join(os.path.dirname(__file__), "data", req.filename)
    df_indicators = pd.read_excel(filepath, sheet_name='Indicators')
    df_priorities = pd.read_excel(filepath, sheet_name='Priorities')
    excluded_cols = ['organization', 'project', 'familyCode', 'createdAt', 'surveyNumber', 'reds', 'yellows', 'greens']


    df_tooltip = (
        df_priorities
            .sort_values(['familyCode', 'level'])
            .groupby('familyCode')
            .apply(lambda grp: 
            ' >> '.join(grp.apply(format_item, axis=1))
        ).reset_index(name='tooltip')
    )
    famly_code = df_indicators['familyCode']
    umap_df = df_indicators.drop(columns=excluded_cols)
    df = executor.submit(run_umap, umap_df, req.n_neighbors, req.min_dist, req.metric)
    embedding = df.result()
    
    return {
        "embedding": embedding, 
        "featureMatrix": umap_df.astype(int).values.tolist(),
        "featureNames": umap_df.columns.tolist(),
        "familyCode": famly_code.tolist(),
        "tooltipData": df_tooltip
    }

@app.post("/recalculate-umap")
def recalculate_umap(req: UMAPRequest):
    filepath = os.path.join(os.path.dirname(__file__), "data", req.filename)
    df_indicators = pd.read_excel(filepath, sheet_name='Indicators')

    excluded_cols = ['organization', 'project', 'familyCode', 'createdAt', 'surveyNumber', 'reds', 'yellows', 'greens']
    umap_df = df_indicators.drop(columns=excluded_cols)

    # Remove deselected feature
    if req.selectedFeature and req.selectedFeature in umap_df.columns:
        umap_df = umap_df.drop(columns=[req.selectedFeature])

    df = executor.submit(run_umap, umap_df, req.n_neighbors, req.min_dist, req.metric)
    embedding = df.result()

    return {"embedding": embedding}
