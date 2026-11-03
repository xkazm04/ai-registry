---
layer: application
type: application
subject: model-composed-workspace
technique: reversible-screen-ops
stack: react
status: forged
verified_on: 2026-11-03
verified_against: react@19.3
---

# The wallet's conversational board: closed ops, one door, a host-owned undo

The money-safety wallet (repository `paypal`) has a second home view beside its
console: a board of six modules by four money states, with a chat rail whose
replies light up or dim parts of the board and put one answer panel beside it.
Every anchor below was read at commit `a52d8f6dfaab5dc6450b7c7c2d7743be2f7d8ada`
through `git archive` of that sha, not from the working tree, and paths are
relative to the repository root. The client pins
`apps/desktop/client/package.json:20 "react"` at 19.3.

The board is the best realization in the fleet of this technique's vocabulary and
validation half, and it is deliberately thin on the screen half: one panel, no
streaming, no per-op undo. Both halves are recorded, because the deviations are
the board's work list.

## The closed verbs - confirmed, with a sharper reading of filter

The op set is a closed union of four verbs,
`apps/desktop/client/src/lib/assistant/contract.ts:50 "export type UiOp ="`:
show, focus, filter and propose. The registry that describes them is the one
authority for the prompt, the validator and the schema
(`apps/desktop/client/src/lib/assistant/vocabulary.ts:1 "the ONE place the assistant"`),
and the prompt text is derived from it rather than written beside it
(`apps/desktop/client/src/lib/assistant/vocabulary.ts:110 "derived from the registry (for the prompt)"`).
The cap on operations per reply is part of the vocabulary
(`apps/desktop/client/src/lib/assistant/vocabulary.ts:13 "export const OPS_MAX = 8;"`),
and the overflow is dropped and counted rather than truncated silently
(`apps/desktop/client/src/lib/assistant/validate.ts:198 "drop('too_many_ops', rawOps.length - OPS_MAX)"`).

There is no verb that moves, hides or resizes the board. **Upward lesson, taken
into the technique:** focus and filter are defined as changes of emphasis, never
of presence. Focus "never hides anything"
(`apps/desktop/client/src/lib/assistant/contract.ts:53 "never hides anything"`);
filter dims (`apps/desktop/client/src/lib/assistant/contract.ts:55 "Dim everything that is not this module"`),
and the board keeps the dimmed keys live
(`apps/desktop/client/src/windows/main/switchboard/Matrix.tsx:37 "a dimmed key is still drawn and still clickable"`).
The draft said filter "narrows what a view shows"; the board shows the stronger
rule, and the technique now carries it.

## One validation door - confirmed

Every reply from every engine passes
`apps/desktop/client/src/lib/assistant/validate.ts:172 "export function validateReply(raw: unknown, known: Known): ValidatedReply {"`,
which never throws and returns survivors plus a counted, reasoned drop list. The
board discloses the count in the turn
(`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:57 "BOARD_DROPPED(t.answer.dropped)"`,
worded at `apps/desktop/client/src/lib/words/board.ts:92 "could not be shown"`).
Bindings are checked against the identities the model was shown: a deal id is
accepted only if it is in the digest
(`apps/desktop/client/src/lib/assistant/validate.ts:99 "known.dealIds.has(v)"`).
**Upward lesson, taken into composition-region:** a binding to an identity the
grounding did not contain is dropped at the door, not handed to the module.

A second **upward lesson**: an act-class proposal with a stray key is dropped
whole rather than repaired
(`apps/desktop/client/src/lib/assistant/validate.ts:152 "An act changes the wallet: a stray key on it"`).
The technique now states it for every data-changing proposal.

## Proposals arm through consent, and the undo is the host's - confirmed, upward

Proposals render as a consent box drawn from the host's own resolution
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:246 "aria-label={BOARD_ACT.boxLabel}"`),
and at the press the proposal is re-resolved and compared with what the box
showed; a mismatch disarms it
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:110 "now.consent.fingerprint !== shown.fingerprint"`).
The undo of an act is the host's own button
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:276 "data-undo={acted.run.act}"`),
and the contract forbids the model from proposing one
(`apps/desktop/client/src/lib/assistant/contract.ts:41 "no undo is proposable"`).
**Upward lessons, both taken:** undo belongs to the host and is never a verb; a
proposal's staleness is measured at the press.

## Stop restores - confirmed by construction

The board applies nothing until the whole reply has passed the door: one awaited
call (`apps/desktop/client/src/windows/main/switchboard/useBoardAssistant.ts:89 "raw = await used.ask(question, input, ctl.signal);"`),
validated (`apps/desktop/client/src/windows/main/switchboard/useBoardAssistant.ts:98 "reply: validate(raw, known)"`),
then applied (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:170 "apply(r);"`).
A stop before that point therefore changes nothing, and the board says exactly
that (`apps/desktop/client/src/lib/words/board.ts:84 "Stopped. Nothing changed."`).
**Upward lesson, taken:** for a surface that does not stream ops, atomic
application is the cheapest correct stop.

