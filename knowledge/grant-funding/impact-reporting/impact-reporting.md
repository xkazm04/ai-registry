---
layer: golden-path
type: golden-path
subject: impact-reporting
status: forged
use_when: [building a post-award reporting workflow or reminder system, drafting or reviewing a narrative report to a funder, aggregating outcomes across grants for a board or public audience, deciding what an org may claim publicly about its delivered impact]
techniques:
  - report-calendar-derivation
  - four-section-report-model
  - honest-misses-disclosure
  - shared-indicator-alignment
  - modeled-figure-marking
  - per-funder-track-record
  - verifiable-impact-certificates
---

# Impact reporting

Winning the grant is the middle of the relationship, not the end. Everything a
funder learns about an organization after the award — whether reports arrive on
time, whether the numbers reconcile, whether the narrative admits what went
wrong — determines the renewal, the reference call to a peer funder, and the
organization's standing the next time it applies anywhere. Post-award reporting
is therefore not paperwork appended to program work; it is the mechanism by
which a grantee converts one award into a track record. The principal
practitioner treats it as three connected disciplines: a **calendar** that makes
the recurring obligation impossible to miss, a **report craft** that earns trust
by being specific and honest, and an **impact ledger** that rolls delivered
outcomes up into claims a third party could check.

The stakes are asymmetric in a way newcomers underestimate. A mediocre proposal
loses one competition. A late or evasive report damages every future
competition: public funders restrict drawdowns and flag the recipient for
future awards, and private funders talk to each other far more than applicants
assume. Conversely, a modest program reported honestly and punctually is worth
more, reputationally, than a strong program reported late with inflated
numbers. The report is the product the funder actually receives for their
money; the program is what the beneficiaries receive.

## The calendar is derived, not remembered

Reporting obligations are calendar-driven and recurring, which makes them the
one post-award task that fails silently. Nobody notices a report that wasn't
written until the funder does. The discipline is to **derive** every due date
mechanically from the period the report covers, rather than trusting anyone to
remember it ([report-calendar-derivation](techniques/report-calendar-derivation.md)):
the period notation itself ("third quarter of a year", "a fiscal year") fixes
the period's end date; a grace window — commonly around thirty days for
foundation narratives and public funders' interim financial reports, stretching
to ninety for annual filings and one hundred twenty for final closeout — fixes
the due date; and each unsubmitted report lands in exactly one
bucket: overdue, due soon, or upcoming. The buckets, not the raw dates, are
what a human acts on. A reporting queue that surfaces "two reports due within
fourteen days, one overdue" turns a silent failure mode into a loud one.

Two derivation rules carry the honesty of the system. First, the funder's own
stated deadline always overrides the default grace window — the convention is
a fallback for when the award letter is silent, never a replacement for
reading it. Second, a period the system cannot parse must degrade quietly
rather than cry wolf: an unreadable label produces "no alarm" rather than a
false "overdue", because a queue that raises false alarms trains its users to
ignore it — and then the one real overdue report scrolls past unnoticed.

## The report itself: four questions, answered with specifics

Nearly every funder's narrative report, whatever its template, is asking four
questions: what did you do, who did it reach, where did the money go, and what
did you learn. A fixed four-section model — activities, beneficiaries,
finances, lessons — answers them in the order a program officer reads
([four-section-report-model](techniques/four-section-report-model.md)), and it
gives the writing process a completion contract: a report is not "in progress"
because a section contains a placeholder; each section must carry real
substance before it counts. Every section is funder-facing — a report has no
scratch space — so the completion bar applies to all of it.

