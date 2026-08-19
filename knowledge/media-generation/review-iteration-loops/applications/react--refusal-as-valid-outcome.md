---
layer: application
type: application
subject: review-iteration-loops
technique: refusal-as-valid-outcome
stack: react
status: forged
---

# React: shared note guards that refuse before the transform runs

In the `gravitone-gcloud` repo, the rebalance journey's transform lives in
`app/_phases/script/recalibrate.ts`, split out of `versions.ts` after a UAT
pass (`uat/runs/2026-08-12-rebalance`) found the transform would do four
things the rest of the app forbids. The file's header (lines 1–24) lists
the four findings, and every guard in the file is one of them:

- a note could descope the steel-man that the triage board refuses to
  descope — "a rebalance that can quietly do what the scope layer forbids
  is not a rebalance, it is a bypass";
- a note could give screen time to a card the creator had taken out of
  scope — "two systems, opposite answers, no complaint";
- two contradicting notes on one track resolved silently, "and the creator
  was never told which one lost";
- cutting every fact a turn argues from left the turn "at full weight, with
  nothing behind it".

## Guards shared, not re-typed

`guardNotes()` (recalibrate.ts:67–116) implements guards 1–3 over the notes
and returns `{ refusals, keep, contested }`. The header comment at lines
50–54 states why it is one function both engines call: "a note that cannot
be honoured is refused whoever is holding the pen. Shared rather than
re-typed, because the model path silently drifting away from these three
rules is the exact failure this file exists to prevent." Guard 1 refuses
`descope` on `card.required`, reusing the card's own `requiredWhy` as the
refusal text — the scoping surface and the refusal speak with literally the
same string. Guard 2 refuses weight notes (`more-focus`/`less-focus`) on
cards whose scope state is descoped, with a routed refusal: "out of scope
on the triage board — bring it back into scope there first."

## Conflicts get a named winner

Guard 3 (lines 104–110) collects descope-plus-weight collisions as
`contested` and leaves the verdict to the caller: the mock path stamps
`applied: "descope"` with its reasoning ("descope removes the card, so a
focus note on the same track cannot also apply", lines 129–134) into a
`Conflict[]` the UI renders — the silently-dropped-note finding fixed by
making the loser visible.

## The ordering is the contract

The header's closing sentence states the technique's ordering rule as the
file's reason to exist before any real model does: a violating plan is
"refused before the result is computed, never applied-and-flagged
afterwards. That ordering is the whole difference between a guard and a
complaint." The guards "do not make the mocked transform smart. They make
its CONTRACT explicit — which is the thing a real model will have to
satisfy too." A companion honesty device, `inertNotes()` (lines 44–46),
names the note kinds the prototype cannot act on so the UI can say so
"rather than imply the bars moved because of them" — inaction declared
rather than impersonating effect.
