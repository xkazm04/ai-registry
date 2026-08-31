---
layer: technique
type: technique
subject: machine-paced-delivery
technique: mutating-local-gates
status: forged
stage: solo
laws: [gate-sees-target, failure-not-empty-success, absent-guard-is-loud]
shared_with: []
use_when: [a local check fixes what it finds, deciding whether an agent's turn-end gate may write to the tree, an auto-fixing check keeps re-firing on the same turn, two formatting rules disagree and the tree will not settle]
---

# Mutating local gates

The standing rule for gates that run inside a working copy is that they observe and never
mutate, and it is correct wherever it applies: an auto-fix in the commit path lands content in a
commit its author never read. That rule was written against two positions — a check at commit
time, and a fixer in the editor-on-save loop where the author watches it happen. Machine-paced
authorship adds a third position that is neither, and the rule as stated has nothing to say
about it: **the boundary of an agent's turn.**

A turn-end check is not a commit hook — no commit exists yet, and there is no staged/unstaged
split to destroy. It is not the editor loop either — nobody is watching, and the entity that
will act on the result is the same one that just wrote the code. At that position, forbidding
mutation is the wrong default and permitting it silently is worse. What makes it safe is four
conditions: three restate contracts the commit-path rule already protects, and one does not
exist until mutation is allowed at all.

## Why the position is different

The commit-path prohibition rests on three contracts. Check each against the turn boundary
rather than inheriting the verdict:

- **The review contract** — content lands that nobody reviewed. This one *survives* the move and
  is the binding constraint. The agent is about to report the turn as done; if the fixer
  reshaped its work, that report describes a tree which no longer exists. The contract is
  satisfied only by surfacing the change, never by the fixer being correct.
- **The staging contract** — a partial stage is destroyed, or the fixed copy and the committed
  copy diverge. This one **does not apply**: the turn boundary sits upstream of staging entirely.
- **The shared-tree contract** — the fixer edits work belonging to a parallel session. This one
  applies with full force, and it is bounded by scope rather than by prohibition: the fixer may
  touch only files this turn already made dirty. A check that widens to the whole tree has taken
  somebody else's work hostage.

Two of three transfer. That is why the position deserves a rule rather than an exception.

## The gate destroys its own evidence

An auto-fixing check is the one instrument whose input is gone once it has run. No
after-the-fact question recovers what it did — the tree holds the result, and the result is
indistinguishable from code the author wrote that way. So the diff has to be **captured, not
reconstructed**: snapshot the dirty set before the fixer runs, run it, then diff the snapshot
against the tree.

That diff is the deliverable, and it is what the block reason carries. A gate reporting "the
fixer changed 4 files" has told the agent its picture is stale without telling it how, and the
agent's cheapest correct response is to re-read four files it has already paid to read. A gate
that hands over the patch costs one message and closes the loop. This is the ordinary output
discipline for a verification result — verdict first, located, bounded — arriving at a case
where the payload is a patch rather than an error.

Deletions have no snapshot and produce an empty patch; drop them rather than reporting a phantom
change.

## Termination is a contract, and it starts earlier than mutation

A turn-end gate whose output goes to a human, or to a log, cannot fail to terminate: it runs, it
reports, the turn ends. **The contract appears the moment the gate's output re-enters the agent's
loop**, because then the gate is talking to the thing whose completion it is gating, and the
conversation can fail to converge. Mutation is the worst case rather than the origin, and getting
the tiers in the right order matters, because the cheapest gate on the list already needs the
guard:

- **Advisory that the agent reads.** A gate that feeds a reminder back to the model — update the
  coupled document, you changed this without that — provokes the agent to act, which ends another
  turn, which fires the gate again. Nothing blocks and it still loops. This is the tier most
  likely to ship without a guard, precisely because it looks harmless.
- **Blocking.** The turn cannot end until the agent complies. If it declines, misunderstands, or
  cannot comply, the gate re-blocks indefinitely.
- **Mutating.** Everything above, plus a failure mode no compliant agent can escape: the fixer
  changes the gate's own input, so the loop can oscillate even when the agent does exactly what it
  is asked. Two rules that disagree — a formatter and a static-analysis rule with opposite opinions
  about one construct, or two fixers whose outputs are each other's input — have no fixpoint. Each
  pass is individually correct and the pair alternates forever. A cascade behaves the same way: one
  fix legitimately creates the next, and the chain is longer than the turn.

From inside the gate, none of these is distinguishable from the ordinary case where the gate is
right and the agent simply needs to look. So the guard is not a diagnosis; it is a bound.

So the rule is a ratchet on re-entry:

- **First firing** — block, and hand over the patch. The agent has not seen this change.
- **Any subsequent firing in the same turn** — do not block again. Report what changed as an
  advisory and let the turn end.

The gate must therefore *know* that it is re-entering. A gate that cannot tell its first firing
from its fourth has no way to implement this and will loop until something outside it intervenes.
The cost of the ratchet is one unreviewed pass at the end of a pathological turn. The cost of
omitting it is a turn that cannot end — the failure an operator experiences as the agent being
stuck, and diagnoses last, because every individual component is behaving exactly as designed.

A gate that reaches its advisory path is reporting a defect in the **rule set**, not in the
change. Two fixers with no fixpoint is a configuration bug with a real repair, and the advisory
is the only place it is ever visible: nothing else in the pipeline holds an opinion about whether
the tree converges.

## Nothing to fix is still a result

A per-package fixer with no dirty files in its package correctly does nothing, and correctly
doing nothing is the state most easily confused with not having run. The general rule belongs to
[gate-liveness](../../../standards-and-gates/quality-gates/techniques/gate-liveness.md) —
could-not-run is spelled differently from passed — and it takes a sharper edge here, because the
consumer holds a *promise*: the repository's own instructions told the agent these checks run at
turn end. Silence against a stated promise is read as a pass, which is the condition
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) forbids. Announce the skip and
name what was skipped, so a turn whose changes landed elsewhere is visibly unchecked rather than
invisibly so.

## Boundaries

The commit and push path keeps the prohibition intact — that is
[hook-hygiene](../../../standards-and-gates/quality-gates/techniques/hook-hygiene.md)'s, and
nothing here loosens it. What runs, in what order, discovered from where, is
[pre-authorship-verification](./pre-authorship-verification.md)'s; this technique governs only
the subset of those checks that write. The reserved classes an agent may not author unilaterally
are [proposal-not-push](./proposal-not-push.md)'s, and a fixer is not a loophole in them: a check
that rewrites gate configuration, deletes a test, or adds a suppression directive is making a
reserved change no matter which process typed it.

## Decision rules

- A local check may write to the tree at the agent's turn boundary; in the commit path it may
  not.
- Scope every fixer to the files this turn made dirty. Never the whole tree.
- Snapshot the dirty set before the fixer runs; the gate cannot reconstruct what it overwrote.
- Block on the first firing, and carry the patch itself as the reason rather than a count of
  changed files.
- On any subsequent firing in the same turn, report and do not block — an unreachable fixpoint
  must not become an unendable turn.
- Give every turn-end gate whose output reaches the agent a re-entry guard, including a purely
  advisory one. Blocking and mutation widen the ways the loop fails to converge; they do not
  create it.
- Treat a firing that reaches the advisory path as a defect in the rule set, and say so.
- A fixer that had nothing to do announces that it had nothing to do.
- A fixer may not make a change the reserved classes withhold from the agent.
