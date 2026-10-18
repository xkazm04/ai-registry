---
layer: technique
type: technique
subject: live-chat-moderation-and-anti-bait
technique: path-independent-output-gate
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [placing the output check for a live host, adding a new path that produces spoken or on-screen text, a persona that leaked its own instructions or internal markup on air]
---

# Path-independent output gate

One screening gate sits at the last door before broadcast, and every path that can
produce host speech or on-screen text passes through it. The gate does not know which
character is playing, which tone is active or which code path made the line. It strips
what must never leak, blocks what must never be said, and substitutes on a block.

## Why the gate sits at the door, not on the path

Moderation that lives inside the chat-reply path protects the chat-reply path. Live
hosts speak from many more places: segment narration, scripted interstitials, vote
announcements, greetings generated in advance, fallback lines when a model call
times out, captions, recap text, and whatever the next feature adds. Each was built by
someone thinking about its own job. A filter attached per path is a filter some path
forgot, and the forgotten path is where the bait goes, because a baiter does not need
to know your architecture, only to find the one way to make the host speak that nobody
screened. Outages find it for them: the fallback model switched in when the primary
times out is, historically, the path that reaches air unfiltered, because it was built
in a hurry for availability and nobody thought of it as a speaking path.
**Moderation must be path-independent**: placed where all paths converge, so
a new path is gated by default and opting out takes a deliberate change someone can
review.

## What the gate does

1. **Persona-leak stripping.** The host must never speak its own scaffolding: section
   names of its prompt, tag classes, stage directions, internal markers, chain of
   thought, the text of its rules. These are matched structurally — the show knows its
   own markers exactly — and stripped before anything else runs. A line that is mostly
   scaffolding is blocked, not trimmed into nonsense. Leak patterns carry exemptions for
   the fiction's own vocabulary: a world with tokens, ledgers, engines or a dispatch from
   on high will trip a naive "talks about its model" pattern constantly, and a gate that
   replaces in-world lines is over-refusing the show. And a leaking line that also said,
   honestly, that the host is an AI is replaced by an in-voice disclosure, not a
   deflection, so the stripper never deletes the one admission the host is obliged to
   make.
2. **Red-line screening.** The utterance is normalised the same way chat is and matched
   against the show's red lines: slurs, private data shapes, real-person targets, the
   tagged payloads the host was never supposed to hold. The window includes recent
   output so assembly across lines is caught.
3. **Substitute on a block.** A blocked line is replaced by a pre-written in-voice
   deflection, deterministically, and the show continues. The gate never emits silence
   and never an error tone — a dead beat is itself a visible crack the room will try to
   widen.
4. **Record every decision.** Each block records path, rule and substitution, so
   coverage and false-positive rate are measurable per path.

## Persona independence

The gate is the same for every character and every tone. A red line that relaxes for
the villain persona is a red line with a costume bypass; "the character would say it"
is the oldest bait there is. Character-specific phrasing lives in the substitution
lines, which are authored per persona, never in the rules, which are not. A second
benefit: the gate can be tested once and trusted across a roster.

## Decision rules

- **When adding any path that produces broadcast text**, route it through the gate
  first and write the bypass, if one is ever needed, as an explicit, named exemption
  with a reason. An exemption list is short or it is wrong.
- **When the gate cannot run** (rules failed to load, a check errored), the line does not
  go out; the substitution does. A gate that is skipped and a gate that found nothing are
  opposite facts and must never share an outcome.
- **When reporting moderation health**, report coverage — which paths and what fraction
  of broadcast lines the gate saw — beside the block rate. A path the gate never saw is
  unmeasured, never clean.
- **When the gate blocks a scripted, owner-authored line**, it still blocks. The fix is
  to edit the script, not to exempt authored text, because authored text interpolates
  viewer names and vote results.

## When not to use it

The gate is the last fence, not the only one. Do not move pre-filter work into it to
save a layer: a payload the host held is a payload the host may have partly obeyed in a
way no string match recognises, and the gate cannot unsay what it cannot see. Nor is
the gate a quality check — whether a line is funny or in voice belongs to evaluation,
not to the door.
