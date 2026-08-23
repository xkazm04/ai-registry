---
layer: application
type: application
subject: conversation-orchestration
technique: two-surface-doctrine
stack: react
status: forged
verified_on: 2026-08-23
---

# Two dimensions in the Personas companion

Personas states the doctrine as product law and then enforces it in code. The
feature README's "Two dimensions: chat and orb" section
(`docs/features/companion/README.md:28-38`) declares that the companion
communicates on exactly two surfaces: the chat panel is "the full-information
dimension … everything she has to say in words lives here", and the orb layer is
"the quick-info and decision dimension".

## The rule that makes it enforceable: no third surface

`docs/features/companion/README.md:58-60` states it flatly — "There is
deliberately **no third dimension**. Athena raises no toasts, no footer notice
popovers, and no corner pop-ups" — and then does the work that makes such a rule
real, which is a table of every surface that was removed and where its content
went (`README.md:61-67`):

| Removed | Where it went |
| --- | --- |
| footer notice popover | orb state (posture, pulse, thread-attention badge); the words moved into chat |
| an auto-decision toast | orb pulse plus a durable in-chat ledger, backed by a store array |
| the decision-failure toast | rendered in place on the surface the user clicked |
| companion rows in a live corner overlay | filtered at the overlay's sink; still in the durable timeline |

Every row lands where the technique predicts: the informational half becomes a
state change on the presence, the content half becomes a durable entry in the
conversation, and the transient pop-up — which kept neither — is gone.

The same README records the routing rule applied to a concrete case
(`README.md:579`): when a background thread finishes, the orb pulses and a badge
carries a count, while *which* thread replied is carried in chat, because
"naming a thread is full information, and full information belongs in the chat
window".

## Never both, never neither

The ambient decision bubble docks against the orb, and the orb does not exist
while the chat panel is open. That is a real hole and it is closed explicitly.
`OrbDecisionBubble` returns null unless a decision is pending *and* the presence
is minimized (`orb/OrbDecisionBubble.tsx:150`); `ChatDecisionCard` computes the
**exact complement** of that predicate and renders the same decision in chat
(`decision/ChatDecisionCard.tsx:38-40`), with its own comment saying so — "Exact
complement of `OrbDecisionBubble`'s visibility predicate — never both, never
neither."

The card's header comment (`ChatDecisionCard.tsx:8-26`) is worth reading whole:
it names the two dimensions, names the failure it was written for (approvals and
incidents happened to have chat cards; human reviews and ad-hoc decisions did
not, so those became unanswerable), and states the invariant that keeps the two
renderings honest — "Both surfaces resolve through `runDecisionOption`, so the
two dimensions never drift."

That single resolver is `decision/resolveDecision.ts:39-57`, and it is where the
in-place failure rule lives: on a thrown option, it records the error and
`return`s with the comment "keep the decision pending; do NOT record it as
resolved" (`resolveDecision.ts:47-49`). Both surfaces read `decisionError` and
render it where the user clicked (`OrbDecisionBubble.tsx:61`,
`ChatDecisionCard.tsx:35`), so the same options become the retry.

## Numbered options, leader key, and the reserved zero

The interaction lives in `orb/AthenaOrbLayer.tsx`. `;` arms a two-second window
(`AthenaOrbLayer.tsx:13`, `LEADER_WINDOW_MS = 2000`; armed at
`AthenaOrbLayer.tsx:150-159`); `1`–`9` inside the window resolve
(`AthenaOrbLayer.tsx:130-136`); `0` runs explain-and-recommend without clearing
the decision (`AthenaOrbLayer.tsx:137-142`, into `explainDecision()` at
`resolveDecision.ts:76-79`); Escape or any other key disarms
(`AthenaOrbLayer.tsx:143-149`). The whole branch is gated on a decision actually
being pending and the user not typing (`AthenaOrbLayer.tsx:126`), and a decision
that vanishes while armed drops the leader (`AthenaOrbLayer.tsx:161-164`).

The registration comment (`AthenaOrbLayer.tsx:113-116`) is the upward lesson this
technique now carries:

> On the app keyboard registry rather than `window`: the `;`-leader digits are
> the same `1`–`9` the full-app triage deck uses to fire a card's branch, and
> with both on `window` one press did both.

**Deviation, in the sibling surface.** `QuickReplies.tsx:21-35` still binds its
digit accelerator with a raw `window` listener guarded only against `input` and
`textarea` targets — the exact arrangement the orb layer had to abandon. One of
the two surfaces learned the lesson.

## Ambient priority: an answer outranks an announcement

`orb/RemoteJobNoticeChip.tsx:55` returns null whenever a decision is pending,
with the reason at `RemoteJobNoticeChip.tsx:12-14`: it "yields entirely while a
decision bubble is up: that surface docks against the same orb and is asking for
an answer, which outranks an FYI." The README states the same policy in prose
(`README.md:46-50`) and adds the durability half — the remote-job row in
settings is the durable record, so the ambient chip is free to be transient and
to clear itself on a TTL.

**Partial.** The bubble can be collapsed to a small source-iconed chip rather
than dismissed (`OrbDecisionBubble.tsx:81`, `:204-209`, `:346-347`), which keeps
a pending decision visible without occupying the screen — good. But a decision
the user declines or lets expire is not recorded as a distinct outcome anywhere
this reconcile could find: `runDecisionOption` records a `decision_resolved`
signal (`resolveDecision.ts:51-55`) and there is no matching declined or expired
signal, so "the ambient channel is being ignored" is not currently observable.
