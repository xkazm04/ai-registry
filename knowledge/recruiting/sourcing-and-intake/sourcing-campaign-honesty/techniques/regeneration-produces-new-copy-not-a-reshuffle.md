---
layer: technique
type: technique
subject: sourcing-campaign-honesty
technique: regeneration-produces-new-copy-not-a-reshuffle
status: forged
laws: [say-only-what-the-record-holds]
shared_with: []
use_when: [a recruiter presses regenerate and gets the same sentences reordered, designing variation in a copy generator, worrying that repeated generation drifts into invention]
---

# Regeneration produces new copy, not a reshuffle

The concern: what happens on the second, third and fourth press of
*regenerate*. A fixed fact set supports a finite amount of genuinely different
copy. A generator that ignores this fails in one of two directions — it
reshuffles the same clauses and reads as broken, or it finds novelty by
inventing — and both failures push the recruiter back to writing by hand.

## Why regeneration is an honesty problem

It looks like a quality problem, which is why it is usually handled as one:
raise the sampling variability, ask for "a fresh take", or feed the previous
draft back with an instruction to differ. Each of those instructions is,
operationally, *find material this draft does not have* — and the only
material available beyond the fact set is invented material. The pressure is
strongest exactly when the fact set is thin, which is exactly when invention
is most damaging.

The recruiter's mental model makes it worse. They press regenerate because the
draft did not land, so each press carries an implicit "try harder". A system
that treats regeneration as an unbounded resource is promising something the
facts cannot pay for.

## Where legitimate variation comes from

Variation must be *structural and enumerable*, drawn from degrees of freedom
that exist independently of the facts:

- **A different hook.** A different provable angle on the same facts is a
  genuinely different campaign, and the taxonomy tells you how many are
  available for this record.
- **A different beat order.** Leading with the work rather than the place
  changes what the reader takes away.
- **A different register and length.** A short post and a long-form blurb from
  the same facts are different assets, not the same asset twice.
- **A different audience framing** — a career-changer versus a specialist —
  provided the framing changes emphasis among stated facts and does not add
  claims.

Multiply those and the space is real but bounded. A record with two available
hooks does not support ten distinct campaigns, and the honest system says so.

## Procedure

1. **Compute the variation budget from the fact set**, not from a retry
   counter: available hooks × defined beat orders × registers. This number is
   knowable before the first generation.
2. **Traverse the space rather than resampling it.** Each regeneration selects
   an unused combination, so successive drafts differ in a way the recruiter
   can see and name — not merely in wording.
3. **Do not feed the previous output back as material to differ from.** That
   instruction rewards novelty as such, and novelty as such is invention.
   Differ by moving in the enumerated space instead.
4. **When the space is exhausted, say so, and say why.** *These facts support
   three distinct campaigns; you have seen all three. Adding a pay fact or a
   team fact would unlock two more.* This is the same diagnostic surface as
   the missing-fact codes, arriving at the moment the recruiter is most
   motivated to act on it.
5. **Never let the exhaustion message become an apology that offers a fourth
   anyway.** The button either advances in a bounded space or is disabled with
   a reason.
6. **Keep the variation deterministic given the same selection**, so that a
   draft can be reproduced. A recruiter who liked the second version and lost
   it should be able to get it back; irreproducible copy also cannot be
   audited after a complaint.

## Decision rules

- **Regeneration may change the frame, never the facts.** The complete rule.
  Any variation mechanism that can alter what is asserted is a defect, however
  good the prose it produces.
- **Reshuffling is a symptom, not the disease.** Cosmetic reordering means the
  variation space was exhausted several presses ago and the system did not
  admit it. The fix is the exhaustion message, not more entropy.
- **Sampling variability is a wording knob, not a variation strategy.** Turning
  it up produces sentences that sound different and assert the same things,
  until it produces sentences that assert new things. There is no setting that
  gives the first without eventually giving the second.
- **Per [say only what the record
  holds](../../../_laws.md#say-only-what-the-record-holds), an unchanged record
  cannot yield a materially richer draft.** If draft four says more than draft
  one, the extra came from somewhere the record does not hold, and that is
  true no matter how plausible it reads.
- **Bound the count and log it.** Repeated regeneration is also a cost and a
  signal; a role that has been regenerated fifteen times is telling you its
  fact set is too thin, not that the generator is weak.

## When not to use it

- **Not when the facts actually changed.** A record edited between presses is
  a new fact set and resets the budget legitimately — indeed the point of the
  exhaustion message is to provoke exactly that.
- **Not for a human's editing loop.** A recruiter rewriting a draft themselves
  is authoring, not regenerating, and the budget does not apply to them.
- **Not as an argument for a single deterministic output.** One fixed draft per
  role is a different failure: it makes every campaign from the same template
  visibly identical across roles, which readers notice faster than they notice
  thin copy.
