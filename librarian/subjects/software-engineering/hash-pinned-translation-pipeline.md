---
subject: hash-pinned-translation-pipeline
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# hash-pinned-translation-pipeline

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

6 techniques, 2 node applications. Web-hardened before drafting. The only subject in the wave to receive a cross-worker finding relayed by the director, re-measure it independently, and publish its own number with its own method.

## Open leads (banked, with return conditions)

- **an exact identifier never passes through a generative step** (proposed law, not added). Single strong sighting: 116 opaque digests per locale routed through a translating model. Return on a second sighting — the shape recurs wherever an agent writes bookkeeping it did not compute.
- Two measurements worth re-running next sweep: 11/116 English bodies truncated by a shared extractor (9.5%), and 1,378/1,508 locale-topic pairs structurally identical (91.4%). The 130 mismatches are exactly 10 topics across 13 locales — the fingerprint of source movement, not translator variance.

## Architecture review - 2026-10-31

First architecture review, against `7b8db2118`. All nine documents read in full.
The techniques hold together: four verdicts, one action each; the pin per unit,
kept in the shipped tree; the hash scope as a written policy; and parity between
emitter and detector as necessary but not sufficient. One internal tension
remains. `emitter-detector-hash-parity` and `hash-scope-choice` ask the detector
to classify an old-format or old-scope record "as needing migration, not as
stale". `drift-classification` declares a closed vocabulary of four verdicts and
rejects a fifth. Which of the two gives way is a design decision, so it is left
owed. One source check corrected a claim in two documents: a missing translation
does not always render as source-language text. A library with no fallback
configured returns the key itself.