Within the sections, two crafts distinguish a report that builds trust from
one that erodes it. The first is the **output/outcome distinction**: counting
sessions held is an output; showing what changed for the people in them is an
outcome, and funders have spent two decades telling grantees they want the
latter. A strong beneficiaries section states the count served, what portion
is attributable to *this* grant rather than general operations, and — crucially
— the data source (intake logs, attendance records), because a figure whose
provenance is named invites verification instead of suspicion
([provenance per field](../_laws.md#provenance-per-field)). The financial
section reconciles spent against budgeted and explains any material variance —
a common threshold is anything beyond roughly ten percent of a line — before
the funder has to ask. Variance itself is normal; unexplained variance is what
reads as either sloppiness or concealment.

The second craft is honesty about misses
([honest-misses-disclosure](techniques/honest-misses-disclosure.md)). The
lessons section is the one program officers read most closely, precisely
because it is the hardest to fake: an organization that names a shortfall, says
what it learned, and says what it will change demonstrates the learning
capacity a funder is actually investing in. A lessons section with no
challenge in it is not a clean record — it is a tell that the writer is
managing the funder rather than informing them. The discipline is structural:
a report that names no miss anywhere is treated as incomplete, not as good
news.

Beneath both crafts sits a measurement-design choice made long before the
report is drafted: which indicators the outcomes are counted in. Chosen at
award time from a shared sector taxonomy where one faithfully fits — and
declared bespoke where none does — indicators make an org's outcomes addable
across its own grants and legible inside a funder's portfolio roll-up
([shared-indicator-alignment](techniques/shared-indicator-alignment.md)).
The discipline matters more, not less, as funders lighten their formats —
shared annual reports, conversations in place of forms — because a lighter
report has room for only a few figures, and those few must already mean
something beyond the page they appear on.

Throughout, the cardinal law of the domain applies with full force: no figure
in a report is ever invented
([never fabricate a figure](../_laws.md#never-fabricate-a-figure)). Post-award,
the temptation shifts shape — from inventing need statistics to rounding
delivered numbers upward — but the rule is identical, and the exposure is
worse, because a reported figure is checkable against the org's own records
and the next report's baseline.

## Rolling up: the impact ledger and its two honesty markers

Across many grants, delivered impact aggregates into the numbers boards and
public audiences see: total dollars deployed, awards won, an estimate of what
the money enabled. Two rules keep the roll-up honest.

First, **only real money counts**. An award enters the ledger only when it is
actually awarded with a positive amount — pipeline, verbal commitments, and
zero-dollar recognitions stay out — and the same countability rule must govern
the headline aggregate and every breakdown beneath it, computed once and
shared, so the two can never drift into telling different stories.

Second, **derived figures announce themselves**. A number computed from a
model — dollars divided by a cost-per-job constant to estimate "jobs enabled" —
is not a headcount, and it must carry an approximation marker on the figure
itself, on every surface it travels to, not in a footnote nobody reads
([modeled-figure-marking](techniques/modeled-figure-marking.md)). The marker is
what lets an organization use a useful model without crossing into
fabrication.

The roll-up's most valuable cut is **per funder**
([per-funder-track-record](techniques/per-funder-track-record.md)): what each
funder gave and what it produced, largest first, with money that cannot be
attributed to a named funder bucketed visibly rather than dropped. This is the
table a renewal conversation is built on — but it is also where small-sample
lies live, so rates and averages over a handful of outcomes are suppressed
rather than published
([small samples stay silent](../_laws.md#small-samples-stay-silent)).

## Proof a stranger can check

The end state of the discipline is impact claims a third party can verify
without trusting the organization's own webpage — an attested record that a
specific grant deployed specific dollars, that the report on it was actually
submitted, and when
([verifiable-impact-certificates](techniques/verifiable-impact-certificates.md)).
The form matters less than the honesty contract around it: every attestation
names its checks and whether each passed — a verdict must never look clean
because a check was skipped
([clean is not ready unless every check ran](../_laws.md#clean-is-not-ready));
attestations expire, because an outcome statement ages, and an expired one
must never render as currently passing; and the strength of the verification
scheme itself is disclosed — a deterministic-but-unkeyed signature is an
integrity aid, not a forgery-proof guarantee, and presenting one as the other
is the same sin as the fabricated figure, committed by the tooling instead of
the writer.

## Failure modes of the naive reading

- **Reporting as an afterthought.** No derived calendar; the obligation lives
  in someone's head; the first signal of a missed report is the funder's
  email — or the restricted drawdown.
- **The victory-lap report.** All wins, no misses, adjectives instead of
  counts. Program officers discount everything in it, including the true
  parts.
- **Outputs dressed as outcomes.** "We held twelve workshops" answering a
  question about what changed. The funder asked what the money accomplished,
  not how busy the org was.
- **The silent model.** A modeled estimate published as if it were a count;
  one diligence question later, every other number is suspect too.
- **The drifting aggregate.** Headline totals and per-funder breakdowns
  computed by separate code paths with separate filters, eventually
  disagreeing in front of a board.
- **The over-claiming badge.** A "verified" seal whose checks didn't all run,
  whose expiry isn't enforced, or whose signature scheme is weaker than the
  seal implies.
