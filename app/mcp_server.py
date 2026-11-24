"""MCP server exposing the agent's tools (Slack, Notion, Gmail-reply) to any MCP client
(Claude Desktop, n8n MCP Client node, LangGraph via langchain-mcp-adapters).

Run:  python -m app.mcp_server        (stdio transport)
"""
from mcp.server.fastmcp import FastMCP

from . import db
from .tools import call_tool

db.init_db()
mcp = FastMCP("recruiter-inbox-tools")


@mcp.tool()
def slack_post(text: str) -> dict:
    """Post a message to the recruiter-inbox Slack channel."""
    return call_tool("mcp", "slack_post", text=text)


@mcp.tool()
def notion_create(title: str, category: str, priority: str, summary: str, sender: str) -> dict:
    """Create a row in the Notion recruiter tracker database."""
    return call_tool("mcp", "notion_create", title=title, category=category,
                     priority=priority, summary=summary, sender=sender)


@mcp.tool()
def gmail_send_reply(message_id: str, body: str) -> dict:
    """Send a reply to a Gmail message (goes via the n8n send-reply workflow)."""
    return call_tool("mcp", "gmail_send_reply", message_id=message_id, body=body)


if __name__ == "__main__":
    mcp.run()
