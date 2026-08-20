---
layer: application
type: application
subject: remediation-handoff
technique: handoff-tenancy-and-idempotence
stack: node
status: forged
---

# The hand-off write — `POST /api/org/followups/handoff`

`src/app/api/org/followups/handoff/route.ts` is the only user-triggered write
in the loop, and its header (`:1-15`) states the whole contract before any
code runs: *"the user picked a batch and generated its fix prompt, so every
picked item is now IN PROGRESS — 'we took this on' — with a timeline note that
says how. The prompt itself is built client-side from the same rows (pure), so
this route only records the claim; nothing here talks to a model."*

## Tenancy

The route implements the technique's two-check rule literally:

1. `requireOrgAccess(org)` (`:45-46`) authorizes the container, using the same
   helper as the rest of the org surface.
2. Every id is resolved through `getRecommendationOrgSlug(id)` (`:50-55`) and
   compared to the authorized org — *"Resolved one by one through the same
   helper the per-item route uses, so the ownership rule has one
   implementation."* One validation door, two callers.

The refusal shape is the part worth copying. A foreign id fails the **whole
request** with a 403 and no per-id detail, and the header says why: *"an id
from another tenant is refused as a whole-request 403, not skipped, so a
client can never learn which foreign ids exist by which ones 'succeeded'."*
That is the oracle argument, written down at the site where the temptation to
be helpful lives.

Two further refusals sit at the same door: the public funnel org is rejected
outright (`:42-44`) — *"tracking is for your own org's scans"* — and
`MAX_BATCH = 50` (`:28`, enforced `:39`) caps the request, which is both the
batch shape the prompt builder was designed for and the bound on the
per-id ownership loop.

## Idempotence

The write loop (`:56-68`) reads the current status of every id in one query,
then transitions **only** `open` rows:

- `status === "open"` → `updateRecommendation(id, { status: "in_progress" },
  { actor, note: "Handed off: fix prompt generated from the Follow-ups
  ledger" })`, pushed to `marked`.
- any other known status → pushed to `skipped` with that status, untouched.

So re-sending the same batch produces no second status write and, crucially,
no second timeline event — the header states the rule directly: *"an item
already in progress is left alone (no duplicate event); done / dismissed items
are NOT reopened — a batch that includes a closed item is a stale selection,
and the response says which ids were skipped so the ledger can refresh."*

The response is `{ marked, skipped }` (`:69`), not a bare acknowledgement:
a reconcilable result the client uses to correct a selection that went stale
while the modal was open.

## The claim is a record, not a lock

Nothing in this route reserves anything. `FollowupsPromptModal` includes
already-handed-off items in the regenerated prompt and simply does not re-mark
them, so an operator regenerating an artifact for in-flight work gets the same
document. Expiry does not live here at all — it lives in the next scan, via
the resolve rule.

## Batch shape upstream

The batch this route receives is shaped by
`src/components/org/followups/followupsModel.ts`: `sortByValue` (`:54-64`,
projected points desc, then impact, then effort, then title) and
`summarizeSelection` (`count · repos · +pts`). The estate-wide decision is
`dimensionSpread` (`:127-140`): a dimension is `orgWide` when
`of >= 2 && repos.size * 2 >= of` — an active follow-up in at least half the
scanned repos, with a minimum denominator of two so one-of-two does not
qualify. The module comment states the shaping consequence: *"a gap present in
at least half the fleet is an ORG problem — fix it once, as a practice,
copying whoever already nails it — not N repo tickets."*
