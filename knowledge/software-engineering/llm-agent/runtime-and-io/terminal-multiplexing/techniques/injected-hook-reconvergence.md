---
layer: technique
type: technique
subject: terminal-multiplexing
technique: injected-hook-reconvergence
status: forged
laws: [absent-guard-is-loud, derivation-names-recomputation]
shared_with: []
use_when: [user configuration loads after the integration and overrides it, the integration works on a clean profile and not on a real one, settings the integration depends on drift back after the first command, a hook chain grows a duplicate entry on every prompt]
---

# Injected hook reconvergence

To inject a command-boundary protocol into a third-party shell, the host
starts that shell under a configuration of its own: a wrapper that loads the
integration and then hands control to the user's normal environment. The
integration must go first, because it has to be installed before the first
prompt is drawn. Which means the user's own configuration necessarily goes
**last** — and last writer wins.

That is not a bug in the arrangement. It is the arrangement. An injected hook
loads before user-controlled configuration by construction, so it will be
overridden by construction, and a design that installs its invariants once at
load has made a bet on the goodwill of code it has never read. This technique
owns the alternative: **re-converge every cycle.**

## What gets overridden, and why none of it is malice

The user's configuration is not attacking the integration. It is doing the
ordinary things configurations do, each of which happens to land on a setting
the protocol depends on: replacing the prompt (which may carry marker
segments), resetting the hook chain to a known list, rebinding the line
editor, changing history behaviour so that submitted lines are rewritten
before they run, or re-initializing the input mode the observer's parser
assumes. Every one of these is a legitimate customization and every one of
them silently removes a piece of the protocol.

The result is the failure signature that makes this lane confusing to debug:
**the integration works perfectly on a clean profile and intermittently on
real ones.** Whatever is tested is the state at the end of load, and what
matters is the state at the start of each command.

## Re-converge on the clock the protocol already has

The integration is emitting a prompt-start marker on every cycle regardless,
which means it already runs code at exactly the right moment. That is the
convergence point: at each prompt cycle, before the marker that says a prompt
is being drawn, the integration re-asserts the small set of invariants its own
protocol depends on —

- its hook is still in the chain, and still in the position the protocol
  requires relative to other entries;
- the marker-emitting segments are still present in the prompt it will draw;
- the input modes the host's parser assumes are still enabled;
- the command-line handling that would rewrite a submitted line before the
  preamble runs is still in the state the protocol needs.

The installed configuration is a value derived from the integration's intent,
materialized into a live process that other writers also touch. A derived
value that is stored and never recomputed drifts with no arbiter; naming the
recomputation — here, an idempotent re-assert on a clock the system already
ticks — is what makes the divergence self-correcting rather than a support
ticket
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

## Assert and repair — never reinstall

Re-convergence is *checking* an invariant and repairing only the divergence.
The naive implementation re-runs the installer every cycle, and its failure is
mechanical: the hook chain gains a second copy of the hook on every prompt, so
the session emits duplicate markers, the parser sees boundaries it cannot pair
up, and a long-lived session degrades gradually until somebody blames the
shell. The same shape appears in the prompt, which grows a repeated segment,
and in any list-valued setting the integration appends to.

The discipline: membership and position are queried, and a repair is
performed only when the query fails. Idempotence is a property of the
assertion, not a hope about the installer. It also keeps the cost honest —
this code runs before every prompt a human ever sees, so the per-cycle work
must be a handful of comparisons. Anything expensive belongs at load with only
its *presence* re-checked per cycle.

## Re-converge your invariants, not the user's preferences

The scope of what may be re-asserted is as load-bearing as the mechanism. The
integration re-converges only the state its protocol reads: the marker
emission, the hook position, the modes the parser depends on. It does not
re-converge the user's prompt text, their colours, their aliases, or any
binding that does not touch the marker path.

An integration that re-asserts everything it installed is a configuration the
user cannot customize — their change reverts before the next command, from a
component they did not knowingly install, with no message. Users respond by
disabling the integration entirely, which takes the protocol tier with it.
The narrow scope is what makes the mechanism acceptable to live in someone
else's shell.

## When convergence fails, say so and step down

Some divergences cannot be repaired: the user has deliberately removed the
integration's hook, or replaced a facility it needs with something
incompatible. The re-assert must distinguish *repaired* from *cannot repair*,
and the second is not a silent condition. An integration that keeps
advertising the protocol tier while its own invariants are gone hands the
host a capability claim with nothing behind it, and the host will wait for
markers that no longer have an emitter.

So the failure is loud in the one way that helps: the integration stops
claiming the capability, the session's runs demote to the fallback tier
through [capability-revalidation](./capability-revalidation.md)'s per-run
check, and the reason is recorded where a diagnostic can read it. A guard
that quietly stops guarding because something else in the process rewrote a
variable has made the system's most consequential decision without saying so
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)) — and in
this lane, unlike most, the correct degraded state already exists and is
well-understood. Stepping down to it is cheap; pretending is not.