## Deviations - the standard stays

1. **No undo for view operations.** Only consented acts have an undo (the host
   button cited above). A show, focus or filter cannot be stepped back;
   Esc returns to the empty overview
   (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:74 "const overview = useCallback"`,
   called at `apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:188 "overview();"`),
   which discards the user's own filter along with the model's. Work: a per-reply
   step list with one-step undo, and Esc restoring the pre-turn arrangement.
2. **No "what changed" line.** The apply loop
   (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:137 "const apply = useCallback((reply: ValidatedReply) => {"`)
   sets state and says nothing about the ops it applied; the only system line is
   the drop count and the repair note. Work: one plain line per applied reply.
3. **The user's hand does not win.** The ops are applied after the await
   (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:164 "const out = await assistant.ask(question, model.digest);"`)
   with no check of what the user did meanwhile; the board stays clickable while
   the rail is busy, so a key the user opened during the wait is replaced by the
   reply's panel (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:153 "if (nextPanel !== undefined) setPanel(nextPanel);"`).
   Work: drop ops whose target the user touched since the turn began, and say so.
4. **One panel, not a region.** Show replaces the current panel
   (`apps/desktop/client/src/lib/assistant/contract.ts:51 "replaces the current one"`),
   and within one reply the last show wins
   (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:144 "case 'show': nextPanel = op.panel; break;"`).
   The answer area is a pane beside a fixed board, which is copy-not-move done
   right, but it cannot compose views from several modules. Work: a small
   slot-and-span region.
5. **Navigation leaves the board.** There is no navigate verb; a console page is
   reached through a proposal button that rewrites the hash and switches the
   whole home view
   (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:92 "window.location.hash = r.hash"`,
   `apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:93 "setHomeView('console');"`).
6. **Figures in model text are requested away, not refused.** The prompt asks
   the model not to repeat figures
   (`apps/desktop/client/src/lib/assistant/prompt.ts:19 "do not repeat figures, lists or deal names"`)
   and never to invent them
   (`apps/desktop/client/src/lib/assistant/prompt.ts:24 "Never invent numbers, names or ids."`),
   but the door's text cleaner removes markup and links, not digits
   (`apps/desktop/client/src/lib/assistant/validate.ts:44 "export function cleanText(raw: string, max: number): string {"`).
   Panel titles are host words per kind
   (`apps/desktop/client/src/windows/main/switchboard/Answer.tsx:42 "return BOARD_PANEL_TITLE[p.kind];"`),
   which is the strong form; the reply sentence is not. Work: refuse or strip a
   figure in say, as the companion's report already does.
7. **The turn flow is a wordless wait.** The busy row is one fixed phrase
   (`apps/desktop/client/src/lib/words/board.ts:83 "Looking through your board"`,
   shown at `apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:52 "{BOARD_BUSY}"`)
   until the whole reply lands; nothing streams. Submitting while busy is refused
   (`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:36 "if (!q || busy) return;"`)
   and the suggestion chips are disabled
   (`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:65 "disabled={busy} onClick={() => onAsk(c)}"`).
   The chips are a fixed list
   (`apps/desktop/client/src/lib/words/board.ts:86 "What needs me?"`), not
   follow-ups specific to the answer.
8. **No view-choice evaluation.** The design note names the gap
   (`docs/design/conversational-home.md:37 "Measure that separately (an eval over a fixed set of intents)"`);
   the only intent tests exercise the scripted engine's canned keyword intents
   (`apps/desktop/client/src/lib/assistant/scripted.ts:1 "canned intents with keyword matching"`).
   Work: a labelled set with no-UI negatives, run against the live engine.
9. **The board is opt-in.** The home view defaults to the console
   (`apps/desktop/client/src/windows/main/switchboard/view.ts:34 "return fromAddress() ?? fromStorage() ?? 'console';"`).
   That is a product decision, recorded so the evaluation can admit it.

## Confirmed elsewhere in the subject

- **Fallback provenance (conductor-turn-flow, upward lesson).** If the live engine
  fails, the scripted engine answers
  (`apps/desktop/client/src/windows/main/switchboard/useBoardAssistant.ts:93 "used = getScripted();"`)
  and the turn says so
  (`apps/desktop/client/src/lib/words/board.ts:91 "The live engine did not answer"`,
  shown at `apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:56 "BOARD_FALLBACK_NOTICE"`).
  The technique now requires it.
- **Calm highlight (composition-motion).** A lit key animates once
  (`apps/desktop/client/src/windows/main/switchboard/switchboard.css:100 "animation: sbLit var(--dur-med) var(--ease) 1;"`)
  and not at all under reduced motion
  (`apps/desktop/client/src/windows/main/switchboard/switchboard.css:217 "prefers-reduced-motion: reduce"`).
