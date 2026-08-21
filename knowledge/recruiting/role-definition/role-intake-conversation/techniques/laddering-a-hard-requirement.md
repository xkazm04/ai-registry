---
layer: technique
type: technique
subject: role-intake-conversation
technique: laddering-a-hard-requirement
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [a requestor states a hard requirement, a degree or years figure appears, a tool name is offered as a skill]
---

# Laddering a hard requirement

Requestors state requirements as **labels**: a degree, a number of years, a
tool name, a former employer, a title. A label is a compressed pointer to a
construct — a capability the requestor believes the label predicts. Laddering
is the disciplined move from the label to the construct: one climb, three
rungs at most, ending in something that can be evidenced.

The move matters because labels are where a role specification quietly
becomes indefensible. A label survives into the screening rubric as a filter,
into the search query as a hard clause, and into a rejection as a reason —
carrying, at every stop, the authority of a stated business requirement while
never having been asked to say what it predicts.
[meaning-does-not-live-in-a-label](../../../_laws.md#meaning-does-not-live-in-a-label)
is the whole justification: the display string is not the requirement, and a
process that keys off the string will filter on something nobody ever
decided.

The published evidence on degrees makes the point at scale: job postings
demand a degree at rates far above the rate at which people *currently doing
that work* hold one. That is not a hiring standard failing to be met; it is a
label that was never laddered, ratcheted forward by copying, sitting in front
of a pool it excludes for no articulated reason.

## The procedure

One climb, one requirement, at the moment it is stated. Record first, then
climb: a condition the requestor calls required, hard, non-negotiable or a
dealbreaker is written down as a requirement *the moment it is said*, before
the ladder runs and without waiting for it to justify itself against an
outcome. Laddering may afterwards demote it to a preference; it never
justifies having failed to record it. The climb:

1. **Name the label back, verbatim.** "Five years of distributed systems."
2. **Ask what it buys.** "What would someone with five years be able to do
   on day one that someone with two couldn't?" The question is deliberately
   about capability, not about the requestor's reasoning — asking "why do you
   want that?" invites justification and defensiveness; asking what it buys
   invites description.
3. **Ask for the situation.** "When would that show up? What's the first
   thing that would go wrong without it?" This produces the operating
   context, which is what the interview loop will later have to simulate.
4. **Convert to evidence.** "So what would I need to see in someone's history
   for you to believe they've got that?" This is the rung that matters most:
   it turns the construct into a *gradeable criterion*, and it is where a
   requirement earns its basis. A requirement stated without a basis is a
   claim about a person's fitness that cannot answer what it was computed
   over —
   [a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)
   applied one stage upstream of the scoring it will later drive.
5. **Read back the ladder and let them keep or drop the original label.**
   Often they drop it themselves — "honestly, five years isn't the thing, it's
   having been on-call for something they built." Never delete it for them;
   the drop must be theirs, out loud.

## Decision rules

- **Ladder every hard requirement exactly once.** Zero times is
  transcription. Twice on the same requirement reads as disbelief. Three
  times is an interrogation, and its reliable effect is that the requestor
  stops volunteering requirements at all — which looks like a shorter list
  and is actually a hidden one.
- **Ladder musts, not preferences.** A nice-to-have does not filter anyone,
  so the ladder buys nothing and costs a turn. If a preference turns out to
  be doing filtering work downstream, that is a must in disguise and should
  have been caught by the disqualification test first.
- **Stop the moment you reach something evidenceable.** The rung sequence is
  a maximum, not a target. "Has run a migration of this size before, and can
  describe what they'd do differently" is a landing; keep climbing past it
  and you are extracting philosophy, not requirements.
- **When the ladder terminates in a person, stop and reset.** "Someone like
  the last one" is not a construct, it is a portrait — and portraits import
  protected characteristics along with capabilities. Ask instead which
  specific things that person *did* mattered, and ladder those.
- **When the ladder terminates in "everyone asks for it" or "that's what the
  band requires", you have found sediment, not a requirement.** Say so
  plainly and put the disqualification test to them. This is the single most
  productive outcome laddering produces and the reason it is worth its turn
  cost.
- **Proxy labels get laddered first, whatever the order of the session.** A
  degree, a named employer, a language-fluency line, a continuous-employment
  expectation and a years figure all correlate with protected or
  circumstantial characteristics; each is a candidate for adverse impact
  downstream, and the only cheap moment to remove an unjustified one is
  before it is written down. Whether a laddered-and-kept proxy survives
  market and impact review is a downstream subject's job; getting it stated
  with its construct and its basis is this one's.

## Recording the outcome

A laddered requirement has four parts worth keeping distinct: the original
label, the construct beneath it, the evidence that would satisfy it, and
whether the requestor kept or dropped the label. Collapsing these into a
single line loses the thing laddering was for — when the requirement is
challenged three months later, the defensible answer is the construct and its
basis, not the label. How that structure is stored, graded and traced back to
the turn it came from belongs to the brief-as-artifact practice; the
conversation's obligation is to produce all four parts explicitly rather than
leaving three of them in the interviewer's head.

## When not to use it

- **On a genuinely regulated credential.** A licence a jurisdiction requires
  to perform the work is not a proxy and does not need its construct excavated;
  confirm the specific credential and the authority that mandates it and move
  on. Laddering it wastes a turn and reads as second-guessing the law.
- **When the requestor is already deep in an outcome narrative.** Interrupting
  a productive outcome answer to ladder a requirement they mentioned in
  passing breaks the more valuable thread. Note the label and ladder it when
  the thread ends.
- **In the first two turns.** Laddering before any scene or outcome exists
  gives the construct nothing to attach to, and it puts the session into a
  requirements frame at exactly the moment the ordering rule says it must not
  be.
- **On a requirement the requestor has already justified in construct terms.**
  If they said "I need someone who's carried a pager for a system they built,
  because our on-call is thin", the ladder is already climbed. Confirm the
  evidence rung and stop.
