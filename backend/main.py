from typing import Optional, List
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import umap
import numba
from concurrent.futures import ThreadPoolExecutor
from fastapi.middleware.cors import CORSMiddleware
import re
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
    selectedFeatures: Optional[List[str]] = None

def to_camel_case(text: str) -> str:
    words = re.split(r'\s+', text.strip().lower())
    if not words:
        return ''
    return words[0] + ''.join(word.capitalize() for word in words[1:])

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
    return f"{row.level} | {row.indicator}: {row.reasonWhy} → {row.actionWhat} $$ {to_camel_case(row.indicator)}"

@app.get("/test")
def root():
    return {"Message": "Up and Running!"}

@app.post("/umap")
def compute_umap(req: UMAPRequest):
    filepath = os.path.join(os.path.dirname(__file__), "data", req.filename)
    df_indicators = pd.read_excel(filepath, sheet_name='Indicators')
    df_indicators['surveyNumber'] = df_indicators['surveyNumber'].str.replace('º', '', regex=False)
    df_priorities = pd.read_excel(filepath, sheet_name='Priorities')
    df_priorities['surveyNumber'] = df_priorities['surveyNumber'].str.replace('º', '', regex=False)
    
    excluded_cols = ['organization', 'project', 'familyCode', 'createdAt', 'surveyNumber', 'reds', 'yellows', 'greens']
    all_feature_cols = [col for col in df_indicators.columns if col not in excluded_cols]

    if req.selectedFeatures:
        selected_features = [f for f in req.selectedFeatures if f in all_feature_cols]
    else:
        selected_features = all_feature_cols

    df_tooltip = (
        df_priorities
            .sort_values(['familyCode', 'level'])
            .groupby(['familyCode', 'surveyNumber'])
            .apply(lambda grp: 
                ' >> '.join(grp.apply(format_item, axis=1))
            ).reset_index(name='tooltip')
    )

    umap_df = df_indicators[selected_features]
    df = executor.submit(run_umap, umap_df, req.n_neighbors, req.min_dist, req.metric)
    embedding = df.result()

    # Merge indicators and tooltips
    merged_df = df_indicators[['familyCode', 'surveyNumber']].copy()
    merged_df['features'] = umap_df.to_dict(orient='records')
    merged_df['embedding'] = embedding
    df_tooltip = pd.DataFrame({
      'familyCode': df_tooltip.familyCode,
      'surveyNumber': df_tooltip.surveyNumber,
      'tooltip': df_tooltip.tooltip
    })
    merged_df = merged_df.merge(df_tooltip, on=['familyCode', 'surveyNumber'], how='left')
    merged_df['tooltip'] = merged_df['tooltip'].fillna('')

    data = []
    for _, row in merged_df.iterrows():
        data.append({
            'familyCode': row['familyCode'],
            'surveyNumber': row['surveyNumber'],
            'features': row['features'],
            'embedding': row['embedding'],
            'tooltip': row['tooltip'] or ''
        })

    return {
        "featureNames": list(umap_df.columns),
        "data": data
    }