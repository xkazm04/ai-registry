---
layer: technique
type: technique
subject: native-shell-integration
technique: capability-presence-contract
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [a feature is built for one platform and the product still ships on three, a user is told to grant a permission their operating system does not have, deciding between a runtime guard and compiling the call out entirely, a host implementation of an interface member is a throw or a silent no-op, a control is offered on a host where pressing it can only fail]
---

# Capability presence contract

Grant state answers "has the user allowed this?". **Presence** answers a
question that is asked earlier and answered by nobody: "does this host have
this capability at all?" A product that keeps only the first axis has no way to
distinguish a capability the user could enable in thirty seconds from one that
does not exist on their machine and never will — and because a not-present
capability reads as not-granted, the product does the only thing it knows how
to do with an ungranted capability: it tells the user to go and grant it. The
user opens a settings surface that has no such entry, or no such surface, and
concludes the product is broken. **A refusal that names the wrong cause is
worse than a refusal that names none**
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).

## Four classes, declared per capability per host

Every host-facing capability the product depends on carries a class for each
host it ships to, and the classes are not orderable — each demands different
behaviour:

1. **Present and ungoverned.** The host provides it and asks nobody's
   permission. There is no gate, no notice, no settings link. The grant vector
   must report this as *satisfied*, not as *unknown*, or an unrelated gate
   inherits a phantom blocker on the host with the fewest restrictions.
2. **Present and governed.** The host provides it behind a grant. This is the
   only class the grant vector's machinery applies to.
3. **Absent, feature degrades.** The host has no such capability; the feature
   runs without the stage it served. The product says so where the stage would
   have appeared, once, in the product's own words — not as an error, and never
   with an action the user cannot take.
4. **Absent, feature impossible.** The host cannot support the feature at all.
   The control is not offered. Offering a control whose only outcome is a
   refusal spends the user's attention to deliver a disappointment, and the
   telemetry it produces is indistinguishable from a real defect.

The classes are data, declared in one place and read by the gate, the checklist
and the disclosure. Deriving them from scattered host checks at the call sites
means the checklist and the gate can disagree, and they will.

## Refuse with the class, not with the nearest available message

The failure this technique exists to prevent has a precise shape. A guard
written for the governed case is asked about a host in class 3 or 4, has no
representation for "absent", falls through to its ungranted branch, and emits
the ungranted message. Everything about the code is locally reasonable; the
output is a confident instruction to do something impossible.

The fix is that **the refusal carries the class as a typed value all the way to
the surface that renders it**
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).
"Not supported on this host" and "not granted yet" are two outcomes with two
messages and two different available actions — the second has a settings link
and a recheck, the first has neither and must not grow one. A stub that
resolves to a generic failure string erases the distinction at exactly the
boundary where the user interface needed it.

Two anti-patterns produce the same erasure by other routes and both are common:

- **The throwing stub.** An interface member implemented on the unsupported
  host as a throw pushes the class into an exception message, where the caller
  can only string-match it. If the answer is always "no", the honest interface
  member is a *predicate* the caller checks — supported yes/no — beside a call
  the caller only makes when the predicate said yes.
- **The lying no-op.** A member implemented as an empty function that returns
  success is worse: the caller believes the work happened. A no-op is only
  honest where doing nothing genuinely *is* the correct behaviour on that host
  and the caller has nothing to decide — teardown of a resource that host never
  created, for instance — and even then it is worth a comment saying which of
  the two it is
  ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).

## Compile out where the call is unsafe, guard where it is merely useless

There are two ways to keep an absent capability from running, and they are not
interchangeable.

A **runtime guard** is the default. It keeps one body of code, keeps the
unsupported path visible to readers and to the type checker, and lets the class
be reported rather than merely avoided. Use it whenever the underlying call, if
somehow reached, would fail in an ordinary way — an error, a false return, a
missing symbol handled by the loader.

**Compile the call out** when reaching it is not merely useless but *unsafe*:
where the host's own implementation aborts the process rather than returning a
failure, where the symbol does not exist to link against, or where the guard
would have to sit inside a hot path it cannot afford. The canonical case is a
window capability whose implementation dereferences a handle that does not
exist until the window has been realised, and which terminates the process
rather than reporting the absence. There is no runtime guard for that — the
condition is not observable from inside the product — so the capability is
excluded from the build for that host and the surrounding code states in one
line that it is a workaround for a different host and is deliberately absent
here.

The rule that keeps this from becoming a habit: **compiling out removes the
code and therefore removes the ability to report the class**, so a
compiled-out capability still needs its class declared in the data above.
Otherwise the presence matrix and the build disagree, and the matrix is what
the interface reads.

## Decision rules

- Classify every host capability per host into the four classes; store the
  matrix once.
- Class 1 reports *satisfied* to the gate, never *unknown*.
- Class 3 discloses; class 4 does not render the control at all.
- A refusal carries its class to the surface; no surface may infer the class
  from message text.
- An interface member whose only implementation on another host is a throw
  becomes a predicate plus a guarded call.
- Compile out only for unsafe-if-reached; guard for useless-if-reached; declare
  the class either way.

## When not to use this

- **The product ships to one host.** There is no matrix, and the classes
  collapse into the grant vector. Adding the axis here is ceremony.
- **The capability can be acquired.** A missing engine, model or helper the
  product can download is availability, not presence — a different subject
  entirely, whose answer is a resolution and a probe rather than a declared
  constant.
- **The absence is temporary and observable.** A device that is unplugged, a
  service that is stopped, a display that is disconnected — those are runtime
  states with their own lifecycles, and freezing them into a per-host constant
  makes the product wrong the moment the user plugs the thing in.
