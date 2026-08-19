---
layer: technique
type: technique
subject: claim-verification-and-provenance
technique: three-verdict-vocabulary
status: forged
laws: [disclose-never-repair, one-definition-one-import]
shared_with: []
use_when: [designing a public claim-verification gate, choosing verdict copy and states, resisting pressure to add a fourth verdict]
---

# The three-verdict vocabulary

A public verification gate answers one question — *does this citation still
hold?* — and its entire value lies in answering it in a vocabulary small
enough to be quoted. The closed set is three verdicts:

- **verified** — today's re-derivation yields the same content the citation
  carried: the same value, the same fingerprint, or the same record.
- **moved** — the address is valid and the record exists, but the value or
  content differs from what was cited. The verdict always shows **both
  sides**: the cited value with its citation date (when the citation carried
  one), and today's value with today's date. Moved is not failure — it is the
  gate doing exactly its job, and the copy must not shame the citer.
- **unknown** — the gate cannot vouch: the reference does not decode, was
  never issued, or decodes to a record today's derivation no longer carries.
  Unknown always states its **reason** from a small enumerated set; a bare
  "unknown" teaches the reader nothing and reads as breakage.

No fourth verdict. Every candidate fourth is one of the three wearing a
modifier: "verified but under review" is *verified* plus gate standing;
"same number, different formula" is *moved* (see derivation-comparison);
"stale" is *moved* with dates; "our own app page, not a citation" is
*unknown* with the reason "not a citation". A vocabulary that grows loses the
property that funds it: a reader can hold three words and know exactly what
each excludes. The moment "verified*" exists, plain "verified" is devalued.

## What "verified" attests — and only that

Verified means **the re-derivation matched**. What was re-derived differs by
claim family, and the copy must say which:

- For a **value claim**, verified means today's shared arithmetic produces
  the cited number for the cited metric and subject. Compare exactly — the
  values round-trip through one canonical serialization, so numeric equality
  is byte equality — never with a tolerance, which is a silent repair
  ([disclose-never-repair](../../_laws.md#disclose-never-repair)).
- For an **existence claim** (a graph record), verified means the record is
  present. It does *not* mean approved: a rejected record deliberately stays
  in the store so the rejection is auditable, and human-review standing is an
  orthogonal modifier. Headline copy must fork on that modifier — an
  existing-but-rejected record must never wear the plain confirming headline.
- For a **fingerprinted view**, verified means the content hash matches; the
  gate states the date of *today's* recomputation and admits it does not know
  the citation's own date when the address does not carry one.
- A **bare reference with no asserted value** verifies trivially with today's
  value attached: the input asked, it did not claim. Say so in the copy —
  "here is the current value" is a different sentence from "your quoted value
  matches".

## The gate translates; it never re-derives

The gate owns the vocabulary and nothing else. Each claim family already has
a loader or shared arithmetic that publishes the figure; the gate calls those
and *translates* their answers into the three verdicts —
[one-definition-one-import](../../_laws.md#one-definition-one-import) applied
to verification. A gate with its own derivation path is a second
implementation of the truth, and its disagreements with the publishing
surface would be indistinguishable from real drift. Structurally, keep the
verdict module pure: inputs are structural subsets of the loaders' results,
outputs are a discriminated union of `{family, kind, ...evidence}` — testable
without a server, and every rendered sentence derivable from the union.

Keep verdict *copy* out of the verdict module: return stable copy keys, let
the surface translate. The vocabulary is classification; copy is
presentation; a gate that returns sentences in one language becomes the one
monolingual surface on a multilingual route, and its copy set can no longer
be tested for completeness.

## Decision rules

- When a comparison input is absent on either side (no cited value, no cited
  derivation), it claims nothing — do not compare, do not fail. Absent is not
  mismatched.
- When the input is the platform's own non-citation URL, verdict is unknown
  with a dedicated reason — never "unknown reference", which would tell a
  reader the product does not recognize its own pages.
- When a new claim family joins the gate, it adopts the three verdicts and
  contributes at most new *reasons* and new *evidence fields* — never a new
  verdict kind.

## When not to use it

The three-verdict vocabulary is for re-derivable claims against a live store.
It is not a truthfulness scale for open-world statements ("this politician
said X and X is misleading") — that is editorial fact-checking, which needs a
graded rating and a human author, and belongs in structured-review-emission
territory with a human gate in front. Do not stretch verified/moved/unknown
to cover judgments; it is a vocabulary about *derivations*, and its authority
comes from refusing to opine.
