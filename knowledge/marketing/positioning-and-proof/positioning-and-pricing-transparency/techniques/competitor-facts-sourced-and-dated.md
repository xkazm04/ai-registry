---
layer: technique
type: technique
subject: positioning-and-pricing-transparency
technique: competitor-facts-sourced-and-dated
status: forged
laws: [never-invent-proof, not-measured-is-not-zero]
shared_with: []
use_when: [writing incumbent prices or capabilities into a value case, building a comparison or "alternative to" page, letting a model generate copy that mentions rivals]
---

# Competitor facts sourced and dated

A statement about a rival - what it charges, what it supports, whom it sells
to - is a claim about a third party's current state, made by someone with no
control over when that state changes. It goes into a positioning document
with a source and a snapshot date, or it does not go in. The same discipline
applies structurally where a model writes comparative copy: only a
person-confirmed competitor reaches a prompt, and the prompt is told to
compare only on what it was given.

## Three grades, each labelled

- **Sourced, dated fact.** A price band, a feature, a supported market. Carries
  where it was read and the day it was read: "monthly subscription from N,
  their pricing page, read 2026-09-01". This is the only grade allowed to sit
  in a sentence that a buyer will take as fact.
- **Characterisation.** The author's reading of what the incumbent is:
  "their output is a recommendation list, not the asset itself". Useful, often
  the sharpest part of the case, and labelled as a reading - "as we read
  their product" - so a buyer who disagrees is disagreeing with an opinion,
  not catching a lie.
- **Absence.** The business does not know. The slot stays empty, or the
  sentence says "we have not verified whether they support this". Filling it
  with a plausible guess is the failure
  [not measured is not zero](../../../_laws.md#not-measured-is-not-zero)
  describes: the guess becomes the baseline every later comparison is
  argued from.

## Procedure

1. **Extract every third-party claim** from the value case and the public
   comparison surfaces into a table: incumbent, claim, grade, source, date.
2. **For each fact-grade claim with no source, find one or downgrade it** to
   a characterisation or an absence. Memory is not a source.
3. **Set a refresh cadence** for the table - quarterly is the practitioner's
   convention, and it is labelled as one - and the name of the person who
   re-reads it. A date with no re-read plan is a date that will be three
   years old when a prospect reads it.
4. **Put the date on the surface**, not only in the working table. A buyer who
   sees "read 2026-09-01" beside a rival's price trusts the number more, not
   less, and knows what to do if it is stale.
5. **In generated copy, enforce the grades structurally.** A competitor a scan
   proposed is a suggestion until a person confirms it; only confirmed
   entries are handed to the model, and the grounding text tells the model to
   compare only on what is given and never to state unverified rival numbers.
   The generation contract itself is `grounded-marketing-generation`'s; what
   this technique contributes is which entries may cross into it.

## Decision rules

- When a rival's price is quoted, it carries a source and a date or it is
  removed, because a wrong incumbent price is discovered on the buyer's
  second tab ([never invent proof](../../../_laws.md#never-invent-proof)).
- When a claim about a rival is the author's reading, it is phrased as one,
  because a characterisation stated as fact is the sentence a rival's sales
  team screenshots.
- When the business does not know, the slot stays empty, because a guessed
  competitor fact is the most reproduced falsehood in competitive copy.
- When a model proposes competitors, they enter a confirmation queue and not
  a prompt, because a suggestion that grounds copy has become a fact without
  anyone deciding it should.
- When the refresh date passes with no re-read, the dated facts are demoted
  to characterisations on the surface until re-read, because a stale date is
  worse than none - it certifies the wrong thing.

## Why the date is the important half

A source without a date invites a buyer to check it, find it changed, and
conclude the whole document is careless. A source with a date invites the
buyer to check it, find it changed, and conclude the document was right when
written. The second reading preserves trust; the first destroys it. The date
is also what makes the refresh cadence enforceable: a table with dates has
rows that visibly age.

## When NOT to use

- Copy that names no rival and makes no comparative claim; there is nothing
  to source.
- Legal or regulatory comparison contexts with their own evidentiary rules;
  follow those, which are stricter.
- A market where the incumbents are unlisted and undocumented (private
  agencies, bespoke services): every claim about them is a characterisation
  by construction, and the technique collapses to "label everything as a
  reading".
