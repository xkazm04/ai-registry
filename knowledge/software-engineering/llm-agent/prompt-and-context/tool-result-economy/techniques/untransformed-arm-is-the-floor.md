---
layer: technique
type: technique
subject: tool-result-economy
technique: untransformed-arm-is-the-floor
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [a transform sits between a tool and the model and rewrites what the model reads, a summarizer reported a clean result for a run that failed, a compressed result came out longer than the original, a transform asks the tool for a different output format so it can parse it, deciding what a transform returns when it fails or does not recognise the output]
---

# The untransformed arm is the floor

A transform that stands between a tool and the model - a filter, a summarizer,
a compressor, a parser that reduces output to a verdict - is licensed by one
comparison: what the model would have read had the transform not been there.
Call that the untransformed arm. The transform exists to beat it, and wherever
it cannot show that it does, it yields the untransformed arm. That is the
whole rule, and it is broken in four places that look unrelated until the rule
is named: on a short output, on a failed run, on the transform's own crash,
and on the day the transform changed the invocation and with it the arm.

[compressibility-follows-the-producer](./compressibility-follows-the-producer.md)
decides what may be transformed and
[escape-hatch-usage-as-the-safety-metric](./escape-hatch-usage-as-the-safety-metric.md)
decides how the way back is measured. This technique is the guard between them,
evaluated on every call: whatever the transform produced, was it better than
nothing?

## Per call, with the hint inside the comparison

A summary carries fixed costs - a header, a count, a pointer to the full
output - and on a short result they exceed the result. So the comparison runs
on **the composed output**: body, recovery hint and every notice the transform
adds, against the untransformed output, with the same estimator on both sides.
When the untransformed output wins, emit it, and drop the hint as well:
nothing was elided, so there is nothing to recover.

Two details make this a comparison rather than a tolerance. A fixed allowance
above the original sounds more forgiving and is not satisfiable: one source
tree tried it and found the shortest useful form of a message cost more than a
one-line original, so the allowance sat below the message's own floor and
dropped it on most short pairs. Its exceptions are therefore bounded by
**case**, not by count - a specific output the original cannot represent at
all - and each is written down beside the guard. And when the original was
empty, the transform emits nothing; a synthesized "no results" line is a claim
the tool did not make, and the source tree's issue history files one such line
as actively harmful.

## A failed or unrecognised run passes through

A transform's model of the output is a model of the **success** shape. Its
parser knows the summary line, the diagnostic format, the table it reduces;
its "clean" is what that parser emits when nothing matched. So every way a
run can fail without producing the success shape - the tool is not
installed, the suite errored during collection, the process was killed
before its summary - reads as clean. Measured in that source tree: a type
checker that was not installed was reported as "no issues found", and its
commit message names the cost - the launcher's loud spawn error had been
replaced by a message asserting the opposite. The same shape turned up in a
fleet tree with no relation to it, a measurement parser that records a number
from a command's output: with the program missing, a counting pipeline exited
zero and printed `0`, and the parser recorded zero findings. One transform
compresses for a model and the other measures for a dashboard; both read the
shell's failure as the tool's verdict
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

The rules that close it:

- **A clean or summary verdict needs two witnesses.** The exit status and a
  recognised summary agree, or the verdict is not issued. A non-zero run whose
  output the parser did not recognise yields the untransformed output.
- **The stream the transform did not parse is the report when the run
  failed.** A parser of standard output forwards the error stream **whole**
  when the run failed or the parsed stream came back empty - a configuration
  error leaves standard output empty, and dropping the other stream leaves
  nothing at all. On a successful run it may cap the error stream, from the
  **end**: tools fetch and resolve before they build, so their chatter comes
  first and their warnings last, and a cap on the head keeps the noise.
- **A program that never started is not a run.** The shell's own "not found"
  message is output too, and parses as a line, a count, or a number. Read it
  for what it is before any parser sees it; the exit code alone is not enough
  where the shell reports a missing program with the same code a tool uses for
  "errors found".

## The crash path is a failed run too

If the transform panics or throws, the floor is still the untransformed
output - and the place to check is the path production takes, not the path
the tests take. The same source tree's documentation stated that a failing
filter falls back to the original; its main path had no catch around the
filter, and the only catch in the capture layer sat in a mode nothing but a
test constructed. A filter crash on the main path would have exited with the
runtime's crash code and printed neither captured stream, so the command the
agent ran would appear to have produced nothing and failed for no reason. Put
the catch around the transform where production calls it, prove it with a
deliberately crashing transform, and keep the build setting the catch depends
on - a build that aborts on panic turns the catch into dead code in exactly
the shipped binary.

## The arm must be the one the consumer would have received

A transform that parses structured output is tempted to ask for it: add the
tool's machine-readable flag, parse that, emit a summary. It has moved its own
floor. Every comparison above now runs against an output nobody would have
seen, and structured output is routinely an order of magnitude larger than
the human form. Measured on the source tree, on one small failing test suite:
the plain runner printed 73 bytes, the structured form it injected was 3,024,
and the transform emitted 224. The guard was silent - 224 is far below 3,024 -
and the run was booked as a 95% saving, while the model read three times what
it would have read with the transform absent
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

When the invocation changes, the untransformed arm is the output of the
invocation **as the consumer issued it**. Either produce that arm for the
comparison (run the plain form where it is cheap, or keep a measured ratio
for the tool) or make the parser that knows both shapes estimate the plain
one. The accounting half of this error - a saving computed against the wrong
arm - is
[the-baseline-is-the-untouched-path](../../../../engineering-assessment/measurement-method/measurement-honesty/techniques/the-baseline-is-the-untouched-path.md)'s
subject; the guard half is this one's.

## Where this meets the escape hatch's fallback cap

[escape-hatch-usage-as-the-safety-metric](./escape-hatch-usage-as-the-safety-metric.md)
says a transform's involuntary fallback must be capped below the trigger,
because a bounding stage that returns its whole input on failure emits its
largest payload exactly where it was most needed. That rule and this one
disagree on what a failed transform returns, and both are right; one question
decides which applies.

> **Is this transform the only bound on its input, or did the untransformed
> arm already pass a bound downstream?**

A **bounding stage** - a summarizer installed because the input would not fit,
with nothing after it to cap the result - must still bound when it fails, and
the escape hatch's cap is the rule. A **transparent stage** - a filter in
front of a host that already caps every tool result, whose untransformed arm is
what the model received before the filter existed - must not fail lossier than
its own absence; capping its fallback below the trigger would hide output the
model used to see. Its floor is the untransformed arm, under the host's cap.

## Decision rules

- Compare the composed output - body, hint and notices - against the
  untransformed output on every call, with one estimator; emit the
  untransformed output when it is not larger, without the hint.
- Bound exceptions by case, write each beside the guard, and never emit a
  synthesized "nothing" for an empty original.
- Issue a clean or summary verdict only when the exit status and a recognised
  summary agree; otherwise pass the run through.
- Forward the unparsed stream whole on a failed run or an empty parse; cap it
  from the end otherwise.
- Read the shell's "not found" before any parser does.
- Catch the transform's crash on the production path and fall back to the
  untransformed output; keep the build setting the catch needs.
- When the transform changes the invocation, compare against the invocation
  the consumer issued.
- Cap a failed transform below the trigger only when it is the only bound on
  its input.

## When not to use it

A transform whose output is not read in place of the original - an index
built beside it, a digest stored for later - has no floor to fall below; it
competes on its own measure. And a transform the consumer asked for by name,
knowing it is lossy - a requested summary, an explicit "short" mode - is the
consumer's choice of arm; the floor protects a consumer who did not choose.
