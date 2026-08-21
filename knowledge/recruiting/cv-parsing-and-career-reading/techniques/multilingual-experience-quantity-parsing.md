---
layer: technique
type: technique
subject: cv-parsing-and-career-reading
technique: multilingual-experience-quantity-parsing
status: forged
laws: [absence-of-evidence-is-not-evidence, meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [extracting a stated years-of-experience figure, adding a language to intake, auditing why non-native applications score low]
---

# Multilingual experience-quantity parsing

Candidates state durations in prose, in their own language, in whatever form the
sentence wanted. A parser built by reading a dozen documents in one language captures a
narrow slice of that and silently returns nothing for the rest — and downstream,
nothing becomes zero, and zero becomes a rejection. The technique is building the
quantity parser as an explicit, published contract rather than a regular expression
someone extended twice.

## What real documents contain

- **Digits and words.** The number may be spelled out, and spelled out in an inflected
  language where the numeral itself changes form.
- **Inflection and agreement.** The unit word is declined by case and by number — one
  form for one, another for a small count, another for many — and a pattern anchored on
  the nominative singular misses most real sentences.
- **Sub-year units.** Months, and occasionally weeks, on early-career and contract
  documents. A parser that only reads years returns nothing for "eighteen months",
  which is the exact population least able to survive a zero.
- **Start-point phrasings.** "Since", "joined in", "from" plus a year — extremely
  common, and not a duration at all until it is computed against a reference date.
- **Ranges and approximations.** "Three to five years", "over a decade", "nearly two
  years", "5+".
- **Adjacency.** The number is usually attached to a domain — "six years in logistics" —
  and the attachment is what makes it useful; a bare figure lifted out of its noun
  phrase is a quantity of nothing.

## The contract

Publish, next to the parser, an explicit list of **what it captures and what it
deliberately does not**. The non-captures are the more important half, for three
reasons: they tell a reviewer whether a missing value is a bug or a decision, they stop
the pattern set from growing by accretion, and they are the specification a test suite
and a new language port are written against.

A worked non-capture list usually includes: durations expressed only as a date range
elsewhere in the document (that is the interval arithmetic's job, not this parser's);
quantities attached to something other than working experience — age, study length,
residence, tool version numbers, salary tenure; approximations too vague to bound;
and figures inside a section the extractor identified as belonging to someone or
something else, such as a company description.

Every capture and every declared non-capture gets a test case in every supported
language. The test corpus is the contract; the patterns are an implementation detail.

## Decision rules

- **A missing quantity is missing, not zero.** The parser returns an unset value, and
  every consumer must be able to represent that. [Absence of evidence is not
  evidence](../../_laws.md#absence-of-evidence-is-not-evidence) is violated the moment a
  null becomes a numeric default, and the resulting penalty falls on the candidates
  whose phrasing the parser was not built for — which is a language and origin
  correlation, not a competence one.
- **Normalise to a single internal unit** and record the original span and unit
  alongside it, so a recruiter sees what the candidate wrote, not your rounding.
- **A stated quantity is a self-asserted claim and loses to computed tenure.** Where the
  prose says twelve years and the employment intervals measure seven, the computed value
  is the record and the difference is surfaced as a discrepancy for a human — never
  averaged, never silently preferred. [A claim carries its sample and its
  basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis): the two numbers have
  different bases and must not be blended into one.
- **A range collapses to its lower bound**, and the bound is recorded as a bound. "Three
  to five" is evidence of three.
- **Language detection precedes pattern selection, and never gates it.** Run every
  supported language's patterns where detection is uncertain; a document may be
  bilingual, and many are. Detection failure must not mean no parsing.
- **Never translate a value the machine matches on.** An extraction that also localises
  its output must draw a hard line: freeform prose is written in the reader's language,
  while enumerated codes — role family, seniority band, evidence kind, provenance — and
  proper nouns, skill names and the preserved source text stay verbatim in their
  original form, diacritics intact. A translated enum joins against nothing downstream
  and fails silently; a translated skill name stops matching the requirement it
  satisfies. State the two lists explicitly in the contract rather than hoping.
- **Never key the parser off a section heading's display string.** Headings are
  localised, styled, abbreviated and often absent — [meaning does not live in a
  label](../../_laws.md#meaning-does-not-live-in-a-label). Map many surface forms onto a
  stable internal section vocabulary and key off that.

## Adding a language

Adding a language is not adding translations of the unit word. It is: the numeral system
in words, the inflection paradigm of the unit, the abbreviation conventions, the
start-point prepositions, the date-order convention, and the false friends that must be
declared non-captures. Ship it with the same test corpus structure as the first
language, and measure the extraction-success rate per language on real intake — a
divergence between languages is the fairness signal this technique exists to catch.

## When not to use this

Where the application form asks for years of experience as a typed field, use the field
and do not re-derive it from prose; a structured answer beats a parsed one and the
candidate's own entry is the more defensible record. Where the role has no duration
requirement, do not extract the number at all — an available figure attracts a filter,
and a filter on self-stated years measures who writes confidently rather than who has
done the work.
