---
domain: game-production
subject: acceptance-verdict-spine
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# acceptance-verdict-spine

## Architecture review - 2026-09-09

Read all ten documents. Corrected aggregate verdict semantics, required-evidence
binding, structured claim handling and explanation boundaries. Removed machine-specific
checkout roots from all three applications, which remain reverify work.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/acceptance-verdict-spine",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:ed7fbdae02f93a60",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Required checks [deferred, fail] produce aggregate fail even when the first diagnostic is deferred.",
    "A stored runner pass for artifact A cannot clear a deferred requirement for edited artifact B.",
    "A structural pass plus absent required craft judgment is incomplete acceptance.",
    "An UNGRADED reason prefix with status=pass still gets counted by status-only consumers.",
    "Identical resolver functions supplied different snapshots can disagree; an open disclosure thunk can rerun on each render.",
    "An empty dependency map or passing authoring rows do not prove integrated runtime behavior."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
      "scope": "Non-color cue requirement only; no consumer accessibility evaluation."
    }
  ],
  "documents": {
    "acceptance-verdict-spine.md": {
      "disposition": "clarify",
      "reason": "Replace total-authority-order claims with scoped deterministic resolution, complete evidence binding and failure-dominant required-check aggregation."
    },
    "techniques/three-layer-merge-order.md": {
      "disposition": "clarify",
      "reason": "Bind all evidence, preserve conflicts and make required missing judgment unmeasured rather than structural success."
    },
    "techniques/first-non-pass-reporting-in-all-of.md": {
      "disposition": "clarify",
      "reason": "Separate diagnostic ordering from aggregate truth, cover empty/not-run members and avoid copying a leaf evidence tier."
    },
    "techniques/explain-why-this-verdict.md": {
      "disposition": "clarify",
      "reason": "Require snapshot-bound full-record explanations; distinguish applied layers from deciding rules and disclosure render costs."
    },
    "techniques/gate-check-dependency-map.md": {
      "disposition": "clarify",
      "reason": "Make missing dependencies unmeasured and distinguish dependency labels from evidence of integrated behavior."
    },
    "techniques/hardcoded-pass-antipattern.md": {
      "disposition": "clarify",
      "reason": "Replace never-failed inference with scoped negative/evidence tests and distinguish direct checks from terminal aggregation."
    },
    "techniques/ungraded-marker-doctrine.md": {
      "disposition": "clarify",
      "reason": "Separate claims, verification and acceptance structurally; registration and reason prefixes do not prove execution."
    },
    "applications/node--three-layer-merge-order.md": {
      "disposition": "reverify",
      "reason": "Reverify historical overlay behavior, runner binding, required judgment and cross-surface snapshot parity."
    },
    "applications/process--hardcoded-pass-antipattern.md": {
      "disposition": "reverify",
      "reason": "Reverify incident and fallback behavior; distinguish named dependencies from integration proof."
    },
    "applications/react--explain-why-this-verdict.md": {
      "disposition": "reverify",
      "reason": "Reverify full-record parity and render cost; scope first-non-pass and accessibility claims."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

Read the golden path, all six techniques and all three applications at their reverted
bytes, then re-resolved the applications' citations against the pof checkout at HEAD
`d823bffe`. Reading only: nothing was built, no test suite was run, no verdict was
resolved by executing the code.

**The design argument is the strongest in this bundle and I keep the core intact.** The
opening move — enumerate voting, last-writer-wins, most-recent-timestamp and averaging, and
kill each with a specific failure rather than a preference — is what makes the total order
land as a conclusion instead of a taste. Determinism under replay is correctly identified as
the property being bought. The merge rule compresses to one sentence ("a later authority
acts only where it knows strictly more than the earlier one") from which both directional
guards are derived rather than asserted, which is the difference between a design and a
list of special cases. `ungraded-marker-doctrine` is correctly flagged as the most
transplantable technique here, and its four-state classification with `unknown` as a finding
rather than a resting place is the part that generalises furthest.

**Finding one: an unsupported measurement.** `ungraded-marker-doctrine` says "In one
measured case, a sixth of the persisted rows for a mature content type carried labels the
registered pipeline never declared — every one of them a producer's word taken as a
verdict." That figure is doing real rhetorical work — it is what turns "this is not a rare
edge" from an assertion into evidence — and nothing in the subject records where it came
from. No application carries it. The process application that would be its natural home
records a different, adjacent fact (that `UNSERVABLE_STEPS` is empty, which I confirmed at
HEAD: the record is literally `{}`), and says nothing about a one-sixth rate. A measured
claim with no recorded measurement is exactly the epistemic collapse this subject exists to
prevent, one level up: it is a producer's assertion of its own verification. Either cite the
count and the population, or state it as an observation without the fraction.

**Finding two: the record shape cannot carry the conflict the rule creates.**
`three-layer-merge-order` rules that when the drain's stored outcome contradicts a checker
that decided for itself, "keep the checker's verdict and treat the contradiction as a defect
to investigate — do not silently prefer either." The instruction is right and the merged
record has nowhere to put it. The golden path enumerates the record's fields — status, tier,
reason, deciding authority, judgment provenance — and none of them is a dissenting
observation. So a drain that actually ran a runtime gate and observed a failure on a unit
whose local checker returned `pass` produces a merged verdict of `pass`, with `checker` as
the deciding authority, and the contradiction survives only as something a human is told to
investigate with no field pointing at it. Compare how carefully the same subject handles the
unapplied judge verdict, which *is* carried on the record precisely so "not judged since the
last change" cannot read as "judged and passed"; the drain contradiction deserves the same
treatment and does not get it. This is the gap the react application's own appended note
gestures at when it says conflicting observations should be exposed rather than hidden.

**Finding three, structural.** All three applications now carry an appended
`## Review boundary - 2026-09-09` section inside the knowledge document — review commentary,
qualifications and in one case a WCAG citation, living in the artifact under review. It
belongs in this ledger. It also makes each document assert two epistemic states at once: the
frontmatter says verified on a date against a stack, and the appended section says the
consumer was never opened. I opened it this run, which supersedes part of that text, and I
have no mandate to edit it.

**Citations, re-resolved.** `serverVerdictOverlay` is still at `resolveStepAcceptance.ts:23`
and `verdictsForStep` still at `:93`, both exactly as cited; `resolveStepAcceptance` itself
is now at `:62` rather than the cited `:38`. `explainMembers` is still at
`explainAcceptance.ts:76` and the members symbol still at `combinators.ts:28`. In
`itemsSteps.ts` the success-theatre comment has moved to `:132`, `GATE_CHECK_DEPS` to `:134`
and `deriveGateChecks` to `:197`. `UNSERVABLE_STEPS` in `stepGradability.ts:69` is `{}` and
the four-state `Gradability` union is unchanged, so the deviation the process application
records is still live. Drift, not defect, in every case.

**Not evaluated.** No verdict was resolved by running the resolver, no explanation was
reconstructed, no gate was made to fail, and the display-only equality test the react
application leans on was not executed. The claim that every consumer funnels through one
function was checked as a set of call sites named in the document, not by tracing the
imports.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/acceptance-verdict-spine",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:a723d28e976b771c",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at their reverted bytes. Application citations re-resolved by reading pof at HEAD d823bffe: acceptance/resolveStepAcceptance.ts, acceptance/explainAcceptance.ts, acceptance/combinators.ts, acceptance/stepGradability.ts and layout-lab/steps/itemsSteps.ts. Not evaluated: no code built or run, no verdict resolved, no explanation reconstructed, no gate driven to failure, and the display-only equality test was not executed.",
  "counterexamples": [
    "A drain that actually ran a runtime gate and observed a failure on a unit whose local checker returned pass: the merge rule keeps the checker's pass and the verdict record has no field for the dissenting observation, so the contradiction the rule tells you to investigate is not carried anywhere a surface can show it.",
    "A composed check whose first member is not-measured and whose second member fails reports the not-measured member, so the unit renders as unknown while a known failure exists behind it; first-non-pass-reporting states this explicitly as the honest answer, which makes it a declared trade rather than a defect, but a gate reading only the headline status will under-report.",
    "A producer that is the authority by design — a human curator recording a judgment they are accountable for — is not an unverified claim; ungraded-marker-doctrine names this exemption, so the marker's population is not simply everything self-reported."
  ],
  "sources": [
    {"url": "file:///pof/src/lib/catalog/acceptance/resolveStepAcceptance.ts", "result": "Read at pof HEAD d823bffe. serverVerdictOverlay is at :23 and verdictsForStep at :93 as cited; resolveStepAcceptance has moved to :62 from the cited :38. Establishes that the directional guard and the shared per-step filter exist; establishes nothing about whether every consumer supplies the same verdict snapshot, which was not traced."},
    {"url": "file:///pof/src/lib/catalog/acceptance/stepGradability.ts", "result": "Read at pof HEAD. UNSERVABLE_STEPS at :69 is an empty record and the four-state Gradability union (registered / bespoke / unservable / unknown) is intact, confirming the deviation the process application records. Does not establish any population figure, and in particular supplies no evidence for the one-sixth statistic the ungraded-marker technique cites."},
    {"url": "file:///pof/src/components/layout-lab/steps/itemsSteps.ts", "result": "Read at pof HEAD. The success-theatre incident comment, GATE_CHECK_DEPS and deriveGateChecks all still exist, at :132, :134 and :197 against cited :128 and :176. Confirms the injected sibling-verdict resolver is still how the gate reads upstream verdicts. No gate was executed."}
  ],
  "documents": {
    "acceptance-verdict-spine.md": {"disposition": "clarify", "reason": "The design argument, the elimination of the four wrong answers, and the two directional constraints all hold. The verdict record it enumerates — status, tier, reason, deciding authority, judgment provenance — has no field for a drain observation that contradicts a checker which decided for itself, which the merge technique explicitly tells you to investigate. Add the slot or state that the contradiction is carried out of band."},
    "techniques/explain-why-this-verdict.md": {"disposition": "keep", "reason": "One entry per layer with input, output, whether it won and why it declined; display-only by construction rather than by reimplementation; on demand rather than per render. The declining-case note is correctly identified as the valuable half."},
    "techniques/first-non-pass-reporting-in-all-of.md": {"disposition": "keep", "reason": "Beats count, concatenation and worst-severity each on a stated ground, and the worst-severity rebuttal — that failed and not-measured are not rankable — is the one that matters. Ordering-is-authorship and naming the member that spoke are both necessary and both stated."},
    "techniques/gate-check-dependency-map.md": {"disposition": "keep", "reason": "The map as data, resolved-verdict-not-raw-data as the load-bearing rule, injection rather than a store import so the gate stays pure across runtimes, and the deferred-versus-failed distinction with the mixed-blockers tie-break stated."},
    "techniques/hardcoded-pass-antipattern.md": {"disposition": "keep", "reason": "Six disguises with the two interesting ones (the unchallenged producer claim, structural sufficiency) correctly identified as correct-looking code answering a narrower question. The one-line diagnostic and the prove-it-can-fail remediation step are both actionable, and the legitimate-constant exemption is stated."},
    "techniques/three-layer-merge-order.md": {"disposition": "clarify", "reason": "The order, the pipeline framing and the strictly-more-knowledge rule are right. The contradiction rule tells the reader to investigate a disagreement the merged result cannot express: no field on the record carries the drain's dissenting observation, unlike the unapplied judge verdict which is deliberately retained. Say where the contradiction lives."},
    "techniques/ungraded-marker-doctrine.md": {"disposition": "clarify", "reason": "The doctrine, the four states and the marker mechanics are excellent and transplantable. One sentence is an unsupported measurement: 'in one measured case, a sixth of the persisted rows for a mature content type carried labels the registered pipeline never declared' has no recorded population, count or source anywhere in the subject, and it is the sentence carrying the argument that this is not a rare edge."},
    "applications/node--three-layer-merge-order.md": {"disposition": "clarify", "reason": "The overlay guard and the shared per-step filter re-resolved exactly; resolveStepAcceptance has moved from the cited :38 to :62. The clarify is for the appended 'Review boundary - 2026-09-09' section carrying review commentary inside a knowledge document, whose central qualification (the consumer was not opened) this review supersedes."},
    "applications/process--hardcoded-pass-antipattern.md": {"disposition": "clarify", "reason": "The incident, the two-stage remediation and the three-dimension blocking rubric all re-resolved; UNSERVABLE_STEPS is still empty so its recorded deviation is live. Same clarify as its siblings: an appended review-boundary section belongs in the ledger, and the itemsSteps citations have drifted by four to twenty lines."},
    "applications/react--explain-why-this-verdict.md": {"disposition": "clarify", "reason": "explainMembers at :76 and the non-enumerable members symbol at combinators.ts:28 are both exact. Same appended-review-boundary clarify, and its own note about the openWhy conditional re-evaluating per render while open is a fair reading of the quoted code that the document above it does not reflect."}
  }
}
```

## Architecture review - 2026-10-31

Re-review at `b005a97cb`. The three clarify items owed by the 2026-09-10 record are
still in the text: the unsupported one-sixth figure, the missing dissent slot in the
golden path, and the same gap in the merge technique. I retract one inference from
that record. Its "move the review-boundary sections into the ledger" clarify on all
three applications is a corpus convention, not a defect of this subject. Both other
subjects reviewed in this run carry the same sections. Since then the subject gained
the empty-all-of rule, the unmapped-blocker rule and their react application. One
tension is new to this record. The gate ranks failure above deferred, but the all-of
composition refuses to rank them. The gate side can be reconciled from the text. The
all-of side, which the react application's boundary questions, is left for the Director.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/acceptance-verdict-spine",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:25217c1b6264a2cf",
  "disposition": "clarify",
  "coverage": "All 11 current documents read in full at baseline. The 10 carried from the 2026-09-10 record were diffed against 44c899658; two techniques gained one rule each and one react application was added. No external source was needed: every clarify here is an internal inconsistency or an unsupported figure. Not evaluated: the pof consumer (absent here), any resolver run or test. No verification date refreshed.",
  "counterexamples": [
    "A drain that ran a runtime gate and observed a failure on a unit whose local checker returned pass: the merge keeps pass and, at baseline, no record field carries the drain's dissent (retained from 2026-09-10).",
    "A gate check with one failing and one deferred blocker reports failure, while an all-of with a not-measured first member and a failing second reports not-measured; the two techniques rank the same pair differently and only the gate shows every input.",
    "A filtered member list can build an empty all-of; the new rule returns deferred rather than undefined or pass.",
    "A human curator's signed decision is a verdict, not an unverified claim (retained)."
  ],
  "sources": [
    {
      "source": "Internal reading of the subject's documents",
      "result": "The one-sixth figure in ungraded-marker-doctrine still has no count, population or source anywhere in the subject. The verdict record still has no field for a drain outcome that contradicts a checker's own decision. gate-check-dependency-map ranks a failure over a deferred blocker, while first-non-pass-reporting-in-all-of refuses to rank failed against not-measured. Reconcilable, because the gate names every blocker, but the subject never says so."
    },
    {
      "source": "pof consumer checkout",
      "result": "Not available on this machine. The 2026-09-10 re-resolution at d823bffe (line drift :38 -> :62 and others) is carried as that record's evidence and was not re-witnessed. Commit 93444e6e3's application was not re-run."
    }
  ],
  "documents": {
    "acceptance-verdict-spine.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: the enumerated verdict record has no slot for a drain outcome the merge rule declines to apply but tells the reader to investigate."
    },
    "techniques/explain-why-this-verdict.md": {
      "disposition": "keep",
      "reason": "Unchanged since keep."
    },
    "techniques/first-non-pass-reporting-in-all-of.md": {
      "disposition": "keep",
      "reason": "The empty-conjunction-defers rule (2026-10-14) is correct. The not-measured-first-then-fail case is a declared trade; the react application's review boundary asks for an aggregate failure there, and that disagreement is a design decision left owed to the Director rather than edited here."
    },
    "techniques/gate-check-dependency-map.md": {
      "disposition": "clarify",
      "reason": "The unmapped-blocker rule is sound but phrased as a fact about 'the evaluator' rather than a requirement; and 'known failure dominates an unknown' needs one sentence on why ranking is allowed here when the all-of technique forbids it."
    },
    "techniques/hardcoded-pass-antipattern.md": {
      "disposition": "keep",
      "reason": "Unchanged since keep."
    },
    "techniques/three-layer-merge-order.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: say where the drain's dissenting outcome lives; the procedure's return value omits it."
    },
    "techniques/ungraded-marker-doctrine.md": {
      "disposition": "clarify",
      "reason": "Owed since 2026-09-10: 'a sixth of the persisted rows' is an unrecorded measurement; state the observation without the fraction."
    },
    "applications/node--three-layer-merge-order.md": {
      "disposition": "reverify",
      "reason": "The 2026-09-10 clarify asked to move the appended review-boundary section into the ledger; I retract that as a per-subject defect, since the same convention runs through both sibling subjects reviewed here and changing it is corpus policy. Citations drifted per the 2026-09-10 reading; consumer not reopened this run."
    },
    "applications/process--hardcoded-pass-antipattern.md": {
      "disposition": "reverify",
      "reason": "Same retraction of the move-the-boundary clarify; UNSERVABLE_STEPS and itemsSteps citations rest on the 2026-09-10 reading, not re-checked."
    },
    "applications/react--explain-why-this-verdict.md": {
      "disposition": "reverify",
      "reason": "Same retraction; its review boundary's 'deferred-before-fail needs an aggregate failure' conflicts with first-non-pass and is carried as an owed design question. Consumer not reopened."
    },
    "applications/react--gate-check-dependency-map.md": {
      "disposition": "reverify",
      "reason": "New since 2026-09-10; internally consistent (unmapped check blocks; five of thirteen steps ungated, named). Commit and 1083 tests not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the four clarify items from the record above from the subject's own text. The
all-of not-measured-before-fail question and the four applications stay as recorded.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/acceptance-verdict-spine",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:b8bcdefc8333de86",
  "disposition": "reverify",
  "coverage": "All 11 current documents read in full at baseline. The 10 carried from the 2026-09-10 record were diffed against 44c899658; two techniques gained one rule each and one react application was added. No external source was needed: every clarify here is an internal inconsistency or an unsupported figure. Not evaluated: the pof consumer (absent here), any resolver run or test. Four documents edited after the first record and re-read; the rest byte-unchanged. No verification date refreshed.",
  "counterexamples": [
    "A drain that ran a runtime gate and observed a failure on a unit whose local checker returned pass: the merge keeps pass and, at baseline, no record field carries the drain's dissent (retained from 2026-09-10).",
    "A gate check with one failing and one deferred blocker reports failure, while an all-of with a not-measured first member and a failing second reports not-measured; the two techniques rank the same pair differently and only the gate shows every input.",
    "A filtered member list can build an empty all-of; the new rule returns deferred rather than undefined or pass.",
    "A human curator's signed decision is a verdict, not an unverified claim (retained)."
  ],
  "sources": [
    {
      "source": "Internal reading of the subject's documents",
      "result": "The one-sixth figure in ungraded-marker-doctrine still has no count, population or source anywhere in the subject. The verdict record still has no field for a drain outcome that contradicts a checker's own decision. gate-check-dependency-map ranks a failure over a deferred blocker, while first-non-pass-reporting-in-all-of refuses to rank failed against not-measured. Reconcilable, because the gate names every blocker, but the subject never says so."
    },
    {
      "source": "pof consumer checkout",
      "result": "Not available on this machine. The 2026-09-10 re-resolution at d823bffe (line drift :38 -> :62 and others) is carried as that record's evidence and was not re-witnessed. Commit 93444e6e3's application was not re-run."
    }
  ],
  "documents": {
    "acceptance-verdict-spine.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the verdict record gains a 'dissent' field carrying a later authority's stored outcome that disagreed with a status it could not override."
    },
    "techniques/explain-why-this-verdict.md": {
      "disposition": "keep",
      "reason": "Unchanged since keep."
    },
    "techniques/first-non-pass-reporting-in-all-of.md": {
      "disposition": "keep",
      "reason": "The empty-conjunction-defers rule (2026-10-14) is correct. The not-measured-first-then-fail case is a declared trade; the react application's review boundary asks for an aggregate failure there, and that disagreement is a design decision left owed to the Director rather than edited here."
    },
    "techniques/gate-check-dependency-map.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'make the evaluator enforce this'; the mixed-blockers rule now says it ranks only the headline status while every blocker stays named, which is why the gate may rank where the all-of may not."
    },
    "techniques/hardcoded-pass-antipattern.md": {
      "disposition": "keep",
      "reason": "Unchanged since keep."
    },
    "techniques/three-layer-merge-order.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 4 returns any declined dissenting outcome, and the contradiction rule carries the drain's outcome on the record as a dissent."
    },
    "techniques/ungraded-marker-doctrine.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the one-sixth figure is replaced by the observation without a fraction, plus 'count it before quoting it'."
    },
    "applications/node--three-layer-merge-order.md": {
      "disposition": "reverify",
      "reason": "The 2026-09-10 clarify asked to move the appended review-boundary section into the ledger; I retract that as a per-subject defect, since the same convention runs through both sibling subjects reviewed here and changing it is corpus policy. Citations drifted per the 2026-09-10 reading; consumer not reopened this run."
    },
    "applications/process--hardcoded-pass-antipattern.md": {
      "disposition": "reverify",
      "reason": "Same retraction of the move-the-boundary clarify; UNSERVABLE_STEPS and itemsSteps citations rest on the 2026-09-10 reading, not re-checked."
    },
    "applications/react--explain-why-this-verdict.md": {
      "disposition": "reverify",
      "reason": "Same retraction; its review boundary's 'deferred-before-fail needs an aggregate failure' conflicts with first-non-pass and is carried as an owed design question. Consumer not reopened."
    },
    "applications/react--gate-check-dependency-map.md": {
      "disposition": "reverify",
      "reason": "New since 2026-09-10; internally consistent (unmapped check blocks; five of thirteen steps ungated, named). Commit and 1083 tests not re-run."
    }
  }
}
```
