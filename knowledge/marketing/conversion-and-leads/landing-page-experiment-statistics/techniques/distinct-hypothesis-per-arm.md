---
layer: technique
type: technique
subject: landing-page-experiment-statistics
technique: distinct-hypothesis-per-arm
status: forged
laws: [never-invent-proof, statistical-honesty-before-a-verdict]
shared_with: []
use_when: [designing the arms of a test, drafting challenger copy with a model, planning the next round after a loser, reviewing a test whose arms look alike]
---

# Distinct hypothesis per arm

A test can be statistically immaculate and still teach nothing, and the way that
happens is arms that differ in wording rather than in idea. Two differently worded
paragraphs about the same thing are not an A/B test: their rates differ by noise, the
test runs to its full sample proving that a page converts like itself, and the business
concludes that testing does not work. The technique is that every arm carries a named,
testable hypothesis - a different angle, a different lead benefit, a different offer
structure - that the set of arms is composed *together* so distinctness can be seen and
checked, and that a loser is a disproven hypothesis which is never proposed again.

## Procedure

1. **Name the hypothesis before the copy.** Each arm carries a label, a one-sentence
   testable hypothesis ("visitors choosing between quotes respond to a fixed-price
   promise more than to a speed promise"), and a rationale tied to the topic and the
   queries that bring visitors. The headline is written *to* the hypothesis, not the
   other way round.
2. **Differ from the control by concept.** The control's own angle is on the banned
   list for challengers; a challenger that re-proposes what the control already does
   is not a test of anything.
3. **Draft the set in one pass.** Whether a person or a model writes the arms, the
   arms are drafted together, so the writer can see what the others already say. A
   model drafting one arm at a time cannot know what it wrote for the others and
   reliably produces three pages with different adjectives. The one-call shape is
   what makes distinctness checkable at all.
4. **Validate distinctness structurally.** Normalise headlines (trim, fold case,
   collapse whitespace) and reject a set in which any two collide, with a message
   that names the failure: arms with the same opening sentence are one page served
   twice. Reject a set that returns fewer arms than requested, and bind each arm to
   the identity it was seeded with, so a draft that invents or drops an arm cannot be
   published as the arms being measured. A rejected draft is re-prompted once, then
   falls to a deterministic floor built only from the seed.
5. **Invent nothing.** A drafted arm carries no number, no guarantee, no price, no
   certification, no address or phone the seed did not supply; the result shape has
   nowhere to put a statistic. The numbers come from the test, not from the writer.
6. **Feed losers forward.** When a test ends, the arms whose uplift went negative are
   recorded as disproven angles, and the next round's brief carries them as "already
   tested and did not beat the control - do not propose these again" alongside the
   control's rate to beat. The next round's validator drops any proposal whose label
   matches a banned angle and requires at least two distinct, non-banned challengers
   to survive before the set is accepted.

## The incident behind the loser feed

A challenger-ideas prompt promised to avoid disproven angles and to target the
control's rate. The client sent both - the control's rate and the list of losers,
computed from the real experiment - and the request validator on the server copied
only the topic, keywords and control label onto the validated request. The two
highest-value signals were thrown away before they reached the prompt, and the prompt
promised behaviour the request layer made impossible. Nothing failed; the ideas were
plausible and blind. The lesson is structural: grounding that a prompt depends on is
asserted by a test that sends it and checks it arrived, because a dropped field
produces no error, only a worse test.

## Decision rules

- When two arms differ only in wording, merge them or replace one, because the sample
  they would consume buys no information.
- When a model drafts arms, draft all arms in one call and validate headline
  distinctness on the result, because an instruction to "be different" is not
  enforcement.
- When a loser exists, ban its angle in the next round, because re-testing a disproven
  hypothesis is spending sample to learn what is known.
- When a seed carries a hypothesis, the drafted arm follows it and is not free to
  reinterpret it, because the test is of the hypothesis, not of the writer's taste.
- When a draft cannot be validated, fall to grounding-only copy for that arm rather
  than publishing an unvalidated draft, because a page that is not the arm being
  measured corrupts the counter it feeds.

## When NOT to use

- A pure copy test - the same offer, deliberately varied in tone or length to learn
  about *wording* - is a legitimate design when the hypothesis is about wording;
  the hypothesis is then named as such and the expected effect is small, which the
  sizing must reflect.
- A multivariate design that crosses factors is a different instrument; each factor
  has its own hypothesis and the analysis is factorial, not pairwise.
- Two or three challengers is the practitioner range for a landing page; a set of six
  distinct hypotheses is possible, but the per-arm sample makes it a quarter's traffic
  for most businesses, and the honest advice is to run two rounds.
