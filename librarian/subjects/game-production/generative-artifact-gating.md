---
subject: generative-artifact-gating
domain: game-production
last_touched: 2026-10-26
touched_by: intake
dry_streak: 0
---

# generative-artifact-gating

First touch: 2026-09-01, an `/intake` run on a free-tools 3D level walkthrough
([[../../sources/2026-09-01-stefan3d-free-ai-level]]). Amended, not swept — one technique
and the golden path, no new technique and no change to the `techniques:` list.

## State

Unchanged in shape: 6 techniques, now 3 applications (a new `node` one from the connected
project). The subject was already mature and the amendment did not disturb it.

## What changed and why

The subject's origin axis had two values — generated, or deterministic stand-in — and its
`placeholder-is-not-an-asset` technique ruled that a stand-in defers because *"the
generator must run"*. That is right whenever a generator is the only producer an asset
class has, and wrong otherwise. Origin now has three values: **generated**, **constructed**,
**stand-in**, where a constructed artifact carries its producer's own evidence (algorithm,
version, parameter set, seed) and grades on its own terms.

**Found by the denial hunt, and corroborated inside this bundle rather than from the
source.** The golden path asserted that a generated asset *"is the only thing that can
carry the line forward"* — an enumeration that denied too much. What refutes it is two
doors down: `balance-validation/procedural-level-planning` ships a locally computed,
seed-reproducible, terminal artifact, and its `seed-determinism-contract` is the
evidence-of-work record that a generation history is for a generated one. Two subjects of
one bundle disagreeing about whether deterministic output can be finished work is a
stronger corroboration than the source, and it cost no web fetch.

The technique already carried a *"Where the stand-in is the deliverable"* exception, which
is why this was an amendment and nearly a catch. But all three of its examples — a
fallback, a neutral default, a licence-safe substitute — are a **slot accepting a lesser
thing**, and the technique's disjointness rule (*a real asset is a served reference, a
stand-in is a locally computed value*) leaves a finished construction with no
representation at all. The gap was a third origin, not a fourth exception.

## Boundary recorded

`regeneration-vs-repair-economics` states that it *"starts after the money has been spent
once"*, and its `refuse-the-fix-that-cannot-help` enumerates three refusals, all of repairs.
Refusing the **producer** — declining to generate at all because the class has a terminal
deterministic producer — is the same failure one stage earlier and belongs here, not there.
Said in prose on this side only; the two subjects do not link.

## Consumer evidence

`pof` implements the three origins without naming them: 2 of its 13 Items steps are
generative and defer correctly when no asset stands behind them, 11 construct their
artifact locally and grade it on its own terms, and the swatch is excluded from evidence
entirely. The two-valued rule described 2 of 13 correctly; the amended rule describes 13.
A mutation probe added to that project reports 13/13 gates sensitive to their own content,
which is what makes "constructed" a fact about those eleven rather than an assertion.

## Open

- The three origins are implicit in `pof` — a consequence of which step frame a step lives
  in, not a declared property of the asset class. The technique asks for a declaration and
  no connected tree has one. Worth a return when a project grows an explicit producer
  declaration, or when a fourteenth step lands in the wrong frame and nothing reports it.