The arithmetic in both applications reproduces: 59 x 13 = 767; 19 x 13 = 247;
40 x 13 = 520; 116 - 97 = 19; 11/116 = 9.5%; 110/1778 = 6.2%; 116 x 13 = 1,508;
1,378/1,508 = 91.4%; 10 x 13 = 130. The consumer tree those applications cite is
not in this checkout, so their line anchors and measurements were not re-run, and
their verification dates stand. The banked lead in this note (never route an exact
identifier through a generative step) still has one sighting. That sighting is the
routing itself; nobody has observed a digest being corrupted.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/hash-pinned-translation-pipeline",
  "date": "2026-10-31",
  "baseline": "7b8db2118",
  "digest": "sha256-b2:5fb570c0ab07039a",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full: the golden path, 6 techniques and 2 node applications. Three primary sources were opened: W3C ITS 2.0 Provenance, the i18next fallback documentation and Unicode UAX #15. The application arithmetic was recomputed. Not evaluated: the consumer repository the applications cite (not present here), so no line anchor, regex or measurement was re-run. No verification date was refreshed.",
  "counterexamples": [
    "Under i18next with no fallback language configured, a missing key renders as the key string ('notExistingKey'), not as source-language prose. It is still visible, but the golden path's 'source-language fallback text' is not universal.",
    "A hash-algorithm change with an unchanged scope can be migrated without re-translating: hash current source with the old function, and where that equals the old pin, re-pin under the new function. That action is neither re-translate nor first translation, which strains the closed four-verdict set.",
    "A corpus of a few hundred units and a handful of locales, with no human polish, is cheaper to re-translate in full each release than to pin (the subject's own boundary, retained).",
    "A byte-identical shared extractor can be identically blind: 11 of 116 bodies hashed over a prefix only (retained from the parity application)."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/its20/",
      "result": "Supports the claim that interchange practice records producing and revising agents separately. Section 8.11.1 defines translation agents (person, org, tool) apart from revision agents: 'Identification of a human translation revision agent', 'Identification of a software tool that was used in revising the translation of the selected content' (revPerson/revOrg/revTool)."
    },
    {
      "url": "https://www.i18next.com/principles/fallback",
      "result": "Refutes the universal form of 'missing renders as source-language fallback text': 'If a key does not return a value the key acts as fallback', with i18next.t('notExistingKey') returning \"notExistingKey\". Missing stays visible, so the loud-versus-silent argument holds."
    },
    {
      "url": "https://unicode.org/reports/tr15/",
      "result": "Supports the declared-encoding clause in hash-scope-choice: 'Canonical equivalence is a fundamental equivalency between characters or sequences of characters'. Precomposed and combining forms (C with a combining cedilla is equivalent to the precomposed character) are different code-point sequences, so they produce different digests."
    },
    {
      "source": "Arithmetic in applications/node--drift-classification.md and applications/node--emitter-detector-hash-parity.md",
      "result": "Every derived figure reproduces from its stated parts: 767, 247, 520, 19, 9.5%, 6.2% / 94%, 1,508, 91.4%, 130, and the 247:520 ratio of about 1:2.1 behind 'roughly one part bookkeeping to two parts real work'."
    }
  ],
  "documents": {
    "hash-pinned-translation-pipeline.md": {
      "disposition": "clarify",
      "reason": "Sound framing and walls. Under i18next semantics, 'A missing translation surfaces ... as source-language fallback text' should also admit the raw key when no fallback is configured."
    },
    "techniques/drift-classification.md": {
      "disposition": "clarify",
      "reason": "The four-verdict, action-keyed vocabulary and the unpinned-as-missing sub-count are sound. It does not say where an old-format or old-scope pin goes, yet two sibling techniques require such pins to be classified apart from stale. Decide between a labelled sub-population of stale (the pattern this document already uses for unpinned-within-missing) and a deliberate fifth migration verdict. This is a design call and is left owed."
    },
    "techniques/emitter-detector-hash-parity.md": {
      "disposition": "clarify",
      "reason": "Strong: one implementation first, then a vector-tested specification, never a comment, plus the coverage clause and detector self-suspicion. 'classify an old-format record explicitly - as needing migration, not as stale' must be reconciled with drift-classification's closed set. Owed with that item."
    },
    "techniques/hash-scope-choice.md": {
      "disposition": "keep",
      "reason": "The if-and-only-if rule, the asymmetric failure directions, the unchosen prefix scope with its coverage assertion, and the composite-scope contract are sound. The encoding clause is supported by UAX #15. The 'old-scope records vs genuinely stale' wording rides on the drift-classification decision and needs no separate change."
    },
    "techniques/source-hash-provenance.md": {
      "disposition": "keep",
      "reason": "Four-field record, minted identity, in-tree placement, freshness kept apart from review state, and the pin written by tooling. The producing/revising agent split is confirmed by ITS 2.0 Provenance. 'Transcription of long opaque tokens is a known weak point' is unsourced here and has only a routing sighting, but it is framed as a hazard and the rule stands without it."
    },
    "techniques/translation-fan-out-sizing.md": {
      "disposition": "keep",
      "reason": "Separate read-only audit, a per-locale shape, billing in source volume, a zero that is distinguishable from read-nothing, and re-derive-not-remember as the resume ledger. Internally consistent with drift-classification."
    },
    "techniques/shape-sync-is-not-content-sync.md": {
      "disposition": "clarify",
      "reason": "The central claim holds. Same correction as the golden path: under i18next semantics, a missing translation renders as source-language fallback or, with no fallback configured, as the raw key. Either is visible, so the argument stands."
    },
    "applications/node--drift-classification.md": {
      "disposition": "reverify",
      "reason": "Internally consistent; every figure reproduces arithmetically. The cited consumer tree (detector line anchors, the _meta.json counts, 767 issues) is not present in this checkout and was not reopened. verified_on stays 2026-08-22."
    },
    "applications/node--emitter-detector-hash-parity.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (11/116, 110/1778, 1,378/1,508 and 10 x 13 all reproduce). The regex, the truncation measurement, the prompt line anchors and the sample digest need the consumer tree, which was not reachable here. verified_on stays 2026-08-22."
    }
  }
}
```

### Re-record after applying the sourced clarify - 2026-10-31

Applied the i18next fallback correction to the golden path and to
`shape-sync-is-not-content-sync`: a missing unit renders as source-language
fallback text or, with no fallback configured, as the raw key. The
old-format/old-scope verdict tension is a design decision and is still owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/hash-pinned-translation-pipeline",
  "date": "2026-10-31",
  "baseline": "7b8db2118",
  "digest": "sha256-b2:9bd26e1a21819879",
  "disposition": "clarify",
  "coverage": "Same reading as the preceding record. Two documents were edited, one sentence each, to apply the clarify confirmed by the i18next fallback documentation. The consumer tree is still unreachable, so no application citation was re-run and no verification date was refreshed.",
  "counterexamples": [
    "A hash-algorithm change with an unchanged scope can be migrated without re-translating: hash current source with the old function, and where that equals the old pin, re-pin under the new function. That action is neither re-translate nor first translation, which strains the closed four-verdict set.",
    "A corpus of a few hundred units and a handful of locales, with no human polish, is cheaper to re-translate in full each release than to pin.",
    "A byte-identical shared extractor can be identically blind: 11 of 116 bodies hashed over a prefix only."
  ],
  "sources": [
    {
      "url": "https://www.i18next.com/principles/fallback",
      "result": "Basis for the applied edit: 'If a key does not return a value the key acts as fallback'."
    },
    {
      "url": "https://www.w3.org/TR/its20/",
      "result": "Supports the separate producing and revising agent fields (revPerson/revOrg/revTool) in source-hash-provenance and the golden path."
    },
    {
      "url": "https://unicode.org/reports/tr15/",
      "result": "Supports the declared-encoding clause (canonical equivalence across different code-point sequences)."
    }
  ],
  "documents": {
    "hash-pinned-translation-pipeline.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: a missing translation now 'surfaces ... as source-language fallback text, or as the raw key where no fallback is configured'."
    },
    "techniques/drift-classification.md": {
      "disposition": "clarify",
      "reason": "Still owed (design call). State where an old-format or old-scope pin goes: a labelled sub-population of stale, or a deliberate fifth migration verdict. Two sibling techniques require that it be kept apart from stale."
    },
    "techniques/emitter-detector-hash-parity.md": {
      "disposition": "clarify",
      "reason": "Still owed with the drift-classification decision: reconcile 'classify an old-format record ... as needing migration, not as stale' with the closed four-verdict set."
    },
    "techniques/hash-scope-choice.md": {
      "disposition": "keep",
      "reason": "Sound; the encoding clause is supported by UAX #15. The old-scope wording follows the drift-classification decision."
    },
    "techniques/source-hash-provenance.md": {
      "disposition": "keep",
      "reason": "Sound; ITS 2.0 confirms the producing/revising agent split. The opaque-token transcription hazard is unsourced but framed as a hazard."
    },
    "techniques/translation-fan-out-sizing.md": {
      "disposition": "keep",
      "reason": "Sound and consistent with drift-classification."
    },
    "techniques/shape-sync-is-not-content-sync.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: a missing translation renders as source-language fallback 'or, where no fallback is configured, the raw key itself. Either way it is visible'."
    },
    "applications/node--drift-classification.md": {
      "disposition": "reverify",
      "reason": "Arithmetic reproduces. The consumer tree was not reachable, so anchors and measurements were not re-run. verified_on stays 2026-08-22."
    },
    "applications/node--emitter-detector-hash-parity.md": {
      "disposition": "reverify",
      "reason": "Arithmetic reproduces. The regex, the truncation measurement, the prompt anchors and the sample digest need the consumer tree. verified_on stays 2026-08-22."
    }
  }
}
```
