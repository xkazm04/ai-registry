---
layer: technique
type: technique
subject: pipeline-authoring
technique: foreign-config-replay
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success, identity-survives-reuse, absent-guard-is-loud]
shared_with: []
use_when: [a plan generator reads a config file that another tool interprets, deciding which checks to fan out from a linter or test-runner configuration, a check ran locally and was never scheduled in the pipeline, planning around a tool that has no "what would you do" mode, mirroring another tool's defaults into your own selection code]
---

# Foreign-config replay

[runtime-pipeline-generation](./runtime-pipeline-generation.md) says the
generator reads its inputs explicitly. One class of input is not a value the
generator reads — it is a **program somebody else's tool executes**. A hook
runner's configuration, a test framework's collection rules, a formatter's
include patterns: each is a file whose meaning is a decision function living
inside a tool the generator does not run. A generator that fans out one unit
per configured check has to answer "which checks have work in this change",
and the tool that owns the answer usually offers no way to ask it.

So the generator computes the answer itself, and the moment it does, the
repository holds **two implementations of one selection semantics** — the
tool's, which runs on the real files, and the generator's, which decides
whether the tool runs at all. They drift the way any second copy drifts
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and the drift is invisible in the direction that matters: when the generator's
model is narrower than the tool's, a check that would have found something is
never scheduled, and the pipeline reports green having skipped it.

## Replay the matcher; do not author a second one

There are two ways to build the selector, and only one of them has a
maintainable error.

**The approximation** re-answers the question in the generator's own terms —
directory prefixes, an extension list, a hand-written map from paths to
checks. It is easy to write and it is a fresh opinion about the repository,
unrelated to the file the tool actually reads. Every future edit to the tool's
configuration is a silent divergence, because nothing connects the two.

**The replay** parses the tool's own configuration and reproduces the tool's
own matching rules over the changed set. The generator's answer is then a
*function of the same file the tool obeys*: adding a check to the config
schedules it, narrowing a check's scope narrows the schedule, and no second
place has to be edited. This is the only construction under which the config
file keeps its authority.

Replay imposes a duty the approximation does not: the generator must state, in
its own source, **which parts of the tool's semantics it models**. Path
inclusion and exclusion are usually enough, because most selection is
path-shaped. Content-type filters, staged-file semantics and per-check
overrides usually are not modeled, and each unmodeled feature is a class of
change the generator will get wrong.

## Fail closed on config, open at runtime

A declared subset is a comment until something enforces it. The enforcement is
mechanical and belongs in the generator: **when the configuration uses a
feature the generator does not model, refuse to emit a plan**, naming the
offending entry and the two remedies — constrain the entry so path matching is
sufficient, or extend the model.

This is the one place in a selector where failing closed beats failing open.
[change-scoped-work-selection](./change-scoped-work-selection.md) is right that
a selector which *crashes* must select everything rather than nothing; that
rule governs the runtime failure, where the change under test is real and the
safe move is to run more. Configuration is a different moment. The unmodeled
entry was added deliberately, by someone who can fix it, before any change
depends on it — and a selector that silently over-matches or under-matches it
will keep doing so for months. Refusing at config-load turns a permanent silent
gap into one loud failure at the moment of authorship, which is
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) applied to the
generator's own coverage.

The three moments exit differently, and collapsing any two of them is the
defect this section exists to prevent:

| moment | what happened | correct behaviour |
|---|---|---|
| config load | the config uses a feature the model does not cover | refuse to emit a plan; name the entry and the remedy |
| selection runtime | the matcher threw on a real change | select everything; say why |
| selection result | nothing matched | emit an empty plan *and* its reason, never a silent zero |

The third row is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
"this change implicates no check" and "the selector produced nothing" are
different results and must arrive as different values.

## A generated unit's identity is not the tool's identifier

A tool's own identifiers are frequently not unique inside one configuration —
the same check appears once per scope, the same formatter once per module. A
generator that names its units after those identifiers produces colliding
units, and an invocation that passes only the identifier back to the tool runs
the wrong scope, or every scope, or reports "nothing to do" from a sibling
entry that happens to share the name. The last is the worst, because it renders
as a pass.

The unit's identity is minted from **what the unit is**
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)),
which here is the tuple that isolates exactly one configured entry: the
identifier *plus the matched file set the generator computed for it*. Passing
that set back into the invocation is not an optimization — it is what makes the
invocation address one entry. Carry it on the emitted unit and have the runner
pass it through verbatim.

## Mirrored defaults are a dated liability, not a solved problem

Some of the tool's behaviour is not in the configuration at all. A check's
content-type filter, its default scope, its bundled exclusions frequently live
in the tool's own distribution and are invisible to anything parsing the local
file. A replay that needs them ends up carrying a hand-maintained table of
another project's defaults.

That table is legitimate and it is debt. It is a copy of a value whose author
does not know it was copied, so it can only be correct as of a date. Treat it
the way any dated fact is treated: keep it in one place, name in a comment what
it mirrors and why the local file cannot supply it, and prefer any construction
that makes it unnecessary. A configuration entry that states its own scope
explicitly removes a row from the table permanently, and is worth requiring for
that reason alone.

## What the replay buys, stated so it can be checked

- A check added to the configuration is scheduled without editing the pipeline.
- A check narrowed in the configuration is narrowed in the pipeline.
- A change touching nothing a check covers spawns no unit for it, and the
  skipped set is still reported
  ([change-scoped-work-selection](./change-scoped-work-selection.md)).
- A configuration entry the selector cannot model fails authorship, not a
  release.

Each of those is a sentence someone can test against the tree, which is the
point of stating them: a replay whose config edits do not change the schedule
has already become an approximation with a parser in front of it.

## When NOT to replay

- **The tool can answer the question.** If it has a dry-run or list mode, call
  it. A replay of a tool that will tell you directly is a second implementation
  with no excuse, and the first upgrade of that tool is when you find out.
- **The selection is not path-shaped.** When the real predicate is a dependency
  closure, replaying a path matcher gives a confidently wrong answer;
  change-scoped-work-selection owns that case, and the closure is the input.
- **One check, always run.** Selection machinery for a plan with no shape is
  [runtime-pipeline-generation](./runtime-pipeline-generation.md)'s "write the
  file" case.

## Decision rules

- Parse the tool's own configuration; never author a second opinion about it.
- Declare in the generator which semantics are modeled, and enforce the
  declaration by refusing unmodeled configuration at load time.
- Fail closed on config, open at runtime, and report an empty result with its
  reason rather than as a silent zero.
- Address a generated unit by the tuple that isolates one configured entry,
  never by the tool's identifier alone.
- Keep mirrored upstream defaults in one dated table, and prefer configuration
  that makes a row unnecessary.
