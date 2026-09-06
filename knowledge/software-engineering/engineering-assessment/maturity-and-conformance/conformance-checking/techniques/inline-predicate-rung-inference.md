---
layer: technique
type: technique
subject: conformance-checking
technique: inline-predicate-rung-inference
status: forged
laws: [count-carries-predicate, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [a specification format lets each claim carry its own verification command, reporting what fraction of a spec is machine-checked, a spec sheet's coverage number is quoted as a proof number, deciding whether a claim's predicate proves the claim or only its text, auditing a self-verifying spec whose checks are almost all green]
---

# Rung inference for an inline-predicate spec

[declared-then-proven](./declared-then-proven.md) assumes two artifacts: a
declaration the project writes, and a checker somebody else wrote that turns
declarations into verdicts. The rung — presence, shape, execution — is assigned
by the checker's author, once per check, deliberately.

A newer format collapses the two. Each claim in the specification carries its
**own** verification command inline, and the runner does nothing but execute
them and tally exit codes. There is no checker to drift into a transcriber,
which is the failure `declared-then-proven` exists to prevent — and that is a
real gain, because the proof travels with the claim and cannot be forgotten
when the claim is edited.

It moves the defect rather than removing it. The rung is now chosen by whoever
wrote the claim, in the same keystroke as the claim, under deadline, with no
field to record the choice in and no reader who will ever see it.

## The coverage number is not the proof number

The format's headline statistic is the fraction of claims that carry a command
at all, and it goes very high very fast, because writing *some* command is
cheap and the process makes it mandatory. That number is worth having: it
separates claims somebody thought about verifying from claims nobody did.

It is not a statement about proof, and it will be read as one. In one mature
sheet of **593 claims, 543 (91.6%) carried a command** — and classifying those
commands by the binary each actually *invokes* put **62.8% at the text-match
rung** (a `grep` for a literal in a source file), **16.0% at parse-and-assert**
(load the document, assert a field), and **20.8% at execution** (start the
subject and observe it). Fifty-eight percent of the whole specification was
proven by the presence of a string in a file. Every one of those rendered
identically to the executed fifth, because the format has one `command:` field
and one success symbol.

This is [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
at the level of the spec sheet: *91.6% verified* is a number whose predicate is
"has a command", not "is proven", and the two are five times apart.

**The cheap rung dominates precisely because the format succeeded.** When
writing a predicate is mandatory and costs one line, the predicate that costs
one line is what gets written. A format that made verification expensive would
have fewer, better checks and a coverage number nobody would mistake for proof.

## Infer the rung; never ask the author for it

Adding a `rung:` field to the format fails for the same reason the inline
predicate succeeded: it is a second thing to maintain, it is self-declared, and
`declared-then-proven`'s own rule forbids accepting a self-declared
verification flag as evidence. The author who wrote a `grep` under deadline is
not the person who will honestly label it as presence-rung.

Infer it from the command instead. The classification is mechanical and
cheap — parse the command into shell segments, take the **invoked binary at
the head of each segment**, and rank the command at the highest rung any
segment reaches:

| Head binary | Rung | What a pass claims |
| --- | --- | --- |
| `grep`, `test`, `ls`, `find`, `stat`, `diff` | presence/text | this string is in this file |
| an interpreter loading the artifact and asserting a field | shape | the document parses and this field holds |
| the subject's own entry point, a client against it, a test runner | execution | it worked, in this environment, now |

Two rules keep the inference honest, and both were learned by getting them
wrong:

- **Match the binary at invocation position, not anywhere in the string.** A
  first pass that searched the whole command for the subject's name scored a
  text match on a file whose *name* contained the subject as execution, and
  reported the execution share as **40%**; matching at the head of each
  segment gave **7.2%** before wrapper resolution and **20.8%** after. The
  instrument's bias inflated exactly the number the finding turned on, by
  5.5x, in the direction that flattered the spec.
- **Resolve wrappers before classifying.** `cd <dir> && <real command>`,
  `env X=1 <real command>`, and a project's own `check-*.sh` helper are not
  their own rungs; unresolved, they land in an `other` bucket that silently
  absorbed 11% of the corpus in the same first pass.

Assert the classifier against one known command per rung before quoting any
share from it. This is the ordinary discipline for a counting instrument, and
a rung classifier is unusually prone to the analyst's own bias — see
[checker-false-positive-discipline](./checker-false-positive-discipline.md) —
because whoever writes it already believes the spec is well proven.

## Render the rung wherever the tally is rendered

Undifferentiated green is the defect `declared-then-proven` names, and an
inline-predicate runner produces it by default: every pass is one `ok`. The
fix is not to fail the cheap rungs — a text match is the correct check for a
pinned version literal, and demanding execution everywhere would make the
sheet unrunnable.

The fix is that **the tally is per rung or it is not a tally**. Report
`ok(exec) / ok(shape) / ok(text)` rather than one percentage, and quote the
execution share whenever somebody asks how well specified the system is. A
reader deciding whether to trust the spec is asking a question the single
number cannot answer, and the per-rung split answers it in three integers.

The manual remainder belongs in the same report. Claims that carry no command
are usually rendered as a separate marker and a count — *N manual* — and a
count of manual claims is not a discharge of them: each one is a claim
somebody must read the code to settle, and reporting the count instead of the
verdicts is
[empty success spelled as success](../../../../_laws.md#failure-not-empty-success).

## The rung is also a maintenance signal

A text-rung predicate is coupled to the *spelling* of the thing it checks, not
to its behaviour. It goes red when a variable is renamed and stays green when
the behaviour it describes breaks — the exact inverse of what the claim
promises. So the per-rung split doubles as a fragility map: a section of the
sheet that is entirely text-rung will produce false failures on every
refactor and false passes on every real regression, and it is the section to
promote first when a rung-raising budget exists.

Promote against the claim's own verb. A claim that says a file *contains* a
pin is honestly a text check and should stay one. A claim that says a service
*starts*, *falls back*, or *does not crash-loop* is an execution claim wearing
a `grep`, and it is worth exactly one rung-raise.

## When not to use this

Where the spec sheet is small enough to read end to end, the split is
arithmetic on a number the reader can already see, and it adds ceremony. And
where the runner already distinguishes rungs in its own output — a harness
with separate `check` and `verify` phases, say — the rung is recorded and this
technique is describing work already done.
