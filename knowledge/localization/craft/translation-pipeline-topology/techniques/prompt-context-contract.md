---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: prompt-context-contract
status: forged
laws: [format-skeleton-is-inviolable, one-concept-one-rendering]
shared_with: []
use_when: [designing what a machine-translation request carries beyond the string, a translation prompt has grown into unreviewable prose, deciding how few-shot examples and per-language rules reach an engine, context changes are not invalidating cached translations]
---

# The prompt-context contract

A bare string is the worst request a pipeline can send. The engine does not know
whether *Open* is a verb or an adjective, whether *{count}* is a number or a name,
which of the target's plural categories it is filling, or that the product settled
this term two years ago. It guesses, fluently, and the guess is indistinguishable
from a translation. Everything a human translator would have been shown has to
travel with the unit — and the finding is that what "everything" means has
already converged.

## The field list is the finding

Two independent implementations — one open and read in its shipped prompt, one a
platform's published request contract — list nearly the same fields. Neither
copied the other; both arrived at them by watching engines fail without each one.

- **The unit's own text**, and **its key or identifier** — the key is often the
  only hint of where the string lives.
- **A human-written context note or description** — the one field nothing can
  derive.
- **The surface it renders on** — a button, a heading, an error, a notification.
- **Sibling or neighbouring units** — the strings around it in the same view or
  message group.
- **Translation-memory matches with their scores** — a match without its score
  reads as an instruction to copy it
  ([fuzzy-reuse-under-a-threshold](./fuzzy-reuse-under-a-threshold.md)).
- **The glossary terms that occur in this unit** — the occurring terms, not the
  glossary. That is how [one concept, one
  rendering](../../../_laws.md#one-concept-one-rendering) reaches an engine
  without drowning the request.
- **The target locale's plural categories and their selection rule** — the count
  alone lets the engine fill the right number of forms and still put the wrong
  text in each one.
- **Deterministic check findings already on the unit** — for a review action,
  what is already known to be wrong.
- **A placeholder map** — each placeholder with its type and an example value.
- **The action being performed** — filling a gap, reviewing an existing
  translation, aligning two versions. The same unit needs different output under
  each.

One vendor documents its context parameter as not billed. That is vendor-stated,
one vendor, one pricing page — but it removes the usual argument for sending bare
strings, which was never quality and was always cost.

## Rules

**Context is a contract with the engine, not prose glued to a prompt.** Give the
request a declared schema with a version. A context change is then a diff of named
fields that a reviewer can read, a field that goes missing is a validation error
rather than a quieter prompt, and two runs can be compared field by field. Context
assembled by string concatenation inside a translation workflow is none of those
things: it is reviewed by nobody, it drifts per call site, and its failures present
as engine quality.

**Anything mechanically derivable is attached by the pipeline, never asked of the
writer.** The plural rule comes from the locale data, the placeholder map from the
source value, the check findings from the checks, the occurring terms from the
glossary. A source writer asked to fill these in fills them in once, inaccurately,
and never again. Spend the writer's attention on the one field only a human
knows — what the string means and where it appears.

**Examples ride as prior turns, not as system text.** A demonstration presented as
a completed request and response is imitated as one; the same material inside the
instructions is read as more instruction, and its content leaks into output. And
**reject an example whose placeholder set does not survive a round trip** — source
and target must carry the same multiset — because an example that breaks the
skeleton teaches the engine to break it
([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)).

**Per-target-language instructions live in a map resolved exact, then fuzzy, then
base language.** A regional variant's own entry wins; failing that, the nearest
entry for the same language; failing that, the base language's. This is the
mechanism by which a language subject's rules — register, quotation marks, loanword
policy — actually reach an engine: as data keyed by locale, resolved per request,
not as a paragraph someone remembered to paste. Without the resolution order, a
regional variant silently gets no rules at all.

## Every field belongs in the cache key

If a field shapes the output, a change to it is a different request, and a cache
that ignores the change serves output produced under context nobody holds any
more. The contract is therefore also the list of what the cache key must digest
([source-hash-translation-cache](./source-hash-translation-cache.md)) — and the
same cache's absence-compatibility rule governs a field added to the contract
later: mix it into the key only when it carries a value, or adding one optional
field invalidates the corpus.

The two lists should be derived from one declaration. Maintained separately, they
drift, and the first symptom is a context improvement that never produces a single
changed translation.

## When not to use it

- **Interactive single-string help** where a person is reading the output with
  the surface in front of them; the human is the context.
- **As a place to put quality rules.** The contract carries facts about the unit.
  Judgment about what a good translation is belongs in the language subjects and
  reaches the engine through the per-language map, not as fields.

## Failure modes

- **The bare string.** Fluent output, wrong part of speech, and no finding,
  because nothing records what the engine was never told.
- **The whole glossary.** Every term sent on every request; the relevant one is
  diluted, and the request cost grows with the termbase rather than the unit.
- **Plural count without the rule.** The right number of forms, filled in the
  wrong categories.
- **Writer-supplied derivable fields.** Stale placeholder types and plural
  counts that contradict the source they describe.
- **Examples in the system text**, or examples with a broken skeleton, taught to
  every unit in the batch.
- **Context outside the key.** The context note is improved, every lookup hits,
  and the improvement is never seen.
