---
layer: golden-path
type: golden-path
subject: delivery-analytics
status: forged
use_when: [assessing a team's delivery process from its change history, defining a delivery metric someone will act on, reading review or revert rates you did not collect yourself, deciding whether a delivery number may be shown at all]
techniques:
  - attribution-channels
  - review-coverage-rate
  - revert-linkage
  - batch-size-thresholds
  - off-platform-signal-detection
  - delivery-metric-denominators
---

# Delivery analytics

Delivery analytics reads a team's **delivery behaviour out of the artifacts its
change history already contains**: who and what produced a change, whether
anyone reviewed it, how large it was, how long it sat, and whether it had to be
undone. The material is exhaust — commits, change proposals, review records,
merge events, revert commits — produced for other reasons entirely, by people
who were not thinking about your measurement when they produced it. That single
fact is the discipline's founding constraint and the source of nearly every
mistake made in it.

The subject is not product instrumentation. Product usage analytics
([usage-analytics](../usage-analytics/usage-analytics.md)) instruments a
surface *you own* with events *you designed*, and its central problems are
vocabulary design, consent, and egress. Here you own nothing: the schema was
chosen by a code host, the fields were filled in by strangers, and the
behaviours you most want to see — a review that happened over a shoulder, a
change that was drafted by a tool that left no mark — leave no artifact at all.
You cannot add an event. You can only read better, and disclose what you could
not read.

Two properties follow, and everything below descends from them.

**A delivery metric is a claim about a population, and the population must be
stated.** "Review coverage is 61%" is not a finding until it says *61% of what,
observed how, over which window, excluding what*. The denominator is where
delivery metrics are honest or dishonest, and it is almost never the obvious
set: merges are not changes, changes are not work, a day is not a census of a
team's week. This is the
[delivery-metric-denominators](techniques/delivery-metric-denominators.md)
discipline, and it is the spine of the subject rather than one technique among
six.

**Absence of a signal is not absence of the behaviour.** The change with no
recorded review may have been reviewed in a room; the repository with no
tool-attributed commits may be full of tool-written code that arrived under a
human's name. A measurement system that reads absence as a zero manufactures
findings out of its own blind spots, and it does so in the confident register
of arithmetic. Every metric in this subject therefore ships with a stated
blind spot, and several of them ship with a *suppression rule*: conditions
under which the honest output is no number at all.

## The unit is the change, not the person

Every metric here is defined over changes and aggregated over a scope — a
repository, a team, a window. The moment a delivery metric is sliced to an
identifiable individual it stops being process measurement and becomes
performance measurement of a human, which is a different activity with
different consent, accuracy, and governance obligations. Those obligations are
owned by the [`people-analytics-ethics`](../people-analytics-ethics/people-analytics-ethics.md) subject in this bundle; this subject
defers to it entirely and does not restate its floors. What belongs *here* is
the engineering consequence: the aggregation boundary is a design decision made
at collection time, not a filter applied at render time. A store that keeps
per-author rows "just in case" has already made the per-person view available
to whoever writes the next query, and the safeguard degrades to a promise.

Even setting ethics aside, per-person delivery metrics are technically weak for
the reasons this subject spends its whole length on: attribution is
multi-channel and lossy, review is partly invisible, batch size is a proxy for
risk rather than effort, and the individual denominators are small enough that
noise dominates. The measure that is merely misleading at team scale becomes
actively false at person scale.

## Attribution is a channel problem, not a field lookup

Asking "what produced this change" feels like reading a field. It is not. The
same change can be declared through an account identity, a structured
message trailer, a branch naming convention, a message body phrase, or a
side-channel record kept by the tool that made it — and published census work
on tool-authored code has repeatedly found that any *single* channel recovers
a small fraction of what the union recovers, with account-identity lookup alone
missing an order of magnitude. A one-channel attribution scheme does not report
a low rate; it reports a wrong rate, and it reports it as though it were the
whole truth.

So attribution is read from an ordered set of channels with an explicit
precedence, one authoritative vocabulary of producers, and a recorded answer to
*which channel fired* — because a rate whose provenance is unknown cannot be
compared with the same rate collected a quarter later under a different channel
mix. The precedence order, the vocabulary, and the "unattributed" bucket that
must never be silently folded into "human" are
[attribution-channels](techniques/attribution-channels.md).

## Review coverage measures what the platform recorded, and says so

Review coverage — the share of changes that a second party actually approved —
is the highest-value cheap signal in the whole subject, and the easiest to
compute wrongly. Three traps recur:

- **Approval is not the same as protection.** A branch rule that requires *a
  review to be requested*, or that merely blocks direct pushes, is not a rule
  that requires an *approving* review. Reading the weaker setting as the
  stronger one produces a policy-coverage number that is simply false, and
  false in the reassuring direction.
- **Self-approval and rubber-stamping are inside the numerator** unless
  excluded on purpose. A second party must be a *different* party, and a review
  that arrived seconds after the change opened is evidence about the process
  worth surfacing separately, not evidence of scrutiny.
- **Small denominators dominate.** Over a week, a quiet repository's coverage
  is a coin flip rendered to two decimal places.

The definition, the exclusions, and the difference between *enforced* coverage
and *observed* coverage are
[review-coverage-rate](techniques/review-coverage-rate.md).

## Reverts are the cheapest failure signal and the most undercounted

A change that had to be undone is the only failure signal available from
history alone, without an incident system, a deployment record, or a human's
account of what went wrong. It is also structurally undercounted: a fix-forward
patch, a silent rollback of a deploy, a revert authored by hand without the
conventional message shape, and a revert of a revert all fall outside the naive
pattern. Undercounting is acceptable; *unstated* undercounting is not, and a
revert rate that is presented as a change-failure rate is a category error —
it is a lower bound on one failure mode. Linking a revert back to the change it
undid, so that the metric can name the batch size and review state of what
failed, is where the signal earns its keep:
[revert-linkage](techniques/revert-linkage.md).

## Batch size is a threshold judgment, not an average

Change size correlates with review quality and with the probability of being
undone, and the correlation is strong enough that size is worth measuring even
though it says nothing about complexity or risk. But the mean line count of a
team's changes is nearly useless: the distribution is heavily skewed, one
generated lockfile moves the mean by more than a month of real work, and no
decision hangs off "the average change is 217 lines". What decisions hang off
is *the share of changes above a size the team considers unreviewable*. That
turns size into a small, owned table of buckets with stated boundaries, a
stated exclusion policy for generated and vendored content, and a stated unit —
and the table is policy, versioned like policy, not a constant someone tuned
until the chart looked good:
[batch-size-thresholds](techniques/batch-size-thresholds.md).

## Some behaviour happens off the platform, and the metric must notice

The most damaging reading error in delivery analytics is treating an
unrecorded behaviour as an absent behaviour. Teams review in person; teams
review in a chat thread and merge without clicking approve; teams sign off in a
commit trailer their host does not model as a review. A coverage number
computed over such a team is not merely low — it is measuring a different
thing, and every downstream verdict built on it inherits the error.

The response is not to guess. It is to look for *positive evidence that the
behaviour happens elsewhere* — trailer conventions, sign-off lines,
consistently paired authorship, review discussion recorded outside the review
object — and, when that evidence is found, to **suppress the misleading metric
rather than adjust it**. A number that is wrong for a known reason should not
be shown with an asterisk; it should be replaced by the statement of the
reason. Detection patterns, the confidence bar for acting on them, and the
choice between suppression and additive credit are
[off-platform-signal-detection](techniques/off-platform-signal-detection.md).

## Nothing synthesized reaches a reader

Delivery reports are consumed by people making consequential judgments about
teams, vendors, and acquisitions. The hard rule, learned the expensive way by
everyone who has broken it: **a number that was not measured may not be
rendered as though it were.** No placeholder, no illustrative value, no
"simulated" fidelity tier that a later refactor forgets to gate, no forecast
projected from a series whose own type cannot support projection. The
enforcement that survives contact with a growing codebase is *typed*, not
disciplinary: if the model has no representation for a synthesized number, no
surface can render one. And the mirror rule: **absent is not zero.** A team
with no recorded spend, no recorded reviews, or no recorded changes has an
*unknown*, and "unknown" and "none" print differently or the report lies. The
general form of this rule — sample floors, null-versus-zero, what a report may
claim — belongs to the [`measurement-honesty`](../measurement-honesty/measurement-honesty.md) subject in this bundle; what this
subject adds is the delivery-specific catalogue of where the temptation
appears.

## The techniques

- [attribution-channels](techniques/attribution-channels.md) — reading
  producer identity from several independent channels with a declared
  precedence order, one producer vocabulary, and an unattributed bucket that
  stays visible.
- [review-coverage-rate](techniques/review-coverage-rate.md) — defining the
  reviewed share so that "reviewed" means an approving second party, with
  enforced-versus-observed separated and self-approval excluded on purpose.
- [revert-linkage](techniques/revert-linkage.md) — recognizing undo events and
  tying them to the change they undid, with the undercount stated as part of
  the metric rather than discovered by a reader.
- [batch-size-thresholds](techniques/batch-size-thresholds.md) — size as an
  owned bucket table with stated boundaries, units, and exclusions, reported as
  a share above a threshold rather than an average.
- [off-platform-signal-detection](techniques/off-platform-signal-detection.md)
  — finding positive evidence that a behaviour happens outside the artifact
  stream, and suppressing the metric it invalidates.
- [delivery-metric-denominators](techniques/delivery-metric-denominators.md) —
  every rate carries its population, its window, its exclusions and its sample
  size; minimum-sample floors; what a single point on a delivery trend is
  allowed to mean.
