"""LangGraph workflow.

START -> triage -> draft -> log_notion -> notify_slack -> (needs draft?) -> approval[INTERRUPT] -> send_reply -> END
                                                       (no reply needed) -> END
"""
from typing import Optional, TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from . import config, db
from .llm import draft_reply, triage_email
from .schemas import EmailIn, Triage
from .tools import call_tool


class State(TypedDict, total=False):
    run_id: str
    email: dict
    triage: dict
    draft: str
    decision: str  # approve | reject


def n_triage(s: State):
    e = EmailIn(**s["email"])
    tri = triage_email(e)
    db.upsert_email(s["email"], tri.model_dump())
    return {"triage": tri.model_dump()}


def n_draft(s: State):
    tri = Triage(**s["triage"])
    if not tri.needs_reply:
        return {"draft": ""}
    body = draft_reply(EmailIn(**s["email"]), tri)
    db.add_draft(s["run_id"], body)
    return {"draft": body}


def n_log_notion(s: State):
    t, e = s["triage"], s["email"]
    call_tool(s["run_id"], "notion_create", title=e["subject"], category=t["category"],
              priority=t["priority"], summary=t["summary"], sender=e["sender"])
    return {}


def n_notify_slack(s: State):
    t, e, rid = s["triage"], s["email"], s["run_id"]
    text = f"*[{t['priority'].upper()}] {t['category']}* from {e['sender']}\n{t['summary']}"
    if s.get("draft"):
        text += (f"\n\n*Draft reply:*\n{s['draft']}\n\n"
                 f"<{config.BASE_URL}/approve/{rid}?decision=approve|Approve> | "
                 f"<{config.BASE_URL}/approve/{rid}?decision=reject|Reject>")
    call_tool(rid, "slack_post", text=text)
    return {}


def n_approval(s: State):
    # Human-in-the-loop guardrail: graph pauses here until /approve/{run_id} resumes it.
    decision = interrupt({"run_id": s["run_id"], "draft": s["draft"]})
    return {"decision": decision}


def n_send_reply(s: State):
    if s.get("decision") == "approve":
        call_tool(s["run_id"], "gmail_send_reply", message_id=s["email"]["message_id"], body=s["draft"])
        db.set_draft_status(s["run_id"], "sent")
    else:
        db.set_draft_status(s["run_id"], "rejected")
    return {}


def after_slack(s: State):
    return "approval" if s.get("draft") else END


def build_graph():
    g = StateGraph(State)
    g.add_node("triage", n_triage)
    g.add_node("draft", n_draft)
    g.add_node("log_notion", n_log_notion)
    g.add_node("notify_slack", n_notify_slack)
    g.add_node("approval", n_approval)
    g.add_node("send_reply", n_send_reply)
    g.add_edge(START, "triage")
    g.add_edge("triage", "draft")
    g.add_edge("draft", "log_notion")
    g.add_edge("log_notion", "notify_slack")
    g.add_conditional_edges("notify_slack", after_slack, {"approval": "approval", END: END})
    g.add_edge("approval", "send_reply")
    g.add_edge("send_reply", END)
    return g.compile(checkpointer=MemorySaver())


GRAPH = build_graph()
