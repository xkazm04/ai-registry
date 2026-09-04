---
layer: application
type: application
subject: agent-runtime-assembly
technique: operator-tier-code-loading
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.95
proof: structural-only
applied: simulation
ab_verdict: better
---

# The immutable core is named three times, and mounted read-write

The version witness is the tree's own toolchain pin: `mise.toml` declares
`rust = "1.95"` and `Cargo.toml`'s `workspace.package.rust-version` agrees, with
`edition = "2024"`. Read at commit `7801005`.

This is a self-modifying agent harness: a long-running agent with read-write
access to the source tree that defines its own behaviour, able to edit that
source, rebuild, and restart onto the result. Its whole safety argument rests on
one claim — that some part of itself is out of its reach — and the interesting
structural fact is that **the tree names that part three different ways and
enforces none of them.**

The three statements, all load-bearing, all in first-party documents:

- the landing page: "The **only** thing it can't muck with is an event log";
- the architecture essay: the harness "is the **only** part of Exo which cannot
  be modified by the agent";
- that same essay's footnote: "Whether or not the agent can modify the
  exo-harness is actually a policy consideration. The system technically allows
  it, but ... it's disallowed on the default configuration."

Two "only"s naming different components, and a footnote conceding the second is
configuration rather than mechanism. A reader cannot determine from the tree's
own documents what the trust root is.

## The mechanism exists and the default path does not use it

This is the part worth recording, because it is the shape of the thing rather
than a documentation defect. The sandbox mount API is capability-complete for
the claim: `SandboxMount` carries an access mode with `ReadOnly` and `ReadWrite`
variants, and the serialized form has both `ro` and `rw` spellings. Nothing
needed to be built.

The canonical startup script mounts the entire repository root — the harness
crate and every other crate included — into the agent's shared sandbox with the
read-write flag, in one line, unconditionally. There is no path filter between
that mount and the build, and no policy check on the way to the rebuild tool. So
the "default configuration" that the footnote says disallows harness
modification is precisely the configuration that permits it.

A neighbouring flag is worth naming because it looks like an access control and
is not: mounts carry an `internal` boolean, but every consumer treats it as
display scoping — whether the mount appears in a listing — never as permission.

## Why the tier rule predicts this

The technique's tiers are ordered by who writes the configuration, and this tree
adds the writer the table did not have: the model itself. The
[fourth row](../techniques/operator-tier-code-loading.md) argues that such a tier
cannot take the third row's inversion, because install-time consent is
structurally unavailable when the point of the tier is to remove the human. This
tree is that argument's field instance, and it went further than the rule's
worst case: it did not merely skip consent, it left the code-entry surface at
the *widest* tier — the running source of the harness itself — while describing
the system as one where that surface is closed.

The generalisable observation is not "they forgot a flag". It is that **a trust
root stated in prose and unbound to a mechanism drifts to the permissive
reading**, and the drift is invisible because every document still asserts the
strict one. Where a system's safety claim is "X cannot be modified", the review
question is not whether the documents say so — it is which line of code would
have to change for the claim to become false, and whether anything fails when it
does.

## What this tree cannot tell us

The read is structural: the mount flag, the type, the absence of a path filter.
It is not a behavioural proof that an agent editing the harness crate produces a
running modified harness — that requires executing the rebuild path, which needs
the full toolchain and a live model, and was not run here. What the structure
establishes is narrower and sufficient for the technique: **no mechanism is
positioned to refuse it.**

## 2026-09-04 — A/B on a second tree: a registry that knows the kind and has no load-time policy for the kind that matters

The load-failure rule flipped on 2026-09-04: the default used to be *optional
unless the operator marked required*; it now *derives from the declared kind* —
observational skips, intercepting is required unless explicitly downgraded, and
one declaration decides both the load-time and the run-time fail direction. This
section tests the flip against a tree that is not the one above: **personas**, a
Tauri desktop agent runner, read at commit `e6ed57e55` (`src-tauri/Cargo.toml`
declares `rust-version = "1.80.0"`; the tree pins no toolchain file). Mode
`simulation`; the tree was not modified.

