import uuid

from langgraph.types import Command

from . import db
from .graph import GRAPH


def _cfg(run_id: str):
    return {"configurable": {"thread_id": run_id}}


def start_run(email: dict) -> dict:
    """Run the graph until it finishes or pauses for human approval."""
    run_id = uuid.uuid4().hex[:12]
    db.upsert_email(email)
    db.create_run(run_id, email["message_id"])
    try:
        GRAPH.invoke({"run_id": run_id, "email": email}, _cfg(run_id))
        paused = bool(GRAPH.get_state(_cfg(run_id)).next)
        status = "awaiting_approval" if paused else "completed"
        db.set_run_status(run_id, status)
    except Exception as e:
        status = "failed"
        db.set_run_status(run_id, status, str(e)[:500])
    return {"run_id": run_id, "status": status}


def decide(run_id: str, decision: str) -> dict:
    """Resume a paused run with approve/reject."""
    run = db.get_run(run_id)
    if not run:
        return {"error": "unknown run"}
    if run["status"] != "awaiting_approval":
        return {"run_id": run_id, "status": run["status"], "note": "not awaiting approval"}
    db.set_draft_status(run_id, "approved" if decision == "approve" else "rejected")
    try:
        GRAPH.invoke(Command(resume=decision), _cfg(run_id))
        status = "completed" if decision == "approve" else "rejected"
        db.set_run_status(run_id, status)
    except Exception as e:
        status = "failed"
        db.set_run_status(run_id, status, str(e)[:500])
    return {"run_id": run_id, "status": status}
