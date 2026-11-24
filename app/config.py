import os
from dotenv import load_dotenv

load_dotenv()

# MOCK_MODE=true -> no API keys needed; LLM is heuristic, Slack/Notion/Gmail are simulated.
MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"
# In mock mode, each tool call fails with this probability (used to test the retry logic).
MOCK_FAIL_RATE = float(os.getenv("MOCK_FAIL_RATE", "0.0"))

DB_PATH = os.getenv("DB_PATH", "data/agent.db")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")  # used to build approve/reject links

LLM_MODEL = os.getenv("LLM_MODEL", "claude-sonnet-4-5")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "")
# n8n webhook that sends the approved reply through the Gmail node (see n8n/send_reply.json)
N8N_SEND_REPLY_WEBHOOK = os.getenv("N8N_SEND_REPLY_WEBHOOK", "")

MAX_TOOL_ATTEMPTS = int(os.getenv("MAX_TOOL_ATTEMPTS", "3"))
