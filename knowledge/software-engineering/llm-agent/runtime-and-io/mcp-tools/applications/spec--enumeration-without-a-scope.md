---
layer: application
type: application
subject: mcp-tools
technique: enumeration-without-a-scope
stack: spec
verified_on: 2026-09-04
applied: simulation
ab_verdict: better
proof: structural-only
---

# A standards body deleting its own list endpoint, and writing down why

Witness: the specification repository at commit `e76e9c5`, protocol
revision `2026-07-28`, with the superseded design read from the
`2025-11-25` tree in the same checkout. No `verified_against` is recorded
because a protocol revision is a date, not a runtime version.

The Model Context Protocol's long-running-work feature went through two
designs in seven months, and the second one **removed the list operation the
first one shipped**. The reasoning survives in the proposal record, which is
what makes this worth recording as a realization rather than as a rule: it is
the rare case where a committee had to choose between documenting an
obligation and deleting a capability, chose deletion, and stated its argument
in public.

## The sequence

The first design (SEP-1686, shipped into the 2025-11-25 revision as an
experimental core feature) had `tasks/list` and handled scoping the ordinary
way — by telling implementers to do it: *"SHOULD scope task IDs … bind to the
session … bind to the authentication context."* It also carried the
consistency rule that a task retrievable via `tasks/get` **MUST** be
retrievable via `tasks/list`.

Then the protocol removed sessions (SEP-2567), for reasons that had nothing
to do with tasks: hosts had never converged on what a session *meant* — some
created one per tool call, some per application launch, some per page load,
almost none resumed one — so servers were designing against an abstraction
whose lifetime their callers controlled.

The second design (SEP-2663) removed `tasks/list` and `tasks/delete`
entirely, and named the collapse precisely:

> "There is no other natural scope a server can define unilaterally — task IDs
> can be unguessable handles that a server can recognize one at a time, but
> servers cannot reliably correlate two unrelated handles to the same caller
> without additional state."

That sentence is the technique's central asymmetry, arrived at independently
and under real pressure: recognising one handle needs no cross-call caller
identity; correlating two needs exactly that.

## The structural fact

The removal produces a security property the documented obligation could not,
and the standard says so in its own security section: *"Because there is no
`tasks/list`, a server cannot inadvertently leak the existence of one caller's
tasks to another. This is an improvement over the 2025-11-25 tasks
specification, in which a poorly-scoped list could expose unrelated task
IDs."*

Note the word **inadvertently**. The 2025-11-25 design was not insecure; it
was *conditionally* secure, on a condition each implementer had to notice,
choose a scope for, and get right — with a leak that returns a well-formed
list and no error. Removing the endpoint moves the property from
configurational to structural, which is the whole trade the technique asks
you to make.

## What it cost, and who pays

Callers lose recovery: a client that loses its handles cannot ask what it had.
The standard's answer is to push durability onto the caller — clients
"SHOULD persist task IDs to durable storage so that polling can resume after
a crash or restart." That is the right allocation, and the reason is the one
the technique gives: the caller has exactly one scope to keep track of, and
the server has all of them.

## The counter-realization in the fleet, which is why the verdict is `better`

A desktop orchestration product in the managed fleet exposes long-running
work over a peer-agent protocol and has arrived at the same shape from the
other direction: it implements per-item `get` and `cancel` handlers with an
ownership comparison on every call, refuses a mismatch with a not-found error
and a 404 that never names the owner, and its own design notes record the
anti-enumeration reason for that refusal shape. **It has no list endpoint at
all.**

Two independent systems, one a standards body under committee review and one
a single-owner product, removed or never built the same operation and gave
the same reason. Neither read the other. That convergence is the evidence for
the technique, and it is the reason this application's verdict is `better`
rather than merely observed — the alternative design was tried, shipped in a
released revision, and withdrawn.

## Limits of this record

`structural-only`: no behavioural arm was runnable. Nothing here measures a
leak that did or did not occur — the claim is about which failures are
*representable*, and the evidence is an API surface and two design records.
A behavioural arm would need a deployed multi-tenant server on the 2025-11-25
design with two callers and a scope its author got wrong, which is not
something to build in order to confirm a rule the authors already withdrew
the feature over.
