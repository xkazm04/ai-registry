---
layer: golden-path
type: golden-path
subject: model-routing
status: forged
techniques:
  - turn-classification
  - effort-calibration
  - routing-policy
  - consumer-overrides
  - capability-floors
  - policy-governance
  - model-identity
  - failover-horizon
  - candidate-ranking
  - quality-axis-separation
  - cache-continuity
---

# Model routing & provider policy

A system that delegates work to language models does not make one kind of call. It
makes a human wait for an answer; it summarizes a title in the background; it fires
hundreds of tiny classification calls from a batch job overnight. These calls differ
by orders of magnitude in cost, in latency budget, and in the blast radius of a bad
answer — and the models available to serve them differ by the same orders of
magnitude in price and capability, along a second axis (how hard the model reasons)
that is priced separately from the first. **The subject of this path is the routing
decision**: which capability tier and how much reasoning effort each call gets, who
decided, under what policy, and how anyone finds out afterward.

Two siblings border this path. Cost-metering owns the spend ledger — what the calls
actually cost, priced and aggregated; this path produces the decision record that
metering prices. [Retry-backoff](../../../backend-platform/resilience/retry-backoff/retry-backoff.md) owns what
happens when a chosen provider fails — the
[circuit-breakers](../../../backend-platform/resilience/retry-backoff/techniques/circuit-breakers.md) and failover
mechanics; this path owns what the substitute is *allowed to be* when failover asks
(see capability-floors). The seam is clean: routing decides, failover retries,
metering bills.

The stakes are shaped by a property no other subsystem has: **a mis-route does not
error — it produces a plausible answer.** Over-routing (a frontier tier serving
boilerplate micro-calls) burns budget invisibly; nothing breaks, spend just
multiplies until someone audits. Under-routing degrades quality in ways users feel
before any dashboard shows it, because the small tier's failure mode is confident
mediocrity, not a stack trace. Both directions fail silently, which is why this
subject is as much about audit and governance as about the choice itself.

## The core stance: route by class, not by vibes

The naive design lets each call site pick a model — a name string here, a
convenience default there, a "this felt like it needed the big one" in review. It
fails three ways at once: the choices drift apart as the roster of available models
changes under them; nobody can answer "what serves our interactive turns today?"
without grepping; and every intuition baked into a call site is an unmeasured claim
that hardens into fact.

> **The call's class — assigned where the call originates, mapped through one
> table, calibrated by measurement — selects the tier and effort. No call site
> names a model.**

The consequences of that stance form the spine of this subject:

1. **Classification is a closed vocabulary with one authority.** A small, fixed
   set of call classes — the interactive turn a human is waiting on, the
   background aside, the headless micro-call — each carrying a tier and an effort
   setting. The caller asserts its class, because only the caller knows its role;
   the mapping from class to tier lives in exactly one place (see
   turn-classification).
2. **The mapping is calibrated by measurement, and the measurements keep
   surprising.** More reasoning effort is not automatically better — on long-form
   work it can invert. The bigger model is not automatically the safer default.
   Under a hard output cap, effort buys nothing at all. Intuition gets every one
   of these wrong, which is why the class→tier table is an empirical artifact
   with a re-measure cadence, not a settings page of opinions (see
   effort-calibration).
3. **Policy is data, evaluated at one door.** Allow/block lists, complexity
   rules, compliance tags scoped to domains — expressed as data, validated when
   edited, and applied by a single evaluator every call passes through. Policy
   sprinkled across call sites is policy minus the call site added next quarter
   (see routing-policy).
4. **Overrides live at the consumer, never inside the router.** Pins, incident
   downgrades, bring-your-own-provider choices — all legitimate, all applied at
   the call's edge with a stated precedence. An override read from the
   environment *inside* the router is an invisible global: it changes every
   decision, appears at no call site, and survives into contexts where nobody
   remembers setting it (see consumer-overrides).
5. **Some capabilities have floors.** Below a measured minimum tier, a feature
   is not cheaper — it is broken. Floors are per-capability, recorded with the
   measurement that justified them, and no cost pressure or failover routes
   beneath one silently (see capability-floors).
6. **Every decision is auditable, and policy changes are governed.** Which model
   served which call, selected by which rule, with which override applied — as a
   record, not a log line. Policy edits are diffed, reviewed, and approved,
   because a routing change is a spend change and possibly a compliance change
   (see policy-governance).
7. **A tier does not resolve to a model; it resolves to a set of endpoints.**
   Once more than one provider is reachable, the same published weights are on
   offer from several of them, under different names and with different caps.
   Substituting one endpoint for another holding the model constant is not a
   quality event; substituting a different model is. A routing layer with one
   word for both records the common case as if it were the rare one (see
   model-identity).
8. **Substitution is free only until the caller has seen a byte.** After that
   there is no invisible retry, only a seam. That horizon is a state the layer
   tracks, and it is the window in which a whole class of failures — the call
   that returned cleanly and returned nothing usable — must be caught if it is
   to be caught at all (see failover-horizon).
9. **Which of the eligible candidates goes first is a live measurement.**
   Eligibility is decided by policy and floors; order is decided by
   what the roster is doing this hour, ranked by commensurable terms with
   guardrails that demote rather than reorder (see candidate-ranking).
