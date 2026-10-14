---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: rewriting-under-a-foreign-gate
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, absent-guard-is-loud]
shared_with: []
use_when: [a hook or plugin rewrites an agent's commands inside a host whose permission rules it does not own, a deny rule written against a command stopped matching after a wrapper was added, deciding whether a rewriting hook may also approve the command it rewrote, a rewritten command carries an inner command the policy never saw]
---

# Rewriting under a foreign gate

[rewrite-before-the-gate](./rewrite-before-the-gate.md) places a rewriting
point before every gate a runtime owns, so that the gate judges the value that
will run. That placement assumes something it does not state: the gate's
rules are the runtime's own, and judging an unfamiliar value is the gate doing
its job. A second topology breaks the assumption. The rewriter is a
contribution to a host it does not own - a hook in an agent harness that
wraps the agent's shell commands - and the gate is the host's, with rules a
person wrote **against what the model writes**: prefix patterns over the
original command.

Placement cannot help there. The host does judge the rewritten value, and the
rewrite changed the leading word every rule keys on. A deny written for
`push to the shared remote` no longer matches the same command behind a
wrapper; the gate ran, found no rule, and its silence is about a string the
person never wrote a rule for
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Letting the gate
see the effective value is necessary and, here, not sufficient. The
discriminator is one question: **who owns the gate's rules, and what were they
written against?** Where the runtime owns them, the sibling technique is the
whole answer. Where a person wrote them against the original, the rewriter
has to judge the original itself, before it changes anything.

## Judge the original against a copy of the policy

A rewriter that cannot move the gate reads the host's rules and evaluates the
**original** command against them first, in the host's own precedence:

- **Deny wins outright, and suppresses the rewrite.** The command reaches the
  host unchanged, so the host's own deny fires on the words it was written
  for.
- **No matching rule is not permission.** The rewrite may proceed, but it must
  not carry an approval; the host's own prompt decides. A source tree that
  once mapped "no rule matched" to an approved rewrite auto-approved every
  rewritable command on any machine with no rules configured, and its fix
  stated the invariant: the no-match verdict must never reach an approval
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **Only an explicit allow licenses an approved rewrite,** and a compound
  command is approved only when every piece matches one.

## Rewrite only what the policy can take apart

The copy of the policy is only as good as the splitter that cuts a command
into the pieces the rules are checked against. A command substitution, a
process substitution, a redirect to a file, a heredoc, a script handed to a
nested shell - each hides a second command the splitter cannot see, and a
rewrite of the outer command would carry the inner one under an approval
computed without it. So a command the policy splitter cannot decompose is
**not rewritten at all**. Forcing a prompt instead is weaker: the person
approves a string whose dangerous part is not where they will look.

The splitter that makes this decision should be the most suspicious one in
the system. The source tree keeps three on purpose - one for analytics, one
for the rewrite, one for permissions - and documents in a table why the
permission splitter refuses constructs the others accept. Reusing the
rewrite's splitter for permissions would make the policy exactly as precise as
the feature that benefits from being lenient.

## A copy of a policy is only as strict as what it read

The rewriter's verdict is computed over the rule sources it managed to read.
The same tree reads four settings files and **skips missing and malformed ones
silently**, does not read the managed tier at all, and reads nothing for hosts
whose rule format it does not know. Each skipped source is a deny that, after
the rewrite re-keys the command, becomes a prompt or less - the optional guard
that protects the design and not the deployment
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

Fail closed on what was not read: a rule source the host enforces that the
rewriter could not parse means no rewrite, or at least no approval, and says
so where the operator will see it. A host whose rules the rewriter cannot read
at all gets rewrites without approvals, never approvals by default.

The host's own classifiers are a second reader the rewrite blinds. The source
concedes it in its own code: one host checks the rewritten command with
safe-and-dangerous classifiers that do not look through the wrapper, which
adds prompts for safe commands and hides the signal for mutating ones. A
wrapper either registers itself where the host's classifier can see through
it, or stays off the commands whose classification matters.

## A failed rewrite is still a change of behaviour

When the rewriter itself fails, the command runs unrewritten - the right
fail-open direction, and still a fact the operator needs. The sibling
technique's rule applies unchanged: "the rewrite could not run" and "nothing to
rewrite" are different outcomes, and a hook script that discards the
rewriter's errors and maps every failure to success has made them identical.

## Decision rules

- Ask who owns the gate's rules and what they were written against; where a
  person wrote them against the original, judge the original before
  rewriting.
- Evaluate the original against a copy of the host's policy in the host's
  precedence; let a deny suppress the rewrite entirely.
- Never turn a no-match verdict into an approval; approve only on an explicit
  allow, and approve a compound command only when every piece is allowed.
- Do not rewrite a command the permission splitter cannot decompose; keep that
  splitter stricter than the rewrite's own.
- Treat an unread or malformed rule source as a reason to withhold approval,
  and report it.
- Keep the wrapper visible to the host's classifiers or off the commands they
  must classify.
- Surface a failed rewrite as distinct from "nothing to rewrite".

## When not to use it

A rewriter inside a runtime that owns its gate and whose rules are evaluated
on the effective value needs only
[rewrite-before-the-gate](./rewrite-before-the-gate.md). And a host whose
policy keys on something a rewrite cannot change - a sandbox profile, a
filesystem or network boundary enforced below the shell - is not re-keyed by a
wrapper; the copy of its policy buys nothing there.
