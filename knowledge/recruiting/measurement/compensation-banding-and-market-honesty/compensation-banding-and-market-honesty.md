---
layer: golden-path
type: golden-path
subject: compensation-banding-and-market-honesty
status: forged
use_when: [putting a pay band on a role for the first time, a market figure is about to be shown to a recruiter or a candidate, building or reviewing a salary benchmark corpus, deciding what to do when no defensible number exists for a market]
techniques:
  - role-family-by-seniority-anchor-bands
  - benchmark-provenance-source-and-sample
  - advertised-pay-is-not-earnings
  - grounded-band-is-read-only
  - currency-lock-and-no-silent-conversion
  - refuse-to-quote-an-uncalibrated-market
---

# Compensation banding and market honesty

Every hiring conversation eventually collapses onto one number. A hiring
manager asks what the role should pay. A recruiter asks whether the approved
range will attract anyone. A candidate asks what the band is. Each of them is
asking for a scalar, and a scalar is the easiest thing in the world to produce:
any system, any model, any spreadsheet will emit one on demand, instantly,
with no visible sign of how much it knows.

That is the whole difficulty of this subject. A pay figure has **no natural
error bar**. Unlike a match score, which everyone treats as fuzzy, a salary
number arrives wearing the costume of a fact. It gets copied into a
requisition, quoted to a hiring manager, pasted into an advertisement, and
argued from in an offer negotiation — and at no point along that path does its
origin travel with it. Three weeks later, nobody in the organisation can say
whether it came from a national earnings statistic, from a scrape of job
adverts, from the last person hired into a vaguely similar role, or from a
language model that pattern-matched a plausible-looking figure.

This subject is the discipline of making a pay number **carry its own basis**,
of knowing precisely what each candidate source of that number measures, and —
the part most systems never implement — of being able to **produce no number at
all** when the honest answer is that you do not know.

## A band is a claim, and a claim has a basis

The unit of work here is not a number but a **band with provenance**: a low, a
midpoint or high, and attached to them the things that make them arguable —
which role family and seniority the band describes, which geography and market,
which currency and which period, what source the underlying figure came from,
what year that source measured, what was done to it since, and how many
observations stood behind it.

Strip any of those away and the number degrades in a specific way:

