---
layer: technique
type: technique
subject: stream-moment-capture
technique: host-emitted-moment-markers
status: forged
laws: []
shared_with: []
use_when: [letting a live host flag clip-worthy moments as they happen, adding a mark-moment action to a generated host's action vocabulary, deciding how much a host's own mark should count toward a clip]
---

# Host-emitted moment markers

The host is the only participant in a stream who knows, at the instant of delivery, that a
line was meant to land. A **moment marker** captures that knowledge as data: a structured
action the host emits alongside its output, carrying a timestamp on the show's own clock
and a short label naming what the moment was. A human host emits one with a hotkey; a
generated host emits one as an action in the same structured channel as its other stage
actions. Either way the marker is the cheapest high-precision signal capture has, because
it costs nothing to compute and it carries intent that no crowd or audio signal can
recover.

## What a marker carries

A marker is small on purpose. It carries the **emission time** on the show's clock, not
the time the stream reached viewers, so that downstream windowing can apply a known offset
instead of guessing one; a **label** of a few words in the host's own terms ("the
betrayal reveal", "roasted the tax question"), which later becomes the editor's first
read of the moment and the seed of the caption; and the **context** the host was in: the
segment, the beat, the viewer being addressed if any. Where the show has recurring beats
that reliably produce clips, a small vocabulary of moment **kinds** beside the free label
(a reveal, a roast, a decision landing) lets the scorer and the windowing treat each kind by
its own defaults. When the broadcast runs behind a fixed safety delay, the emission clock
and the viewer's clock differ by that delay; record it once per stream so every marker can
be mapped onto the recording exactly. It does not carry a duration. The
host knows a moment happened; it does not know where the setup started, and a marker
that tried to say so would be guessing about the past from inside the present.

## Procedure

1. **Put the marker in the host's action vocabulary, not in its prose.** A generated
   host that writes "clip that!" into its speech has made a line, not a marker; a parser
   that scrapes speech for it will both miss real marks and fire on quoted ones. The
   marker is a typed action with its own validation.
2. **Validate it like any stage action.** The label is required, non-empty and short;
   an over-length or empty label is rejected with a reason, not truncated silently. A
   marker emitted outside a live segment is rejected.
3. **Bound the rate.** A cooldown between markers, and a per-segment ceiling, keep the
   signal scarce enough to mean something. A generated host left unbounded marks its own
   lines at a rate that turns the marker into noise; a human host under pressure does the
   same.
4. **Surface it immediately.** The operator sees each marker the moment it fires, as a
   visible stage event with its label. A mark the operator can see is a mark the operator
   can dispute while the context is still fresh.
5. **Log it as evidence, not as a verdict.** The marker joins the other signals in the
   scorer. It raises a moment's score; it does not publish anything.

## The two biases, and what to do about them

**Self-regard.** The host marks what it thinks is good, and hosts, human and generated
alike, systematically overrate their own set-pieces and underrate the accidental moments
that a room actually loves. This is why the marker is one weighted input rather than the
whole scorer, and why a high crowd-and-audio moment with no marker still surfaces as a
candidate. Track the marker's hit rate, the share of marked moments an editor keeps, and
let that rate, not intuition, set its weight.

**Steerability.** A marker is an action, and a viewer can ask for actions. "Clip this!"
from chat is a request to create a public artifact of the current moment, and the
requester is often the subject of it or wants someone else to be. The host may honour the
spirit (a moment the room plainly loved deserves a mark) but a chat request is never the
cause of the mark on its own, and a mark made at a viewer's request is labelled as such so
that the publish gate can weigh it.

## Decision rules

- **When the host is generated**, the marker is an action in its structured output,
  validated, rate-bound and logged, because unvalidated free-text markers are both lossy
  and injectable.
- **When the host is human**, the marker is a single key with no label prompt mid-show;
  the label is added in review, because asking a live human to type breaks the moment the
  marker exists to catch.
- **When markers become frequent**, tighten the cooldown before lowering the weight, because
  a scarce marker carries information and a cheap one does not, whatever its weight.
- **When a marker and the other signals disagree**, surface the moment for review rather
  than resolving it in the scorer, because the disagreement is itself the most useful
  thing an editor can see.

## When not to use

A stream with no host decision in the loop, such as an unattended feed or a camera on an
event, has no one to emit a marker; capture there runs on crowd, audio and transcript
signals alone, and the scorer redistributes the marker's weight explicitly rather than
treating its absence as a zero. And a marker is the wrong instrument for safety: a moment
that must not travel is excluded by the publish gate, not by the host remembering not to
mark it.
