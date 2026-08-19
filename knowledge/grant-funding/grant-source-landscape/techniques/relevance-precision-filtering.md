---
layer: technique
type: technique
subject: grant-source-landscape
technique: relevance-precision-filtering
status: forged
laws: [honest-null-over-forced-guess, hard-gates-precede-soft-scores]
shared_with: []
use_when: [a source returns more than live grant opportunities, filtering status codes or mixed search indexes at ingest, closed or irrelevant rows appear in matches]
---

# Relevance precision filtering

Almost no source is scoped to exactly "live grant opportunities". National
export files carry every call ever published, most of them closed. General
government search indexes return news stories, statistics releases and loan
schemes alongside grants. Clearinghouse queries default to including
archived rows. The corpus, however, promises *actionable calls only* — and
that promise is kept by deterministic filters at the ingest boundary, per
source, before any row is stored. Filtering downstream (at match time, in
the UI) means the corpus itself lies about its size and every consumer must
re-implement the same screen.

Two distinct filtering problems hide under one name, with different tools.

## Status filtering: allowlist, never blocklist

Where the source carries a status vocabulary (open, forthcoming, closed,
cancelled, suspended, archived — often as opaque codes or in the
publisher's language), keep the rows whose status is on an explicit
**allowlist of actionable states** — open plus announced/planned variants —
and drop everything else.

The direction of the list is the whole technique. A blocklist ("drop
closed, cancelled, ended…") fails *open*: the day the publisher introduces
a status string the list has never seen, the unrecognized rows leak into
the corpus — and since publishers retire calls far more often than they
open them, the leak is overwhelmingly closed calls wearing a new label.
An allowlist fails *closed*: the unknown status is excluded until a human
looks, which is exactly the honest-null posture applied to classification.
Expect the numbers to justify the ceremony — in a typical national export,
roughly three quarters of rows are in terminal states and are dropped at
ingest.

Practical rules for the allowlist: match case-insensitively and
trim-tolerantly on the publisher's own literals (or codes), keep the list
short and commented with translations where the vocabulary is not in your
working language, and count what you drop per run so a vocabulary change
shows up as a drop-rate anomaly rather than a silent corpus shift.

Forecast/forthcoming states belong ON the allowlist: an announced call is
actionable for preparation, and its status travels with the row.

## Signal filtering: mixed indexes need noise screens plus a positive signal

Where the source is a general index rather than a grants system — a
government-wide search that indexes all published content — status fields
do not exist and the problem inverts: most results are not opportunities at
all. The layered screen, in order:

1. **Drop structural noise by document type.** News stories, press
   releases, speeches, statistics, consultations — the publisher's own
   content-type taxonomy is the highest-precision signal available; use it
   before touching any text.
2. **Guard against the near-miss category.** Every domain has one: for
   grants it is *loans and student finance* — services that legitimately
   match "funding" but are not grants. A targeted title guard (loan terms
   present without any grant term) removes them; a row naming both is the
   rare mixed page and survives.
3. **Drop utility pages** — contact forms, feedback pages — that match any
   query.
4. **Require a positive signal.** After the noise screens, a row must
   still affirmatively look like an opportunity (grant/fund/scheme/subsidy
   vocabulary in its title or description). Absence of noise is not
   presence of a grant.

Calibrate the positive signal **conservatively toward recall**: real
schemes carry unhelpful names, and a signal list tuned tight enough to be
elegant starts dropping genuine programs. The noise screens carry the
precision burden; the positive signal is a broad net behind them. Keep the
screen a pure, unit-tested function over the row — deterministic filters
are testable against captured fixtures, and this screen is exactly the
kind of hard gate that must not be replaced by a soft relevance score.
Scored ranking happens later, on rows that already passed; a model may
rank the corpus, never admit to it. And the row's text is data being
classified — nothing inside a scraped listing gets to argue its way past
the gate.

## Decision rules

- When the source has a status vocabulary, allowlist actionable statuses;
  when it has none, run the layered noise-screen-plus-positive-signal
  chain.
- When an unrecognized status appears, exclude it, log it, and extend the
  allowlist deliberately — never patch by widening a regex under time
  pressure.
- When precision and recall trade off, spend structured fields (types,
  statuses, taxonomies) on precision and free text only on the final
  broad positive signal.
- When tuning any screen, measure it: rows in, rows dropped per rule, and
  a handful of named true-positive survivors as regression fixtures.

## When not to apply

Do not apply actionability filters to awarded-history ingestion — history
is *supposed* to be closed; filtering it to "open" empties it. And when a
corpus deliberately retains closed calls for pattern analysis, keep them
under a separate flag or store rather than weakening the live corpus's
gate — one corpus serving both masters serves neither.
