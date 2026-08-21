---
layer: technique
type: technique
subject: skill-adjacency-and-normalization
technique: bilingual-surface-parity-and-coverage-floors
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [supporting a second language in matching, auditing why local-language postings score worse, setting a coverage target for a skill taxonomy]
---

# Bilingual surface parity and coverage floors

A matching system built in one language and deployed in a market that hires in
another degrades along a predictable seam: the second language resolves worse,
and it resolves *worst* in the term families the product exists to serve.
Practitioners in those families use the most abbreviations, the most borrowed
loanwords, the most local coinages and the most inflection — exactly the surface
diversity a taxonomy authored in the builders' language never enumerates.

The technique has two halves: parity as a per-term property, and coverage floors
per family as a ratchet.

## Parity is a property of the term

The wrong model is a translation layer: detect the language, translate the text,
match in the primary language. Translation of technical prose destroys precisely
the tokens that matter — an abbreviation becomes an expansion in the wrong
register, a loanword becomes its literal calque, and the resulting string
resolves to nothing. It also adds a model dependency to a path that must keep
working when models do not.

The right model is that **every canonical term carries surfaces in every
supported language**, in the same entry, reviewed together. A term with surfaces
in only one language is incomplete, and the authoring lint says so. Language is
metadata on the surface, not a mode of the matcher.

What a second language's surface set must actually contain, beyond the
translation:

- **The loanword as locals write it**, which is usually the primary-language
  term with local orthography and a local inflectional stem.
- **The local abbreviation**, which is often *different* from the primary
  language's abbreviation for the same thing.
- **The inflected stem**, so that a case-ending form still resolves — this is
  the surface that pairs with the suffix relaxation in
  [whole-token-matching-over-substring](whole-token-matching-over-substring.md).
- **The local-institution term** where a capability is named after a national
  body, a statutory scheme or a local qualification with no primary-language
  equivalent at all. These have no translation and are invisible to anyone
  authoring from the other language.

Note what this makes explicit: labels differ by language, identities do not —
[meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label).
One canonical term, many languages' surfaces, one set of relationships.

## Bilingual by nature: the exemption and its anti-gaming guard

A genuine class of terms is written identically in both languages — proper
nouns, product names, standardized abbreviations. Counting them as "missing a
translation" makes the parity metric permanently unreachable, and an unreachable
metric gets ignored. So allow an exemption, and make it safe:

- **The exemption is an explicit per-term flag, never inferred.** A rule that
  guesses "this looks like a proper noun" will exempt exactly the terms a
  maintainer was too rushed to translate.
- **The lint asserts the exemption is truthful**: a term flagged monolingual-by-
  nature that actually carries two surface forms is a contradiction and fails.
  Without that check, the flag becomes a one-character way to make any parity
  warning disappear.
- **Report exemptions as their own column.** A family whose parity rests
  entirely on exemptions has not achieved parity; it has declared it. The number
  should be visible next to the rate it produces.

## Coverage floors, measured per family

A single global coverage number over a large vocabulary is a lie of aggregation.
An easy, well-tended family with hundreds of terms will carry the average while
the family the business sells against sits at half coverage. So:

1. **Assemble a realistic corpus per language** — actual requirement text, not
   term lists. Term lists measure the taxonomy against itself.
2. **Measure resolution rate per family per language**: of the skill mentions a
   human can identify in that corpus, what fraction resolve to a canonical term?
3. **Record the current number as a floor**, per family, per language, in a test
   that fails when it drops.
4. **Raise the floor whenever a repair lifts it.** The floor is a ratchet: it
   only goes up, and raising it is part of the change that improved coverage,
   not a separate task nobody does.

Gate the pin **twice, with two different comparisons**. A "must be at least N"
check catches the between-change regression, which is what everyone builds. It
does *not* catch slack: once the live number has grown above N, terms can be
deleted back down to N and nothing fires. So add a second check asserting the
pin **equals** the live count, which forces any change that moves the number, in
either direction, to re-pin it in the same commit — where the reviewer sees it.
Reserve zero as the explicit marker for "this family is not built out yet", held
as a pure minimum and exempt from the equality check, so an empty family does
not gate unrelated work and is nonetheless visible as empty.

Pin at least two dimensions per family this way: **term count** (does the
vocabulary exist) and **edge density** (can graded credit fire at all). The
second is the one teams forget, and it is the one that decides whether the
adjacency ladder is live or inert.

Two reporting rules keep the numbers honest. State the corpus size alongside
every rate — [a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)
— because a family with nine terms in the corpus has no meaningful percentage.
And report the *gap between languages* as its own figure: a family at eighty per
cent in one language and forty in the other is a defect even if both clear their
floors, because it means candidates are being ranked on which language their
last employer wrote in.

## The consequence when coverage fails

A term that does not resolve is not a neutral loss. In a scoring pipeline it
becomes an unaddressed requirement, and the candidate is ranked as though they
lacked a capability they explicitly claimed. That is
[absence of evidence treated as evidence](../../_laws.md#absence-of-evidence-is-not-evidence)
arriving through the vocabulary layer, and it lands systematically on the
candidates who wrote in the less-covered language — which is a group, not a
random sample. Under-coverage of a language is therefore a fairness question
before it is a quality question, and it should be reviewed by whoever reviews
the adverse-impact numbers.

Correspondingly, a degraded or unavailable enrichment path must not stall the
candidate's process — the deterministic taxonomy path continues with its
provenance truthfully downgraded, per
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).

## Decision rules

- **When adding a term, require both languages' surfaces or mark the term
  explicitly incomplete.** Incomplete is a state; silently monolingual is not.
- **When a coverage floor fails, fix the surfaces — never lower the floor.** The
  only legitimate reason to lower a floor is that the corpus changed, and that
  change is reviewed on its own.
- **When one language's corpus is much smaller**, say so beside the number
  rather than reporting the two rates as comparable.
- **When a capability exists only in one jurisdiction**, model it as a real term
  with a single-language surface set and a family, not as an unmodelled string.
  This is the one legitimate single-language entry, and it should carry a reason.
- **When adding second-language aliases, assert that the primary language's
  resolutions are unchanged.** A new alias can hijack a surface that already
  resolved elsewhere, and the symptom is a ranking shift on a corpus nobody
  touched. Pin a representative slice of existing resolutions and re-run it on
  every vocabulary change: no-drift is the property that makes alias work
  routine instead of risky.
- **When adding aliases, re-run the compact-collision scan.** A new surface
  whose separator-free form appears inside ordinary prose reintroduces false
  credit through the data door; see
  [whole-token-matching-over-substring](whole-token-matching-over-substring.md).

## When not to use this

- **Do not build per-language taxonomies.** Two graphs drift, and the drift
  shows up as candidates in one language having relationships candidates in the
  other do not.
- **Do not use coverage as a quality score for the matcher.** It measures
  vocabulary reach only. A taxonomy can resolve everything and relate it all
  wrongly.
- **Do not gate a candidate's own action on a coverage measurement.** Coverage
  is an engineering ratchet; it never becomes a reason a person's application
  cannot proceed.
