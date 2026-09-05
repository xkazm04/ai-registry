---
layer: technique
type: technique
subject: agent-instruction-files
technique: enforcement-demotion
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [a style or formatting rule keeps being violated despite being in the instruction file, deciding whether a new rule should be prose or a hook, an instruction file reads like a linting config, the file claims a rule is enforced and the claim has not been verified, a hook reaches its verdict by asking a model, choosing between prose and a verifier hook for a rule that needs judgment]
---

# Enforcement demotion

An instruction file is delivered to the model as context, not as
configuration. The harness's own framing is explicit: the file is
advisory; linters, type systems and CI gates are deterministic, and so is
most of what a harness calls a hook — with an exception that has since
grown large enough to need its own section below. An agent follows a
prose rule most of the time — which means a rule that
must *always* hold, written as prose, is violated on schedule. The
technique is a sorting discipline: **everything mechanically checkable
demotes out of the file into a gate; the file keeps only what requires
judgment — and names the gates so the agent cooperates with them.**

## The sort

For each rule the file carries or is about to carry, ask: *could a
program decide compliance?*

- **Yes → demote.** Formatting, naming, import order, banned tokens (raw
  hex colors, console calls, forbidden APIs), line caps, locale-key
  parity, commit-message shape — all of it moves to the linter, the
  formatter, the type system, a pre-commit hook, or the harness's own
  lifecycle hooks that fire on tool use. The gate observes the artifact
  itself, not the model's intention to comply
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)) — and it
  keeps working when the file has grown, when the session is long, and
  when the model is having a bad day. The demoted rule also stops paying
  the dilution tax, which buys compliance for the rules that remain.
- **No → prose.** Judgment calls survive: which abstraction to extend,
  when a change deserves a doc update, what the team considers
  over-engineering, which of two idioms the codebase prefers and *why*,
  what to do when guidance conflicts. These are the lines only the file
  can carry.

The strongest style-rule catalog in prose is still the weakest gate in the
repo. Practitioner convergence through 2026 lands on the same sentence
from three directions: you need a linting config, not a longer agent file.

The field data has since priced the failure this sort prevents. In a 2026
observational study of 20,574 real developer sessions across 1,639
repositories (16,118 validated episodes), **violating an explicitly stated
constraint was the single largest misalignment class — 38.3% of validated
episodes, 49.5% in command-line sessions** against 32.3% in IDE ones, with
instruction-following failure attributed as the cause in 73.7% of those
episodes. The study contrasts CLI with IDE, not unattended with supervised;
the inference that the CLI share is the less-watched one is this subject's,
and it is the plausible reading. A rule that must always hold, carried as
prose into exactly the sessions nobody is watching, is the measured worst
case — which is why the demotion question is asked per rule, and asked again
when a rule graduates from interactive use to unattended dispatch.

## Name the gate; do not restate it

Demotion does not mean the file falls silent about the rule. The
high-value prose line about an enforced rule is not the rule's content —
the gate owns that — but its **existence, authority, and interaction
contract**: "colors go through tokens; `design:check` enforces it, do not
work around it", "locale parity is enforced by the type system — there is
no parity script, do not invent one". This is one line where the rule text
was twenty, it cannot drift from the enforcement (the gate is the
authority), and it prevents the two failure modes prose-restating invites:
the agent fighting the gate as an obstacle, or duplicating it as a
homemade check. Stating the same rule in prose *and* lint config *and* a
conventions section is three copies of one vocabulary — the drift race of
one-authority-per-vocabulary, run inside a single repo.

## A claimed gate must actually fire

The inverse failure is worse than any duplication: the file says
"enforced by X" and X does not operate — the hook never fires, the check
runs at warn level, the gate watches a proxy. An enforcement claim
retires the agent's own caution; a false one retires it for nothing. An
optional or silently-dead guard is an absent guard
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)), and
the file's claim is what makes the absence invisible. The discipline:
an enforcement claim enters the file only with evidence the gate fires
(a caught violation, a test of the hook), and
[instruction-freshness](./instruction-freshness.md) re-verifies it — a
dead gate is either revived or the file says, in so many words, that the
rule currently stands unenforced.

## A hook that prints prose is not a demotion

The sort has two outputs, and a third shape turns up in the field that
belongs to neither: a lifecycle hook whose entire effect is to print text
for the model to read. It fires on every prompt, or every stop, and what it
emits is not a verdict about an artifact but a reminder — *before you
finish, evaluate whether this task taught you something worth keeping.* It
is registered beside the gates, so it reads as demoted. Nothing about it
is. No program decided compliance; there is no target for the gate to see;
the text arrives as context and is weighed like any other line. What the
hook changed is the cadence and the audit: the line is redelivered on every
turn instead of once at session start, and it lives in a script rather
than in the file, so the per-line admission review — line-earning, the
sibling-floor enumeration — never sees it. It is an always-loaded floor
line with a per-turn multiplier and no reviewer.

