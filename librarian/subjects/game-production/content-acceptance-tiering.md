---
domain: game-production
subject: content-acceptance-tiering
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# content-acceptance-tiering

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/content-acceptance-tiering",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b52d41106145bf93",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "One passing runtime gate can coexist with two missing required gates.",
    "An empty required-result array can pass a universal predicate without any observation.",
    "A failed static check cannot be repaired by relabeling it as a deferrable runtime check."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/prov-dm/",
      "scope": "The provenance model distinguishes entities, activities and responsible agents; useful for evidence bindings, but not proof of this acceptance ladder or its runtime implementation."
    }
  ],
  "documents": {
    "content-acceptance-tiering.md": {
      "disposition": "reverify",
      "reason": "Reverify the claim that higher evidence tiers subsume lower ones and that independent evaluators guarantee clean output. Requirements must be accumulated independently."
    },
    "techniques/config-complete-vs-runtime-verified.md": {
      "disposition": "clarify",
      "reason": "Rewrote predicates around the complete independently declared requirement set, item-bound evidence, missing results, cumulative obligations and scoped release claims."
    },
    "techniques/deferred-as-honest-progress.md": {
      "disposition": "reverify",
      "reason": "Reverify failure-before-deferral aggregation and required-check accounting. Missing static prerequisites are blockers, not permission to relabel or drop obligations."
    },
    "techniques/derived-vs-toggled-acceptance.md": {
      "disposition": "reverify",
      "reason": "Reverify the blanket ban on stored verdicts against its cache exception. Bind immutable judgments to content, dependencies and evaluator policy; separate evaluator independence from correctness."
    },
    "techniques/never-fail-silently-reason-strings.md": {
      "disposition": "reverify",
      "reason": "Reverify verbatim exception reporting for sensitive data and allow informative passing evidence. Structured diagnostics need bounded, audience-appropriate redaction."
    },
    "techniques/plain-language-tier-glossary.md": {
      "disposition": "reverify",
      "reason": "Reverify the scope of done and passed labels: passing one rung is not completion of all required observations."
    },
    "techniques/tier-ladder-design.md": {
      "disposition": "reverify",
      "reason": "Reverify logical nesting. One counterexample does not prove containment, and independent or orthogonal requirements need cumulative evaluation rather than a presumed implication."
    },
    "applications/node--config-complete-vs-runtime-verified.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed config-complete-vs-runtime-verified contract. Rewrote predicates around the complete independently declared requirement set, item-bound evidence, missing results, cumulative obligations and scoped release claims."
    },
    "applications/process--tier-ladder-design.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed tier-ladder-design contract. Reverify logical nesting. One counterexample does not prove containment, and independent or orthogonal requirements need cumulative evaluation rather than a presumed implication."
    }
  }
}
```

### 2026-09-10 — re-review after the compression revert

Read all nine owned documents in full at the current bytes. The preceding 2026-09-10
record was written against rewritten documents and marked eight of nine `reverify`; most
of those reasons do not survive contact with the restored text and are retracted below.
Three findings do survive, and one of them is sharper than the prior pass made it.

**Retracted.** `derived-vs-toggled-acceptance` was marked reverify for "the blanket ban on
stored verdicts against its cache exception". The document handles that case explicitly in
its closing section: derive on write and cache with the facts' fingerprint as the key —
"that is still derivation, and the cache key is what keeps it honest". There is no
contradiction to reverify. `plain-language-tier-glossary` was marked reverify over the
scope of the words *done* and *passed*; the document is about naming rungs and statuses in
a second vocabulary generated from one source, it never claims a rung's plain name means
completion, and the objection is not about anything the document says. The two
applications were marked reverify because their historical measurements "were not rerun" —
which is a limit on the review, not a defect in the record.

**Finding 1, the golden path's nesting claim contradicts its own technique.** The golden
path says the five evidence kinds "nest", and that each kind sees failures the kinds below
it are structurally blind to. `tier-ladder-design` step 3 says the opposite for one pair:
*"Where two groups are not comparable — declared state and a recorded human choice are
genuinely orthogonal — order them by what the pipeline needs first and note the
orthogonality, because it will matter when you write the roll-up."* `tiers-of-truth` in the
neighbouring subject carries the same carve-out. A recorded human selection does not
subsume declared state and declared state does not subsume it, so the ladder is a partial
order with one incomparable pair, and the golden path asserts a total one. This matters
precisely where the technique says it will — the roll-up — because a completion percentage
computed over a ladder assumed to nest treats the two as if one implied the other.

**Finding 2, the deferral line and the deferral tag are in tension as stated.**
`deferred-as-honest-progress` states both "which rungs may defer is a property of the
ladder, fixed at design time" — low rungs may never defer, because their environment is
always present — and "a deferral is tagged by what would resolve it", so a check *composed*
at a low rung reports its deferral at the rung of the missing evidence. Those two rules
together mean a check at a never-deferrable rung can legally emit a deferral above the
deferral line, and configuration-complete will then tolerate it. The resolution is probably
that the second rule is about which rung the deferral is *filed* at rather than which
check emitted it, and the worked application relies on exactly that reading (a placeholder
swatch defers at L4 "because what is missing is a visual asset"). But the document states
the first rule as a property of rungs and the second as a property of deferrals without
reconciling them, and the gap is the same shape as the mute button the section above it
warns about — tagged upward rather than free-texted.

**Finding 3, the consumer's `verified` predicate is weaker than the technique requires.**
`config-complete-vs-runtime-verified` defines runtime-verified as configuration-complete
*and* the behavioural and perceptual rungs having run and passed **with no deferrals
remaining at those rungs**. `applications/node--config-complete-vs-runtime-verified.md`
reports the derivation as counting `gatePasses` and `gatesUndrained` over `GATE_TIERS` and
producing `testResult: 'pass'` **only when `gatePasses > 0`** — one passing gate, with no
stated condition on `gatesUndrained`. One drained gate passing while two others at the same
rung are still deferred satisfies the quoted implementation and fails the technique's
predicate. The document records four other deviations honestly and does not record this
one; either the implementation also tests `gatesUndrained === 0` and the write-up omits it,
or the deviation is real and belongs in the deviations list. Both readings need the same
one-line repair to the application.

**What I could not verify.** No consumer checkout was opened; `rollup.ts`, `lifecycle.ts`,
`acceptance/deferred.ts` and the linter test were not read, so finding 3 is a defect in the
*record* and is not yet a claim about the code. Settling it means reading
`src/lib/catalog/lifecycle.ts` at a pinned commit. The two applications' `verified_on`
dates (2026-08-30, 2026-08-20) are left untouched.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/content-acceptance-tiering",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:f195865b01191e50",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read in full at current bytes, checked against each other and against the neighbouring tiers-of-truth technique for the containment claim. Explicitly not evaluated: the consuming repo's rollup, lifecycle, acceptance and linter code; the 2026-07-22 and 2026-07-29 incidents; the 817-artifact and 44-of-47 measurements; and any current dashboard behaviour. No verification date refreshed.",
  "counterexamples": [
    "An artifact with one drained behavioural gate passing and two more still deferred at the same rung: the technique's predicate refuses it (deferrals remain at those rungs) and the derivation the application quotes accepts it (gatePasses > 0).",
    "A check composed at a static rung that cannot conclude for want of a rendered asset: 'defer at the rung of the missing evidence' files it at the perceptual rung, where deferral is legal and configuration-complete tolerates it, which is the route around the rule that low rungs may never defer.",
    "Declared state and a recorded human choice: neither subsumes the other, so the golden path's claim that the five evidence kinds nest is false for that pair, and any roll-up written on the nesting assumption is wrong about it.",
    "A selection rung satisfied by a pipeline auto-pick, as the worked application documents: the artifact reaches configuration-complete with the human rung never exercised, and neither completion predicate has a term for 'passed on a machine default'."
  ],
  "sources": [
    {
      "url": "local: knowledge/game-production/content-pipeline/content-acceptance-tiering",
      "result": "All nine documents read as primary evidence; established the three internal inconsistencies recorded above by cross-reading golden path against techniques and technique against application. Established nothing about the consuming codebase, whose behaviour the applications assert."
    },
    {
      "url": "local: knowledge/game-production/engine-integration/runtime-observation-evidence/techniques/tiers-of-truth.md",
      "result": "Read for the parallel ladder. Its decision rules carry the same orthogonality carve-out ('when two rungs cannot be ordered by containment... do not force an ordering'), which corroborates that the nesting claim is the golden path's error and not the technique's."
    }
  ],
  "documents": {
    "content-acceptance-tiering.md": {
      "disposition": "clarify",
      "reason": "Asserts that the five evidence kinds nest and that each sees what the kinds below cannot, while tier-ladder-design step 3 and the neighbouring tiers-of-truth both state that declared state and a recorded human choice are genuinely orthogonal. The ladder is a partial order with one incomparable pair; say so where the roll-up is derived. Everything else — the four statuses, the clean-run invariant, the two predicates, the rung-that-examines-nothing failure mode — reads clean and is well argued."
    },
    "techniques/config-complete-vs-runtime-verified.md": {
      "disposition": "keep",
      "reason": "The separating clause is stated precisely and its consequence (step records must carry their rung, or the predicate cannot be written correctly) is drawn out. The per-artifact observation rule and the derived evidence sentence are both specific and checkable. This document is the standard against which finding 3 is measured, and it is the half that is right."
    },
    "techniques/deferred-as-honest-progress.md": {
      "disposition": "clarify",
      "reason": "Two rules that need reconciling in the text: deferral legality is fixed per rung at design time (low rungs may never defer), and a deferral is tagged by what would resolve it (so a low-rung check may file above the line). The worked application depends on the second reading. As written, the pair leaves a legal route around the deferral line without saying it is one."
    },
    "techniques/derived-vs-toggled-acceptance.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify: the cache exception is stated in the document's own closing section, keyed on the facts' fingerprint, and is explicitly still derivation. The three rot mechanisms, the recorded-choice construction and the four-valued selection provenance (including 'unrecorded' as load-bearing) are the strongest material in the subject."
    },
    "techniques/never-fail-silently-reason-strings.md": {
      "disposition": "keep",
      "reason": "Enforcement in the shape of the result rather than in review, the per-status content of a reason, and the writer/reader-defined-together constraint on parseable deferral reasons are each argued from a stated failure. Boundary the document does not cover, noted rather than charged: a thrown message reported 'truncated but verbatim' has no redaction rule, and instrument failures can carry credentials or paths."
    },
    "techniques/plain-language-tier-glossary.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify, which objected to a claim the document does not make. The observed failure it names is abandonment rather than misreading, the four families (rungs, statuses, predicates, operations) are a real gap most glossaries have, and the single-source rule ties the plain name to the same definition the evaluator reads."
    },
    "techniques/tier-ladder-design.md": {
      "disposition": "keep",
      "reason": "Seven steps that each produce an artifact, with the mutation probe (step 6) as the only test that separates a working rung from one checking a proxy, and the orthogonality carve-out in step 3 that the golden path drops. The three/five/seven sizing is stated as derived per domain rather than as a convention to copy."
    },
    "applications/node--config-complete-vs-runtime-verified.md": {
      "disposition": "clarify",
      "reason": "Reports the verified derivation as producing a pass 'only when gatePasses > 0' while the technique requires no deferrals remaining at those rungs; gatesUndrained is counted and its role in the predicate is never stated. Either the write-up omits a condition or this is an unrecorded fifth deviation, and the document records four others honestly. Everything else — the earlyDeferred bucket as the deferral line made countable, the per-entity observation name and its 2026-07-22 incident, the single-sourced deferral reason — is precise. verified_on 2026-08-30 stands unrefreshed."
    },
    "applications/process--tier-ladder-design.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. The 'shared resource?' column deriving the deferral line rather than declaring it is the transplantable idea, the 44-of-47 mutation result is reported with the probe that produced it, and the auto-pick deviation is recorded as an interim position with the standard explicitly unchanged. verified_on 2026-08-20 stands unrefreshed; the incident dates and counts were not re-measured."
    }
  }
}
```
