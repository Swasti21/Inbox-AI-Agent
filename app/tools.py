"""Side-effect tools: Slack, Notion, Gmail (via n8n). Each is wrapped with retries and logged to DB.

The same functions are exposed over MCP in app/mcp_server.py.
"""
import random

import httpx
from tenacity import RetryError, Retrying, stop_after_attempt, wait_exponential

from . import config, db


class ToolError(Exception):
    pass


def _maybe_fail():
    if config.MOCK_MODE and random.random() < config.MOCK_FAIL_RATE:
        raise ToolError("simulated transient failure")


def _slack_post(text: str) -> dict:
    _maybe_fail()
    if config.MOCK_MODE:
        print(f"[mock slack] {text[:120]}")
        return {"ok": True}
    r = httpx.post(config.SLACK_WEBHOOK_URL, json={"text": text}, timeout=15)
    r.raise_for_status()
    return {"ok": True}


def _notion_create(title: str, category: str, priority: str, summary: str, sender: str) -> dict:
    _maybe_fail()
    if config.MOCK_MODE:
        print(f"[mock notion] {title}")
        return {"ok": True, "page_id": "mock-page"}
    props = {
        "Name": {"title": [{"text": {"content": title[:200]}}]},
        "Category": {"select": {"name": category}},
        "Priority": {"select": {"name": priority}},
        "Summary": {"rich_text": [{"text": {"content": summary[:1900]}}]},
        "Sender": {"rich_text": [{"text": {"content": sender[:200]}}]},
    }
    r = httpx.post(
        "https://api.notion.com/v1/pages",
        headers={"Authorization": f"Bearer {config.NOTION_TOKEN}", "Notion-Version": "2022-06-28"},
        json={"parent": {"database_id": config.NOTION_DATABASE_ID}, "properties": props},
        timeout=15,
    )
    r.raise_for_status()
    return {"ok": True, "page_id": r.json().get("id")}


def _gmail_send_reply(message_id: str, body: str) -> dict:
    _maybe_fail()
    if config.MOCK_MODE:
        print(f"[mock gmail] reply to {message_id}")
        return {"ok": True}
    r = httpx.post(config.N8N_SEND_REPLY_WEBHOOK, json={"message_id": message_id, "body": body}, timeout=30)
    r.raise_for_status()
    return {"ok": True}


_TOOLS = {
    "slack_post": _slack_post,
    "notion_create": _notion_create,
    "gmail_send_reply": _gmail_send_reply,
}


def call_tool(run_id: str, name: str, **kwargs) -> dict:
    """Call a tool with exponential-backoff retries; every attempt is logged."""
    fn = _TOOLS[name]
    attempt = 0
    try:
        for a in Retrying(
            stop=stop_after_attempt(config.MAX_TOOL_ATTEMPTS),
            wait=wait_exponential(multiplier=0.05, max=1) if config.MOCK_MODE else wait_exponential(multiplier=1, max=10),
            reraise=True,
        ):
            with a:
                attempt += 1
                try:
                    out = fn(**kwargs)
                    db.log_tool_call(run_id, name, attempt, True)
                    return out
                except Exception as e:  # log then let tenacity retry
                    db.log_tool_call(run_id, name, attempt, False, str(e)[:300])
                    raise
    except (RetryError, Exception) as e:
        raise ToolError(f"{name} failed after {attempt} attempts: {e}")
