---
layer: application
type: application
subject: conversation-orchestration
technique: two-surface-doctrine
stack: react
status: forged
verified_on: 2026-11-16
verified_against: react@19
---

# Two dimensions in the companion

*First verified against the project tree at `2b5e24223`; line numbers in the sections below are locations at that sha. Re-read at Personas `8d076db46a` (2026-11-08) on 2026-11-16: the feature moved to `src/features/companions/athena/` (`bf4fe6c05`) and the README to `docs/features/companions/athena/README.md` ("Two dimensions" now at `:158`, "no third dimension" at `:188`, the thread-attention case at `:805`). What changed is in the last section.*

This tree states the doctrine as product law and then enforces it in code. The
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
a pending decision visible without occupying the screen — good.

## The complementary-condition contract, made failable

The interesting addition since this document was first written is not a new
rule — it is that the "never both, never neither" contract stopped being a
comment and became an **oracle that names the surface**.

`src/test/automation/bridge.ts:748-782` exposes a QA snapshot of the decision
flow, and one of its fields answers the doctrine directly
(`:759-768`):

```ts
// Athena has exactly two communication dimensions. A pending decision is
// ALWAYS on one of them: the orb bubble when the orb exists (minimized,
// or lifted over an open Fleet grid), otherwise the in-chat decision card
// (`athena-chat-decision`). `'none'` here means an invisible decision —
// the exact regression the third-dimension removal must never introduce.
decisionSurface: !c.pendingDecision
  ? null
  : c.state === 'minimized' || sys.fleetGridOpen
    ? 'orb'
    : 'chat',
```

Three properties make this worth copying, and they are properties of the
*shape*, not of this product.

**It reports which surface, not whether one exists.** A boolean
(`decisionHasSurface`) would have been the obvious instrument and would have
been strictly weaker: it can only fail when the decision is invisible, and it
would have passed the entire class of bugs where a decision renders on the
wrong dimension — the ambient surface holding something that needed reading,
the chat card firing while the orb is up. A three-valued report is a
regression detector for the routing rule as well as for the hole.

**The failure value is defined in advance, in the code, as the thing that
must never happen.** `'none'` is not an error path or an absent case; it is
named in the comment as "the exact regression the third-dimension removal
must never introduce". The doctrine's argument — that retiring the third
surface is only safe if the two remaining ones are exhaustive — is exactly
what `'none'` is the negation of. `null` is kept separate for "no decision
pending", so the instrument distinguishes *nothing to route* from *routed
nowhere*, which is the distinction a boolean collapses.

**It derives the answer from state, not from the DOM.** The expression reads
`pendingDecision`, the companion's `state`, and `fleetGridOpen` — the same
three values the two components' visibility predicates read
(`OrbDecisionBubble.tsx:150`, `ChatDecisionCard.tsx:40-41`). That is what
makes it an oracle for the *contract* rather than for one rendering: a
scripted check can assert the expected surface for a posture before any
component is asked to render, and the assertion still holds if the markup is
rewritten.

## What this realization cannot do or prove

- **The oracle re-implements the predicate it certifies.** `bridge.ts:766-768`
  computes `c.state === 'minimized' || sys.fleetGridOpen` — the same
  expression that appears in `OrbDecisionBubble.tsx:150` and, negated, in
  `ChatDecisionCard.tsx:40`. It is now a third copy of the condition rather
  than a reader of it. If someone adds a fourth posture in which the orb
  exists, the two components and the oracle drift independently, and the
  oracle keeps reporting confidently. The instrument that would actually
  close this exports the predicate once and has all three call it — the
  bundle's own one-authority law, applied to a boolean instead of to a
  vocabulary.
- **It has no in-tree consumer.** `decisionSurface` is defined at
  `bridge.ts:764` and referenced nowhere else in the tree — the bridge is
  driven by scripted QA from outside. So this is a *reportable* fact, not an
  asserted one: nothing in the test suite fails when it returns `'none'`, and
  nothing in CI would notice. Prose made failable is a real upgrade over
  prose; prose made failable by a runner nobody has wired is still one wiring
  step from being a gate.
- **The exclusivity clause is untested by any of this.** The keyboard claim
  registers through `useAppKeyboard` with the comment "any overlay that
  claims the keyboard is served first and this layer yields"
  (`AthenaOrbLayer.tsx:113-116`) — which is priority language, not exclusive
  language. Nothing here demonstrates that a digit pressed while the orb is
  armed reaches *only* the orb; the deviation below is the direct evidence
  that it does not.
