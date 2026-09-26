---
layer: technique
type: technique
subject: session-resume
technique: last-seen-anchors
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [briefing says nothing has changed, gating a presence stamp on visibility, deciding whether a watermark may trust the clock, stamping seen when a panel loaded earlier is opened]
---

# Last-seen anchors

Every "what changed while you were away" feature, at every granularity, is
one durable value plus a comparison. The value is the **last-seen anchor**:
a persisted timestamp, sequence number, or position recording the last
moment the user was demonstrably present at a given scope. The comparison
is everything downstream — new-since, changed-since, unread-count. Because
the whole feature funnels through this one value, the anchor's write and
read discipline *is* the feature's correctness; no downstream logic can
recover a delta the anchor already erased.

## The write protocol: interval plus departure

The anchor advances at two kinds of moment, and both are required:

- **On interval while present** — a heartbeat (order of a minute) stamps
  the anchor forward while the user is actively in the application. This
  is crash insurance: a process that dies without ceremony loses at most
  one interval of "away" accuracy, not the whole session. Without the
  heartbeat, a crash leaves the anchor at the *previous* session's
  departure, and the next briefing re-reports everything the user already
  saw — the briefing that cried wolf.
- **On departure** — window close, application quit, suspend, and the
  window becoming hidden. The clean exit records the true boundary,
  superseding the last heartbeat. Departure-only writing — the tempting
  simplification — loses the mark whenever the process dies uncleanly,
  which on a desktop is the common exit; the heartbeat is not optional.
  In a browser page the exit events are the unreliable ones: close on a
  mobile device fires none of them, and the unload event is being
  retired outright. There, the transition to *hidden* is the departure
  write and the last event a page can count on. Write there and never
  on unload.

A third write outranks both: **explicit acknowledgment**. When the user
dismisses the briefing — "I have seen this" in so many words — the anchor
advances immediately. Acknowledgment is the one write that needs no
presence inference, because it *is* presence. But it is presence *at the
content on screen*, and that content was evaluated earlier: the list was
loaded at mount, and the popover was opened an hour later. Advance to the
moment the acknowledged view was evaluated (its load time, or the newest
item it showed), never to the clock at the click. Otherwise everything
that arrived between the load and the look is marked seen without ever
having been shown, and it never comes back. The same holds for any
advance made after a delay, such as a dwell timer that fires hours later
in a tab brought forward.

