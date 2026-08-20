---
layer: technique
type: technique
subject: plan-entitlements
technique: deployment-mode-short-circuit
status: forged
laws: [one-authority-per-vocabulary, one-validation-door, gate-sees-target]
shared_with: []
use_when: [the product ships both hosted and self-run builds, adding a capability gate, a self-run instance refuses its own features]
---

# Short-circuiting gates in deployments that sell operation

Some deployments do not sell capability. A source-available product that also
offers a hosted tier, an on-premise licence, an air-gapped enterprise install:
in all of them the customer already holds the software and everything it can
do. What they are buying is **operation** — that someone else runs it, keeps
it up, upgrades it, backs it up, and answers when it breaks.

In such a deployment a capability gate is not merely useless, it is a defect:
it stops a customer's own instance from doing something the customer's own
instance is entirely entitled to do, and it does so in a build whose users are
the least likely to be in your support queue and the most likely to just patch
it out. The gate produces no revenue and costs goodwill.

## The doctrine

**What a deployment sells is a declared property of the deployment, stated
once.** Not inferred per gate, not re-derived from an environment variable in
each call site, not decided by whichever engineer wrote the newest feature.
One declaration — a mode value resolved at startup from configuration — and
one exported way to ask about it. That is
[one authority per vocabulary](../../_laws.md#one-authority-per-vocabulary)
applied to deployment mode, and the vocabulary is small and closed: modes that
sell capability (gates apply) and modes that sell operation (gates do not).

**The short-circuit lives in the shared entry point, not in the gates.** Every
capability check passes through one predicate; that predicate answers
"entitled" immediately when the mode sells operation, before it reads a tier
or a balance. This is
[one validation door](../../_laws.md#one-validation-door) doing its second
job: a gate written next quarter by someone who has never thought about the
other build is correct by construction, because correctness is a property of
the door and not of the author's memory. Short-circuiting inside each gate
means the doctrine is enforced by remembering, and the failure arrives as a
bug report from the build with the fewest bug reporters.

**Short-circuit at the root of the path, not only at its gate.** The strongest
placement is the earliest branch that decides whether the commercial path
applies *at all* — the predicate that answers "is this operation metered?",
upstream of allowance counting, balance reads, debits and refusals. Turning
the whole billing path off at its root is structurally different from
answering "allowed" at each gate: the root version cannot be defeated by a
downstream step that nobody remembered to teach about the mode. Keep the
short-circuit in the derived helpers as well — the allowance resolver, the
unlimited predicate, the retention floor — so that the layers **agree either
way** and no reader has to reason about which one ran first. This is the one
place where the redundancy is not duplication of authority: every copy reads
the same single mode declaration.

**A new gate that bypasses the door is a bug against that deployment.** State
it that way — in the mode declaration, in the review checklist, in whatever
gate the repository has for new code. Naming it as a bug class rather than a
style preference is what makes a reviewer flag it.

## What must not short-circuit

The short-circuit covers *capability* gates, and nothing else. Three classes
stay live in every mode:

- **Authorization.** Who may act is not a commercial question. A self-run
  instance still has roles, still has tenants, still refuses a viewer's
  writes. Short-circuiting permission alongside entitlement is a security
  incident wearing this technique's clothes, and the two must therefore be
  separate predicates in the first place.
- **Safety, quota and cost controls on shared external resources.** If an
  operation calls a metered third-party service on a key the operator
  supplies, its ceilings are the operator's protection, not your paywall.
  Those belong to the metering and rate-limiting subjects and stay enforced.
- **Correctness limits.** Bounds that exist because the system breaks past
  them — payload sizes, concurrency caps — are engineering, not pricing.

A fourth class is easy to miss because it does not look like a gate at all:
**retention and other cost-of-goods floors.** A tier that limits how far back
history is readable is a hosted-cost control, and applying it to an operator's
own storage hides the operator's own data from them for no reason. Anything
whose justification is "our infrastructure bill" short-circuits with the
gates. Note the related discipline that makes this safe in either mode: a
retention limit is a **read floor**, not a deletion schedule — queries are
clamped, nothing is destroyed — so switching the mode on or off never loses
data.

The clean test: **would this refusal make sense if the customer were paying
you the maximum?** If yes, it is not a capability gate and it stays.

## Verifying the mode is honest

A declared mode is only as good as its resolution:

- **The mode is resolved once at startup and logged.** An instance that cannot
  say which mode it is in will be debugged by guessing.
- **A default must be chosen deliberately and stated.** Defaulting to the
  gating mode means a misconfigured self-run instance is a crippled one;
  defaulting to the operation mode means a misconfigured hosted instance gives
  the product away. Both are real risks; pick with the deployment topology in
  mind, and make the hosted deployment set the value explicitly rather than
  relying on any default.
- **Tests cover both modes.** A gate tested only under the gating mode is
  untested under the mode where it is supposed to disappear, and
  [a check that never observed its target](../../_laws.md#gate-sees-target)
  has proved nothing about it. The cheap version is a single test per gate
  asserting the short-circuit; the honest version parameterizes the suite by
  mode.
- **Interface copy follows the mode.** A build where nothing is gated must not
  render upgrade prompts, pricing cards or "included in the paid plan" badges.
  Selling something the instance already grants is a worse experience than a
  missing feature, and it is a common leftover, because copy is rarely wired
  to the same declaration the gates read.

## When not to use this

- **A single-deployment product** — one hosted service, no distributable
  build — has one mode, and the declaration is ceremony. Note the day a
  customer first asks for an on-premise install: that is when this becomes
  urgent, and retrofitting means auditing every gate written since launch.
- **Where different deployments genuinely sell different capabilities** — a
  licensed build that legitimately withholds a module — the mode is not
  binary and the model must express which capabilities each mode confers.
  That is a richer tier model, not a short-circuit, and the short-circuit's
  simplicity should not be preserved by lying about the product.
