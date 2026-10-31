---
domain: game-production
subject: game-dialogue-voice-pipeline
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# game-dialogue-voice-pipeline

## Architecture review - 2026-10-31

First review, against `733004b51`. All nine documents read in full; relative links and
law anchors resolve. The provider claims the subject leans on hardest (own-voice clone
verification, no cloning of another person even with consent, clone fine-tuning per model,
best-effort seeds, versioned pronunciation dictionaries, neighbour-text context, a vendor
latency figure that excludes application and network time) were checked against the
vendor's own documentation and hold. Three reasoning slips were found in the techniques:
the pipelined-wait sentence in bake-versus-runtime-speech, a law citation in
localized-voice-timing-budget, and the audition-set size in re-cast-gate. The three
applications rest on a private tree that is not available here and stay reverify.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/game-dialogue-voice-pipeline",
  "date": "2026-10-31",
  "baseline": "733004b51",
  "digest": "sha256-b2:2b9fce8d0d8cbaed",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full (golden path, 5 techniques, 3 applications). Relative links and _laws.md anchors checked mechanically; all resolve. Vendor documentation opened for the clone, seed, context, dictionary and latency claims. Not evaluated: the fixed-length versus adaptive renderer-mode paragraph (no source identified), the private fleet tree at 88f1b080 behind all three applications, any runtime.",
  "counterexamples": [
    "A provider may refuse to clone another person's voice even with that person's consent, so a studio-side consent row alone does not make a clone creatable; the ledger records what was done, the provider decides what can be done.",
    "A clone type can be supported on an older generation and missing on the newer one (professional clones were announced as unsupported on a newer expressive model at its general availability), so a re-cast can end in 'cannot be judged' for reasons unrelated to quality.",
    "Pipelining text generation and synthesis sentence by sentence shortens the wait to first sound to the first clause's generation plus its first-sample latency; it is still a sum, only of smaller parts, so a slow first clause is still dead air.",
    "A pinned seed does not make a render reproducible: the vendor states determinism is not guaranteed, so a re-render under an unchanged recipe can still differ and must not be read as a recipe change.",
    "A vendor's stated ~75ms or ~100ms median is model-side and excludes application and network latency; an independent streaming benchmark reported a median near 200ms to first audio for the same model."
  ],
  "sources": [
    {
      "url": "https://elevenlabs.io/docs/product-guides/voices/voice-cloning/professional-voice-cloning",
      "result": "Supports cast-ledger-with-consent's provider-controls paragraph: 'All Professional Voice Clones require a verification process to confirm that the voice belongs to you.'; 'Even with their consent, you cannot clone someone else's voice.'; sharing is by the person creating and verifying their own clone and sharing it 'privately using a sharing link'. Partly supports the retraining claim: 'If you have an existing PVC, you now have the option to fine-tune on additional models.'"
    },
    {
      "url": "https://elevenlabs.io/docs/api-reference/text-to-speech/convert",
      "result": "Seed: 'our system will make a best effort to sample deterministically' and 'Determinism is not guaranteed.' (supports re-cast-gate step 3). previous_text/next_text 'Can be used to improve the speech's continuity when concatenating together multiple generations' (supports render-with-neighbours). Pronunciation dictionary locators carry '(id, version_id)' and 'If not provided, the latest version will be used.' (supports recording the dictionary version, not its name)."
    },
    {
      "url": "https://elevenlabs.io/docs/models",
      "result": "Flash v2.5: 'a median latency of ~100ms' with the footnote 'Median, excluding application & network latency.' The vendor's launch blog and help centre state 75ms for the same model, which supports the golden path's 'two documents from one vendor can state different numbers for the same variant'. A 'Deprecated models' section exists, supporting that identifiers are retired."
    },
    {
      "source": "Secondary: vendor general-availability email for its v3 model, quoted in community posts found by web search",
      "result": "'Streaming and Professional Voice Cloning (PVCs) are not supported on Eleven v3'. Secondary only; it corroborates, but is not the sole basis for, 'a clone type that one generation did not support may exist in the next (or the reverse)'."
    }
  ],
  "documents": {
    "game-dialogue-voice-pipeline.md": {
      "disposition": "keep",
      "reason": "Boundaries against spatial audio, graph validation and provider auditing are crisp and the links resolve. The provider-control, re-cast and latency-claim paragraphs match the vendor documentation opened this run. No product names in the text."
    },
    "techniques/bake-versus-runtime-speech.md": {
      "disposition": "clarify",
      "reason": "'The perceived wait then approaches the longer of the two stages rather than their sum' is wrong for the wait to first sound: feeding sentence by sentence makes the wait the first clause's generation time plus its first-sample latency, a sum of the first chunks rather than of the whole stages; 'the longer of the two' describes pipelined throughput, not the wait. The neighbour-context rule is confirmed by the vendor's previous_text/next_text parameters."
    },
    "techniques/cast-ledger-with-consent.md": {
      "disposition": "keep",
      "reason": "The own-voice verification, the refusal to clone another person even with consent, and sharing through the other person's own verified voice are quoted from the vendor page. The generation column is supported by per-model fine-tuning and by a clone type unsupported on a newer model (secondary). The refuse-rather-than-destroy citation is explicitly scoped to the refusal being early and visible."
    },
    "techniques/line-id-catalog-and-revision-diff.md": {
      "disposition": "keep",
      "reason": "Separate script and render revisions, graph-node identity and tombstoned ids are internally consistent with the golden path. 'Record its version, not its name' is confirmed: the vendor's dictionary locator carries a version_id and silently uses the latest when it is omitted."
    },
    "techniques/localized-voice-timing-budget.md": {
      "disposition": "clarify",
      "reason": "The decision rule that an unmeasured take reads 'not measured', never 'within budget', is law L1 (unmeasured is not a pass) but cites only L8 (grade against what ships), which is about absolute craft standards. Cite L1 for the state and keep L8 for judging the shipped locale. Adding unmeasured-is-not-a-pass to the frontmatter laws list is owed with the next index regeneration (a frontmatter change alone would drift the generated index). The fixed-length versus adaptive renderer-mode paragraph names no source and was not verified."
    },
    "techniques/re-cast-gate.md": {
      "disposition": "clarify",
      "reason": "Step 1 says twelve reference lines per voice and then requires a line in each shipped language among them, which cannot hold for a voice speaking many languages, and the twelve has no stated basis. State it as about a dozen range lines plus one per additional shipped language. Seed best-effort determinism, per-model fine-tuning and model deprecation are confirmed by vendor documentation."
    },
    "applications/node--cast-ledger-with-consent.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique (declared-but-refused speech kind, per-kind licence map with no per-voice field). Every anchor is in a private tree at 88f1b080 that is not available to this review and was not reopened; verified_on left at 2026-09-30."
    },
    "applications/node--line-id-catalog-and-revision-diff.md": {
      "disposition": "reverify",
      "reason": "The name-derived key deviation and the single-revision shortfall are coherent with the technique. Private tree at 88f1b080 not reopened."
    },
    "applications/node--localized-voice-timing-budget.md": {
      "disposition": "reverify",
      "reason": "The word cap reported as pending on an empty field and ungraded under a long-monologue profile matches the technique's word-count critique. Private tree at 88f1b080 not reopened."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items of the record above, against `50d0478a0`. Two are
reasoning corrections checked against the document itself (the pipelined wait is a sum of
first chunks; the not-measured rule is L1). The audition-set size now agrees with its own
per-language requirement. The timing technique keeps `clarify` for its frontmatter laws
list, which waits on an index regeneration. Applications were not touched and keep
`reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/game-dialogue-voice-pipeline",
  "date": "2026-10-31",
  "baseline": "50d0478a0",
  "digest": "sha256-b2:af1c719a399df4ed",
  "disposition": "reverify",
  "coverage": "All 9 documents decided. The three clarify items from the first 2026-10-31 record were applied and the edited passages re-read; the other six documents are byte-unchanged and keep their dispositions. Vendor documentation was opened this run for the re-cast and cast-ledger claims; the pipelined-wait and law-citation changes are internal-reasoning corrections. Not evaluated: the renderer-mode paragraph, the private fleet tree behind the applications, any runtime. No verification date was refreshed.",
  "counterexamples": [
    "A provider may refuse to clone another person's voice even with that person's consent, so a studio-side consent row alone does not make a clone creatable; the ledger records what was done, the provider decides what can be done.",
    "A clone type can be supported on an older generation and missing on the newer one (professional clones were announced as unsupported on a newer expressive model at its general availability), so a re-cast can end in 'cannot be judged' for reasons unrelated to quality.",
    "Pipelining text generation and synthesis sentence by sentence shortens the wait to first sound to the first clause's generation plus its first-sample latency; it is still a sum, only of smaller parts, so a slow first clause is still dead air.",
    "A pinned seed does not make a render reproducible: the vendor states determinism is not guaranteed, so a re-render under an unchanged recipe can still differ and must not be read as a recipe change.",
    "A vendor's stated ~75ms or ~100ms median is model-side and excludes application and network latency; an independent streaming benchmark reported a median near 200ms to first audio for the same model."
  ],
  "sources": [
    {
      "url": "https://elevenlabs.io/docs/product-guides/voices/voice-cloning/professional-voice-cloning",
      "result": "Supports cast-ledger-with-consent's provider-controls paragraph: 'All Professional Voice Clones require a verification process to confirm that the voice belongs to you.'; 'Even with their consent, you cannot clone someone else's voice.'; sharing is by the person creating and verifying their own clone and sharing it 'privately using a sharing link'. Partly supports the retraining claim: 'If you have an existing PVC, you now have the option to fine-tune on additional models.'"
    },
    {
      "url": "https://elevenlabs.io/docs/api-reference/text-to-speech/convert",
      "result": "Seed: 'our system will make a best effort to sample deterministically' and 'Determinism is not guaranteed.' (supports re-cast-gate step 3). previous_text/next_text 'Can be used to improve the speech's continuity when concatenating together multiple generations' (supports render-with-neighbours). Pronunciation dictionary locators carry '(id, version_id)' and 'If not provided, the latest version will be used.' (supports recording the dictionary version, not its name)."
    },
    {
      "url": "https://elevenlabs.io/docs/models",
      "result": "Flash v2.5: 'a median latency of ~100ms' with the footnote 'Median, excluding application & network latency.' The vendor's launch blog and help centre state 75ms for the same model, which supports the golden path's 'two documents from one vendor can state different numbers for the same variant'. A 'Deprecated models' section exists, supporting that identifiers are retired."
    },
    {
      "source": "Secondary: vendor general-availability email for its v3 model, quoted in community posts found by web search",
      "result": "'Streaming and Professional Voice Cloning (PVCs) are not supported on Eleven v3'. Secondary only; it corroborates, but is not the sole basis for, 'a clone type that one generation did not support may exist in the next (or the reverse)'."
    }
  ],
  "documents": {
    "game-dialogue-voice-pipeline.md": {
      "disposition": "keep",
      "reason": "Boundaries against spatial audio, graph validation and provider auditing are crisp and the links resolve. The provider-control, re-cast and latency-claim paragraphs match the vendor documentation opened this run. No product names in the text."
    },
    "techniques/bake-versus-runtime-speech.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the pipelined-wait sentence now says the wait becomes the first clause's generation time plus its first-sample latency rather than the whole reply's, and that it is still a sum of smaller parts, replacing 'approaches the longer of the two stages rather than their sum'."
    },
    "techniques/cast-ledger-with-consent.md": {
      "disposition": "keep",
      "reason": "The own-voice verification, the refusal to clone another person even with consent, and sharing through the other person's own verified voice are quoted from the vendor page. The generation column is supported by per-model fine-tuning and by a clone type unsupported on a newer model (secondary). The refuse-rather-than-destroy citation is explicitly scoped to the refusal being early and visible."
    },
    "techniques/line-id-catalog-and-revision-diff.md": {
      "disposition": "keep",
      "reason": "Separate script and render revisions, graph-node identity and tombstoned ids are internally consistent with the golden path. 'Record its version, not its name' is confirmed: the vendor's dictionary locator carries a version_id and silently uses the latest when it is omitted."
    },
    "techniques/localized-voice-timing-budget.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: the not-measured decision rule now cites unmeasured-is-not-a-pass for the state and keeps grade-against-what-ships for judging the shipped locale. Still owed: add unmeasured-is-not-a-pass to the frontmatter laws list together with an index regeneration (not done here, since a frontmatter change alone drifts the generated index); the fixed-length versus adaptive renderer-mode paragraph still names no source."
    },
    "techniques/re-cast-gate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the audition set is now 'about a dozen reference lines per voice, plus one for each further shipped language the voice speaks', described as a working size, removing the conflict between a fixed twelve and a line per shipped language."
    },
    "applications/node--cast-ledger-with-consent.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique (declared-but-refused speech kind, per-kind licence map with no per-voice field). Every anchor is in a private tree at 88f1b080 that is not available to this review and was not reopened; verified_on left at 2026-09-30."
    },
    "applications/node--line-id-catalog-and-revision-diff.md": {
      "disposition": "reverify",
      "reason": "The name-derived key deviation and the single-revision shortfall are coherent with the technique. Private tree at 88f1b080 not reopened."
    },
    "applications/node--localized-voice-timing-budget.md": {
      "disposition": "reverify",
      "reason": "The word cap reported as pending on an empty field and ungraded under a long-monologue profile matches the technique's word-count critique. Private tree at 88f1b080 not reopened."
    }
  }
}
```