**Seam.** The runner's hook registry, `src-tauri/src/engine/runner/hooks/`
(observer/mutator split landed 2026-09-03). Registration *does* distinguish
kinds, by type rather than by flag: `Observer::observe` returns `()` by signature
and `Interceptor::intercept` returns a typed `Decision`, and they enter the
registry through two methods, `register_observer` (`mod.rs:529`) and
`register_interceptor` (`mod.rs:554`). Both are fallible — a contribution naming
a point the host does not declare is refused, not stored (`tests.rs:383`). The
only load-time policy in the tree is the process-wide `LazyLock` initialiser
(`mod.rs:583-596`): the one shipped hook, `RunTelemetryObserver`, is registered
with `if let Err(e) = ... { tracing::error!(...) }` — log and continue. No
interceptor ships (`observers.rs` says "one, deliberately"; `MutationPoint` has a
single variant because a single emit site exists), so `register_interceptor` has
no caller and no load-time policy at all.

**Measurable, chosen before walking.** Registration failures after which the
process runs with a declared control absent and no refusal — counted over the
three real failure paths the tree already has tests or a handler for.

**Arms.** A = the rule before the flip: every load failure skips with attribution
unless the operator marked the extension required, and nothing in this tree marks
anything required, so A is the shipped `tracing::error` branch applied to every
kind. B = the rule after the flip: the fail direction follows the declared kind.

**The three cases, walked under both.**

1. *The built-in observer's registration fails in the initialiser* (`mod.rs:589`
   — the tree's own comment says this means "a declared point was removed without
   updating the observer"). A: skip, log. B: observational, so skip, log. Same.
2. *An observer registered against an unknown `ObservationPoint`* (`mod.rs:535`,
   exercised by `registration_against_an_unknown_point_is_refused_not_stored`).
   A: refused and the host continues. B: same — an absent observer is a gap in
   telemetry, which is the honest state. Same.
3. *An interceptor registered against an unknown `MutationPoint`* (`mod.rs:555`,
   the refusal exists ahead of its first consumer "so the path is reviewed on its
   own"). A: the only shipped policy is the observer branch, and a first
   interceptor added to the initialiser inherits it — log and continue, and the
   `ApiRequest` chain runs for the process lifetime with the contributed guard
   absent while the host reports itself started. B: intercepting defaults to
   required; the registration failure refuses start unless the declaration
   carries a recorded downgrade. **A: 1 of 3 runs with a control silently absent.
   B: 0 of 3**, at no cost on the two observer cases.

The walk also surfaced the shape B has to account for in *this* runtime: the
registry is a `LazyLock`, so "refuse to start" is not the primitive available. A
panic inside the initialiser poisons the lock and every later `emit` or
`run_api_request_chain` panics — fail-closed at *first use*, not at startup,
which is the wrong moment (a caller's request, attribution lost — the host-routes
rule's build-late failure). B's implementation here is a registration step in
`boot::services` that runs before the runner accepts work, with the interceptor's
declaration carrying the fail direction, and the `LazyLock` reduced to storage.

**What the tree already argues.** The module doc reaches B's reasoning at run
time on its own: "a panicking observer ... cannot have withheld a decision, so
continuing is the only correct direction, and it is available precisely because
returns are discarded". That is *fail direction derived from the declared kind*,
applied to `emit`. The flip extends the same derivation to load time, where the
tree has one branch for one kind and nothing for the other — the two-policies
shape the technique warns about, waiting for its first interceptor.

**Floor and its limit.** Three real failure paths from one tree, each with a
handler or a test; but one hook ships and zero interceptors, so the "three real
hooks" floor is met over paths, not hooks, and case 3 is a shipped refusal with
no shipped registrant. **Falsifier:** an interceptor lands whose registration
failure is routed to refuse-start by a mechanism that is *not* its declaration —
a global flag, a required list — and no disagreement between its load-time and
run-time directions ever follows. If that holds for a year, one declaration
deciding both is a preference, not a rule. Return condition: the first
interceptor registered in `boot::services`.