Both writes share one precondition, and it is the law of the technique
([gate-sees-target](../../../../_laws.md#gate-sees-target)): the anchor claims
the user *saw* the state of the world at that moment, so it must advance
only when seeing was possible. A window that is minimized, hidden behind
others, on another virtual desktop, or on a locked screen is not being
seen. A heartbeat that ignores visibility advances the anchor through an
overnight lock screen, and the morning briefing — derived from an anchor
that says "you were here all night" — says nothing at all. Gate the
heartbeat on presence signals (focus, visibility, recent input), and
treat "presence unknown" as absent, not present: the failure mode of a
too-conservative anchor is a slightly over-full briefing; the failure
mode of a too-eager anchor is a briefing that omits what the user
actually missed. Over-reporting is recoverable noise; under-reporting is
an invisible lie.

## The read protocol: derive, then advance

On return, ordering is everything:

1. **Read** the anchor as it was.
2. **Derive** every delta from it — briefing, unread counts, new-badges.
3. **Only then advance** it (or better: advance it on the *next*
   heartbeat, once presence is re-established) — and only if the
   derivation *landed*. A load that failed, or a view closed before its
   data arrived, showed the user nothing; an advance there moves the
   threshold past deltas nobody saw. Commit the advance where the data
   is known to have rendered, not where the view opened.

The classic self-erasing bug is advancing the anchor in the startup path
before derivation runs — often by the same "we're running, stamp
presence" code that owns the heartbeat. The briefing then compares the
world against a moment two hundred milliseconds ago and concludes,
correctly and uselessly, that nothing has changed. If startup and
heartbeat share a code path, the first stamp must be explicitly deferred
until the derivations have captured the old value. A defensive shape that
makes the bug structurally impossible: derivation *snapshots* the anchor
into memory at first read, and all delta queries for the session run
against the snapshot, never the live value. In a component world the
natural home for the snapshot is a lazy state initializer that runs
exactly once at first render, before any effect can beat — but wherever
it lives, the snapshot looks like a stylistic choice and is load-bearing;
say so at the site. Where the page is rendered on a server, the server
load is the natural snapshot: one read per request, and nothing on the
client can advance the value underneath it.

"Once at first render" is once per *mount*, and a return is not always a
mount. A page restored whole from a back/forward cache comes back with
nothing re-run, so no initializer reads the anchor again. A window
refocused after hours is a return with no render at all. A kept-alive
view that is evicted and remounted runs its initializer *again*, after
the heartbeat has moved the value. So "return" is a set of events: cold
start, restore from a page cache, visible again after a long absence,
and resume from suspend. Each one either takes a fresh snapshot and
re-derives, or is declared not to be a return.

## Two species: presence anchors and consumption watermarks

The anchor pattern splits on one question: does it record that the user
*was present*, or that a consumer *processed items up to a point*? The
two species advance from different sources, and crossing them is a bug:

- A **presence anchor** records attention. Its correct source is the
  clock, gated on presence — "the user was demonstrably here at T." All
  of the above describes this species.
- A **consumption watermark** records progress through a stream — "this
  digest has incorporated events through T." Its correct source is the
  **observed data**: the maximum timestamp among the items actually
  consumed, never the clock. A clock read *after* a slow processing step
  advances the watermark past everything created during that step — not
  a delay but a permanent skip, sized by however long the step took. A
  clock read *before* the step is the weaker correct form (it merely
  repeats work); max-of-consumed is the strong form, because it cannot
  skip a row by construction.

A resume system usually holds both — the user's presence anchor and, if
briefings are precomputed by a background consumer, that consumer's
watermark — and their independence is the point: the user's "seen"
must never advance because a machine processed something, and vice
versa.

## Granularity: one mechanism, many scopes

The anchor is a pattern, not a singleton. Scopes form a ladder:

- **Global** — one anchor for "the user was in the application." Feeds
  the launch briefing.
- **Per-surface** — one anchor per section or list: "last time you
  looked at *this*." Feeds per-section new-badges and seen-watermarks.
- **Per-entity** — reading position inside one document, one thread, one
  transcript. The finest grain, and the one most often missing: the
  application that greets you by name and then dumps you at the top of a
  thousand-line thread kept the global anchor and skipped this one.

Each scope is a deliberate choice in the
[layered-place-restoration](./layered-place-restoration.md) audit — a
missing scope should be a recorded decision, not an accident. All scopes
share the same write/read protocol; a per-entity anchor advances when
*that entity* is visibly open, not when the application is merely
running. Storage for the finer grains is keyed by entity identity and
therefore unbounded — cap it or prune it; a per-entity anchor map that
only ever grows is the standard slow leak.

## Storage rules

- **Durable, small — and local only for one device.** The anchor must
  survive process death. It is a scalar per scope — resist the temptation
  to persist "what they'll be briefed on"; persist the anchor, derive the
  rest. For a single-device, local-first or anonymous application it
  lives in persisted client state (the persistence mechanics belong to
  the client-state subject). For an account used from more than one
  device or browser profile, the presence anchor belongs to the account,
  on the server. A local copy fails both ways: a new device reads as a
  first run and stays silent over a real delta, and reading on one device
  never advances another, which then re-briefs what was already seen.
  Scroll positions and drafts stay per device; "seen" is per account.
- **Forward only.** Once the advance is no longer the local clock — an
  acknowledgment through a load time, a write from another device or
  tab — an older writer can arrive late. Guard the write so the anchor
  never moves back: take the maximum, as a condition in the write itself
  rather than a read-modify-write.
- **Clock honesty.** A timestamp anchor compares against event times
  produced elsewhere. If those events are stamped by another machine,
  clock skew turns into wrongly-included or wrongly-excluded deltas;
  prefer comparing within one clock domain, or use monotonic sequence
  numbers where the event source provides them.
- **Absent means first run.** No anchor is a meaningful state — it is the
  first-run signal that
  [first-run-and-quiet-silence](./first-run-and-quiet-silence.md) consumes.
  Never default a missing anchor to "epoch zero" (everything becomes
  new) or to "now" (nothing ever will be); default it to *absent* and let
  the consumer decide.

## Decision rules

- Advance on presence-gated heartbeat, on departure/hide, and on
  explicit acknowledgment; treat unknown presence as absence. In a
  browser page the departure write is the transition to hidden, never
  unload.
- An acknowledgment advances to what the acknowledged view was
  evaluated through (its load time or newest shown item), never to the
  clock at the click.
- Read and snapshot before any advance; derive all deltas from the
  snapshot; advance only after the derivation landed.
- Return is an event set (cold start, page-cache restore, visible after
  long absence, resume): each re-snapshots or is declared not a return.
- Local storage for one device; the account's server for many. Writes
  never move the anchor backwards.
- Presence anchors advance from the (presence-gated) clock; consumption
  watermarks advance from the max timestamp of items actually consumed,
  never from a clock read after the processing step.
- One protocol, explicit scopes: global, per-surface, per-entity — each
  scope's existence or absence is a recorded decision.
- Persist scalars, derive summaries; never persist the briefing itself.
- A missing anchor is "first run," not zero and not now.
- Per-entity anchor maps name their cap and pruning rule at creation.
