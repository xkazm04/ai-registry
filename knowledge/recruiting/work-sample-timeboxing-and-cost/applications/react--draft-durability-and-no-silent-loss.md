---
layer: application
type: application
subject: work-sample-timeboxing-and-cost
technique: draft-durability-and-no-silent-loss
stack: react
---

# The live work surface: nothing a candidate typed is ever silently gone

`app/devcase/apply/[token]/LiveWorkSurface.tsx` is the in-product editor a
candidate works in during a timed case, with
`app/devcase/apply/[token]/liveWorkDraft.ts` as its durable local copy.

## Why the local copy exists

`liveWorkDraft.ts:7-13` states the failure it was built for:

> "the surface already flushes to the server every FLUSH_MS and re-buffers a
> batch in memory (pendingRef) when a flush fails — but that buffer, and the
> `files` React state itself, live ONLY in memory. A reload, a crashed tab, or a
> laptop that sleeps through a flaky-wifi gap loses everything back to the frozen
> seed, even though most of the work was never actually gone — it just never
> survived a page life-cycle event."

The server flush is the system of record; local storage is what survives the
failure that actually happens. Written on every meaningful change
(`LiveWorkSurface.tsx:66-79`, and again after every flush outcome), read once on
mount to resume (`:82-98`).

## The four properties the standard asks for

- **Persist continuously, not on an interval tuned to write cost.**
  `persistDraft()` runs from the `files` effect (`:104-106`), so every edit is
  durable immediately; the eight-second server flush is a separate, slower path.
- **Restore visibly.** `setRestored(true)` renders the candidate-facing line
  "We restored your unsaved work from this device. Nothing was lost."
  (`messages/en.json` → `devApply.workSurface.restored`, rendered at `:361-364`).
  The comment at `:82-85` accepts a brief seed→restored flash on purpose:
  "silent, permanent loss is the worse failure mode."
- **A save failure never blocks typing.** `persistDraft` is wrapped in
  `try/catch` — quota, private-browsing lockout — and documented as "best-effort
  backstop, not the only copy" (`:76-79`). The editor keeps working.
- **A refusal is stated, not retried forever.** A 403 from the flush endpoint
  sets `syncBlocked` (`:184-191`) and renders "We couldn't sync this session to
  the server. Your work is saved on this device. Reload the page from your
  original link to reconnect." — a failure, a reassurance, and a route out, in
  three sentences.

## The dead-session rule, learned here

`:192-203`: a 404 or 409 means the session row is gone or already submitted
(another tab or device won a race). Retrying the same identifier "would spin
without landing", so the identifier is dropped, `ensureSession()` mints a fresh
one, and the buffered batch and file tree are carried across. The container died;
the work did not. This is the source of the standard's rule that an identifier
which cannot land is never retried — a silent spin during a timed exercise is
indistinguishable, from the candidate's side, from working normally right up to
the moment they lose everything.

Network failures take the other branch (`:210-215`): re-buffer, persist, retry on
the next tick — "if the tab dies first the draft survives anyway."

## Shared devices and untrusted local state

Two disciplines the standard now carries because this file had them first:

- The draft key is scoped per apply token (`liveWorkDraft.ts:32-34`,
  `kp:devcase:livework:<token>`) precisely "so a shared device never bleeds one
  candidate's draft into another's case" (`LiveWorkSurface.tsx:59-61`), and a
  successful submission removes the key (`:273-277`).
- Local storage is candidate-writable, so `decodeDraft` parses defensively
  against the server's own bounds — 50 files, 256 KiB each, 2000 pending events,
  a closed set of event kinds (`liveWorkDraft.ts:16-23`) — and returns null on
  anything malformed. A durability mechanism that could itself crash the tab or
  smuggle an oversized payload into the next flush would not be durability.

## Stated limits, never silent failures

The chat route's throttle comment
(`app/api/devcase/session/[id]/chat/route.ts:19-39`) is the address-keying rule in
its own words: both windows are keyed to "things an abuser cannot rotate (never
the caller's IP: candidates legitimately share a NAT, and IP-throttling an
assessment surface punishes the honest case)". The per-session window is 30 per
10 minutes against a fastest honest pace of roughly one message per 40–60
seconds — two to three times the real ceiling, so "a candidate never meets it."

The collective-budget trap is visible here too: the token is per-*posting*, not
per-candidate, so the 3000/24h budget is shared across every applicant — which is
why the tight bound has to be the per-session one.

And the closing line of that comment is the rule itself: "an exhausted budget must
read as a stated limit, never as a failure that looks like lost work." The
candidate sees "You've reached the assistant limit for now. Your work and
everything you've written are safe. Keep working and try again in a few minutes."
(`devApply.workSurface.chatRateLimited`).

## Adjacent confirmations and deviations

The same surface carries the observation contract in plain words — "We record
your process: what you open, what you edit, and what you note in DECISIONS.md …
You may use any tools, including AI. We never record keystrokes or your screen."
(`devApply.workSurface.intro`) — matching the fairness contract in the derivation
module (`pipeline/jobfit/devcase/process_events.py:14-18`). The phone advisory is
advisory, exactly as the standard requires: "This case is easiest to work on a
computer, and the same link opens it there. You can still continue on your phone."
(`devApply.workSurface.phoneAdvisory`) — information plus a route, no gate. And
the closure card gives a definite next step and a durable handle
(`submittedNext`, `submittedRef`), with a non-adverse feedback brief assembled for
candidates who are not promoted (`app/_lib/devcase-feedback.ts:1-9`, which names
the failure it fixes: "everyone below the floor is silently dropped — classic
take-home ghosting").

Deviations at this seam: there is **no timer state persisted with the draft** and
no elapsed-time allowance, so an outage the candidate did not cause cannot stop
their clock; and there is **no accommodation route** — no published offer of extra
time or an alternative format anywhere in the candidate-facing copy, and no field
that could carry a granted adjustment separately from the designed timebox.
