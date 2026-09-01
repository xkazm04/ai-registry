---
layer: technique
type: technique
subject: agent-cli-transport
technique: child-observed-posture
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [proving a spawned agent run got the stance and billing it was configured with, a platform wrapper sits between the host and the binary, a probe and the real run disagree about what is installed, confirming injected context actually reached the model, a startup hook runs cleanly and the agent behaves as though it never fired]
---

# Posture is what the child observed

Every promise this subject's contract makes is a promise about a **child
process**: it is installed and authorized, it bills the intended account, it
may touch only what the mode allows. The host does not hold any of those
facts. It holds an *intent* — an argument vector it assembled, an
environment it constructed, a binary name it resolved — and it hands that
intent across a boundary that can quietly modify it. The neighboring
subject's spawn record documents the intent, deliberately and well; this
technique is the other half, and it exists because **the intent and the
outcome disagree in the direction that looks healthy**.

The failure has one shape at three seams below, a fourth where enforcement
must build itself, and a fifth whose only possible witness is the model. In
each, the host's own view remains correct and unchanged, the run produces no
error, and the thing that was lost is exactly the thing the transport
promised.

## The three seams, and why each is invisible in-process

- **The argument vector.** Where the host must launch through a platform
  interpreter — because the tool is distributed as a script wrapper rather
  than a binary, which is the normal case on at least one major platform —
  the vector stops being a vector. It is concatenated into a command line
  and re-parsed. A **zero-length argument does not survive that round trip**:
  it is deleted, the flag it belonged to consumes the *next flag* as its
  value, and the remainder shifts into positional slots. Since an empty
  value is the sanctioned way several tools in this class express "grant
  nothing", the arguments most likely to be erased are the restricting ones.
  No in-process assertion can see this: the loss happens after the array
  ceases to exist, and the host's copy still reads exactly as written.
- **The environment.** A tool's own authorization report is computed *from
  the environment it is running in*. Run at the host's prompt it describes
  the host; the child runs in a constructed environment with credentials
  stripped or injected, and its answer can differ on billing direction, on
  plan tier, and on which cloud will serve the request. A probe executed
  outside the constructed environment is a statement about the wrong
  process ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
- **The binary's existence.** When an interpreter intermediates, a *missing*
  tool is not a spawn failure. The interpreter starts successfully, fails to
  find the program, and exits nonzero like any ordinary child — so the
  host's spawn-error handler, which is where every implementation puts its
  "not installed" verdict, never fires. Absence arrives disguised as a
  normal run that went badly.

## The rule

**Take each promise from the child, in the child's own terms, and treat a
disagreement with the host's intent as a failed run — not a warning.**

- **Argv**: the restriction is confirmed against the **argv the child
  reports**, not the vector the host built. A tool that can echo its
  resolved configuration is asked to; where none can, the door's own
  round-trip is pinned by a test that launches a trivial program through the
  *same* launch path — same interpreter setting, same platform — and asserts
  the received arguments match, position for position. That test is the only
  instrument that sees this class at all, and it is cheap.
  Better still, **remove the seam**: hosts usually reach for the interpreter
  only because the tool is installed as a script wrapper and the bare name
  will not launch. Resolving the name to an **absolute path** the way a
  terminal would — honoring the platform's executable-suffix rules — and
  spawning that path directly restores a true argument vector, and the
  re-parse cannot happen at all. The verification stays worthwhile, because
  the resolution is per-machine and can quietly fall back.
- **Environment**: the zero-token authorization probe runs **through the
  spawn door**, in the environment the real call will get, so the answer it
  returns is about the process that will actually serve requests. A probe
  with its own ad-hoc environment measures a process nobody will run.
  Beware the probe that answers on the wrong axis: a report can keep its
  auth-method and provider fields unchanged while a *different* field goes
  empty to signal the credential that will actually be preferred, so an
  adapter asserting one field passes while the billing quietly moves. Assert
  the **whole record against an expected shape**, and treat a field that
  went unexpectedly empty as unknown, never as unchanged
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **Existence**: "not installed" is a verdict of the
  [availability-probe](./availability-probe.md) and of the exit status and
  error text, never of the spawn-error event alone. A transport that can
  only recognize absence through that event is blind on precisely the
  deployments the [fallback-ladder](./fallback-ladder.md) exists to serve
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Enforcement that must first construct itself

The same rule reaches one seam further. Where a stance is backed by a
sandbox, the sandbox may be a *subsystem the tool builds or attaches to at
startup* — a container runtime that must be installed and running, a helper
the tool compiles on demand, a kernel facility the platform may not offer.
That construction can fail while the run proceeds unsandboxed, reporting the
failure only to a debug channel nobody captures. So the enforcement class is
not a property of the tool; it is a property of **the tool on this machine,
today**, and it is verified by observing the sandbox came up — not by
reading that the tool supports one. Where the tool exposes a way to execute
a probe command *inside* the same sandbox, that is the check
([permission-stance-enforcement](./permission-stance-enforcement.md) owns
what the classes mean; this technique owns proving the claimed one is live).

## The seam whose only witness is the model

The four seams above are all read by *code*: argv the child reports, an
authorization record it prints, an exit status, a sandbox that came up. Each
is a fact about how the child was **set up**, and something in the process can
be asked for it.

There is one more promise this class of transport makes, and no process can
answer for it. These tools compose context from the environment before the
first turn — repo instruction files, a startup hook's output, whatever the
host arranged to have injected — and the destination is the **model's
context**. A producer can run, exit zero, and emit exactly the right bytes
onto exactly the right stream, and the host can still be wrong about whether
the model received them: the tool may not wire that stream into context on
that surface, on that version, at all. Field measurement across a set of these
tools found precisely that — a project hook that ran successfully and whose
stdout never reached the model, sitting beside tools where the identical
wiring worked.

This subject already half-knows it. The `generate` mode's neutral working
directory exists **so the tool loads no ambient project instructions** — the
subject models ambient context as a contamination to be suppressed, and gives
it a whole mode. The inverse case, where the host *intends* the context to
arrive, gets nothing: no mode, no probe, no row. One direction is designed;
the other is assumed.

**Prove arrival from the consumer, not the producer.** The instrument is an
echo, and it is cheap:

- Have the injected content carry a **unique token**, freshly generated per
  open and stamped with the event that produced it.
- Ask the model, as its first instruction, to quote that token back.
- A quoted token proves delivery. **A successful producer proves nothing** —
  it separates "the hook ran" from "the hook was heard," and without the echo
  those two are the same observation
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

Stamp the token with the *source* as well as a nonce, because the answer is
per-event and not per-tool: a tool that delivers on a cold open may deliver
nothing on a context reset, and one that delivers in headless mode may fire no
hook at all in its interactive surface. Each is a separate
[dated-capability-matrix](./dated-capability-matrix.md) row with its own
verification date, and a surface that was never exercised is recorded as
**uncovered** rather than inferred from the surface that worked
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
inference is the tempting error and it runs in the unsafe direction: the
surfaces that silently drop context are exactly the ones nobody probed.

Where a surface does drop it, that is a bounded fact to design around — the
floor is unavailable there, and the compensating move belongs to whatever was
relying on it — not a defect to route around with a second delivery path that
has the same unverified property.

## What this is not

It is not a second spawn door, and it does not re-derive the door's
hardening. The door constructs the child correctly and records what it
constructed; that record is necessary and it is *self-reported*. This
technique adds the reading taken from the other side of the boundary, on the
three facts this subject sells — authorized, billed here, allowed only this
— because those are the three the host cannot observe and the ones whose
silent loss produces no error at all.
