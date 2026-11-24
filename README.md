# Recruiter Inbox AI Agent (n8n + MCP + LangGraph)

Triages recruiter emails, summarizes them to Slack, logs them in Notion, drafts replies, and only sends a reply
after a human approves it. Failed tool calls are retried automatically.

## Architecture / flow

```
Gmail ──► n8n (Gmail Trigger) ──POST /triage──► FastAPI + LangGraph
                                                   │
        triage (LLM, structured output) ─► draft reply (LLM) ─► log_notion (tool) ─► notify_slack (tool)
                                                                                         │ summary + draft + Approve/Reject links
                                                              ┌──────────────────────────┘
                                               approval  [LangGraph interrupt = human-in-the-loop]
                                                   │  click link ─► GET /approve/{run_id}?decision=approve|reject
                                          approve ─► gmail_send_reply ─► n8n webhook ─► Gmail "Reply" node
                                          reject  ─► draft marked rejected, nothing sent
```

* **n8n** = triggers + Gmail I/O (OAuth already handled by n8n). Workflows in `n8n/`.
* **LangGraph** (`app/graph.py`) = the agent state machine with the approval interrupt.
* **Tools** (`app/tools.py`) = Slack / Notion / Gmail-reply, each wrapped in retries (tenacity, 3 attempts,
  exponential backoff) and every attempt logged to `tool_calls`.
* **MCP** (`app/mcp_server.py`) = the same tools exposed as an MCP server (stdio). The graph currently calls them
  in-process; to route the graph through MCP, use `langchain-mcp-adapters` (later improvement).

## DB schema (SQLite, `app/schemas.py`)

| table | key columns |
|---|---|
| emails | message_id PK, sender, subject, body, category, priority, summary, needs_reply |
| runs | run_id PK, message_id FK, status (running/awaiting_approval/completed/rejected/failed), error |
| drafts | draft_id PK, run_id FK, body, status (pending/approved/rejected/sent) |
| tool_calls | id PK, run_id FK, tool, attempt, ok, error  ← used to measure retry recovery |

## Run it

```bash
pip install -r requirements.txt
cp .env.example .env            # MOCK_MODE=true works with zero keys
pytest -q                       # 3 tests
uvicorn app.main:app --reload   # http://localhost:8000/docs

# try it
curl -X POST localhost:8000/triage -H 'content-type: application/json' \
  -d '{"message_id":"1","sender":"hr@acme.com","subject":"Interview slot","body":"Share your availability"}'
curl "localhost:8000/approve/<run_id>?decision=approve"

# evaluation (50 runs; inject failures to exercise retries)
MOCK_FAIL_RATE=0.2 python -m eval.run_eval --n 50
```

## Going live (after the MVP works)

1. `MOCK_MODE=false`, add `ANTHROPIC_API_KEY`, `SLACK_WEBHOOK_URL`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`.
2. Notion DB needs properties: Name (title), Category (select), Priority (select), Summary (text), Sender (text).
3. `docker compose up`; open n8n at :5678, import both JSON files from `n8n/`, attach Gmail OAuth, activate.
   Set `N8N_SEND_REPLY_WEBHOOK` to the send-reply workflow's production URL. Set `BASE_URL` to a public URL
   (ngrok) so Slack links work.

## About the resume numbers (4 hrs/week, 84% success on 50 runs, 75% retry recovery)

Do NOT put these on your resume until you have measured them. `eval/run_eval.py` prints the real success rate and
retry recovery rate. Run it against your real setup (real LLM, real failure modes) and use what it prints. The
"4 hours saved weekly" figure needs your own estimate (emails/week x minutes each), so state that basis honestly.

## One-day plan

| time | task |
|---|---|
| 1h | run MVP in mock mode, read the code, make tests pass |
| 1.5h | Slack webhook + Notion DB + Anthropic key, flip MOCK_MODE=false |
| 1.5h | n8n: import workflows, Gmail OAuth, test end to end |
| 1h | build a real 50-email test set, run eval, record the honest numbers |
| 1h | README screenshots/demo GIF, push to GitHub |

## Later improvements
Persistent checkpointer (SQLite/Postgres) so approvals survive restarts, Slack interactive buttons instead of
links, route the graph through MCP client, dedupe by message_id, thread-aware replies, LLM-as-judge eval.
