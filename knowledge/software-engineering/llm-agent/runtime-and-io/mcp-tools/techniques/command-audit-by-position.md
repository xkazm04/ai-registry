---
layer: technique
type: technique
subject: mcp-tools
technique: command-audit-by-position
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, one-validation-door]
shared_with: []
applied: code
ab_verdict: better
use_when: [auditing a command string the host itself will execute, an allow-list deciding whether a configured server process may be spawned, a character denylist standing in for a parse, deciding whether a URL in a command argument is code or data]
---

# Command audit by position

[fluent-syntax-bounded-grammar](./fluent-syntax-bounded-grammar.md) handles the
case where the host owns the notation: it invents the surface, so it can admit
a closed fragment and refuse everything else by construction. There is a second
case, and it is the one that actually guards the process boundary. **The host
does not own the command — a person configured it, it names a real program with
real arguments, and the host must run it.** A closed grammar is unavailable
here, because the set of legitimate launch commands is whatever the ecosystem
publishes next week.

What goes in its place, nearly always, is a character denylist: a set of shell
metacharacters refused anywhere in the string. It is one line, it reads as
strict, and it is a **proxy for a parse**
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The thing that
decides whether a command executes something is not which characters it
contains but **where each token sits**, and a scan over the text cannot see
position at all. So the denylist is wrong in both directions at once, which is
why measuring it in only one direction always flatters it.

## Four positions, and what each one means

- **Command position** — the first token. It names the program, and it decides
  how every later token is read. Everything below is keyed on it.
- **Code-string position** — the operand of a flag the program will *evaluate*.
  An interpreter's code-string flag is an execution context regardless of what
  its operand looks like: a one-token operand with no metacharacter in it is
  still code, and on a general-purpose package runner such a flag hands the
  operand to a shell, so a single bare word runs an arbitrary program through a
  runner the allow-list approved.
- **Code-source position** — the operand of a flag that names *where code comes
  from*: a package spec, a preload module, a container entry point. The operand
  is not code, so it is judged by what it resolves to, and a remote reference
  there is fetch-and-run.
- **Value position** — the operand of a flag the program *reads*: a registry to
  query, a cache to write, a proxy to dial. A remote-looking value here is
  data, and this is the one place a remote reference must **not** be refused.
- **Data position** — the operands after the entry point. They belong to the
  launched program: a URL there is the endpoint it talks to, and refusing it
  refuses the ordinary case.

The distinction a denylist cannot draw is between the last two and the middle
two, and the same bytes appear in both. A remote reference joined to a
value-position flag is configuration; the identical string joined to a
code-source flag is remote code execution. The gate that scanned for a prefix
across every token had it exactly backwards: the one it was built to refuse did
not *start with* the prefix, because the flag name came first.

## The sets are per program, not per spelling

A flag is not a flag. The same two characters are a code string on one
interpreter and a **syntax check** on another — parse, report, do not run. A
set that is not keyed on the program in command position either misses the
execution contexts or refuses a perfectly ordinary validation command, and a
team that hits the second turns the gate off. Resolve every set against the
program: code-string flags, code-source flags, value-only flags, and the
verbs below.

## The verb table is part of the model

Some runners take the thing to run directly; others put a subcommand first and
the entry point second. **Which one a program is belongs in the position
model.** Leave a verb out and the audit shifts one position to the left: it
reads the verb as the entry point, and then reads the real entry point as a
*server argument* — a data position, where a remote reference is deliberately
allowed. A remote code reference then walks through a gate that is looking
straight at it.

This is not hypothetical; it is how the positional gate failed on its first
measured run, with the verb missing for exactly one runner. An incomplete
position model fails the same way a denylist does, and the audit owes this
table the completeness argument the denylist owed its character set. An
unmodelled program is not a safe program
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): give
the resolver a program with no tables and it has no opinion, so say what
happens then — treat its first bare operand as the entry point, which is the
conservative reading, and write the limit down.

## Measure it with two assertions that oppose each other

A classifier rule is passed by changing nothing in one direction and by
refusing everything in the other, so a single assertion certifies nothing.
Assert both on the same corpus:

- **the constructs that must now be refused** — every position that executes;
- **the commands that must still be admitted**, and take that set from *live
  usage*: the launch commands actually configured in the systems this gate
  guards, not commands someone wrote to be allowed.

Hold the second at or above its previous value while the first rises. A gate
nothing can fail is not a gate; a gate that admits nothing real is not one
either. In the run behind this technique the denylist refused half the
execution constructs and rejected two real commands; the positional audit
refused all of them and rejected fewer — and the second number is the one that
proves the first was not bought by over-refusing.

## What position cannot decide

Position is a property of **a parse**, and the audit's parse is authoritative
only if the executor performs the same one. A transport that hands the token
vector to another interpreter re-reads it, and every construct the positional
pass classified away comes back: an environment reference expands out of the
child's environment — which is where the host put its decrypted credentials —
and a quote character re-splits the line so a chained command survives argv
quoting. **Under a re-parsing transport, a data position is not data.**

So the character rule is not replaced by the positional one; it is demoted to
what it actually is — a fact about the executor, not about the text — and kept
for exactly those transports. Taking the positional rule literally and deleting
the character set was measured here and lost: it admitted more real commands
and re-opened every transport-created hole, including two that had already been
demonstrated by an executed experiment. A validator cannot know which transport
a later call site will choose, so it assumes the re-parsing one and says so
where the assumption is written
([one-validation-door](../../../../_laws.md#one-validation-door)).

## What this cannot do

The audit bounds *how* a command executes, never *what* the executing program
then does. A correctly classified entry point naming a published package that
is malicious is statically indistinguishable from the same entry point naming a
benign one, and no amount of position-classification closes that; only a
per-command consent gate does. State that residual next to the tables, because
a gate whose limits are unstated is read as total by everyone downstream, and
the next person to add a runner needs to know which half they are extending.
