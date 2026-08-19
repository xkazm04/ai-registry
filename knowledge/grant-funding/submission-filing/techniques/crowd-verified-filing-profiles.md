---
layer: technique
type: technique
subject: submission-filing
technique: crowd-verified-filing-profiles
status: forged
laws: [small-samples-stay-silent, untrusted-text-is-data, provenance-per-field]
shared_with: []
use_when: [capturing filing ground truth at the mark-filed moment, aggregating org experience into per-funder guidance, deciding when crowd knowledge may override defaults]
---

# Crowd-verified filing profiles

Nobody holds better knowledge of how to file with a funder than an
organization that just did it — which portal, which documents were actually
demanded, how long it took, what confirmation the funder issued. The technique
turns that fleeting, distributed knowledge into a durable per-funder profile:
capture a structured contribution at the moment each org marks a submission
filed, aggregate contributions per funder, and grade the result's authority by
sample size. The profile sharpens with every filing; the discipline is that it
speaks only when enough filings agree.

## Capture: the mark-filed moment or never

The contribution is harvested in the same gesture as the status transition —
the one instant the filer holds the ground truth fresh. The structured fields:

- **portal URL** — where the filing actually happened,
- **documents demanded** — what the funder actually required, as experienced,
- **minutes spent** — wall-clock filing effort,
- **confirmation number / receipt reference** — the evidence fields (these
  also feed proof-of-filing; one capture serves both).

Every field is optional; a filer in a hurry contributes nothing and the
transition still succeeds. Capture friction is the enemy — a mandatory form
at the filed moment teaches users to route around the status entirely.

Two capture rules carry the trust model:

1. **Sanitize at the write boundary.** Contributions are user text destined
   for shared surfaces. URLs are accepted only with an http(s) scheme;
   strings are trimmed; numbers are validated finite and positive. A
   script-scheme "portal URL" is an injection attempt, not data.
2. **Sanitize again at every read boundary.** Storage may hold values that
   predate the write guard (or that bypassed it through another writer).
   Anything that becomes a link or enters a prompt is re-validated where it
   is used — defense in depth, because the store's history is longer than
   any one guard's.

A pragmatic storage note: a first version can ride an existing free-text
field as a tagged structured suffix — human note first, machine payload after
a sentinel tag — deferring the schema migration. The parser must then treat
absence of the tag as "no contribution," never as an error, since most
historical rows are plain notes.

## Aggregation: one profile per funder

Only records in a genuinely filed state contribute — drafts and abandoned
records hold no ground truth. Per funder, the aggregate is:

- **portal URL**: the most-reported value (first-seen breaks ties). Majority
  presence, not recency, is what makes a URL canonical.
- **documents**: admitted by strict majority of contributing filings — the
  consensus rule is its own technique (majority-rule-doc-consensus).
- **duration**: the median of contributed minutes. Median, not mean — one
  org's twelve-hour ordeal must not double everyone's estimate.
- **sample size**: the count of contributions backing the profile, stored on
  the profile itself. This is the provenance that everything downstream
  reads.

## Confidence: sample size is the authority dial

The profile carries a confidence tier derived mechanically from sample size —
for example, high at five or more contributing filings, medium at two, low
below that. The exact thresholds matter less than the structure:

- **Low-confidence profiles override nothing.** Consumers treat them as
  absent and fall back to deterministic or generic knowledge. One filing is
  an anecdote; publishing it as the funder's profile is a lie told with a
  true datum.
- **The tier travels with the data.** Every consumer receives
  `{value, sampleSize, confidence}`, not a bare value — the consumer's UI
  caption ("reported by N orgs") is generated from the provenance, so the
  claim and its ground cannot drift apart.
- **Thresholds are shared constants,** not re-derived per consumer, or two
  surfaces will disagree about whether the same profile is trustworthy.

## Decision rules

- **When a profile is below the trust floor, suppress it rather than hedge
  it, because** a hedged anecdote still anchors the user; silence routes
  them to the honestly-generic fallback.
- **When a contribution conflicts with the majority (different portal,
  extra documents), keep it in the sample rather than discarding it,
  because** today's outlier may be yesterday's profile going stale — the
  majority rule will flip when enough new reports agree.
- **When the same org files repeatedly, decide whether contributions count
  per filing or per org, and prefer per org for small samples, because**
  five filings by one org is one perspective, not five.
- **When displaying the duration, round and label it as a median of N,
  because** false precision ("takes 47 minutes") reads as a promise the
  data cannot keep.

## When not to use this

Do not crowd-source what an authoritative source already publishes — where
the funder's own requirements document is ingested, the crowd profile is a
cross-check, not the primary. And do not extend the mechanism to subjective
judgments ("this funder is friendly") — the technique's trust model rests on
contributions being verifiable facts of the filer's own experience;
opinions aggregated by majority are still opinions.
