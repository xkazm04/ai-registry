---
layer: technique
type: technique
subject: stream-moment-capture
technique: evidence-gated-clip-publish
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [deciding whether a clip cut from a stream may publish, designing the checks a clip pipeline runs before posting, handling a clip that involves a viewer, a real person or a sensitive moment]
---

# Evidence-gated clip publish

A clip is a claim about what happened on the stream, made to people who were not there.
Cutting removes context, and a real excerpt without the line before it can say the
opposite of what the stream said. A live show also produces moments that must never
travel however well they score. The technique puts a **gate between the scorer and the
public**: each clip and its caption are checked together against the full transcript
around the cut, a fixed set of moment kinds is excluded outright, and any check that
could not run holds the clip rather than passing it.

## Why the show's gate must be stricter than the platform's

The most common misleading edit is not synthetic. It is a genuine excerpt that omits the
question it answered, the irony it was delivered in, or the refusal that followed. Platform
rules on such edits have historically been narrower and less consistently enforced than
rules on synthetic media, and a clip that passes a platform's policy can still misstate the
stream. A show that publishes its own clips is the party with the transcript; it is the
only party able to check, so it is the party that must.

## The checks

Run them in order; the first failure holds the clip.

1. **Exclusions.** The clip contains none of: a viewer's disclosure of distress or the
   host's reply to one; a viewer's personal details, or a handle the viewer did not
   expect to see outside the room; a refusal that repeats or displays the bait it refused;
   content that was dropped by moderation; a claim about a real person that the stream
   could not support; a reply in which the host performed any part of a request that
   moderation had tagged as an injection. These hold regardless of score, marker or
   operator enthusiasm, and on every kind of segment, not only the ones that make claims.
   The check reads the **stream's state**, not just the cut: a viewer who disclosed
   distress minutes before the window is still under care inside it, and a roast of that
   viewer carries none of the disclosure in its own seconds.
2. **Context fidelity.** Read the transcript from the start of the setup's context, not
   the start of the cut, to past its end. The cut may not reverse, sharpen or strip the
   qualification from what was said in context: a line delivered as a joke stays legible
   as a joke, a quoted view is not presented as the host's, an answer keeps its question.
3. **Caption support.** Every assertion in the title, caption and any on-screen text is
   supported by what the cut itself shows. A caption may describe; it may not claim more
   certainty, more causality or more consequence than the cut carries. Captions are
   written from the transcript and drawn as text, never generated as pixels; when the host
   is generated, the transcript is its emitted script aligned to the audio, not a speech
   recogniser's reconstruction of it. A clip that carries a factual claim shows the
   claim's evidence grade and source in the picture, and does not publish while a
   correction against that claim is open.
4. **Disclosure.** A clip of a generated host, or of generated material, carries the
   disclosure the publishing surface requires, applied by the pipeline rather than left to
   whoever posts.
5. **Provenance.** The clip keeps its link back to the stream: the in-point, the
   out-point, the signals that carried it, the marker label if any.

## Holding is a state

Publication is a sequence of explicit states: drafted, awaiting the owner, approved,
published, or rejected. The transition to approved carries a person's signature; the
scorer can fill the drafted column, never the approved one. That keeps a human editor in
the selection, which also matters outside the show: an unattended pipeline posting a
ranking function's top picks is the shape that platform rules against mass-produced,
repetitive content are written to catch.

A clip that fails a check is **held with its reason**, never deleted and never silently
dropped. A check that could not run, because the transcript for the window is missing or
the classifier for an exclusion was unavailable, is a hold marked unmeasured, not a pass.
The gate reports, per stream, how many clips were held, by which check, and what share of
its promise it actually checked; a gate that holds nothing on every night is either
working on a very clean show or not running, and the report has to be able to tell the two
apart.

## Decision rules

- **When a moment involves a viewer by name**, publish without the handle unless the
  viewer has opted into being clipped, because the room's familiarity does not extend to
  strangers.
- **When the funniest version of a clip requires cutting the qualifying line**, publish
  the longer version or nothing, because the shorter one is the misleading edit this gate
  exists to stop.
- **When a check cannot run**, hold the clip as unmeasured and alert, because a gate that
  passes what it could not check is a gate in name only.
- **When the operator wants to override a hold**, require a recorded reason and keep the
  original hold reason beside it, because an override with no trail teaches nothing.
- **When the pipeline is new**, put a human approver on every clip until the gate's held and
  passed decisions have been audited against that person's calls, because the gate's
  exclusions are only as good as the evidence that they fire.

## When not to use

The gate governs clips that leave the room. An operator's private review reel, or an
internal digest that never publishes, needs provenance but not the full check. And the gate
never improves a clip: re-cutting for context, re-captioning or re-authoring a held moment
is upstream work, after which the clip comes through the gate again from the first check.
