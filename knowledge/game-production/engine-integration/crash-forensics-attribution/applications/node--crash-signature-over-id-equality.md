---
layer: application
type: application
subject: crash-forensics-attribution
technique: crash-signature-over-id-equality
stack: node
status: forged
verified_on: 2026-08-20
---

# Signature matching in the crash analyser

Realized in the PoF repo at `src/lib/crash-analyzer/crash-signature.ts`, consumed by
`analysis-engine.ts` through `buildDiagnosisCorpus` (`analysis-engine.ts:250`). The module is
deliberately pure — "free of app/DB/UI imports, so the ranking can be reasoned about (and
unit-tested) without running the analyzer or the UI" (`crash-signature.ts:16-18`).

## The incident, verbatim

The file's own header records what it replaced (`crash-signature.ts:10-15`): "does PoF already
know this crash?" used to be answered by

```
SAMPLE_DIAGNOSES.find((d) => d.crashId === report.id)
```

— exact id equality against the fixed `crash-001`..`crash-008`. An imported crash is stamped
`crash-<base36 timestamp>`, "so that lookup could never return anything for real user input:
the headline capability only ever fired for the eight canned demo crashes." That is the silent
hundred-percent miss rate in its natural habitat.

Note how the identifier survives in the corpus without being the key: `buildDiagnosisCorpus`
joins diagnoses to crashes by id because "a diagnosis belongs to exactly one authored crash",
and the comment at `analysis-engine.ts:243-248` is explicit that this internal structure "is not
the matching. The matching is `matchSignature`, which never looks at the query's id."

## The signature

`CrashSignature` (`crash-signature.ts:28-44`) is seven derived fields: `crashType`,
`culpritFunction` plus its split `culpritClass` / `culpritMethod`, `culpritFile` (basename,
lowercased — "real logs often omit the directory"), `module`, and sorted `terms`.

`culpritOf` (`crash-signature.ts:52`) resolves the culprit "the same way `findCulpritFrame`
resolves it (first game-code frame carrying a source file), so a raw report and a processed one
produce the SAME signature" — one authority for the quantity, stated as the reason.

`signatureFingerprint` (`crash-signature.ts:183`) is the second key: `crashType | culpritFunction
| culpritFile | module`, built from identity fields only and "NOT from `terms`: an error message
that happens to name one extra engine type is the same crash, and bucketing on the term set
would file it as a new one."

## Term admission

`signatureTerms` (`crash-signature.ts:126`) scans the error message and every frame — engine
frames included, since "an engine frame names the subsystem even though it is not evidence of
module ownership." Admission is structural first: `isEngineShaped` (`:97`) accepts an underscore
or two-or-more capitals, which "covers the UE type vocabulary (`UObject`, `FArchive`,
`AbilitySpec`, `TWeakObjectPtr`, `GAS`) while rejecting the single-capital jargon keys that are
ordinary words (`Server`, `Category`, `Transient`)". `tokenVariants` (`:106`) retries with a UE
type prefix stripped and lowercased. `PLAIN_CRASH_WORDS` (`:78`) is the six-word explicit
exception list — `ensure`, `assertion`, `serialization`, `nullptr`, `montage`, `replication` —
guarding against the base jargon dictionary's everyday verbs (`add`, `move`, `remove`, `none`)
turning every callstack into a bag of noise terms. The stated property: "A crash word missing
from this list simply does not contribute a term — it never contributes a WRONG one."

## Graded similarity

`SIGNATURE_WEIGHTS` (`crash-signature.ts:206`) — `crashType 0.25`, `culpritFunction 0.30`,
`culpritFile 0.15`, `module 0.15`, `terms 0.15` — "sum to exactly 1.0, so a similarity is a real
fraction of the available evidence rather than an arbitrary point total."

`compareSignatures` (`:256`) awards half the function weight when only the class matches (`:272`)
or only the method matches (`:276`), and scores `terms` as a Jaccard overlap (`:301-305`). Two
absence rules are stated where they are implemented: "Missing evidence scores ZERO rather than
counting as agreement — two crashes that both failed to attribute a module have not thereby
agreed on one" (`:250-254`), and an empty term set on both sides scores 0, not a perfect match
on the empty set (`:301-303`). The function is documented as symmetric, and `round2` (`:229`)
fixes the displayed similarity to two places so it does not jitter.

`MATCH_FLOOR = 0.55` (`:222`) carries its own calibration proof: a bare shared failure class plus
some shared vocabulary (0.25 + a fraction of 0.15) cannot reach it, while the same culprit symbol
in the same file and module can (0.30 + 0.15 + 0.15 = 0.60) even across failure classes.
`STRONG_MATCH = 0.75` (`:225`) splits strong from weak.

`matchSignature` (`:354`) returns `match` (null unless the floor was cleared), `best` — "the
top-ranked candidate whether or not it cleared the floor — the near miss" — and the full ranked
list with per-candidate `agreements` and `differences`. Ordering is similarity descending, then
self-preference, then crash id ascending, "so a tie never depends on array order" (`:344-352`).
