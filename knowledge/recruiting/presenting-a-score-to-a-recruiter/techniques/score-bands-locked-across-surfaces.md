---
layer: technique
type: technique
subject: presenting-a-score-to-a-recruiter
technique: score-bands-locked-across-surfaces
status: forged
laws: [meaning-does-not-live-in-a-label, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [turning a numeric score into a verdict word or colour, a candidate reads differently on two surfaces, translating a scoring interface]
---

# Score bands locked across surfaces

A number about a person is read through its **band**. "78" is inert until the
interface calls it *strong*, tints it, and places it against a legend. The
band is what the recruiter remembers, repeats in a debrief, and writes in a
note. It is therefore the part of the presentation that must be most stable —
and in practice it is the part most often duplicated.

The concern is **drift between duplicated cutoff tables**. Bands get
re-implemented in the card, the report renderer, the analysis pipeline that
writes the summary sentence, the export, the analytics histogram. Someone
tunes one boundary and ships. Now a candidate reads *mid* on the board and
*weak* in the emailed report, and to the recruiter that is not a styling
inconsistency — it is the system disagreeing with itself about a person.

## The procedure

**1. One band table, one home.** A single ordered list of tiers, each with its
lower bound, its identifier, and its presentation attributes. Every consumer
derives from it: verdict word, colour, legend rows, histogram bucket floors,
export text, the adjective in generated prose.

**2. Derive, never re-enumerate.** A legend is generated *from* the table. A
histogram's bucket floors are the table's bounds. The moment a legend is hand
written, it becomes a second table that happens to agree today.

**3. Locale-independent cutoffs, localized labels.** The boundary is a number
and belongs to the logic; the word is content and belongs to the translation
layer. Putting the cutoff inside a localized resource means translating an
interface can move a threshold — and it will, because the person editing the
translation file has no reason to think a number in it is load-bearing. This
is [meaning-does-not-live-in-a-label](../../_laws.md#meaning-does-not-live-in-a-label)
in its most literal form: the tier identifier is stable, the display string is
not, and nothing keys off the display string.

**4. Mirror across runtimes by test, not by intention.** When a second runtime
(an analysis pipeline in another language, a document generator, a downstream
system) genuinely cannot import the table, the mirror is asserted: a shared
fixture, or a test in each runtime that reads one exported definition and
fails on divergence. A comment saying "keep in sync with the interface" is not
a mechanism.

**5. Derive every threshold control from a band boundary.** The floors a
min-fit filter offers, the cutoff a "strong only" toggle applies, the edge a
histogram buckets on — all read from the table. A floor chosen by feel lands
mid-band, so "at least 70" retains rows the grid colours as not-strong and the
recruiter sees the filter contradicting the colours. Re-banding must move the
filters with it, automatically.

**6. Where a product genuinely needs more than one scale, they are named,
separate objects — never overlapping copies.** A three-tone colour scale and a
five-word verdict scale can coexist only if each has its own table, its own
name, and a stated relationship; if they are two ad-hoc cutoff sets over the
same 0–100 number, a candidate will read *mid* by one and *strong* by the
other on the same card, which is the exact failure this technique exists to
prevent.

**7. Keep the vocabulary closed and small.** Around five tiers. A closed
vocabulary is checkable, translatable, and comparable across time; an open one
is prose. Version the scale: a rating carries the version of the band table it
was scored under, so a later revision cannot retroactively re-mean a stored
verdict — [a-verdict-is-bound-to-what-it-judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged).

## Decision rules

- **Boundary convention is decided once and written down**: inclusive lower
  bound, exclusive upper, evaluated top-down. Half the band bugs in a scoring
  UI are one boundary implemented as `>=` and its twin as `>`, which makes
  exactly one score in the range render differently on two surfaces — the
  hardest kind of report to reproduce.
- **Changing a cutoff is a migration, not a tweak.** Existing candidates
  re-band silently, saved shortlists change meaning, and anyone who was told
  *strong* last week is *mid* today with no event to point at. Either version
  the table and leave historical verdicts bound to their version, or announce
  the re-banding.
- **The band never becomes the number.** Store the score; derive the band at
  render. Persisting the band word and later reading it back as if it were the
  measurement loses the resolution you need to re-band, compare, or audit.
- **Colour is not the only channel.** A band that is distinguishable only by
  hue is unreadable to a share of your recruiters and invisible in a printed
  report. Pair every band with its word.

## Anti-patterns

- **A pipeline that writes the adjective into generated prose using its own
  private thresholds.** The summary sentence then says "a strong match" above
  a card labelled *mid*, and because the sentence is generated text nobody
  greps for the cutoff that produced it.
- **Per-role band overrides added ad hoc.** If a role genuinely needs a
  different scale, that is a different scale with its own version — not a
  patched copy of the shared one.
- **Bands used as a decision gate.** Bands are for reading. A cutoff that
  routes candidates is a threshold with its own governance, and collapsing the
  two means a cosmetic re-tint becomes an automated rejection policy change.

## When not to use this

- **Where the number is genuinely continuous and comparative**, such as an
  internal calibration surface plotting raw scores. Banding there destroys the
  resolution the surface exists for.
- **For aggregate analytics**, where distribution shape, sample size and
  confidence intervals govern presentation. Reusing the same band colours in a
  cohort chart is fine and desirable; the rules for what that chart may claim
  belong to honest measurement presentation, not here.
