---
layer: application
type: application
subject: remote-capability-probing
technique: advertised-support-is-not-evidence
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@2021
applied: experiment
ab_verdict: unmeasurable
---

# A capability verdict minted per provider, spent on a model nobody asked

A self-hosted LLM gateway written in Rust, read in a local checkout whose workspace manifest
declares `edition = "2021"` (that is the witness for `verified_against`). The gateway fronts
several chat providers and walks a route's chain of targets until one answers. This is a
second realization of
[advertised-support-is-not-evidence](../techniques/advertised-support-is-not-evidence.md),
and the first outside the HTTP range-read case: the capability here is "can run caller-defined
tools", the peer is a model behind an aggregating provider, and nothing is a header.

## What the tree does right

Before the first request, the handler refuses a tool-bearing request if any target in the
route's chain cannot run tools. The stated reason is the technique's own: a fallback that cannot
run tools would otherwise serve tool-less prose during a limit window and call it a fallback.
The verdict is a pure function of the target, never of a prior response, and a failed read does
not change it. No advertisement is consumed anywhere.

## Where the verdict lives at the wrong grain

The verdict is a function of the **provider id**. The technique says the verdict is per peer,
"the smallest unit whose infrastructure can differ", and names "a verdict inferred from the
address's shape" as a non-observation. Two of the providers answer that way for a reason the
tree owns: it wrote those adapters, the announcement and the read are the same process, and the
technique's own exception (you own both) applies. The aggregating provider is the opposite
case. It is one provider id in front of many models, and the id answers `true` for all of them
while some models behind it have no tool endpoint.

## The experiment

The chain `[aggregator/model-without-tools, openai-shaped/model]` was run through the gateway's
real chain walker with a scripted generator (a scratch test in the crate's own failover test
module, run once, then reverted; nothing committed in the tree). The aggregator answered the
tool-bearing request with a 404 whose body says no endpoint supports tool use. Both providers
pass the up-front gate.

| | Result |
| --- | --- |
| Gate verdict for both targets | tool-capable |
| Attempts | 1 |
| Served | none; the second target, which could have answered, was never called |
| Failure class | terminal: "the request itself is the problem, another seat would fail the same way" |
| Second identical request | one more attempt, no cooldown recorded, same failure |

The classifier's premise (a 4xx means the request is bad for every seat) is the technique's
absent-observation error moved to the failure side: a rejection from one peer was read as a
property of the request, and the target's own refusal is the only evidence about the target.

## Verdict and what would settle it

`unmeasurable`. Arm A is measured above. Arm B (treat a tool-bearing 4xx on a target as a
refusal of that target, remember it per provider and model, and walk on) was priced, not run:
the class is shared with genuine malformed-tool-schema rejections, which must stay terminal, so
the split needs the provider's error body or a probe, and the floor (malformed requests still
stop the chain) needs a fixture with both. The instrument that would settle it is a paired
fixture of tool-bearing rejections, one per cause, replayed through the walker with and without
the split. Target: calls served on routes with a tool-incapable first target. Floor: malformed
tool schemas still terminal, attempt count on them unchanged.

## What this realization cannot show

One aggregating provider, one rejection body, a scripted generator rather than the real
provider's reply. Whether the live provider returns that 404 for every tool-incapable model
was not fetched.
