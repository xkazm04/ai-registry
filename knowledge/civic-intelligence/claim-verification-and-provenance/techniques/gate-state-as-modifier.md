---
layer: technique
type: technique
subject: claim-verification-and-provenance
technique: gate-state-as-modifier
status: forged
laws: [lead-not-finding, missing-is-not-zero, disclose-never-repair]
shared_with: []
use_when: [combining human-review state with a verification verdict, choosing tone and color for verdict surfaces, normalizing review-state vocabularies across claim families]
---

# Gate state as modifier

Human-review standing and verification verdict answer **different questions**.
The verdict answers "does today's re-derivation match the citation?"; the gate
state answers "where does this claim stand with a human reviewer?". A surface
that merges them into one scale will inevitably print a confirming banner
over a claim a human refused — because "the record exists and matches" and
"a human vouched for it" are both spelled *verified* in a merged vocabulary.
This technique keeps them orthogonal: the verdict is the noun, the gate state
is the modifier, and the rendered tone is a function of both.

## The standing vocabulary

Per claim, human-review standing is one of:

- **verified** — a reviewer approved it (a terminal decision, on the record).
- **pending** — the claim is in a review queue and no decision is recorded.
  Crucially, this is the reading of *any* unrecognized or missing state on a
  gated claim: silence never promotes to approved, and a token typo never
  demotes to invisible.
- **rejected** — a reviewer refused it, terminally. The refused record stays
  in the store precisely so the refusal is auditable; deleting it would erase
  the evidence that review happens.
- **ungated** — the claim is a deterministic re-derivation that passes through
  no human gate at all.

`ungated` is the state most often missing from designs, and its absence makes
surfaces lie politely: without it, a deterministic figure renders "awaiting
review" — which **promises a review nobody is preparing**. That sentence is a
different question, not a different answer: pending says "a human will look";
ungated says "no human looks, and here is the methodology instead". Machine
derivations are leads a reader can re-derive, human approval is a finding;
conflating the queue states blurs exactly the line
[lead-not-finding](../../_laws.md#lead-not-finding) draws.

## Composition: tone is verdict × standing

Compute the rendered tone from both axes, in one place:

- verdict *unknown* → unknown tone; standing is not even asked (there is no
  claim to have standing).
- verdict *moved* → moved tone; movement dominates, and the standing renders
  as a secondary row.
- verdict *verified* + standing *rejected* → **refusing tone**, never
  confirming. Headline copy forks: "the record exists — and was rejected by
  review".
- verdict *verified* + standing *pending* → **neutral tone**: "the record
  exists — awaiting human review".
- verdict *verified* + standing *verified* → the only combination that earns
  the full confirming treatment.
- verdict *verified* + standing *ungated* → confirming, with the
  no-review-applies sentence and a methodology link in place of a reviewer.

The composition function lives beside the verdict module and is imported by
every surface; a surface that hand-picks colors from the verdict alone will
regress the rejected case within a release.

## One dictionary for many families

Different claim families grow different review-state vocabularies (one store
writes `pending_review`, another defaults to `pending`; one family has no
state at all). Normalize in a single translation dictionary with three rules,
per [disclose-never-repair](../../_laws.md#disclose-never-repair):

1. **Synonyms merge.** Two tokens meaning "waiting for a human" are one state
   with one sentence — two sentences would imply two different queues.
2. **Unknown tokens print verbatim, labelled untranslated.** A state token
   the dictionary does not know is never hidden, never guessed into the
   nearest state, and never rendered as blank — the reader is told the record
   carries a mark the product cannot yet read. (An empty token gets its own
   named placeholder; unknown state never renders as whitespace.)
3. **The dictionary classifies; the caller decides defaults.** Whether a
   missing state means pending (gated family) or ungated (deterministic
   family) is the claim family's knowledge — the dictionary only translates
   already-normalized tokens, or it would need to know every family's gating
   rules and become a second gate.

Missing standing is meaningful only relative to the family's gating — which
is [missing-is-not-zero](../../_laws.md#missing-is-not-zero) applied to
review: an absent state is not "no review happened and none applies"; it is
either "queued" or "not applicable", and the family must say which.

## When not to use it

If a product has exactly one claim family, one review queue, and no
deterministic claims, a merged four-value scale is defensible — the axes
cannot yet disagree. Split them the day either a second family or a
deterministic derivation arrives; retrofitting orthogonality after copy,
colors, and crawlers have consumed the merged scale is far costlier than
starting with the modifier.
