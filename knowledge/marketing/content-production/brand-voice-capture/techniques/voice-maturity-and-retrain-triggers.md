---
layer: technique
type: technique
subject: brand-voice-capture
technique: voice-maturity-and-retrain-triggers
status: forged
laws: [label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [deciding whether a voice is trained enough to stop asking, building a readiness ribbon for a voice, deciding when to nudge a retrain and when not to]
---

# Voice maturity and retrain triggers

A trained voice has three states and a lifecycle, and each transition has a
predicate that is written down. Untrained: no directives, or directives too
short to count. Training: a profile exists and the distillation still has
open questions. Mature: enough material has been seen that a round may end
with no question at all. And after maturity, stale: the profile has fallen
behind facts banked since it was last distilled. The technique fixes the
predicates and, just as importantly, what they must *not* depend on.

## Maturity

The predicate is a count of material, not a judgement of quality: a voice is
mature when it has seen at least a handful of samples **or** the owner has
answered at least a few questions. Five samples or three answers is a common
convention; the numbers are practitioner habit and are labelled so. What is
structural is why the state must exist: a distillation that is forced to
return at least one question every round can never reach "fully trained", so
the training screen can never say "done", and an owner who has answered
everything is asked again. Maturity is the branch where an empty question
list is a valid end state rather than an error to repair.

Below maturity the validator requires at least one open question, because a
cold voice with none means the distiller fabricated instead of asking. Above
it, the validator relaxes that requirement and nothing else - the directives
floor still holds.

## Readiness is a function of what has been trained

A readiness score for a voice - typically one milestone among several: is the
business grounded in its catalogue, does a per-surface voice exist, is there
enough training material, are the red lines written down, is a channel
enabled, has a draft ever been approved - is a pure function of stored state.
Each milestone is complete, partial or empty; the score is the mean; the gaps
sort by a fixed foundation order because there is no point tuning red lines
before the model knows what the business sells.

Three details keep the score honest. A voice counts only if someone wrote
directives into it - an empty row created by opening the editor does not
tick the gate. A per-surface voice outranks a single generic register. And
when an input cannot be read - the catalogue count failed to load - the
milestone grounds to *partial*, never *empty*: unknown is not zero, and an
"unconfigured, redo setup" verdict on a transient read failure sends the
owner to fix something that is not broken.

## The retrain trigger

The trigger counts **facts banked after the voice was last distilled**, for
that voice's scope: answered questions, pasted samples, substantive edits. At
or above a margin - the same handful the maturity gate uses, by convention -
the surface says "retrain" beside the voice's age. Below it, nothing. Two
things the trigger deliberately is not:

- **Not a calendar.** A voice trained a year ago with no new facts is
  current; one trained last week with six corrections is stale. Age is shown
  as information ("trained three weeks ago"), and it is the newer-fact count
  that drives the nudge.
- **Not a penalty.** The readiness score does not read the clock and does not
  read the nudge. A business is never told its voice degraded because time
  passed; it is told, once, that there is material the voice has not seen.

An untrained voice never nudges - its call to action is "train it", a
different thing - and a seed timestamp older than any real training event is
read as "never trained", not as "trained decades ago".

## Decision rules

- When the material count clears the maturity threshold, allow a round with
  no open questions and mark the voice trained, because otherwise the state
  is unreachable.
- When a distillation returns no question below maturity, re-prompt, because
  a cold voice with no gaps was invented.
- When newer facts for a scope reach the margin, show the retrain nudge
  beside the age, because a voice behind its material is producing drafts the
  owner has already corrected.
- When a readiness input fails to load, grade it partial, because not
  measured is not zero.
- When a voice row has empty directives, count it as absent for every gate,
  because an editor draft is not a trained voice.

## When NOT to use

Do not gate maturity on a quality judgement of the samples - "are these
representative?" is the owner's call, made by reading the profile, not the
gate's. Do not retrain automatically when the trigger fires: a retrain
overwrites directives an owner may have hand-edited, and the nudge exists so
that a human chooses. And do not apply the margin across scopes - a stack of
review-reply corrections says nothing about the e-mail voice.
