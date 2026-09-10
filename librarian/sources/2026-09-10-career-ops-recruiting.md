---
source: github:career-ops-hq/career-ops
kind: first-party-practitioner-repository
url: https://github.com/career-ops-hq/career-ops
title: Career-ops recruiting-domain intake
author: career-ops-hq contributors
words: 4326
tree_markdown_words: 392851
tree_markdown_files: 305
commit: 6ddfca5aaa1a488bd55b0c1eca80d6896f855062
extracted: 7
accepted: 3
declined: 0
leads: 2
already_covered: 2
untriaged: 0
dispatched: 0
applied: 0
shipped: 0
run_id: intake-career-ops-recruiting-20260910
siblings: 0
rescan_when: fact-check coverage or posting-status semantics change; or 8 weeks elapse (2026-11-05)
---

# Career-ops: candidate-side mechanisms against recruiting standards

Executed intake 2.8.1 with routing constrained to `knowledge/recruiting`.
A source originates a finding; it never authorizes one.

The source is a first-party practitioner repository. Its implementation and
recorded failure cases are stronger evidence than its product tour. Expected yield:
source-tree applications, bounded leads, and existing coverage; no quota for new
techniques. The prior scorecard's focus on reading overlapping neighbors was used
for grounding, provenance, and authenticity. Its marketing application backlog
falls outside this run's requested domain.

## Scope and instruments

The landing-page ingest yielded 4,326 words. A shallow clone pinned the commit
above. An instrument counted 305 markdown files containing 392,851 whitespace-
delimited words, including translations and changelog material. This is an
inventory count, **not a claim that every word was read**.

The focused sweep read architecture and data-contract material, autofill operating
guidance, current changelog entries, fact-check implementation and production
callers, posting-status code and a test fixture, the golden-set protocol and
harness, transition-history calculations and rendering, configuration examples,
archive behavior, and README positioning. Large files were inspected in relevant
sections. The second pass considered reusable instruments: the fact checker and
measurement predicates warrant applications; the provider/runtime integration
layer is outside the recruiting scope. No source code was copied into the registry.

Bundle integrity and index preflight passed. The index initially carried forward
revision fields because the sandbox blocked Git subprocess access; an unrestricted
retry completed the history check and confirmed the index current. No prior source
ledger match and no sibling claims were found. Unrelated working-tree edits existed,
including a modified catalog, and were preserved.

## Design record and routing

All anchors below refer to the pinned public source. Detailed clickable citations
live in the linked application documents.

| Decision | Forces and rejected alternative | Property bought | Anchor and stage | Corpus home |
| --- | --- | --- | --- | --- |
| Compare generated claims against source facts before export | Tailoring can embellish; generator self-attestation provides no independent check | Unsupported recognized claims can block the owner's draft for repair | `verify-cv-facts.mjs:779`, `generate-pdf.mjs:1339`; artifact export | recruiter-anchored-model-evaluation / evidence-grounded-correctness |
| Gate archetype agreement separately from score agreement | Routing classification and fit-score fidelity answer different questions; one combined success label hides the distinction | The exit message names its actual predicate | `eval-golden.mjs:233`; model evaluation | honest-measurement-presentation / headline-may-not-outrun-its-qualifier |
| Keep state and transition observations separately | Current status loses completed passages; backfilled dates are not observed dates | Dwell has a declared sample, exclusions, and timing provenance | `funnel-velocity.mjs:200,454`; funnel measurement | recruiting-funnel-metrics / stage-pass-through-and-dwell-time |
| Fall through when a public posting API is not authoritative | A public API can omit a live direct posting; treating every 404 as closure discards opportunities | Uncertainty survives until a stronger check | `liveness-api.mjs:56`, `check-liveness.mjs:94`; discovery before evaluation | No exact mechanism established; nearest requisition-lifecycle-governance owns employer-side opening and closing |

Per-system unhomed counts: document generation 0, evaluation 0, analytics 0,
posting discovery 1. Across systems there is one possible new home, with one
entry. Neither three-entry trigger fires. No forge handoff or taxonomy change.
General system/user-file separation and canonical-file storage were read as
architecture context, not proposed as new recruiting knowledge.

## Triage

Applications use the opened-tree rule in Phase 7; the upper-layer G/R/C score
does not manufacture a new technique from an implementation example. Leads use
the corroboration table. No law, golden path, or technique was changed.