10. **What a clean response proves is that the transport worked.** The
    reliability term every ranker computes for free is a measurement of the
    exchange, not of the answer — and on this subject's central failure, the
    mis-route that returns something plausible, transport is the one axis
    where a bad route and a good one look identical. The value of the output
    is a second axis, written only by something that read it, and absent until
    then rather than defaulted to a number (see quality-axis-separation).
11. **A continuing conversation carries a cached prefix, and the prefix is
    keyed to the model that wrote it.** The class table prices a call as if
    it arrived alone; a warm turn on the incumbent re-reads its prefix at a
    tenth of base price while any other model writes it at 1.25×. Route by
    class where the class has its own prompt family; never swap the model
    under a shared context (see cache-continuity).

## The classes and their contracts

The taxonomy below is the recurring shape; a given system may split a class, but
the axes — who waits, what a bad answer costs, how much output is expected — are
the axes everywhere.

| Class | Who waits | Contract |
|---|---|---|
| **Interactive main turn** | a human, synchronously | the strongest tier the budget sustains, effort tuned to the work; latency matters but quality is the bar — this is the product |
| **Background aside** | nobody visibly; the result decorates or prepares | mid tier, low effort; a mediocre answer is absorbed, a slow one is free, an expensive one multiplied by volume is not |
| **Headless micro-call** | a pipeline, at volume | small tier, minimal effort, tight output cap; correctness per call matters less than aggregate cost and throughput, and the cap makes high effort literally unpurchasable |

Three rules cut across the table. First, **the class is semantic, not a model
name** — call sites survive every roster change because they say what they are,
not what they want. Second, **unspecified resolves upward**: a call that names
no model does not get a cheap one — it gets whatever the vendor, account tier,
or runtime defaults to, and those default toward the newest and most capable,
which is the most expensive. So an unclassified call is a routing bug, and the
terminal case of every resolution chain is a **named constant the system owns**,
never a fall-through — a fall-through is a purchasing decision made by someone
who does not pay. Third, **a resolution cascade with many layers and one
populated layer is not a cascade** — it is a constant with extra places to look
before finding it, wearing the costume of a policy. Before adding a resolution
layer, count how many of the existing ones have ever held a value.

## Two tables, only one of which is calibrated

The demand that every mapping entry cite the measurement that set it belongs to
the calibrated table — the class→tier→effort mapping the system owns, where an
entry is a claim about capability and an uncited entry is an intuition hardened
into fact. It does not extend to the second table a deployed system grows:
**operator policy over which providers and models an installation may use at
all**. That table is not a measurement, it is a permission, and asking it to
cite evidence is a category error — the reasons behind it are contractual,
jurisdictional or financial, and no benchmark speaks to them. The governance
half applies to both without softening: policy is data, validated at one door,
versioned, diffed, and visible in the decision record. The calibration half
applies only to the first. Where the two disagree the permission wins, and the
record says a permission decided.

## The decision record

A routing decision that cannot be reconstructed afterward is a decision nobody
made. The minimum record, per call: the class asserted, the tier and effort
selected, the policy rule or override that decided (not just the outcome — the
*why*), and whether the served model was the selected one or a fallback
substituted under failure.

**And the record must carry what was *served*, not only what was selected.**
The two are assumed identical and are not: a provider can answer a request for
one model with another — a quantized variant, a house default, a silent
substitution under its own capacity pressure — and it will report this, when it
reports it at all, in a field the routing layer has every reason to overwrite.
Overwriting is usually right: provider-reported model identifiers are
unreliable enough that exposing them breaks callers, and the honest public
contract is the model that was *routed*. But that normalization destroys the
only evidence that the two ever differed. So the raw upstream identity is
captured at the boundary **before** the response is normalized, compared
against the routed identity under the same normalization that grouping uses
(see model-identity), and recorded when it genuinely differs — leaving the
caller-facing contract untouched. A routing layer that cannot detect
substitution by its own providers is auditing its intentions rather than its
behavior (law: [gate-sees-target](../../../_laws.md#gate-sees-target)).

Aggregated over time, these records answer the
questions this subject exists for: what serves each class today, which classes
are drifting toward expensive tiers, whether an override outlived its incident,
and whether policy is being complied with at all. [Audit-logging](../../../operations/governance-and-records/audit-logging/audit-logging.md)
owns the general discipline of such records; policy-governance applies it here.

## What "done" looks like for this subject

A routing layer meets the bar when: no call site names a model, and every call
carries a class from the closed vocabulary; the class→tier→effort mapping lives
in one place and every entry cites the measurement that set it, with a date;
policy is data with one evaluation door, and an edit that references a retired
tier or unknown tag warns at edit time; every override is applied at the
consumer, visible in the decision record, bounded by policy, and named with the
condition that removes it; capability floors exist for the calls that have them,
and nothing — not cost pressure, not failover — crosses one silently; the same
weights reached through two providers are one logical model with per-endpoint
capability, so a substitution within it reads differently in the record from a
substitution across models; the first-delivered-byte horizon is tracked, and a
clean response that cannot serve the caller is classified as a routing signal
rather than returned as a successful empty answer; candidate order comes from
measurements that name their window and their sample size; and an operator can
answer "which model served this call, and why" from the record alone, without
reading source — including when the honest answer is "not the one we selected".
