---
layer: technique
type: technique
subject: rate-limiting
technique: key-design
status: forged
laws:
  - creation-names-reaper
shared_with: []
use_when: [deciding which axes compose a limit's key, buckets show headroom while the provider refuses, one actor splitting into two allowances]
---

# Key design

The key is the limiter's unit of fairness: whatever you key on is what competes,
and everything sharing a key shares a fate. Most rate-limiting incidents that
look like algorithm bugs are key bugs — the wrong actors pooled into one
allowance, one actor split across several, or a key space the outside world can
grow without bound. The algorithm decides *how precisely* you enforce; the key
decides *what you are actually protecting, and from whom*.

## Choosing the axes

The candidate axes are few and compose into tuples:

- **Per tenant / account** — the fairness boundary customers expect: one
  tenant's misbehaving script must not starve another tenant. The default
  ingress axis.
- **Per credential / token** — finer than tenant; isolates one leaked or
  runaway credential without freezing the whole account, and is the axis
  egress providers are *assumed* to meter you on. Verify that assumption
  before building on it (see the pool rule below); it is frequently false.
- **Per endpoint / operation class** — because operations differ in cost by
  orders of magnitude. One global number across cheap reads and expensive
  mutations is either uselessly loose for reads or cruelly tight for writes;
  keying (or costing) by operation class fixes the mismatch.
- **Per source address** — the axis of last resort for unauthenticated
  traffic: world-controlled, spoofable at the edges, and shared by everyone
  behind one gateway. Use it as a coarse pre-filter, never as the fairness
  unit for identified actors.

Two tests pick the axes. The *blast-radius test*: when this limit trips, who
else stops working? If the answer includes actors who did nothing, the key is
too coarse. The *evasion test*: what does an abuser change to get a fresh
allowance? If the answer is "a free-to-mint identifier" (a new session, a new
address, a new anonymous id), the key is too fine — or needs a coarser layer
above it (see limiter-topology for how layers compose).

## An egress key is a copy of someone else's key, not a choice

The axes above are choices for an ingress limiter, which owns the number it
enforces. An egress limiter owns nothing: it is modelling a boundary a remote
authority already drew (see limiter-topology), and its key is right only when it
*matches* that boundary. The choice was made by the provider; your only job is to
discover it.

The discovery is usually skipped, and the default guess — one allowance per
credential, per operation — is wrong in a specific and expensive direction.
Providers commonly meter on a **pool** that is coarser than the credential and
orthogonal to the operation: one allowance shared across every credential in an
account or project, one shared across a whole family of operations, a
promotional or trial pool separate from the paid one, a per-address allowance
for unauthenticated access. Two consequences:

- **A key finer than the provider's pool over-permits, silently.** Every one of
  your buckets shows headroom while the pool behind them is empty; the limiter
  reports green and the provider refuses. You have built a counter, not a limit.
- **The pool shape is per-provider and undocumented as often as not.** It must
  be recorded as data next to the roster — one declared pool per provider,
  editable without a release — because it changes when the provider reorganizes
  its plans, and because the first time it is wrong you need somewhere to fix it
  that is not a code path.

Where the pool cannot be discovered, model it as the coarsest plausible
boundary. An egress limiter that runs conservative loses throughput; one that
runs optimistic loses the request.

**Observations about a remote limit carry their source.** A ceiling read from a
response header or a quota endpoint is knowledge; one inferred from an error
body is strong evidence; one derived from your own counting is a model of a
model; one taken from published documentation is the weakest of all, because it
is the least likely to have been updated. Rank them explicitly and let a stronger
source overwrite a weaker one — never the reverse, which is how a stale
documented number erases a limit the provider stated an hour ago.

## One derivation, one authority

The key is derived from request attributes, and the derivation function is part
of the limit's identity. Two doors deriving the key differently — one
normalizing case, one not; one keying on tenant, one on credential — split one
actor into two allowances, and the limit silently doubles for exactly the
actors who use both doors. The derivation lives in one place, next to the
limiter, and every door calls it; a limiter API that accepts a caller-built
string as the key is inviting each call site to invent its own fairness
boundary.

The derivation is also where the adversarial review happens: **any key
component the caller can influence is a bucket-minting lever.** Build keys
from identifiers the system assigned — the credential's row id, the resource's
own id — never from names, prefixes, or routing strings the caller supplies,
and ask of each component: *can the caller change this?* If yes, they can
manufacture fresh allowances at will, and the limit is advisory for exactly
the callers it exists to stop. The reasoning behind each key's composition is
worth a comment at the derivation site — it is the part of a limiter most
likely to be weakened by a well-meaning refactor that "simplifies" the key.

## Cardinality is a security property

Any key containing world-controlled input — addresses, tokens, user-supplied
identifiers — names an unbounded set, and the limiter allocates state per key.
**An unbounded per-key map is a memory leak whose growth rate the adversary
controls**: the limiter built to stop abuse becomes the cheapest thing to abuse.
Every per-key map therefore ships with its bound and its reaper on the day it is
created (law: creation-names-reaper):

- **A size cap** with eviction of the least-recently-touched key, sized from
  the honest question "how many keys can be *legitimately* active in one
  window?" — not from available memory.
- **A staleness rule**: entries idle longer than the state's own horizon carry
  no information — a token bucket idle past its time-to-full is
  indistinguishable from a fresh one — and are pure waste. The reaper prunes
  them on a schedule (the reaper's own discipline — named, scheduled, observable
  — is storm-hygiene's territory).
- **Eviction must be an allowance no larger than time would have granted.**
  Evicting a key resets it to a fresh allowance, so eviction of an *active*
  key is a limit bypass. The safe form: evict only entries idle past the
  refill/aging horizon, where "fresh state" and "aged state" are identical by
  arithmetic. If memory pressure ever forces eviction of active keys, that is
  a shed event worth counting, not a silent reset.

## The unknown-key policy

Some requests arrive with no resolvable key — unauthenticated, malformed, or
ahead of the identification step. "No key" must map to a *deliberate* policy,
because the accidental mapping is "no key, no limit," which makes
unidentifiability the cheapest evasion in the system. The options, in
decreasing strictness: refuse outright (where identification is mandatory
anyway); pool all unknowns into one shared, deliberately tight allowance —
unknown actors collectively get scraps, and the pool's exhaustion is a signal
worth watching; or fall back to a coarser axis (per source) with its own tight
limit. Which one is right depends on the door; that there *is* one, chosen in
advance, is the technique.

**And it depends on the window, which is why one system needs two opposite
answers for the same sentinel.** Pooling every unidentifiable caller into one
shared allowance is the strict, correct choice in a seconds-to-minutes burst
window: the blast radius is bounded by the clock, an honest visitor caught in
the pool waits a minute, and an attacker gains nothing by being anonymous. Carry
that same pooled sentinel into a month-long allowance and it inverts: the first
handful of anonymous requests exhausts the shared bucket and every anonymous
visitor is locked out for the rest of the window — which reads to the operator
as an outage and to the visitor as a broken product, not as a quota. So the rule
is **the strictness of the unknown-key policy scales inversely with the window's
horizon**: pool and refuse at burst horizons, treat the same unidentifiable
caller as *unenforceable* at calendar horizons and let the request through,
because a long-horizon gate that cannot attribute a request has no honest bucket
to charge it to. Two limits over the same identity therefore legitimately
disagree about the same sentinel, and each states its direction and its reason
where the sentinel is produced — an unexplained disagreement is how a later
refactor "harmonizes" them and ships a month-long lockout.

## Decision rules

- **Key for the blast radius you intend.** State, for each limit, who is
  punished together on purpose. If you cannot say it, the key was chosen by
  convenience of available fields, not by fairness.
- **Run the evasion test before shipping.** Whatever the abuser can mint for
  free must not be the sole key. Layer a bounded-cardinality axis above any
  free-to-mint one.
- **Scale the unknown-key policy to the horizon.** Pool and refuse unidentifiable
  callers where the window is seconds; treat them as unenforceable where the
  window is a month. The same sentinel, the opposite direction, each stated.
- **Bound every map at birth.** Cap, staleness horizon, and reaper are part of
  the map's construction, not a hardening ticket. A limiter reviewed without
  its cardinality bound is unreviewed.
- **For an egress key, name the pool it mirrors.** If nobody can say which
  remote allowance a local bucket stands for, the bucket is decorative. State
  the pool, state how it was discovered, and treat the provider's refusals as
  corrections to it.
- **Keep the derivation singular.** One function, adjacent to the limiter,
  used by every door. Treat a second derivation site as the same defect class
  as a second limiter (see limiter-topology).
- **Count evictions and unknown-pool refusals separately.** Both are signals —
  the first of under-sizing or attack, the second of an identification gap —
  and both vanish if blended into ordinary refusal counts (see
  limit-observability).
