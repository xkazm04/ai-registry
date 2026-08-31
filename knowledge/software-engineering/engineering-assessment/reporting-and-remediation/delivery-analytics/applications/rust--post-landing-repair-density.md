---
layer: application
type: application
subject: delivery-analytics
technique: post-landing-repair-density
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Repair density on a fix-forward Rust workspace

An LLM-observability server (Rust workspace, `crates/api`, `crates/store`,
`crates/judge-engine` and a dozen more) with 266 commits, conventional-commit
subjects carrying a scope, and release tags. It was chosen for one property:
**it has never reverted anything.**

## The two arms

Both arms read the same repository over the same window — from the `v0.0.7` tag
(58 commits) and again from `v0.0.4` (217 commits) — through the same
instrument, `git log`. No product code was touched; the harness is a read-only
script.

- **Arm A — [revert-linkage](../techniques/revert-linkage.md), the incumbent
  signal.** Recognized revert events: **0** at both windows. Not a low number, a
  structurally absent one: the project fixes forward, so the only failure signal
  the subject previously offered produces nothing to link, nothing to rank, and
  no risk information whatsoever.
- **Arm B — repair density.** Feature units carrying a repair stream after the
  instant: **17** at `v0.0.7`, **30** at `v0.0.4`, ranked by worst class present
  then by repairs over surface touched.

Arm B produces a ranking where Arm A produces nothing at all, on a population
`revert-linkage` names in its own "when not to use this" and cannot read. That
is the result the technique claims, and it holds here.

## What the ranking got wrong

The count and the density survived hand-verification. **The severity classing
did not**, and this is the load-bearing finding. The harness classed severity by
matching keywords in commit subjects, and of the four units it promoted to the
top of the `v0.0.7` ranking, **three were false positives**:

- `security(supply-chain): secret scanning, dependabot, and the h2 advisory` —
  counted as two security *repairs*. It adds security tooling; the type prefix
  cannot distinguish that from fixing a security defect.
- `fix(mcp): a request timeout and a panic guard on the only session there is` —
  promoted on the word "panic". It *adds* a guard; no panic fired.
- `fix(tracing): keep the calls that die — crash-surviving span breadcrumbs` —
  promoted on "crash". Crash survival is the feature.

Only `security(pii): bound the scrub's walk, and disposition every field a
caller writes` survived as a genuine repair of a landed defect. **First number:
six alarming repairs. Hand-verified: one, possibly two.** Every correction came
from opening the commit, and the error ran in the direction of alarm — the
classifier nominates the teams that write carefully about hardening their own
code. The technique now carries that limitation in its own text.

## What this realization cannot do

The harness proxies feature identity with the conventional-commit **scope**,
which is not what the technique asks for — a feature is the commits that landed
it, and a scope is a directory-shaped label that splits one feature across
scopes and merges unrelated work sharing one. A repair committed without a
scope, or folded into an unrelated change, is invisible to it entirely. The
density figures are therefore lower bounds on a mis-drawn unit, and they are
comparable across units in this repository only because one convention is
applied consistently throughout it.

The harness also cannot see exposure. A scope with no repairs may be healthy or
may be unused, and nothing in `git log` separates those.
