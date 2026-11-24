from typing import Literal, Optional
from pydantic import BaseModel, Field

Category = Literal["recruiter", "interview", "offer", "newsletter", "other"]
Priority = Literal["high", "medium", "low"]


class EmailIn(BaseModel):
    message_id: str
    sender: str
    subject: str
    body: str
    received_at: Optional[str] = None


class Triage(BaseModel):
    category: Category = Field(description="Type of email")
    priority: Priority
    summary: str = Field(description="2 sentence summary")
    needs_reply: bool


# ---- SQLite schema (also documented in README) ----
DDL = """
CREATE TABLE IF NOT EXISTS emails (
    message_id   TEXT PRIMARY KEY,
    sender       TEXT NOT NULL,
    subject      TEXT NOT NULL,
    body         TEXT NOT NULL,
    received_at  TEXT,
    category     TEXT,
    priority     TEXT,
    summary      TEXT,
    needs_reply  INTEGER,
    created_at   TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS runs (
    run_id       TEXT PRIMARY KEY,
    message_id   TEXT NOT NULL REFERENCES emails(message_id),
    status       TEXT NOT NULL,   -- running | awaiting_approval | completed | rejected | failed
    error        TEXT,
    started_at   TEXT DEFAULT CURRENT_TIMESTAMP,
    finished_at  TEXT
);

CREATE TABLE IF NOT EXISTS drafts (
    draft_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id       TEXT NOT NULL REFERENCES runs(run_id),
    body         TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | sent
    decided_at   TEXT
);

CREATE TABLE IF NOT EXISTS tool_calls (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id       TEXT NOT NULL REFERENCES runs(run_id),
    tool         TEXT NOT NULL,   -- slack_post | notion_create | gmail_send_reply
    attempt      INTEGER NOT NULL,
    ok           INTEGER NOT NULL,
    error        TEXT,
    ts           TEXT DEFAULT CURRENT_TIMESTAMP
);
"""
