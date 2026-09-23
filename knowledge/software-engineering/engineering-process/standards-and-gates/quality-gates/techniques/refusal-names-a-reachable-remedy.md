---
layer: technique
type: technique
subject: quality-gates
technique: refusal-names-a-reachable-remedy
status: forged
laws: [absent-guard-is-loud, derivation-names-recomputation, gate-sees-target]
shared_with: []
applied: code
ab_verdict: better
use_when: [writing the message a blocking check prints when it refuses, a gate announces a skip and tells the reader how to restore it, a refusal names a command, script or tool the reader is expected to run, the remedy for a finding lives outside the repository the gate ships with, a contributor says they bypassed a gate because they could not act on it, auditing why a gate's bypass rate is high while its precision is good, deciding what a refusal should say when its preferred remedy is unavailable, a conformant call through a shared helper still reads as a violation]
---

# A refusal names a remedy, and the remedy exists where it is read

A ban that says only *forbidden* is a puzzle, and puzzles get solved by
suppression. The corpus already says so twice: every prohibition carries its
replacement in the violation message
([operation-assertion-gates](../../metric-gates/techniques/operation-assertion-gates.md)),
and a size rule prints the remedy the document that stated the bound already
wrote down ([prose-rule-drift](./prose-rule-drift.md)). Both are about the
message containing a remedy.

This technique owns the sentence after that one. **A remedy is a claim about the
reader's environment, and it is the only claim a gate makes that nothing ever
checks.** The message is authored once, on a machine where the remedy worked,
and then read in every installation the project reaches. Where it does not
resolve there, the refusal is a dead end, and a dead end leaves exactly one
move.

## The remedy is the part of a refusal that gets acted on

A blocking check's output has three parts: what is wrong, where, and what to do.
The first two are derived from the run and cannot drift far from the truth. The
third is prose, written by hand, usually once, and it is the only part the reader
executes. It is also the part that decides whether the gate survives: a
contributor who cannot act on a refusal has the same two options as one facing a
false positive, and takes the same one
([false-positive-economics](./false-positive-economics.md)). The gate was
precise, the finding was real, and the bypass habit it taught is identical.

The failure is invisible from inside the project because the author's own
installation is the one where the remedy works. Nothing in the run is red.
Nothing in review looks wrong. The message reads as helpful, and it is helpful
exactly once, to the person who wrote it.

## A literal path to a remedy is a derived value with no recomputation

The sharp form appears wherever the remedy lives **outside the tree the gate
ships with**: an installer in a sibling checkout, a tool the environment is
expected to provide, a generator whose home is declared in configuration. The
message hardcodes a path, and that path is a *derivation* — from where this
project sits, from where the neighbour was cloned, from what the configuration
says — frozen as a string
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
It has no recomputation path, so it cannot be wrong loudly; it can only be wrong.

Measured across twelve repositories on one toolchain: sixty-eight runnable
remedies named in gate output, of which **seven did not resolve from the
directory the reader is standing in when the gate refuses**. The split is the
finding. All sixty-one remedies pointing *inside* the shipped tree resolved. All
seven failures pointed *outside* it — six of them one sentence copied into six
repositories, naming a sibling checkout by a path correct relative to the
directory that holds the project and correct from nowhere a hook runs; the
seventh named a script in a different checkout as though it were local. In every
one of the six, the location had been declared in that project's own manifest
all along, and the message did not read it.

So the rule is not "check every path in every message". It is narrower and it
follows from the split: **a remedy that the artifact does not ship is resolved
where the message is built, never restated as a literal.** Read the declaration
that already exists — the manifest entry, the environment variable, the
configured root — and print the resolved command. A remedy inside the tree may
be a literal, because the tree is the one thing the gate and the reader are
guaranteed to share.

## Degrading is naming what is missing, not going quiet

Resolving the remedy raises the case the literal concealed: the remedy may not
be there. The temptations are the familiar pair, and both are wrong. Printing
the preferred remedy anyway is the original defect with extra steps. Dropping the
sentence leaves a refusal with no exit, which is worse than a wrong exit because
the reader cannot even tell that one was intended.

The refusal **degrades to a remedy that does exist**, and the floor of that
ladder is always reachable: say what is missing, where it was looked for, and
what declares that location. "The installer is in the component registry, which
is not at *<declared path>* — put it there, or point *<declaration>* at your
copy" is actionable in every installation, because acting on it requires nothing
but the project in front of the reader. That is the announced-skip discipline
([gate-liveness](./gate-liveness.md)) carried one step further than it usually
goes: a skip that is loud about *itself* and silent about the repair is loud
about the wrong half
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The ladder matters most where the gate is in the path of its own repair. When a
check withdraws because its instrument is broken, the exit runs *through* the
capability being denied ([unmeasurable-criteria](./unmeasurable-criteria.md)),
and the message is the only thing standing between the operator and a deadlock
whose exit is outside the system. A withdrawal that names an unreachable repair
has kept the deadlock and added a reassuring sentence.

The surface half of this is settled next door: a refusal states the capability,
not the cause, and the audience decides how much of the environment it may name
([capability-honest-refusal](../../../../backend-platform/resilience/optional-dependency-degradation/techniques/capability-honest-refusal.md)).
That technique governs a running service answering a stranger. A gate is
answering the person who can repair it, so the environment is the *subject* of
the message rather than a disclosure risk, and naming the declaration by name is
the whole value.

## The message is an artifact the gate can read

None of the above is discipline that holds. It is a check, and it is cheap,
because the claim is mechanical: **every runnable path a gate's output instructs
the reader to run resolves from the directory the gate runs in.** That directory
is the repository root for a hook, and it is not the directory of the file that
prints the message, and not the parent of the project — the reader is not
standing in either.

A project that already reconciles its *documents* against reality will usually
not be reading its *refusals*, and the gap is worth naming because it looks like
coverage. One measured instance: a checker enforced that guidance files name only
package scripts that exist, across six rules and two dozen gates, and had never
read a hook's output — where the one broken remedy in the repository was. The
instruction a contributor is likeliest to obey is not in a document. It arrives
at the moment the push stops.

Two exclusions make the check precise, and both are the rule rather than
leniency:

- **Narration is not instruction.** Output that reports what a run did names
  paths constantly and tells nobody to do anything. Require an instructing verb
  on the line. Without this the check fires on progress logs, and a rule whose
  first week is false positives is suppressed in its second.
- **A path assembled where the message is built is not a literal to verify.** A
  remedy interpolated from a resolved root is precisely what this technique
  asks for; flagging it makes the fix for the finding into the finding. Skip
  references whose root is a substitution.

The check inherits the standing obligation of its class: assert that the
population is non-empty, or a renamed hooks directory retires the rule reporting
clean ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Reachable is not enough: the remedy, applied, must clear the check

Everything above asks whether the reader *can* perform the remedy. The next
question is whether performing it turns the gate green, and a text-matching gate
can fail it while the remedy is reachable, correct and exactly what the codebase
wants. The sharp form: the gate keys on a literal idiom — an attribute, a role, a
call name — and the codebase ships a shared helper that **emits that idiom at
run time**, through a call or a spread the matcher reads as opaque. Every site
that does the right thing through the helper still reads as a violation.

The cost is not a false positive in the ordinary sense, paid once and
suppressed. It is a pressure on the code. Authors learn that the way to satisfy
the gate is to write the literal by hand — beside the helper, redundantly, or
instead of it — which is the opposite of what the primitive exists to teach, and
the gate that was meant to spread a convention now spreads a duplicate of the
primitive's internals. A rule whose **own documented fix** does not clear it is
the extreme case, and it is common, because the fix is written in prose and the
matcher in a pattern, by the same author, on different days.

Two acceptable resolutions, and the choice is the gate owner's, not the
author's:

- **The gate recognises the helper.** The helper's call counts as the idiom, by
  name, in the same match that looks for the literal. This is the usual answer
  where the helper is the preferred form.
- **The helper is made unusable for the case**, so the gate and the primitive
  stop disagreeing about which form is correct.

Either way, the prescribed remedy becomes a fixture: apply it, exactly as the
message words it, to a minimal violating file, and assert the rule stops
matching. That is the positive control this family of gate is otherwise
missing — a needle must be findable in the source it names
([match-the-resolved-artifact](./match-the-resolved-artifact.md)); a remedy must
be *clearing* in the gate that names it.

Measured on 2026-09-23 in one desktop application tree: a rule requiring a tab
strip's file to declare its panel matches on the literal panel role, and its
documented fix is to spread the tab primitive's panel-props helper, which sets
that role. Of the five files that import the helper, three also write the role
out literally, two of them with a comment naming the gate as the reason;
for both files that rely on the helper alone, the strip it closes is still
counted as a violation — once because the spread is opaque to the match, once
because the strip sits in a neighbouring file the single-file match cannot join
to. A sixth file writes the attributes by hand instead of calling the helper, and says
in a comment that the helper is invisible to the rule.

## Decision rules

- Every refusal names a remedy; that is settled elsewhere. **This is the next
  question: would the remedy run from where the reader is standing?**
- A remedy inside the shipped tree may be a literal. A remedy outside it is
  resolved at emit time from whatever already declares its location.
- Where the resolved remedy is absent, degrade: name what is missing, where it
  was looked for, and what declares that location. Never print the preferred
  remedy anyway, and never drop the sentence.
- Check the messages, not just the documents. A gate that reconciles its
  guidance and not its own output has audited the instruction nobody reads.
- Exclude narration and emit-time-resolved paths from the check, and put a
  fixture behind each exclusion.
- **The remedy, applied as worded, must clear the check.** Keep it as a fixture.
  Where the codebase ships a helper that produces the idiom the gate matches,
  either the gate recognises the helper or the helper is withdrawn from the
  case — never leave authors to restate the helper's output by hand.
- The audit question for a gate with good precision and a high bypass rate is
  not "is the finding right" but **"can the reader do what the message says,
  here?"**
