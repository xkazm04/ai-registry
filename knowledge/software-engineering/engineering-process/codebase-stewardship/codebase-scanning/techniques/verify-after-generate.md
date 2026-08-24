---
layer: technique
type: technique
subject: codebase-scanning
technique: verify-after-generate
status: forged
laws:
  - gate-sees-target
  - deletion-is-not-repair
  - derivation-names-recomputation
shared_with: []
use_when: [a model-driven generator succeeded and its artifact must be trusted, repairing a corrupted generated artifact without deleting the correct copy, the generator is unreachable and something changed anyway]
---

# Verify after generate

A deterministic generator fails by *not running*: it crashes, it is skipped,
it exits zero having touched nothing, and the artifact it owns goes stale.
Every guard built for that failure — the freshness gate, the drift diff, the
do-not-edit header — assumes that a run which completed produced the right
thing, because for a deterministic generator it did.

A model-driven generator has a third failure, and it is the one nothing
downstream is watching for: it **runs to completion, reports success, and
writes a wrong artifact.** Not malformed — a malformed artifact is caught by
the first reader that parses it. Structurally valid and semantically corrupt:
an entity emitted twice under one identity, a prune that removed the wrong
side, a field left unset because the model chose a create where an update was
called for. The technique is the consuming side's answer: **after every
generation, the consumer audits the artifact against a small fixed set of
invariants, before anything reads it as truth.**

## The generator's exit code reports on the process, not the product

The naive reading is that correctness of the output belongs to whoever wrote
the generator, and a consumer that re-checks it is paying twice for one
guarantee. That holds while the generator is a function. It stops holding the
moment the generator is a model, because there is no *the* output — there is
this run's output, drawn from a distribution the generator's own success
signal says nothing about. Asking the generator whether it succeeded is asking
a proxy; the audit must read the artifact itself
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

What scopes the danger is not who wrote the artifact but **who reads it as
truth**. An artifact consulted by three pieces of automation at the start of
every task is a lie with three amplifiers; the same corruption in a report
nobody opens is a typo. Rank the audit's urgency by the consumer count, and
treat any artifact that agents read at task start as load-bearing.

## The audit is small, structural, and lives where the operator already is

Four invariant families cover most of the ground, and all four are cheap
because none of them re-derives the artifact:

1. **Identity uniqueness** — no entity name or key appears twice.
2. **No orphans** — every entity that must belong to a parent has one; an
   unset parent is the signature of a create emitted where an update was
   meant.
3. **Referential liveness** — every path, id or symbol the artifact points at
   still resolves in the current tree.
4. **Coverage** — everything that *should* appear does, computed from the tree
   rather than from the artifact's own claim about itself.

Two rules about the audit's form matter more than its contents. It is
**runnable and inlined at the point of use** — written out in full in the same
document that tells the operator how to trigger a generation, so running it
costs one paste rather than an expedition to find the tool. And each check
**names the incident that bought it**, with a date. An invariant list written
from principle grows decorative checks and misses the real one; a list where
every entry cites a corruption it has actually caught stays short and stays
credible.

When a corruption is measured under one generation mode, the honest default is
that **every mode can produce it** until one has been proved safe. Scoping the
bug to the mode that happened to reveal it is how the same incident arrives a
second time, under a different name.

## The repair protocol names its anti-remedy

Every corruption of this class has a nearby tool that looks like it fits. A
duplicate has a de-duplicator; an orphan has a re-parenter; a stale pointer
has a pruner. The trap is that those tools resolve by a mechanical
tiebreak — oldest wins, first wins, newest wins — while the corruption is
defined by *content*: one of the two rows holds the correct data and the other
is a husk, and which is which has nothing to do with when either was created.
Reaching for the obvious tool deletes the correct copy and leaves the husk
standing, converting a visible duplicate into an invisible wrong answer
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

So a repair protocol is written the other way round from the usual: it names
the wrong fix first, by name, with the reason it destroys the right side in
this exact case. A stated anti-remedy is worth more than a stated remedy,
because the operator meeting a corruption is hurried and the wrong tool is the
one whose name matches the symptom. The remedy itself is then constrained to
one rule — **read both candidates and select by content, never by order** —
and the choice of which to remove is a judgement the protocol makes explicit
rather than delegates to a sort.

Two further constraints keep repairs from becoming their own incident.
Operations that reshape the taxonomy wholesale — merges, consolidations,
global renames — are **the owner's call and never a cleanup step**; a repair
pass that tidies while it fixes is unreviewable. And where the generator's
authoritative store and the exported artifact are separate things, **a repair
against the store leaves the artifact untouched**: every repair path ends in
an explicit re-export, or the fix corrects the truth and leaves the lie in the
copy that readers actually read
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

## When the generator is unreachable, journal the drift

The generator will be unavailable at some point during a session that changed
exactly the thing it tracks. There are three moves and two of them are wrong.
Hand-editing the artifact is wrong: the next generation erases the edit, and
until then the hand-written state is a lie with the artifact's full authority
behind it. Writing a private substitute is worse — now two artifacts disagree
and neither declares itself derived.

The third move is a **drift journal**: an append-only file taking one dated
line per session, naming what changed and precisely which regeneration is owed
for it. Its whole value sits in one contract that must be written down or the
file becomes a graveyard — **the next session that finds the generator
reachable drains it**: it runs what is listed, then clears the lines it
satisfied. Drain, not read. An owed-work queue with no obligated drainer
accumulates until someone declares bankruptcy on it.

## The economics: regeneration is metered, the audit is not

A model-driven generation costs real money and real minutes per run, which is
why re-running-and-diffing — the deterministic world's answer to "is this
artifact right" — is unavailable here. That asymmetry is the whole reason the
audit exists as a separate cheap instrument, and it also sets the cadence:
generation is a **once-per-session act, not a reflex** after every change,
while the audit runs after every generation without anyone weighing it.

The same economics have a floor worth measuring for your own generator: below
some scope size, a scoped run does not produce what the operator wanted
anyway — it merges instead of splitting, and it is exactly where duplicate
emissions have been observed. Knowing that floor turns "should I run a scan?"
into arithmetic instead of a hunch.

## When not to use this

If the generator is deterministic and its output is byte-stable, do not build
an invariant audit — re-run it and diff, which is strictly stronger and nearly
free, and belongs to the build's drift gating rather than here. If the
artifact has no automated readers, the audit is over-engineering; a human who
opens a wrong document notices. And if regeneration is cheap enough to run
twice, comparing two runs is a better oracle than any invariant list, because
it catches the corruptions you have not had yet.
