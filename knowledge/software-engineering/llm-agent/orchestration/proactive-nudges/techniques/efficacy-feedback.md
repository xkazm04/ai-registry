---
layer: technique
type: technique
subject: proactive-nudges
technique: efficacy-feedback
status: forged
laws:
  - count-carries-predicate
  - deletion-is-not-repair
shared_with: []
use_when: [reading what users did with each delivered nudge, a kind keeps firing while nobody acts on it, deciding whether an ignored kind may get louder]
---

# Efficacy feedback

The loop that makes a proactive system converge instead of merely being
capped: record what the user did with each delivered nudge, aggregate per
kind, and let the aggregate move that kind's allowance. Without it the
policy layer is static rationing — fair, but incapable of learning that
half its ration is being spent on messages nobody wants.

## Outcomes: a small closed set

Every delivered nudge resolves to exactly one outcome:

- **acted** — the user followed the nudge's affordance (opened the
  subject, ran the suggested step, clicked through). The strongest
  positive signal and the only one worth optimizing for. It records
  engagement, not completion: a click-through says the user looked, not
  that the step was finished or the suggestion was right. Where
  completion is observable (the review was submitted), record it
  separately rather than reading it into the click.
- **dismissed** — the user explicitly waved it away. A weak negative:
  "not now" or "not this," deliberately ambiguous, and the record keeps
  it ambiguous rather than guessing.
- **ignored** — the nudge was **exposed** (actually shown to the user)
  and aged out with no interaction. The quiet majority outcome and,
  sustained, the strongest negative signal: the user does not consider
  this kind worth even the dismissal gesture.
- **unobserved** — the nudge was delivered but there is no evidence it
  was ever shown (the app was closed, the device asleep, the surface
  never rendered), and it aged out. It says nothing about the user's
  preferences and **never moves a cap**, in either direction. Where
  exposure cannot be stamped, this state cannot be separated from
  ignored; say so beside the aggregate rather than counting every
  aged-out delivery as a vote.
- **expired-undelivered** is *not* an outcome of this loop — it never
  reached the user and says nothing about their preferences; it feeds cap
  and queue tuning instead. Mixing the two poisons the efficacy read.

**Make "ignored" derivable, not implied.** An aggregate that reads only
acted and dismissed cannot see a kind nobody touches: its total never reaches
the sample floor and its allowance never moves, so the strongest negative vote
is the one the loop drops. If a shared terminal status (`expired`) covers both
aged-out-after-delivery and never-delivered, discriminate on the delivery stamp
and count only the first. Better still, stamp *exposure* (the card was actually
shown), so that ignored means seen-and-untouched and a card delivered into a
closed app costs its kind nothing.

Attribution requires the delivered record to carry the nudge identity and
kind for the whole efficacy window; the outcome table is a join on identity. Aggregates are
reported with their predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"maintenance-due: 2 acted / 1 dismissed / 9 ignored over 30 days" — never
a bare score whose window and denominator are folklore.

## Adaptation: down on ignore, never up on urgency

The core asymmetry:

> **Sustained non-action lowers a kind's budget toward a floor. Nothing
> but explicit positive acts raises a kind's volume — recovery is earned,
> in bounded steps, by the acted-rate of the few deliveries the floor
> still allows, and urgency or being ignored never raises it.**

- Adaptation moves **per-kind caps only**, within the global ceiling; the
  user's total contact never rises because one kind performs well.

- **The upward path gets the same discipline as the downward one, or it should
  not exist.** Recovery is named above and then left unmodelled, while decay gets
  a window, a floor, hysteresis and coarse steps — and an unbounded recovery
  clause is how "nothing raises a kind's volume" ends up read as forbidding the
  wrong thing. State the bound. A cap may rise only in response to an **explicit
  positive act**, never to the absence of one; by one step at a time; on a sample
  large enough that the acted-rate means something, over the same rolling window
  the decay side uses; to a ceiling a small fixed distance above the kind's base
  allowance; and always beneath an unchanged global ceiling, so what moves is the
  mix and never the total. Escalation on ignore stays forbidden exactly as
  before — ignoring is the vote, and volume is not an answer to a vote.
- The response is slow and hysteretic: a rolling window long enough to
  see through vacations, a floor above zero (so the kind can still earn
  its way back), and movement in coarse steps. A twitchy budget teaches
  users that the system's behavior is weather.
- The floor exists because ignore-driven decay to zero is a silent
  self-kill: the kind vanishes, nobody decided that, and the record shows
  only a budget that drifted. Going to zero is reserved for a human
  decision, recorded as one: the user's kill switch, or an explicit zero
  allowance an operator or user sets for a kind (a kind shipped dark, a
  kind paused pending redesign). An explicit zero is a declared
  configuration, distinct from decay, and the adaptation layer never
  raises it.
- Escalation on ignore — louder, earlier, more often — is the
  anti-pattern this technique exists to forbid. Ignoring *is* the vote.
  The legitimate response to "important kind, ignored anyway" is
  re-designing the nudge's content or affordance, not amplifying its
  delivery.

## The kill switch

- Per-kind opt-out, reachable **from the nudge itself** ("stop telling me
  this") — the moment of irritation is the moment the control must be in
  reach; a buried settings page converts irritation into channel-level
  revocation instead.
- Effective immediately: the kind admits nothing to the delivery queue
  from that moment, and its already-queued and deferred notices are
  cancelled in the same act, not left to drain. The evaluator may still
  run (its signal can feed passive surfaces). Killed is a state the
  operator can list; reverting it is the user's act, because it is a
  withdrawal of consent, and no efficacy data re-enables it.
- A killed kind is the policy *succeeding*. The temptation to treat high
  kill rates as a reason to remove the switch — or to reword the kind
  and relaunch it under a new name, resetting its record — is
  [deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) in
  reverse: laundering the defect's visibility instead of fixing the
  kind. A relaunched kind inherits its predecessor's record.

## Decision rules

- Instrument outcomes from the first shipped nudge. Retrofitted efficacy
  starts its window at retrofit time, and the noisiest kinds are
  precisely the ones whose history is then missing.
- Never infer "acted" from ambient behavior ("they opened that screen an
  hour later"); attribution is through the nudge's own affordance or not
  at all. Optimistic attribution inflates exactly the kinds that deserve
  cutting.
- Review the per-kind table on a cadence with a human in the loop. The
  automatic layer bounds damage between reviews; it does not replace the
  product judgment of whether a kind should exist.
