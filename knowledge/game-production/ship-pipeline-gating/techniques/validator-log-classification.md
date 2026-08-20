---
layer: technique
type: technique
subject: ship-pipeline-gating
technique: validator-log-classification
status: forged
laws: [no-gate-self-certifies, a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a tool reports success but its own log contains errors, judging a long-lived application driven into performing a task, deciding whether an exit code means anything]
---

# Validator log classification

## The concern

A content validator, an asset importer, an in-application automation run — any process
that was built to *survive* problems and return to a usable state — reports an exit
status describing whether the process held together, not whether the task succeeded. Its
real verdict is in its output. Reading the status instead of the output is the most
common way a pipeline certifies a broken artifact, and it is arrived at independently by
every subsystem that has been burned by it.

The law is short: **judged by output content, never by exit code**, for any process whose
lifetime is not bounded by the task it was asked to perform.

## Which mode a gate is in

Determine this before writing the gate, and write down which it is.

**Exit-code-judged** — the process exists only to do the task, terminates when it is
done, and sets a status accordingly. A separate build tool invoked out of process is the
canonical case. Prefer this mode wherever a tool offers it, even at the cost of a slower
gate: the verdict comes from an authority structurally separate from the work, and its
failure is unambiguous.

**Log-judged** — the process outlives the task. Any application driven into performing
work in-session is here; so is any tool with an error-recovery path that keeps running.
Its zero status means "I am still standing", which is not the question.

Its **non**-zero status is equally uninformative, and this is the half that surprises
people. A large application shutting down headlessly can fault during teardown long after
the work completed and was written to disk. A gate that treats that non-zero as failure
is not erring on the safe side; it is failing green builds for a reason unconnected to
the build, which is how a team learns to bypass a gate. Both directions of the exit
status are noise. Read the log.

The trap in the middle: a tool that is *usually* exit-code-honest but swallows a class of
error into a warning. Treat the mode as a property of the tool, established by reading
its behaviour under real failure, not assumed from its documentation.

## Procedure for a log-judged gate

1. **Capture the whole stream**, both output channels, to a file. A verdict you cannot
   re-read later is not evidence; a verdict bound to a log you kept is.
2. **Scope the classifier to the subsystem that emits the verdict.** A shared log stream
   carries every subsystem's output; an error from unrelated code is not a content
   defect, and matching on severity alone turns the gate into a general application-health
   check that fails builds for reasons it was never asked about. Key on the emitting
   category first, severity second. This is the difference between a gate people trust
   and one they route around.
3. **Define error patterns explicitly** — the severity markers and the message shapes
   that mean the task failed. Anchor them enough that they do not match prose that merely
   mentions the word, and exclude the summary shapes that report a count of zero.
4. **Define success patterns explicitly** — the completion line the tool emits when it
   genuinely finished. Requiring an affirmative success marker is what distinguishes
   "no errors seen" from "the tool got that far".
5. **Classify totally.** Every run lands in exactly one of: errors matched → fail;
   success marker present and no errors → pass; **neither** → unclassified.
6. **Do not let unclassified pass.** A run that produced no recognised success marker and
   no recognised error usually means the tool crashed early, was killed, or changed its
   output format. All three are conditions under which shipping is wrong.
7. **Bind the verdict to what it judged.** Record the artifact or content set the run
   examined. When that content changes, the verdict is a statement about the past, and it
   must be reported as stale rather than reused as current.
8. **Report counts by severity, not a boolean.** Deduplicate on severity plus message
   before counting, or one defect repeated per asset reads as a hundred and the number
   stops meaning anything.
9. **Read the informational lines that carry a count.** Some defects are never reported
   at error or warning severity at all — they are summarised, at ordinary verbosity, as
   "n items fixed up" or "n left over". A nonzero count there is a real signal that a
   severity-only classifier discards entirely.
10. **Keep the counts.** Warning counts are the raw material of a trend gate later;
   discard them now and you cannot build one.

## Decision rules

- **When a process outlives its task, its exit status is not a verdict about the task.**
  This is the general form and it holds outside build pipelines entirely.
- **When choosing between an out-of-process tool and an in-application automation run for
  the same job, choose the out-of-process tool** unless it cannot do the job. Being
  exit-code-judged is a real property worth paying for.
- **When the tool's output format changes**, the gate must fail loudly rather than
  degrade to permissive. Pattern sets are configuration; unrecognised output is the
  signal that the configuration is stale.
- **When a warning class is chronically present and accepted**, promote it to an
  explicit allowance with a count ceiling. Never widen the error pattern to exclude it —
  that hides its successors too.
- **When the log is enormous**, classify streaming and keep the matched lines plus a
  bounded tail. Retaining nothing is the failure; retaining everything is merely
  expensive.

## When not to use this

- When the tool is genuinely exit-code-judged. Adding log parsing on top invents a second
  authority for one quantity, and the day the two disagree is the day nobody knows which
  to believe.
- When the "log" is a structured machine-readable report. Then parse the report as data
  and judge its fields; text classification is the fallback for tools that only speak
  prose.
- As a substitute for observing the artifact. A clean validator log says the content
  passed the validator's rules. It says nothing about whether the packaged result starts,
  and nothing about whether a rule the validator does not have would have caught the
  defect.
