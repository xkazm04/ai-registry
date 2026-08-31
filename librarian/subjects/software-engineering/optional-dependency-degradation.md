---
subject: optional-dependency-degradation
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# optional-dependency-degradation

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

6 techniques, 2 node applications. A director merge of two scout findings (the design rule, and one route's environment truth table). Golden path 343 lines — the worker flagged the overage itself.

## Open leads (banked, with return conditions)

- **absence is a posture, malformation is an accident** (proposed law, not added). Three sightings in this subject; the worker argues it is a general configuration invariant rather than a resilience-only one. `failure-not-empty-success` is the nearest and is a different claim.
- Cross-subject finding: a shared silent-downgrade credential factory underpins four other routes and may belong to a credential or authorization subject.

## Touch log addition

### 2026-08-22 - `/research`, from a practitioner codebase (second touch)

Amended from [[../../sources/2026-08-22-onecli-repo]]: the fallback ladder
gained its top rung, "a minted value" - generate what randomness or
derivation can supply, never overwrite an operator's value, offer expensive
one-time builds at the point of need. The subject owned degradation
thoroughly; provisioning was the missing rung above the ladder.

## 2026-08-29 — /deepen architecture batch (dry_streak 0)

6 techniques (no new — nothing cleared convergence without restating a neighbour; dry on
that axis and recorded), 2→4 applications (rust--guarded-singleton-accessor from
personas crypto.rs — first second stack; node--capability-honest-refusal from ascent;
Tree B on node absent-degrades). Landed: tunables-with-defaults as the commonest
malformed-as-absent site; no-boot platforms validate at build/deploy (CI skip-flag
trap); null-client rule rescoped by language class; once-cell memoise-success-only;
refusal-body naming rescoped by audience; constant-standing-in-for-a-secret (ascent
ba86700e). Survived: boot-is-wrong-time-to-probe, closed-door default,
empty-string-is-absent (one exclusion), 503-for-both (vs the 501 cacheability trap).
Banked: 501-in-the-wild survey; once-cell try-init stabilization (one-line update when
it ships).

## 2026-08-31 — `/intake`, `2026-08-31-verou-2026-blog`

Landed `fallback-retirement-condition` (6 -> 7 techniques, + a `react`
application), from a spec editor's essay defending compatibility shims.

The subject treats absence as a **stable per-deployment fact**: this
installation does not have that dependency, and the fallback is permanent while
that holds. The source's whole subject is the other kind — absence as a
**closing frontier**, where the capability is missing *for now* because a
runtime or a downstream service has not reached the version that has it. A
fallback for that kind is a bet the gap will close, and the corpus already
demands a reaper of everything created (`creation-names-reaper`). Every fallback
in this subject's ladder names its *consequence*; none named its reaper.

Where the capability is testable at run time, the check **is** the reaper: it
retires the fallback per caller, with no deploy and no maintenance, in a
codebase nobody maintains. Two anti-patterns came with it, both proposed in good
faith: deleting the check so the substitute always runs (converts a bounded,
self-clearing cost into a permanent tax that every caller pays while none ever
reaches the real implementation), and suppressing the fallback entirely (does
not remove the need — **disperses** it into ad-hoc conditionals at every call
site that no upgrade ever retires).

Nice corpus-internal fit: the "test the capability, not a proxy" rule is this
subject's own `probe-the-grant-not-the-config` argument one layer out — a
version string or client identifier is true the day it is written and drifts
afterwards, in the direction that keeps the fallback alive on runtimes that
gained the capability years ago.

### Applied

A connected desktop application, experiment, **better**. Census over 8 seams / 4
capabilities / 7 files, with server/browser guards deliberately excluded as a
stable absence: tests the capability rather than a proxy **8/8**, check present
**8/8**, branch emitted **0/8**.

**The structural fact is the best result of the run.** The check is
load-bearing and the emission is not, so conformance tracks consequence rather
than diligence: omitting the check crashes on the runtime that lacks the
capability, so every author writes it correctly; omitting the branch signal
behaves identically everywhere and fails no test, so no author writes it. The
tree holds eight correct automatic reapers whose firing nobody can observe —
and therefore eight paths that cannot be deleted on evidence, because the doubt
one counter would settle has no counter.

### Boundary

`llm-agent/prompt-and-context/agent-instruction-files/substrate-coupled-expiry`
holds the same law for workarounds that **cannot** test their own premise (the
gap is a behaviour, the substrate is a model generation), where retirement
reverts to a dated audit. The question separating the two lanes is stated in
both files: *can this code find out for itself whether the gap is still there?*

## 2026-08-31 — `/intake` (`semantica`)

7 -> 8 techniques. Landed `refusal-is-not-failure`.

**The subject named this gap itself and declined it in one line.** The sibling
`absent-degrades-malformed-fails-fast` says: *"Malformed is not 'the dependency
rejected it' — that is a runtime fact and a different technique."* That technique did
not exist. Phase 6's enumeration hunt found it by reading the denial rather than the
candidate — the source (a fix applied across 58 call sites, where a `try`/`except`
around every registered custom method ran the built-in default on *any* exception,
"including one a validator or policy gate raised on purpose") only supplied the
occasion.

The two techniques are cleanly disjoint and the golden path now says so: the sibling
branches on **presence**, at boot, from a value; this one branches on **intent**, at
call time, from code. The golden path's "third state" paragraph gained a fourth,
which inverts the subject's posture rather than extending it — degrading at an
extension point is not resilience, it is overruling a check somebody installed on
purpose.

Phase 7.5 (`politicas`, experiment, `better`): the project has already mechanised the
two adjacent shapes as custom lint rules — "no empty catch" and "no catch returning
an empty value" — and the second's own rationale is this technique's thesis, reached
independently and priced ("cost politicas a day of diagnosis"). Both miss the
extension idiom, and the second misses it **by design**, because it exempts
substantive return values and the extension fallback returns the default's real
output. Amendment applied naming both rules and the shape of a third.
