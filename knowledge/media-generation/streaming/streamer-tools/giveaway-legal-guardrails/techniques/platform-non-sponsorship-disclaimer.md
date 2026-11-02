---
layer: technique
type: technique
subject: giveaway-legal-guardrails
technique: platform-non-sponsorship-disclaimer
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [rendering a giveaway on a stream overlay or in chat, writing the rules text a giveaway publishes, deciding where and how long a disclaimer must be visible]
---

# Platform non-sponsorship disclaimer

Every surface that shows a giveaway says, in plain words, that the streaming platform does
not sponsor, endorse or administer it, and that the streamer is the party responsible for the
giveaway and the prize. The technique is about the sentence, where it appears, and the one
rendering rule that keeps it present in the frame people actually capture. Product design
practice, not legal advice: the wording below is a common baseline, not a cleared text.

## The sentence

The baseline names three parties and their roles: the platform (not sponsoring, endorsing or
administering), the streamer (running the giveaway and responsible for the prize), and, where
there is one, the sponsor providing the prize. Promotion guides for the large streaming
platforms recommend this framing (vendor guidance read on 2026-11-02); platforms' own rules
are less explicit about giveaways than those guides imply, which is why the tool states the
baseline rather than quoting a policy section that may move.

Keep it short enough to read on a phone at stream resolution — one line on the overlay, with
the full rules one step away (a chat command, a link in the panel). A paragraph shrunk to
illegibility is not a disclosure.

## Every surface

- **The on-stream overlay** for the giveaway, for as long as any giveaway element is on
  screen: entry call, countdown, sealed state, reveal, winner plate.
- **The entry instructions** posted in chat when entry opens.
- **The rules text**, with the free-entry route, eligibility, prize and value, draw time and
  how winners are contacted.
- **The published draw record** and any verifier page that renders it.

A surface added later — a clip card, a share image — inherits the disclaimer by default; the
author has to remove it on purpose, not remember to add it.

## A precondition of the render, not a toggle

Make the disclaimer a condition of building the giveaway's scene at all: the code that
composes a prize draw's on-stream layers refuses to produce one without the disclaimer layer,
rather than offering a flag that defaults to on. A flag is a setting someone turns off for a
cleaner look before a showcase; a precondition fails loudly in the build. Keep the sentence
itself in one place that every surface reads, because two hand-typed copies drift — one
surface saying the platform does not sponsor, another that it does not sponsor or
administer — and the weaker wording becomes the one that matters.

## Outside every animation

On the overlay, render the disclaimer as a static layer outside the animated elements, never
as part of a reel, a reveal transition or a winner card that fades in. The winner reveal is
the frame most likely to be clipped, screenshotted and shared out of context, and it is the
frame in which an animated disclaimer is mid-fade, scaled down or covered by confetti. A
disclaimer that is present "on average" across the animation is absent in the frame that
travels.

The same layer must be legible against the stream behind it: a fixed backing plate rather than
bare text over gameplay, and placed where the platform's own interface does not cover it on
the common player sizes.

## What the disclaimer must not say

It does not say the giveaway is lawful, approved, compliant or verified by anyone — not the
platform, not the tool. The draw's proof, where there is one, covers the derivation of
winners and is labelled as such on its own; the disclaimer is not the place to borrow that
authority. Saying more than the facts support is
[output-never-outruns-evidence](../../../../_laws.md#output-never-outruns-evidence), and a
disclaimer that reads as a legal stamp is worse than none.

## Decision rules

- **When the giveaway has a sponsor**, name the sponsor's role in the same line or the rules,
  and do not let the sponsor's branding imply the platform's involvement.
- **When the overlay layout is customised**, the disclaimer's layer is not removable from
  the overlay design, only movable within the safe area.
- **When a localisation is added**, translate the disclaimer with it; a disclaimer in a
  language the room does not read is not one.

## When not to use it

A draw with no prize — picking a viewer for the next match — does not need the giveaway
disclaimer, and adding it to every pick dilutes it where it matters. A promotion actually run
by the platform itself needs the platform's own terms, not this sentence.
