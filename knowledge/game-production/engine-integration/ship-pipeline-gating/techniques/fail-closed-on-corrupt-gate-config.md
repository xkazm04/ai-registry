---
layer: technique
type: technique
subject: ship-pipeline-gating
technique: fail-closed-on-corrupt-gate-config
status: forged
laws: [law-and-check-share-one-source, unmeasured-is-not-a-pass, no-gate-self-certifies]
shared_with: []
use_when: [a gate cannot read its own thresholds, deciding what a check does when its configuration is missing, a linter silently fell back to built-in defaults]
---

# Fail closed on corrupt gate config

## The concern

A gate carries a configuration of its own: budgets, thresholds, token lists, allowances,
pattern sets. Sometimes that configuration is missing, truncated, unparseable, or a
different shape than the reader expects. Three behaviours are available and only one of
them is defensible.

The technique is small. It is also got wrong almost universally, because the wrong answer
is the one that keeps the pipeline moving on the day it is written.

## The three options, ranked

**Proceed with built-in defaults — the worst.** It substitutes an authority nobody chose
for the one the team wrote down, at precisely the moment the evidence that something is
wrong is strongest. The gate then reports a verdict whose basis is fabricated, and the
report carries no hint of that. Everyone downstream reads a normal green. Worse, the
defaults are typically laxer than the real thresholds — a hardcoded fallback is written
by someone thinking about not blocking, not about the constraint — so the failure mode is
systematically permissive.

**Skip the gate — second worst.** Honest, if and only if the skip is reported as a skip
and no roll-up counts it as a pass. It usually is not; skipped and passed collapse into
green within one reporting layer, and then a corrupt configuration file silently deletes
a gate from the pipeline for months.

**Refuse to run — correct.** The pipeline stops with a specific message: this gate's
configuration could not be read, here is the path, here is the parse error. That is a
five-minute fix. Shipping against invented thresholds is discovered by users.

Where refusal is genuinely unavailable — a gate embedded in a long unattended run that
must produce a verdict of some kind — the fallback is the *most conservative* setting the
gate offers, never the most permissive, and it is announced in the verdict itself. That
is a degraded form of refusal, not a fourth option, and it is only acceptable because it
still cannot be mistaken for a normal pass.

## Absent and corrupt are different facts

The rule above is unusable until this distinction is made, and making it is most of the
craft.

**Absent** — no configuration was ever written — is a state someone chose, or at least a
state the system is designed to start in. Whatever the schema defines for absence is a
legitimate answer, and for many gates the right answer is *off*.

**Corrupt** — a configuration exists and cannot be parsed — is a defect. Its correct
behaviour is the opposite of absence: the gate stays **armed**, at the most conservative
setting available, and every verdict it produces carries a marker saying its thresholds
were not the ones anyone chose.

Collapsing the two is how a corrupted file silently *disables* a gate, in a way that is
indistinguishable from an operator switching it off deliberately. That is the sharpest
form of failing open: nobody is alerted, the pipeline is greener than before, and the
regression the gate existed to catch ships. If a codebase gives one fallback value for
both cases, it has this bug regardless of which value it picked.

Two consequences follow, and both are easy to get wrong:

- **The marker travels with the verdict, not with the artifact.** A gate that concluded
  on fail-closed defaults says so in the same sentence as its result — "these are
  fail-closed defaults, not your configured budgets" — because the verdict is what people
  read, and a note filed elsewhere is a note nobody sees.
- **The marker is never persisted.** It is a property of one read, not of the
  configuration. Writing it back would store the fact of a past corruption as
  configuration, where it outlives the corruption that produced it and misreports every
  subsequent healthy read. Strip it on the way out.

## Procedure

1. **Load gate configuration in preflight**, not at the moment of verdict. The cheapest
   time to discover a corrupt threshold file is before the expensive stage, and a gate
   that discovers it afterwards has already wasted the run it was meant to protect.
2. **Parse strictly.** Unknown keys, missing required fields, values of the wrong type
   and out-of-range values are all load failures. A permissive parser that coerces its
   way to a value is a defaults fallback wearing a different coat.
3. **On any load failure, return a refusal**, not a value. The gate's result type must be
   able to express "could not evaluate" as a first-class outcome distinct from pass and
   fail; if it returns a boolean, this technique cannot be implemented.
4. **Name the file and the reason** in the message. "Could not load configuration" sends
   the engineer hunting; the path plus the parse position ends it.
5. **Never log the failure and continue.** A warning followed by execution is the
   defaults path with a paper trail nobody reads.
6. **Ensure the roll-up distinguishes the three states.** Passed, failed, and could-not-
   evaluate must be three counters. If the summary has two columns, the technique dies at
   the reporting layer regardless of what the gate returned.

## Why the same source must feed prose and check

The reason a gate has a configuration file at all is that its thresholds are stated
somewhere a human reads — a standards document, a budget table, a design rule — and the
check must enforce *those* numbers rather than a copy that drifts. That is exactly why a
silent fallback is so destructive: it severs the link between the stated rule and the
enforced one, invisibly, while continuing to report enforcement. A loud failure to parse
the canonical statement preserves the link by refusing to pretend it exists.

The same argument forbids a second, "safety" copy of the thresholds compiled into the
gate. Two sources for one quantity means the disagreement is invisible until it is
load-bearing.

## Decision rules

- **When the configuration cannot be read, refuse.** Not defaults, not skip-and-green.
- **When the configuration is readable but a specific rule's inputs are absent**, that
  rule reports unevaluated while the rest of the gate proceeds. Granularity is fine;
  silence is not.
- **When refusing would block an urgent release**, the override is an explicit,
  attributed, recorded human decision to bypass the gate — never a code path in the gate
  that decides for itself. A gate that can quietly excuse itself is not a gate.
- **When a default genuinely is the right value**, put it in the configuration file as a
  written value, under version control. Then it is a chosen threshold with an author,
  not a fallback.

## When not to use this

- When the configuration is a genuinely optional refinement of a check that is complete
  without it — an extra allowlist for an audit that is correct with an empty one. Then
  absence is a valid state and must be *defined* as such in the schema, not discovered by
  a failed read. The distinction is whether absence and corruption are distinguishable:
  a missing optional file is a state, an unparseable one is still a refusal.
- When the gate is advisory by design and no decision depends on it. Then say so in its
  report and let it degrade — but be certain nothing downstream is treating an advisory
  green as a gate.
