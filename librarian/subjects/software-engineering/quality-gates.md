---
subject: quality-gates
domain: software-engineering
last_touched: 2026-08-29
touched_by: intake
dry_streak: 0
---

# quality-gates

First touch: 2026-08-28, `/deepen` loop round 2 over the software-engineering
domain. Selected as the top never-swept subject (27 attention points, 6
consumer deviations against 3 consults). Not single-stack — 4 `node`
applications and 1 `process`.

## State

10 -> 11 techniques, 5 applications. This is one of the densest subjects in the
bundle and the round was forecast confirmation-heavy before it started; it was
not, because the gap found sits in a layer the subject had never looked at.

Landed:

- `enforcement-binding` (new technique) — the join between the pipeline and the
  merge decision. The subject engineered gates thoroughly and treated the merge
  pipeline as the top of the ladder; the actual top rung belongs to the hosting
  platform, is configured outside the repository, and fails in ways no pipeline
  run can report.
- `quality-gates.md` — new golden-path section plus frontmatter and index
  wiring.
- `gate-laddering` amendment — its "the binding rung is the last one" blockquote
  now carries the qualification it cannot verify about itself: a check present
  on the merge rung and absent from the binding discovers, it does not refuse.

## Why it earned a technique rather than a paragraph

Two mechanics, neither reachable from anything the subject already held:

1. **The join is a name string.** Requirements name the checks that must
   report success. A job renamed, split, or moved emits under a different name;
   the requirement then matches nothing, and matching nothing reads as *absent*
   rather than failing — the platform's version of a glob walking zero files.
   Both sides look healthy on inspection and the seam between them is the
   defect.
2. **"Did not run" resolves to a definite verdict, and the direction depends on
   where the skip was written.** Condition the whole pipeline definition
   (path/branch filter) and nothing is ever reported, so the requirement hangs
   and the merge blocks indefinitely — fail-closed. Condition the unit inside
   it and the same intent is reported as *success*, satisfying the requirement
   with a check that did no work — fail-open. One indentation level apart, and
   the fail-open form is what every troubleshooting guide recommends, because
   the fail-closed form is unbearable in daily use. So the standard cure for a
   merge deadlock converts a gate that blocked everything into one that blocks
   nothing, and looks in every report like the deadlock was fixed.

The second is the find of the round. It is `unknown-is-not-a-value` at exactly
the boundary that law describes — an optional result meeting a non-optional
requirement, with the platform picking the default.

## Prior art checked before drafting (the LESSONS rule paid again)

Grep over the subject for the whole vocabulary of this area returned zero hits.
Three neighbours were close enough to need an explicit boundary written into
the technique's opening:

- `gate-laddering` **"the typical-commit fire set"** — replay recent history
  against trigger conditions to see which jobs actually fire on a median commit.
  Nearly the same territory from the pipeline's side. The new technique asks the
  next question: what the merge decision does with the ones that did not fire.
- `gate-laddering` **"one authority for the rule set"** — one config all rungs
  read. About rule *content* drifting across rungs, not about the protection
  configuration being a separate authority.
- `gate-liveness` — proves a gate red. Explicitly extended rather than
  duplicated: passing the seeded-failure exercise does not prove the refusal
  reaches the merge decision, and a red result nothing consumes is the exact
  state the new technique exists to find.

## Counter-evidence that confirmed (no edit — first-class results)

- **`hook-hygiene`'s "hooks observe, never mutate" is absolutist and the field
  disagrees loudly** — auto-formatting commit hooks are near-universal practice.
  Attacked directly and the corpus won on the merits: the popular tooling's own
  documentation concedes its restaging fix "doesn't work for partially-staged
  files", and the documented consequence is precisely the corpus's staging-
  contract bullet — a hook running an add commits changes the author
  deliberately withheld, including debugging code, and they may push before
  noticing. The corpus states the mechanism more precisely than the write-ups
  advocating the practice. No edit.
- **`gate-laddering`'s "permanent red is no gate"** got a live specimen during
  this very session: a registry gate (`check-skills`) exited 1 on trunk from a
  concurrent commit, and merging continued. Confirms the claim as written,
  which already carries a wild measurement (zero successes across hundreds of
  runs). No edit — and see the deviation below.

