from typing import Dict, Any, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import MarketModel

app = FastAPI(title="STOTRA Simulator API")

# React(localhost:3000/5173 등)에서 호출할 수 있게 CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발용. 나중엔 프론트 주소만 허용하는 게 좋음
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 메모리 내 시뮬레이터 저장소
SIMULATIONS: Dict[str, MarketModel] = {}


# =========================
# Request models
# =========================

class CreateSimRequest(BaseModel):
    news_text: str = ""
    use_llm: bool = True
    llm_model: str = "llama3.1:8b"
    llm_base_url: str = "http://127.0.0.1:11434"
    llm_every_n_steps: int = 10
    n_retail: int = 400
    n_institution: int = 20


class UpdateNewsRequest(BaseModel):
    news_text: str


class RunStepsRequest(BaseModel):
    steps: int = 1


# =========================
# Helpers
# =========================

def serialize_model(sim_id: str, model: MarketModel) -> Dict[str, Any]:
    return {
        "sim_id": sim_id,
        "t": model.t,
        "news_text": model.news_text,
        "price": model.price,
        "prev_price": model.prev_price,
        "last_price_change": model.last_price_change,
        "last_return": model.last_return,
        "interest_rate": model.interest_rate,
        "gov_stimulus": model.gov_stimulus,
        "rolling_vol": model.rolling_vol,
        "llm_signals": model.llm_signals,
        "use_llm": model.use_llm,
        "llm_every_n_steps": model.llm_every_n_steps,
        "inst_scale": model.inst_scale,
        "ret_scale": model.ret_scale,
    }


def get_sim_or_404(sim_id: str) -> MarketModel:
    sim = SIMULATIONS.get(sim_id)
    if sim is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim


# =========================
# Routes
# =========================

@app.get("/")
def root():
    return {
        "message": "STOTRA Simulator API running",
        "sim_count": len(SIMULATIONS),
    }


@app.post("/sim/create")
def create_sim(req: CreateSimRequest):
    sim_id = str(uuid4())

    model = MarketModel(
        n_retail=req.n_retail,
        n_institution=req.n_institution,
        use_llm=req.use_llm,
        llm_model=req.llm_model,
        llm_base_url=req.llm_base_url,
        llm_every_n_steps=req.llm_every_n_steps,
    )
    model.news_text = req.news_text

    SIMULATIONS[sim_id] = model

    return {
        "message": "Simulation created",
        "state": serialize_model(sim_id, model),
    }


@app.get("/sim/{sim_id}/state")
def get_state(sim_id: str):
    model = get_sim_or_404(sim_id)
    return serialize_model(sim_id, model)


@app.post("/sim/{sim_id}/news")
def update_news(sim_id: str, req: UpdateNewsRequest):
    model = get_sim_or_404(sim_id)
    model.news_text = req.news_text
    return {
        "message": "News updated",
        "state": serialize_model(sim_id, model),
    }


@app.post("/sim/{sim_id}/step")
def run_one_step(sim_id: str):
    model = get_sim_or_404(sim_id)
    model.step()
    return {
        "message": "Step completed",
        "state": serialize_model(sim_id, model),
    }


@app.post("/sim/{sim_id}/run")
def run_steps(sim_id: str, req: RunStepsRequest):
    model = get_sim_or_404(sim_id)

    if req.steps <= 0:
        raise HTTPException(status_code=400, detail="steps must be >= 1")
    if req.steps > 1000:
        raise HTTPException(status_code=400, detail="steps too large")

    for _ in range(req.steps):
        model.step()

    return {
        "message": f"{req.steps} steps completed",
        "state": serialize_model(sim_id, model),
    }


@app.delete("/sim/{sim_id}")
def delete_sim(sim_id: str):
    model = SIMULATIONS.pop(sim_id, None)
    if model is None:
        raise HTTPException(status_code=404, detail="Simulation not found")

    return {
        "message": "Simulation deleted",
        "sim_id": sim_id,
    }


@app.get("/sim")
def list_sims():
    return {
        "count": len(SIMULATIONS),
        "items": [serialize_model(sim_id, model) for sim_id, model in SIMULATIONS.items()],
    }