---
layer: technique
type: technique
subject: live-safety-rails
technique: detector-biased-to-false-positive
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [tuning a crisis or sincerity detector for live chat, placing safety detection relative to rate caps, flood collapse and pick limits, deciding whether a borderline message should trigger the safety path]
---

# Detector biased to false positive

The detector that decides whether a chat message is safety-critical is tuned for recall,
not precision, and runs **before** every throughput control the show uses to keep a busy
room watchable. Both halves follow from the same asymmetry: a false positive costs one kind
line; a false negative costs a person in crisis being ignored or mocked on a broadcast.

## Tune for the error that cannot be recalled

Moderation detectors are usually tuned to keep false positives rare, because a filter that
fires on ordinary chat annoys the audience and flattens the show. That tuning is correct for
moderation and wrong here. A crisis detector that misses one disclosure in twenty to avoid
firing on a few dark jokes has chosen the wrong error.

The practical shape is an OR of two cheap signals rather than one clever one: a
deterministic lexicon of first-person crisis phrasing (including misspellings, spacing
tricks, common euphemisms and the platform's own slang) and a classifier pass. Either one
firing routes the message to the safety path. An AND, or a single classifier with a high
threshold, will be tuned toward precision the first time someone complains about a false
alarm, and the drift is invisible until a disclosure is missed.

Two refinements are easy to miss. First, the lexicon has a **built-in floor that no policy
file can turn off**. Per-platform or per-owner rule files are where phrasings get added,
and also where they get lost: a configured pattern that misses "thinking about hurting
myself" is exactly the kind of gap that only surfaces in a transcript. The built-in
first-person patterns stay on whatever source the rest of the policy came from, and a
configured rule can only add to them. Second, **direction decides the category**. The same
words are an incitement when aimed at someone else ("go hurt yourself") and a disclosure
when said of oneself ("I should just go die"). Moderation rightly blocks the first; if the
disclosure check runs after a blocking rule for the same topic, the blocking rule eats the
disclosure. Detect the disclosure first, and exempt it from blocking rules whose purpose is
incitement.

Classify into three outcomes, not two: **crisis** (first-person danger signals: hand off),
**sincere** (genuine sadness or distress without danger: soften, no help pointer) and
**neither**. A binary detector forces every sincere message to be either a crisis or a
joke, and both errors are visible on stream.

## Safety-critical input bypasses throughput controls

A live room drops most of what it says. Rate caps limit how often one viewer is answered,
flood handling collapses a wave of similar messages into one crowd voice, pick limits bound
how many messages a reply can address, attention-share caps stop one viewer dominating,
cooldowns stop the host returning to the same person. Every one of these is right for
ordinary chat and every one of them is a way to lose a crisis message, which is typically a
single, quiet, low-engagement line from a viewer who has already been answered recently.

So the order is fixed: **detect first, then throttle.** A message flagged crisis or
sincere:

- is exempt from the per-viewer rate cap and cooldown;
- is never merged into a crowd-voice summary of ordinary messages, and no ordinary message
  is merged into it;
- does not count against the pick limit or the one-pick-per-viewer rule, and is picked
  ahead of every other candidate;
- reaches the reply even if the host is mid-segment, mid-vote or mid-beat;
- runs through the safety path on every lane, the fast reactive one included.

The priority is enforced deterministically **after** any model-based picker, not entrusted
to it. A model asked to rank chat for entertainment value may simply leave the quiet line
out; the constraint step re-inserts every safety-critical candidate whether or not the
model listed it. One merge remains legitimate: exact duplicates of a safety-critical line
may collapse into each other, so a raid pasting one crisis-phrased line a hundred times
stays one answered pick instead of a hundred, and cannot be used to flood the host's
attention through the safety lane.

If the room is so busy that the detector itself is sampled rather than run on every
message, the detector is in the wrong place. Detection is cheap; it runs on all of it.

## Measure recall, and report what is unmeasured

A detector tuned for recall has to have its recall measured, and the measurement needs a
bank of positive cases that look like real chat: oblique phrasing, typos, mixed languages,
messages buried in a flood, disclosures that arrive after the viewer has been roasted, and
near-misses on the other side (quoting a film, dark humour about the host's fiction) so the
false-positive cost is known rather than guessed. A detector whose recall has never been
measured on oblique phrasing has an unmeasured recall, and it reports that, not a pass.
Languages the lexicon does not cover are unmeasured too, and say so.

## Decision rules

- **When the lexicon and the classifier disagree**, route to the safety path. Disagreement
  is the borderline, and the borderline is where the bias applies.
- **When a flagged message also carries an injection or bait tag**, treat it as safety-
  critical anyway, withholding the injected payload from the model but passing the fact of
  the distress. A viewer can be manipulative and in danger in the same message; the kind
  line costs nothing if they were only testing.
- **When false positives become a real complaint**, fix them by improving the sincerity
  classes and the near-miss bank, never by raising the crisis threshold.

## When not to use it

The bias is for the safety classes only. Applying recall-first tuning to ordinary
moderation categories turns the show into a stream of refusals. Keep the two detectors, and
their thresholds, separate.
