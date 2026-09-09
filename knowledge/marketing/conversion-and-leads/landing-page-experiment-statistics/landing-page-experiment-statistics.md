---
layer: golden-path
type: golden-path
subject: landing-page-experiment-statistics
status: forged
use_when: [declaring or refusing an A/B winner on a landing page, sizing a landing-page test before it starts, reviewing an experiment surface that shows a winner badge, designing how arms are assigned and served, drafting challenger arms for a running or finished test]
techniques:
  - sample-size-trust-gate
  - multi-arm-alpha-correction
  - peeking-guard
  - uniform-split-disclosed-no-ramping
  - distinct-hypothesis-per-arm
  - experiment-pages-print-no-numbers
---

# Landing-page experiment statistics

A landing-page test is the one place in small-business marketing where a causal claim
is genuinely available: two pages, one address, a coin flip per visit, and a count of
who acted. Everything else the business measures is descriptive. This subject owns
**whether a winner may be declared** from that count - the sample gate that precedes
any verdict, the correction that a third arm demands, the guard against reading a
running test, the assignment discipline that keeps the arithmetic true, the rule that
arms differ by hypothesis rather than by adjective, and the rule that an experiment
page prints no number and carries no search identity.

It does not own what the page says. `money-page-conversion-craft` owns the content of
the page being tested - the offer, the proof, the form, the call to action - and this
subject takes an arm as given. It does not own channel-level causality either:
`attribution-and-incrementality` owns whether a channel caused a sale, holdouts, geo
splits and the reasons a platform's own conversion count is not a cause. A landing
page test is causal about *the page*, for *the visits the split randomised*, and
nothing wider; a marketer who reads a page winner as proof that the campaign works has
crossed into that neighbour's territory and should go there.

The subject's whole stance is one sentence from the laws: an experiment needs its
sample before it needs its winner. The techniques are the six places where that
sentence is usually broken, and the mechanism at each place that keeps it.

## A verdict is a claim with three preconditions

The naive reading of an experiment surface is: the arm with the higher rate is
winning, and a significance number tells you how sure to be. Both halves are wrong
often enough to be dangerous. The higher rate on sixty visits is a coin's opinion, and
a significance number computed on a test that is still collecting is not the number
its name suggests. A principal practitioner holds that a winner exists only when three
things are true at once, and that the surface renders "not yet" as a first-class state
rather than as a smaller badge.

**Enough sample, per arm.** Before the test starts, the practitioner names the
smallest lift worth detecting, the false-positive rate the business tolerates, and the
power it wants - and from those and the control's base rate derives the visits each arm
needs. The verdict waits for the *smallest* arm to reach that number, not the total.
Fifteen percent relative lift, one in twenty false positives, four in five power are
practitioner defaults for a landing page, and each is a convention: a business that
would redesign a page for a five percent lift needs nine times the traffic, and one
that only cares about doubling needs far less. The sizing is fail-closed: when the
control has no conversions yet the required sample is not computable, and "not
computable" is a shut gate, not an open one. The technique is `sample-size-trust-gate`
and the incident behind its fail-closed clause is told there.

**A threshold that knows how many arms there are.** A test with a control and one
challenger asks one question. A test with three challengers asks three, and the chance
that at least one clears a one-in-twenty bar by luck is closer to one in seven. The
per-comparison threshold is tightened so the family-wise rate stays where the
business set it, and the tighter threshold is fed back into the sizing, so a third arm
honestly costs more traffic - which is the true price of asking a third question. The
technique is `multi-arm-alpha-correction`; it also says why a shared-control design
makes the elegant correction slightly optimistic and when the blunt one is the safer
choice.

**No verdict while the test runs, unless the gate is closed too.** A running test
whose confidence is checked every morning and stopped on the first good morning has a
false-positive rate several times the nominal one; a published derivation puts
continuous monitoring at roughly a quarter false positives for a nominal one in
twenty, and stopping at the first crossing has, in the limit, no error control at all.
The practitioner either fixes the horizon and refuses to read before it, or uses a
sequential method whose thresholds are built for repeated looks. The technique is
`peeking-guard`, and its central distinction is that a deliberately stopped test is
read on confidence alone, while a running one must clear confidence *and* the sample
gate, because the gate is what removes the reward for looking.

## The arithmetic assumes the split it was promised

Every two-proportion test carries an unstated premise: each visit was assigned to an
arm independently of every other visit and of how the arms were doing. Break the
premise and the verdict is wrong in a way no significance number can reveal.

The break that practitioners cause themselves is *ramping* - shifting traffic toward
the arm that leads so far, whether by hand or by a bandit that quietly re-weights. The
leading arm then receives its later visits from a different mix of days and sources
than the trailing one, its rate is measured over a different population, and the
comparison the test reports is no longer the comparison that was set up. The rule is
uniform assignment, held for the life of the test, with the uniformity itself pinned
by a test that draws ten thousand times and refuses a drift beyond a couple of
percent. Where the test measures visits rather than people - a cookieless split makes
every view its own trial - the cost is disclosed in plain language on the page
itself: a returning visitor may see a different arm, the split measures which page
converts a visit, and no cookie or visitor record is kept. Disclosure is not fine
print; it is what makes a randomised trial on a public page honest to the person in
it. The technique is `uniform-split-disclosed-no-ramping`.

The break that platforms cause is *sample ratio mismatch*: the arms were promised an
even split and the counts say otherwise. A bot filter that fires on one arm's markup,
a redirect that times out more on the heavier page, a cache that serves one arm to
everyone from a region - each produces an imbalance that is not chance, and a result
built on it is suspect before anyone looks at conversions. Practitioner convention runs
a goodness-of-fit check on the view counts against the intended split and treats a
very small tail probability - one in a thousand is the common industry bar, chosen
because the check runs on every test and a looser one alarms constantly - as "the
split is broken, stop reading". A surface that has no such check is trusting its
plumbing; the standard is to check.

