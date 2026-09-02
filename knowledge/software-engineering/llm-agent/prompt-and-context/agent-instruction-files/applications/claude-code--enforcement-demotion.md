---
layer: application
type: application
subject: agent-instruction-files
technique: enforcement-demotion
stack: claude-code
status: forged
verified_on: 2026-09-02
verified_against: claude-code@2.1
---

# A hook that fires on every prompt and decides nothing (Claudeception)

The realization is the activation hook of Claudeception, a Claude Code skill
for extracting reusable skills from a work session. The skill's own trigger is
a judgment call — *did the task just completed require non-obvious
investigation?* — and the tree's history records that description matching
under-fired for it: the 2026-01-17 commit "Add activation hook for reliable
skill triggering" states that the hook "achieves higher activation rates than
semantic matching alone", with no number on either side.

## What the hook is

`scripts/claudeception-activator.sh` is a `UserPromptSubmit` hook whose body is
a single `cat` of a 176-word banner: "MANDATORY SKILL EVALUATION REQUIRED ...
EVALUATION PROTOCOL (NON-NEGOTIABLE) ... This is NOT optional." The harness
appends a `UserPromptSubmit` hook's standard output to the model's context, so
the banner is delivered as prose on every prompt of every session the hook is
installed in. The script reads no input, inspects no artifact, and has one
exit path. It is a floor line with a per-turn multiplier, registered in the
hooks block where the owner expects gates.

## Where the tree confirms the technique

The technique's sort asks whether a program could decide compliance. Here the
tree answers *no* twice over, in its own words: the banner tells the model to
"ask yourself" three questions and says the skill "will decide whether to
actually create a new skill based on its quality criteria". Both decisions are
the model's. The hook is therefore on the prose branch of the sort, and the
only thing the hook channel adds over the instruction file is cadence: the
same sentence, every turn, unreviewed by the file's admission test because it
does not live in the file.

The README's own install instructions make the aggregate cost visible: the
recommended installation is user-level, so the banner is paid on every prompt
of every project on the machine, including the ones with no skills directory.

## What the tree cannot show

The realization does not measure activation. There is no fixture, no replay
and no before/after count anywhere in the tree; the claim that the hook raises
activation is asserted in a commit message. The measurable the technique
names — compliance with the prose rule, with and without per-turn redelivery
— is exactly the number the source never took, and it is the return condition
for the amendment this application supports: a controlled comparison of
per-session against per-prompt delivery of one judgment-call line.

Two later commits show the writer's own sort moving the other way: the
2026-01-17 "safer tools" change removed `Bash` from the skill's tool list, so a
skill that writes skills cannot also install hooks or run what it wrote. That
is a capability decision made mechanically, which is where the technique says
such rules belong.
