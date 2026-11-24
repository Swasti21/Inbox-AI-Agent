import os
import sqlite3
from contextlib import contextmanager

from . import config
from .schemas import DDL


@contextmanager
def conn():
    os.makedirs(os.path.dirname(config.DB_PATH) or ".", exist_ok=True)
    c = sqlite3.connect(config.DB_PATH)
    c.row_factory = sqlite3.Row
    try:
        yield c
        c.commit()
    finally:
        c.close()


def init_db():
    with conn() as c:
        c.executescript(DDL)


def upsert_email(email: dict, triage: dict | None = None):
    triage = triage or {}
    with conn() as c:
        c.execute(
            """INSERT INTO emails(message_id,sender,subject,body,received_at,category,priority,summary,needs_reply)
               VALUES(?,?,?,?,?,?,?,?,?)
               ON CONFLICT(message_id) DO UPDATE SET
                 category=excluded.category, priority=excluded.priority,
                 summary=excluded.summary, needs_reply=excluded.needs_reply""",
            (email["message_id"], email["sender"], email["subject"], email["body"],
             email.get("received_at"), triage.get("category"), triage.get("priority"),
             triage.get("summary"), int(triage.get("needs_reply", False)) if triage else None),
        )


def create_run(run_id: str, message_id: str):
    with conn() as c:
        c.execute("INSERT INTO runs(run_id,message_id,status) VALUES(?,?,'running')", (run_id, message_id))


def set_run_status(run_id: str, status: str, error: str | None = None):
    finished = status in ("completed", "rejected", "failed")
    with conn() as c:
        c.execute(
            "UPDATE runs SET status=?, error=?, finished_at=CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE finished_at END WHERE run_id=?",
            (status, error, int(finished), run_id),
        )


def add_draft(run_id: str, body: str):
    with conn() as c:
        c.execute("INSERT INTO drafts(run_id, body) VALUES(?,?)", (run_id, body))


def set_draft_status(run_id: str, status: str):
    with conn() as c:
        c.execute("UPDATE drafts SET status=?, decided_at=CURRENT_TIMESTAMP WHERE run_id=?", (status, run_id))


def log_tool_call(run_id: str, tool: str, attempt: int, ok: bool, error: str | None = None):
    with conn() as c:
        c.execute(
            "INSERT INTO tool_calls(run_id,tool,attempt,ok,error) VALUES(?,?,?,?,?)",
            (run_id, tool, attempt, int(ok), error),
        )


def get_run(run_id: str):
    with conn() as c:
        r = c.execute("SELECT * FROM runs WHERE run_id=?", (run_id,)).fetchone()
        return dict(r) if r else None


def list_runs(limit: int = 50):
    with conn() as c:
        return [dict(r) for r in c.execute("SELECT * FROM runs ORDER BY started_at DESC LIMIT ?", (limit,))]