| # | Candidate and stripped rule | Shape / effort / altitude | Prior art and read | G/R/C; decision |
| --- | --- | --- | --- | --- |
| 1 | Check tailored claims against the supplied facts | K application / M / dated implementation | evidence-grounded-correctness; mechanism already covered, concrete stack gap | n/a; accept application |
| 2 | Name the predicate behind an evaluation pass | K application / M / dated measurement | headline-may-not-outrun-its-qualifier; existing rule, concrete replay | n/a; accept application |
| 3 | Report completed dwell with exclusions and history | K application / M / dated implementation | stage-pass-through-and-dwell-time; existing rule with source limitations | n/a; accept structural application |
| 4 | Preserve uncertainty when a posting lookup fails | K lead / M / technique hypothesis | requisition-lifecycle-governance; partial, different actor and stage | n/a; lead, opened-source rule |
| 5 | Review the concrete application before sending | K catch / S / doctrine | every-decision-names-its-actor; human review is already a registry invariant | 0/0/1; already covered |
| 6 | Preserve the posting that informed preparation | K catch / S / technique | seal-actor-policy-version-and-decisive-inputs; snapshot concern already owned, archival scope differs | 0/0/1; already covered |
| 7 | Treat identity merging as a contract, not an alias trick | K lead / M / dated claim requiring corroboration | merge-dont-drop-on-reapplication; source workaround is not an employer-side rule | n/a; lead, opened-source rule |

For row 4, the promoting read opened requisition-lifecycle-governance: it governs
approved employer requisitions, not the inference that an external advertisement
is still actionable. This establishes a scope distinction, not corpus-wide absence.
For row 7, the reapplication technique already distinguishes identity from
submission and warns about incorrect merges. The source's autofill guidance
suggests email aliases; no vendor behavior was independently checked, so that
suggestion is not admitted as practice.

## Landings

- [Deterministic grounding before export](../../knowledge/recruiting/decision-and-fairness/scoring-and-decision/recruiter-anchored-model-evaluation/applications/node--evidence-grounded-correctness.md): production callers exist; coverage remains partial, and unsupported does not establish deception.
- [A replay pass with its actual predicate](../../knowledge/recruiting/measurement/honest-measurement-presentation/applications/node--headline-may-not-outrun-its-qualifier.md): 9/10 archetype matches, 7/10 combined rows, mean absolute score difference 0.23 over 10 scored cases. Stub replay is not live-model or hiring validity.
- [Transition history and dwell exclusions](../../knowledge/recruiting/measurement/recruiting-funnel-metrics/applications/node--stage-pass-through-and-dwell-time.md): first-entry milestone timing, same-day exclusions, and completed-only medians must retain those qualifiers.

## Leads and return conditions

**Posting liveness:** corroborate which endpoint responses establish closure,
then test active, removed, access-limited, and unavailable observations against
fixtures before proposing an external-posting verification technique. Return when
a recruiting consumer needs external posting discovery or upstream changes its
authoritative-response rules. No live posting-status claims were verified here.

**Identity aliases:** check authoritative duplicate-application behavior before
adopting any workaround. Return when an actual reapplication flow demonstrates
data loss and a vendor-supported identity-preserving remedy is available. Do not
promote an anecdotal workaround into a rule for candidate identity.

## Apply and direction boundary

The fleet bridge resolved successfully. The recruiting consumer's declared purpose
is employer-side hiring, screening, and interviews; this source is a candidate-side
job-search assistant. They are different systems rather than peers requiring a
whole-product comparison. No new managed-project capability was proposed.

This run landed only applications of existing techniques. It created no new
technique or golden-path amendment owing an application test. Source self-tests
and replay are recorded as verification, not managed-project A/B results:
`applied=0`, `shipped=0`. No connected project was changed.

## Verification and handoff

- `verify-cv-facts.mjs --self-test`: 88 passed, zero failed.
- `eval-golden.mjs --replay --model cheap-stub`: passed its archetype gate on ten synthetic fixtures.
- `funnel-velocity.mjs --self-test`: blocked before execution by missing `js-yaml`; no content verdict.
- No live model evaluation, browser autofill, PDF rendering, or external application submission ran.

The knowledge regeneration gate passed all 6 steps. The full registry gate passed
all 19 steps, including 18 executable registry tests. Review inventory completed
after a retry with Git subprocess access; it excludes untracked files by design.
The scoped whitespace check passed. PR-base version checks and report-only currency
and citation scans were not run; no skill or recipe content version changed.

The intake content and recruiting-generated changes are committed on the existing
branch. Only the recruiting hunk of the already-modified catalog is included;
unrelated catalog and working-tree edits remain with their owning work.
