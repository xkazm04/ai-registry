---
subject: generative-artifact-gating
domain: game-production
last_touched: 2026-09-10
touched_by: architecture-review
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
