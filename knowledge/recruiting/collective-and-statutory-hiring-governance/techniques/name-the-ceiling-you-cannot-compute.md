---
layer: technique
type: technique
subject: collective-and-statutory-hiring-governance
technique: name-the-ceiling-you-cannot-compute
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [a statutory preference or quota applies to the appointment, writing guidance next to a ranking, deciding what to tell a user the tool cannot do]
---

# Name the ceiling you cannot compute

Every governed hiring mode contains at least one step the machine structurally
cannot perform. This technique says: find that step, state it in the artifact, and
give it an owner. Naming what the tool cannot do *is* the technique — it is not a
disclaimer bolted onto the technique.

The canonical case is a statutory preference. A veterans' preference, a
disability-quota placement, a reemployment or recall right, a residency or
local-hire preference, a seniority bid under a collective agreement: each can
reorder or short-circuit the entire ranking, and each depends on a status the
system **does not hold and must not infer**. Guessing veteran status from a
résumé's employment history is a proxy inference over a protected characteristic;
collecting it to "complete" the ranking creates an exposure where a gap used to
be. The honest position — and the useful one — is that the ordering is a fit
ranking and the statutory adjustment happens elsewhere, by a person, before
certification.

## Why the sentence is the most valuable output on the page

An interface that renders a clean, complete-looking ordering *teaches* its reader
that the ordering is complete. Nobody reads a policy manual against a confident
screen. The sentence converts an invisible gap into a named step with an owner
and a deadline — before certification, by a human, using records the system does
not have. That is actionable. A generic "results are advisory" banner is not,
because it names nothing.

It also changes what silence means. Where a system cannot see something it says
so; "could not determine" never renders as "no concern found"
([inference must look like inference](../../_laws.md#inference-must-look-like-inference)),
and an unapplied adjustment must not render as an applied one
([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

## Procedure

1. **Enumerate the ceilings per mode.** Write them down as part of the mode
   definition, not as UI copy. Typical ceilings: statutory preferences and
   quotas in a list mode; the vote, the quorum and the conflict-of-interest
   recusals in a committee mode; internal-bid and recall obligations that precede
   external consideration in a unionised process; anything the tool holds no data
   for.
2. **State three things in each sentence:** *what* must happen, *who* must do it,
   and *why the system cannot* — because it holds no such status and cannot
   compute it. Two of the three is not enough; without the reason, a reader
   assumes the feature is merely missing and waits for it.
3. **Place it in the artifact, adjacent to the ordering.** Not in a tooltip, not
   in documentation, not in an onboarding modal. It travels with the export and
   appears in the printed packet.
4. **Make it mode-specific.** Guidance that is identical across modes is read as
   boilerplate within a week. The list-mode sentence and the committee-mode
   sentence say different things because different steps are missing.
5. **Say only what the record supports.** Do not name a specific statute, a
   points formula or a jurisdiction the system was not configured with; do not
   assert which preferences apply. Name the *category* of step and hand it to the
   human who knows
   ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
6. **Keep the hole open.** The correct design is the absence of the field. A
   later request to "just capture veteran status so we can finish the ranking" is
   a request to convert a governance boundary into a data-protection liability;
   refuse it at the design level.

## Decision rules

- When the tool holds a status that a preference depends on **for another lawful
  purpose** (a self-disclosed accommodation need, say), it still may not feed the
  ranking. Held-for-one-purpose is not available-for-another, and a ranking that
  consumed it would be making the statutory adjustment without authority.
- When the mode is list-based, the ceiling sentence is mandatory output — the
  artifact does not render without it. Treat it like a required field, not a
  configurable notice.
- When guidance would be generic, delete it. A ceiling that cannot be stated
  specifically was not identified specifically, and vague hedging trains users to
  skip the specific sentence when it does appear.
- When a user marks the statutory step as done, record that as an attributed
  human action with a timestamp — a claim by a person, not a state of the
  ranking. The system still has not computed anything.

## When not to use it

Do not use ceiling statements as a general-purpose hedge. If the sentence
describes ordinary uncertainty in an estimate, it belongs to the confidence and
provenance machinery, not here. This technique is for steps that are
**structurally outside** the system: work it cannot do at any confidence, with
any model, on any data it lawfully holds. Diluting it with soft caveats destroys
exactly the signal that makes it work — that when this sentence appears, a real
step is genuinely outstanding.
