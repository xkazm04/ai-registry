---
layer: application
type: application
subject: work-sample-timeboxing-and-cost
technique: draft-durability-and-no-silent-loss
stack: react
verified_on: 2026-09-29
verified_against: react@19
---

# The live work surface: nothing a candidate typed is ever silently gone

Written from the tree at kp `60aab8088` (2026-09-29). Every line reference from the
2026-08-20 version had moved: the sync logic was lifted out of the surface into a tested
client, `app/devcase/apply/[token]/liveWorkSync.ts`, and the draft grew fields.

`app/devcase/apply/[token]/LiveWorkSurface.tsx` is the in-product editor a candidate works
in during a timed case; `liveWorkDraft.ts` is its durable local copy and `liveWorkSync.ts`
the engine that flushes to the server.

## Why the local copy exists

`liveWorkDraft.ts` opens by stating the failure it was built for: the server flush and its
in-memory re-buffer live only in memory, so "a reload, a crashed tab, or a laptop that
sleeps through a flaky-wifi gap loses everything back to the frozen seed, even though most
of the work was never actually gone". The server flush is the system of record; local
storage is what survives the failure that actually happens.

## The properties the technique asks for

- **Persist continuously, not on an interval tuned to write cost.** `persistDraft()`
  (`LiveWorkSurface.tsx:143-149`) is bound as the sync engine's persist hook
  (`:150`) and runs after every recorded event, every edit (`liveWorkSync.ts:220-228`),
  every flush outcome, and on any change to the chat, name or contact fields
  (`:185-190`). The eight-second server flush is a separate, slower path (`FLUSH_MS`,
  `:28`); edits are debounced 600 ms into process events (`EDIT_DEBOUNCE_MS`, `:29`),
  while the draft itself is written on each change.
- **Restore visibly.** The resume effect (`:156-181`) hydrates the sync engine, the chat
  and the identity fields from storage and sets `restored`, which renders "We restored
  your unsaved work from this device. Nothing was lost." (`:326-329`, `messages/en.json`
  `devApply.workSurface.restored`). The comment accepts a brief seed-then-restored flash
  on purpose: "silent, permanent loss is the worse failure mode."
- **A save failure never blocks typing.** The draft write is best-effort and the editor
  keeps working when storage is unavailable; the flush re-buffers on any network failure
  and retries on the next tick (`liveWorkSync.ts:310-313`).
- **A refusal is stated, not retried forever.** A 403 with a key sets `syncBlocked`
  (`liveWorkSync.ts:274-285`) and renders "We couldn't sync this session to the server.
  Your work is saved on this device. Reload the page from your original link to
  reconnect." (`:331-334`): a failure, a reassurance and a route out in three sentences.
- **A submission is sealed only after the last flush lands, and the draft is cleared only
  then** (`liveWorkSync.ts:319-346`, `LiveWorkSurface.tsx:115-118`). An unlanded final
  flush is a retryable error that leaves the session active and the draft on disk.

## The dead-session rule, and the new key

`liveWorkSync.ts:287-296`: a 404 or 409 means the session row is gone or already sealed
(another tab or device won a race). Retrying the same identifier "would spin without
landing", so the id and its key are dropped, the buffered batch is re-buffered, and the
next flush mints a fresh session. The container died; the work did not.

New since the first version: a session now has a **per-attempt key** the mint hands the
device, stored with the id it proves (`liveWorkDraft.ts:40`, `:73-74`), because the
candidate doors stopped trusting a shared link. A draft written before the key existed
flushes keyless, and a keyless 403 re-mints exactly once and carries the tree and the
buffer to the new attempt (`liveWorkSync.ts:276-284`); a second 403 is a real refusal.
The durability rule survived a change to the door's authentication because the work never
lived in the session.

## Shared devices and untrusted local state