## Open leads (banked, with return conditions)

- **A true positive left standing on trunk is a distinct death mode from a
  false positive, and the subject only names the second.** `false-positive-
  economics` explains death-by-imprecision; `gate-laddering` names permanent
  red as "no gate" but treats it as a diagnostic reading, not as a process
  failure with its own craft (who owns a red gate, what the clock is, what
  happens to the ladder while it stays red). Not minted this round: the
  training-data lane reached it but the search lane produced no independent
  convergence, so it does not clear the bar. Return condition: a second
  independent sighting, or any run that opens `false-positive-economics`.
- **Gate result caching** — a cache key that omits an input makes a gate pass
  on stale evidence. Verified as *already owned* by the golden path's
  "stale intermediates" bullet under gate-sees-target. Do not re-propose.

## Deviations observed (registry-local, for whoever owns the gate lane)

- `scripts/check-skills.mjs` exits 1 on trunk as of 2026-08-28, on
  `skills/architect/SKILL.md:576` — an em-dash inside a fenced code block, from
  commit `6377bb9`. Not fixed here: another session was active in that file and
  scope discipline says a research round does not repair a neighbour's lane.
  Recorded because the subject this round swept is the one that says a red
  binding rung is the first number to check.
- The registry's own enforcement binding is unexamined. The new technique's
  inventory exercise — enumerate what the pipeline emits, enumerate what the
  merge decision requires, diff both directions — has never been run here, and
  this repository has the gate suite that would make the answer interesting.
  Return condition: any run with authority over CI configuration.

## 2026-08-29 - /intake, the repair-time oracle

Second touch, one day after the `/deepen` round above:
[[2026-08-29-ai-native-sdlc-and-ci-on-call]], intake of a vendor SDLC
playbook batched with a first-party on-call account. Gained
`oracle-frozen-during-repair` (12 techniques, with `enforcement-binding` above) and an amendment to
`gate-laddering`'s placement matrix (asking controls sit at stage boundaries).
Golden path gained one section after "The gate must see its target".

## What the gap actually was

A missing stage, the shape the 2026-08-22 findings had. The subject's law is that a
gate must *see* its target; the repair task adds that the gate must not be
*writable by* the party it gates, and no technique sat at the point where a fixer
holds write access to the test. The rule existed one stage later -
`proposal-not-push` reserves test deletion and gate configuration for a human at
the merge gate - so the technique is the same rule enforced early, and says so.

## Standing

Was the #2 attention point (27) and never swept. This run touched two techniques
and the golden path; it did not sweep the other nine. Six consumer deviations
remain unread.

## Declines

None.


## 2026-08-30 - intake, operator-control-plane

Gained `prose-rule-drift`, the subject's missing **stage one**. The subject was
thorough from stage two onward - a gate can be decorative
(`severity-by-construction`), dead (`gate-liveness`), or unbound from the
decision (`enforcement-binding`) - and the case of a rule *never mechanised at
all* was named in the golden path's opening sentence and owned by nothing.

The diagnostic is the absence of a symptom: the forbidden action succeeds
normally, so a violation is indistinguishable from compliance at every surface
anyone would check. Risk region: prohibitions, on rare setup-shaped actions,
whose violations land where no gate reads. Remedy: refuse at the action, not at
review.

The technique gained a third section **from its own apply step**, which is the
part worth remembering. Run against a managed project, the audit turned up a
state the drafted version did not have: a checker that exists, is correct, is
named in the standing document with its exact invocation, and that **nothing
invokes**. Distinct from `gate-liveness` (runs, checks nothing) and
`enforcement-binding` (runs, sees, verdict not joined). The audit question had
to be sharpened from "is there a check?" to "what invokes it, on what event?"

Measured on the tree: one unbacked rule with **zero** violations across 785
files - which confirmed the technique's *boundary*, since that rule sits outside
its stated risk region on all three axes - and one nominally-backed rule with
**27** violations across four projects, found by running its own checker once.

## Standing

Was the #2 attention point (52). This run added one technique and one
application and did not sweep the other twelve techniques.
