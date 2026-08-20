---
layer: application
type: application
subject: collective-and-statutory-hiring-governance
technique: sticky-governance-against-silent-downgrade
stack: node
---

# Keeping a governed role governed (Node/TypeScript)

Governance lives in one pure, dependency-free module — `app/_lib/group-eval-governance.ts`
— so it unit-tests without the database that the run path imports. Two of its four
exports exist purely to stop the mode being lost, and both were written after an
incident.

## The mode is a closed enum with a permissive default

`GovernanceMode = "recommendation" | "committee" | "eligibility_list"` (`:11`), with
`normalizeGovernanceMode` (`:15`) coercing anything unrecognised back to a member of
the set. The sealing predicate is an allowlist exactly as the standard requires
(`sealsLead`, `:23`): `mode === "recommendation"`, with the docstring carrying the
reason — "Committee + eligibility-list are human/committee-decided; the AI stays
advisory and must never seal a winner (no solely-automated significant decision)"
(`:20-22`). A new mode added tomorrow is advisory by default, which is the right
side to fail to.

**Deviation.** `normalizeGovernanceMode` resolves an unknown or malformed value to
`"recommendation"` — the *permissive* mode — rather than to the most constrained one.
The standard's rule stands: an unrecognised governance regime is precisely the case
where a sealed winner does the most damage. In practice the stickiness below covers
the common path (a role already governed cannot be normalized down), but a first run
whose mode arrives corrupted auto-seals a lead. The fix is one line and does not
change any other call site.

## The ratchet, and the incident behind it

`resolveGovernanceMode(stored, requested)` (`:42`) is three lines:

```
if (stored && !sealsLead(stored) && sealsLead(requested)) return stored;
return requested;
```

Only the governed→permissive direction is refused. Escalation and lateral moves
between the two governed modes pass through — the asymmetry the standard names, and
one the repo articulates better than most design documents:

> Governance is STICKY for the governed modes (bug-ui-scan-2026-07-09 #1): the
> segmented-control state that produces the request param is UNPERSISTED per-mount
> client state that resets to "recommendation" on every fresh mount / different user
> / rerun. Trusting it alone lets a committee/eligibility role silently downgrade to
> "recommendation" and auto-seal an AI lead — the exact guarantee this module exists
> to hold. (`:34-41`)

That is the unpersisted-client-state vector in full, found in production rather than
in review.

The resolution is anchored to the **role**, not the run: `group-eval-run.ts:340-343`
reads the prior eval's persisted `governanceMode` and falls back to the selection-keyed
row when the role has never been evaluated as a top-N, "so this keeps governance
exactly as sticky as it was" (`:335-338`).

**Deviation.** Stored governance is read out of the *prior evaluation's payload*
rather than off the requisition. It works, and it means a role whose prior evaluation
was pruned, or whose first governed run failed before persisting, starts permissive
again. The standard's placement — mode as an attribute of the hiring process, inherited
by every run under it — is the durable version.

## The mode is part of the run's identity

`app/_lib/group-eval-dedupe.ts` exists because of the sibling incident, and the header
states it plainly:

> the group_eval dedupe key was `group_eval:${roleKey}` — the ROLE ALONE. A concurrent
> re-trigger with a different governanceMode (e.g. a recruiter switching a role to
> `committee`) or a changed candidate pool matched the in-flight run and was handed ITS
> result — the earlier run's auto-sealed `recommendation` lead, or its stale pool.
> (`:5-9`)

This is the **in-flight collapsing** vector, not a cache: no stored artifact was
reused, a running task was aliased. `groupEvalDedupeKey` (`:54`) now returns
`group_eval:${roleKey}:${mode}:${fingerprint}`, where `mode` is the normalized value
(`:58`) and `fingerprint` is `candidateSetFingerprint` (`:37`) — an order-independent
FNV-1a hash over the stable identity set, prefixed with the set size so two
differently-sized sets that hash-collide still differ (`:44`). Reordering the same
people dedupes; adding or removing anyone does not.

The null contract is the other half: a blank role identity returns `null` (`:57`) so
the task layer falls back to a guaranteed-unique key "rather than a colliding
constant" — the standard's rule that a missing identity must never collapse unrelated
requests onto one another.

## What is missing

Nothing enforces the mode on an unattended path beyond the shared run function, and
there is no counter on how often `normalizeGovernanceMode` had to coerce an
unrecognised value. Both monitors the standard asks for — alarm on a sealed
`group_eval_lead` under a governed role, count the fail-closed coercions — would be
cheap here, since both sites are single functions. `group-eval-governance-persist.test.ts:85`
pins the important behaviour already ("rerun with reset mode must still NOT auto-seal
a lead"), which is the assertion that would have caught the original incident.
