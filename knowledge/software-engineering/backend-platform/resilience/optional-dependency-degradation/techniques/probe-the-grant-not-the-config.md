---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: probe-the-grant-not-the-config
status: forged
laws:
  - gate-sees-target
shared_with: []
use_when: [a route chooses a storage tier from environment values, writing a helper named "is X available", a store was hardened and writes started failing silently]
---

# Probe the grant, not the config

A surface that can run on either of two substrates has to choose, and the choice
is usually written as a one-line predicate over the environment: if the store is
configured, use it; otherwise use the fallback. The predicate looks obviously
correct and is one of the most durable defects in this subject, because it
answers a question nobody asked. **Configuration proves that somebody supplied
values. It proves nothing about whether the operation will be permitted.**

The distance between the two is invisible on a fresh project, where the default
posture grants the anonymous role broad rights, and stays invisible for as long
as nobody hardens anything. The day the store is locked down — grants removed
from the anonymous role, row policies switched on, a bucket defaulted to deny —
the predicate keeps returning true and every write it authorised starts failing.
A gate must see the thing it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)); a gate over
configuration passes exactly when configuration and permission diverge, which is
the only situation it existed for.

## The rule

**Gate on the credential that carries the grant for the operation being
gated.** Where a dependency issues two kinds of credential — a public pair
intended for client-side reads under policy, and a privileged one that bypasses
policy for server-side work — the presence of the public pair is not evidence
about a write. Only the privileged credential is, and only for the operations
its scope actually covers.

Three consequences follow directly:

- **The predicate is named after the question it answers.** A helper called
  "the store is available" that tests the public pair is a trap: the next caller
  reads the name, believes it, and gates a write on it. Name it for the
  capability — "the store can accept a write from the server" — and the
  mismatched use becomes visible at the call site.
- **A read gate and a write gate are different predicates.** They may both be
  satisfiable, but they are not the same test, and a single boolean cannot serve
  both. Where a surface reads under one credential and writes under another,
  each path gates on its own.
- **But the reader and the writer must land on the same tier.** This is the
  rule that looks contradictory and is not: the *predicates* differ because the
  credentials differ, while the *tier selection* for one body of data is made
  once and shared. When the read path and the write path evaluate the tier
  independently, a deployment can arrive where the counts are read from the
  durable store while the entries land in the fallback — two stores, one
  feature, and a number that will never explain itself. Derive the tier from a
  single expression that both handlers call.
- **Where the grant cannot be known without asking, ask.** Some permissions
  cannot be inferred from which credential is present — scope narrowed on
  rotation, a policy that filters by row, an expired token. For those, the
  honest design is to attempt the operation and classify its failure, not to
  assert capability from configuration. A permission rejection from the store is
  a *definitive* observation and belongs in the same record any probe would
  write; it is the strongest evidence available and the cheapest to obtain,
  because real work produced it.

A startup probe that performs a real write to find out is almost never right —
it leaves durable side effects, costs a round trip on every boot, and the
side-effect-free probe discipline belongs to the health-checks subject. The
narrow rule here is about the *input to the branch*: the grant, not the config.

## Write the truth table

The predicate is one line; the behaviour it selects is a matrix, and the matrix
is what reviewers and operators actually need. At the decision point, write out
every combination of which values are present and which tier receives the
operation — including the combinations that should not happen, and what the code
does about them.

A worked table for a two-tier write path reads roughly like this: privileged
credential present and store configured, the write goes to the durable store;
store configured but only the public pair present, the durable write is *not*
attempted, because the policy denies it — the surface falls back or refuses;
nothing configured, the fallback receives the write with its stated durability
loss; privileged credential present but the store's address missing, that is
half-configured and the boot refuses it as malformed.

Two things make the table worth its space. It states the *why* for the row that
surprises people — the row where configuration is present and the durable path
is still not taken — which is the row a future contributor will otherwise
"fix". And it is the artifact that a hardening change is diffed against: when
grants move, the table is where the consequence is visible.

## Decision rules

- **Never gate a write on a credential that cannot perform the write.**
- **A public address plus a public key is a configuration fact, not a
  permission fact.** It proves someone filled in the template.
- **Delete or rename the naive predicate rather than leaving it beside the
  correct one.** Two helpers with similar names and different meanings will be
  confused, and the wrong one is shorter.
- **Half-configured is not degraded.** One half of a credential pair present and
  the other absent is a malformed configuration and fails at boot; it must never
  silently select the fallback, because the operator believes they configured
  the real thing.
- **Classify a permission rejection distinctly from an outage.** "Denied" means
  the grant is wrong and a human must change a policy; "unreachable" means retry.
  Collapsing them sends the operator to the wrong system.
- **The gate is re-examined whenever grants change**, which is the coupling this
  subject treats as a rule of its own.
- **Test the gate against the hardened posture.** A test run against a
  development project whose anonymous role still holds grants asserts nothing
  about production, and it passes on precisely the deployments where the
  predicate is wrong.

## When the naive check is the right check

If the operation being gated is a read performed with the same public
credential the check tests, the check *is* probing the grant, and the
distinction collapses. The rule was never "public credentials are worthless" —
it is "probe the credential for the operation you are gating". A read-only
surface gated on the read credential is correct, and the reason to state the
general rule anyway is that read-only surfaces acquire writes later, and the
gate is rarely revisited when they do.
