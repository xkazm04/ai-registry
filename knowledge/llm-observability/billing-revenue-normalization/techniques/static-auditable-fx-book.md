---
layer: technique
type: technique
subject: billing-revenue-normalization
technique: static-auditable-fx-book
status: forged
laws: [no-retroactive-restatement, never-present-absence-as-an-answer]
shared_with: []
use_when: [converting multi-currency revenue to one reporting base, choosing between a live FX feed and a snapshot, handling a payment in a currency with no known rate]
---

# Static, auditable FX book

Netting revenue against cost requires one reporting base, so cross-currency
amounts convert at ingest. The technique is *where the rates come from*: a
**static snapshot book** — a small, versioned artifact holding the base
currency and, per currency code, the base-currency value of one major unit —
loaded once at process start, carrying its own provenance (where the rates
were pulled from, when they were last verified), and changed only by an
explicit, reviewable edit.

The rejected alternative is the live FX feed, and rejecting it is the point,
not a budget compromise. Accounting must be deterministic and auditable: the
same report over the same records produces the same totals next quarter, and
an auditor can check out the book at the version that priced any record and
recompute it. A live feed silently re-prices between two runs of the same
report — margins move with nobody having decided anything — and reconstructing
"which rate did we apply in March" means archaeology against a third party's
history. Rate *precision* is not the product here; unit-economics decisions —
is this customer profitable, is this price sustainable — survive rates that
are weeks stale. They do not survive totals that will not stand still. This
is the no-retroactive-restatement law applied to currency: rates are stamped
into amounts once, at ingest, and correcting the book re-prices only what is
ingested afterward.

## The book's contract

- **One convention, stated in the artifact.** Rates are quoted as "base
  currency per one major unit of the currency", so conversion is a single
  multiply. FX sources quote both directions; a book that does not state its
  convention gets a reciprocal-inverted rate pasted into it eventually, and
  the error is a plausible-looking wrong number, not a crash.
- **Provenance travels inside the book:** the reference sources the rates
  were pulled from, the date last verified, and the convention note — so the
  file is self-explaining to whoever opens it a year later, and "how stale
  are we" is answerable by reading it.
- **Rates apply to major units only.** Minor-unit handling is the upstream
  step; a book that mixes decimal-shift into its rates has entangled two
  concerns and both become unauditable.
- **Hygiene at load:** codes uppercased; the base's own entry ignored (its
  rate is identically one — a stray entry must not shadow that); non-positive
  rates dropped loudly. A zero rate silently zeroes every conversion it
  touches.
- **One shared instance per process.** Ingest and every reporting surface
  read the same loaded book, so the number that was stamped and the caveat
  logic that inspects convertibility agree by construction.
- **An update is an edit with review:** pull reference rates from a central
  bank or equivalent published source, convert to the book's convention, bump
  the verification date, ship it like any change. Cadence is a policy knob —
  monthly is typical — and the staleness is *disclosed* by the book itself
  rather than hidden by the freshness theater of a feed.

## The missing rate: flagged, never silently base

A customer will eventually pay in a currency the book does not hold. Three
responses exist; two are wrong. Dropping the record loses revenue. Treating
the amount as already-base silently fabricates a conversion at whatever
error that implies. The correct response is **store at face value and
flag**: the amount carries into the base column unconverted, the record (or
the shared book, queried at report time) marks the currency as
non-convertible, and every aggregate containing such records surfaces the
caveat — which currencies, and that base-currency figures are approximate —
in the payload itself, not in documentation. The reader of a margin report
learns about the approximation from the report. The operator's fix is to add
the rate, at which point *newly ingested* records convert genuinely; what
was already stamped stays, per the restatement rule, unless a deliberate,
logged re-ingestion is chosen.

A missing or unparseable book at startup follows the same shape: fall back
to a base-only table, loudly, with every non-base record flagged — degraded
and disclosed beats crashed, and beats silently wrong.

## When not to use it

Businesses where FX movement is itself material — high-volume multi-currency
revenue where a stale rate shifts reported margin by whole points — need
dated rate *tables* (a rate per currency per period, still static and
versioned, applied by record date) rather than a single current snapshot;
that is more book, not a feed. And treasury operations that actually move
money across currencies need real market rates and belong to a different
discipline entirely. This technique prices *reporting*, and its ceiling is
honest: the book's own verification date tells you exactly how approximate
you are.
