---
layer: technique
type: technique
subject: funder-intelligence-index
technique: consent-scoped-contribution
status: forged
laws: [provenance-per-field]
shared_with: []
use_when: [pooling outcome data across organizations, wording an opt-in disclosure, handling opt-out against already-contributed data]
---

# Consent-scoped contribution

An intelligence index built on contributors' outcomes is only legitimate if
every contributor chose to be in it. Consent is not a checkbox recorded at
signup and forgotten — it is a **standing filter applied at every read**: the
pool of outcomes that enters any aggregation is exactly the outcomes of
organizations whose consent is currently true. This one design decision —
filter at read time, not at write time — carries most of the technique.

## Filter at read, so opt-out means what it says

If consent were enforced by refusing to *write* rows for non-consenting
organizations, an opt-out would only stop future contributions while
everything already contributed kept circulating — which is not what any
disclosure honestly describes. Filtering at read time makes consent
retroactive by construction: the moment an organization opts out, its entire
history drops from the next computed aggregate, with no migration, no
deletion campaign, no special case. The outcome rows still exist (they are
the organization's own operational record and may return if consent
returns); they simply stop being *contributions*.

Three rules complete the mechanism:

- **Unknown is out.** An organization with no recorded consent state — a
  missing profile, a row predating the consent feature — is excluded. The
  conservative default is the only defensible one; "we assumed yes" survives
  no audit.
- **Consent is per organization, not per row.** A contributor cannot
  meaningfully curate which losses enter the pool; selective contribution
  ("publish my wins") would bias the dataset and turn consent into an
  editorial tool. The choice is in or out.
- **The filter has one implementation.** Every read path that feeds a
  public aggregate goes through the same consent-filtering function. A
  second hand-rolled filter in a new endpoint is the future incident.

## Say what the toggle does, in the toggle

The disclosure at the moment of opt-in is a contract, and its wording binds
the implementation: *what* is contributed (one anonymized row per submitted
application — funder, program bucket, size bracket, fit score, outcome),
*when* (as you apply), and *the exit* (opt out anytime; your data leaves the
aggregates). Every clause must be true in code. The commonest breach is not
malice but drift — the disclosure promising "anonymized" while the row
gains a new field, or promising retroactive opt-out while a cache serves
stale aggregates for a month. Treat the disclosure text as a spec with an
owner, reviewed whenever the outcome schema or the aggregation changes.

## Consent and suppression are separate layers — keep them visibly separate

It is tempting to argue that k-anonymity makes consent unnecessary ("nobody
can be identified, so nobody needs to agree") or that consent makes
suppression unnecessary ("they agreed, so we can show anything"). Both
arguments are wrong, and the architecture should make the wrongness
inspectable: consent filtering is one function, suppression is another, they
run in sequence, and a reviewer can point at each. Consent is about
*authority* — whose data may be processed into the product at all;
suppression is about *inference* — what the processed output may reveal. An
index needs both because it has both obligations, to different parties.

## Provenance: the published pool describes itself

Per [provenance-per-field](../../../_laws.md#provenance-per-field), aggregates
built from a consented pool state their sourcing where they are served: a
provenance notice carrying the count of distinct contributing organizations
and the suppression floor — "live, n=37 contributing orgs (k≥5 suppressed)".
Two disciplines make the notice trustworthy rather than decorative:

- **One home.** The notice string is composed in exactly one place, and
  every route that serves index data attaches it from there. Two routes
  hand-writing their own notices will disagree within a quarter.
- **Sourced from the enforced constants.** The floor in the notice is the
  same symbol the suppression code tests against, and the contributor count
  is computed from the same consent-filtered pool the aggregates use. A
  disclosure assembled from copied literals is a disclosure that drifts.

## When not to use this

Consent scoping governs *cross-organization pooling*. It does not apply to
an organization's own private analytics over its own data (no pooling, no
consent question), nor to genuinely public source material — award lists a
funder itself publishes, government award databases — which carry their own
terms and no contributor to protect. Mixing regimes is the thing to avoid:
when a display blends contributor-derived aggregates with public-source
figures, each row's provenance note says which it is, because the reader's
trust model — and the legal posture — differs between them.