- **Deviation, in the sibling surface.** `QuickReplies.tsx:21-36` still binds
  its digit accelerator with a raw `window` listener guarded only against
  `input` and `textarea` targets — the exact arrangement the orb layer had to
  abandon. One of the two surfaces learned the lesson, and the oracle above
  cannot see the other one, because it reports where a decision *renders* and
  says nothing about who receives the keystroke that answers it.
- **Ignoring is still unobservable.** A decision the user declines or lets
  expire is not recorded as a distinct outcome anywhere in the tree:
  `runDecisionOption` records a `decision_resolved` signal
  (`resolveDecision.ts:51-55`) and there is no matching declined or expired
  signal, so "the ambient channel is being ignored" — the one measurement the
  doctrine's dismissal-is-an-outcome clause exists to protect — cannot be
  taken. The surface is proven present; nothing proves it is answered.

## Re-read at `8d076db46a` (2026-11-16): the leader cannot be reached

Read, not run. Paths are under `src/features/companions/athena/` unless they say
otherwise.

**Still true.**
- The complement holds. `OrbDecisionBubble.tsx:181` renders only while minimized
  or while the Fleet grid is open. `ChatDecisionCard` returns null when
  `bubbleShowing` (`ChatDecisionCard.tsx:33-37`), and `useDecisionCard.ts:75`
  computes it.
- `resolveDecision.ts:62` still keeps a failed decision pending, and `:69` still
  records only `decision_resolved`.
- The QA oracle is unchanged at `src/test/automation/bridge.ts:888-898`. It now
  has a fourth copy of the predicate (`useDecisionCard.ts:75`) and still has no
  in-tree consumer. The `decisionSurface` hits in `src/stores/systemStore.ts:44-47`
  are a different, retired dev switch.
- `RemoteJobNoticeChip.tsx:57` still yields to a pending decision.
- `QuickReplies.tsx:36` still binds its digits with a raw `window` listener.

**New: the `;` leader is shadowed and never arms (defect).**
`src/lib/keyboard/KeyboardNavMode.tsx` registers on the same keyboard registry at
priority 30 (`:72`). On every `;` outside a text field it toggles nav mode and
returns `true` (`:44-48`). It is mounted unconditionally at the app root
(`src/App.tsx:392`). The provider stops at the first handler that returns `true`
(`src/lib/keyboard/AppKeyboardProvider.tsx` dispatch loop). The orb's leader is
at `ROUTE_DECISION_PRIORITY` = 10 (`orb/AthenaOrbLayer.tsx:190`, the `;` branch
at `:160-171`), so it never sees the key. The answer is: pointer and tab work,
digits after `;` do not, and pressing `;` turns on the app's keyboard nav mode
instead.
- When it started: nav mode moved onto the registry at priority 30 by
  `363ea0eaea` (2026-07-31), the same commit that put the orb on it. The
  decision-layer plan
  (`docs/features/companions/athena/athena-decision-layer-plan.md:71`) first put
  the leader on a raw `window` listener, which would have fired both. The move to
  the registry turned "both" into "only the other one". So the first pass of this
  document (`2b5e24223`, 2026-08-29) already described a leader that could not
  fire. It read the handler and not the ladder.
- `src/lib/keyboard/shortcutRegistry.ts:65` lists `;` as nav mode only. The
  leader is not in the registry the cheat sheet renders from, so the double claim
  is invisible where keys are assigned.
- No test arms the leader.
- Fix: give the leader a key nobody else claims (a modifier chord also meets
  WCAG 2.1.4), list it in `shortcutRegistry.ts`, and add one test that mounts
  `KeyboardNavMode` beside the orb layer.

**New: the provider gained `exclusive`.** The dispatch loop now breaks after an
exclusive registration whether or not it handled the key. This addresses the
priority-is-not-exclusivity point in the section above, and the triage deck
(priority 70) uses it. The orb registers without it.

**New: Skip and Later (`c268097bff`, 2026-09-18).** `decision/decisionDeferral.ts`
holds a session-scoped, in-memory ledger. Its header comment says why a skip is
not persisted: "Persisting a skip would turn 'not now' into 'never'". Later
snoozes for `DECISION_SNOOZE_MS` = 10 min. Both are wired from the bubble
(`OrbDecisionBubble.tsx:96`, `:101`) and the card (`useDecisionCard.ts:88`,
`:93`). This is the deferred outcome the technique now names. Neither path emits a
signal, so ignoring is still unobservable. The ledger is also not the signal the
dismissal clause asks for, because it forgets on restart by design.
