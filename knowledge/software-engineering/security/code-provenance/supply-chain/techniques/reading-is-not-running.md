---
layer: technique
type: technique
subject: supply-chain
technique: reading-is-not-running
status: forged
laws: [gate-sees-target, absent-guard-is-loud, failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [a tool opens, scans, previews or analyses a tree it did not write, a reader learns what a configuration declares by evaluating it, rules or detectors are picked up from inside the tree being analysed, an import step runs a script shipped inside the content package, a surface described as read-only spawns a tool in someone else's checkout]
---

# Reading is not running

Some content is code by design, and a reader that meets it has two verbs
available: look at it, or run it. The failures in this technique all have one
shape. The person asked for the first verb and silently got the second.

Three sightings, from three unrelated kinds of tool:

- **A configuration that is a program.** An analyzer needs to know what a
  project's build or test configuration declares. The configuration is a source
  file, so the easy way to read it is to evaluate it and inspect the object it
  exports. Evaluation runs every top-level statement and every module the file
  imports.
- **Rules that travel with the tree.** A tool lets personal and per-project
  rule files extend its built-in ones, and the rule language executes. A cloned
  repository can ship a rules directory, and opening the tool's view on that
  repository runs it.
- **An import that runs a bridge script.** When the target application cannot
  read a representation natively, the vendor ships a script inside the content
  package that does the conversion. Importing the package becomes code
  execution inside the importing person's session, usually after a line in the
  documentation saying the script is safe to run.

This is not [unsafe-deserialization-off-by-default](./unsafe-deserialization-off-by-default.md).
That technique owns formats that encode object construction, where a restricted
loader exists and the storage can migrate to a data-only shape. Here the
content *is* a program. There is no restricted loader for a program and no
data-only migration, so the decision is whether to execute at all, and under
whose approval of which bytes. It is not
[extension-trust-boundary](../../../extension-trust/extension-trust-boundary/extension-trust-boundary.md)
either, where an operator deliberately named a package to run. And it is the
door [split-trust-by-registration-path](../../../../llm-agent/runtime-and-io/sidecar-provisioning/techniques/split-trust-by-registration-path.md)
does not have: after the configuration file and the API there is a third way
in, a file inside the thing being analysed, and its author has no standing at
all.

## The rule

**A read verb stays a read. Extract what the content declares without
evaluating it. Where evaluation cannot be avoided, execute only a byte state
somebody approved, where the byte state covers everything that will run, and
refuse loudly on any change.**

### 1. Read statically first

Parse the file and read the declaration off its syntax tree. That is the safe
choice, and usually the more correct one too. Evaluating a configuration to
read it inherits the configuration's whole environment: every import must
resolve, every environment variable it consults must be set, every side
effect it performs happens. A configuration that works where it is meant to
run then crashes the reader, and the reader loses the inputs it came for. The
static reader covers the literal shapes most files use. For shapes it cannot
see (a computed value, a spread from a function call), it reports *unknown
for this file*, never an empty declaration
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

A tool that has moved some of its readers to static parsing and left the rest
evaluating has not finished the move. Count the evaluating readers. The
remainder is the tool's execution surface, and it is usually most of it.

### 2. Where execution is unavoidable, approve a byte state

Some content has to run to be useful: detector rules, a conversion script, a
configuration whose meaning really is computed. For that content:

- **Trust on first use, by digest.** The first time a file would execute, show
  it and record its digest when it is approved. Approval belongs to those
  bytes, not to the path, the repository or the author.
- **Any change revokes.** A changed digest, a new file in an executing
  position, or a removed one is unapproved. The run does not proceed on the
  old approval.
- **Blocked content queues for review and the refusal is loud.** Show the
  list of files that changed, as a refusal the caller can tell apart from a
  scan that found nothing
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  This matters because the scan's output does not show that code ran: the same
  findings come back whether a planted statement executed or not.
- **Default off.** The approving step engages on its own. A guard the user has
  to switch on protects nobody who didn't
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

### 3. The digest covers what will execute, not the file that was named

The approval must see what it approves
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A configuration
that imports a local module executes that module. If the digest covers only
the configuration file, an edit to the imported module runs under an approval
given to different code. Hash the file together with its local import closure,
meaning every relative import followed transitively. Package imports resolve
to the dependency tree and belong to the dependency gates.

Closure hashing is conservative. It will refuse edits to modules the reader
would in fact have parsed rather than run. That is the correct error direction
for an approval, and the cost shrinks as step 1 converts more readers to
static parsing.

### 4. Content that executes gets budgets as well as approval

Rule languages usually accept user patterns. An approved rule can still hang
the reader with a catastrophically backtracking expression. Reject patterns a
nested-quantifier heuristic flags, and cap the input length each pattern sees.
Approval answers whether the code may run. The budget answers how much damage
approved code can do by accident.

### 5. An import that runs a script says so at the import

When a content package ships a bridge script, the import step names the
execution before it happens, shows the script, and defaults to not running it.
A vendor's statement that the script is safe is a claim about the past and
about somebody else's copy. It is not a review of the bytes on this machine.

## Measured

Replayed on a desktop application's own repository, through the application's
static-analysis lane. The lane describes itself as read-only: it spawns an
unused-code analyzer in the project root and turns the output into findings.
Three edits each planted a statement that writes a marker file:

- one in a test-runner configuration the analyzer evaluates;
- one in a local module that the build configuration imports, with the
  configuration's own bytes unchanged;
- one in a local lint-rule module required by a lint configuration that the
  analyzer reads statically.

A positive control first confirmed that each planted statement fires when its
file is loaded directly.

| arm | markers fired | loud refusals | findings on the approved tree |
| --- | --- | --- | --- |
| as-is | 2 of 3 | 0 | 1,042 rows (baseline) |
| digest of configuration files only | 1 of 3 (the imported module) | 1 | set-identical |
| digest of files plus local import closure | 0 of 3 | 3 (1 unneeded) | set-identical, 0 false refusals over 2 re-runs |

In the as-is arm the findings were set-identical with and without an executed
marker, so the scan gave no signal that code had run. The as-is arm also
logged one configuration that failed to load, because evaluation could not
resolve a module that configuration imports. The analyzer lost that
configuration's inputs, and a static read would not have crashed. The
unneeded refusal was the lint-rule edit, which the analyzer never executed.
That is step 3's conservative direction, measured.

## Decision rules

- **A surface that opens, scans or previews someone else's tree is read-only
  only if nothing it spawns evaluates that tree's files.** Check what the
  spawned tool evaluates before writing "read-only" in its description.
- **Parse before you evaluate.** Report dynamic shapes as unknown per file.
- **Executing content runs only at an approved digest.** Any change revokes the
  approval, and the refusal lists the changed files.
- **The digest covers the local import closure.** Hashing only the entry file
  is a gate that looks at a proxy.
- **Executable rule content also gets a backtracking check and an input cap.**
- **An import that will run shipped code names the execution, shows the code,
  and defaults to no.**

## When not to use this

Two cases are outside this technique. The first is a tool whose job *is*
execution, such as a test runner, a build or a verification command, when the
operator armed it knowingly for this tree. That is an execution-trust question,
and [ci-execution-trust](../../../../engineering-process/continuous-integration/ci-execution-trust/ci-execution-trust.md)
owns what such a run may reach. The second is content written in this session
by this process, where nobody else could have written to it. The boundary is
the author, not the file type: once another person's checkout, download or
package supplies the bytes, the rule applies.
