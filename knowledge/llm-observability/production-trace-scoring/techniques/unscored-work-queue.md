---
layer: technique
type: technique
subject: production-trace-scoring
technique: unscored-work-queue
status: forged
laws: [server-owns-the-accounting-clock, quality-apparatus-stays-unbudgeted]
shared_with: []
use_when: [preventing double-paid judge calls in a polling scorer, designing the "what still needs judging" query, replacing client-side already-scored reconstruction]
---

# Unscored work queue

The scoring loop's central query is "what still needs judging?", and the
technique is one sentence: **the system of record answers that question;
the client never reconstructs it.** The scorer asks the store for events or
traces *not yet scored* (for this rubric), and the store — the only party
that holds all verdicts — computes the complement. Everything else in this
technique is the anatomy of what goes wrong when the client tries to
compute it instead.

## The anti-join that burns money

The reconstructing client fetches two lists — recent candidates, and recent
scores — and anti-joins them: judge whatever appears in the first but not
the second. It works in the demo, and it fails at scale by construction,
because the score fetch has a horizon (a page size, a "top 1000", a time
window) and the scored population does not. The day scored history outgrows
the horizon, every verdict past it falls off the client's view, the
anti-join re-classifies those items as unscored, and the loop re-judges
them — every cycle, forever, at full judge price.

Three properties make this the nastiest failure in the subject:

- **It is invisible.** Re-judging produces plausible verdicts; dashboards
  stay green. The only symptom is judge spend growing faster than traffic —
  a line item, not an error.
- **It is triggered by success.** The system works perfectly until it has
  been *used enough*, then degrades — the anti-join has a built-in
  detonation threshold nobody chose on purpose.
- **It wastes twice.** Before it even mis-answers, it hauls the scored
  list — full verdict rows, reasoning and all — over the wire every
  interval tick, to answer a question that needed one bit per candidate.

Even a duplicate-tolerant store does not save the money: a unique
constraint on (event, rubric) rejects the second *write*, but the judge
call was paid before the write was attempted. The dedup has to happen
before the spend, which means it has to happen in the selection.

## The server-side form

The store exposes the unscored predicate as a first-class query parameter
on the candidate listing: "events, unscored for rubric R, limit K". Inside,
it scopes the already-scored check to exactly the returned page's
candidates — an anti-join too, but one with the complete verdict set on
its side of the join, correct at any scale and never shipping verdict rows
to answer a membership question. Per
[server-owns-the-accounting-clock](../../_laws.md#server-owns-the-accounting-clock),
the accounting fact "this was already paid for" lives with the accountant:
the store that received every verdict is the only party whose answer does
not depend on a horizon.

Decision rules:

- **Scope the queue per rubric.** "Unscored" is rubric-relative — a trace
  judged for helpfulness is still unscored for faithfulness. A global
  scored bit makes the first rubric to run starve every other.
- **Selection is the gate; the write constraint is the backstop.** Keep a
  uniqueness rule at the store for crash-window races (two workers judging
  the same item between selection and write), but treat every constraint
  hit as a near-miss to investigate: the backstop saved the *record*, not
  the money.
- **The queue serves candidates, not claims.** A polling scorer that takes
  a page, judges it, and posts results needs no lease/ack machinery as long
  as passes are idempotent — a crashed worker's page simply reappears next
  cycle, unscored. Reach for claims (leases, visibility timeouts) only
  when multiple *uncoordinated* scorers race the same rubric and duplicate
  judge spend in the crash window is measured to matter.
- **Completion and sampling stay outside the queue.** The store answers
  "not yet scored"; the scorer composes that with the settle window and
  the sampling policy. Baking a specific scoring policy into the store's
  query couples every future policy to a schema change.

## Idempotency is what makes the loop deployable

Because selection excludes scored work, a pass re-run is a no-op plus
whatever is genuinely new — which is what lets the same loop run as a
daemon, a scheduled one-shot, or a manual catch-up after an outage,
without a supervisor tracking what was done. "Safe to run again" is the
property; the unscored queue is its mechanism. And because the judge is
deliberately unmetered on the product side, per
[quality-apparatus-stays-unbudgeted](../../_laws.md#quality-apparatus-stays-unbudgeted),
this selection discipline is the *only* thing standing between a bug and
an unbounded bill: an unthrottled spender must be exact about what it has
already bought.

## When not to use it

A push-triggered scorer (judge-on-ingest, fired once per arriving event by
the store itself) has no selection problem — the trigger fires once by
construction, and adding a queue adds nothing. The queue earns its place
exactly when scoring is *polled* — asynchronous, decoupled, re-runnable —
which is the shape production judging should have anyway.
