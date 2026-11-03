---
layer: technique
type: technique
subject: model-composed-workspace
technique: view-choice-evaluation
status: forged
laws: [count-carries-predicate, claimant-does-not-adjudicate]
shared_with: []
use_when: [shipping a model that chooses which view to compose, a prompt change to the composer with no way to tell if view choices got worse, a model-arranged screen that looks fine in demos and loses users over a session]
---

# View-choice evaluation

A model that composes the screen is making a classification every turn - which
form the answer takes, which views, with which bindings - and a classification is
measured against labelled cases. Without that measure, every composer prompt
change ships on the strength of a handful of demos, and the demos are always the
cases where drawing something was right. The failure that matters most in this
field, a screen whose structure users stop accepting over a session, does not
appear in a demo at all; it appears in the second half of a long one.

## The labelled set

Each case is an **intent plus a data shape**, mapped to the expected form:

- the user's message (and enough prior turns to make it meaningful);
- the data the modules would return - including empty, partial and failing
  modules, because a composition over a failed module is a case of its own;
- the expected outcome: which form (prose, card, pane, composition, navigation or
  none), which views, which bindings, and where it matters, which slots.

**Negatives are first-class.** A set where every case expects a view rewards a
model that always draws one; the cases where the right answer is a sentence, a
question, or navigation to an existing screen are what make the score mean
anything. Aim for a set where a substantial share of cases expect no composition,
drawn from the real distribution of questions people ask, which is dominated by
facts and how-tos. The scenario discipline - versioned fixtures, stable identities,
discriminating cases - is [scenario-design](../../../evaluation-and-cost/eval-harness/techniques/scenario-design.md).

## What is scored, by which instrument

Score in layers, and move each layer as far toward deterministic assertion as it
will go ([assertion-vs-judgment](../../../evaluation-and-cost/eval-harness/techniques/assertion-vs-judgment.md)):

1. **Validity** - the reply passes the validation door: known views, known verbs,
   arguments in range, no figures in model-authored text. Asserted.
2. **Exact choice** - the form matches, the views match, the bindings match.
   Asserted against the label.
3. **Field relevance** - the composition shows what the question needed, not just
   the right component with the wrong columns. This is the layer a component-match
   score misses entirely, and it needs a judge - one **calibrated against people**
   on a sample before its scores are trusted, and kept stable across runs per
   [judge-stability](../../../evaluation-and-cost/eval-harness/techniques/judge-stability.md).

Every reported number names its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): "exact
choice on the eighty single-turn cases, judge version fixed" is a finding; "view
accuracy went up" is not.

## Two trigger error rates, never one

Report **false triggers** (the model composed when the label says it should not)
and **missed triggers** (it did not compose when it should) separately. They have
opposite fixes - one tightens the routing rules, the other loosens them - and a
single accuracy number lets an improvement on one hide a regression on the other.
Split both rates by kind of user and kind of task as well: a router can be well
calibrated on average and biased against opening anything for exactly the people
who would use it most, and only a split rate shows it.

## Whole sessions, not just turns

Single-turn cases cannot see drift. Add **multi-turn sessions** - scripted or
replayed - long enough to have a first half and a second, with sub-task changes
inside them, and score per turn:

- **acceptance early versus late** - the share of compositions accepted (kept, not
  undone, not dismissed) in the first half against the second;
- **user-undone rearrangements** - how often the next action was an undo or a
  dismissal;
- **rule violations** - compositions that broke a standing rule the session had
  established (a pinned view evicted, a dismissed view re-proposed);
- **stale-rule leaks** - rules from a finished sub-task applied to the next.

In one session-long study, per-generation acceptance across a whole session was
exactly the measure that caught a fall from about seven in ten to one in three
that a first-turn score would have missed. In production, the same signals -
undo, dismiss, re-pin - are logged per composition and watched as a trend.

## Seeded errors measure reliance

A composition that is wrong but well-presented is accepted more readily than the
same mistake in prose, and explanations and cited sources increase trust whether
or not the output is correct. So the evaluation includes **seeded wrong outputs** -
a composition with a plausible wrong binding, a view showing the wrong account -
shown to people in a study, measuring how often they catch it, alongside task
accuracy, time on task and satisfaction. There is no settled metric for
overreliance; report what was measured and how, and treat a rise in satisfaction
that comes with a fall in error-catching as a regression.

The model's own explanation of why it chose a view is displayed to the user and
never scored as evidence of a good choice
([claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate)):
the label and the user's actions decide, not the "why" line.

## Decision rules

- **When a composer prompt or vocabulary changes, run the set before shipping**,
  and compare both trigger rates against the previous version, not just the total.
- **When the set has no cases expecting "none", it is not ready.**
- **When the judge disagrees with people on its calibration sample beyond your
  tolerance, do not report its relevance scores.**
- **When late-session acceptance falls below early, look at arrangement memory
  first** - lost or stale rules are the usual cause.

## When not to use this

- **A fixed composition.** If the model fills a layout that never changes form,
  there is no view choice to measure; evaluate the content instead.
- **As a substitute for consent.** An evaluation measures how often the model
  chooses well; it does not make any single data-changing proposal safe to apply
  without the user's approval.
