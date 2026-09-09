---
layer: golden-path
type: golden-path
subject: budget-reallocation-prescription
status: forged
use_when: [turning a triage finding into a concrete budget move, deciding which campaigns donate and which receive, projecting the lift of a reallocation and saying how sure you are, building or reviewing the approval gate around live spend changes]
techniques:
  - donor-ranking-waste-vs-profit-destruction
  - pause-zero-return-before-shifting
  - donor-floor-and-movable-amount
  - linear-projection-with-confidence-cap
  - realized-vs-projected-calibration
  - guardrails-simulate-approve-revert
---

# Budget reallocation prescription

Triage tells a marketer that a campaign is below target, that another is bleeding,
that a third spent a month and returned nothing. None of that is an action. The
action is a sentence with money in it: *take this much from that campaign, give it
to this one, expect roughly this, and here is how to undo it.* This subject owns
that sentence - the step from a diagnosis to a quantified, reversible prescription
and the gate that stands between the prescription and a live account.

It does not own the diagnosis: which finding fires, in what order, with what
threshold, belongs to `campaign-anomaly-triage`. It does not own the economics:
break-even as the inverse of margin, net profit as the test of profitability, the
response curve that prices the next unit of spend, and the solver that allocates a
whole budget along fitted curves all belong to `profit-on-ad-spend-economics`, and
this subject cites them as the neighbour it leans on rather than restating them.
Whether the lift a move produced was *caused* by the move belongs to
`attribution-and-incrementality`; whether the month's goal is on pace belongs to
`goal-pacing-and-forecast`; a change that touches keywords rather than budget is
`search-term-mining`'s, even when it rides in the same approval bundle.

## What a prescription is

A prescription is a small, ordered list of moves. Each move has one donor, at most
one recipient, an amount in the account's currency, the efficiency of both ends at
the moment of recommendation, a projected gain, and enough of its own context
stored with it that it can be read back a month later without reloading the
account. A prescription that cannot be read back is not a prescription; it is a
button that once did something.

The principal practitioner holds four things true about that list, and the four
are the shape of this subject.

**First, donors are ranked by what their spend destroys, not by how far their
ratio sits from a target.** A campaign at half the target ratio spending a tenth
of the budget matters less than one just under target spending half of it. The
ranking metric is spend times shortfall - revenue waste when only a revenue target
exists, profit destruction when a margin is known - and the two disagree often
enough that a margin, when the business has supplied one, changes which campaign
is worst. That is the whole reason to thread a margin through: it re-orders the
donors and re-prices the gain, and it never invents or drops a move on its own.

**Second, a campaign returning nothing is not a donor; it is a pause.** There is
nothing to re-point. Its waste is its entire spend under any ranking, so it
out-ranks every partial donor by construction, consumes no recipient, and carries a
projected gain of zero - the gain is the saved spend, which the amount already
says. Pauses come before shifts in the list because they are the only move whose
projection is arithmetic rather than a claim about the future.

**Third, a projection is linear, small, and says how sure it is.** Money moved to
a recipient is assumed to convert at the recipient's current efficiency. That is
honest for a modest share of a donor's spend and optimistic for a large one, because
the recipient's marginal return will not hold as its budget balloons - the
equimarginal reasoning that governs the neighbour's curve solver says the *average*
return a campaign shows today is an upper bound on what its *next* unit will earn.
So the projection carries a confidence label that degrades past a stated share, the
share is labelled as convention, and once the business has a history of applied
moves, the median of realized-over-projected tempers the recipient half of every
future projection - never the donor half, whose loss is arithmetic.

**Fourth, nothing touches spend without a gate.** Simulate, check against blast-
radius guardrails, require an explicit human approval (with a breach requiring an
explicit override, not a warning), write the move to a ledger, and capture the
prior state of everything touched so that a revert restores exact values rather
than applying an inverse shift. A revert with nothing to restore is refused. An
apply that landed nothing is `failed`, never `applied`. These are the law
`a-gate-before-money-and-copy` made concrete, and a system that skips any step of
it is not safe to point at a client's money whatever its confidence claims.

## The order inside a prescription

