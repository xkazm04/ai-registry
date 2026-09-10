---
subject: unattended-build-loop
domain: game-production
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# unattended-build-loop

First touch: 2026-08-30, an `/intake` run on a sponsored loop-mode demo
([[../../sources/2026-08-30-tesana-loop-mode-game-builds]]). Forged 2026-08-20
from one tree; three applications, all from the same tree.

## State

6 -> 7 techniques, 3 -> 4 applications (all `node`/`process`, one tree).

Landed:

- `verifier-coverage-review-agenda` (new technique) - a plan item inherits
  verified status from whichever gate passed in its area, which certifies
  perceptual requirements with a compiler when the perceptual gate is advisory;
  the loop certifies only up to the rung a verdict reached, emits the unjudged
  items as the reviewer's agenda, and prints per-gate verdict counts at run end
  because the static preflight excludes runtime-determined gates on purpose.
  Applied as an `experiment` over the connected tree's four recorded runs:
  the perceptual gate returned zero verdicts in 77/77 deciding iterations while
  234 features were marked done. Verdict `better`; the project's next harness
  change is filed, not committed (touches three files, gate unreachable here).
- Golden path gains "Coverage decides where the human's time goes" between the
  third-status section and the spend section.

## Boundaries observed

- The golden path already states that a sibling discipline
  (`runtime-observation-evidence`, tiers-of-truth) owns the evidence ladder;
  this technique reads the rung off a verdict and routes what falls short. Do
  not let it grow a ladder of its own.
- `subsystem-review-doctrine`'s entitlement rule is the reviewer-side mirror
  (conclude only what prior passes confirmed); this is the loop-side statement
  of the same asymmetry. Both are in-bundle, so a sentence in each is enough.

## Leads carried

