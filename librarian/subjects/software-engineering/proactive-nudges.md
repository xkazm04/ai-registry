---
subject: proactive-nudges
domain: software-engineering
last_touched: 2026-10-31
touched_by: intake
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

## 2026-10-31 - intake apply: nudge-identity-dedup (run intake-apply-nudge-dedup-1031)

First application of `nudge-identity-dedup`, on personas (`rust`), mode `experiment`, verdict
`better`, proof `ab-paired`. Seam chosen to falsify "no timestamps in the key": two digest kinds
key on an hour bucket on purpose. The live record held 4 digest cards from one afternoon, two
boundary pairs 5-6 minutes apart, all live at once, all expired unread. The rule held. The
technique's own supersede step, however, failed the floor when replayed: replacing a delta
payload kept 1 of 4 pass summaries, while merging kept 4 of 4 at 1 card. Amended the technique
with "When the payload is a delta, supersede must merge" and the presentation-tier half
(a same-id drop hides a superseded version). Application: `applications/rust--nudge-identity-dedup.md`.
No product code shipped: the change spans both tiers. It is recorded as the project's next change.
The scan's "single stack (rust)" point is not moved: the project's identity seam is Rust, and
its React tier is the downstream half of the same application rather than a second stack.

## Architecture review - 2026-10-31

Re-review against the bytes after the 2026-10-14 to 2026-10-31 applications. Three
applications are new (`rust--efficacy-feedback`, `rust--notice-delivery-decoupling`,
`rust--nudge-identity-dedup`), and two techniques were amended (efficacy-feedback gained
derivable-ignored and the bounded upward path; nudge-identity-dedup gained the
delta-payload merge and the presentation-tier version rule). Neither amendment carries
the 2026-09-09 clarifications. Every technique-level change that record named is still
owed and is carried forward below. Nothing in the 2026-09-09 record is retracted.

Two new contradictions inside the subject. First, the golden path's superseding bullet
still says a newer notice replaces the queued one. The technique now says a delta
payload must merge, never replace. Second, efficacy-feedback still defines `ignored` as
"aged out with no interaction", while its new paragraph says ignored should mean
seen-and-untouched, gated by an exposure stamp. The application measured the gap that
definition leaves open.

