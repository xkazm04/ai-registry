---
layer: technique
type: technique
subject: evidence-grounded-claims
technique: placeholder-to-fact-resolution
status: forged
laws: [honest-null-over-forced-guess, provenance-per-field]
shared_with: []
use_when: [closing out a draft's bracketed placeholders before submission, wiring the fact ledger into a review surface, deciding whether a placeholder can be auto-suggested]
---

# Placeholder to fact resolution

Bracketed placeholders make a draft honestly unfinished; resolution is how
it gets honestly finished. The technique closes the loop between the two
halves of the grounding discipline: each placeholder the drafting prompts
deliberately emitted is mapped to the fact kind that could fill it, the
ledger is consulted for a fact of that kind, and the sourced value is
*offered* to the writer — never silently substituted. The loop's governing
rule is inherited from everything upstream: **no guessing.** A placeholder
that cannot be confidently mapped to a kind, or whose kind has no ledger
fact, stays a placeholder — routed to a human, not resolved by force.

## The mapping: placeholder text to fact kind

Placeholders arrive as short natural-language wants — "insert number
served", "Amount", "EIN", "fiscal year" — and the mapping is deliberately
deterministic: a small ordered set of cue rules over the lowercased
placeholder text, each cue pointing at one kind from the closed taxonomy.
Served/beneficiary language maps to people served; amount/revenue/budget
cues map to annual revenue; board language to board size; year/fiscal/
audit cues to the fiscal year; the identifier's own name to the
identifier.

Determinism here is a choice, not a limitation. The mapping runs at review
time, inline, on every placeholder in a draft — it must be instant, free,
and explainable ("this matched because it says 'served'"). A model-based
mapper would be marginally better at exotic phrasings and categorically
worse at the property that matters: when a model guesses a mapping wrong,
a revenue figure lands in a people-served blank with a confident source
citation attached — fabrication with provenance, the most convincing wrong
value the pipeline can produce.

Hence the null: **an unmapped placeholder returns no kind, and no kind
means no suggestion.** The fallthrough is the feature. Cue rules are
extended when real placeholder phrasings show up unmapped — driven by
observed misses, not by ambition to resolve everything.

## The offer: suggestion, not substitution

Resolution surfaces the matching fact *next to* the placeholder — value,
source document, confidence — and the writer accepts it into the text. The
human click is load-bearing, for three reasons:

1. **The mapping can be wrong.** Cue rules are precise but not perfect;
   the writer catching "that's our revenue, not our program budget" is
   the last line of defense, and it only exists if acceptance is manual.
2. **Fit is editorial.** The stored verbatim value ("$1,234,567") may
   need framing in prose the writer controls ("an annual budget of
   $1,234,567"); the *figure* must stay exact, but the sentence is theirs.
3. **The accepted value inherits accountability.** The applicant signs
   the application; each figure in it should have passed through their
   eyes once, with its source visible at the moment of acceptance.

Where several facts of a plural kind match (multiple program outcomes),
offer them all — choosing which outcome serves the sentence is editorial
judgment, exactly what must not be automated.

## Decision rules

- When a placeholder maps to a kind with no ledger fact, leave it and say
  so: "no fact of this kind in your documents yet" plus the path to fix
  it (upload the document that states it). The gap message recruits the
  missing document; a silent skip recruits a made-up number.
- When a placeholder maps to a low-confidence fact, offer it with the
  grade visible and softened framing ("possibly, from …") — confidence
  earned at extraction is spent at resolution.
- When the writer rejects a suggestion, do not re-offer the same fact for
  the same placeholder in the same session; repeated offers train
  reflexive acceptance.
- When all placeholders are resolved, re-run the draft's quality gates —
  resolution edits the text, and edits can introduce new findings.

## When not to use

Do not extend resolution into free-text rewriting — it fills declared
blanks, it does not "improve" surrounding figures or harmonize numbers
across sections; that path re-opens silent alteration of sourced values.
And skip auto-suggestion entirely for placeholders whose want is
judgment, not data ("[describe the founding story]") — the mapping's null
answer is correct for them, permanently.
