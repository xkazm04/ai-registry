---
layer: technique
type: technique
subject: quality-gates
technique: policy-projection
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a gate policy is shown in more than one place, generating a config snippet someone will paste, a dashboard pass rate disagrees with the gate]
---

# Policy projection

A policy is enforced in one place and *described* in many: the summary
appended to a change under review, the pass-rate tile on a governance
view, the parameters of the invocation that runs the gate, the
configuration snippet a team copies into their own pipeline, the brief
handed to an assistant that will act on it. Each of those is a
**projection** of the same condition list, and every one of them is read
as authoritative by somebody. The enforced policy and its projections
drift the way any hand-maintained copies drift
([one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary)) —
and the drift is invisible, because each surface looks internally
consistent.

Note the difference from the single-rule-source discipline in
gate-laddering: that one keeps the *same rule* identical across rungs.
This one keeps the *description* identical across audiences. A team can
have one flawless rule source and still tell four different stories about
what it enforces.

## The failure has a direction, and it is always downward

Projections are written by hand-walking the policy object — an `if` per
condition, per renderer. New conditions get added to the enforcement path
and to whichever renderer the author had open. The result is that every
projection is a *subset* of the enforced policy, never a superset, so the
error mode is uniform: **surfaces understate what will block you.**

- A change-review footer that omits a per-dimension floor tells the author
  the policy is weaker than the one that just refused their work. They fix
  what the footer listed, resubmit, and fail again — and the gate spends
  trust it did not have to spend.
- A rollup that evaluates a condition the gate enforces, but cannot
  because it never carried that input, reports subjects as passing that
  the gate blocks. The number on the tile is not a summary of the gate; it
  is a summary of a different, more permissive policy nobody wrote down.
- An assistant handed the human-readable projection acts on the subset,
  confidently, at scale.

## One enumeration, all projections attached

The structure that removes the class: a single ordered function that walks
the active policy once and emits, per enforced condition, a record
carrying *every* projection of it — the sentence, the terse chip, the
invocation parameter, the configuration line. Renderers become maps over
that list. Adding a condition means adding one entry, and a projection you
forget to fill is visibly empty in the record rather than silently absent
from a surface.

Two rules make the structure hold:

- **Conditions that no surface can express still enumerate.** Some
  conditions have no invocation parameter and no configuration input — a
  floor on a dimension the parameterized entry point never exposed. They
  must still emit into the human-readable projections, marked as not
  reproducible through that entry point. Inexpressibility is the most
  common route by which a condition disappears from every surface at once
  while remaining fully enforced.
- **Enumerate the *effective* policy, not the declared one.** Where
  defaults, per-subject overrides, and a global floor combine, one helper
  computes the effective value and every projection *and* the verdict
  derives from it. Two places computing precedence is two policies.

## Display caps are not data caps

The most expensive projection bug of all: a surface that truncates for
layout, consumed downstream as if it were the data.

A card lists the first several failing subjects because a card has a
height. A copy-to-clipboard action then builds an enforcement artifact —
one invocation line per failing subject — from that same truncated list.
Measured consequence: a team with twenty failing subjects copied a snippet
that enforced the policy over eight of them, directly beneath a tile
reading twenty. Nothing errored; the artifact was well-formed; the gate it
installed was two-fifths of the gate it claimed to be
([gate-sees-target](../../_laws.md#gate-sees-target) — the generated gate
saw a truncated population and gated it as the whole).

The rules:

- Any projection that is **itself an enforcement artifact** — a snippet,
  generated configuration, a work list someone will drive to zero — is
  built from the full population, never from a view model.
- The cap is named at its definition as a display bound, and the naming is
  repeated at the boundary where the capped list is exposed, because the
  consumer is where the mistake gets made. A field called "failing
  subjects" invites the mistake; a display-bounded field that says so, and
  a full register beside it, prevents it.
- The test worth writing is population-sensitive: build the artifact for a
  population larger than the cap and assert the count matches the reported
  failure count. A fixture of three subjects under a cap of eight can
  never catch this.

## The verdict carries the policy it was judged under

Defaults that differ by population — a smaller, younger subject held to a
lower bar than a large organizational one — are good calibration (see
false-positive-economics) and a comparability hazard. A stored or
displayed verdict must therefore carry the effective policy that produced
it. Without it, two passes are silently incomparable, a re-run under
changed defaults looks like a regression that never happened, and nobody
can reproduce last quarter's refusal.
