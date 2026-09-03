---
layer: application
type: application
subject: health-checks
technique: check-scheduling
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.89
---

# A readiness check with no cadence, no timer and no default deadline (rust)

`kube-rs/kube` is a Rust client and controller runtime for the Kubernetes API,
read at commit `7a4641d4cc2f693b2dee97b9fc15fadb96d7f62e`. Version witness:
`Cargo.toml:27`, `rust-version = "1.89.0"`; the tree carries no
`rust-toolchain` file, so the workspace's declared minimum compiler is the
version these citations were checked at.

`kube-runtime/src/wait.rs` (1,068 lines, of which the surface proper is the
first 340) is this tree's whole readiness facility, and it is the technique's
**on-event** trigger taken to its limit: there is no cadence, no timer, no
stamp and no backoff, because the check is not scheduled at all. It rides a
change stream, and the schedule is the stream.

## The trigger: a subscription, not a tick

`await_condition(api, name, cond)` (`:54-71`) opens a watch on one object and
skips updates until a predicate holds (`:59-62`), then takes the first update
that satisfies it (`:65-70`). Nothing polls. The technique's three legitimate
triggers collapse to one here — every re-evaluation is caused by an observed
change to the thing being asked about, which is exactly the property that
makes event-driven probes "the cheapest of the three per unit of information".

That eliminates two of the technique's hazards outright. There is no cadence
bookkeeping, so the stamp-before-you-run rule has nothing to govern: a crashed
caller leaves no stamp to be stale, and a restart re-subscribes rather than
finding every tick immediately due. And there is no backoff schedule, because
repeated identical outcomes cost nothing — a dependency that stays not-ready
produces no events and therefore no work.

**The transport is not free of the technique's obligations, though.** A watch
is created infrastructure and names its reaper
(`creation-names-reaper`): the subscription lives exactly as long as the
awaited future, and dropping the future drops the stream. That makes the
reaper the caller's cancellation, which is why the next section is not a
detail.

## No implicit timeout, and the reason is stated

`await_condition` adds no deadline, and the doc says so under a "Caveats"
heading (`:26-29`): *"Keep in mind that the condition is typically fulfilled by
an external service, which might not even be available. `await_condition` does
**not** automatically add a timeout. If this is desired, wrap it in
`tokio::time::timeout`."*

The argument is in the first clause. The fulfilling party is an external
service, so the only party who can size the wait is the one who knows why it
is waiting — a startup gate and an operator's ad-hoc wait want different
numbers, and a library-chosen default would be wrong for both while being
invisible to both. Every first-party caller supplies one: the doc's own
example wraps ten seconds (`:49`), and the tree's end-to-end binary wraps
twenty (`e2e/job.rs:41-42`).

The failure surface is correspondingly small: one error variant,
`ProbeFailed(#[source] watcher::Error)` (`:14-18`), and the doc enumerates what
does *not* fail — *"Does **not** fail if the object is not found"* (`:36`).
Absence is a legitimate observation here, not an error, which is what lets
`is_deleted` exist at all.

## Composable predicates: the check is what you watch *for*

`Condition<K>` (`:95-155`) has one required method, `matches_object(&self, obj:
Option<&K>) -> bool`, plus `not` (`:109-114`), `and` (`:129-134`) and `or`
(`:149-154`). A blanket impl (`:157-161`) makes any closure of the right shape
a condition, so the cheapest custom check is eleven lines (doc example,
`:82-93`).

Eight concrete conditions ship (`:177-304`): `is_deleted`, `is_created`,
`is_crd_established`, `is_pod_running`, `is_job_completed`,
`is_deployment_completed`, `is_service_loadbalancer_provisioned`,
`is_ingress_provisioned`. Each reads the target's **own reported status** —
the condition named `Established` with status `"True"` (`:206-217`),
`Progressing` with reason `NewReplicaSetAvailable` (`:253-266`) — never a
proxy. There is nowhere to put a proxy: the predicate receives the object and
nothing else, so "the process is up" is not expressible.

## Identity by uid, which is what makes an event-driven check safe

`is_deleted` takes a uid, never a name (`:183-191`):

```rust
pub fn is_deleted<K: Resource>(uid: &str) -> impl Condition<K> + '_ {
    move |obj: Option<&K>| {
        obj.is_none_or(|obj| obj.meta().uid.as_deref() != Some(uid))
    }
}
```

and the doc states what that buys (`:179-181`): *"An object is considered to be
deleted if the object can no longer be found, **or if its uid changes**. This
means that an object is considered to be deleted even if we miss the deletion
event and the object is recreated in the meantime."*

This is the load-bearing pairing with the trigger. An event-driven check
**must be correct without observing the event**, because a stream can drop one;
a cadence-driven check re-asks and eventually notices, and an event-driven one
does not get a second prompt. Keying on minted identity rather than on a name
converts the question from "did I see the deletion?" to "is what is there now
the thing I asked about?", which is answerable from any single observation.
Keying on the name would both hang a caller awaiting deletion across a
delete-then-recreate and, in the opposite direction, report a namesake as the
original.

## What the corpus does not state - two amendment candidates for the director

Neither appears in `check-scheduling`, `probe-design`, `three-state-outcomes`
or the health-checks golden path as read at this commit.

**1. A check keys on minted identity, never on a name — and an event-driven
check must, because it gets one look.** `probe-design`'s "probe identity and
dedup" governs the identity of *the probe* (the key two callers share), and a
bad key there costs duplicated work. Target identity is a different failure:
it produces a **wrong verdict**. The corpus's `identity-survives-reuse` law
already carries the rule for records; the amendment applies it to the thing a
check is asking about, with the delete-then-recreate case as its worked
example and the missed-event argument as its reason to live in this technique
rather than only in `probe-design`.

**2. A wait has no default deadline; the caller supplies one, and the library
refuses to guess.** `probe-design` states *"No unbounded waits, ever"* and
*"Deadline much less than the caller's patience"* — together implying a
deadline belongs somewhere, without saying **where the knob lives**. On this
evidence: at the caller, always, when the fulfilling party is external, with
the library's obligation being to document the absence loudly. That is the
existing rule's missing second half, and it inverts the reflex a reader would
otherwise take away (that a well-behaved library ships a default). The
unbounded wait stays forbidden; what changes is who is guilty of one.

## Deviation

**The verdict vocabulary is two-state.** `matches_object` returns `bool`, so
*could not determine* has nowhere to live: a predicate that cannot read the
object's status returns `false`, spelled identically to *observed not ready*.
Transport failures do escape into the error channel as `ProbeFailed`, so the
collapse is narrower than it looks — but for a present object whose status is
not yet populated, "not ready yet" and "will never be ready" are the same
value, and only the caller's timeout separates them. Under the corpus's
three-state rule this is the collapse into unhealthy. The standard does not
move; a three-valued condition would be a real improvement to this tree, and
the combinators at `:109-154` are where it would have to be paid for.
