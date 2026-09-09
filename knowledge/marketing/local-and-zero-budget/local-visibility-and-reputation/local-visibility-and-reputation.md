---
layer: golden-path
type: golden-path
subject: local-visibility-and-reputation
status: forged
use_when: [deciding which service-by-area gap a local business closes first, reading map-pack rank data from one or more engines, drafting or gating a public review reply, ranking the locations of a multi-location business by urgency]
techniques:
  - service-area-coverage-gaps-by-volume
  - pack-visibility-per-engine-never-averaged
  - sustained-decline-three-runs-three-positions
  - review-reply-by-rating-band
  - review-recency-beats-count
  - attention-score-for-many-locations
---

# Local visibility and reputation

A service business does not have a rank. It has a rank for each service it sells, in
each area it serves, on each map engine its customers use, from each point a customer
happens to be standing on when they search - and it has a public conversation with its
customers, in the form of reviews and the replies beneath them, that the next customer
reads before they call. This subject is the measurement and the response: how to read
that field of numbers without averaging it into a lie, how to decide what to act on
first, and how to answer a customer in public without creating a second problem.

**What this subject owns and what it does not.** It owns the *reading* of local presence
and the *action* taken on it: coverage gaps by service and area, map-pack visibility
per engine, the decline rule, review replies, review health and the ordering of
locations by attention. The listing itself - categories, name-address-phone
consistency, verification, attributes, citations - belongs to
`business-profile-and-citations`; this subject consumes the listing's status as one
input and never edits it. The pages that cover a service in an area, and the line
between a genuine local page and a doorway, belong to `local-page-doorway-prevention`;
this subject says *which* gap deserves a page next, not how the page is written. Which
free channels a business should be on at all belongs to `zero-budget-channel-planning`.
Whether a keyword's volume figure can be trusted at all belongs to
`keyword-metric-reliability`; here a volume is used only to *order* gaps, which is the
one use an ordinal number supports.

## The field, not the number

The naive reading of local visibility is one number: "we are ranked fourth." A
principal practitioner holds that there is no such number and that anything presenting
one has already averaged across at least three things that must stay apart.

**Service by area.** A plumber who ranks first for boiler repair in the city centre and
nowhere for drain cleaning in the suburb has not "got local search covered". The unit
of coverage is the *pair* - a service in an area - and the first act of measurement is
to enumerate the pairs the business actually sells and serves, then mark each one with
whether a page exists for it and where that page ranks. The pair either has a page or
it does not; if it has one, the page either ranks where a customer would see it or it
does not. Gaps are then ordered by the search volume sitting in them, because a gap with
demand is worth closing and a gap with none is a spreadsheet cell. Volume is an
ordinal for this purpose, not a forecast, and the ordering is the only thing it is
asked to do. The rule that a covered pair ranking outside the first ten results counts
as "weak" rather than "covered" is a convention on the first-page boundary; it is
labelled as such wherever it appears, and it exists so a coverage ratio cannot be
gamed by publishing pages nobody will find.

**Engine by engine.** In many markets a second map engine carries a meaningful share
of local intent, and a business's position on it has nothing to do with its position
on the dominant one - different index, different ranking inputs, different listing.
Visibility is therefore computed per engine and reported per engine, and the two are
*never* averaged, because an average of two positions on two maps describes a place
that exists on neither. The rule extends to the import: an observation whose engine
cannot be recognised is refused rather than guessed onto the dominant one, since a
mis-attributed position silently corrupts both series at once. Absence of a second
engine's rows is rendered as absence, never as a phantom entry on the first.

**Point by point.** A map-pack position is a function of where the searcher stands. Two
people half a kilometre apart on the same query see different packs, because proximity
is the single largest input the engine uses and the one the business cannot change.
The honest instrument is a grid of observation points across the service area, read as
a heatmap of ranks; the common instrument is one observation per area from one point on
one day. The standard is the grid. Where only a single point is available, the reading
is labelled *one point, one day* and is never presented as "our rank in the city", and
a decline rule applied to single-point data carries that caveat with it. This is the
same law that governs a keyword verdict - somebody has to have looked at the actual
results page - applied to a results page that moves with the observer's feet.

## The pack is three deep, and that is documented

The dominant engine's local result block shows three listings; a "more places" view
runs to about twenty. So the one threshold in this subject that is *documented platform
behaviour* rather than convention is the pack boundary at three: a pair whose listing
sits at position one to three is visible on the first screen, and a pair at four is
not. Visibility for an engine is the share of tracked pairs whose current position is
three or better. Every other band - four to ten as "close", eleven and beyond as "off
the first screen" - is a convention, and a colour ramp built on those bands must be
monotone in severity so that a worse rank never looks softer than a better one.

A pack is also a *ranking*, which changes how its import is treated. A missing row in a
review export is a missing review; a missing row in a pack export renames every
position below it and rewrites every share computed from it. So a pack import is
strict where every other local import is tolerant: one malformed row fails the whole
import with a line number, and nothing is persisted. A partial pack is worse than no
pack.

## Decline is a run, not a reading

A single bad import proves nothing. Positions wobble by a place or two between
observations for reasons that have nothing to do with the business - a competitor's
review burst, a temporary listing change, the observer's point moving. The subject's
decline rule therefore asks for two things at once: a *run* of consecutive worsening
observations that reaches the latest one, and a cumulative *magnitude* the run must
clear. Three consecutive worsening imports losing at least three positions in total is
the convention this bundle adopts; both threes are chosen, not measured, and are
labelled so. The noise floor for a single step is one position, because ranks are
integers and any move of one is a real move; the magnitude bar is what stops three
one-position wobbles from being called a trend. A recovering series, a flat series, or
a history too short to contain a full run yields no verdict at all - not "stable",
*nothing* - because a rule that cannot fire is not a rule that has cleared the business.