- The draft key is scoped per apply token (`draftStorageKey`, `liveWorkDraft.ts:49-51`,
  `kp:devcase:livework:<token>`) and a successful submission removes it
  (`liveWorkSync.ts:346`). That keeps one posting's draft out of another posting's page,
  which is the sentence the code comment claims ("so a shared device never bleeds one
  candidate's draft into another's", `LiveWorkSurface.tsx:45`), and it is narrower than
  the technique's rule. See the first deviation below.
- Local storage is candidate-writable, so `decodeDraft` parses defensively against the
  server's own bounds: 50 files, 256 KiB each, 2000 pending events, 2000 chat messages,
  512-character identity fields, a closed set of event kinds and chat roles
  (`liveWorkDraft.ts:20-27`), and returns null on anything malformed.

## Stated limits, never silent failures

The chat route's throttle comment (`app/api/devcase/session/[id]/chat/route.ts:20-40`,
enforcement at `:90` and `:93`) is the address-keying rule in its own words: both windows
are keyed to "things an abuser cannot rotate (never the caller's IP: candidates
legitimately share a NAT, and IP-throttling an assessment surface punishes the honest
case)". The per-session window is 30 per 10 minutes against a fastest honest pace of
roughly one message per 40-60 seconds, two to three times the real ceiling. The token is
per posting, so the 3000 per 24 hours budget is collective, and the comment states the
consequence: it "leaves 60 chat messages per session at full quota" given the posting's
50-sessions-a-day cap, which is why the tight bound is the per-session one. The client
renders a distinct line for an exhausted budget, "Your work and everything you've written
are safe" (`devApply.workSurface.chatRateLimited`), so a limit never reads as lost work.

## Adjacent confirmations

- The phone advisory is advisory: "This assignment is easiest to work on a computer, and
  the same link opens it there. You can still continue on your phone."
  (`LiveWorkSurface.tsx:321`), information plus a route, no gate.
- The closure card gives a definite next step and a durable handle (`:308-309`,
  `submittedNext`, `submittedRef`), and a non-adverse feedback brief is assembled for
  candidates who are not promoted (`app/_lib/devcase-feedback.ts:1-9`, which names the
  failure it fixes: "classic take-home ghosting").
- A recruiter closing the role's intake mid-attempt is told to the candidate and the work
  is kept (`liveWorkSync.ts`, the `intakeClosed` path): the seal would only answer 410,
  so the surface says so before it tries.

## Deviations

- **The local copy is scoped to the posting, not to the candidate.** The apply token is
  per posting and shared by every applicant (the chat route's own comment says so), so the
  key is the same for everyone who opens the link on one browser profile. The draft holds
  the name and contact fields, the chat, the files, the session id and its key
  (`liveWorkDraft.ts:36-47`), and the resume effect reads it by that key alone
  (`LiveWorkSurface.tsx:157`). Executed: the module's own `encodeDraft` and `decodeDraft`
  with a candidate A's draft stored under a posting token, then read with the same token
  as candidate B, hand B `Candidate A`, A's contact, A's session id and key, and A's file
  contents. The condition is an abandoned, unsubmitted draft on a shared machine (a
  library terminal or a lab, the technique's own examples): a submission clears the key.
  Not run end to end in a browser. The technique asks for the copy to be scoped to the
  individual invitation, and this is the case where the two differ.
- **The clock survives a reload, and runs through an outage.** The timer is now a server
  fact: the flush returns `elapsedMinutes` from the session row's `created_at`
  (`app/api/devcase/session/[id]/route.ts:192`) and the surface ticks it locally between
  flushes (`liveWorkSync.ts:244`), so a reload, a second device or a restored draft cannot
  reset it. That closes the reset-clock failure the previous version recorded. It is
  wall-clock: nothing pauses it for an outage the candidate did not cause, and the surface
  says so only when the candidate is past the box ("You are {over} past the {timebox}
  timebox. You can still submit; the time you took is recorded with your work.",
  `devApply.workSurface.clockOver`).
- **No accommodation route.** No published offer of extra time or an alternative format
  appears in any string under `devApply`, and no field can carry a granted adjustment
  apart from the designed timebox. Checked again in 2026-09-29 by reading the whole
  namespace.
