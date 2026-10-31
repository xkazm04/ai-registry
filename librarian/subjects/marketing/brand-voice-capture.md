---
subject: brand-voice-capture
domain: marketing
last_touched: 2026-09-09
touched_by: intake-marketing-0909 (forge wave)
dry_streak: 0
---

# brand-voice-capture

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `content-production`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** turning a business's past messages into a voice a model can follow, deciding whether a voice is trained enough to use unsupervised, choosing which voice a given surface should speak in, feeding human rejections and edits back into the next draft

**Techniques (6):** distil-only-what-samples-show-else-ask, editorial-voice-vs-personal-voice-split, rejections-and-edits-become-constraints, tenant-never-speaks-the-sample-persona, voice-maturity-and-retrain-triggers, voice-profile-dimensions.

**Applications (2; stacks: node):** node--editorial-voice-vs-personal-voice-split, node--voice-maturity-and-retrain-triggers.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.
- 2026-09-23 (intake `YuOSyRj3sXg`, [[2026-09-23-thirty-million-writer-ai-slop]]): `rejections-and-edits-become-constraints` corrected. A size threshold wrote off every edit under a quarter of the words as a typo, and a first-party ghostwriting account locates the voice in exactly those edits. The technique now classifies changed stretches by kind and banks small voice edits as their spans. Applied `code`/`better` in systedo-case (`e1ec5d46`): voice corrections banked 0/11 -> 10/11, typo and price edits 0/9 held. It converges with the media bundle's narration-voice subject, which already learns from every accepted-versus-generated delta. Both bundles now agree, so there is no boundary to state across them.
- Untriaged from the same note, homed here: a stance ledger (which contested claims the business holds) and signature lines stored verbatim (the "examples are new sentences" rule inverts for an owner's chosen line).

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- `librarian/applied.md` rows: `rejections-and-edits-become-constraints` (2026-09-23, better). The
  unapplied backlog is every other technique here without a row.

## Architecture review 2026-10-31

First review. Note: the header above lists two applications; the subject now carries six (one per technique). Three clarify items, all internal or primary-source verified, applied in the same pass and re-recorded below. Owed beyond this review: the single-stack debt above stands.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/brand-voice-capture",
  "date": "2026-10-31",
  "baseline": "2735ff63c",
  "digest": "sha256-b2:b342c84ba777f10a",
  "disposition": "clarify",
  "trigger": "Pending: no architecture-review record since the 2026-09-09 forge.",
  "intended_benefit": "A voice a model can follow, built only from evidence, with a reachable maturity state, a per-surface split and a correction loop that keeps small voice edits.",
  "failure_if_ignored": "Generic tone-word output, invented personalities, seeded personas speaking for real tenants, and voice corrections discarded as typos.",
  "boundary": "Owns the voice profile and its lifecycle; facts belong to grounded-marketing-generation, platform register to channel-native-social-and-repurposing, reply autonomy to speed-to-lead-and-assisted-reply, narration voice to the media bundle.",
  "coverage": "All 13 documents read in full (golden path, 6 techniques, 6 applications). Primary-source checks: LIFEBench abstract, the provider prompt-caching documentation, and the intake source note's transcript quotes. Private consumer trees not reopened; no application verified_on moved.",
  "counterexamples": [
    "A solo consultant whose site is deliberately first-person: every surface is personal, and the editorial context is a fact block inside the personal voice.",
    "A register change spelled like a typo (Czech colloquial elision) classifies as a typo under the near-spelling test.",
    "An explicit short length instruction is followed reasonably by most models (LIFEBench); the length habit field earns its place against the unstated default, not against an inability to follow length.",
    "A product with ten-word replies: one swapped word clears a quarter, so a size threshold would already bank voice edits there."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2505.16234",
      "result": "LIFEBench abstract: 'most models reasonably follow short-length instructions but deteriorate sharply beyond a certain threshold.' Refutes the golden path's unscoped superlative about length; supports keeping the length field as an explicit instruction."
    },
    {
      "url": "https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching",
      "result": "'Cache prefixes are created in the following order: tools, system, then messages'; 'Changes at each level invalidate that level and all subsequent levels.' Supports appending per-business voice to the user turn, an independent reason beside the evaluation-fingerprint one."
    },
    {
      "url": "https://www.youtube.com/watch?v=YuOSyRj3sXg",
      "result": "Read via the intake source note's timestamped quotes ([00:55:30] 'I changed 1% of it', [00:56:22] 'trade that one adjective for a different adjective'), not re-watched. Supports the kind-not-magnitude edit rule; the 'hundreds of clients' description of the writer was not independently confirmed."
    },
    {
      "source": "Consumer applications",
      "result": "Dated A/B and structural reports retained as written; private trees not re-executed or reopened."
    }
  ],
  "documents": {
    "brand-voice-capture.md": {
      "disposition": "clarify",
      "reason": "Length-habit sentence states an unsourced superlative ('the dimension a model gets wrong most reliably'); LIFEBench reports most models reasonably follow short explicit length instructions, so the failure is the unstated length, not length as such. Correction-loop paragraph lists discarded kinds as typo/case/diacritic/number and omits punctuation, which the technique's cosmetic class folds. Rest (scope boundaries, profile shape, maturity, split, sample-persona) is consistent with the techniques."
    },
    "techniques/voice-profile-dimensions.md": {
      "disposition": "keep",
      "reason": "Field table, caps and the user-turn placement are coherent and labelled as convention where they are. User-turn placement has a second, vendor-documented support the text does not need to state: provider prompt caches are prefix hashes over tools then system then messages, so per-business content belongs after the static prefix."
    },
    "techniques/distil-only-what-samples-show-else-ask.md": {
      "disposition": "clarify",
      "reason": "Internal inconsistency: the opening rule says untraceable dimensions are never filled from the type of business, while the no-material branch prescribes directives derived cautiously from the business type. The branch is sound (its application confirms the tree's prompt does this and drops constraints and examples at normalisation) but must be named as the one bounded exception, not left contradicting the rule."
    },
    "techniques/voice-maturity-and-retrain-triggers.md": {
      "disposition": "keep",
      "reason": "Three states plus stale, count-not-calendar trigger, nudge-not-penalty and unknown-is-partial are coherent and every threshold is labelled convention; the maturity application confirms each predicate."
    },
    "techniques/editorial-voice-vs-personal-voice-split.md": {
      "disposition": "keep",
      "reason": "Surface test, scope mapping and server-side disclosure are coherent and match the router application; the solo-consultant counterexample bounds it."
    },
    "techniques/rejections-and-edits-become-constraints.md": {
      "disposition": "keep",
      "reason": "Kind-not-magnitude classification is supported by the first-party anecdote in the intake source note ('I changed 1% of it', 'trade that one adjective'); arithmetic checks (quarter of fifty words is thirteen; one to eight changed words) agree with the 22-fixture application; the register-spelled-like-a-typo blind spot is disclosed."
    },
    "techniques/tenant-never-speaks-the-sample-persona.md": {
      "disposition": "keep",
      "reason": "Injection seam and seed-carries-no-evidence rules are coherent; the readiness-scoring decision rule matches the application's measured fix."
    },
    "applications/node--voice-profile-dimensions.md": {
      "disposition": "keep",
      "reason": "Dated A/B with disclosed deviation (twenty-character floor below the forty-character convention) and an honest not-measured section; private tree not reopened, verified_on unchanged."
    },
    "applications/node--distil-only-what-samples-show-else-ask.md": {
      "disposition": "keep",
      "reason": "Six-case A/B (A 3/6, B 6/6) internally consistent; prompt-versus-code distinction is the upward lesson; private tree not reopened."
    },
    "applications/node--voice-maturity-and-retrain-triggers.md": {
      "disposition": "keep",
      "reason": "Pinned to a full commit hash; line references are commit-scoped (the later distil application notes they moved by five lines after its commit, which does not invalidate a pinned citation). Private tree not reopened."
    },
    "applications/node--editorial-voice-vs-personal-voice-split.md": {
      "disposition": "keep",
      "reason": "Pinned commit, quoted comments support each decision rule, the missing editorial style profile is recorded as a deviation; private tree not reopened."
    },
    "applications/node--tenant-never-speaks-the-sample-persona.md": {
      "disposition": "clarify",
      "reason": "Arithmetic phrasing error: 'two sixths of a milestone each came from the seed'. With six milestones weighted 1/0.5/0, the seed earned half a milestone on voice and half on guardrails, one sixth of the score together (33 to 17); the channels milestone supplies the other sixth, as the not-measured section says."
    },
    "applications/node--rejections-and-edits-become-constraints.md": {
      "disposition": "keep",
      "reason": "Fixture counts sum (11+7+2+2=22; floor 0/9), threshold arithmetic (12 or 13 words on 46/51-word replies) checks out, and construction bias is disclosed with a return condition."
    }
  }
}
```

Re-recorded after applying the three clarify items above (golden-path length sentence and cosmetic kinds, distil no-material exception, tenant application arithmetic).

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/brand-voice-capture",
  "date": "2026-10-31",
  "baseline": "2735ff63c",
  "digest": "sha256-b2:8c2f4b19d0774b0a",
  "disposition": "keep",
  "trigger": "Re-record after applying this run's three clarify items.",
  "intended_benefit": "A voice a model can follow, built only from evidence, with a reachable maturity state, a per-surface split and a correction loop that keeps small voice edits.",
  "failure_if_ignored": "Generic tone-word output, invented personalities, seeded personas speaking for real tenants, and voice corrections discarded as typos.",
  "boundary": "Owns the voice profile and its lifecycle; facts belong to grounded-marketing-generation, platform register to channel-native-social-and-repurposing, reply autonomy to speed-to-lead-and-assisted-reply, narration voice to the media bundle.",
  "coverage": "All 13 documents read in full (golden path, 6 techniques, 6 applications). Primary-source checks: LIFEBench abstract, the provider prompt-caching documentation, and the intake source note's transcript quotes. Private consumer trees not reopened; no application verified_on moved.",
  "counterexamples": [
    "A solo consultant whose site is deliberately first-person: every surface is personal, and the editorial context is a fact block inside the personal voice.",
    "A register change spelled like a typo (Czech colloquial elision) classifies as a typo under the near-spelling test.",
    "An explicit short length instruction is followed reasonably by most models (LIFEBench); the length habit field earns its place against the unstated default, not against an inability to follow length.",
    "A product with ten-word replies: one swapped word clears a quarter, so a size threshold would already bank voice edits there."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2505.16234",
      "result": "LIFEBench abstract: 'most models reasonably follow short-length instructions but deteriorate sharply beyond a certain threshold.' Refutes the golden path's unscoped superlative about length; supports keeping the length field as an explicit instruction."
    },
    {
      "url": "https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching",
      "result": "'Cache prefixes are created in the following order: tools, system, then messages'; 'Changes at each level invalidate that level and all subsequent levels.' Supports appending per-business voice to the user turn, an independent reason beside the evaluation-fingerprint one."
    },
    {
      "url": "https://www.youtube.com/watch?v=YuOSyRj3sXg",
      "result": "Read via the intake source note's timestamped quotes ([00:55:30] 'I changed 1% of it', [00:56:22] 'trade that one adjective for a different adjective'), not re-watched. Supports the kind-not-magnitude edit rule; the 'hundreds of clients' description of the writer was not independently confirmed."
    },
    {
      "source": "Consumer applications",
      "result": "Dated A/B and structural reports retained as written; private trees not re-executed or reopened."
    }
  ],
  "documents": {
    "brand-voice-capture.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: length-habit sentence scoped to the unstated length (an explicit short habit is followed, per LIFEBench); punctuation added to the discarded cosmetic kinds. Scope boundaries and profile shape unchanged."
    },
    "techniques/voice-profile-dimensions.md": {
      "disposition": "keep",
      "reason": "Field table, caps and the user-turn placement are coherent and labelled as convention where they are. User-turn placement has a second, vendor-documented support the text does not need to state: provider prompt caches are prefix hashes over tools then system then messages, so per-business content belongs after the static prefix."
    },
    "techniques/distil-only-what-samples-show-else-ask.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the no-material branch now names business-type directives as the single bounded exception to the opening rule (marked as a starting point; rules and exemplars stay empty), removing the contradiction."
    },
    "techniques/voice-maturity-and-retrain-triggers.md": {
      "disposition": "keep",
      "reason": "Three states plus stale, count-not-calendar trigger, nudge-not-penalty and unknown-is-partial are coherent and every threshold is labelled convention; the maturity application confirms each predicate."
    },
    "techniques/editorial-voice-vs-personal-voice-split.md": {
      "disposition": "keep",
      "reason": "Surface test, scope mapping and server-side disclosure are coherent and match the router application; the solo-consultant counterexample bounds it."
    },
    "techniques/rejections-and-edits-become-constraints.md": {
      "disposition": "keep",
      "reason": "Kind-not-magnitude classification is supported by the first-party anecdote in the intake source note ('I changed 1% of it', 'trade that one adjective'); arithmetic checks (quarter of fifty words is thirteen; one to eight changed words) agree with the 22-fixture application; the register-spelled-like-a-typo blind spot is disclosed."
    },
    "techniques/tenant-never-speaks-the-sample-persona.md": {
      "disposition": "keep",
      "reason": "Injection seam and seed-carries-no-evidence rules are coherent; the readiness-scoring decision rule matches the application's measured fix."
    },
    "applications/node--voice-profile-dimensions.md": {
      "disposition": "keep",
      "reason": "Dated A/B with disclosed deviation (twenty-character floor below the forty-character convention) and an honest not-measured section; private tree not reopened, verified_on unchanged."
    },
    "applications/node--distil-only-what-samples-show-else-ask.md": {
      "disposition": "keep",
      "reason": "Six-case A/B (A 3/6, B 6/6) internally consistent; prompt-versus-code distinction is the upward lesson; private tree not reopened."
    },
    "applications/node--voice-maturity-and-retrain-triggers.md": {
      "disposition": "keep",
      "reason": "Pinned to a full commit hash; line references are commit-scoped (the later distil application notes they moved by five lines after its commit, which does not invalidate a pinned citation). Private tree not reopened."
    },
    "applications/node--editorial-voice-vs-personal-voice-split.md": {
      "disposition": "keep",
      "reason": "Pinned commit, quoted comments support each decision rule, the missing editorial style profile is recorded as a deviation; private tree not reopened."
    },
    "applications/node--tenant-never-speaks-the-sample-persona.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the seed's share restated as half a milestone each on voice and guardrails, one sixth of the score together (33 to 17); verified_on unchanged (private tree not reopened)."
    },
    "applications/node--rejections-and-edits-become-constraints.md": {
      "disposition": "keep",
      "reason": "Fixture counts sum (11+7+2+2=22; floor 0/9), threshold arithmetic (12 or 13 words on 46/51-word replies) checks out, and construction bias is disclosed with a return condition."
    }
  }
}
```
