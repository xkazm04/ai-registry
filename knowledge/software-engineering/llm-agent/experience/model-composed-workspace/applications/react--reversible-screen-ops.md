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
replies light up or dim parts of the board and add answer panels to a small
region beside it. Every anchor below was read at commit
`2d8a554b42f361528c55957432bfb1bad17e9483` (main, the proof build: `0bf5ea17`
added the region, the what-changed line and the one-step undo; `2d8a554b` added
the view-choice evaluation), and paths are relative to the repository root. The
client pins `apps/desktop/client/package.json:21 "react"` at 19.3.

**Dated note, 2026-11-03.** The earlier version of this application recorded the
pre-proof state at `a52d8f6dfaab5dc6450b7c7c2d7743be2f7d8ada`: one panel that
each show replaced, no undo for view operations, no what-changed line, a reply
applied over whatever the owner did during the wait, and no view-choice
evaluation. The proof build closed those five; the sections below say which
claims moved from deviation to confirmed, and the deviations that remain.

## The closed verbs - confirmed, with a sharper reading of filter

The op set is a closed union of four verbs,
`apps/desktop/client/src/lib/assistant/contract.ts:50 "export type UiOp ="`:
show, focus, filter and propose. The registry that describes them is the one
authority for the prompt, the validator and the schema
(`apps/desktop/client/src/lib/assistant/vocabulary.ts:1 "the ONE place the assistant"`),
and the prompt text is derived from it rather than written beside it
(`apps/desktop/client/src/lib/assistant/vocabulary.ts:117 "derived from the registry (for the prompt)"`).
The cap on operations per reply is part of the vocabulary
(`apps/desktop/client/src/lib/assistant/vocabulary.ts:13 "export const OPS_MAX = 8;"`),
and the overflow is dropped and counted rather than truncated silently
(`apps/desktop/client/src/lib/assistant/validate.ts:198 "drop('too_many_ops', rawOps.length - OPS_MAX)"`).

There is no verb that moves, hides or resizes the board, and none that pins or
unpins (`apps/desktop/client/src/windows/main/switchboard/region.ts:11 "no reply can pin or unpin (the wire has no such op)"`).
**Upward lesson, taken into the technique:** focus and filter are changes of
emphasis, never of presence. Focus never hides anything
(`apps/desktop/client/src/lib/assistant/contract.ts:58 "never hides anything"`);
filter dims (`apps/desktop/client/src/lib/assistant/contract.ts:60 "Dim everything that is not this module"`),
and the board keeps the dimmed keys live
(`apps/desktop/client/src/windows/main/switchboard/Matrix.tsx:37 "a dimmed key is still drawn and still clickable"`).

## One validation door - confirmed

Every reply from every engine passes
`apps/desktop/client/src/lib/assistant/validate.ts:172 "export function validateReply(raw: unknown, known: Known): ValidatedReply {"`,
which never throws and returns survivors plus a counted, reasoned drop list. The
board discloses the count in the turn
(`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:80 "BOARD_DROPPED(t.answer.dropped)"`,
worded at `apps/desktop/client/src/lib/words/board.ts:92 "could not be shown"`).
A deal id is accepted only if it is in the digest the model was shown
(`apps/desktop/client/src/lib/assistant/validate.ts:99 "known.dealIds.has(v)"`),
and an act-class proposal with a stray key is dropped whole rather than repaired
(`apps/desktop/client/src/lib/assistant/validate.ts:152 "An act changes the wallet: a stray key on it"`).
Both were upward lessons and both are in the techniques.

## A region of several panels - confirmed (was deviation 4)

Shows now compose. The region is one pure value of at most three panels
(`apps/desktop/client/src/lib/assistant/vocabulary.ts:22 "export const REGION_MAX = 3;"`):
a show adds a panel, and a panel equal to one already there is not duplicated and
does not move
(`apps/desktop/client/src/windows/main/switchboard/region.ts:7 "duplicated and does not move: it stays where it is and becomes the focus. Copy, don't move."`,
`apps/desktop/client/src/windows/main/switchboard/region.ts:65 "if (has(a.region, key)) return { ...a, focus: key };"`).
When the region is full the oldest unpinned panel leaves
(`apps/desktop/client/src/windows/main/switchboard/region.ts:8 "When the region is full, the oldest UNPINNED panel leaves"`),
and pins stop one short of the cap
(`apps/desktop/client/src/windows/main/switchboard/region.ts:24 "export const PIN_MAX = REGION_MAX - 1;"`),
so a pin never silences the next answer. The owner's own opens go through the
same placement rule as the model's shows
(`apps/desktop/client/src/windows/main/switchboard/region.ts:62 "Used by the assistant's"`).
Proved at `apps/desktop/client/src/windows/main/switchboard/Switchboard.test.tsx:532 "three at most: the oldest unpinned panel leaves, a pinned one survives every reply"`.

