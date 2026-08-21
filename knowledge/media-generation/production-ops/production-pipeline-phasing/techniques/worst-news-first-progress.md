---
layer: technique
type: technique
subject: production-pipeline-phasing
technique: worst-news-first-progress
status: forged
laws: [unmeasured-is-not-pass, refusal-is-a-state]
shared_with: []
use_when: [aggregating per-phase status into a project or dashboard status, designing who may write progress state, separating where the creator is from how far the work has got]
---

# Worst-news-first progress

Progress reporting in a production pipeline is not motivation — it is
navigation. The creator reads it to answer one question: *where does this
project need me?* Every design choice in this technique optimizes for that
question, and every failure mode it prevents is a way of flattering the
answer.

## Aggregation: the worst state wins

Give phases a small honest vocabulary — *not started, in progress, needs a
call, locked, blocked* — and rank it by how urgently each state needs
saying: blocked first, then needs-a-call, then in-progress, then locked,
then not-started. Whenever states combine — five phases into one project
status, two phases into one after a merge, many projects into a shelf
grouping — **the combined state is the worst of the inputs.** One blocked
phase makes a blocked project, whatever the other four claim.

Why this and not an average or a completion count: a pipeline's phases are
serial dependencies, so the project advances at the rate of its most stuck
phase; an average reports a number nobody can act on, and "3 of 5 done" can
be true of a project that is dead in the water at phase two. The count has
its place — as a secondary figure — but the *word* for the project is the
worst word. And *blocked* must be a first-class state, not decoration:
generative providers refuse, renders go missing, and per
[refusal-is-a-state](../../../_laws.md#refusal-is-a-state) a surface that
cannot say "stuck" is flattering the product. If the phase surfaces already
render refusals honestly, an aggregate that cannot repeat the news is
strictly less honest than the data beneath it.

The same rank governs migrations: when a retired phase's state folds into
its heir, the merged cell takes the worse of the two. Reporting the
survivor as locked when the absorbed phase was blocked is a false pass
manufactured by a reorganization.

## Single writer: progress is a claim, and only the phase may make it

Progress is written through **one mechanism**, by the surface that computed
it *from its own data* — and by nothing else. The rules:

- Five phase surfaces do not each invent a write path; they call the one
  reporter.
- Forms and dialogs cannot set progress. Progress is not a field a person
  types; no dialog should be able to type a project into "locked".
- *Not started* is not sayable through the reporter. It means "nothing has
  been reported here", which is what the record already holds until
  something is — so a phase with no reporter and a phase whose reporter
  found nothing read identically (which is true), and no reporter can
  quietly wipe a state it did not write.
- A reporter with nothing to say says nothing and leaves the cell alone.

This is [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)
applied to status: a state nobody computed is not a state, and the absence
of a claim must remain visibly different from a claim of emptiness. The
strongest instance is the graduation gate, which extends the rule inward:
per promise it checks, the verdicts are pass, fail, or *unmeasured* — never
pass-by-default — and it reports what fraction of its promises it could
actually execute. A gate that downgrades "I could not test this" into
"fine" manufactures the appearance of enforcement, which is worse than no
gate.

## The bookmark is not the progress

Two facts about a project sound alike and must be stored apart:

- **Where the creator is standing** — the phase to reopen on. A bookmark.
- **How far each phase has got** — the per-phase claims above.

They have different writers and different costs. The bookmark moves on
every navigation click, touches nothing else — not progress, not the
"last touched" timestamp the shelf sorts by — and is therefore cheap enough
to fire constantly. The claim moves only when a phase computed something,
*is* work, and does stamp the timestamp.

Both conflations fail. Treating browsing as progress makes the shelf lie —
looking at a project floats it to the top as if it were worked on. Refusing
to remember position for fear of that lie makes the creator re-walk the
phase rail on every re-entry to tell the product something it already knew.
The resolution is never a compromise between the two writes; it is two
fields.

## When not to use this

Worst-news-first is for *dependent* work. Over a portfolio of independent
projects, the worst project's state says nothing about the others, and a
shelf painted entirely red by one stuck project buries the signal — there,
group by state instead of merging into one. And keep the state vocabulary
small: every added state must change what the creator does next, or it is
taxonomy, not navigation.
