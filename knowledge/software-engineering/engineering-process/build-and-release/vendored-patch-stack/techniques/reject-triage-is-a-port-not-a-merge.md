---
layer: technique
type: technique
subject: vendored-patch-stack
technique: reject-triage-is-a-port-not-a-merge
status: forged
laws: [verdict-survives-boundary, gate-sees-target]
shared_with: []
use_when: [an upstream bump left hunks that no longer apply, deciding what to do with a rejected patch fragment, a patch reported as applied landed somewhere unintended, triaging an upstream bump where the code a patch targeted has been refactored away]
---

# Reject triage is a port, not a merge

When an upstream release lands and part of the divergence no longer applies, the
instinct is to treat each failure as a merge conflict: look at the three texts,
pick the winning lines, move on. That instinct is wrong here, and it is wrong for
a structural reason rather than a stylistic one.

A merge conflict is a disagreement between two edits **to the same known base**.
Both sides are describing the same lines, and the machine has told you where.
A rejected hunk is not that. Its line numbers were computed against a tree that
no longer exists; the code it addressed has moved, been renamed, been split
across two modules, or stopped existing. The context lines the hunk carries are
not evidence about where the change belongs now — they are evidence about where
it belonged then, and the two coincide only in the easy cases that applied
anyway. Forcing a hunk into the place the reject file happens to point at
produces a change that compiles and is in the wrong function.

So the work is a **port**: reconstruct what the change was for, find where that
intent now applies in the new code, and re-express it there. The diff is an
input to that process and never the specification of it.

## The intent has to exist before the reject can be resolved

The port cannot start until somebody can state, in one sentence, what behaviour
the patch produces and why upstream does not provide it. That sentence is not
derivable from the diff — a diff shows a mechanism, and the same mechanism can
serve several intents. It is the field the fork ledger next door exists to hold,
and this is the moment the whole ledger pays for itself: a patch whose reason was
never written down cannot be ported, only guessed at, and the guess is made under
release pressure by whoever is on the bump.

When the reason is genuinely unrecoverable, the honest move is **not** to force
the hunk. It is to drop the patch, build without it, and run the project's own
suite. Either something fails — and the failure is the reason, now recovered and
worth writing down — or nothing does, and the patch was cargo whose removal is
the correct outcome of the bump. A stack that cannot bring itself to drop
un-explained patches accumulates them permanently, because every subsequent bump
faces the same unanswerable question with one more year of decay on it.

## Three outcomes, not two

Most patch tooling reports two states: it applied, or it did not. There is a
third state hiding inside the first, and it is the one that ships defects.

- **Applied.** The target text was found where the hunk expected it.
- **Applied after guessing.** The tool did not find the target where expected,
  searched nearby, relaxed its context matching, and landed the change at an
  offset. This is reported as success by default in most tooling.
- **Rejected.** No acceptable location was found.

The middle state is a real signal: it says the anchor the patch aimed at has
moved, which is precisely the early warning that the code around this change is
being restructured. Collapsing it into "applied" erases a classification at the
boundary where somebody could still act on it
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)), and
the collapse is usually accidental — a pipeline reads an exit status, and the
exit status does not carry the distinction the tool printed on its output.

The rule follows: **a bump surfaces all three outcomes as distinct, and the
guessing outcome is triaged rather than accepted.** In practice the middle state
usually resolves to a cheap mechanical reoffset — the change is right, its
recorded line numbers are stale, and the patch is rewritten against the new tree
without a human deciding anything. Doing that reoffset deliberately is what keeps
the next bump's guesses from compounding on top of this one's.

## The reject is not resolved when it applies

Applying is a statement about text. The port is finished when the behaviour the
patch exists for is present in the built tree, and the thing that establishes
that is the verification the ledger entry records — the actual invocation, run
against the tree that was built from the ported set
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A bump where every
hunk landed and no recorded verification ran has proved that a body of text was
transformed, which is not the claim anybody needed.

This matters most for the patches that ported *easily*. A hunk that applied at an
offset into a refactored function is the likeliest thing in the whole bump to be
silently wrong, and it is the one nobody looks at twice.

## Order the triage by intent, not by file

A bump produces a pile of failures, and the productive order is not the order the
tool emitted them in. Group the failures by the *change* they belong to — which
is trivial when the set was cut on the upstream file and expensive when it was
not — and port one change at a time, completely, including its verification.
Working file-by-file across several changes means holding several
reconstructed intents at once, and the reconstruction is the expensive part.

The bump is also the moment to ask, per change, whether it can be lifted to a
cheaper carrier or dropped because upstream now provides the behaviour. Both
questions are nearly free here and nowhere else, because the intent has just been
reconstructed and is briefly in somebody's head.

## When not to use it

When a hunk fails purely because of whitespace, an import list reordering, or a
formatting pass — the surrounding code is recognisably the same code — this is
over-procedure. Reoffset it and move on; there is no intent to reconstruct
because nothing about the target changed. The technique earns its cost when the
code the patch addressed has changed *shape*, and the tell is that you cannot
point at the new location without reading it.

And it does not apply to the decision of whether a patch should still exist at
all. Whether upstream has adopted the behaviour, whether the removal condition
has fired, and whether the entry can be retired belong to the fork ledger's walk
over its own entries. This technique starts after that walk has said "keep it",
and answers only how to make a kept change land in code that moved.
