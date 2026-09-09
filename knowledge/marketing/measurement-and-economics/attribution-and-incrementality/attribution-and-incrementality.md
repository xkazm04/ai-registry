---
layer: golden-path
type: golden-path
subject: attribution-and-incrementality
status: forged
use_when: [a report or prompt is about to say a channel "drove" or "caused" conversions, two ad platforms' conversion counts are being summed or compared, a budget change is being judged by what happened after it, offline or pipeline conversions are being fed back to an ad platform]
techniques:
  - platform-conversions-are-self-attributed
  - last-click-under-credits-prospecting
  - before-after-is-not-an-experiment
  - holdout-test-on-the-biggest-channel
  - triangulate-attribution-incrementality-and-mix-model
  - offline-conversion-upload-guards
---

# Attribution and incrementality

Every marketing number a small business sees answers one of three questions, and
almost every surface pretends it answered the third. *What happened* is description:
revenue this week. *What gets the credit* is attribution: a rule that hands each
conversion to the touches before it. *What was caused* is incrementality: how many of
those conversions would not have happened without the spend. A platform's conversion
column answers the second by a rule the platform chose, a before/after read answers
the first, both are typeset in the font of a causal claim, and the marketer moves
money as if the third had been answered.

This subject owns **what a marketing number may claim to have caused about a
channel**: the reading of platform-reported conversions as self-attribution, the
systematic under-credit of prospecting under a last-click rule, the descriptive status
of a before/after comparison, the holdout or geo test as the cheapest causal instrument
a small budget can afford, the triangulation of attribution, incrementality and a mix
model each with its own error, and the guards around feeding offline conversions back
to a platform without counting an order twice. It does not own the economics of the
spend - break-even, margin, profit per unit of ad cost belong to
`profit-on-ad-spend-economics`, and this subject hands it a causally honest revenue
figure rather than restating its rules. It does not own on-site experiments - sizing,
peeking and the per-challenger correction for a landing-page test belong to
`landing-page-experiment-statistics` in conversion-and-leads; the statistics of a
channel holdout rhyme with them and are cited, not copied. Whether a delta is real
enough to show at all belongs to `period-comparison-significance`; which channel or
cause explains a real delta belongs to `performance-root-cause-diagnosis`; and what a
client report may say, with what provenance, belongs to
`client-reporting-and-data-provenance`. This subject sits between them: once a move is
real and a cause is proposed, it decides whether the word "caused" may be used.

## A conversion column is the platform grading its own homework

An ad platform reports conversions it can tie to its own touches, under a lookback
window it chose, by an attribution model it chose, counting interaction types it
chose. On the dominant search-ad platform, the platform's own documentation now offers
exactly two models - last click and a data-driven model - with the data-driven model
the default for new conversion actions and older models migrated to it automatically;
its default lookback windows were reset in the same period. A view or an engaged view
of a video counts on some campaign types under a shorter window than a click. None of
these choices is wrong, and all of them are the platform's. The consequence is a
column that can only ever go one way: a platform never reports a conversion it could
not touch, and reports every conversion it could, so its count is an upper bound on
what it caused, produced by the party being paid for it.

The reading rule follows. A platform's conversion count is its self-attribution,
labelled as such wherever it appears - channel table, prompt, report line. It is fine
as a descriptive read and as the input the platform's own bidding needs; it is not a
causal read, and two platforms' columns are not addable. Each platform claims every
order it touched, so an order clicked on both is counted once by each, and a blended
series that sums two networks' conversion value per day has double-counted every
shared order. The honest blend sums cost - money spent is not attributed - and reads
conversions per platform side by side, or against the business's own order count,
the only denominator no platform can inflate; when the platforms together claim more
than the business booked, the gap is the overlap made visible.

## Last click pays the closer and starves the prospector

Under a last-click rule, the touch that immediately preceded the conversion takes all
the credit. Branded search, retargeting and a shopping ad on a product the customer
already chose are the touches that immediately precede most conversions, so they look
efficient. Display, video, a demand-generation campaign and every upper-funnel touch
that put the product in the customer's head look expensive, because the credit for the
demand they created was handed to the search that harvested it. Judged against one
return target, the prospecting campaigns trend red without being broken, and a triage
rule that reads last-click return on ad spend against that target will cut them first.

The posture is structural rather than sentimental. A campaign carries a funnel role -
performance, prospecting or unclassified - and the role decides which lens may judge
it. Performance campaigns answer existing demand and are fairly read by direct return;
prospecting campaigns create demand and are not, and their honest instruments are
reach at a cost, assisted reads labelled as such, and above all the holdout. A system
that encodes the role in a table and lets every threshold ignore it has documented
the problem and acted on the folklore. The under-credit is not a reason to exempt
prospecting from judgement; it is a reason to judge it with an instrument that can
see it.

The inverse trap is as common: retargeting reads as the account's best performer
under last click because it reaches people already on their way to buying. One
vendor's research across direct-to-consumer brands puts retargeting incrementality at
a fifth to two-fifths - vendor research, not a published paper, but the direction every
practitioner who has run the holdout reports.

## Before and after is a description with a date in the middle

The most natural read after any change - a budget shift, a new campaign, a landing
page, an agency - is the week after against the week before. It is a descriptive
read and a useful one: the projection said plus X, the touched campaigns then did plus
Y, and the gap between them is the beginning of calibration. It is not an experiment.
The account moved for many reasons in those fourteen days: weekday shape cancels only
when the windows are whole weeks, but seasonality, a competitor's sale, a stock-out, a
platform's model update, a public holiday and regression to the mean do not cancel at
all. A change made because a campaign was performing badly is followed by improvement
whether or not the change did anything, because badly-performing weeks are usually
followed by average ones.

A before/after read is therefore rendered as what it is: two equal, weekday-balanced
windows, a coverage floor before the read is trusted, the delta shown, and the word
"caused" absent. Stored beside a projection, the ratio between them calibrates the
projection's optimism, which is the one thing the read legitimately teaches. The
moment a surface says "the shift produced 12 % more revenue", it has claimed an
experiment it did not run.

## The holdout is the cheapest causal instrument a small budget can afford

The one instrument that answers the third question is withholding the treatment from a
comparable group and measuring the difference. For a channel, the group is a set of
regions: a geo test splits the market into treated and held-out regions, matched on a
pre-period of equal length in which they tracked each other, runs the channel in one
set and not the other, and reads the lift in the business's own conversions - not the
platform's column - between them. Practitioner convention in the current literature is
a hold-out of roughly a tenth to a fifth of the market, a test window of two to three
weeks stretched for low volume, and a pre-period at least as long as the test;
convention, not a law of anything, and stated as such.

A small business cannot afford to test every channel and does not need to. The rule
is to test the biggest channel first, because that is where the money is and where a
finding of "half of this was not incremental" changes the most spend. The second rule
is that the instrument scales down honestly where a user-level holdout does not: a
platform's own conversion-lift study needs a conversion volume most small accounts
never reach, whereas a directional geo test with a synthetic control - the held-out
region's counterfactual modelled from the other regions' pre-period relationship -
gives a usable planning signal on a small budget; the dominant search-ad platform's
open-source measurement stack added a geo-experiment tool in 2026 for exactly this.
The reading borrows the statistics of any experiment - a sample before a winner, an
interval not a point, no peeking - from the on-site experiment subject; what is
specific here is the unit (a region, not a visitor) and the denominator (the
business's own bookings, not the platform's column).

## Three instruments, three errors, one triangulation

Attribution is fast, granular and biased toward whoever the model favours.
Incrementality is causal, expensive and narrow - one channel, one period, one market.
A marketing mix model is broad and cheap once built, needs two or more years of weekly
data, and hands back a wide interval that its priors shaped. No one of them is the
truth, and the practice that has matured in the open-source mix-model libraries is to
use each to correct the others: a lift test calibrates the model's channel coefficient,
the model's channel shares sanity-check the attribution split, and the attribution
column stays as the daily operating read the platform's bidding runs on.

The discipline this subject adds is that each instrument states its own error and the
triangulation says which one it trusts for which decision: a shift between two
performance campaigns on one platform runs on attribution, whether prospecting should
exist runs on the holdout, the annual channel split runs on the model calibrated by
whatever lift tests exist. A surface showing "attributed", "incremental" and
"modelled" each with its window and interval has told the truth; one that averages
them has fabricated a fourth number nobody measured.

## Feeding conversions back is a measurement act with side effects

A lead-generation business converts days after the click, where no platform can see,
and a platform optimises only toward outcomes it is told about. Uploading the
qualified and won stages back, keyed on the click identifier the platform stamped, is
how it learns which clicks were worth having - and where every double count and
fabrication in this subject can be committed by a scheduled job at three in the morning.

The guards are structural. Only rows carrying a click identifier can be uploaded at
all, and the surface says out loud how many rows it dropped rather than writing a file
silently missing a third of the conversions. A conversion of unknown value is uploaded
with no value, never with zero, because the platform reads zero as "worth nothing" and
learns from it. A row uploads at most once: a marker written in the same pass the
acceptance was read, an upsert key that makes a re-qualification update its row rather
than mint a second, and a claim over the day so two overlapping runs cannot both send
the same unmarked rows. Nothing sends without a dry run the operator saw recently, and
a rejection is a different fact from an acceptance and is never confused with one. The
platform's own documentation adds two more: an offline conversion uploaded more than
sixty-three days after the click is not imported, and a duplicate on the platform's key
- identifier, action name, date and time - is counted once and answered with an error.
That platform-side deduplication is a backstop, not the guard; a second row with a
different timestamp is a second conversion to the platform.

The double count the guards cannot catch is the one the operator designs in: an online
form-submit action and an offline qualified action both marked primary, so one lead
counts twice in the column the bidding reads. One action per outcome, and only the
stage the business optimises toward marked as the one that counts.

## Failure modes of the naive reading

- **The added columns.** Two networks' conversion value summed per day and read as the
  business's revenue. Every shared order is counted twice; the more the channels
  overlap, the more the total flatters.
- **The red prospecting campaign.** A demand-creating campaign cut for failing a
  last-click target it was never fairly measured by, followed by a slow decline in the
  branded search that used to harvest it.
- **The heroic retargeting.** The account's "best" campaign, judged by a column that
  credits it with purchases already in progress.
- **The caused delta.** A before/after read narrated with a causal verb, then used to
  justify the next change.
- **The tested small channel.** A careful holdout on 5 % of spend while the biggest
  channel runs on its own column.
- **The averaged instruments.** Attributed, incremental and modelled figures blended
  into one number with no window, no interval and no owner.
- **The zero-value upload.** Unknown worth sent as worth nothing, and the bidding
  learning that qualified leads are worthless.
- **The re-sent batch.** A retry that re-posts accepted rows because acceptance was
  marked in a later pass than it was read.

## Seams with neighbouring subjects

`profit-on-ad-spend-economics` takes the revenue figure this subject has labelled and
asks whether it was profitable; the label travels with the number.
`period-comparison-significance` decides whether a before/after delta is
distinguishable from noise before this subject decides it is still not causal.
`landing-page-experiment-statistics` owns the arithmetic of a randomised on-site
test; a geo test borrows its honesty rules and changes the unit.
`campaign-anomaly-triage` reads platform columns against a target and is where the
funnel-role lens must be applied. `lead-quality-and-source-diagnosis` groups leads by
first-touch source, and the ledger this subject uploads from is keyed the same way -
the first touch is never rewritten by a later one.
