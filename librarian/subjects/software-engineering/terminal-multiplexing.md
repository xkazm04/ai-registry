---
subject: terminal-multiplexing
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# terminal-multiplexing

First touch: [[2026-08-27-herdr]] — run 29, an intake against a first-party
agent-runtime repository. Class: MATURE (forged 2026-08-18; this run took it
from six techniques to seven and corrected a golden-path rule).

## State

7 techniques, 2 applications (react, rust). Golden path ~290 lines. The
subject is unusually well-built: a two-column cost model (existence × N /
attention × K), a four-rung session ladder, and explicit boundary statements
against three neighbours. It is the kind of subject where the remaining gaps
are *stages*, not opinions.

## What run 29 changed

- **`occupant-state-detection` (NEW technique).** The subject modelled
  attachment thoroughly — who is *watching* a session — and had nothing on
  what is *running inside* it or whether it will accept input. The gap was
  visible only after reading the neighbour: see the boundary note below.
- **`bounded-replay-buffers` amended** with "The alternate screen is where the
  ring's promise ends", plus a `use_when` row. The technique had the
  alternate screen as a *replay-fidelity* concern (torn escape sequences, an
  unpaired switch) and not as history loss.
- **Golden path corrected.** The ladder's rule 1 — *"The ring never blinks…
  whatever the user missed is waiting in the tail"* — now carries its
  condition. The tail's promise is a promise to children that scroll.

## The boundary this subject shares with fleet-orchestration

Worth stating here because it was the run's hardest call and a later run will
face it again. **`fleet-orchestration/lifecycle-signals` owns the session
state machine** — the registry, the transition door, the staleness sweeper,
precedence when instruments disagree — and owns it well. Writing a lifecycle
model into this subject would have duplicated it.

The discriminating question is **which channel the occupant offers**:

- The occupant emits lifecycle hooks or a structured event stream →
  `lifecycle-signals`' tier one. Nothing here applies.
- The occupant is a third-party interactive program emitting nothing but the
  screen it paints → the classification is a *terminal* problem (which region
  of which buffer, and how much to believe it), so the substrate lives here
  and hands its result to that door as one more observation.

`lifecycle-signals` explicitly ranks raw output as its weakest evidence — "a
hung process can animate forever" — and is right to. The new technique is
what you build when the weakest channel is the only channel; it says so
twice, and says not to build it at all otherwise. Recorded from both sides:
see [[fleet-orchestration]].

## The finding shape worth reusing here

**This subject's golden path states its own completeness, in numbered rules
and in a rung table.** Both of run 29's corrections came from taking one such
rule literally and asking which tenant breaks it — and the answer was the
subject's *own* headline tenant, the coding-agent session, which is exactly
where a thorough document stops looking. When returning here, read the
numbered rules under "The session ladder" and the two-column cost table as
claims rather than as summary.

One such claim is still open and untriaged: the cost model's two columns
assume a single viewer, and a server-owned runtime fans every frame to N
attached clients — a third multiplier the table does not carry. See the
untriaged table in [[2026-08-27-herdr]] (#4).

## 2026-09-02 - deepen batch [[2026-09-02-1]]

The untriaged claim from run 29 (#4) **held**: the cost model's two columns
assume one viewer; a server-owned runtime emits every frame once per attached
client. Landed as a golden-path correction ("K counts attachments, not
sessions"; the rung is per attachment, the session's is the highest), a NEW
technique `multi-client-fan-out`, and a `c` application on the reference
multiplexer's tree at a pinned commit (third stack; pin in prose, no
`verified_against`, per the c-application precedent).

The technique's spine, all from maintainer source and man pages: the server
owns one screen model per session so a client stream is *derived* and
regenerable (discard-and-redraw for slow viewers); a byte-faithful subscriber
is paused and told how far behind it is; the child is throttled only when
nobody can consume; the buffer drains to the slowest un-paused reader; size
arbitration is a named policy, per surface, and control clients do not vote;
keyboards merge at the device so writes are permissioned per attachment.

Three numbered rules taken literally and corrected: "exactly one rung" (per
attachment), "exactly one keyboard" (per client), "focused session is
unevictable" (per client). Golden path's "GPU contexts in single digits per
process" was the wrong number - counted, not metered, oldest revoked - fixed
from the browser engine's own review.

Blind lane got the default backwards: predicted a slow tty client blocks the
pane; the tree discards and redraws, and "wait for the stuck display" is the
*older* lineage's default. Recorded because the next pass will guess the same.

### Open leads / proposals (placed)

- "Slowest un-paused reader pins the tail; pause or disconnect the laggard with
  the gap disclosed" is generic multi-consumer buffering. Recorded on
  [[streaming-output]]; this subject holds the terminal instance.
- A per-subscriber buffered-age field is a staleness signal lifecycle-signals
  could consume. Recorded on [[fleet-orchestration]].
- pty-management owes one sentence pointing at the M-heads-one-device policy.
  No note there; recorded here and in the run note.

### Impact (2026-09-02)

Stale verdicts after this landing: personas (1). Apply row for `multi-client-fan-out`: see `librarian/applied.md`.
