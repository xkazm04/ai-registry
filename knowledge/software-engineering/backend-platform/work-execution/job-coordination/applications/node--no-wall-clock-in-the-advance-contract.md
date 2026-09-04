---
layer: application
type: application
subject: job-coordination
technique: no-wall-clock-in-the-advance-contract
stack: node
verified_on: 2026-09-04
verified_against: node@22.19.0
---

# Removing a deadline from a durable advance call (Node/TypeScript)

How `earendil-works/pi` realizes no-wall-clock-in-the-advance-contract.
Citations are against commit `92d8e2d1` (2026-09-04); stack witness is the
repository's `engines` field (`package.json:63-65`).

This application is unusual in one respect worth stating up front: **the
evidence is a deletion.** The option existed, shipped, and was removed in a
numbered work package that argues the case
(`packages/agent/docs/work-packages/03-remove-drive-deadlines.md`), which makes
the tree a rare source of the counter-argument rather than only the rule.

## 1. What was removed, and how completely

`DriveOptions.deadline` and the corresponding `DriveOutcome { kind: "yielded" }`
were deleted from the public type, the documentation, the invariants, the race
list and the tests. The surviving contract:

```ts
interface DriveOptions {
  operationId: string;
  waitForRetry?: boolean;
  pollDeferred?: boolean;
}

type DriveOutcome =
  | { kind: "settled";         operationId: string; outcome: TerminalOperationOutcome }
  | { kind: "waiting";         operationId: string; reason: "retry";    notBefore: number }
  | { kind: "waiting";         operationId: string; reason: "deferred"; deferred: DeferredHandle }
  | { kind: "action_required"; operationId: string; action: ActionInfo };
```

The package is explicit that no soft landing was left: *"There is no deprecated
alias, ignored `deadline` field, compatibility overload, alternate timestamp
option, or replacement pause flag."*

Note that the surviving outcomes are exactly the technique's prescription —
durable facts, and for a wait, `notBefore` as an **instant** rather than a
duration.

## 2. The argument, in the tree's own terms

The work package's problem statement is the technique's central claim reached
independently:

> *"A deadline is checked only before starting another transition or effect. An
> admitted provider/tool/hook may run beyond it and the host may terminate the
> process anyway... Unknown-outcome recovery remains mandatory. The deadline
> therefore does not prevent process loss, bound admitted work, make effects
> exactly once, or simplify recovery."*

And the cost side, enumerated rather than asserted — the four reconciliations
that vanish with the option:

> *"a `yielded` public outcome unrelated to durable state; safe-boundary checks
> before hooks/effects/transitions; deadline-versus-retry-timer arbitration;
> deadline-versus-effect-admission races; convenience loops and event-bracket
> behavior for yields."*

Closing with the ownership line: *"The host already owns scheduling and
termination. Process loss is a controlled crash boundary recovered from durable
operation state."*

## 3. The removal is fenced by an invariant, which is what makes it durable

A deletion without a rule is re-added by the next person who finds its absence
surprising. Invariant 25 (`harness.md:1343`) closes that:

> *"No public drive option encodes a wall-clock budget or partial-progress
> return. An admitted effect settles normally or is recovered from durable state
> after task loss; host scheduling and process termination remain outside the
> harness contract."*

The invariant covers **both** halves — the budget and the partial-progress
return — which matters, because the `yielded` outcome is the half a
reintroduction usually smuggles back in first.

## 4. What replaced it, and why that is not the same thing

Determinism in tests was the deadline's incidental benefit, and the package
names the replacement rather than leaving a hole: *"Deterministic tests gate
commits and control hooks, providers, tools, and timers without adding
production execution barriers."* That is the general shape of the correct
trade — a test-only seam instead of a production control primitive — and it is
what allows the harness's own race catalog (§9.2) to construct both orders of
every race without any wall clock at all.

## 5. What this realization cannot do

- **It does not bound a runaway tool**, and does not pretend to. Tool and
  provider calls carry their own timeouts at the point the time is spent; the
  harness contributes only the abort signal via its gate (§4.2). A tool that
  ignores its signal runs until the host kills the process, and §0.6 lists
  process termination as outside the contract.
- **It pushes a real obligation onto the serving layer.** Something must decide
  when to call `drive` again, and the harness deliberately will not: §0.6's
  non-goals include *"Work scheduling — the harness never creates platform
  alarms, scans repositories for abandoned sessions, leases hosted submissions,
  or promises an HTTP receipt."* For a host that has no scheduler, this is more
  work, not less.
- **The technique's precondition is a separable advance call.** The anti-pattern
  requires a runtime whose advance step can be invoked by an external scheduler
  independently of the effect's execution. A worker that owns its job's process
  for the job's whole life cannot express the mistake, and gets no benefit from
  the rule — see the sibling `not-better` rows in the applied ledger.
