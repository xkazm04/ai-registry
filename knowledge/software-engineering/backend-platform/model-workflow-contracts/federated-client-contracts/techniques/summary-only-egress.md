---
layer: technique
type: technique
subject: federated-client-contracts
technique: summary-only-egress
status: forged
laws:
  - count-carries-predicate
shared_with: []
use_when: [deciding what a site may return from a statistics or evaluation call, sites' histograms cannot be added together, reviewing an outbound payload for per-record content]
---

# Summary-only egress

A site returns aggregate statistics about its data and never a result about one
record. The technique has three parts: the aggregate is computed over the dataset and
carries only population-level figures; the parameters that shape those figures — bins,
ranges, the statistic set — are declared by the server before any site computes, so
figures from different sites can be combined; and the per-record intermediate results
the aggregate was built from are written to local disk and are absent from the
returned object by construction.

## What an aggregate is allowed to contain

Counts of records, of classes, of channels. Moments of intensity or feature
distributions — mean, standard deviation, percentiles. Histograms over declared bins.
Shape and spacing statistics as distributions. Label frequencies. Each of these
describes the population and can be recomputed by a site from its own data, and none
of them, alone, identifies a record. Two things are not allowed even though they are
cheap and tempting: a list of per-record values under any name (a "sample of cases",
a "worst ten"), and an aggregate over a population so small that its moments are the
records. The second is the site's rule to enforce: below a declared minimum count, the
site reports the count and withholds the moments.

The training set and the validation set are aggregated separately. Pooling them hides
exactly the discrepancy — a validation set drawn from a different scanner, a different
year, a different site altogether — that a statistics round exists to surface.

## The server declares the bins

Histograms are the statistic most worth having and the one most easily made useless.
Two sites that each pick sensible bins for their own intensity range produce
histograms whose bins do not align and whose sum is meaningless, and the server
discovers this after both have spent a round. So the server's request carries the
number of bins, the range, and which statistics it wants; every site computes against
that declaration; and the returned aggregate carries the declaration it was computed
under, so a server receiving two of them can verify they are addable before adding.
An aggregate that travels without the predicate that produced it will be combined
with an aggregate produced by a different one, and the discrepancy has no arbiter
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

The declaration is the server's, never a value the site invents — and not a default
the site falls back to either. When the request omits the bins or the range, the site
refuses the request with a message naming the missing key. A site-side default feels
harmless, but it is a second authority for the one vocabulary the technique depends
on: two client versions with two defaults produce two unaddable histograms under the
same absent declaration, and the server, which declared nothing, cannot tell. The
refusal is loud once and is fixed at the server; the default is silent forever.

## Per-record results stay on disk

An aggregate is computed from per-record results: one record's intensity moments, one
record's label counts. Those intermediates are valuable at the site — they are how an
operator explains a figure that looks wrong — and they are exactly what must not
leave. The rule is structural: the routine that computes the aggregate writes the
per-record table to a file under the site's working directory and returns only the
aggregate object. The per-record table is not filtered out of the return, not
truncated, not redacted; it is never placed in the returned structure at all, so no
later change to a filter can expose it. A reviewer checks this by reading what the
report verb constructs, not by reading the filter chain.

## Decision rules

When a statistic can be phrased as a distribution over declared bins, phrase it that
way rather than as a list of values; a distribution is addable and a list is a leak.
When the server's request names no bins or no range, refuse and name the missing
key; never default. When a set is smaller than the declared minimum, return the count
and no moments. When an operator asks for a per-record view, point them at the local
file and never add a verb that returns it. When an aggregate must carry an example —
a representative shape, say — carry the mode of the distribution, not a record's
value.

Do not apply this technique to metrics from evaluate as though they were exempt: an
evaluation metric is an aggregate too, and a per-case metric table is a per-record
result. Do not rely on the outbound filter chain to strip per-record content the
report verb placed there; the chain is for transforming legitimate payloads, and a
payload that needed stripping was illegitimate when it was built.
