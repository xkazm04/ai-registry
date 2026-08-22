---
layer: technique
type: technique
subject: rate-limiting
technique: metered-step-selection
status: forged
laws: [gate-sees-target, count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [choosing which step in a flow a limit applies to, limiting abuse that costs almost nothing to produce, deciding between capping creation and capping export, auditing a limiter that never fires while the harm continues]
---

# Metered step selection

[limit-derivation](./limit-derivation.md) computes a limit's *number*. This
technique decides its *subject*: which step in a flow the counter increments
on. It is the earlier question and the more consequential one, because a
correctly derived limit on the wrong step is a limiter that is never wrong and
never useful — it fires exactly when the thing it meters gets busy, which may
have nothing to do with the thing anyone was worried about.

The default is to meter the request that arrives, because that is where the
limiter code naturally sits. That default is right whenever the arriving
request is what costs. It is wrong whenever the expensive or harmful part of
the flow is somewhere else, and that case is more common than it looks.

## Meter the step that carries the consequence

The rule is [gate-sees-target](../../../../_laws.md#gate-sees-target) applied to
counters: **a limiter must count the step that carries the harm, not a step
correlated with it.** A proxy step passes exactly when the proxy diverges from
the target — and the whole point of an abuse limit is that an abuser is the
person most motivated to make it diverge.

Ask what the flow actually costs and where. Three answers recur, and each
selects a different step:

- **Production is the cost.** Compute, inference spend, third-party quota,
  storage. Meter the creating call. This is the default and it is usually
  correct.
- **Egress is the cost.** Producing is cheap and reversible; what does damage
  is the artifact leaving the system in volume — export, download, publish,
  send, share. Meter the boundary crossing, and leave production alone.
- **Amplification is the cost.** Neither producing nor exporting hurts, but
  fan-out does: one action that reaches many recipients, triggers many
  downstream jobs, or is retried by many clients. Meter the fan-out factor,
  not the trigger.

## The egress case, because it is the one that gets missed

When the harm is in distribution rather than production, capping production is
both ineffective and hostile. Ineffective, because the volume that matters is
what left, and someone producing at ten times the limit and exporting nothing
has harmed nobody. Hostile, because the cap lands on exploration — the
iteration, the retries, the discarded drafts — which is the behaviour of the
most engaged and most legitimate user you have.

Capping egress inverts both properties. Iteration stays free, so the good user
is unconstrained where they actually work; the boundary crossing is where
volume becomes distribution, so the limit binds exactly on the quantity that
carries consequence. It also puts the counter where provenance, attribution
and audit already have to happen, which means the limiter and the record agree
about what left.

The corollary is that "generate freely, export sparingly" and "generate
sparingly, export freely" are different products, not different numbers, and
the choice between them is a policy decision that belongs in the open rather
than as an accident of where the limiting middleware was mounted.

## Every step is metered in its own units

Steps do not share a currency. Production is usually metered in cost or
compute, egress in artifacts or bytes, amplification in recipients. Forcing
them into one number — "actions per hour" spanning creations and exports —
produces a counter whose meaning changes with the traffic mix, which is a
number that cannot be reasoned about
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

A flow may legitimately carry several limits on several steps. What it may not
carry is two limits on the same step in different units, decided in different
places
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)) —
that is the configuration where a support question about which limit was hit
has no answer.

## Choosing, in practice

1. **Name the harm** in one sentence, in the product's terms. Not "abuse" —
   *what* goes wrong, *to whom*.
2. **Walk the flow** and find the step whose count moves with that harm. If no
   step's count moves with it, the problem is not a rate problem, and a
   limiter will only look like a fix.
3. **Check the divergence.** Ask how someone would cause the harm while
   keeping the metered step's count low. If that is easy, the step is a proxy
   and the answer is wrong.
4. **Check the false-positive shape.** Ask who legitimately makes the metered
   step's count high. If the answer is "the people we most want", the step is
   wrong even if it is not a proxy.
5. **Then** derive the number ([limit-derivation](./limit-derivation.md)),
   design its key ([key-design](./key-design.md)), and shape its refusal
   ([refusal-contract](./refusal-contract.md)) — all of which presuppose that
   this question was answered.

## The tell that the step is wrong

A limiter that has never fired while the behaviour it was built for continues
is not a well-tuned limiter. Neither is one that fires constantly on accounts
nobody has ever complained about. Both are step-selection failures wearing a
threshold's clothing, and both get "fixed" by moving the number — which is why
the observability this subject already requires
([limit-observability](./limit-observability.md)) should report *who* hit a
limit alongside how often. A limit whose top talkers are your best users is
reporting that it is mounted on the wrong step.
