"""Run N synthetic emails through the agent and report REAL measured numbers.

    MOCK_FAIL_RATE=0.2 python -m eval.run_eval --n 50

Metrics (report only what this prints, never hand-typed numbers):
  - run_success_rate: runs that end 'completed' or 'rejected' (human decision honoured) / all runs
  - retry_recovery_rate: tool calls that failed at least once but eventually succeeded
                         / tool calls that failed at least once
  - hitl_respected: no email was sent without an approve decision
"""
import argparse
import os
import random
import tempfile

# isolated DB for eval
os.environ["DB_PATH"] = os.path.join(tempfile.mkdtemp(), "eval.db")
os.environ.setdefault("MOCK_MODE", "true")

from app import db, service  # noqa: E402

TEMPLATES = [
    ("recruiter", "Exciting opportunity: ML Engineer at Acme", "Hi, I came across your profile. We are hiring for a role in AI. Interested?"),
    ("interview", "Interview scheduling - Data Scientist", "Please share your availability this week for an interview slot."),
    ("offer", "Offer letter and compensation", "We are pleased to offer you the position. Compensation details attached."),
    ("newsletter", "Weekly digest: jobs in AI", "Your weekly newsletter. Click to unsubscribe."),
    ("other", "Invoice for your subscription", "Your payment was received. Thank you."),
]


def make_emails(n: int, seed: int = 7):
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        cat, subj, body = rnd.choice(TEMPLATES)
        out.append({"message_id": f"m{i}", "sender": f"sender{i}@example.com", "subject": subj, "body": body})
    return out


def main(n: int):
    db.init_db()
    ok = 0
    for e in make_emails(n):
        res = service.start_run(e)
        if res["status"] == "awaiting_approval":
            # simulate a human: approve 80%, reject 20%
            decision = "approve" if random.random() < 0.8 else "reject"
            res = service.decide(res["run_id"], decision)
        if res["status"] in ("completed", "rejected"):
            ok += 1

    with db.conn() as c:
        failed_calls = c.execute(
            "SELECT run_id, tool, MAX(ok) AS recovered FROM tool_calls GROUP BY run_id, tool "
            "HAVING SUM(CASE WHEN ok=0 THEN 1 ELSE 0 END) > 0"
        ).fetchall()
        sent_without_approval = c.execute(
            "SELECT COUNT(*) FROM tool_calls t JOIN drafts d ON d.run_id=t.run_id "
            "WHERE t.tool='gmail_send_reply' AND t.ok=1 AND d.status NOT IN ('sent')"
        ).fetchone()[0]

    hit = len(failed_calls)
    rec = sum(1 for r in failed_calls if r["recovered"] == 1)
    print(f"runs: {n}")
    print(f"run_success_rate: {ok}/{n} = {ok / n:.0%}")
    if hit:
        print(f"retry_recovery_rate: {rec}/{hit} = {rec / hit:.0%}  (tool calls that failed at least once)")
    else:
        print("retry_recovery_rate: n/a (no tool failures occurred; raise MOCK_FAIL_RATE)")
    print(f"emails sent without approval: {sent_without_approval}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=50)
    main(ap.parse_args().n)