- **No role family and seniority** — the band describes a job title, and titles
  are not comparable across organisations. Two people with the same title can
  differ by a factor of three in scope; two people with very different titles
  can be doing the same job ([meaning does not live in a
  label](../../_laws.md#meaning-does-not-live-in-a-label)).
- **No geography** — you have averaged an expensive city with a cheap region and
  produced a number that is wrong in both.
- **No currency and period** — the most dangerous omission, because the number
  still looks right. A monthly figure read as annual, or a gross figure read as
  net, is off by a factor nobody notices until an offer is made.
- **No source and year** — the band cannot be defended, cannot be aged forward,
  and cannot be corrected when the source is revised.
- **No sample size** — the band may rest on four observations, which is not a
  market, it is an anecdote with decimal places ([a claim carries its sample and
  its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

The discipline is to treat every one of these as a *required field of the
number itself*, not as documentation kept beside it. A figure whose provenance
lives in a wiki page is a figure without provenance, because it will be copied
without the wiki page.

## The three sources, and what each one actually measures

There are only three families of evidence about pay, and practitioners get into
trouble by treating them as interchangeable.

**Earnings statistics** — structural earnings surveys, national statistics
offices, established compensation surveys — measure *what people are paid*.
They are the strongest basis for a market band and the only one that can
legitimately be called "the market". Their weakness is latency: collection is
periodic and publication lags collection, so a figure is routinely twelve to
eighteen months old before you touch it. That is a *correctable* weakness — you
age the figure forward by a stated factor and record that you did — which is
exactly why they are strong. A known, dated, correctable lag beats an unknown
bias every time.

**Advertised pay** — figures scraped from job postings — measure *what
employers write in adverts*. This is a different quantity with a different
distribution, and the difference is not small or random. Advertised pay is
censored (many adverts state no figure at all, and the omission is
concentrated at the top of the market, where employers prefer to negotiate),
self-selected (the employers who post figures are not a random sample of
employers), strategically shaped (a range posted to preserve negotiating room
is wider and lower at the bottom than what will actually be paid), and biased
toward the roles that are advertised most, which are the high-churn, lower-paid
ones. Advertised pay is a genuinely useful *leading indicator of movement* —
it is real-time, and it will show you a market turning months before a survey
does. It is not a measurement of pay. The technique
`advertised-pay-is-not-earnings` carries the full account of this, because it
is the mistake that this subject exists to prevent.

**Your own payroll and your own postings** measure *you*. They are the correct
basis for internal equity and the wrong basis for a market band. A team that
benchmarks against its own history will drift wherever it was already drifting
and will never see it, because the mirror agrees with it every time. The rule
that follows is absolute: **a market band is read from a shared corpus that the
consuming team did not write.** If a team's own postings feed the band the team
is then measured against, "the market" is a function of the team's own past
decisions and the measurement is void.

## Grain: role family by seniority, not title by title

A band is defined at the level of a **role family crossed with a seniority
anchor** — a small, deliberately coarse grid. Coarseness is the point: sample
sizes are finite, and every extra dimension you slice by divides your evidence.
A grid of a few dozen cells, each backed by hundreds of observations, is worth
more than a grid of thousands of cells each backed by four.

The seniority anchors must be defined by *scope and autonomy*, not by years of
experience and not by title words. Years-in-role is a weak predictor and a
discriminatory proxy in several jurisdictions; title words are organisational
dialect. Anchoring on what the person decides, what they own, and who depends
on them is both more accurate and more transplantable.

Between the anchors you interpolate, and you say that you are interpolating.
Outside them — above the top anchor, below the bottom, or in a role family the
grid does not contain — you do not extrapolate, you refuse. `role-family-by-
seniority-anchor-bands` sets out the grid construction and the interpolation
rules; `refuse-to-quote-an-uncalibrated-market` sets out the refusal.

## Modifiers are clamped, and the clamp is the honest part

Real bands get adjusted: for company type or stage, for a scarce specialisation,
for sector, for a particular city inside a national market. Every one of these
adjustments is an opinion, not a measurement, and each one multiplies the error
of the last.

Two rules keep modifiers honest. First, **every modifier is a bounded
multiplier with a stated range**, and the bound is enforced in code rather than
observed by convention — an unclamped premium compounds into a band that no
underlying observation supports. Second, **modifiers apply to a base that
already knows its own provenance**, and the resulting band inherits it: the
final number's basis is "this source, this year, aged by this factor, adjusted
by this named premium", not just the source. An adjusted number that still
claims the raw source's authority is the commonest quiet dishonesty in
compensation work ([inference must look like
inference](../../_laws.md#inference-must-look-like-inference)).

Rounding is the last modifier and deserves the same treatment. A band rounded
to a coarse grain is more honest than one quoted to the unit, because the
precision of the display is itself a claim about the precision of the estimate.
Never emit a market figure to a resolution the evidence does not support.

The rounding grain, though, is **a property of the market, not of the code**.
A grain that reads as sensible in a high-magnitude currency — snapping a range
to the nearest five thousand — will erase a figure entirely in a currency whose
typical monthly amounts are four digits. A grain left as a constant is correct
for exactly one market and quietly destructive in the next. The same is true of
the plausibility ceiling, the modifier clamps and the assumed default location:
every one of them is a market-shaped constant, and every one of them has to
move into the market record or it becomes a stranded literal.

## A grounded number cannot be hand-edited

When a band is derived by a documented procedure from named sources, it can
wear a label that says so — "market-grounded, sourced, high confidence". That
label is the entire value of the number, and it is also the thing a manual
override silently destroys.

The rule: **a field whose value carries a groundedness label has no manual
override.** Not a discouraged override, not an override that logs a warning —
none. The moment a human can type into that field, every consumer downstream
must treat the label as unreliable, because they cannot distinguish a derived
figure from a typed one, and the typed one is indistinguishable *and wrong
about its own provenance*. If a human needs to state a different number, the
number belongs in a different field with a different label, owned by a named
person ([every decision names its actor](../../_laws.md#every-decision-names-its-actor)).

This is counterintuitive to product instinct — the override looks like a
kindness to the user — and it is the rule practitioners most often have to
defend twice. `grounded-band-is-read-only` carries the argument and the
alternatives.

## The empty market is a valid configuration

The highest-leverage idea in this subject: **a market that has not been
calibrated must emit no number at all.**

Most systems cannot express this. A market is modelled as a configuration with
defaults, and the defaults are populated with something plausible so the code
path always returns. That plausible something is then quoted at a hiring
manager, printed in an advert, and defended in a negotiation, and it was never
anything but a placeholder someone typed while stubbing out a country.

Model the market as a **configuration record** — currency, period, a
plausibility ceiling, a rounding grain, the modifier clamps, and the default
seniority bands — and make the empty band list a **legal, deliberate value**
that routes to a human instead of returning a figure. An uncalibrated market
producing silence is working correctly. An uncalibrated market producing a
number is producing fiction with a confidence label on it ([say only what the
record holds](../../_laws.md#say-only-what-the-record-holds)).

The same configuration record carries the **plausibility ceiling**, which is a
different and equally necessary guard: an implausible figure — off by a factor
of a thousand, or in the wrong currency's magnitude — is caught before it
reaches a human rather than after. A ceiling that fires is not an error to
suppress; it is a signal that either the market or the derivation is wrong.

## Currency and period are locks, not fields

The failure that recurs most reliably when a language model is asked to price a
role is that it prices it in the wrong national currency. The pull toward the
dominant currency of the training distribution is strong, and a prompt that
does not lock the currency will lose to it — reliably, across model families,
and often while producing an otherwise excellent answer. The magnitude of the
error is large enough to invert every downstream comparison.

The mirror-image failure is worse and less visible: **magnitudes from one
market stamped with another market's currency label**. Default figures written
for a high-magnitude currency, left as constants and then rendered with
whichever currency the active market declares, produce a candidate-facing
number wrong by an order of magnitude or more — and wrong in a way that reads
as a deliberate, generous offer. The number is not corrupted, the label is not
corrupted; only their pairing is, and nothing in the type system notices. Any
constant expressed in money must live in the market record beside the currency
it is denominated in, never anywhere else.

Two consequences. First, the currency and period are **injected into the
grounded prompt as constraints and validated on the way out**, not hoped for.
Second, **nothing silently converts**. When a role's currency and a band's
currency differ and no dated, sourced conversion exists in the record, the
comparison does not happen and the system says so. A conversion applied from a
hardcoded or unattributed rate turns an honest "cannot say" into a confident
wrong answer, which is strictly worse ([absence of evidence is not
evidence](../../_laws.md#absence-of-evidence-is-not-evidence)). The same logic
extends to period: hourly against annual, gross against net, base against total
compensation. Comparability is a precondition, checked before rendering.

## Failure modes of the naive reading

- **Scraping adverts and calling it the market.** The single most damaging
  error in this subject, and the one that looks most like diligence. It
  systematically understates pay and inverts geographic rankings, because the
  places and roles where employers decline to state a figure are exactly the
  best-paid ones.
- **Slicing until the cell is empty.** Role family by seniority by city by
  sector by company size feels rigorous and ends with bands resting on single
  observations. Coarsen until each cell has a defensible sample, then say so.
- **Aging silently or not at all.** An unaged survey figure is stale in a
  moving market; an aged one whose factor is not recorded cannot be re-derived
  when the next release lands.
- **Quoting a precision the evidence lacks.** Emitting to the unit implies a
  precision no sample supports and invites a negotiation about a number that
  was never that sharp.
- **Letting a band be edited and keeping its label.** Covered above; the most
  common way a system starts lying without any single line of code lying.
- **A boolean where a three-state verdict belongs.** "Below market" as a
  boolean has no room for "cannot say", so the unanswerable case falls through
  to the reassuring default and the warning that should have fired is silently
  absent.
- **Benchmarking against your own postings.** Guarantees agreement with
  yourself, which is why it always looks like it is working.

## Where this subject ends

Four seams matter, and each belongs to a neighbour.

**Whether the range this role offers is competitive** — the pay-versus-market
verdict, its strict below-market definition and its currency guard — belongs to
the pre-publish fillability forecast, which consumes a band that already knows
its provenance and refuses to render a verdict against one that does not. This
subject produces the band; that one judges a role against it.

**Whether a figure appears in the advertisement at all**, and whether
"competitive salary" may stand in for one, belongs to inclusive job
advertising. Its rule — a pay statement must carry a figure with a currency and
a period, and an unapproved band means a blocked posting rather than a
euphemism — is the consumer-side counterpart of everything here. This subject
tells you whether a defensible number exists; that one tells you what the
posting may say when it does not.

**The offer itself** — what is actually extended, and the fail-safe that
prevents an unpriced draft from being sent — belongs to offer lifecycle and
deadlines. A band is an input to an offer, never the offer.

**Comparison across organisations** — publishing one employer's position
relative to others under a minimum-cohort rule — belongs to peer benchmarking
under anonymity thresholds. This subject uses a cohort floor for the narrower
reason that a small cohort is not a market; that one uses it to protect the
identity of the organisations in the cohort. Both floors exist and they are not
the same floor.

One boundary is not a neighbour but a hard limit: pay bands intersect
pay-transparency obligations, which in a growing number of jurisdictions
require a **good-faith range in the advertisement itself** — a range the
employer genuinely expects to pay at the time of posting, not one widened to
preserve negotiating room. A very wide posted range is a compliance risk in
some places, is read as evasive everywhere, and measurably deters applicants.
The obligation attaches to where the *work* may be performed, not to where the
company sits, which makes remote roles the strict case. The engineering
consequence is that a band must be defensible enough to *publish*, not merely
good enough to inform an internal conversation — which is precisely why every
rule in this subject is about provenance rather than about accuracy.
