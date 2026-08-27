---
subject: terminal-multiplexing
domain: software-engineering
last_touched: 2026-08-27
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
