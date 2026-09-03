---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: session-scoped-capability
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, one-authority-per-vocabulary]
shared_with: []
use_when: [a capability only works because of which client is on the other end, a roster gate reads a process environment variable, one backend serves clients that connect in several different ways, deciding where a per-session availability check belongs]
---

# Session-scoped capability

Some capabilities exist because of the **runtime**: a credential is present, a
subsystem is compiled in, a dependency resolves. Others exist because of **who
is on the other end of the connection** — a pane the client can render, a
control only a rich client offers. The two look identical where a roster is
built, and they are not. A runtime capability is a property of the process; a
client-surface capability is a
property of the **session**, and the process environment is the one place it
must never be read from. This technique is that resolution rule, plus the
pairing that makes it hold: the assembly-time filter and the run-time check
derive from one policy, evaluated on the session.

## Why the environment is always the wrong slot

The reflex is to read a marker set on the process — an environment variable
stamped by whatever spawned it — because the capability *feels* like a property
of this deployment. That reading is correct in exactly one topology: client and
backend on the same machine, started together by the same launcher.

Every other topology breaks it, and there are always more than anyone plans
for. The same rich client can drive a backend spawned locally, one reached over
a tunnel, one behind a plain address and a token, and one hosted elsewhere.
Only the spawn paths set the marker. On the rest, the gate is a **silent
no-op**: the capability is stripped from the roster before the model is told
anything, while the same session's own context honestly tells the model which
client it is talking through — informed it is inside a rich client, handed a
roster that says otherwise, and no error anywhere. Two laws name the defect.
The gate reads a proxy for the thing it gates, and the proxy diverges exactly
on the topologies where it matters
([gate-sees-target](../../../../_laws.md#gate-sees-target)); and an absent
marker is not evidence — "this process was not spawned by a launcher that sets
this variable" is *unknown*, rendered as the definite value *no rich client is
attached*
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

Underneath the topological argument is a structural one that survives even in a
single-topology deployment: **the environment is one slot and a process serves
many sessions.** A per-session answer stored process-wide is either wrong for
every session but one, or right by accident. Adding a second concurrent session
turns the accident into a bug, and nothing about that change looks related.

## The resolver, and where the capability lives

Keep client-surface capabilities **off the default roster** — every other
client would carry their descriptions for nothing, and a roster is an attention
budget before it is a permission set. Put them in a **named group**, and let
**one resolver** fold it in when the session's recorded source says the client
supports them.

That source is the right input because it is the fact the session was created
with: recorded on it, travelling with it, and the same value the runtime uses
to tell the model what it is talking through. One resolver over that field
covers every topology, including ones nobody has built yet — a new transport
reporting the same source gets the capability with no code change. Per
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary),
that resolver is the only place the mapping is written. A second one — a
default in a configuration file, a convenience list in another entry point —
is the copy that gets extended when someone adds a client, while the first
quietly does not.

## A reachability check is not a surface check

Most runtimes already have a per-capability predicate: a small function
answering "is this usable right now" — is the bridge wired, did the operator
enable this integration, does the credential exist. It is a good instrument and
the wrong place for a surface question. Definitionally, those predicates answer
questions about the *runtime*, and "which client is connected" is not one. The
reason that decides it is structural: **such predicates are cached with a
time-to-live, and the cache is not per session.** A per-session answer placed
there is computed once and served to whichever session asks next.

The dividing question, asked of each predicate: *could two sessions of this
process disagree about the answer?* If yes, it is not a reachability check, it
resolves from the session, and it does not belong in a shared cache at all.

None of this makes the spawn marker useless; it makes it a different fact,
legitimately gating process-level behaviour — whether a background scheduler
runs here, which asset path to serve. It does not mean "a rich client is
watching", and the standing counterexample is the embedded terminal: the same
launcher spawned the backend, and the client on the other end is a plain
terminal. Name the two facts differently.

## One policy, two enforcement points

The roster the model is shown and the executor's refusal derive from the
**same resolver, evaluated on the same session**. Splitting them fails both
ways: a capability the filter granted but the executor refuses is a fluent
invitation to fail, and one the executor would allow but the filter withheld is
the silent absence above. One policy means a withheld capability is refused if
it is ever reached, and a granted one is never refused for the reason it was
granted.

**Test it with the assertion the wrong gate could never pass.** A test that
sets the marker and asserts the capability is present passes under both designs
and discriminates nothing. The test that matters: a session whose source is the
rich client gets the capability **with the marker absent.** That one is the
whole difference, and it fails loudly the day someone reintroduces the
environment read.

## Where this stops

[assembly-identity](./assembly-identity.md) owns the digest over the assembled
runtime, and the capability roster is one of its sorted components. This
technique decides which roster a session gets — so two sessions of one process
can be two assemblies, and an identity captured at assembly, recording what was
*resolved*, says so correctly; that is one reason the identity is captured per
run. [operator-tier-code-loading](./operator-tier-code-loading.md) governs who
may *supply* a capability; this governs which session may *hold* one.

And a client surface is not a tenant. Where one process serves several isolated
configurations — separate credentials, stores, extension sets — the scope that
matters is the configuration's, it must propagate into work the session spawns,
and it is a substantially larger problem. Do not let this resolver grow into
that one.

## Decision rules

- Ask of every capability: would it still make sense with the client on another
  machine? If yes, it is session-scoped and resolves from the session's
  recorded source — never from an environment variable, a spawn marker, or
  anything else with one slot per process.
- Keep client-surface capabilities off the default roster; put them in a named
  group folded in by one resolver, the only place the mapping is written.
- Keep per-capability reachability predicates for runtime facts only; where two
  sessions could disagree about an answer, resolve it from the session and
  never from a shared, expiring cache.
- Give a legitimate spawn marker its own name and its own question; never let
  it stand in for "a client of this kind is attached".
- Derive the assembly-time filter and the run-time refusal from one policy on
  one session, and assert the capability is present with the marker absent.

## When not to use it

A runtime with exactly one way to connect has one topology and no divergence to
defend against — though even there the roster group is cheap, and the
environment read is the part that is hard to remove later. It becomes necessary
at the second transport, which usually arrives as a feature nobody called a
topology change.
