---
layer: technique
type: technique
subject: accumulate-then-aggregate-metrics
technique: reduction-axis-vocabulary
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [a metric takes a boolean mean flag, a caller wanted per-class figures and got a scalar, a configuration file names a reduction as a string]
---

# Reduction-axis vocabulary

The accumulated buffer is a table: one row per sample, one column per class. A
reduction collapses one axis, the other, both, or neither, and there are two ways to
collapse an axis. That is seven outcomes with seven different shapes, and a metric
that exposes them through a single boolean has hidden six of them. The technique is
to **name the reduction by the axis it collapses**, keep the names in one closed
vocabulary whose members are strings, and validate every use against it.

## The vocabulary

Seven members, each with a result shape for a table of *N* samples by *C* classes:

- **none** — no reduction; the table itself, *N* by *C*. The input to any report.
- **mean over batch**, **sum over batch** — collapse the sample axis; one figure per
  class, length *C*. The per-class quality figure.
- **mean over channel**, **sum over channel** — collapse the class axis; one figure
  per sample, length *N*. The per-case figure that sorts a report.
- **mean**, **sum** — collapse both; a scalar. The headline.

"Batch" and "channel" are the names of the axes as they appear in the buffer, and
the member names follow the axes rather than the intent, because intent is what the
boolean flag tried to encode and failed at. A caller who reads *mean over batch*
knows what shape comes back; a caller who reads *mean = true* is guessing.

The count returned beside the figure follows the same shape: per class for a batch
reduction, per sample for a channel reduction, scalar for a full one, the full mask
for none.

## The composite has an order

*mean* is two reductions, and with undefined cells in the table the order matters.
Collapsing the class axis first gives each sample one value over its defined
classes; collapsing the sample axis then weights every case equally. Collapsing the
sample axis first gives each class one value over its defined samples; collapsing
the class axis then weights every class equally. A rare class pulls the second
figure and barely touches the first. Neither is wrong; one is chosen and **the
choice is written into the vocabulary's definition**, not left to whichever
implementation happened to be called. The count that travels with the composite
changes its predicate with the order, and the predicate is written down too: under
channel-then-batch the count is the number of *samples with at least one defined
class*, not the number of defined cells, and a reader who takes it for the latter
will divide by the wrong thing. The default this subject holds is channel
first, then batch — a headline that weights cases — because the per-class view is
already available under its own name, and a caller who wants the class-weighted
headline can take the mean of *mean over batch* and see the weighting they chose.

## An enumeration whose members are strings

The vocabulary is a closed enumeration and each member's value is its own name as a
string. The consequence is that a configuration file, a command-line flag, a
logging key and an equality comparison against a literal all work against the same
definition without a translation table — a member compares equal to its string, and
the string round-trips through any serializer. There is exactly one place the seven
names exist
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)):
the metric's constructor validates its argument against the enumeration, the
reduction function dispatches on the enumeration, and the report writer's summary
names are the same members. Two copies of the list — one in the metric, one in the
config schema — drift when the eighth member is added and only one of them learns
about it.

Validation is loud and helpful: an unknown name is an error at construction, not a
silent fall-through to *mean*, and the error names the nearest valid member, because
"mean_batch" and "batch_mean" are the same intent and a typo should cost a second,
not a debugging session over a scalar that should have been a vector.

## Where the reduction is applied

At aggregate, never at append. The buffer holds the unreduced table so that any
member of the vocabulary can be applied to it after the fact, and so that the
report writer can request *none* and compute its own summaries. A metric that
reduces at append has fixed the member at construction and thrown away the other
six; a metric that reduces at aggregate can be asked twice with two members and
answer both from the same rows. The constructor still takes a default member — the
one the loop's handler will use — but the aggregate accepts an override.

## When not to use it

A metric with no class axis — one scalar per sample — has a table with one column,
and the vocabulary collapses to three members: none, mean, sum. Do not expose the
batch and channel members on it; they are either identities or errors and either
way they lead a caller to reason about an axis that does not exist. Conversely, do
not extend the vocabulary to a third axis on speculation. A metric with a genuine
third axis — per-slice within a volume, per-timestep within a sequence — earns its
own members when it arrives, and the members name that axis.