## One step, one undo, one line - confirmed (were deviations 1 and 2)

Everything a reply may change is one immutable value - region, focus, filter,
light (`apps/desktop/client/src/windows/main/switchboard/region.ts:29 "export type Arrangement = {"`) -
held in a ref so a snapshot never reads a stale render
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:66 "so a diff and an undo snapshot never read a stale render"`).
Applying a reply captures the value it was applied to, applies, diffs, and keeps
the prior value as the undo only when something changed
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:195 "const before = arrRef.current;"`,
`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:200 "setUndoTo(changedAnything(change) ? { before, turn } : null);"`).
Undo reinstates that value
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:123 "commit(undoTo.before);"`)
from the host's own button
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:306 "data-layout-undo={undoTo ? 'ready' : 'none'}"`,
worded `apps/desktop/client/src/lib/words/board.ts:120 "undo: 'Undo last change',"`),
and the turn's line is marked undone
(`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:69 "data-changed={t.answer.undone ? 'undone' : 'applied'}"`).
Proved at `apps/desktop/client/src/windows/main/switchboard/Switchboard.test.tsx:554 "one undo puts the region, the filter and the light back exactly as before the last reply"`.

The what-changed line is computed from the before and after values, never from
the model's text (`apps/desktop/client/src/windows/main/switchboard/region.ts:170 "export function changeLine(c: Change, w: ChangeWords, n: ChangeNames): string | null {"`),
in host words (`apps/desktop/client/src/lib/words/board.ts:127 "added: (names: string): string =>"`).
**Upward lessons, taken:** an immutable arrangement makes the pre-image free (the
old reference) and the undo provable (restoring it diffs to nothing,
`apps/desktop/client/src/windows/main/switchboard/region.test.ts:133 "undo is the snapshot from before the reply: restoring it diffs to nothing"`);
a reply that changed nothing has no line and no undo, including a re-show of a
panel already there
(`apps/desktop/client/src/windows/main/switchboard/region.test.ts:124 "no line when nothing changed, including a show of a panel already there"`);
and what stayed is named only beside what came or went
(`apps/desktop/client/src/windows/main/switchboard/region.ts:174 "What stayed is said only beside what came or went"`).

## The owner's hand wins - confirmed, with an upward lesson (was deviation 3)

The board counts the owner's own moves; a turn remembers the count at ask
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:218 "const movesAtAsk = ownerMoves.current;"`)
and applies its layout only if the count did not move
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:229 "const moved = ownerMoves.current !== movesAtAsk;"`,
`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:232 "const changed = apply(r, id, !moved);"`).
The turn says so (`apps/desktop/client/src/lib/words/board.ts:138 "because you moved the board while it answered"`)
and offers the held layout as one press
(`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:76 "data-apply-held={t.id}"`),
which applies by the region's rules as an undo step of its own
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:246 "const changed = applyOps(h.ops, turn);"`).
Proposals still appear, since they are re-resolved at the press anyway
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:165 "now.consent.fingerprint !== shown.fingerprint"`).
Proved, with a control, at `apps/desktop/client/src/windows/main/switchboard/Switchboard.test.tsx:637 "a move she makes while it answers wins: the reply"`
and `apps/desktop/client/src/windows/main/switchboard/Switchboard.test.tsx:675 "the control for the test above"`.
**Upward lesson, taken:** hold and offer beats drop and say - the late layout is
neither lost nor applied, and one newer reply retires an older offer
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:235 "one held layout at a time: a newer reply retires an older offer"`).
The rule is coarser than the technique's: any move holds the whole layout, not
only ops on the target she touched - acceptable for a three-panel region.

## Stop applies nothing - confirmed by construction and by test

The board applies nothing until the whole reply has passed the door: one awaited
call (`apps/desktop/client/src/windows/main/switchboard/useBoardAssistant.ts:89 "raw = await used.ask(question, input, ctl.signal);"`),
an abort check after it
(`apps/desktop/client/src/windows/main/switchboard/useBoardAssistant.ts:97 "if (ctl.signal.aborted) return { kind: 'cancelled' };"`),
and a cancelled turn returns before any apply
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:221 "A stopped turn applies nothing"`),
said as `apps/desktop/client/src/lib/words/board.ts:84 "Stopped. Nothing changed."`.
The test races an engine that answers the moment Stop is pressed
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.test.tsx:615 "Stop restores: a cancelled turn applies nothing, even when the engine answers after the stop"`).

## Proposals arm through consent, and act undo is the host's - confirmed

Proposals render as a consent box from the host's resolution
(`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:348 "aria-label={BOARD_ACT.boxLabel}"`),
the press re-checks the fingerprint (cited above), the undo of an act is the
host's button (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:378 "data-undo={acted.run.act}"`),
and the contract forbids proposing one
(`apps/desktop/client/src/lib/assistant/contract.ts:41 "no undo is proposable"`).

