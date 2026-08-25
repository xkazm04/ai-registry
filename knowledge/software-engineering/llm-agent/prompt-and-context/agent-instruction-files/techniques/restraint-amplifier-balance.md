---
layer: technique
type: technique
subject: agent-instruction-files
technique: restraint-amplifier-balance
status: forged
laws: [silent-state-is-ungoverned]
shared_with: []
use_when: [reviewing an instruction file or rule set before it ships, an agent has become cautious and stopped volunteering anything, adding another prohibition to a file that is already mostly prohibitions, translating a list of complaints about agent behaviour into rules]
---

# Restraint–amplifier balance

Instruction files accrete from irritation. Each rule is minted the day an
agent did something wrong, so the file's natural composition is a list of
prohibitions — don't assume, don't over-build, don't touch what you were
not asked to touch. Every one of them earns its line under
[line-earning](./line-earning.md), and a file made only of them still
produces a worse agent: technically compliant, cautious, and silent. An
agent governed exclusively by restraints learns that the safe move is the
minimal one, and it stops volunteering — the trade-offs it would have
surfaced, the simpler approach it would have proposed, the adjacent defect
it would have mentioned. The restraints did not merely bound its output;
they taught it that initiative is risk.

The audit is one count: **how many of the file's rules prohibit, and how
many give the agent something to push toward?** If the answer is all-cage,
the file is missing its amplifier — and the loss is invisible in any diff,
because what a caged agent withholds never becomes an artifact
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned):
suppressed initiative is internal state, and no review will ever see it).

## What an amplifier is

An amplifier is a rule that directs capability rather than bounding it,
and the strongest known form is the declarative goal: give the agent
success criteria it can check itself, and let it iterate. That rule is
not a restraint loosened; it comes from the opposite observation — not
what these systems do badly, but what they do exceptionally well
(looping against a checkable target). Other amplifier shapes: *surface
the simpler alternative when you see one* (which converts the
initiative the restraints suppressed into sanctioned output), *mention
what you noticed but were not asked to fix* (observation is free;
unrequested modification is expensive — the rule licenses the noticing
while the sibling restraint bounds the acting), and *state your
assumptions before building* (which reads as a restraint but is an
amplifier for the agent's own uncertainty — it makes volunteering the
doubt legal).

## Decision rules

- **Count before adding.** Before a new prohibition enters the file, take
  the census. A file at five restraints and zero amplifiers does not need
  a sixth restraint as much as it needs its first amplifier — the next
  irritation may be the *caution* the existing five produced.
- **Pair the restraint with its licensed outlet.** "Don't fix what you
  were not asked to fix" ships beside "mention what you noticed". The
  pair keeps the observation flowing while stopping the unrequested
  diff; the restraint alone teaches the agent to stop looking.
- **Write the amplifier as a checkable target, not an exhortation.** "Be
  proactive" is mood; "when a simpler approach exists, say so before
  implementing" is behaviour a reviewer can verify happened or did not.
- **Diagnose the cage from the agent's silence.** The symptom of
  over-restraint is not disobedience but absence: no trade-offs offered,
  no alternatives raised, no questions before implementation. When a
  team reports the agent "got worse" after a rules pass, count the
  prohibitions added and the amplifiers added; the ratio usually is the
  diagnosis.

## Boundary

This technique governs the *composition* of the rule set; whether any
individual line belongs at all is [line-earning](./line-earning.md), and
whether it should be prose or a gate is
[enforcement-demotion](./enforcement-demotion.md). Amplifiers are
exactly the rules that can never demote to a gate — no linter can check
"you should have proposed the simpler design" — which is why a file
sorted aggressively by enforcement-demotion trends toward all-cage prose
plus gates, and needs this count run after every such pass.
