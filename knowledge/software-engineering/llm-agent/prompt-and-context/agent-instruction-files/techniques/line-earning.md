---
layer: technique
type: technique
subject: agent-instruction-files
technique: line-earning
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [deciding whether a rule belongs in the always-loaded instruction file, an instruction file has grown past the point where agents follow it, reviewing a machine-generated repo overview before committing it, an agent keeps repeating a mistake the file was supposed to prevent]
---

# Line earning

Every line in an agent instruction file is loaded into every session — the
ones that touch what the line governs and the thousands that do not. The
line's price is therefore not its tokens; it is its tokens **times every
future session**, plus the measured dilution tax: compliance with the whole
file falls as the file grows, roughly uniformly across lines. A line does
not merely cost its own weight — it makes every other line slightly less
followed. Admission must be earned.

## The admission test

A line earns its place by passing both halves:

1. **Unreachable.** The agent, with the tools it already has, could not
   have derived the content — or would derive it wrong. The tree is
   reachable (it can list). The code is reachable (it can grep). The
   README is reachable (it reads it when relevant). What is unreachable:
   the command whose obvious form is subtly wrong, the convention visible
   only across many call sites, the decision with its rejected
   alternative, the constraint recorded in no file, the gotcha whose
   discovery costs a broken afternoon. This is
   [context-reachability](../../prompt-assembly/techniques/context-reachability.md)
   applied to a file the author cannot size per-task: because the floor
   cannot flex, reachable material is not "safe to include" — it is
   never admitted.
2. **Behavior-changing.** Removing the line would cause an agent to act
   differently, and worse. A line whose removal changes nothing is dead
   weight still charging the dilution tax. The honest way to know is the
   line's origin story: a rule added because an agent actually erred —
   ideally twice, once is noise — states the correction to a failure that
   happened. A rule added because it *might* help was speculation at
   admission and is unfalsifiable ever after.

The measured field record backs the test from both sides: developer-written
files (which skew unreachable — commands, gotchas, house rules) bought
large efficiency gains; machine-generated repo overviews (reachable by
construction — they were generated *from* the reachable repo) bought
nothing and slightly hurt. The overview pre-caches the agent's first five
minutes at the price of every session's attention.

## What passes, what does not

Passes: commands with non-obvious flags or ordering; the verification an
agent must run before claiming done; conventions enforced nowhere but
convention; deliberate exclusions ("we rejected X, use Y — do not invent
Z"); cross-cutting invariants no single file shows; coordination protocol
for shared checkouts; where the docs live and which are authoritative.

Fails: the directory tree; per-file descriptions; anything a linter or
type system already enforces (see
[enforcement-demotion](./enforcement-demotion.md) — at most name the
gate); standard-practice platitudes ("write tests", "keep functions
small"); API documentation; anything that changes weekly (it will be
stale before it is read — link it instead); narrative onboarding prose
aimed at humans.

## Counts carry their predicate

Instruction files attract numbers — "9 test specs", "201 rules", "zero
files over the cap". A number that travels into the trusted layer without
its measurement predicate will be wrong soon and confidently cited forever
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
Either the line carries how and when the number was measured — which makes
drift detectable — or the number stays out and the line states the
invariant that some gate actually maintains.

## Pruning is admission's other half

The test is re-run, not run once. A rule whose failure mode no longer
exists (the fragile module was deleted, the gate now catches it, the
framework fixed it) is removed the day that is noticed — not kept as
harmless residue, because residue is what the dilution tax is levied on.
The cheapest moment to prune is when a rule is added: the file that grows
by one line and shrinks by one elsewhere holds its compliance level
instead of spending it.
