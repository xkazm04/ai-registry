---
subject: proactive-nudges
domain: software-engineering
last_touched: 2026-09-09
dry_streak: 0
---

# proactive-nudges

## Architecture review - 2026-09-09

Retain the subject and all six techniques. This review narrows policy claims and
adds missing dispatch uncertainty, recipient scope and consent boundaries. Historical
application dates remain unchanged; source-contract checks are not runtime evidence.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/proactive-nudges",
  "date": "2026-09-09",
  "baseline": "93f1f9d5",
  "digest": "sha256:5b5728b74346f548",
  "disposition": "clarify",
  "coverage": "All nine owned documents read. Primary clock and local-time mapping contracts checked. Historical private application code and property tests were not rerun; no notification or connected-project action executed.",
  "counterexamples": [
    "A send can succeed before its acknowledgement times out.",
    "A host in another timezone does not share the recipients local midnight.",
    "A queue cannot preserve an event skipped by every evaluator unless captured elsewhere.",
    "An expired unobserved card does not establish user rejection.",
    "A requested recurring reminder can legitimately repeat the same subject.",
    "An exhausted shared global cap can prevent an exempt reminder kind from delivering."
  ],
  "sources": [
    {
      "url": "https://docs.rs/chrono/0.4.45/chrono/offset/struct.Local.html",
      "result": "Local clock contract does not establish recipient timezone resolution."
    },
    {
      "url": "https://docs.rs/chrono/0.4.45/chrono/offset/enum.LocalResult.html",
      "result": "Local-time mapping distinguishes single, ambiguous and nonexistent results; membership differs from next-wakeup scheduling."
    }
  ],
  "documents": {
    "proactive-nudges.md": {
      "disposition": "clarify",
      "reason": "Bound initiative by recipient consent, separate reminders from speculation, and remove unconditional retention, usefulness and non-response claims."
    },
    "techniques/attention-budgets.md": {
      "disposition": "clarify",
      "reason": "Add atomic notice reservations and unknown outcomes; distinguish promised reminder capacity, accounting scope and declared clock policies."
    },
    "techniques/notice-delivery-decoupling.md": {
      "disposition": "clarify",
      "reason": "Mark-first can lose delivery; expiry is not revalidation; allow partitioned enforcement and cancel pending contact after opt-out."
    },
    "techniques/quiet-windows.md": {
      "disposition": "clarify",
      "reason": "Separate host and recipient zones, membership and wakeup mapping; qualify test coverage and make bypass/default policies explicit."
    },
    "techniques/nudge-identity-dedup.md": {
      "disposition": "clarify",
      "reason": "Scope identity by tenant, recipient and semantic occurrence; allow stable scheduled recurrence and bounded retention."
    },
    "techniques/efficacy-feedback.md": {
      "disposition": "clarify",
      "reason": "Separate unobserved outcomes from rejection and clicks from completion; permit explicit zero allowance and preserve immediate opt-out."
    },
    "techniques/trigger-evaluators.md": {
      "disposition": "clarify",
      "reason": "Bound authorized snapshot collection, distinguish transient events from periodic conditions, and qualify timeout and purity guarantees."
    },
    "applications/rust--quiet-windows.md": {
      "disposition": "reverify",
      "reason": "Correct host-clock attribution and skipped-evaluation preservation claim; private runtime tests not rerun."
    },
    "applications/rust--attention-budgets.md": {
      "disposition": "reverify",
      "reason": "Qualify atomic claim and delivery guarantees, unknown-outcome refunds and inferred rejection; private runtime not rerun."
    }
  }
}
```
