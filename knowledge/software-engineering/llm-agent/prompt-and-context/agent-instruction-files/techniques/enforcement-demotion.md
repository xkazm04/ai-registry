---
layer: technique
type: technique
subject: agent-instruction-files
technique: enforcement-demotion
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [a style or formatting rule keeps being violated despite being in the instruction file, deciding whether a new rule should be prose or a hook, an instruction file reads like a linting config, the file claims a rule is enforced and the claim has not been verified]
---

# Enforcement demotion

An instruction file is delivered to the model as context, not as
configuration. The harness's own framing is explicit: the file is
advisory; hooks, linters, type systems and CI gates are deterministic.
An agent follows a prose rule most of the time — which means a rule that
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
