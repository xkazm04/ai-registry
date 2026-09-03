---
layer: application
type: application
subject: session-continuation
technique: sealed-stage-advance
stack: process
status: forged
verified_on: 2026-09-02
---

# Process — four admitted stage sequences, a hashed descriptor, and a Stop-hook advance that accepts only the current adapter's signal in an authenticated transcript record

The realization is the named stage-profile design for `autopilot` in oh-my-claudecode
(commit `e9e8fa3847ce0b3529b84d895e841988c7308f3d`), recorded as
`docs/adr/03487-named-autopilot-stage-profiles.md`. It is a decision record rather than
a running loop, and it is cited here because it states every rule of the technique
with its reason, including the rejected alternative, and because the advance
mechanism it specifies is unusually careful about provenance.

## The closed set, with self-produced inputs

`:30-37` list the only admitted sequences — four, all beginning with `ralplan` and
`execution`, optionally followed by `ralph`, `qa`, or both in that order. `:39` states
what a profile is not: "never a dynamic command, keyword alias, mode, plugin, filename,
state identity, or independently cancellable workflow." `:51` is the self-produced-input
rule in the tree's words: `ralplan` "consumes the invocation task and produces the
canonical autopilot plan artifact. `execution` requires that readable plan ... `ralph`
requires the plan and implementation produced by `execution`; it does not manufacture
missing implementation." `:53` closes the set: "Reordered lists, duplicate stages,
omitted prerequisites, and non-built-in stages are rejected." The drivers at `:43-47`
say why — "without expanding autopilot into a general workflow engine" (`:43`) and
"Admit only sequences whose stage inputs and completion semantics are self-contained
and verifiable" (`:45`).

Validation happens before any state exists (`:57`): "Invalid/missing/duplicate
`--workflow`, an unknown profile, or a missing task fails before autopilot state is
created or changed." A project profile replaces a same-named user profile atomically
and "profile objects are never deep-merged" — a merge would produce a shape nobody
authored.

## Sealed at selection

`:61-77` is the descriptor. `:63`: after selection the run "atomically writes one
complete, existing session-scoped autopilot state record. It contains an immutable
descriptor and selected-only `PipelineTracking`; it must not write a generic
placeholder and patch it later." The descriptor (`:66-72`) carries `workflowName`,
`stages` and `profileHash`; `:75` defines the hash as SHA-256 over canonical compact
JSON of `{descriptorVersion, workflowName, profileVersion, stages}` and states the
exclusion the technique's upward lesson took: "The descriptor excludes task text, full
configuration, models, and mutable status. Only pipeline tracking may change for
progress."

`:77` is the resume rule: "Read, resume, and Stop recompute the hash before deriving a
stage. A malformed or mismatched descriptor returns
`workflow_descriptor_integrity_failed`; it does not emit a stage prompt, reload
configuration, or silently repair state. A cancelled valid run resumes from its
persisted descriptor and tracking, so later configuration changes cannot alter it."

## Exactly once, on an authenticated completion signal

`:79-85` specify the advance. Before emitting a stage's prompt, "the active stage
records its activation index, timestamp, and transcript boundary" (`:81`). `:83` is the
provenance rule in full: "A transition accepts only the current adapter's exact
completion signal in an authorized assistant JSONL record after that boundary. Evidence
must be bound to the owner session and a bounded, regular, non-symlink transcript whose
basename matches the session. User records, tool records, `<local-command-stdout>`,
malformed JSONL, pre-activation evidence, stale state, wrong stages, wrong sessions,
and arbitrary or symlink-spoofed transcripts cannot advance a stage." That sentence is
the source of the technique's assistant-channel rule: a user message or a tool result
that contains the phrase is not evidence.

`:85` is the write discipline: the candidate records immutable evidence metadata
(stage and session ids, exact signal, record location and content hash, transcript
size snapshot, activation-boundary reference, observation time); the Stop handler
"rereads authoritative state, verifies descriptor hash and ownership, and
compare-before-write guards the tracking revision/transition token. One invocation
completes the current stage, records the observation, activates exactly the next
selected stage, and emits that adapter's exact prompt. A duplicate or concurrent loser
rereads once and reports the already-current status without replaying the old
candidate. Completion is therefore exactly once."

The canonical entrypoints table at `:89-95` binds each responsibility to one surface:
selection to the keyword detector, the advance to the persistent-mode Stop hook, and
the standalone installer's templates to "Match plugin descriptor, lifecycle, and
transition behavior" — one contract for both installation paths (`:81`).

## The rejected alternatives, stated

`:97-113` record four rejections. `:111-113` is the one the technique names: "General
workflow/plugin engine. Rejected. Arbitrary stages, prompts, plugins, branches, loops,
DAGs, callbacks, and providers require their own architecture and safety model."
`:99-105` reject per-stage model defaults for the provenance reason that runs through
the whole record — "no trusted marker proves that a Task/Agent call was generated by
the active workflow rather than arbitrary user or nested work" (`:101`) — and
`:107-109` reject dynamic commands and modes because they "expand collision,
lifecycle, shipping, and cancellation behavior."

## Deviations and notes

- **Platform-bound.** `:59`: v1 "explicitly requires Linux with the `flock` utility"
  because the authenticated transcript boundary needs no-follow descriptor traversal
  and stale-lock recovery needs kernel advisory locking; other environments reject
  named-profile activation before any state mutation. The technique's standard is
  platform-neutral; this tree meets it on one platform and refuses honestly elsewhere,
  which is the right shape for a partial implementation.
- The record is an ADR at this commit. The persistent-mode hook and the state tools it
  names exist (the cancel-race test and `skills/cancel/SKILL.md:279-288` show the
  primary-first pause with `workflowRunId` and the optional `target_state_sha256`), but
  this application cites the design, not a line-by-line reading of the advance code.