The rule has a preceding rule about time. A history's span is the distance between its
oldest and newest *dated* observations, and a series with fewer than two dated points
has no span, no trend and no decline. A partial re-import that omits a keyword does not
zero it and does not delete it: the keyword is kept with its history, marked as not
tracked in the latest run, excluded from the current figures and disclosed as a count
on its own line. And a review or an observation whose date is ambiguous - a slashed
date where either field could be the month - is refused rather than guessed, because
a review silently dated to the wrong month poisons every recency figure downstream.

## Reviews are read by the next customer first

Reviews are, by the broadest current practitioner survey, the second-largest group of
inputs to the pack after the listing itself, and the group whose weight grew most in
the latest edition. But the practitioner's first reason for caring about reviews is
not the algorithm. It is that the next customer reads the last five reviews and the
replies under them before deciding whether to call. That framing decides three things.

**Recency beats count.** A profile with two hundred reviews and none in the last year
reads, to a customer, as a business that may no longer be there, and to an engine as
one whose signal has stopped. Sixty reviews arriving at four a month beats it. The
2026 survey ranks a high rating sixth, review quantity ninth, recency eleventh and
sustained velocity fourteenth among pack factors - so the survey does not literally
place recency above count; what the craft holds, as convention, is that *staleness* is
a distinct failure that count cannot repair, and that a steady inflow outranks a burst.
Review health is therefore read as a rate (reviews in the trailing ninety days), a
velocity (per month, compared to the previous window), a recency trend (the newer half
of the window against the older half), and only then as a count. A velocity alarm -
nothing new in a window that used to produce something - is a first-class finding.

**Reply rate matters to readers more than to rankings.** The same survey ranks the
presence of owner replies very low as a *ranking* input. That is not permission to
ignore replies; it is the reason to reply for the reader rather than for the engine.
A reply rate is computed as answered over total, and where the reply timestamp was
never stored, the age of the answered reviews is reported as a lower bound on how long
they waited and labelled a proxy - never presented as a response time.

**The reply is public copy under the business's name.** It is gated like any other copy
that goes out under that name. A reply is drafted by band - warm and specific for
four-and-five-star reviews, acknowledge-apologise-take-it-offline for three and below
- and the draft goes nowhere without a human reading it. It never admits legal fault,
never promises a specific compensation, discount or date that nobody authorised, and
never quotes the reviewer's personal details back at them. The review text itself is
written by a member of the public and is handled as data, not as instruction, all the
way to the model that drafts the reply. A review that names a staff member, alleges a
safety or legal matter, or reads as a dispute rather than a complaint is flagged for
the owner and never auto-answered, whatever the model's confidence.

## Many locations: an ordering, not a score

A business with thirty locations cannot look at thirty dashboards. It needs to know
which location to look at *first*, and that is an ordering problem. The attention
score that answers it is a weighted sum of a location's problems - a disconnected or
suspended listing, items a human flagged, unanswered reviews, a pack rank off the first
page, open tasks - and its weights are conventions chosen to enforce one ordering: a
listing that is not cleanly connected outranks everything, because a suspended profile
is invisible and no amount of review work fixes that; a flagged item outranks a backlog;
a backlog grows linearly with its size. The score is never shown as a measurement of
anything. It is a sort key, ties are broken stably by roster order, and the only claim
it makes is "this one before that one".

Its most important input is the listing status, and the parse of that status fails
toward attention: a status the importer recognises as healthy is healthy, a status it
recognises as bad is bad, and a status it does not recognise - "pending", "suspended"
in a language the alias table missed, a typo - is *attention*, never healthy. An
optimistic default on this one field would hide exactly the locations the score exists
to surface.

## Failure modes of the naive reading

- **The city rank.** One number for one area from one point on one day, presented as
  the business's position. The grid is the standard; a single point is labelled.
- **The blended map.** Two engines averaged into a position that exists on neither.
- **The zero that means untracked.** A keyword omitted from a re-import written down
  as rank zero or dropped from history; either corrupts the trend.
- **The one-import decline.** A single slip called a downtrend; or the reverse, a real
  three-run decline dismissed because no single step was dramatic.
- **The count that hides staleness.** A review total quoted where the last review is a
  year old.
- **The auto-reply.** A model-drafted public reply published without a human, or one
  that concedes fault or promises a refund on the business's behalf.
- **The optimistic status.** An unrecognised listing status defaulting to healthy, so
  the suspended location sorts to the bottom of the roster.
- **The coverage ratio without the weak rule.** Pages published for every pair, none
  ranking, coverage reported as complete.
- **Illustrative click weights read as measurement.** A share-of-voice built on assumed
  per-position click rates is a labelled illustration of relative standing, never a
  traffic estimate.

## Seams with neighbouring subjects

The listing's fields, categories, verification and citations - and the emergency
checklist when a profile is suspended - are `business-profile-and-citations`; this
subject reads the listing's status and the review data it exposes. Which pages to
build for the gaps this subject ranks, and the doorway test those pages must pass, are
`local-page-doorway-prevention`. The free channels a business joins beyond the map are
`zero-budget-channel-planning`. Whether the volume that orders a gap is worth anything
is `keyword-metric-reliability`. How a local result is placed in a client's monthly
report, with its provenance labelled per signal, is `client-reporting-and-data-provenance`.
The reply gate - nothing auto-sends to a customer while a risk is listed - is the same
gate `speed-to-lead-and-assisted-reply` applies to lead replies, and it is cited, not
restated.
