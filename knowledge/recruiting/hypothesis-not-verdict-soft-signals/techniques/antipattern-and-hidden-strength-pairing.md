---
layer: technique
type: technique
subject: hypothesis-not-verdict-soft-signals
technique: antipattern-and-hidden-strength-pairing
status: forged
laws: [inference-must-look-like-inference, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [adding a behavioural detector to a screening surface, designing the panel a recruiter sees under a fit score, reviewing a flag list that reads as a case against someone]
---

# Antipattern and hidden-strength pairing

A detector built to find concerns finds concerns. Ship six of them and you have
built a machine whose only possible output about a human being is a list of
worries. Nothing in it is false; the artifact as a whole is still a
misrepresentation, because the reader receives it as the system's considered view
of the person and the system was only ever looking one way.

Pairing is the structural correction: **every adverse detector is built together
with a favourable detector over the same underlying property, and both render in
one place at equal visual weight.** Not as a courtesy to candidates — as the
honest expression of the fact that the underlying observation is genuinely
two-sided, which is precisely why it is a hypothesis and not a verdict.

## The pairs that recur

The same measured property, read in both directions:

| Underlying observation | Read adverse | Read favourable |
| --- | --- | --- |
| Short average tenure across several roles | instability, unfinished work | breadth of context, fast adaptation, deliberate acceleration |
| Long tenure in one place | narrowness, one-environment habits | depth, ownership of consequences, institutional trust |
| Many claimed capabilities, few evidenced | overclaiming | genuine range, poor self-presentation |
| Achievements stated without quantities | vagueness | worked where numbers are confidential or the culture does not quantify |
| Titles rising faster than scope described | inflation | early responsibility, small-organisation compression |
| A capability last practised some years ago | staleness | it was deep enough to still be claimed |

The right-hand column is not spin. Each entry is a real alternative world that
produces the identical document, and the reader has no way to tell which world
they are in — that is
[inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference)
made concrete at the level of a single observation.

## Procedure

1. **Write the detector against the property, not against the concern.** Compute
   "average tenure across the last N roles" once. Adverse and favourable readings
   are two labels over that one number, which also guarantees they cannot disagree
   about the fact.
2. **Emit at most one signal per underlying observation.** Both readings live in
   the same record — the label, the number, the alternative, the probe — so the
   surface can never show the same fact twice on opposite sides of a ledger and
   let a reader count it as two.
3. **Make the strength as falsifiable as the risk.** A hidden strength that no
   probe could check ("seems adaptable") is padding. If the favourable reading is
   real, the same probe that would confirm the risk confirms it — one question,
   two possible worlds.
4. **Detect strengths that have no adverse twin, too.** Some are one-directional
   and worth surfacing on their own: a described outcome carrying a real quantity,
   a capability demonstrated in an artifact rather than asserted, a trajectory of
   growing scope inside one employer. These are what stop the favourable column
   from looking like an apology for the adverse one.
5. **Cap both sides.** A checklist of three concerns and three strengths is read.
   A list of eleven and eleven is skimmed, and skimming favours whichever side is
   rendered louder.
6. **Test the pair together.** The contract a test pins is not "fires on short
   tenure" — it is "fires once, carries the number, carries the alternative,
   carries a probe, and does not fire when the number is unremarkable".

## Decision rules

- **When a proposed detector has no plausible favourable reading of the same
  observation, treat that as evidence it is measuring character, not shape** —
  and delete it. Genuine document-shape observations are almost always ambiguous;
  unambiguously damning ones are usually inferences about a person that skipped
  the line.
- **When the favourable reading is the more likely one given the role, order it
  first.** For a role that rewards breadth, varied short roles lead with breadth.
  Ordering is part of the claim, and defaulting to adverse-first is a thumb on the
  scale.
- **When only one side of a pair can be computed reliably, ship neither.** A
  surface with reliable risks and unreliable strengths is worse than a surface
  with neither, because its asymmetry is invisible to the reader.
- **When the two readings imply different probes, the signal is really two
  signals** — split it, and give each its own question.
- **When an aggregate view rolls signals up, roll both sides up.** A count of
  concerns with no count of strengths reintroduces the dossier at the summary
  layer, where most readers actually stop.

## When not to use it

- **On hard requirements.** A missing licence a jurisdiction requires is not a
  two-sided reading and must not be softened into one. Pairing belongs to
  hypotheses; regulated gates are elsewhere.
- **On authenticity findings.** An impossible timeline or a fabricated employer
  has no hidden strength, and manufacturing one is dishonest. That reading belongs
  to the adversarial-screening sibling, not here.
- **On anything derived from a protected characteristic or its proxies.** Pairing
  does not rehabilitate an illegitimate signal; a career break given a
  "resilience" counterweight is still a career break being scored.
- **Where the surface is a candidate-facing explanation.** Unconfirmed hypotheses,
  balanced or not, are not feedback. They are notes for a panel about what to ask,
  and uncertainty resolves toward the candidate by being asked, not by being
  published at them
  ([uncertainty-resolves-toward-the-candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
