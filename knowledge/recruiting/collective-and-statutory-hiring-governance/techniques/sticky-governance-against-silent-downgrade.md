---
layer: technique
type: technique
subject: collective-and-statutory-hiring-governance
technique: sticky-governance-against-silent-downgrade
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, every-decision-names-its-actor, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [caching or reusing an evaluation run, adding a background or retry path to a governed comparison, a hiring process changes governance mid-flight]
---

# Sticky governance against silent downgrade

A governance mode that can be lost is not a governance mode. This technique makes
the mode **inescapable** — it survives caching, re-runs, retries, background
jobs, exports and reconstruction — and makes any change to it an explicit,
attributed event rather than a side effect.

The failure it prevents has a signature: months after a committee process was
configured, someone finds a sealed winner in the record for a search that was
never allowed to have one. Nobody chose that. A code path forgot.

## The three ways governance is lost

**By omission.** A new entry point — a retry, a scheduled refresh, a bulk
regenerate, a webhook-triggered recompute — constructs its own request and does
not carry the mode. It gets the default, which is the permissive one. This is why
the sealing predicate must be written as an allowlist over the constrained modes
rather than a set of exclusions: an unset mode must land on the safe side.

The commonest instance is not a background job at all: it is **unpersisted client
state**. A control that lets a user pick the mode, whose selection lives only in
the current view, resets to its default on every fresh load, every other user, and
every re-run. Trusting that parameter alone means a governed process silently
downgrades the first time someone re-runs it from a clean screen. The mode is
resolved server-side from what the process was last governed by; the request
parameter is a *proposal*, never the authority.

**By reuse.** A prior run over the same candidates is served from cache after the
mode changed. The scores are identical and the artifact is wrong, because the
rules that governed what could be produced from those scores are different. **A
governance mode change is part of the comparison's identity.** Fold it into the
run's fingerprint alongside the candidate set, the brief version and the rubric —
reusing a run computed under rules that no longer apply is a correctness failure,
not a cache hit
([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).

The same fingerprint governs **in-flight collapsing**, which is the vector teams
miss: where concurrent identical requests are deduplicated onto one running job,
a request under a newly-governed mode will be handed the *earlier* job's result —
an auto-sealed pick produced under the permissive regime — and no cache was
involved. Whatever key decides "is this the same work already running" must carry
the mode and the candidate set. And when the identity inputs are missing, that key
must be unique rather than a shared constant, or unrelated requests collapse onto
each other.

**By inference.** A consumer decides the mode from something adjacent — a tenant
flag, the presence of multiple reviewers, a job-board category, a display string
— instead of reading the field. Every such derivation eventually disagrees with
the field. Rules key off the stable governance value, never off a rendered label
([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).

## Procedure

1. **Put the mode in the run's identity.** Whatever fingerprint decides "have we
   already computed this", the governance mode is one of its inputs. Two runs
   differing only in mode are two different runs and must not deduplicate.
2. **Put the mode in the sealed record.** The stored artifact states which regime
   produced it, so a later reader reconstructing the advice a committee received
   can see the rules that were in force, not infer them from the date.
3. **Resolve the mode server-side, at the process, on every path.** Never accept
   it from a client request, a job payload, or a caller argument that a
   forgetful new caller can omit. Resolve it from the hiring process record every
   time, including in background work.
4. **Fail closed on absence.** Missing, unreadable or unrecognised mode resolves
   to the most constrained mode, and that resolution is logged as a defect signal
   — not swallowed. Repeated resolutions of this kind mean a caller is broken.
5. **Treat a mode change as a governance event.** It has an actor, a timestamp
   and a reason; it is recorded like any other consequential decision about the
   process ([every decision names its actor](../../_laws.md#every-decision-names-its-actor)).
6. **Never migrate old artifacts to a new mode.** Artifacts produced under the
   prior regime keep their stamp. Re-labelling them makes the record say a
   committee received advisory material it never received.
7. **Make the mode a ratchet, in one direction only.** Once a process has run
   under a constrained mode, a request to run it under the permissive one is
   *refused* and the stored mode stands. Escalation from permissive to constrained
   is always honoured, and a lateral move between two constrained modes — a
   process that turns out to be list-governed rather than committee-governed — is
   honoured too. Only the governed-to-permissive direction is blocked, because
   only that direction re-enables sealing. A blanket freeze on mode changes looks
   safer and is worse: it makes correcting an under-governed process impossible.
   The permissive mode is not sticky, so a process that has only ever run under it
   honours whatever is requested next.

## Decision rules

- When a cached run's mode differs from the current mode, discard the cache and
  recompute. Do not adapt the cached artifact's presentation — the artifact's
  *kind* is wrong, not its styling.
- When a background path cannot resolve the mode (the process is gone, the record
  is unreadable), it produces nothing and raises. Producing a default-mode
  artifact "so the job doesn't fail" is the single worst outcome available.
- When a mode change lands mid-deliberation, prior artifacts stay valid *as
  history* and are visibly superseded rather than deleted. A committee must be
  able to see that the rules changed under them.
- When an export or downstream system holds a copy of an artifact, the copy
  carries the mode stamp too. Governance that stops at the system boundary stops
  where it matters most.

## Detecting drift before a lawyer does

Two cheap monitors catch nearly all of this:

- **Alarm on any sealed single-pick artifact whose process is not in the
  permissive mode.** This should be structurally impossible; alarm on it anyway,
  because "structurally impossible" is a claim about the code as it was last
  audited.
- **Count fail-closed resolutions.** A steady trickle of missing-mode resolutions
  is a broken caller running quietly. The safe default hid the bug; the counter is
  what surfaces it.

## When not to use it

There is no process where governance should be non-sticky. What *is* legitimately
adjustable inside a mode — the committee's membership, the vote threshold, the
list's expiry — is configuration, and configuration changes need the same
attribution but not the same refusal-to-downgrade. Do not apply the no-downgrade
rule so broadly that ordinary process administration becomes impossible; scope it
to the mode itself and to anything that changes what the machine may emit.