## An arm is a hypothesis, not a wording

The most expensive failure in the subject costs nothing in statistics and six weeks in
traffic: three arms that are the same page with different adjectives. Their rates
differ by noise, the test runs to its full sample proving that a page converts like
itself, and the business learns that testing does not work. Two differently worded
paragraphs about the same thing are not an A/B test.

The discipline is that every arm carries a named hypothesis - a different angle, a
different lead benefit, a different offer structure - and that a set of arms is drafted
*together*, so whoever writes them can see what the others already say and a validator
can refuse a set whose headlines collide. When a model drafts the arms, the one-call
shape is what makes distinctness checkable at all; drafted one at a time the model
cannot know what it already wrote. A loser is a disproven hypothesis and is fed back
into the next round so it is never re-proposed; the control's own angle is banned from
the challenger list for the same reason. The technique is `distinct-hypothesis-per-arm`.

## The page itself is a measuring instrument

An experiment page has one job: produce independent trials. Two things spoil it. A
page that prints any number about itself - its rate, its visitor count, its lead over
the control - stops being a neutral stimulus and becomes a page whose content depends
on its own result; and a page that accumulates search identity ranks a URL that will
die when the test ends, indexes whichever arm the crawler drew, and lets organic
arrivals land on a page whose split they were never randomised into. So the payload
that describes an arm has no numeric field at all, all arms live at one address
because the split is what is being measured and a per-arm address lets a visitor
choose their arm, and the page is marked not for indexing while links are still
followed so the operator's own link check works. The technique is
`experiment-pages-print-no-numbers`; it sits on the same law as the rule that a
generated draft can invent no statistic - the schema, not the instruction, is the
enforcement.

## Time is a dimension of the sample

Reaching the per-arm number on a Tuesday afternoon is not the same as reaching it over
a fortnight. Weekday and weekend visitors arrive by different channels with different
intent and convert at different rates, and a sample drawn from part of the week is
systematically unrepresentative of the page's real audience. Practitioner convention -
and it is a convention, backed by the weekly rhythm rather than a theorem - is a
minimum runtime of two full weeks, ended on the same weekday it began, whatever the
sample arithmetic says; a low-traffic business-to-business page may need a quarter,
which is why a counter's retention window must be longer than any test the business
would honestly run. Runtime is the second gate, and a surface that shows only a
sample progress bar has stated half the condition.

## What the surface renders

The states, in the order a reader should meet them:

- **Broken split.** The view counts fail the ratio check. No rate is shown as a
  verdict; the finding is the imbalance and its likely cause.
- **Collecting.** At least one arm is below its required sample, or the runtime is
  short. Rates may be shown as observations with their counts; the leading arm is
  named as leading, never as winning; the progress bar reads against the smallest
  arm; the required number and the estimated date it will be reached are printed,
  because a refusal that names its own end is a plan rather than a dead end.
- **Sized but not significant.** Every arm has its sample and the runtime has passed,
  and the corrected confidence bar is not cleared. This is a finding: the arms do not
  differ by the amount the test was built to see. The control stays.
- **Winner.** Every gate cleared. The winner carries its uplift, its confidence, the
  corrected threshold it cleared, and the per-arm counts - the basis rides with the
  claim, and only from this state may a downstream surface mine a "winning angle"
  lesson or a challenger round build on the winner.
- **Stopped.** The operator ended the test deliberately. It is read on its confidence
  at the stop, labelled as stopped, and never quietly promoted to a winner it did not
  earn while running.

A zero-conversion control belongs in *collecting* with an empty bar, and a test with
no arms in a fully gated result rather than an exception - a surface that crashes on
the empty case is one nobody dares to open on a new account.

## Failure modes of the naive reading

- **The sixty-visit winner.** A badge on a rate whose denominator a person could
  count by hand.
- **The open gate on an empty control.** Sizing that could not be computed resolved
  to "enough", so a handful of challenger conversions against zero read as a large
  effect on a near-empty test. Told in full under the trust gate.
- **The third arm at the two-arm threshold.** Three questions asked, one bar
  applied, a false winner one time in seven.
- **The morning check.** Confidence read daily, stopped on the first crossing; the
  nominal one in twenty is a real one in four.
- **The helpful ramp.** Traffic shifted toward the leader; the leader's population
  changed; the comparison dissolved.
- **The uneven split nobody checked.** A bot filter or a cache broke the ratio, and
  the verdict was read anyway.
- **The adjectives test.** Three arms, one hypothesis, a full sample spent learning
  nothing.
- **The page that prints its score.** An arm whose content depends on its result.
- **The indexed arm.** Organic arrivals on a page they were never randomised into,
  ranking a URL with six weeks to live.
- **The Tuesday sample.** Per-arm number reached inside a partial week, read as a
  result about the whole audience.
- **The mined lesson from a leading arm.** A creative pattern extracted from a test
  that had not cleared its gates, feeding a fabricated "winning angle" into every
  later brief.

## Seams

`money-page-conversion-craft` owns what the arms say and how the page is built; this
subject takes arms as opaque hypotheses. `attribution-and-incrementality` owns
causality above the page - the channel, the campaign, the platform's own conversion
count - and the geo and holdout designs that answer it. `period-comparison-significance`
owns the honesty of before-and-after windows on time series, which is what a marketer
falls back to when no split was run; it is a description, and this subject is the
experiment it is not. `honest-proof-and-illustrative-data` owns the rule that a test
run on illustrative numbers is labelled and never mined as a track record; the mining
guard here consumes that label. `grounded-marketing-generation` owns the general
anti-fabrication machinery of which the no-numbers arm schema is one instance.
