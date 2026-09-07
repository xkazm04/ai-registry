---
layer: technique
type: technique
subject: usage-pricing-models
technique: grouping-key-reruns-the-ladder
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [someone wants usage broken out by a dimension, adding a grouping key to a live charge, an invoice grew from one line to hundreds]
---

# A grouping key re-runs the whole model, which makes it a price change

A grouping key dimensions a charge: price this metered quantity **per region**,
per model name, per endpoint, per underlying currency. It looks like a display
concern. It is not.

When a charge carries a grouping key, the charge model runs **once per distinct
value**. Not the per-unit rate applied to sub-quantities — the entire model.
Tier ladders restart from the first tier. Free allowances are granted again.
Flat components are charged again. Package blocks re-round up from zero. Each
group becomes its own invoice line.

## Why it has to work that way

Because a line has to be reconstructible from itself. A line that reads
"region: north, 300 units, 12.40" must be checkable by running the model on 300
units, by a person who has the plan and the line and nothing else. If groups
shared one ladder, each line's amount would depend on which groups were priced
before it, and re-running the model on 300 units would give a different answer —
so the invoice would only be verifiable by replaying the whole period in the
right order. The independence is worth its cost, and its cost is the repricing
below.

## The consequence, stated as a warning

**Adding a grouping key to an existing charge reprices every customer on that
charge, and no line in the change looks like a price change.** The rate did not
move. The tiers did not move. The free allowance is the same number. A reviewer
reading the change sees a new dimension on a charge and approves a reporting
improvement.

The direction is not even uniform, which is why intuition fails here:

- **Per-group flat components multiply** by the group count. Upward, linearly.
- **Descending ladders restart** at their most expensive tier in every group,
  so a quantity that used to reach the cheap tail now never leaves the head.
  Upward, and by more than people expect — a customer whose usage was spread
  evenly over ten groups can lose the entire volume benefit.
- **Free allowances multiply** too, and that one is downward: ten groups means
  ten allowances, and a customer who was just over the threshold is now
  entirely free.
- **A charge with both** moves in a direction nobody has computed, and it moves
  differently per customer according to how their usage happens to spread.

So the rule is blunt: **a grouping key is a pricing attribute.** It is versioned
with the plan, reviewed the way a rate change is reviewed, and communicated the
way a price change is communicated.

## The procedure

1. **Establish the intent.** If the requirement is "we want to see usage broken
   down by X", it is a reporting requirement and the events already carry X.
   Group the events. Nothing about the charge needs to change, and nothing about
   anyone's bill does either. **A grouping key is not a reporting dimension.**
2. **If the intent is genuinely to price per dimension, price the delta first.**
   Take a representative period of real usage and price it both ways, per
   customer. Report the distribution, not the mean — the customers who move
   most are the ones with the widest spread, and they are not the biggest ones.
   If that comparison cannot be run, the key cannot be added, because the change
   is a repricing whose size is unknown.
3. **Decide each component's scope explicitly.** For the ladder, the free
   allowance, the flat component and any minimum: per group, or per charge?
   Write the four answers down. If the model cannot express the combination you
   want — a charge-wide allowance with a per-group ladder is the common one —
   say so and price accordingly rather than assuming the model does what you
   meant.
4. **Bound the cardinality, and validate it at ingestion.** Group count is
   invoice-line count. The key's value set must be a closed vocabulary with
   [one authority](../../../../_laws.md#one-authority-per-vocabulary), enforced
   where events enter, not discovered at invoice time. An open key — a
   customer-supplied string, an identifier, a free-text label — produces an
   invoice with thousands of lines, and converts a per-group flat component
   into a per-event fee. That is the failure mode that gets noticed by the
   customer's accounts-payable system rather than by you.
5. **Handle the absent value as its own named group.** Events with no value for
   the key are a real population. Dropping them loses revenue silently. Folding
   them into a default group mixes unrelated usage into a priced ladder and
   makes that line unreconstructible.
   [Unknown is not one of the definite values](../../../../_laws.md#unknown-is-not-a-value):
   give it a group of its own, labelled as unspecified, so it prices visibly and
   somebody can decide whether it should exist at all.
6. **Answer the empty-group question.** With a per-group flat component or
   minimum, does a group with zero usage this period owe anything? The two
   answers are both defensible and only one of them is yours. An unanswered
   question here resolves to whatever the iteration happens to enumerate, which
   is usually "groups that had events", and that makes the flat component
   conditional on usage without anyone deciding it should be.
7. **Communicate it.** Existing customers get notice, the way they would for a
   rate change, and the change lands at a period boundary. A repricing that
   takes effect mid-period is also a proration question, and one nobody expects.

## Decision rules

- **When groups differ in their rate, use separate charges, not a key.** Two
  charges with two rates read correctly on the invoice, keep one free allowance
  each by explicit choice, and do not restart a shared ladder. A key exists to
  apply *one* pricing model to *several* populations.
- **When the value set can grow without a code change, it is not ready.** A new
  region appearing in production creates an invoice line and possibly a flat
  fee. That belongs to a release, not to an event payload.
- **When removing a key,** the same warning applies in reverse and with the
  same invisibility. Removal merges ladders and allowances, and it is a
  repricing too.
- **When a customer disputes a dimensioned line,** the reproduction is that
  group's quantity through the whole model. If reproducing it requires the
  other groups, the implementation has shared state it should not have.

## When not to use this

- **High-cardinality or unbounded dimensions.** Per request, per session, per
  user-supplied tag. The invoice is the constraint and it is a hard one.
- **Dimensions that exist for analysis.** Cost attribution, capacity planning
  and per-team showback are reporting over the event stream. They do not need
  the invoice to change shape, and making the invoice carry them makes both
  jobs worse.
- **A charge whose model has no per-group state to reset** — a plain per-unit
  rate with no allowance, no tiers, no flat component. Grouping it is free
  arithmetically, and that is exactly why it becomes the precedent someone
  cites when grouping a tiered charge. Say out loud that the reason it was safe
  was the absence of a ladder.
