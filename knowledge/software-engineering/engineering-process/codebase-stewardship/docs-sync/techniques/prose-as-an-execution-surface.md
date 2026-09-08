---
layer: technique
type: technique
subject: docs-sync
technique: prose-as-an-execution-surface
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [a document contains a command a reader will paste, deciding whether a prose gate is a style check or a safety check, an install line names a package the project does not own, the program prints setup instructions of its own, guidance shows a credential as a positional argument]
---

# Prose is an execution surface

Every wall in this subject treats a document as a **claim** — something that
can be true or false, and that drifts when the system moves under it. A
document also contains **instructions**, and an instruction is not evaluated
for truth. It is executed. The reader selects it, pastes it into a shell, and
runs it on their own machine.

That single difference moves the artifact into a different severity class. A
stale sentence misleads a reader who can recover by reading further. A stale or
careless command *runs*, once, with the reader's credentials and the reader's
privileges, and there is no further paragraph that undoes it. The gate stops
protecting the reader's understanding and starts protecting their machine.

## Two populations, both cheap to check

**The command that spends a secret in the process table.** Guidance that shows
a credential as a positional argument teaches every reader who follows it to
put that value where the machine's other users, its process accounting, and the
reader's own shell history can all read it. The safe form — a hidden prompt, or
the same value delivered on standard input — differs from the unsafe one by a
quotation mark in the document and completely on the machine. The check is a
forbidden-prefix sweep: each credential-taking subcommand followed by a quote.
It is worth noticing *why* this must be gated in the prose rather than only in
the tool. The tool can refuse a positional secret, and should; but a reader who
pasted the documented form has already typed it, and refusal happens after the
shell has recorded the line.

**The install line that names a package the project does not own.** A public
index name and a source repository are different namespaces with different
owners, and a project whose index name is held by a stranger has a
documentation-shaped supply-chain vector. The obvious install line — the one
written from muscle memory, in any of five translated landing pages, by a
contributor who never checked — installs somebody else's code on a reader's
machine, and every property of the surrounding document says it is safe. One
worked example writes every install instruction as an explicit archive URL and
gates the bare form: it may appear only on a line that also carries the
project's own repository. This is not a naming inconvenience. It is the only
place in the system where an attacker's artifact is delivered by the project's
own words.

## The gate's population is text a reader will act on

The scoping mistake is the interesting part, and it is
[gate-sees-target](../../../../_laws.md#gate-sees-target) with an unusually
tempting proxy: the target is *text a human will act on*, and the proxy that
gets checked is *files with a documentation extension*.

The same worked example runs its check over the prose corpus **plus one source
file** — the integration entry point that, when an optional dependency is
missing, prints its own install instruction to standard error. That line is
documentation by every property that matters here: a reader will paste it, it
was written once and never re-read, and it is the only instruction that ever
reaches a user who did not open a page at all. A gate scoped to prose files
misses it by construction, and misses it in the branch that fires exactly when
the reader is least equipped to notice.

So enumerate the population as what it is, not as a directory: help output,
error hints, the first-run banner, the generated snippet in a quickstart, the
code block in a landing page, the setup line an agent-facing instruction file
hands to a machine that will run it without reading the paragraph around it.
The last one deserves its own beat — an instruction file consumed by an
automated reader has no recovering human in the loop at all, so every
mitigation that depends on the reader noticing is gone.

## What this gate is not

It does not check that the command **works**. Executing documented commands is
a real and considerably more expensive discipline, and it answers a different
question. This gate is about the commands that work exactly as written and
should never have been written — which is why it stays cheap enough to run on
every change, and why its findings are security findings rather than accuracy
findings.

It also does not replace the tool-side check. Both belong, for the reason above:
the tool's refusal protects the reader who improvised, and the prose gate
protects the much larger population who did what the page said.

## When not to use this

- **The document contains no executable text.** An architecture overview with
  no commands has no execution surface, and adding the sweep buys a passing
  check over an empty population — the shape
  [checked-vs-skipped-denominators](./checked-vs-skipped-denominators.md) warns
  about, arriving here as a green signal that means nothing.
- **The unsafe form is genuinely required somewhere.** Then the exception is
  named in the check with its reason, not carved out by narrowing the pattern
  until the file passes.
- **The project owns every namespace it names.** The supply-chain half of this
  technique is conditional on a name being held by someone else. Confirm that
  before writing the assertion, and re-confirm it when a project renames — the
  vector is created by the rename, not by the document.
