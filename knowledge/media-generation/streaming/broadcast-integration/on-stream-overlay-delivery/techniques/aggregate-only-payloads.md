---
layer: technique
type: technique
subject: on-stream-overlay-delivery
technique: aggregate-only-payloads
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [designing the message an overlay page receives, an overlay that shows a vote or a count, reviewing a payload for fields the page never draws]
---

# Aggregate-only payloads

An overlay page receives shares, counts and states — the numbers it draws — and never the
records those numbers were computed from. The message type is closed: every field is
something the page renders, every string and list has a hard bound, and nothing about an
individual viewer crosses unless a consent act put it there.

## The naive payload and why it fails

The quick build sends the overlay whatever the tool already has in memory: the list of
ballots, the entrants with their names and weights, the last fifty chat messages, and lets
the page compute the bar. It works, and it publishes all of it. The page's data is visible
in the developer tools of any ordinary browser that opens the same address; it is held by
whoever was sent that address; and an injection on the page reads it all. A vote overlay
that receives ballots has published who voted for what, which is precisely the
information a secret-ish room vote was meant to protect.

There is a second failure that has nothing to do with privacy. A page that computes its
own aggregate from raw records is a second counter, and two counters disagree — on
deduplication, on a late ballot, on a tie-break. The tool says one thing and the stream
shows another. The count belongs to one authority, and the page draws that authority's
answer.

## Procedure

1. **Start from the drawing.** List every element the overlay renders. Each becomes a
   field: a share per option, a total, a phase, a remaining time, a provenance flag.
   Nothing else is a field.
2. **Keep viewer-authored text out, including labels.** The option names of a chat vote
   are often typed by viewers or derived from their messages. A label is text, and text on
   the broadcast is a moderation question; the cheapest safe vote bar draws numbered
   options ("Direction 1 · 42%") and lets the streamer say aloud what each one is. Send a
   label only when the streamer authored it.
3. **Compute the aggregate where the records live, over a fixed projection.** The tool
   reduces ballots to shares, entrants to a count, contributions to an intensity, and
   sends only the reduction. The query behind the on-stream aggregate is fixed — one
   window, one filter — and independent of whatever the streamer is currently filtering
   or replaying on their own screen. An operator narrowing their view to inspect one
   slice of chat must not change what the audience sees.
4. **Bound everything.** Strings have a maximum length, option lists a maximum count,
   numeric fields a declared range. A payload that violates a bound is rejected on the
   producing side, before it is sent, rather than truncated on the page. Bounds keep a
   runaway producer from pushing an unbounded message into a live render loop, and they
   make the schema reviewable.
5. **Send shares the stream can stand behind.** When the aggregate rests on few inputs,
   say so in the payload (a total, or an explicit low-sample state) so the page can show
   "3 votes" rather than a confident 67/33 bar. A bar's precision is a claim.
6. **Carry provenance.** When the aggregate was computed from simulated or rehearsal
   input, the snapshot says so and the page draws a visible marker. A rehearsal number
   without its label is a fabricated number on air.
7. **Version the type.** The page and the server agree on a schema version; an unknown
   version is a cleared overlay, not a guessed rendering.

## Decision rules

- **When a field is wanted "for debugging"**, it goes to the tool's own log, never the
  overlay feed.
- **When a design calls for showing individuals** — a winner, a top contributor — the
  individual is a separate field licensed by the viewer's own act whose stated consequence
  was appearing on stream (entered a draw that announces winners; sent a contribution
  through a flow that says it is shown), and it carries only what that act licenses: a
  drawn winner's display name, not their weight or their other entries. Joining a visible
  name to an invisible fact — who voted for what — is the disclosure, so it never happens
  on stream, whatever the request.
- **When the page would need raw records to animate a transition**, send the before and
  after aggregate in the snapshot, or animate between successive snapshots. Do not send
  the records.
- **When a limit is hit in production**, raise it deliberately in the schema with the
  reason; never remove the bound.

## When not to use it

A private operator view — the streamer's own control panel, a moderator console — needs
individual records and is not an overlay. Keep it on an authenticated surface and never
reuse its feed for an on-stream page.
