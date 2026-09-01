---
layer: golden-path
type: golden-path
subject: agent-cli-transport
status: forged
techniques:
  - availability-probe
  - subscription-auth-selection
  - output-normalization
  - permission-stance-enforcement
  - dated-capability-matrix
  - fallback-ladder
  - child-observed-posture
  - spawn-contract@subprocess-lifecycle
  - termination-and-reaping@subprocess-lifecycle
---

# Coding-agent CLIs as headless model transports

This is the subject you own when an application spawns an **interactive
coding-agent command-line tool in its non-interactive mode** and treats it as
an LLM transport: prompt in, answer out, one child process per call. The
tools in this class were built to sit in a developer's terminal — they carry
their own auth session, their own tool-use loop, their own permission engine,
their own repository awareness — and every one of the majors now exposes a
headless print mode that turns that whole apparatus into a callable engine.

The reason to do this instead of calling a provider API is not convenience;
it is usually **economics and capability at once**. The agent CLI bills
against the operator's existing flat-rate seat rather than per token, which
is what makes mass workloads — bulk fixture generation, eval sweeps, repo
scans, batch scoring — affordable at all; and it brings an agentic loop
(file reading, search, tool use) that a bare completion endpoint does not
have. The price is that the transport is a *subprocess of a product that
changes weekly*, on the user's machine, under the user's login — and the
whole subject is the discipline of making that honest.

The boundary with the neighbors is precise. Spawning, environment
construction, stream wiring, termination, and reaping are
[subprocess-lifecycle](../subprocess-lifecycle/subprocess-lifecycle.md)'s
subject — this subject *borrows*
[spawn-contract](../subprocess-lifecycle/techniques/spawn-contract.md) and
[termination-and-reaping](../subprocess-lifecycle/techniques/termination-and-reaping.md)
rather than restating them, and adds only what is specific to a child that is
an agent: whose bill it lands on, what it is permitted to touch, and what its
answer channel means. Rendering a live token stream is
[streaming-output](../streaming-output/streaming-output.md); this subject's
normal shape is batch — one process, one final envelope.

## The transport contract

Every adapter in this subject implements the same two-function contract, and
the contract is the standard — the per-tool flags are data behind it:

- **`probe()`** — is the tool installed, at what version, and is it
  *authorized to answer*, proven **without spending tokens** where the tool
  allows it, and proven **through the same spawn door and environment the
  real call will use** — these tools compute their own auth report from the
  environment they are handed, so a probe run anywhere else describes a
  process nobody will launch. A probe that cannot be zero-cost says so; it
  never pretends. Owned by
  [availability-probe](./techniques/availability-probe.md), with the
  observation discipline in
  [child-observed-posture](./techniques/child-observed-posture.md).
- **`run({prompt, mode, cwd, schema?, model?, timeoutMs})`** →
  **`{ok, text | json, raw, durationMs}`** — one call, one child process, one
  normalized result. The prompt travels over the child's input stream, never
  the argument vector (prompts contain quotes, newlines, and flag-shaped
  text). `raw` keeps the tool's full envelope so metering and diagnosis
  never depend on the normalized view. Failure is a typed outcome carrying
  the tool's own error classification, not a bare non-zero exit.

Three clauses of the contract are load-bearing enough to state here rather
than in a technique:

**The mode is the caller's typed choice, and it never folds.** `mode` is a
closed vocabulary — `generate` (no workspace access; neutral working
directory so the tool loads no ambient project instructions),
`readonly-scan` (the tool may read the workspace and provably cannot write
it), `edit` (the tool works inside a workspace and is expected to change it).
These are **separate seams, not one parameterized function**. A field
implementation that kept its assessment path and its editing path as two
deliberately distinct modules states the reason perfectly: folding them into
one function with a flag "would make 'which mode am I in?' a bug that
type-checks." The generate seam's neutrality (no project context, no
permission grants) and the edit seam's containment (isolated worktree,
explicit consent gate) are opposite postures on every axis; a shared code
path guarantees that one eventually inherits the other's defaults. Stance
*enforcement* — what backs each mode's promise — is owned by
[permission-stance-enforcement](./techniques/permission-stance-enforcement.md).