## Deviations that remain - the standard stays

1. **The model is still taught that show replaces.** The model-facing words read
   `apps/desktop/client/src/lib/assistant/vocabulary.ts:86 "replaces the current one"`,
   because the copy is
   `apps/desktop/client/src/lib/assistant/contract.ts:55 "pinned for the shell in assistant_contract.json"`,
   and the cap is not in the prompt either
   (`apps/desktop/client/src/lib/assistant/vocabulary.ts:20 "Not in the prompt yet"`).
   The rewording is deferred
   (`docs/features/conversational-home.md:72 "Proposed wording for after 2026-11-12"`).
   The evaluation measured the cost: every two-panel question got one panel.
2. **Undo is one step deep and per reply.** A reply's ops are one group; a single
   op inside it cannot be stepped back, and an owner move supersedes the pending
   undo (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:104 "setUndoTo(null);"`,
   proved at `apps/desktop/client/src/windows/main/switchboard/Switchboard.test.tsx:588 "an owner move after the reply supersedes its undo"`).
   Esc is an owner reset that clears region, pins and filter together
   (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:107 "commit(EMPTY_ARRANGEMENT)"`).
3. **No navigate verb.** A console page is reached through a proposal button that
   rewrites the hash and switches the whole home view
   (`apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:147 "window.location.hash = r.hash"`,
   `apps/desktop/client/src/windows/main/switchboard/Switchboard.tsx:148 "setHomeView('console');"`).
4. **Figures in the sentence are requested away, not refused.** The prompt asks
   (`apps/desktop/client/src/lib/assistant/prompt.ts:19 "do not repeat figures, lists or deal names"`,
   `apps/desktop/client/src/lib/assistant/prompt.ts:24 "Never invent numbers, names or ids."`),
   but the door's cleaner removes markup and links, not digits
   (`apps/desktop/client/src/lib/assistant/validate.ts:44 "export function cleanText(raw: string, max: number): string {"`).
   Panel titles are host words per kind
   (`apps/desktop/client/src/windows/main/switchboard/Answer.tsx:41 "export function panelTitle(p: PanelSpec): string {"`),
   which is the strong form; the reply sentence is not.
5. **The turn is a wordless wait; nothing streams.** One fixed busy phrase
   (`apps/desktop/client/src/lib/words/board.ts:83 "Looking through your board"`)
   until the reply lands; asking while busy is refused
   (`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:48 "if (!q || busy) return;"`)
   and the fixed chips are disabled
   (`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:88 "disabled={busy} onClick={() => onAsk(c)}"`).
6. **In the app, Stop stops the page, not the model.** The page applies nothing,
   but `docs/features/conversational-home.md:77 "the shell's turn runs to its own end (at most 60 s)"`.
7. **No spans.** The region is an ordered stack in arrival order; the model can
   add, not place. Right-sized for a narrow rail, short of slots and spans.
8. **The board is opt-in.** The home view defaults to the console
   (`apps/desktop/client/src/windows/main/switchboard/view.ts:34 "return fromAddress() ?? fromStorage() ?? 'console';"`).

## Confirmed elsewhere in the subject

- **View-choice evaluation (was deviation 8).** A labelled set with negatives and
  a live arm landed in `2d8a554b`; see `react--view-choice-evaluation.md`.
- **Arrangement memory.** Pins are the owner's standing rule to every later reply,
  scoped to the task and never stored
  (`apps/desktop/client/src/windows/main/switchboard/region.ts:12 "Back to the overview (Esc) clears the region and its pins, and nothing is stored"`).
- **Fallback provenance (conductor-turn-flow).** If the live engine fails, the
  scripted engine answers
  (`apps/desktop/client/src/windows/main/switchboard/useBoardAssistant.ts:93 "used = getScripted();"`)
  and the turn says so
  (`apps/desktop/client/src/windows/main/switchboard/ChatRail.tsx:79 "BOARD_FALLBACK_NOTICE"`).
- **Calm highlight (composition-motion).** A lit key animates once
  (`apps/desktop/client/src/windows/main/switchboard/switchboard.css:100 "animation: sbLit var(--dur-med) var(--ease) 1;"`)
  and not under reduced motion
  (`apps/desktop/client/src/windows/main/switchboard/switchboard.css:235 "prefers-reduced-motion: reduce"`).
