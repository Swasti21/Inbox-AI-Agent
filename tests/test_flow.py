import os
import tempfile

os.environ["DB_PATH"] = os.path.join(tempfile.mkdtemp(), "t.db")
os.environ["MOCK_MODE"] = "true"
os.environ["MOCK_FAIL_RATE"] = "0"

from app import db, service  # noqa: E402

db.init_db()

EMAIL = {"message_id": "t1", "sender": "r@x.com", "subject": "Interview scheduling",
         "body": "Please share your availability for an interview."}


def test_pauses_for_approval_then_sends():
    res = service.start_run(dict(EMAIL, message_id="a"))
    assert res["status"] == "awaiting_approval"
    res = service.decide(res["run_id"], "approve")
    assert res["status"] == "completed"
    with db.conn() as c:
        sent = c.execute("SELECT COUNT(*) FROM tool_calls WHERE tool='gmail_send_reply' AND ok=1").fetchone()[0]
    assert sent == 1


def test_reject_does_not_send():
    res = service.start_run(dict(EMAIL, message_id="b"))
    res = service.decide(res["run_id"], "reject")
    assert res["status"] == "rejected"
    with db.conn() as c:
        sent = c.execute(
            "SELECT COUNT(*) FROM tool_calls t JOIN runs r ON r.run_id=t.run_id "
            "WHERE r.message_id='b' AND t.tool='gmail_send_reply'").fetchone()[0]
    assert sent == 0


def test_newsletter_needs_no_approval():
    res = service.start_run({"message_id": "c", "sender": "n@x.com", "subject": "Weekly digest",
                             "body": "newsletter, unsubscribe"})
    assert res["status"] == "completed"
