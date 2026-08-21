---
layer: technique
type: technique
subject: beneficial-ownership-resolution
technique: role-period-reconciliation
status: forged
laws: [disclose-never-repair, provenance-or-nothing]
shared_with: []
use_when:
  - a tie's period comes from a secondary source and money timing matters
  - deciding whether payments fell inside a person's tenure
---

# Role-period reconciliation

A person-to-company tie is a claim about an interval, and the interval
usually arrives wrong. Secondary sources round role periods to years and
default the end date to "ongoing" — an open period is what a scraper writes
when it never saw the role end. The official register records the day a
function began and the day it ceased. Reconciling the two is the primary
temporal signal in beneficial-ownership work, and it routinely flips the
meaning of a story: in one measured first pass, the majority of the
highest-ranked ties turned out to be stale or to have all their money
postdate the role's registered end.

## The reconciliation

For every tie whose entity resolved and whose person the officer record
confirmed, compare the source period against the register's role validity
dates:

- **Source says ongoing, register records an end** → the tie is stale in
  the source. The register's end date becomes the tie's operative end; the
  disagreement is not silently overwritten but flagged — the reader sees
  that the card's end date comes from the register and the source's
  "ongoing" was inaccurate. On one live graph this single flag class
  covered a fifth of all ties.
- **Both dated, materially different** → the register wins for arithmetic;
  the delta is disclosed. Year-rounded source dates are expected noise;
  contradictions larger than rounding are review flags.
- **Register period is itself approximate** — old entries sometimes carry
  only a year — → carry an explicit "approximate dates, no day precision"
  flag, and never let day-level arithmetic pretend to precision the record
  does not have.

The reconciliation is a deterministic sweep over the full tie population —
never a per-tie editorial choice — and it is re-run from the register on
every re-ingest rather than re-derived from cached conclusions. Each
derived period cites the register record it came from; a period that cannot
name its record does not overwrite anything.

## Money against tenure: a four-way verdict, not a boolean

The point of accurate periods is placing money. The naive check —
"contracts signed while in role" as a yes/no — barely discriminates and
should be demoted. The workable vocabulary, assigned only after identity is
registry-confirmed, is:

- **current** — the matched role has no end date in the register;
- **historical** — the role ended, and at least some money fell on or
  before the end date (payments inside the tenure);
- **money-postdates-role** — the role ended and *every* payment postdates
  it. This is the exonerating category, and it must exist: without it,
  ended roles with later money read identically to sitting officers
  collecting contracts;
- **historical-no-money** — the role ended and the entity shows no
  reachable money at all.

One reading rule bought by a real misclassification: **undated money is
never "postdates"**. A payment whose date is missing cannot be placed on
either side of the role's end; it gets its own undated category. Defaulting
undated to either side fabricates a temporal fact in whichever direction
the default leans.

## The postdating boundary is a lead, not an acquittal

Money that postdates the registered role-end is not attributable to the
tenure — but the *transition itself* may be the story. The technique
therefore distinguishes, by machine trace, a clean handoff (the role ended
and the stake passed to persons with no established link to the subject)
from an unresolved exit, and labels the clean-handoff verdict for what it
is: a machine review that stops attribution of post-role money, explicitly
not a human confirmation of the tie or a finding about the exit. Revolving
doors, sale-to-relatives, and ownership windows adjacent to procurement
events all live just past this boundary; period reconciliation's job is to
draw the boundary honestly and hand what sits on it to a human.

## When not to use it

Reconciliation presumes a confirmed identity — reconciling periods for a
tie whose person the register never matched produces a precise interval for
a possibly wrong person, which is worse than no interval. It also presumes
the register is the freshest source for *ends*; for very recent role
changes the register lags reality, so a register-derived "current" is
"current as of the register's own timestamp", and that timestamp travels
with the claim. Finally, do not reuse this machinery for interval sources
of equal authority (two registers disagreeing) — that is a conflict to
disclose and adjudicate, not a reconciliation with a designated winner.
