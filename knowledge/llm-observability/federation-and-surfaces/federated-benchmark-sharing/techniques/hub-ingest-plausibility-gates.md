---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: hub-ingest-plausibility-gates
status: forged
laws: [aggregates-leave-identity-behind, server-owns-the-accounting-clock, never-present-absence-as-an-answer]
shared_with: []
use_when: [accepting contributed statistics from parties outside your trust boundary, deciding whether a bad field is clamped or the whole entry rejected, writing the trust policy for a federation hub]
---

# Hub-ingest plausibility gates

The hub's trust policy should be one function in one place: everything the
hub is willing to believe from a contributor, written down where it can be
read, tested, and quoted verbatim in the federation's documentation. Scatter
the checks across ingest, storage and merge, and the effective policy is
whatever the union of code paths happens to permit — which nobody can state,
so nobody can defend.

## Clamp values, reject counts

The load-bearing distinction is between numbers that are *measurements on a
known scale* and numbers that are *weights the merge will trust*:

- **Bounded scores are clamped.** A quality of 1.4 or a pass rate of −0.2
  on a `[0,1]` scale is a rounding or serialization artifact; clamp into
  range and keep the entry. Rejecting an otherwise-sound contribution over
  float dust punishes honest contributors for their toolchains.
- **Counts are rejected.** A case count is the weight this entry will carry
  in every merged row it touches. Clamping an implausible count to the
  ceiling *launders* it — a fabricated billion becomes a credible million,
  admitted at maximum believable influence. Rejection returns the problem
  to its owner: the contributor learns their payload was refused and why,
  instead of the federation quietly absorbing a lie at reduced volume.
- **Nonsense auxiliaries are dropped to absent.** A negative variance, an
  unrecognized enum label — drop the field to "not recorded" and keep the
  entry. Absence is honest and merges honestly (a null variance means "no
  interval", never a fabricated one); a clamped negative variance would be
  an invented measurement.

The plausibility rules themselves are arithmetic, not heuristics: every
number finite (nothing non-finite smuggled through the serialization
format); at least one run; **cases ≥ runs** (a run scores at least one case,
so the inverse is impossible, not merely unlikely); cases below a hard
per-bucket ceiling (a million scored cases in one bucket is a typo or an
attack, never a benchmark); per-case cost below an absurdity line. Each
rule should be justifiable in one sentence to a contributor whose payload
it refused — "your numbers are arithmetically impossible" survives that
conversation; "our anomaly model didn't like you" does not.

## Distinguish the two refusals

Return *malformed* (no usable identity, empty fields, zero cases — "you
sent junk") separately from *implausible* (structurally fine, not
believable — "your numbers fail arithmetic"). The first is a bug report for
the contributor's pipeline; the second is a policy statement, and possibly
an incident: repeated implausible submissions from one credential are a
signal the hub should be counting, and folding both into one error code
destroys it.

## Normalize identity, stamp receipt

Two more things happen at the same gate, because ingest is the last moment
they are cheap:

- **Model identity is normalized** through an alias table — provider
  prefixes stripped, dated snapshot names collapsed, synonym providers
  mapped — so equivalent spellings merge into one leaderboard row instead
  of fragmenting the evidence and silently diluting every floor that counts
  rows and sources.
- **The hub stamps its own receipt time** and keys retention on it. A
  contributor-asserted timestamp is a client-writable field feeding
  accounting; the hub's clock is the one that governs what "recent enough
  to publish" means. The contributor id likewise derives from the issued
  credential the request authenticated with — never from a name asserted
  inside the payload, which would let one party contribute as another.

## Every field, every version, or the gate is theater

The gate must cover the whole schema, including every field added later —
each new field arrives with its clamp/reject/drop decision or the schema
change is not done. The vocabularies clamped here (task categories, rigor
levels, judge families) are the same closure that keeps categorical
fingerprinting impossible; an enum the gate forgets to clamp is a free-text
channel reopened. And gates run *in addition to* merge-side influence
bounds, not instead: the gate bounds the magnitude of a lie, the merge
ceiling bounds its share, and each covers the other's residual.

## When not to use it

Don't grow the gate into content-based anomaly detection — refusing entries
because their *quality scores* look statistically unusual lets the hub
editorialize the leaderboard and will eventually reject the honest outlier
that was the most valuable data point on the board. Plausibility means
"arithmetically possible for a benchmark to produce", not "close to the
consensus". Suspicion beyond arithmetic belongs in disclosed merge-side
mechanisms (influence bounds, spread, share disclosure), where its effect
is visible rather than silently censoring.