The cited personas source was read (not run) at `f8e62cb9` for the application anchors.
Budget, quiet-window, digest-bucket and dedup claims hold. `rust--attention-budgets` has
drifted: its line anchors no longer match, and it still describes modulation as
engaged/dismissed only, but `adjustment` now takes `ignored`. Live database row counts
in `rust--nudge-identity-dedup` were not re-queried.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/proactive-nudges",
  "date": "2026-10-31",
  "baseline": "c052abb9",
  "digest": "sha256-b2:5ac900ae46e58393",
  "disposition": "clarify",
  "coverage": "All 12 owned documents read in full: golden path, 6 techniques, 5 applications. Application code anchors re-read in the personas source at f8e62cb9 (budget.rs, quiet.rs, mod.rs, message_triage.rs, execution_review.rs, athenaStore.ts, rust-toolchain.toml); nothing compiled, tested or executed, and the private live database was not re-queried. No notification sent and no connected-project action taken.",
  "counterexamples": [
    "A digest notice whose payload is a delta loses every unread pass if superseding replaces it, so the golden path's unconditional replace rule fails the floor the technique now measures.",
    "A card delivered while the app is closed is classified ignored by an aged-out rule and costs its kind a cap step, although no human saw it.",
    "A send can succeed before its acknowledgement times out, so releasing the claim on a failed-looking delivery can refund a slot that was spent.",
    "A host in another timezone does not share the recipient's local midnight or 22:00.",
    "An exhausted global cap can block a consented reminder whose kind is exempt from its own cap.",
    "Two tenants or recipients with the same (kind, subject-ref) collide under an identity that omits the recipient scope."
  ],
  "sources": [
    {
      "source": "personas source at f8e62cb9: src-tauri/src/companion/proactive/budget.rs",
      "result": "GLOBAL_DAILY_CAP = 12 at :23, kind_cap athena_scheduled = u32::MAX at :34-35, adjustment(engaged, dismissed, ignored) at :71, the ignored predicate `status = 'expired' AND delivered_at IS NOT NULL` at :92-94, clamp(1, base+2) at :135, try_consume at :228, today() keyed on Utc::now() at :268-269. Supports rust--efficacy-feedback; shows rust--attention-budgets anchors and its engaged/dismissed-only description are stale."
    },
    {
      "source": "personas source at f8e62cb9: src-tauri/src/companion/proactive/mod.rs, quiet.rs, message_triage.rs, execution_review.rs, src/features/companions/athena/athenaStore.ts, rust-toolchain.toml",
      "result": "sweep_lifecycle before dedupe at mod.rs:282, dedupe over status IN ('queued','delivered') at :291, expiry windows -7 days / -1 day / -7 days at :195/:210/:218, ORDER BY COALESCE at :412, claim_delivered WHERE status = 'queued' at :585 (cited :579 at the 2026-10-22 witness), Local::now() at quiet.rs:65, hour-bucket trigger_ref at message_triage.rs:426-429 and execution_review.rs:892-895, 'Dedupe by id' at athenaStore.ts:1078, toolchain channel 1.96.1. Supports the notice-delivery, quiet-window and identity applications."
    },
    {
      "url": "https://docs.rs/chrono/0.4.45/chrono/offset/struct.Local.html",
      "result": "Carried from 2026-09-09, not re-fetched: Local uses the executing host's zone and does not resolve a recipient's zone. Still supports the quiet-windows and attention-budgets clarifications."
    }
  ],
  "documents": {
    "proactive-nudges.md": {
      "disposition": "clarify",
      "reason": "Change the superseding bullet to: same-story updates replace, and delta payloads merge, per nudge-identity-dedup. Carry forward from 2026-09-09: bound initiative by recipient consent, separate requested reminders from speculative nudges, and drop the unconditional retention and 'honored absolutely' claims."
    },
    "techniques/attention-budgets.md": {
      "disposition": "clarify",
      "reason": "Still owed from 2026-09-09. Replace 'a granted claim whose delivery fails is released' with three outcomes: confirmed-not-sent releases, unknown holds and reconciles, sent spends. State that the consented lane can still be blocked by the global ceiling and how that is surfaced. Make the day-boundary zone a declared policy."
    },
    "techniques/notice-delivery-decoupling.md": {
      "disposition": "clarify",
      "reason": "Still owed. 'Mark first' can lose a delivery: prefer deliver-with-idempotency-key, or mark-pending then confirm. Expiry is not revalidation. Pending contact is cancelled on opt-out. Partitioned enforcement is allowed in place of one global queue."
    },
    "techniques/quiet-windows.md": {
      "disposition": "clarify",
      "reason": "Still owed. Separate the host clock from the recipient's zone, and membership from next-wakeup mapping (ambiguous and nonexistent local times). Make the bypass and default-window policies explicit choices, not universal rules."
    },
    "techniques/nudge-identity-dedup.md": {
      "disposition": "clarify",
      "reason": "The new delta-merge and version-aware presentation sections hold, and the paired replay supports them. Still owed: scope the identity by tenant and recipient, allow a stable occurrence key for requested recurring reminders, and bound retention of delivered identities."
    },
    "techniques/efficacy-feedback.md": {
      "disposition": "clarify",
      "reason": "Make the outcome list match the new paragraph: ignored = exposed and untouched, plus an unobserved state that never moves caps. Reword the 'Nothing raises a kind's volume' blockquote so it agrees with the bounded upward path. Still owed: clicks are not completion, an explicit zero allowance is permitted, and opt-out is immediate."
    },
    "techniques/trigger-evaluators.md": {
      "disposition": "clarify",
      "reason": "Unchanged since 2026-09-09 and still owed: bound and authorize snapshot collection, separate transient events (lost on a skipped tick) from periodic conditions, and qualify the timeout and purity guarantees."
    },
    "applications/rust--attention-budgets.md": {
      "disposition": "clarify",
      "reason": "Read against source at f8e62cb9. Re-anchor try_consume (now budget.rs:228), effective cap (:119-135) and today() (:268-). Change the efficacy row: modulation now counts ignored (expired with delivered_at) beside engaged and dismissed. Keep verified_on 2026-08-18 until a runtime check."
    },
    "applications/rust--quiet-windows.md": {
      "disposition": "reverify",
      "reason": "Local::now() at quiet.rs:65 is confirmed in source, and the 2026-09-09 host-clock caveat stands. The property tests and the release_pending hold were not rerun."
    },
    "applications/rust--efficacy-feedback.md": {
      "disposition": "keep",
      "reason": "The adjustment signature, the shared ignored predicate and the clamp are confirmed in source. The missing exposure stamp is stated as the limit, with bounded damage."
    },
    "applications/rust--notice-delivery-decoupling.md": {
      "disposition": "keep",
      "reason": "Mechanism anchors hold at f8e62cb9, except claim_delivered: that moved :579 -> :585 after the dated witness. The unrecorded-deferral finding and the 'unmeasurable' verdict are stated honestly, with a return condition."
    },
    "applications/rust--nudge-identity-dedup.md": {
      "disposition": "keep",
      "reason": "The hour-bucket refs, the dedupe query and the presentation-tier id dedupe are confirmed in source; the toolchain witness matches. The replay table supports the technique amendment. Live row counts are dated observations that this review did not re-query."
    }
  }
}
```