Pauses first, then shifts, and within each group worst waste first. The reason is
not tidiness. A pause frees spend that a later shift might otherwise have moved
*into* a burner; a shift recommended before the pause has been decided is a shift
whose recipient list is wrong. The list is also capped - three moves is the
convention this subject was reconciled against, and it is a convention - because a
prescription is something a person reads and approves in one sitting, and a list
of twelve moves is a spreadsheet nobody reads.

Each donor and each recipient is used at most once per prescription. A donor drawn
on twice has its second amount computed against a spend that no longer exists; a
recipient funded twice has its second projection built on an efficiency the first
move already diluted. One use each keeps every projection honest against the state
it was computed from.

## Where the linear reading fails, and what the practitioner does about it

The naive reading of this subject is a spreadsheet: sort by ratio, cut the bottom
by a fixed fraction, add it to the top, multiply by the top's ratio, call it lift.
It fails in four places, and the techniques exist to close each one.

*It ignores what the donor can actually give.* A shift is a period total; the
account applies it as a daily budget delta; the donor must keep a small daily
budget so it keeps serving and its history survives. The amount a projection is
built on is therefore the amount the account can move, floored to what the donor
retains - or the projection over-promises by exactly the difference.

*It ignores the recipient's headroom.* A recipient already spending its full daily
budget and constrained by budget is the best case for a shift; a recipient
constrained by its auction, its audience or its own targets will not spend the
extra money at all, and the projection is a number about spend that never happens.
Whether a recipient is budget-capped is a pacing read owned by the neighbour; the
prescription must ask for it.

*It ignores the learning period.* Automated bidding re-learns after a large budget
or target change, and platform practitioners widely hold that a change beyond
roughly a fifth of a budget in one step risks a reset lasting one to two weeks with
worse efficiency during it. That figure is practitioner convention, not documented
platform behaviour, and a prescription labels it as such - but it is why a
single-step shift of forty or fifty percent of a donor is the kind of move that
should degrade its own confidence label rather than read as routine.

*It ignores seasonality and lag.* A shift applied on a Monday and measured over the
following week compares one weekday-balanced window against another and gets a
descriptive read, not a causal one. Conversion lag pushes part of the effect
outside the window; a promotion inside it swamps the move. The realized read is
still worth taking - it is the only feedback the projection will ever get - and it
is labelled as what it is, per `platform-reported-is-not-causal`.

The structural version of all four is that a prescription built from current
ratios alone is structure-blind. It is a defensible first move on a small share of
a donor; it is not a plan for restructuring an account. When a business has enough
daily history for a fitted response curve, the neighbour's marginal solver replaces
the linear projection, and this subject's job shrinks to ordering, flooring, gating
and calibrating whatever the solver proposes.

## The feedback loop, and its honesty

A projection that is never checked drifts into folklore. The loop that prevents it
is short: after a change set is applied, wait a full week, sum the touched
campaigns' value over the seven days from the apply day against the seven before,
and store both the delta and the ratio to what was projected. Windows are
day-aligned and equal in length so weekday shape cancels instead of being compared
away. A window the stored history cannot cover to a stated minimum is
`insufficient`, and insufficient is a state, not a ratio of zero - counting it as
zero would drag every later calibration down on missing data. A ratio against a
projection of zero or less is null, because dividing by nothing meaningful produces
a number wearing a measurement's clothes.

Once at least three sets are measured - the fewest that produce a median rather
than an average of one accident - the median ratio, clamped into a band a person
would still call plausible, becomes the multiplier on the recipient half of the
next projection. It is always disclosed on the set it shaped. A silently calibrated
forecast is worse than an uncalibrated one, because the reader can no longer tell
the model's optimism from the history's correction.

The loop is descriptive by construction. Realized minus projected says how wrong
the linear model was on this account; it does not say the move caused the delta,
and a marketer who reports it says so in the same sentence.

## What a good prescription reads like

"Pause campaign A: 14 200 CZK over the period, no conversions. Move 3 600 CZK from
campaign B (ratio 2.1, target 5.6) to campaign C (ratio 8.4, budget-capped);
projected +22 700 CZK conversion value at high confidence, tempered by a 0.8
calibration from five measured sets. Guardrails: within the per-move cap, three
moves or fewer, same network. Approve to apply; both budgets and A's status are
snapshotted for an exact revert." Every number in it is either the account's own
data, a stated convention, or a labelled projection - and a reader knows which.
