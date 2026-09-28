---
layer: application
type: application
subject: collective-and-statutory-hiring-governance
technique: sticky-governance-against-silent-downgrade
stack: node
verified_on: 2026-09-28
verified_against: node@24
---

# Keeping a governed role governed (Node/TypeScript)

Governance lives in one pure, dependency-free module — `app/_lib/group-eval-governance.ts`
— so it unit-tests without the database that the run path imports. Two of its four
exports exist purely to stop the mode being lost, and both were written after an
incident. Re-read at `8f3c89560` (2026-09-28): the governance module is byte-for-byte
the file first read on 2026-08-20; the run path and the dedupe module moved.

## The mode is a closed enum with a permissive default

`GovernanceMode = "recommendation" | "committee" | "eligibility_list"` (`:11`), with
`normalizeGovernanceMode` (`:15-18`) coercing anything unrecognised back to a member of
the set. The sealing predicate is an allowlist exactly as the standard requires
(`sealsLead`, `:23`): `mode === "recommendation"`, with the docstring carrying the
reason — "Committee + eligibility-list are human/committee-decided; the AI stays
advisory and must never seal a winner (no solely-automated significant decision)"
(`:20-22`). A new mode added tomorrow is advisory by default, which is the right
side to fail to.

**Deviation, still open.** `normalizeGovernanceMode` resolves an unknown or malformed
value to `"recommendation"` — the *permissive* mode — rather than to the most
constrained one (`:17`), and `group-eval-governance.test.ts:18-20` now pins that
behaviour for `"nonsense"`, `null` and `undefined`. The standard's rule stands: an
unrecognised governance regime is precisely the case where a sealed winner does the
most damage. The fallback also reaches the stored side of the ratchet: the run reads
the prior mode through the same function (`group-eval-run.ts:477-479`), so a stored
value that is corrupted, or written by a future build with a fourth mode, normalizes
to permissive, and the ratchet below then has nothing to hold. The request side
legitimately needs a default (an absent parameter means "whatever the role already
is"); the stored side does not, and splitting the two — absent request to `null`,
unrecognised stored value to `committee` — is a two-line change.

## The ratchet, and the incident behind it

`resolveGovernanceMode(stored, requested)` (`:42-45`) is three lines:

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

The resolution is anchored to the **role**, not the run: `group-eval-run.ts:469` reads
the role-level evaluation and falls back to the selection-keyed row only when the role
has never been evaluated as a top-N — "Governance is a property of the ROLE, so the
stickiness read stays anchored to the role-level row" (`:465-468`).

**Deviation, still open.** Stored governance is read out of the *prior evaluation's
payload* rather than off the requisition; a search of the database and API modules for
a governance column or table finds none. It works, and it means a role whose prior
evaluation was pruned, or whose first governed run failed before persisting, starts
permissive again. The standard's placement — mode as an attribute of the hiring
process, inherited by every run under it — is the durable version.

Since the first reading the modal has gained a client-side disclosure for the case the
ratchet does not catch: when a saved evaluation ran under a different mode than the
control now shows, `GroupEvalNotices.tsx:66-70` says so, and the weaker-mode variant
names the stakes — recommendation mode is the one "where the AI may pick and seal a
lead". That is the standard's "a committee must be able to see that the rules changed
under them" at the recruiter's screen. It is a notice, not a record: no governance
event with an actor and a timestamp is written.

## The mode is part of the run's identity

`app/_lib/group-eval-dedupe.ts` exists because of the sibling incident, and the header
states it plainly:

> the group_eval dedupe key was `group_eval:${roleKey}` — the ROLE ALONE. A concurrent
> re-trigger with a different governanceMode (e.g. a recruiter switching a role to
> `committee`) or a changed candidate pool matched the in-flight run and was handed ITS
> result — the earlier run's auto-sealed `recommendation` lead, or its stale pool.
> (`:5-12`)

This is the **in-flight collapsing** vector, not a cache: no stored artifact was
reused, a running task was aliased. `groupEvalDedupeKey` (`:49`) returns
`group_eval:${roleKey}:${mode}:${fingerprint}` (`:55`), where `mode` is the normalized
value (`:53`) and `fingerprint` is `candidateSetFingerprint` (`:32`) — an
order-independent FNV-1a hash over the stable identity set, prefixed with the set size
so two differently-sized sets that hash-collide still differ (`:39`). Reordering the
same people dedupes; adding or removing anyone does not. The hash itself now lives in
`app/_lib/hash.ts:31`, shared with the selection cache key, with its digests pinned in
`hash.test.ts` as byte-identical to the private copy it replaced.

The null contract is the other half: a blank role identity returns `null` (`:52`) so
the task layer falls back to a guaranteed-unique key "rather than a colliding
constant" — the standard's rule that a missing identity must never collapse unrelated
requests onto one another.

The same fingerprint now also guards the *write*: the run reads the cohort state before
its first await and re-asserts it when persisting (`group-eval-run.ts:470-476`), so a
stale run can no longer overwrite a newer evaluation's payload. The seal happens before
that check, though, so a stale run still seals its decision record — which is harmless
under the governed modes, where the record is advisory, and is the one path by which a
superseded run could still seal a lead under `recommendation`.

## What is missing

Nothing enforces the mode on an unattended path beyond the shared run function, and
there is still no counter on how often `normalizeGovernanceMode` had to coerce an
unrecognised value — its three callers (`group-eval-run.ts:464`, `:478`,
`group-eval-dedupe.ts:53`) neither log nor count. Both monitors the standard asks for —
alarm on a sealed `group_eval_lead` under a governed role, count the fail-closed
coercions — would be cheap here, since both sites are single functions, and neither
exists at this reading. `group-eval-governance-persist.test.ts:85` pins the important
behaviour ("rerun with reset mode must still NOT auto-seal a lead"), which is the
assertion that would have caught the original incident.
