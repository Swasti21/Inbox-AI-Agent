from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse

from . import db, service
from .schemas import EmailIn

db.init_db()
app = FastAPI(title="Recruiter Inbox Agent")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/triage")
def triage(email: EmailIn):
    """Called by n8n for every new email."""
    return service.start_run(email.model_dump())


@app.get("/approve/{run_id}", response_class=HTMLResponse)
def approve(run_id: str, decision: str = "approve"):
    """Clicked from the Slack message. GET so a plain link works."""
    if decision not in ("approve", "reject"):
        raise HTTPException(400, "decision must be approve or reject")
    res = service.decide(run_id, decision)
    return f"<h3>Run {run_id}: {res.get('status')}</h3>"


@app.get("/runs")
def runs():
    return db.list_runs()


@app.get("/runs/{run_id}")
def run(run_id: str):
    r = db.get_run(run_id)
    if not r:
        raise HTTPException(404, "not found")
    return r
