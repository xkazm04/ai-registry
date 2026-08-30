---
layer: technique
type: technique
subject: agent-cli-transport
technique: output-normalization
status: forged
laws: [failure-not-empty-success, verdict-survives-boundary]
shared_with: []
use_when: [parsing an agent CLI's output into an answer, an envelope changed shape after a tool upgrade, log noise or user hooks corrupted a structured parse]
---

# Output normalization

Every tool in this class wraps its answer in an **envelope** — structured
output that carries the answer plus run metadata (duration, turns, token
usage, session identity, an error classification). The envelopes do not
agree with each other, and none of them is as clean in practice as its
documentation claims. This technique owns the mapping from each dialect to
the transport contract's one result type, and the hygiene that keeps the
mapping honest.

## The three envelope dialects

Observed across the current tool generation, answers arrive in one of three
shapes, and an adapter classifies its tool before writing a line of parsing:

1. **Single result object.** One structured value on the output stream; the
   answer is one named field of it, error state is a flag plus a subtype,
   metadata rides alongside. Parse once, read the field.
2. **Event stream.** A sequence of one-per-line structured events —
   run-started, item-completed, turn-completed. There is no single result
   object; the answer is the **text of the last completed item of the
   message kind**, and usage arrives in a different event. The adapter must
   fold the stream, not grab the first parseable line.
3. **Answer file.** The tool writes the final message to a file the caller
   names. This is the cleanest channel where offered — the file contains
   only the answer, immune to stream noise — at the cost of temp-file
   lifecycle (the file names its reaper, per the borrowed spawn contract).

Which dialect a tool speaks, and in which field the answer lives, is a
[dated-capability-matrix](./dated-capability-matrix.md) row — dialects have
shifted between versions of the same tool.

Two traps in reading that row. **The format flag's *name* is not the
dialect.** Line-delimited event output has become the de-facto second
channel across this class, but the option value naming it is
near-arbitrary — the same shape ships under half a dozen spellings, and one
tool has deprecated its spelling in favour of a different protocol
underneath the same idea. The matrix maps tool to dialect; it never infers
the dialect from the flag's spelling. **And the answer's field name is not
portable either**: two tools can emit a structurally identical single
object and disagree on which key holds the answer, so a normalizer that
"largely transfers" between two dialect-compatible tools still has to be
told the field. Nor does an envelope that documents a success shape
necessarily document its failure shape — where the error variant is
undocumented, the adapter treats the error branch as unverified rather than
assuming the sibling tool's.

## Stream hygiene: the rules that precede parsing

- **The output stream is data; the error stream is logs. Never merge them.**
  Tools in this class emit startup warnings, cache errors, and progress
  notices on the error stream while the envelope flows on the output
  stream; a merged capture poisons every parse intermittently.
- **Feed and close the child's input — and guard the write.** Prompts
  travel over the input stream (never the argument vector — prompts contain
  quotes, newlines, and flag-shaped text), and the stream is then closed. A
  tool left with an open, silent input stream may block waiting for
  "additional input", and at least one announces the wait as a notice that
  lands in the capture. The write itself needs its own failure handler
  attached **to the input stream**: when the child is already gone — a
  missing binary, a rejected flag — the write fails as a stream *event*, not
  as a throw the call site can catch, and not as anything the spawn-failure
  handler reports (that one covers the launch, not the pipe). Unhandled,
  the host runtime may escalate it to a fatal error, so the failure mode of
  one call becomes the death of the process that was going to degrade
  gracefully. Prompts in this subject are large; the bigger the prompt, the
  more reliably the write outlives the child.
- **Isolate from user configuration where the tool allows it.** The
  operator's own hooks and plugins can print *after* the envelope on the
  same stream — observed in the field as a hook-failure line appended to
  otherwise valid output. Tools offer isolation flags (bare mode, setting
  source restriction, ignore-user-config); the adapter uses the strongest
  one that does not also break auth, and records the choice.
- **Keep sanitization on.** Where a tool strips terminal escape sequences
  by default, leave that on; where colored output is possible, disable it
  explicitly.
- **Cap what you accumulate.** The envelope for a normal run is kilobytes;
  the buffer that collects it still carries a hard byte cap with the child
  killed on breach, because a runaway child's output is a host-memory
  attack the parser never gets to see (host protection is the neighboring
  subject's law; the cap belongs to whoever accumulates).

## Errors live inside the envelope

An agent CLI can exit zero with a failed run and nonzero with a usable
answer. The truth is in the envelope: an error flag, a subtype
classification, a result field that carries the refusal text. The adapter
therefore:

- treats envelope error state as authoritative and surfaces the **tool's
  own classification** in the typed failure — the subtype must reach the
  caller as a value it can branch on, not be flattened into one opaque
  message ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary));
- on unparseable output, **preserves a bounded prefix of the raw text in
  the error**. The raw text is the diagnosis — a login prompt, a rate-limit
  notice, an install error each read completely differently — and an
  adapter that reports only "not valid output" converts every one of them
  into "model unavailable"
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success));
- never reports an empty answer as success: an envelope whose answer field
  is missing or non-text is a failure with its own name.

## The second parse: model text to caller schema

Normalizing the envelope yields the model's *text*. When the caller wanted
structured data, there is a second extraction — and it deserves a **ladder
with telemetry**: direct parse, then fenced-block extraction, then
envelope-fragment reassembly, then a balanced-delimiter scan — recording
*which rung fired*. The rung is a leading indicator: a workload that used to
land on the direct rung and now routinely needs the balanced scan is
drifting weeks before the last rung starts failing too. Prefer the tool's
native schema-constrained output where the capability matrix says it exists
— it moves this problem to the vendor — and treat the ladder as the
fallback, not the plan. When extracting from prose, prefer the **last**
complete value over the first: prompts with examples make models echo the
example schema before the real answer.