**Capability answers are dated data, never baked constants.** Which output
formats a tool supports, whether it can constrain output to a schema,
whether its read-only mode is policy or an operating-system sandbox, which
environment variable flips its billing — all of that is true *of a version
on a date*, and these tools ship weekly. The adapter reads capabilities from
a matrix that carries its verification dates and methods, and a feature
declares the mode and capabilities it requires, then shows, degrades, or
hides accordingly. Owned by
[dated-capability-matrix](./techniques/dated-capability-matrix.md).

**The timeout is the application's — and it is no longer always the only
one.** Across the mainstream tools of this class the ceiling is still the
host killing the child: what they ship instead of a wall clock is
iteration- or spend-shaped (a turn cap, a budget cap), and open reports of
headless runs hanging for hours are the evidence that the wall clock is
genuinely absent. So every `run` carries `timeoutMs` enforced by the
spawning application — a generous ceiling, with the kill routed through the
borrowed termination ladder — and a misconfigured tiny timeout is treated as
misconfiguration (floored), never as "no timeout", because an instant kill
on every call silently routes the whole product to its fallback floor.

The claim's absolute form has expired, though, and the exception is the
dangerous direction. A minority of newer tools now ship a run-level
wall-clock flag, and **at least one applies a ceiling of a few minutes by
default** — whether or not the caller asks for one. Against such a tool the
application's generous timeout never fires: the child exits first, on the
tool's clock, and the truncation arrives looking like a short or failed
answer rather than like a deadline. "Does this tool impose its own run
ceiling, and what is its default?" is therefore a
[dated-capability-matrix](./techniques/dated-capability-matrix.md) row, and
where a tool has one the adapter sets it explicitly to a value it chose,
rather than inheriting a default it never saw.

## Auth is the economics, and it is ambient

The child inherits an environment in which a metered API key may be sitting,
and most tools in this class prefer a key over the seat session when both
are visible. An application that means to run on the operator's subscription
must therefore **strip the metering keys from the child environment on
purpose** — and at least one tool family inverts the rule and runs *only*
with an injected key. Direction-per-tool is data;
[subscription-auth-selection](./techniques/subscription-auth-selection.md)
owns it, and the strip lives at the single spawn door so no call site can
forget it.

## The answer channel is a dialect, not a standard

One tool returns a single result object with the answer in one field;
another emits an event stream where the answer is the text of the last
completed-message event; a third writes the final message to a file the
caller names. All of them decorate the data channel with noise — user hooks,
startup warnings, progress notices — and all of them report errors *inside*
the envelope, not only via exit code.
[output-normalization](./techniques/output-normalization.md) owns the
mapping from every dialect to the contract's one result type, and the
hygiene that keeps log channels out of the parse.

## Absence is a product state

The binary is not installed on the managed platform; the operator never
logged in; the deployment is deliberately offline. A transport in this
subject is an **optional dependency**, and the product's behavior without it
is designed, labeled, and tested — a deterministic fallback that says it is
deterministic, never a silent impersonation of a model verdict.
[fallback-ladder](./techniques/fallback-ladder.md) owns the ladder and its
honesty.

## The techniques

- [availability-probe](./techniques/availability-probe.md) — version and
  zero-token authorization proof; why credential-file existence proves
  nothing.
- [subscription-auth-selection](./techniques/subscription-auth-selection.md) —
  whose bill the run lands on; strip versus inject, per tool, at the one door.
- [output-normalization](./techniques/output-normalization.md) — envelope
  dialects to one result type; stream separation, noise isolation, the
  extraction ladder.
- [permission-stance-enforcement](./techniques/permission-stance-enforcement.md) —
  making each mode's promise real: layered grants, enforcement-class honesty,
  silent-downgrade detection.
- [dated-capability-matrix](./techniques/dated-capability-matrix.md) —
  capabilities as verified, dated data; feature gating on required
  capabilities.
- [fallback-ladder](./techniques/fallback-ladder.md) — designed degradation
  when the transport is absent, and the labels that keep it honest.
- [child-observed-posture](./techniques/child-observed-posture.md) — proving
  the stance, the billing direction and the tool's presence from the child
  rather than from the host's intent, at the seams that lose them silently —
  including the one only the model can testify to, where injected context
  never arrives and the producer still exits clean.
- Borrowed:
  [spawn-contract](../subprocess-lifecycle/techniques/spawn-contract.md) and
  [termination-and-reaping](../subprocess-lifecycle/techniques/termination-and-reaping.md)
  from [subprocess-lifecycle](../subprocess-lifecycle/subprocess-lifecycle.md)
  — the process mechanics are that subject's, unchanged.
