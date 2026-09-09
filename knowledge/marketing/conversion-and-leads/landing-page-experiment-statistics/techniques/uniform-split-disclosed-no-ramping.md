---
layer: technique
type: technique
subject: landing-page-experiment-statistics
technique: uniform-split-disclosed-no-ramping
status: forged
laws: [statistical-honesty-before-a-verdict, provenance-is-binary-and-labelled]
shared_with: []
use_when: [designing how visits are assigned to arms, deciding whether to shift traffic toward a leader, writing what an experiment page tells its visitor, checking whether the arms received the split they were promised]
---

# Uniform split, disclosed, no ramping

The two-proportion arithmetic that every landing-page verdict rests on assumes that
each visit was assigned to an arm independently, with equal probability, and without
regard to how the arms were doing. The assignment mechanism is therefore part of the
statistics, and it is pinned by a test rather than trusted: a split that drifts, or
that quietly favours the leader, makes every verdict the surface prints wrong in a way
no significance number can see. The mechanism is also part of the page's honesty to
the person inside it: a visitor in a randomised trial is told so, in plain words, with
what is and is not recorded about them.

## Procedure

1. **Assign per request, uniformly.** Draw one number in the unit interval, take the
   floor of the draw times the arm count, clamp the top edge, serve that arm. No
   weights, no learning rate, no bias toward the arm winning so far.
2. **Pin uniformity with a test, not a hope.** Inject the random source, draw ten
   thousand times over three arms with a deterministic well-spread sequence, and
   assert every arm sits within two percent of a third and that every draw landed on
   exactly one arm. A deterministic sequence rather than a real random source, so the
   assertion is a property of the picker and not a coin flip that fails once a
   fortnight.
3. **Decide identity honestly.** Sticky assignment needs per-visitor state - a cookie,
   a fingerprint, a stored id. A product whose analytics posture keeps none of those
   assigns per *visit*, and the trade is stated plainly: the test measures which page
   converts a visit, not which page converts a person; a returning visitor may see a
   different arm; a decision one arm started may be credited to the arm on screen
   when it finished. The trade does not bias toward any arm because assignment is
   uniform and independent of history, and it does not break the arithmetic because
   each view is its own trial and the conversion is attributed to the arm actually
   served. What it costs is a wider variance and a subtler question; what it buys is
   a page that keeps its no-cookie promise.
4. **Disclose on the page.** One paragraph the visitor can read: this page is part of
   an A/B test, a randomly chosen variant is shown, a later visit may show a
   different one, and no cookie or visitor data is stored - only a view and an action
   are counted. Not a footer link, not a policy page; beside the content.
5. **Attribute to the served arm.** The served arm's identity rides the rendered page
   into the conversion beacon, and the beacon accepts only an identity the page
   actually serves; anything else is a probe and is answered with silence. A
   conversion is then always counted against the arm that was on screen.
6. **Check the ratio.** Once per read, compare each arm's view count against the
   intended split with a goodness-of-fit test. Industry convention flags a tail
   probability below one in a thousand as a broken split - strict because the check
   runs on every test and a looser bar alarms constantly - and treats one in a
   hundred as borderline. A flagged test shows the imbalance and its likely cause
   (bot filter, redirect timing, cache, a crawler hitting one arm) and no verdict.

## Why ramping is forbidden

Shifting traffic toward the leader feels like prudence: why send half the visitors to
the worse page? But the leader's later visits then come from different days and
sources than the trailer's, its rate is measured over a different population, and the
comparison that was set up no longer exists. A bandit that re-weights on its own is the
same failure automated; it is a legitimate instrument when the goal is revenue during
the test rather than a verdict after it, and it must then be reported as a bandit with
its regret, never as an experiment with a winner. A test that quietly re-weights toward
the arm winning so far is how an A/B test becomes a self-fulfilling prophecy.

## Decision rules

- When a verdict is wanted, hold the split uniform for the life of the test, because
  the significance arithmetic assumes it.
- When per-visitor state is unavailable or refused, assign per visit and disclose the
  trade, because a hidden trade is a false claim about what was measured.
- When the ratio check fails, stop reading and diagnose the plumbing, because the
  imbalance is almost never chance and any result on it is suspect.
- When a visitor is in a randomised trial on a public page, tell them so on that page,
  because a test a visitor cannot see is a test run on them rather than with them.

## When NOT to use

- A revenue-first bandit, chosen and labelled as such, may re-weight; it simply may
  not be reported as an experiment result.
- An unequal split chosen *up front* for a reason - a risky challenger held to ten
  percent - is legitimate; the sizing then uses the unequal allocation, the ratio
  check tests against the intended ratio, and the split still never moves during the
  test.
- A per-person design that has consent and state may assign sticky arms; it then
  measures a different question and says so.
