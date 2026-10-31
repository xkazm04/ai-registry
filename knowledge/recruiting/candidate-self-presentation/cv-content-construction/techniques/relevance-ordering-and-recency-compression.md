---
layer: technique
type: technique
subject: cv-content-construction
technique: relevance-ordering-and-recency-compression
status: forged
laws: [absence-of-evidence-is-not-evidence, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [deciding section order on a CV, choosing how many bullets each role gets, compressing an old or off-target role, a CV runs over its page budget]
---

# Relevance ordering and recency compression

A CV has a fixed attention budget and a reader who spends it top-down. The first screen
is read closely; each later entry gets less. Ordering and compression decide where the
budget goes. Done well, the reader meets the strongest relevant evidence first and still
sees the whole career. Done badly, either the career is hidden (a reader who cannot see
the intervals assumes the worst) or the relevant work is buried under the long past.

## Section order

The default order, for a candidate with relevant paid experience:

1. Identity and contact, with a target or headline line.
2. Summary - only when it earns its place (see the golden path).
3. Experience, reverse-chronological.
4. Skills, grouped and evidenced.
5. Education, certifications, languages.
6. Anything else (publications, volunteering, interests) only if it carries evidence.

**Decision rules for moving a section up:**

- **When the strongest evidence for the target is not employment, its section leads.**
  A recent graduate's education and projects go above a list of unrelated part-time jobs;
  a researcher's publications may lead; a licence that gates a regulated role belongs in
  the first screen.
- **When a credential is legally required for the role, it goes near the top**, never at
  the bottom of an education list; the reader's first check is eligibility.
- **Section order never reorders time.** Inside any dated section, entries run newest
  first. Reordering a history by relevance reads as concealment and breaks every reader
  - human or parser - that reasons over intervals.

Section headings stay conventional in the document's language ("Experience",
"Education", "Skills" or their local equivalents): a reader and a parser both navigate by
them, and a clever heading is a heading neither recognises. Key the structure off a stable
internal vocabulary and render the label per language; [meaning does not live in a
label](../../../_laws.md#meaning-does-not-live-in-a-label).

## The bullet budget

A starting budget, to be tuned by page budget and seniority:

| Role position | Bullets |
|---|---|
| Current or most recent relevant role | 3-6 |
| Previous relevant roles, within about ten years | 2-4 |
| Older relevant roles | 1-2 |
| Off-target roles, or roles beyond about fifteen years | a single line: title, employer, dates |
| Very early career | one grouped line ("Earlier roles in retail and logistics, 2004-2009") |

The numbers are convention, not measurement; the rule underneath them is measurement-
free and firm - **space decreases with age and with distance from the target, and never
reaches zero for anything with a date.**

**Decision rules:**

- **When a role exceeds its budget, cut the weakest bullets, not the strongest.** Weak =
  duty lines with no outcome, restatements of the title, and items the target does not
  need. Rank by outcome rung and relevance, not by position in the source.
- **When a role is compressed, it keeps its title, employer and dates.** Compression
  removes bullets, never the interval. Deleting a role manufactures a gap, and a reader
  treats an unexplained gap as information; [absence of evidence is not
  evidence](../../../_laws.md#absence-of-evidence-is-not-evidence) cuts both ways - the
  document should not *create* an absence either.
- **Budget by a role's dates, never by its line.** A source written oldest first (a
  traditional chronological CV, an extraction that kept that order) goes into time order
  before the budget is applied. A budget keyed to position gives the oldest role the
  current role's bullets and prints the career upside down. When a dated history holds an
  undated entry, there is nothing to place that entry by: the source's order stands, and
  the owner is asked for the date.
- **When several short or similar old roles exist, group them** under one dated line
  rather than listing each; the interval survives, the attention cost drops.
- **When the same employer appears twice** (a promotion, a return), keep both entries or
  nest the titles under one employer with each title's own dates; never merge them into
  one span that erases the progression.
- **Compression is the owner's to reverse.** Every compressed role is listed as a change
  the owner can expand again, because what is off-target for one application is the point
  of the next.

## Age and the fifteen-year horizon

Compressing roles older than about fifteen years is widely advised as a defence against
age discrimination, which audit studies show is real and strongest for older women. The
defence is imperfect: omitting age cues where the local convention includes them can
itself lower ratings, and implicit cues survive any deletion. The rule here is therefore
compression, not removal, and the choice of whether to show early-career dates in full or
as a grouped line belongs to the owner, with the trade-off stated.

## Presenting time

A preregistered field experiment found that stating years-in-role instead of calendar
dates raised callbacks, most for candidates with gaps. That is a legitimate presentation
choice - nothing false is said - but it has costs: it removes the dates a machine reader
needs for interval arithmetic and can read as evasive in markets that expect exact
months. Offer it as an owner choice, per market, and never apply it silently.

## When not to use this

Academic CVs, federal-style résumés and some public-sector formats are complete records
by convention and must not be compressed. A document written for a specific form or
template dictated by the employer follows that template's order.