- The golden path's five-state section is introduced as "Five states, not two", lists five,
  and then refers to "the four-state shape". Pre-existing, left alone as out of scope for
  this run; a sweep should fix the sentence, not the list.

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/generative-artifact-gating",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:cb53ef82acb00067",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "Automatic selection does not prove that a human never viewed an artifact, and missing provenance does not prove a human chose it. Record selection and approval as separate identity-bound events.",
    "A supported synthetic reference can be legitimate when its origin and role are explicit. Bind fetched evidence to actual bytes; a URL or description alone does not establish current visual evidence.",
    "Some paid stages intentionally repair defects. Gate requirements should follow the stage contract and expected costs, including false rejection and evaluation cost; an input pass does not establish output quality."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/content-pipeline/generative-artifact-gating/generative-artifact-gating.md",
      "scope": "Owned golden path, every technique and every application read as primary local review evidence. Document decisions identify internal contradictions and explicit counterexamples. Historical external implementation and mutable provider claims remain unverified; no new witness is asserted."
    }
  ],
  "documents": {
    "generative-artifact-gating.md": {
      "disposition": "reverify",
      "reason": "Reverify finite mutation coverage as a universal guarantee, the exhaustiveness of three origins and the assumption that every paid stage only amplifies defects. Prior librarian notes describe bounded historical probes, not current runtime witnesses."
    },
    "techniques/auto-picked-vs-human-chosen-provenance.md": {
      "disposition": "reverify",
      "reason": "Automatic selection does not prove that a human never viewed an artifact, and missing provenance does not prove a human chose it. Record selection and approval as separate identity-bound events."
    },
    "techniques/cite-evidence-not-descriptions.md": {
      "disposition": "reverify",
      "reason": "A supported synthetic reference can be legitimate when its origin and role are explicit. Bind fetched evidence to actual bytes; a URL or description alone does not establish current visual evidence."
    },
    "techniques/gate-before-every-credit-spend.md": {
      "disposition": "reverify",
      "reason": "Some paid stages intentionally repair defects. Gate requirements should follow the stage contract and expected costs, including false rejection and evaluation cost; an input pass does not establish output quality."
    },
    "techniques/generation-history-as-artifact.md": {
      "disposition": "reverify",
      "reason": "Preserve stable candidate identities and digests through reordering. Retained selected evidence may support selected-output review while evicted alternatives prevent full replay; attempts and failed costs still need accounting."
    },
    "techniques/grade-the-selected-candidate.md": {
      "disposition": "reverify",
      "reason": "Validate finite integral indices and identity mappings, or use stable candidate IDs. A persisted pointer does not establish artifact availability, and a selected-candidate pass establishes only the checked criteria."
    },
    "techniques/placeholder-is-not-an-asset.md": {
      "disposition": "reverify",
      "reason": "Finite successful mutation probes do not prove sensitivity to every possible change or every nested leaf. Constructed terminal assets are valid under their contract; absent provenance is not proof of placeholder origin."
    },
    "applications/node--grade-the-selected-candidate.md": {
      "disposition": "reverify",
      "reason": "The historical candidate implementation was not rerun. Accepting a candidate URL does not verify fetched bytes or generation; synthetic timestamps must not become asserted historical evidence. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--placeholder-is-not-an-asset.md": {
      "disposition": "reverify",
      "reason": "The historical 13-case mutation result was not rerun. Preserve it as finite sensitivity evidence, not proof of semantic correctness or exhaustive gate coverage. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--gate-before-every-credit-spend.md": {
      "disposition": "reverify",
      "reason": "The historical paid-provider workflow and cost figures were not rerun or refreshed. Packaging exemptions and produced pixels do not satisfy all release requirements. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```

## 2026-10-26 - intake bp-vr-fid-sprint

[[../../sources/2026-10-26-bp-vr-fidelity-sprint]] added `declare-the-producer-per-asset-class`, the procedure for the
per-class declaration the golden path names in "Deterministic is not a synonym for unfinished". It carries a process
application against bp: a paired trial of a commercial image-to-3D service (18 calls, 695 credits, 2026-10-25).
- Verdict: not-better as a replacement.
- Declaration written: generate small props read close up; script frame, rooms and paper.

Open: the generated-furniture-at-scripted-heights arm is untested.

## Architecture review - 2026-10-31

Stale since the 2026-09-10 record: four techniques (`acquired-is-not-generated`,
`reserve-before-dispatch-stop-latch`, `generator-failure-deterministic-gates`,
`declare-the-producer-per-asset-class`) and two applications landed after it. Read all 15
owned documents at the current bytes.

**Retracted.** The 2026-09-10 record marked every document `reverify`, on grounds most
documents already answer. `cite-evidence-not-descriptions` was told a synthetic reference
can be legitimate when its origin is explicit; its own "where the target genuinely is the
correction" exception carries declared authorities, and its rule is about artifacts invented
to be cited. `auto-picked-vs-human-chosen-provenance` was told that automatic selection does
not prove nobody looked; the technique records the kind of selection, and its "as an
approval record" exclusion says exactly that viewing and sign-off are other records. Those
are withdrawn. For applications, not reopening a private consumer tree stays `reverify`
under docs/semantic-review.md, and it is a limit of this review, not a content defect.

**Findings.** Six, all small, five internal and one from a primary source.

1. The golden path lists five states under "Five states, not two" and then says "The
   four-state shape" (owed since the 2026-09-01 intake note).
2. The golden path and `gate-before-every-credit-spend` say "no later stage repairs a bad
   source" / "No later stage repairs a bad input", while the same golden path's "What is
   next door" hands "repair in place" to a neighbour. The universal is wrong as worded;
   the argument only needs transforming stages.
3. `grade-the-selected-candidate` step 4 and `generation-history-as-artifact` still carry
   the two-valued origin ("generated, or deterministic stand-in") that the golden path and
   `placeholder-is-not-an-asset` replaced with three values plus a separate acquisition
   record.
4. `placeholder-is-not-an-asset`'s mutation probe says "scale every numeric field ...
   replace every string". The subject's own node application measured that a uniform scale
   preserves ratios and a top-level walk never reaches nested values: the first probe
   reported four insensitive steps and all four were the instrument's fault. The procedure
   should prescribe the fixed probe.
5. `reserve-before-dispatch-stop-latch` says of a 429 that "the caller cannot tell which"
   cause it is. RFC 6585 defines 429 as rate limiting only; OpenAI's error-code reference
   returns 429 for a rate limit, an exhausted credit balance and spend limits, each with
   its own code. So the status alone cannot tell, a body sometimes can, and the latch
   decision stands either way.
6. `process--declare-the-producer-per-asset-class`'s three file anchors re-read at the
   public commit it names; all three quotes are verbatim at the stated lines.

**What I could not verify.** No consumer tree of the four private applications was
opened, no generator or provider was called, and the bp credit log was not reachable.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/generative-artifact-gating",
  "date": "2026-10-31",
  "baseline": "d59c2e044",
  "digest": "sha256-b2:b031449ec8fc69c2",
  "disposition": "clarify",
  "coverage": "All 15 owned documents read in full at current bytes (golden path, 10 techniques, 5 applications). Internal consistency checked across the origin vocabulary, the five states, the repair boundary and the mutation probe against its own application. 429 semantics checked against RFC 6585 and one provider's error reference; the bp application's three anchors re-read at its stated public commit. Not evaluated: any private consumer tree, any generator or provider run, the bp credit log, and the 44/47 audit, which is recorded as a historical measurement.",
  "counterexamples": [
    "A deliberate repair stage (inpainting a known defect, a service-side retopology) does change a bad input; 'no later stage repairs' is true of faithful transforms only, and the subject's own neighbour owns repair in place.",
    "A probe that scales every number at once leaves a ratio-graded check unmoved and reports a working gate as insensitive; one leaf at a time, recursing and deleting keys, is the probe that does not indict working gates.",
    "A 429 whose body carries a cause code (credit balance exhausted versus rate limit) does tell the caller which; the latch is still right because nothing local can verify the code or clear a spent balance.",
    "An acquired asset copied into the generators' output directory passes a location-based origin rule as generated; only a declared acquisition record separates them."
  ],
  "sources": [
    {
      "url": "https://www.rfc-editor.org/rfc/rfc6585.txt",
      "result": "Section 4: 'The 429 status code indicates that the user has sent too many requests in a given amount of time (\"rate limiting\").' Defines rate limiting only."
    },
    {
      "url": "https://platform.openai.com/docs/guides/error-codes",
      "result": "Lists 429 for 'Rate limit reached for requests', 'Credit balance exhausted' (code credit_balance_exhausted), 'Organization spend limit reached' and 'Project spend limit reached'. Supports that one status covers a rate window, a spent balance and a spend ceiling, and refutes that the cause is never readable: the body names it."
    },
    {
      "url": "https://raw.githubusercontent.com/xkazm04/bp/6bc4f02/scripts/art/light-table-frame/build_frame.bpy",
      "result": "Line 6 'Procedural only: no generated input, no GPU job.' and line 11 'The glow strip and the glass keep' verbatim. build_art.bpy:121 and lookdev/tripo.mjs:17 at the same commit also verbatim. The credit log totals were not reachable."
    },
    {
      "url": "local: knowledge/game-production/content-pipeline/generative-artifact-gating",
      "result": "All owned documents read as primary evidence for findings 1-4; established nothing about the private consumer trees."
    }
  ],
  "documents": {
    "generative-artifact-gating.md": {
      "disposition": "clarify",
      "reason": "'The four-state shape' follows a list of five states under 'Five states, not two'; make it five. 'No later stage repairs a bad source' contradicts its own 'What is next door', which names repair in place; scope it to transforming stages. The existence-check argument, the three origins, the acquisition rule and the two newer joints read clean."
    },
    "techniques/placeholder-is-not-an-asset.md": {
      "disposition": "clarify",
      "reason": "The mutation probe's step 2 prescribes the uniform mutation the subject's own node application found under-reports sensitivity (ratio-preserving scale, top-level-only walk). State one leaf at a time, recursing, deleting keys as well as perturbing them. The verdict table and the three origins are correct."
    },
    "techniques/acquired-is-not-generated.md": {
      "disposition": "keep",
      "reason": "Read the acquisition record before the served-reference rule, never default the licence, declare rather than infer from location, and the limits (an undeclared download still passes) are each stated with their reason."
    },
    "techniques/grade-the-selected-candidate.md": {
      "disposition": "clarify",
      "reason": "Step 4 classifies origin as 'Generated, or deterministic stand-in', the two-valued rule the golden path replaced; a constructed artifact would defer and an acquired one would be read as generated. Name three origins and the acquisition record first."
    },
    "techniques/generation-history-as-artifact.md": {
      "disposition": "clarify",
      "reason": "The per-candidate origin is 'generated, or deterministic stand-in'; carry the three values and say an acquisition is its own record. Single-source rule, retention cap and the selection exemption are sound."
    },
    "techniques/auto-picked-vs-human-chosen-provenance.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. Four values with unrecorded kept distinct, no back-filling, promotion only on an explicit act, and provenance excluded from approval and identity; the objection is answered in the document."
    },
    "techniques/gate-before-every-credit-spend.md": {
      "disposition": "clarify",
      "reason": "'No later stage repairs a bad input' is a universal the corpus itself contradicts (repair in place is a neighbour's decision); scope to transforming stages. The arithmetic and placement rules are sound."
    },
    "techniques/cite-evidence-not-descriptions.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. Fetchable citations only, no evidence section when nothing real exists, axis not value, and the class-level copy argument with its 0 of 344 and nine-block figures agree with the application."
    },
    "techniques/reserve-before-dispatch-stop-latch.md": {
      "disposition": "clarify",
      "reason": "'the caller cannot tell which' overstates: OpenAI returns 429 for rate limits, exhausted credit and spend limits with distinct codes. The status alone cannot tell; the latch decision is unchanged. The rest (reserve under a cross-process lock, slot-keyed attempt cap, charge the uncertain, proof bound to a hash) is sound."
    },
    "techniques/generator-failure-deterministic-gates.md": {
      "disposition": "keep",
      "reason": "Raw-margin-before-trim, covariance principal axis with its stated blind spots, autocorrelation via the power spectrum normalised at zero shift with a masked neighbourhood, reject-never-accept for model graders, fail-closed schema and family counting are all correct and match the process application."
    },
    "techniques/declare-the-producer-per-asset-class.md": {
      "disposition": "keep",
      "reason": "Four ordered questions, a viewing-distance check and a paired trial; its figures (18 calls, about 7 units, 808 to 879 triangles, 0.75 against 0.95 m) agree with the process application's 695 credits at one cent each."
    },
    "applications/node--grade-the-selected-candidate.md": {
      "disposition": "reverify",
      "reason": "Internally consistent: six conditions over the five states, L4 deferrals, structural disjointness and a fixed stub timestamp. The private tree was not reopened; verified_on 2026-08-30 stands."
    },
    "applications/node--placeholder-is-not-an-asset.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (2 of 13 against 13 of 13; the two probe faults are recorded honestly) and the source of finding 4. The private tree and its probe were not re-run; verified_on 2026-09-01 stands."
    },
    "applications/process--declare-the-producer-per-asset-class.md": {
      "disposition": "keep",
      "reason": "All three cited anchors re-read verbatim at bp 6bc4f02 (build_frame.bpy:6 and :11, build_art.bpy:121, tripo.mjs:17). The verdict is held to its floor and records the incumbent's own defect. The credit log totals were not reachable and are recorded as the trial's own numbers."
    },
    "applications/process--gate-before-every-credit-spend.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the techniques it cites; the private catalog and canon were not reopened; verified_on 2026-08-20 stands."
    },
    "applications/process--generator-failure-deterministic-gates.md": {
      "disposition": "reverify",
      "reason": "States its own deviations (family independence in prose, kerb exemption in code, no human-labelled set) and corrects its own anchors. The private art worktree was not reopened; verified_on 2026-10-01 stands."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied all six clarify items of the record above. The four private applications keep
`reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/generative-artifact-gating",
  "date": "2026-10-31",
  "baseline": "d59c2e044",
  "digest": "sha256-b2:7b14b4d63bfcd568",
  "disposition": "reverify",
  "coverage": "Second record after applying every clarify item of the first 2026-10-31 record: the edited passages were re-read and the arithmetic and sources are those quoted in the first record. Unedited documents keep their dispositions. No private consumer tree, generator or provider was reopened and no verified_on was moved.",
  "counterexamples": [
    "A deliberate repair stage (inpainting a known defect, a service-side retopology) does change a bad input; 'no later stage repairs' is true of faithful transforms only, and the subject's own neighbour owns repair in place.",
    "A probe that scales every number at once leaves a ratio-graded check unmoved and reports a working gate as insensitive; one leaf at a time, recursing and deleting keys, is the probe that does not indict working gates.",
    "A 429 whose body carries a cause code (credit balance exhausted versus rate limit) does tell the caller which; the latch is still right because nothing local can verify the code or clear a spent balance.",
    "An acquired asset copied into the generators' output directory passes a location-based origin rule as generated; only a declared acquisition record separates them."
  ],
  "sources": [
    {
      "url": "https://www.rfc-editor.org/rfc/rfc6585.txt",
      "result": "Section 4: 'The 429 status code indicates that the user has sent too many requests in a given amount of time (\"rate limiting\").' Defines rate limiting only."
    },
    {
      "url": "https://platform.openai.com/docs/guides/error-codes",
      "result": "Lists 429 for 'Rate limit reached for requests', 'Credit balance exhausted' (code credit_balance_exhausted), 'Organization spend limit reached' and 'Project spend limit reached'. Supports that one status covers a rate window, a spent balance and a spend ceiling, and refutes that the cause is never readable: the body names it."
    },
    {
      "url": "https://raw.githubusercontent.com/xkazm04/bp/6bc4f02/scripts/art/light-table-frame/build_frame.bpy",
      "result": "Line 6 'Procedural only: no generated input, no GPU job.' and line 11 'The glow strip and the glass keep' verbatim. build_art.bpy:121 and lookdev/tripo.mjs:17 at the same commit also verbatim. The credit log totals were not reachable."
    },
    {
      "url": "local: knowledge/game-production/content-pipeline/generative-artifact-gating",
      "result": "All owned documents read as primary evidence for findings 1-4; established nothing about the private consumer trees."
    }
  ],
  "documents": {
    "generative-artifact-gating.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"The four-state shape\" now reads \"The five-state shape\"; \"no later stage repairs a bad source\" now reads \"no later transforming stage repairs a bad source\", adding that a stage built to repair is a separately priced decision, not a reason to skip the gate."
    },
    "techniques/placeholder-is-not-an-asset.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: probe step 2 now mutates one leaf at a time (scale, replace, delete a key, re-point a selection), recurses into nested objects, and states why the uniform and top-level shortcuts report working gates as insensitive."
    },
    "techniques/acquired-is-not-generated.md": {
      "disposition": "keep",
      "reason": "Read the acquisition record before the served-reference rule, never default the licence, declare rather than infer from location, and the limits (an undeclared download still passes) are each stated with their reason."
    },
    "techniques/grade-the-selected-candidate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: step 4 now reads any acquisition record first, then classifies generated, constructed or stand-in, and grades a constructed artifact on its class terms."
    },
    "techniques/generation-history-as-artifact.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Origin is now generated, constructed or deterministic stand-in, with an acquired asset carrying its own acquisition record."
    },
    "techniques/auto-picked-vs-human-chosen-provenance.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. Four values with unrecorded kept distinct, no back-filling, promotion only on an explicit act, and provenance excluded from approval and identity; the objection is answered in the document."
    },
    "techniques/gate-before-every-credit-spend.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"No later stage repairs a bad input\" now reads \"No later transforming stage\", and names a repair stage as a separate priced decision owned by the repair-economics neighbour."
    },
    "techniques/cite-evidence-not-descriptions.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. Fetchable citations only, no evidence section when nothing real exists, axis not value, and the class-level copy argument with its 0 of 344 and nine-block figures agree with the application."
    },
    "techniques/reserve-before-dispatch-stop-latch.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"the caller cannot tell which\" now reads \"the status alone does not say which\", adding that a body code is the provider word and nothing local can confirm it; \"an unanswerable question\" became \"a question the line cannot settle\"."
    },
    "techniques/generator-failure-deterministic-gates.md": {
      "disposition": "keep",
      "reason": "Raw-margin-before-trim, covariance principal axis with its stated blind spots, autocorrelation via the power spectrum normalised at zero shift with a masked neighbourhood, reject-never-accept for model graders, fail-closed schema and family counting are all correct and match the process application."
    },
    "techniques/declare-the-producer-per-asset-class.md": {
      "disposition": "keep",
      "reason": "Four ordered questions, a viewing-distance check and a paired trial; its figures (18 calls, about 7 units, 808 to 879 triangles, 0.75 against 0.95 m) agree with the process application's 695 credits at one cent each."
    },
    "applications/node--grade-the-selected-candidate.md": {
      "disposition": "reverify",
      "reason": "Internally consistent: six conditions over the five states, L4 deferrals, structural disjointness and a fixed stub timestamp. The private tree was not reopened; verified_on 2026-08-30 stands."
    },
    "applications/node--placeholder-is-not-an-asset.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (2 of 13 against 13 of 13; the two probe faults are recorded honestly) and the source of finding 4. The private tree and its probe were not re-run; verified_on 2026-09-01 stands."
    },
    "applications/process--declare-the-producer-per-asset-class.md": {
      "disposition": "keep",
      "reason": "All three cited anchors re-read verbatim at bp 6bc4f02 (build_frame.bpy:6 and :11, build_art.bpy:121, tripo.mjs:17). The verdict is held to its floor and records the incumbent's own defect. The credit log totals were not reachable and are recorded as the trial's own numbers."
    },
    "applications/process--gate-before-every-credit-spend.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the techniques it cites; the private catalog and canon were not reopened; verified_on 2026-08-20 stands."
    },
    "applications/process--generator-failure-deterministic-gates.md": {
      "disposition": "reverify",
      "reason": "States its own deviations (family independence in prose, kerb exemption in code, no human-labelled set) and corrects its own anchors. The private art worktree was not reopened; verified_on 2026-10-01 stands."
    }
  }
}
```
