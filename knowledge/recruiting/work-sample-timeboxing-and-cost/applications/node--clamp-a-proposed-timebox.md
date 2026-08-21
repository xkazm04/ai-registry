---
layer: application
type: application
subject: work-sample-timeboxing-and-cost
technique: clamp-a-proposed-timebox
stack: node
---

# Clamping the generator's own estimate — and the seam that does not

## The clamp, in the coercion step

`pipeline/jobfit/devcase/design.py:439-447` is the clamp, applied where the
generated case is coerced into the internal model:

```python
try:
    tb = float(payload.get("timeboxHours"))
    if not math.isfinite(tb):  # NaN would survive the min/max clamp → "~nanh"
        raise ValueError("non-finite timeboxHours")
except (TypeError, ValueError):
    tb = timebox
# Clamp the model's own estimate to the cap (UAT M8): left alone the LLM
# routinely echoes a longer take-home back, and this number is shown to the
# candidate. Floor at 0.5h so a degenerate 0 can't render "~0h".
tb = min(max(tb, 0.5), _MAX_TIMEBOX_HOURS)
```

Every element of the technique is here:

- **The proposal is an input, not a decision.** The comment names the failure it
  prevents — the generator "routinely echoes a longer take-home back" even when
  the prompt told it the cap — which is the automated version of the hiring
  manager who asks for six hours.
- **An unusable proposal resolves to the level default, not the ceiling.** The
  `except` branch falls back to `timebox` — the per-seniority value from
  `_TIMEBOX`, which for an unknown seniority is the middle of the band. Downward,
  toward the candidate.
- **A floor as well as a ceiling.** `max(tb, 0.5)` — the band has two ends, and
  the stated reason is candidate-facing rendering ("~0h"), which is the right
  reason: this number is *shown to the candidate*.
- **Non-finite values are rejected before the clamp, not after.** `NaN` survives
  `min`/`max` in this language and would render "~nanh" on a candidate's screen.
  A clamp written as a bare `min(max(...))` is not a clamp; it is a clamp for the
  inputs somebody thought of.
- **Dependent scoping derives from the clamped value.** The mid-flight update's
  fire time is computed from `tb`, not from the raw payload
  (`design.py:452-456`), and re-clamped into `[5, tb*60 - 15]` so it can actually
  land inside the exercise.

## The seam that does not clamp

`app/api/devcase/lifecycle/[id]/approve/route.ts:26-28` is the human review gate,
where a reviewer may correct the designed case before it ships:

```ts
if (typeof o.timeboxHours === "number" && Number.isFinite(o.timeboxHours) && o.timeboxHours > 0 && o.timeboxHours <= 80) {
  edits.timeboxHours = o.timeboxHours;
}
```

The bound is **80 hours** — two working weeks — against a policy cap of two. The
route is careful in every other respect: it validates finiteness, bounds the
title and brief, caps the task list at twenty, and deliberately keeps probes and
the rubric engine-owned so "the decision-space contract isn't hand-broken"
(`route.ts:9-12`). The reasoning that protects the *instrument* from hand-editing
was simply never extended to the field that sets the *candidate's cost*.

The fix the standard asks for is not to remove the reviewer's edit — that power
is real and the gate's promise is "review/EDIT/approve, not a blind sign-off"
(`route.ts:33-35`) — but to clamp it into the same band, surface the clamp to the
reviewer, and route anything above the ceiling through a named, expiring override
rather than a wider numeric bound. The audit trail for the naming already exists:
the route records the human decision through `recordAudit` on the same
transaction.

## The default that undoes the clamp

`pipeline/jobfit/devcase/models.py:213` declares `timebox_hours: float = 4.0`.
Any construction path that omits the field yields a case at double the policy
maximum without any writer having proposed it. This is the standard's
"clamp in the record, not at the surface" rule failing at its quietest point: a
schema default is a writer too.

## What the repo gets right that is easy to miss

The clamped value is the only one that travels. The candidate-facing surfaces
read `timeboxHours` off the stored case (`DevHelpers.ts:47`,
`JdsLedgerDetailPanels.tsx:104`), so there is one number and one source — no
second, unclamped copy for a display layer to disagree with. That is the property
that keeps a clamp from becoming cosmetic, and it holds everywhere except the
approve route's window.
