---
layer: application
type: application
subject: work-sample-timeboxing-and-cost
technique: state-what-is-and-is-not-observed
stack: react
verified_on: 2026-09-29
verified_against: react@19
---

# The observation sentence on the work surface, laid beside the recorder

The corpus carried this technique with no application, and the surface that holds the
sentence was already the subject of another page, so this one is written from the tree at
kp `60aab8088` (2026-09-29) and does the technique's third check: the recorder's event
kinds laid beside the disclosure.

## What the candidate is told

`app/devcase/apply/[token]/LiveWorkSurface.tsx:317` renders `devApply.workSurface.intro`
on the same screen as the editor and the submit button:

> "Edit the starter files below. We record your process: what you open, what you edit,
> and what you note in DECISIONS.md. That way we grade the judgment we watch, not just
> the final code. You may use any tools, including AI. We never record keystrokes or your
> screen."

It is one short paragraph in candidate vocabulary, with the negative half stated. Three
neighbours complete it: the chat panel says "These conversations are part of your
submission, so good questions and good prompts count in your favor"
(`devApply.workSurface.chatIntro`), the clock line says elapsed time is recorded once the
candidate is past the box (`clockOver`), and the page carries the AI-use and retention
disclosure (`app/devcase/apply/[token]/page.tsx:118-126`, "for up to N months").

## The "we never" half holds

The surface source has no key, focus, visibility, camera or screen capture. The one
`onKeyDown` handler (`:456`) sends the chat on Enter and records nothing. Edits become
process events only after a 600 ms debounce (`EDIT_DEBOUNCE_MS`, `:29`; `:222-226`), and
the event carries a kind and a path, not text. "Never keystrokes or your screen" is true
of the implementation, which is what the technique requires of the negative half.

## The "we record" half is a subset

The recorder's event vocabulary is `open`, `edit`, `decision_log`, `submit`, `paste`,
`prompt` and `perturbation` (`pipeline/jobfit/devcase/process_events.py:5`). Laid beside
the sentence:

| recorded | named to the candidate |
| --- | --- |
| open, edit, decision_log | yes: "what you open, what you edit, and what you note in DECISIONS.md" |
| prompt (chat exchanges) | yes, by the chat panel's own line |
| elapsed time | yes, from the moment past the box; the visible clock is shown throughout |
| **paste, with its size** | **no** |
| perturbation (server-recorded moment the mid-flight change was shown) | no; the change itself is visible |
| a marker planted in the starting files and scanned for in the submission, and a hash chain over the event log | no |

The paste line is the one that matters, because it is used.

## The recorded value is scored, and the sentence says the opposite

`LiveWorkSurface.tsx:399-404` records the character count of every paste into the editor
(not the content). `app/_lib/devcase-run.ts:741` turns it into `observedBulkPaste`: true
when any paste event has `size >= PASTE_BULK_CHARS` (600,
`app/_lib/devcase-authenticity.ts:100`). `scoreAuthenticity` then subtracts 65
(`:129-131`), and a score under 40 (`SUSPECT_THRESHOLD`, `:92`) is "suspect", which
holds the submission from auto-promotion for a live ownership interview (`:8-10`).

Executed against the committed modules (product code unchanged):

| input | score | band |
| --- | --- | --- |
| an observed session, decisions log present, no paste event | 100 | authentic |
| the same session with one paste event of 640 characters | 35 | suspect |
| the predicate at `devcase-run.ts:741` over 400 edit events with one 640-character paste in the middle | true | |

Three things follow.

- **The comment and the code disagree.** The authenticity module describes the rule as "a
  single large bulk paste ... with no incremental build-up" (`devcase-authenticity.ts:34-36`,
  the comment above `:129`). The predicate does not look for build-up: any one paste at or over 600
  characters fires it, after any amount of typing. The neighbouring technique on paste tells
  names the version that carries information (a block that arrives and is never touched
  again) and warns against thresholding the ratio at all.
- **The permission and the penalty pull opposite ways.** The intro says any tool is fine, and
  the chat panel offers a built-in assistant and says good prompts count in the
  candidate's favour. A candidate who asks it for a function and pastes it into the editor
  is the ordinary use, and it produces the value that holds the submission. The hold is a
  conversation and not a rejection, which is what the neighbouring rule asks (a person
  decides), and the sentence that would let the candidate weigh it is not on the screen.
- **The negative half and the fairness contract are stated in code and not to the
  candidate.** `process_events.py:14-18` states the fairness contract in its docstring
  ("over-reliance is NEVER inferred from tool use; we observe process artifacts ... never
  keystrokes or screens") and the chat evidence line says "observed; never a penalty"
  (`:147`). The paste rule is not in that list, and it is the one signal the module
  penalises.

## Absence is handled the way the technique asks

Where the record is missing the score does not punish it. An unread repository tree is
`null`, reported as "unread" and costing nothing (`devcase-authenticity.ts:22-26`,
`:147`), and an observed session has its commit-derived penalties waived because a
watched session has no git history by design (`:113`, `:166-167`). A signal absent is
unmeasured, not clean and not damning.

## What would close it

Two sentences on the intro screen: that the size of a paste is recorded, and that a large
one may hold the work for a conversation. Or the paste rule brought in line with its own
comment. Which, and whether the threshold should exist at all, is the assistance-detection
subject's question and the product owner's; this page records that the sentence and the
recorder differ.