Sort the **trigger**, not the channel. A hook earns its place when a
program decides *when* it speaks: it observes the artifact — the set of
files this turn edited, an exit code, a diff — and stays silent otherwise.
Its prose is then the "name the gate" line above, paid only on the turns
where the condition held. When the condition is a judgment call — *did
this session discover something non-obvious?* — no program can decide it,
the rule is on the prose branch, and its honest home is the file, once per
session, with [context-reset-redelivery](./context-reset-redelivery.md)
deciding whether it needs to be said again after a compaction. Per-prompt
redelivery of a judgment call buys the floor's cost N times over, and its
compliance gain is, at the time of writing, asserted by the tools that
ship it and measured by none of them.

The cost side has been measured. Across two coding-harness projects in one
fleet, a documentation-sync reminder in its condition-observed form fired on
122 of 1,631 recorded human turns (7.5%; 50 of 487 and 72 of 1,144). The
same reminder delivered unconditionally on every prompt would have injected
fifteen to twenty-five times the words (85,700 against 5,500; 201,300
against 7,900), and 86% of the turns it spoke on would have contained no
edit at all. Replayed with the hook's own decision function over the
recorded transcripts, 2026-09-02.

## A model-backed hook is not a demotion either

The sort's yes-branch says "demote it to a gate" and quietly assumes the
destination decides by program. That assumption held while a harness's
hook surface ran shell commands. It no longer does. A current published
hook contract accepts six kinds of hook, and two of them reach a verdict
by asking a language model: one that evaluates a prompt against the hook's
input, and one described in the schema itself as an *agentic verifier* —
given a brief like "verify that unit tests ran and passed", defaulting to a
small fast model, with a timeout because it is a network call. Both can
return the same blocking decision the deterministic types return.

This is the second impostor, and it is far more convincing than the
prose-printing one above. That shape at least looks wrong on inspection —
it emits a reminder and decides nothing. This one is registered beside the
gates, it *does* produce a verdict, it blocks the tool call, and it appears
on the operator's surface exactly as a gate does. What travelled is not
determinism. It is the location of the judgment: out of the file, where it
was diluted by instruction count and weighed against everything else in
context, and into a second model that sees only the hook's input, decides
under a timeout, and is not the model whose behaviour is being governed.

That relocation buys real things, and the technique is not an argument
against it. The second model's judgment is not competing with the task for
attention; it cannot be argued out of its verdict by the session's own
reasoning; it is redelivered on every triggering event rather than once at
session start; and it can decide questions no program can — *did this
change deserve a doc update*, *is this test meaningful* — which is exactly
the class the sort's no-branch was forced to leave in prose. A judgment
call moved to a verifier hook is a genuine improvement over the same
judgment call written as a line.

What it does not buy is the property the demotion was for. Two failure
modes follow, and both are the file's problem rather than the hook's:

- **The enforcement claim becomes a probability.** "Enforced by X" retires
  the agent's own caution, and the section above admits the claim only with
  evidence the gate fires. A model-backed gate fires and then *sometimes*
  reaches the wrong verdict — including the direction that costs most, a
  pass it should have blocked. An optional or silently-dead guard is an
  absent guard; a guard that is right most of the time is a guard whose
  false-negative rate the file has silently promised is zero.
- **The rule stops being reviewable.** A demoted rule's content moves to a
  place where it can be read: a lint config, a schema, a script. A rule
  demoted into a verifier prompt moves into a natural-language brief that
  is neither reviewed like prose nor testable like a program, and the
  per-line admission discipline that governs the file — line-earning, the
  sibling-floor enumeration — does not reach it, for the same reason it
  does not reach the prose-printing hook.

So the sort takes a third question, asked of the destination rather than of
the rule: **does this gate decide by program or by model?**

1. *Could a program decide compliance?* If yes, demote it — to a
   destination that is itself a program. This is the original sort and
   nothing about it changes.
2. If no, the rule needs judgment, and there are now two homes for it
   rather than one: prose in the file, or a model-backed hook. Choose the
   hook when the judgment has a **trigger a program can decide** — the
   condition that made "sort the trigger, not the channel" the rule above
   — and when a wrong verdict is affordable. Choose prose when neither
   holds.
3. Never let step 2's hook be described in the file as enforcement. It is
   a second opinion delivered on a schedule, and that is what the file
   should say it is: name it, say what it checks, and say that it can be
   wrong — the same honesty the "name the gate" line already requires,
   applied to a gate whose authority is weaker than its registration
   suggests.

The general form, which outlives any one harness's hook menu: **a rule has
been demoted when its verdict stopped depending on a model's judgment, not
when its text stopped living in the file.** Moving text out of the file and
into a configuration directory is a change of channel. Only the first is
the demotion this technique is about, and as a harness's extension surface
grows richer the two stop being the same act — the menu of destinations now
contains several that are the channel change wearing the demotion's clothes.