- Report wall time beside spend and overshoot width (untriaged, source note).
- Agent-proposed next steps as unallocated scope (lead, source note).

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/unattended-build-loop",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:f91ffa4709aaf6e8",
  "disposition": "reverify",
  "coverage": "All 12 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A launch estimated at 1 unit can actually cost 100; pool width one does not bound the overshoot to one unit.",
    "When the last checkpoint disappears, snapshotting the current corrupted tree preserves it but does not make it verified green.",
    "A perceptual verifier returning fail reached the perceptual evidence kind but did not verify the item as passing."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/craft-judgment/unattended-build-loop",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "unattended-build-loop.md": {
      "disposition": "reverify",
      "reason": "Useful separation of claims, verdicts and spend. Reverify uncited 20-30 point evaluation gap and assertions about all builders. External checks can malfunction, estimates do not enforce a hard cap, and rollback is not universally preferable to diagnosed forward repair. Exact normalized names can collide. A required unavailable verifier should not be weakened merely to make success reachable."
    },
    "techniques/budget-reservation-and-drain-not-kill.md": {
      "disposition": "clarify",
      "reason": "Repaired estimated cap as bounded guarantee, non-atomic reservation, unconditional drain and missing-usage-as-settled accounting. Adds per-attempt identity, durable reconciliation, enforceable maximum versus soft budget, bounded shutdown and cancellation semantics."
    },
    "techniques/completed-with-gaps-excluded-from-the-numerator.md": {
      "disposition": "reverify",
      "reason": "Gapped work must stay outside fully verified completion, but downstream admission depends on each dependency's contract. Independently verified subitems need not inherit an unrelated parent's uncertainty; report parent completion and scoped subitem evidence separately without denominator gaming. Failure and unevaluated states can matter even when both block scheduling."
    },
    "techniques/no-gate-self-certifies.md": {
      "disposition": "reverify",
      "reason": "Independence is evidence/control separation, not necessarily a different person or server. In-process checks can have no shell command; observer results can be defective and require diagnosis. Missing environment may be repairable as infrastructure work, and producer instrumentation can supply validated evidence. Logs and exit status need a tool-specific combined protocol."
    },
    "techniques/rollback-to-last-green.md": {
      "disposition": "clarify",
      "reason": "Repaired initial/resumed state as presumed green and replacement of a missing checkpoint with an unverified baseline. Restricts restoration to owned isolated state, preserves unrelated work and diagnostic evidence, validates durable targets and acknowledges external/untracked state."
    },
    "techniques/unreachable-success-preflight.md": {
      "disposition": "reverify",
      "reason": "A blocked check pins only affected items, not necessarily the entire rate. Current missing prerequisites can become available, runtime gates have statically checkable dependencies, and self-reported targets can be invalid. Report feasible upper bounds and unknowns; continuation and weakened evidence basis require explicit run policy, not an unconditional warn-and-spend default."
    },
    "techniques/verified-vs-self-reported-pass-rate.md": {
      "disposition": "reverify",
      "reason": "Use immutable item IDs and reject ambiguous normalization collisions instead of deterministic misassignment. Bind evidence to content/configuration, not merely producing session; independent verification can succeed without a producer mentioning the item. A rate gap can come from real defects, weak claims or coverage, not almost always environment failure."
    },
    "techniques/verifier-coverage-review-agenda.md": {
      "disposition": "clarify",
      "reason": "Repaired highest-rung-with-any-verdict logic. Tracks pass/fail/unevaluated per required evidence kind and item, preserves observed failures and assigns missing coverage without treating perception as proof of hidden behavior. Clarifies unavailable gates, bounded recovery and residual review agenda."
    },
    "applications/node--budget-reservation-and-drain-not-kill.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF source locations, cap values and verification date were not rerun. Displayed helper is a projection predicate, not atomic reservation or a hard currency bound; NaN/negative inputs and durable restart reconciliation need checks. Pool width bounds active calls, not their unbounded cost. Missing usage is estimated liability, and cancellation can avoid additional cost without refunding incurred usage."
    },
    "applications/node--verified-vs-self-reported-pass-rate.md": {
      "disposition": "reverify",
      "reason": "Historical Node/PoF source locations and verification date were not rerun. Normalized name/ID precedence can select the wrong feature; reject ambiguity. Shown self-report count excludes gapped areas and requires pass status before verification, so it is a filtered metric rather than every producer claim. Area-level build success does not certify all feature semantics."
    },
    "applications/node--verifier-coverage-review-agenda.md": {
      "disposition": "reverify",
      "reason": "Historical A/B metadata, recorded runs and verification date were preserved, not rerun. Counts sum to 92 iterations/323 features; reclassification is a reporting comparison, not an implementation trial proving better output. Name regex misses requirements and a single area screenshot need not cover every feature. The text claims all 77 attempts lacked verdicts while later acknowledging parsing cannot reliably separate failure from nonexecution."
    },
    "applications/process--no-gate-self-certifies.md": {
      "disposition": "reverify",
      "reason": "Historical process/PoF locations and verification date were not rerun. Nonempty captured frame plus judge outage cannot satisfy a required perception check; black output can be intentional and boot failure can be product failure. Ignore-exit policy and per-iteration shared frames need scoped protocol/identity checks; quoted doctrine is not current consumer evidence."
    }
  }
}
```

## Architecture review - 2026-09-10 (after the compression revert)

Read all twelve documents at 44c89965, plus the State / Boundaries / Leads
sections this note already carried. The 2026-09-10 entry above was written against
the pre-revert bytes and the old baseline; this one replaces it as the current
decision.

**The subject's biggest external claim checks out, and is if anything
conservative.** The golden path asserts that "across published evaluations of
coding agents, self-judged completion runs tens of percentage points above
externally-verified completion - gaps of 20 to 30 points where the external grader
is an automated test suite, and far wider where the agent grades its own output".
It cites nothing. I went looking, and the published record supports it: a
production study across millions of task runs reports agents succeeding about 56.6%
of the time with 45-75% of failures invisible (the agent reporting success where
the environment disagrees); a UC Berkeley/Stanford result gives false-success rates
of 45-48% in single-control domains and 75.8% for self-assessing agents; an agent
benchmark records 87 of 97 self-stops mismatching verification, 55 of them
reporting success while failing it; and a rigour-of-metrics comparison moves one
agent from 46.7% to 26.7% on the same tasks, which is exactly the corpus's 20-point
figure. The claim survives; what it lacks is a basis, in a subject that spends nine
paragraphs insisting a number carries one. Naming even one of these would cost a
line. I read search-level summaries of these papers, not the papers themselves.

**The overshoot bound contradicts the technique that precedes it.**
`budget-reservation-and-drain-not-kill.md` argues for most of its length that
adding the outstanding-reservations term is precisely what closes the N-1
overshoot, and then closes with "size the pool knowing that its width *is* the
worst-case overshoot in units of one launch". Those are two different regimes. With
no reservation term the overshoot is up to N-1 launches, which is the paragraph's
figure. With the reservation term in place every in-flight item was admitted
against the projection, so the residual overshoot is the sum of (actual - estimate)
across the drained items - bounded by estimation error, not by pool width, and
capable of exceeding one launch's worth if the estimate is low. A reader who sizes
their pool by that sentence is sizing against the wrong quantity. The worked
example ("a ceiling of one unit that pauses having spent 1.06") is in the second
regime and is fine.

**"There is no fourth option" has a fourth option in the same document.**
`rollback-to-last-green.md`'s first decision rule says concurrency forces a choice
between serial execution, isolated trees, or no rollback, "and there is no fourth
option". Its own when-not-to-use section then offers one: for genuinely isolated
items, a per-item revert rather than a whole-tree rewind. Either the enumeration
needs the fourth entry or the closing bullet needs withdrawing. The golden path
states the same constraint more carefully - it scopes it to writers interleaving
into one tree - and is not affected.

**The preflight's inclusion and exclusion rules overlap and the boundary is
undefined.** `unreachable-success-preflight.md` step 2 tells the implementer to
flag "an environment-dependent check whose environment is absent" as
can-never-verify; step 3 tells them to exclude "checks whose verifiability is only
determined at runtime". Most environment-dependent checks are both. The whole value
of the preflight sits on where that line falls - too inclusive and it cries wolf
(which step 3 correctly says trains operators to ignore it), too exclusive and it
never fires. The document gives a principle for choosing (prefer a false negative)
but no test. The neighbouring `verifier-coverage-review-agenda` technique depends
on this exclusion being drawn right, and its own recorded evidence shows the cost
of drawing it: the perceptual gate excluded here returned zero verdicts in 77 of 77
deciding iterations without anything noticing.

**The A/B label overstates what a re-derivation proves.** The verifier-coverage
application carries `applied: experiment`, `ab_verdict: better`, `proof: ab-paired`.
I checked its arithmetic and every figure is right: 58+19+7+8 = 92 deciding
iterations, 179+55+43+46 = 323 passing features, 58+19 = 77 iterations under a
configured gate, 179+55 = 234 features in those runs, 31+19 = 50 perceptual by
name. But both arms are deterministic re-readings of the same four fixed recorded
runs, and arm B is pinned at zero by construction, because the gate returned no
verdict anywhere. There is no variance, no intervention and nothing repeated; the
result is a structural fact, which the prose says plainly and better than the
frontmatter does ("the structural fact is stronger than the count"). `proof:
ab-paired` implies a paired trial. This is a re-derivation over fixed records, and
labelling it as an experiment is the sort of claim inflation the rest of the
subject exists to stop.

What I checked and found sound: the tri-state routing (pass / fail / unverifiable)
is consistent across the golden path, the technique and the application; the
exact-normalised-key matching rule with no fuzzy and no force-pass fallback is the
strongest single rule in the subject and is stated identically in all three places;
the gapped-status counting rules are consistent with the application's own loop
(`completed-with-gaps` skipped in the numerator, retained in the denominator); the
drain-not-kill argument from cost-arrives-in-the-closing-envelope is correct and
correctly generalised beyond model calls.

All four applications remain `reverify`. They cite a PoF checkout by file and line,
one of them at commit `c0f640c2`, `verified_on` 2026-08-20 and 2026-08-30; no
checkout was made, no harness run, no recorded run re-read, no gate executed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/unattended-build-loop",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:56104d94acef6086",
  "disposition": "clarify",
  "coverage": "All 12 owned documents read in full at 44c89965. Every table and count in the verifier-coverage A/B re-added by hand; the N-1 overshoot bound re-derived under both the reserved and unreserved regimes. One literature check on the self-reported-versus-verified completion gap. Explicitly NOT evaluated: any PoF checkout, the four recorded harness runs, any gate, any orchestrator execution, or the papers behind the completion-gap figures beyond search-level summaries.",
  "counterexamples": [
    "With the reservation term in place the residual overshoot is the summed estimate error across drained items, not the pool width in launches - a single badly-underestimated session can exceed one launch's worth while the pool width bound says it cannot.",
    "Per-item revert of an isolated item's own paths is a fourth option the rollback technique's own when-not-to-use section offers, immediately after asserting there is no fourth option.",
    "An environment-dependent check with an absent environment satisfies both the preflight's can-never-verify test (step 2) and its runtime-determined exclusion (step 3); the document gives no rule for which wins.",
    "Both arms of the verifier-coverage A/B are deterministic functions of four fixed recorded runs and arm B is zero by construction, so `proof: ab-paired` describes a re-derivation, not a trial.",
    "A self-reported basis is not trivially reachable: an item the producer never mentions stays unverified under either basis, so a 100% target is unreachable in a plan the producer under-reports - the preflight returns reachable without inspecting anything.",
    "The verified flag is defined against 'the session that produced it'; the documents do not say what happens when a later session for the same area fails its required gate, so an item can hold a verified flag earned under a tree that has since gone red."
  ],
  "sources": [
    {
      "url": "https://prefactor.tech/blog/silent-wins-visible-fails-agent-production-success-metrics",
      "result": "Corroborates the golden path's completion-gap claim at production scale: agents succeed about 56.6% of the time with 45-75% of failures invisible - the agent reporting success where the environment disagrees. Read at search-summary level only; the underlying dataset was not inspected and no figure was reproduced."
    },
    {
      "url": "https://arxiv.org/pdf/2606.05238",
      "result": "DeployBench: 87 of 97 agent self-stops mismatched verification, 55 of them reporting success while failing it. Supports the corpus's 'far wider where the agent grades its own output' clause. Read at search-summary level; the paper itself was not read."
    },
    {
      "url": "https://arxiv.org/html/2602.19594",
      "result": "ISO-Bench: one agent moves from 46.7% hard success to 26.7% under a stricter success metric on the same tasks - a 20-point gap matching the low end of the corpus's stated range. Establishes the size of the gap, NOT that a test suite is the grader in that comparison. Search-summary level only."
    }
  ],
  "documents": {
    "unattended-build-loop.md": {
      "disposition": "keep",
      "reason": "Its one checkable external claim (20-30 point self-reported-versus-verified gaps) is corroborated and if anything conservative, and it scopes the concurrency constraint more carefully than the technique does. It should name a source for the gap figure, but nothing in it is wrong."
    },
    "techniques/no-gate-self-certifies.md": {
      "disposition": "keep",
      "reason": "The role split, the mandatory third outcome, the uniform-application rule and the judge-by-the-reliable-signal rule are internally consistent and match both the golden path and the process application. Nothing here failed a check."
    },
    "techniques/verified-vs-self-reported-pass-rate.md": {
      "disposition": "keep",
      "reason": "Two numerators over one denominator, the named basis defaulting to verified, and the reconciliation rules (exact normalised key, no fuzzy fallback, no force-pass, silence stays silence) are the subject's strongest material and are stated identically in the application."
    },
    "techniques/completed-with-gaps-excluded-from-the-numerator.md": {
      "disposition": "keep",
      "reason": "The pessimistic-for-counting, optimistic-for-scheduling split is precise, the general form transplants, and the counting rules match the application's actual loop. The fourth-status guard ('does a consumer do anything different') is a good stop on vocabulary creep."
    },
    "techniques/budget-reservation-and-drain-not-kill.md": {
      "disposition": "clarify",
      "reason": "The closing section states the pool width IS the worst-case overshoot in launches, which is the bound for the unreserved regime the rest of the technique exists to eliminate. Under reservation the residual overshoot is estimate error, not pool width. Separate the two regimes; the drain argument is right and stays."
    },
    "techniques/rollback-to-last-green.md": {
      "disposition": "clarify",
      "reason": "'There is no fourth option' is contradicted by the document's own when-not-to-use bullet offering per-item revert for isolated items. Every other decision rule - ledger survival, one authority for the target, dirty-tree preservation - is sound and unusually concrete."
    },
    "techniques/unreachable-success-preflight.md": {
      "disposition": "clarify",
      "reason": "Step 2's can-never-verify test and step 3's runtime-determined exclusion overlap on exactly the class of check that matters, with no rule for which applies. The four-element message spec and the warn-do-not-block default are right and stay."
    },
    "techniques/verifier-coverage-review-agenda.md": {
      "disposition": "keep",
      "reason": "The rung-reached certification rule, the per-gate verdict-count line, and the refusal to fix a flaky perceptual gate by making it required are coherent and correctly cross-reference the preflight's failure mode. Its 61-area/58-iteration/179-item figures match the application exactly."
    },
    "applications/process--no-gate-self-certifies.md": {
      "disposition": "reverify",
      "reason": "Doctrine-file quotations from a PoF checkout that was not made, verified_on 2026-08-20. The commandless-gate incident and the three-state visual gate ladder are narrated, not observed here."
    },
    "applications/node--verified-vs-self-reported-pass-rate.md": {
      "disposition": "reverify",
      "reason": "File-and-line citations at verified_on 2026-08-30 with no commit pinned; the matcher's behaviour and the two-numerator loop were read as quoted source, not executed."
    },
    "applications/node--budget-reservation-and-drain-not-kill.md": {
      "disposition": "reverify",
      "reason": "Same unverified checkout. The DEFAULT_BUDGET_USD = 25 ceiling, the heal-reservation fix and the drain-pool outcome fields are quoted, not run; the 2026-08-18 incident is a narrated lead."
    },
    "applications/node--verifier-coverage-review-agenda.md": {
      "disposition": "clarify",
      "reason": "Its arithmetic is exact and its structural finding is strong, but the frontmatter claims `ab_verdict: better` with `proof: ab-paired` for two deterministic re-readings of the same four fixed records where arm B is zero by construction. The witness should say re-derivation over recorded runs. The underlying run data was not re-read here."
    }
  }
}
```
