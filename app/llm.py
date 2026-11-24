"""LLM calls: triage (structured output) and reply drafting. Heuristic fallback in MOCK_MODE."""
from . import config
from .schemas import EmailIn, Triage

TRIAGE_PROMPT = """You triage a job-seeker's inbox. Classify the email, set priority
(high = needs reply within a day: interview scheduling, offers, recruiter asking for availability),
write a 2 sentence summary, and say whether a reply is needed.

From: {sender}
Subject: {subject}
Body:
{body}"""

DRAFT_PROMPT = """Write a short, polite, professional reply (max 90 words) to this email on behalf of a
job-seeker. Do not invent facts, dates or salary numbers; if availability is asked, say you will share
slots shortly. Sign off with "Best regards".

Subject: {subject}
Body:
{body}"""


def _mock_triage(e: EmailIn) -> Triage:
    t = f"{e.subject} {e.body}".lower()
    if any(k in t for k in ["offer letter", "compensation", "we are pleased to offer"]):
        cat, pri, reply = "offer", "high", True
    elif any(k in t for k in ["interview", "schedule a call", "availability", "slot"]):
        cat, pri, reply = "interview", "high", True
    elif any(k in t for k in ["opportunity", "role", "hiring", "position", "recruiter", "your profile"]):
        cat, pri, reply = "recruiter", "medium", True
    elif any(k in t for k in ["unsubscribe", "newsletter", "digest", "weekly"]):
        cat, pri, reply = "newsletter", "low", False
    else:
        cat, pri, reply = "other", "low", False
    summary = f"{cat.capitalize()} email from {e.sender}. Subject: {e.subject[:80]}."
    return Triage(category=cat, priority=pri, summary=summary, needs_reply=reply)


def triage_email(e: EmailIn) -> Triage:
    if config.MOCK_MODE:
        return _mock_triage(e)
    from langchain_anthropic import ChatAnthropic

    llm = ChatAnthropic(model=config.LLM_MODEL, api_key=config.ANTHROPIC_API_KEY, temperature=0)
    return llm.with_structured_output(Triage).invoke(
        TRIAGE_PROMPT.format(sender=e.sender, subject=e.subject, body=e.body[:4000])
    )


def draft_reply(e: EmailIn, tri: Triage) -> str:
    if config.MOCK_MODE:
        return (
            f"Hi,\n\nThank you for reaching out regarding \"{e.subject}\". I'm interested and will share "
            f"my availability shortly.\n\nBest regards"
        )
    from langchain_anthropic import ChatAnthropic

    llm = ChatAnthropic(model=config.LLM_MODEL, api_key=config.ANTHROPIC_API_KEY, temperature=0.3)
    return llm.invoke(DRAFT_PROMPT.format(subject=e.subject, body=e.body[:4000])).content
