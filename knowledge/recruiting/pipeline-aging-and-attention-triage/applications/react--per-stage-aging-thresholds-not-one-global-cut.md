---
layer: application
type: application
subject: pipeline-aging-and-attention-triage
technique: per-stage-aging-thresholds-not-one-global-cut
stack: react
status: forged
---

# The per-stage SLA table and its per-board overrides (React)

`app/features/shared/pipelineTypes.ts:109-133` holds the technique's whole
policy surface: one legacy flat constant kept only as a fallback, one per-stage
table, and one resolver.

```
export const STALE_DAYS = 10; // legacy flat default — fallback for unknown stages

// Per-stage aging SLAs in days (PIPE4). A candidate sitting 10 days in Offer is a
// stall worth chasing; 10 days freshly Accepted is normal. Stage-appropriate
// thresholds flag the right cards instead of one blunt global cut. Hired never
// ages. Recruiters can override these per board (localStorage), so these are
// defaults, not hard limits.
export const STAGE_SLA_DEFAULTS: Record<string, number> = {
  Accepted: 14, Screened: 7, Interview: 5, Offer: 3, Hired: 0,
};
```

The comment is the standard's worked contrast verbatim, and the table has the
monotonic shape the standard requires: thresholds shorten as the candidate
invests more — 14 days at intake down to 3 in Offer.

## Terminal expressed twice

`Hired: 0` plus `slaForStage`'s docstring (`:126-129`): "A non-positive value
(e.g. Hired = 0) means the stage never ages — callers already exclude Hired, but
this keeps it explicit." That is the standard's say-it-twice rule, stated as an
intent rather than as redundancy: the policy table and the selection predicate
each independently prevent a terminal entry from aging, so neither is
load-bearing alone.

## The three-step fallback

`slaForStage(stage, overrides?)` (`:130-135`) resolves an override first (only
when `typeof o === "number" && o > 0`), then the per-stage default, then
`STALE_DAYS`. The last step is the one deviation from the standard worth naming:
an **unknown stage falls back to a flat ten days** rather than to no threshold
at all. The standard's rule is that an unresolvable stage produces no aging
state, because a guessed threshold on an unmapped column is a badge nobody can
justify. Here it produces a badge derived from a constant the file itself calls
legacy.

## Overrides live on the client; the shared badge approximates

`app/features/hiring/pipeline/usePipelineSla.ts` is the override store — a
`localStorage`-backed `Record<string, number>` (`:12-38`), hydrated in a mount
effect, with clearing implemented as deletion so a cleared stage goes "back to
the default" (`:31`). Storage failures are swallowed with the in-memory override
still applying for the session (`:33-36`), and a corrupt payload falls back to
defaults (`:23-25`).

Because the overrides are client-only with no schema, the workspace-wide badge
cannot see them, and `app/_lib/attention.ts:29-32` says so rather than
pretending otherwise:

> Active entries past their stage's default aging SLA → Pipeline. Server-side
> counts use `STAGE_SLA_DEFAULTS` — a recruiter's per-board localStorage
> overrides are a client concern the badge deliberately approximates.

That is the standard's declared-approximation contract: the board view is
authoritative for its own board (it calls `slaForStage(stage, slaOverrides)`),
the shared count is computed under published defaults, and the divergence is
documented at the point of computation. What is missing against the standard is
the *user-visible* half — the disclosure lives in a source comment, not on the
badge, so a recruiter who tuned their board still has no in-product explanation
for why the nav count disagrees with their lanes. Overrides are also
unattributed, undated and unbounded (any positive number is accepted), where the
standard asks for all three.

## Where the strip sits

`app/features/hiring/pipeline/PipelineAttentionStrip.tsx:1-15` renders above
`GettingStartedCard`, and the reason is written into the file: "they sit above
Getting started, because a stalled application outranks a setup checklist." The
same block records the reachable-empty rule — "Renders nothing when both queues
are empty; the strip must never be a permanent fixture the eye learns to skip" —
which is precisely the property terminal exclusion and per-stage thresholds
exist to protect. `docs/features/pipeline/README.md:246-252` documents the same
ordering at the page level, above the board panel and the activity feed.
