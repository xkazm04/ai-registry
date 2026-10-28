---
layer: technique
type: technique
subject: remote-capability-probing
technique: verdict-basis-tagging
status: forged
laws: [unknown-is-not-a-value, gate-sees-target, verdict-survives-boundary]
shared_with: []
use_when: [a capability report mixes rows that were probed with rows inferred from a plan or version, a forbidden or not-found response is about to be read as the feature missing, deciding what a capability row must carry so an operator can audit it]
---

# Verdict basis tagging

A capability report against a hosted platform is rarely made of one kind of
evidence. Some features have a read endpoint that can be asked; some have no
safe read at all and can only be inferred from the subscription tier the
account is on; some are gated by the server's release, not by the account;
and some cannot be established from where the prober stands. A report that
renders all four as the same *available / unavailable* column has erased the
one thing a reader needs to decide whether to believe a row: **what the
verdict rests on.**

So every verdict is a triple, not a flag: a **status** from a closed set
(*available*, *unavailable*, *unknown*), a **basis** from a closed set
(*endpoint* — a request was provoked and answered; *plan* — the documented
tier decided; *version* — the server's release decided; *none* — nothing
could be asked), and a **reason** written as the observation itself, not a
paraphrase of the status.

## Procedure

1. **Decide the basis per capability before probing.** For each row, name
   the strongest evidence available: a side-effect-free read of the feature
   itself; failing that, the server version against the release the feature
   shipped in; failing that, the tier the documentation names. A feature
   whose only verbs change state is never probed by exercising it — its
   basis is the tier, or *none*.
2. **Map endpoint outcomes into the three statuses by what they prove.** A
   success on the feature's own read is *available*. A refusal that speaks
   about the feature — forbidden, not found — is *unavailable*, with the
   status code and the server's message in the reason. Everything else —
   network failure, authentication failure, rate limiting, a server error —
   is *unknown*, and its reason says so explicitly: *failed; not a verdict
   on the plan*. A transport failure that renders as *unavailable* tells the
   operator to buy something they may already have
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
3. **Accept a refusal as a verdict only when the scope itself answered.** A
   forbidden or not-found on a feature route under an account, a group or a
   project means *this feature is not here* only if the container was read
   successfully in the same run. A wrong container identifier, or a
   container this credential cannot see, answers forbidden or not-found on
   *every* route beneath it, which says nothing about the tier. When the
   container read failed, every route under it is *unknown*, basis *none*,
   reason *the container could not be read, so its routes cannot be judged*
   ([gate-sees-target](../../../../_laws.md#gate-sees-target): the refusal
   must be about the feature, not about the address).
4. **Plan and version verdicts degrade to unknown, never to a guess.** If
   the tier or the version could not be read, the rows that depend on it are
   *unknown* with that reason. A missing tier is not the lowest tier, and an
   unparseable version is not an old one. Normalise the tier vocabulary at
   one point (trial and legacy names onto the current ladder) and let an
   unrecognised name map to unknown rather than to the nearest rung.
5. **Carry the triple to every surface.** The command-line render, the setup
   screen and any machine-readable output show basis and reason beside the
   status; the exit code distinguishes *the probes answered* from *every row
   is unknown*. A downstream consumer that receives only the status has
   received a lossy copy
   ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

## Decision rules

- **When a route's not-found may also mean the route does not exist on
  this release,** say so in the reason, because the operator's remedy
  differs — upgrade the server, not the subscription.
- **A plan-basis *available* is weaker than an endpoint-basis one,** and
  the report orders or marks it so: the documentation said the tier
  includes the feature; nobody asked the feature.
- **When a later run upgrades a row's basis** (a read endpoint appeared, a
  trial started), the row changes basis as well as status; a row that keeps
  *plan* after an endpoint answered is reporting stale evidence.

## When not to use

A capability that is one boolean on a peer you administer, with one source of
truth you control, needs no basis column; the neighbouring subject on optional
dependencies owns that case. Tagging earns its column when evidence of
different strengths sits in one report and a reader acts on the report.
