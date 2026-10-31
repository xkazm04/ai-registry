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

## 2026-09-04 - /intake `Everywhere` (run `everywhere-build`)

Four techniques, and a tier the subject did not have. It modelled tier one (the
occupant announces its own transitions, deferred to `lifecycle-signals`) and
tier three (it announces nothing, so `occupant-state-detection` classifies its
screen, which says in its own words that where the occupant emits events "this
technique should not be built at all"). **Tier two is hooks you inject into a
third party** - the occupant did not ship a protocol, it accepted one - and the
distinctive cost is not parsing, it is that the host now runs two tiers of
evidence over one stream.

- **`completion-authority-arbitration`** - promotion must **revoke**, not
  outrank. Ranking answers the case where both tiers speak and disagree; it does
  not answer the case that occurs, where the protocol tier says a command
  started and then correctly says nothing because the command is sleeping. A
  lower-ranked rule that can still fire while the higher-ranked one is silent
  has not been outranked, it has been made the default. Observed: a two-second
  quiet window read as completion, the pseudo-terminal torn down on a
  ten-second sleep, one line of a three-line script returned as the result.
- **`readiness-edge-detection`** - wait for the edge, not the first sighting;
  and emit the readiness marker only after the mode it advertises is actually
  enabled. One rule from two sides, kept in one file deliberately.
- **`capability-revalidation`** - a capability probed once and trusted forever
  is the failure. Adds a **bounded acknowledgement window** the brief did not
  ask for, and the argument is sound: "silence is not completion" plus "the
  start marker can be swallowed" compose into a run that waits forever, because
  every protocol terminator is a positive event and a run that never entered
  the tier has no reachable terminator.
- **`injected-hook-reconvergence`** - an injected hook loading before
  user-controlled configuration must re-converge, because load order guarantees
  it will be overridden. Adds **assert-and-repair, never reinstall** (per-cycle
  re-convergence implemented as re-running the installer appends a duplicate
  hook every prompt) and a narrow-scope clause: re-converge the protocol's
  invariants, never the user's preferences, or the integration gets disabled
  and takes the tier with it.

`occupant-state-detection` gained a paragraph pointing at the middle tier, so
the boundary is stated from both sides.

**The subject-split question was raised and declined, with a revisit
condition.** The worker's argument: these four are not about *driving* a session
but about what the host may believe from a stream, which is the same question
the other two tiers answer; split out, this golden path would carry a tier-two
hole and `occupant-state-detection` would need a cross-subject pointer. The
subject's stated scope ("N sessions, K eyes") is about cost, and tier two costs
nothing per session. Revisit if the cluster passes roughly six techniques, at
which point `occupant-state-detection` moves with it.

Unapplied: no authorized fleet project injects a shell-integration script.
Return condition in `applied.md`.

## Architecture review - 2026-10-31

First architecture review, against `a2473a65c`. All 18 documents read in full:
the golden path, twelve techniques, five applications. The subject holds
together. The two-column cost model, the ladder and the three-tier evidence
model are each stated once and deferred to from every technique. The tmux
application's load-bearing mechanics were re-read at its pinned commit
`1dd1717` and all hold: the block thresholds, the discard-and-redraw timer, the
pause/continue and "too far behind" fork, the drain to the slowest un-paused
reader, control clients excluded from sizing, and the CHANGES version
attributions (window-size 2.9, latest as default 3.1, pause 3.2). GNU screen's
manual confirms the multi-client technique's claim about the older lineage:
`nonblock` is off by default, so screen "waits until the display restarts to
accept the output". The semantic-prompts proposal names one role as "end of
prompt and start of user input" (`OSC 133;B`). readiness-edge-detection arms on
that role but leaves it out of its own list of roles. Three internal wording
errors were found: that missing role, a rule count in keystroke-injection, and a
per-process/per-page mismatch in renderer-economics. The product tree behind
the four product applications has moved since they were written. One recorded
deviation is now fixed (resize skips the no-op), a WebGL budget has been added,
and the line anchors have drifted. Those applications are `reverify`. No
verification date was refreshed in this record.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/terminal-multiplexing",
  "date": "2026-10-31",
  "baseline": "a2473a65c",
  "digest": "sha256-b2:c3ef11aba4a471f5",
  "disposition": "clarify",
  "coverage": "All 18 documents read in full. Source checks: the tmux tree at the pinned commit (tty.c, control.c, server-client.c, resize.c, tmux.1, CHANGES), the GNU screen manual's nonblock entry, the semantic-prompts proposal, and a spot-check of the product tree at its current head. Product applications were not exhaustively re-anchored.",
  "trigger": "Pending: no architecture-review record existed.",
  "intended_benefit": "A host running N terminal sessions with K watched spends per-session costs only where attention is, re-attaches without loss, and drives occupants on evidence it can defend.",
  "failure_if_ignored": "Renderers and subscriptions scale with N; detach kills or leaks sessions; automation types into dialogs or harvests a quiet screen as a finished run.",
  "boundary": "Begins at the pseudo-terminal and ends at the pixels. Spawn and reap belong to subprocess-lifecycle, the roster and the lifecycle state machine to fleet-orchestration, generic buffering to streaming-output, the reload-survival ladder to client-state.",
  "counterexamples": [
    "A single-viewer desktop host has M = 1 everywhere; multi-client-fan-out collapses to the golden path's table and should not be built.",
    "An occupant that emits native lifecycle events makes occupant-state-detection unnecessary; the technique says not to build it.",
    "A full-screen occupant on the alternate screen defeats the ring's tail promise: replay reconstructs the current grid, not a transcript.",
    "The older multiplexer lineage (GNU screen) defaults to waiting on a stalled display, the opposite of the non-blocking default the subject prescribes.",
    "A web terminal that spawns one child per connection has no shared session, so fan-out policy has nothing to arbitrate."
  ],
  "sources": [
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/tty.c",
      "result": "TTY_BLOCK_START/STOP at 8x and 1/8 of sx*sy, 100 ms interval; tty_block_maybe drains the whole queue and logs \"can't keep up\"; the timer clears TTY_BLOCK and calls tty_invalidate once discards fall below the stop threshold. Supports the c application and the technique's discard-and-redraw rule."
    },
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/control.c",
      "result": "control_check_age: with pause-after set, the pane is paused, discarded and \"%pause\" sent; otherwise, past CONTROL_MAXIMUM_AGE 300000, the client exits with \"too far behind\". control_continue_pane resets the offset to the pane's current offset. Supports the paused-and-told rule."
    },
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/server-client.c",
      "result": "server_client_check_pane_buffer comment: \"If there is data remaining, and there are no clients able to consume it, do not read any more.\" Supports throttling the child only when nobody can consume it."
    },
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/resize.c",
      "result": "default_window_size ignores the client \"if it is a control client\". Supports control-plane clients not voting."
    },
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/CHANGES",
      "result": "Pause mechanism in the 3.1c-to-3.2 section; \"latest\" window-size \"This is now the default\" in 3.0a-to-3.1; clipped-viewport cost warning in the 2.9 section. Attributions confirmed."
    },
    {
      "url": "https://www.gnu.org/software/screen/manual/screen.html",
      "result": "nonblock: \"If nonblock is off (this is the default) screen waits until the display restarts to accept the output.\" Confirms the older lineage's blocking default. When the option was added was not checked."
    },
    {
      "url": "https://gitlab.freedesktop.org/Per_Bothner/specifications/-/raw/master/proposals/semantic-prompts.md",
      "result": "OSC 133;A starts the prompt, 133;B is \"End of prompt and start of user input\", 133;C is \"End of input, and start of output\", 133;D is \"End of current command\" with an exit code. Supports the five-role boundary vocabulary in the golden path. readiness-edge-detection's list omits B, the role it arms on."
    },
    {
      "source": "Product tree at its current head (spot-check)",
      "result": "MAX_PARKED = 6 and OUTPUT_RING_CAP 512 KiB still present; `subscribed: bool` still the attachment set; the payload sniff still routes to write_text_line. pushResize now skips the no-op, contradicting a recorded deviation; a WebGL budget was added; line anchors drifted."
    }
  ],
  "documents": {
    "terminal-multiplexing.md": {
      "disposition": "keep",
      "reason": "Boundaries with four neighbours stated once; the cost model's K-counts-attachments caveat, the alternate-screen condition on rule 1, and the three-tier evidence model are internally consistent with the techniques. The GPU-cap claim agrees with the Chromium evidence the react application cites."
    },
    "techniques/attach-detach-lifecycle.md": {
      "disposition": "keep",
      "reason": "Ordered teardown, least-recently-viewed eviction, and focus unevictable with a budget of at least two all hold; the per-client clause defers correctly to multi-client-fan-out."
    },
    "techniques/bounded-replay-buffers.md": {
      "disposition": "keep",
      "reason": "Defers the generic discipline to streaming-output; the position-keyed and atomic-snapshot splices are both sound; the alternate-screen boundary and its gated recoveries are stated with their limits."
    },
    "techniques/renderer-economics.md": {
      "disposition": "clarify",
      "reason": "Says platforms cap GPU contexts \"per process\"; the golden path (corrected 2026-09-02) and the cited browser evidence say per process or page. Align the wording."
    },
    "techniques/pty-management.md": {
      "disposition": "keep",
      "reason": "Lineage differences are stated as semantics without overclaiming; the rule that process wait gives the verdict and stream end only corroborates it is sound."
    },
    "techniques/keystroke-injection.md": {
      "disposition": "clarify",
      "reason": "\"Two rules make the notation trustworthy\" introduces three bullets, and \"the logging rule above\" points to a rule stated in the final section below. Fix the count and the direction."
    },
    "techniques/multiplexer-state.md": {
      "disposition": "keep",
      "reason": "The single dispatcher, the view-as-loan model, and focus as a per-client singleton with write permission deferred to fan-out are coherent; reload-survival duties are layered on client-state rather than restating it."
    },
    "techniques/occupant-state-detection.md": {
      "disposition": "keep",
      "reason": "Ranks channels and reads from a buffer the user cannot scroll; unknown is never spent as an answer; a programmatic read never marks a session seen. The boundary with lifecycle-signals is stated from both sides. Its dated spinner versions are illustrative, not load-bearing."
    },
    "techniques/multi-client-fan-out.md": {
      "disposition": "keep",
      "reason": "Every mechanic re-confirmed in the pinned tmux tree. The older lineage's blocking default is confirmed by the screen manual; the claim that its non-blocking option came later was not dated."
    },
    "techniques/completion-authority-arbitration.md": {
      "disposition": "keep",
      "reason": "Revoke-not-outrank, the closed set of positive terminators, and a heuristic tier that never asserts exit status are consistent with the semantic-prompts vocabulary, where only D carries an exit code."
    },
    "techniques/readiness-edge-detection.md": {
      "disposition": "clarify",
      "reason": "Lists prompt-start, command-line, execution and completion roles, then says exactly one role means the input path is live. That role (OSC 133;B, \"start of user input\") is missing from the list. Add it."
    },
    "techniques/capability-revalidation.md": {
      "disposition": "keep",
      "reason": "Revalidates per run with a bounded acknowledgement window, so an infinite wait cannot happen. Demotion is per run and recorded. Consistent with arbitration and readiness."
    },
    "techniques/injected-hook-reconvergence.md": {
      "disposition": "keep",
      "reason": "Repairs on assert and never reinstalls, limits itself to the integration's own invariants, and steps down loudly when it cannot converge. No external claim needing a source."
    },
    "applications/react--attach-detach-lifecycle.md": {
      "disposition": "reverify",
      "reason": "Product tree moved: pushResize now skips the no-op (recorded deviation resolved), a WebGL budget constant was added beside MAX_PARKED, and line anchors drifted. Needs a full re-anchor at a pinned commit."
    },
    "applications/react--keystroke-injection.md": {
      "disposition": "reverify",
      "reason": "Structure still present (the payload sniff routes to write_text_line), but anchors drifted from the pinned 2b5e24223. The four naive call sites and the paste tests were not re-located."
    },
    "applications/rust--pty-management.md": {
      "disposition": "reverify",
      "reason": "Not re-anchored this run; its deviations (temp cleanup, geometry ordering, unobservable submit outcome) may have been fixed as the neighbouring react deviation was."
    },
    "applications/rust--multi-client-fan-out.md": {
      "disposition": "keep",
      "reason": "Negative application labelled unapplied. Its return condition (`subscribed: bool` replaced by a set) has not triggered: the field is unchanged at head."
    },
    "applications/c--multi-client-fan-out.md": {
      "disposition": "keep",
      "reason": "Load-bearing citations re-read at the pinned commit 1dd1717 and confirmed. Line anchors match within a line or two. Its limits section is honest."
    }
  }
}
```

### Re-record after apply - 2026-10-31

Applied the three technique clarifications from the record above: the
per-process-or-page cap wording in renderer-economics, the rule count and
pointer direction in keystroke-injection, and the missing input-start role in
readiness-edge-detection. Moved the c application's `verified_on` to
2026-10-31, because its citations were re-read at the pin this run. No
document is left owing a clarification. The overall disposition is now
`reverify`: the three product applications still need re-anchoring at a pinned
commit of the product tree, and nothing else is outstanding.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/terminal-multiplexing",
  "date": "2026-10-31",
  "baseline": "a2473a65c",
  "digest": "sha256-b2:5a9b9587de8d6709",
  "disposition": "reverify",
  "coverage": "All 18 documents read in full. Source checks: the tmux tree at the pinned commit (tty.c, control.c, server-client.c, resize.c, tmux.1, CHANGES), the GNU screen manual's nonblock entry, the semantic-prompts proposal, and a spot-check of the product tree at its current head. Product applications were not exhaustively re-anchored. Second record: the three technique clarifications were applied, and the c application's verified_on was moved after its re-check. The three product applications remain reverify.",
  "trigger": "Pending: no architecture-review record existed.",
  "intended_benefit": "A host running N terminal sessions with K watched spends per-session costs only where attention is, re-attaches without loss, and drives occupants on evidence it can defend.",
  "failure_if_ignored": "Renderers and subscriptions scale with N; detach kills or leaks sessions; automation types into dialogs or harvests a quiet screen as a finished run.",
  "boundary": "Begins at the pseudo-terminal and ends at the pixels. Spawn and reap belong to subprocess-lifecycle, the roster and the lifecycle state machine to fleet-orchestration, generic buffering to streaming-output, the reload-survival ladder to client-state.",
  "counterexamples": [
    "A single-viewer desktop host has M = 1 everywhere; multi-client-fan-out collapses to the golden path's table and should not be built.",
    "An occupant that emits native lifecycle events makes occupant-state-detection unnecessary; the technique says not to build it.",
    "A full-screen occupant on the alternate screen defeats the ring's tail promise: replay reconstructs the current grid, not a transcript.",
    "The older multiplexer lineage (GNU screen) defaults to waiting on a stalled display, the opposite of the non-blocking default the subject prescribes.",
    "A web terminal that spawns one child per connection has no shared session, so fan-out policy has nothing to arbitrate."
  ],
  "sources": [
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/tty.c",
      "result": "TTY_BLOCK_START/STOP at 8x and 1/8 of sx*sy, 100 ms interval; tty_block_maybe drains the whole queue and logs \"can't keep up\"; the timer clears TTY_BLOCK and calls tty_invalidate once discards fall below the stop threshold. Supports the c application and the technique's discard-and-redraw rule."
    },
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/control.c",
      "result": "control_check_age: with pause-after set, the pane is paused, discarded and \"%pause\" sent; otherwise, past CONTROL_MAXIMUM_AGE 300000, the client exits with \"too far behind\". control_continue_pane resets the offset to the pane's current offset. Supports the paused-and-told rule."
    },
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/server-client.c",
      "result": "server_client_check_pane_buffer comment: \"If there is data remaining, and there are no clients able to consume it, do not read any more.\" Supports throttling the child only when nobody can consume it."
    },
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/resize.c",
      "result": "default_window_size ignores the client \"if it is a control client\". Supports control-plane clients not voting."
    },
    {
      "url": "https://github.com/tmux/tmux/blob/1dd1717/CHANGES",
      "result": "Pause mechanism in the 3.1c-to-3.2 section; \"latest\" window-size \"This is now the default\" in 3.0a-to-3.1; clipped-viewport cost warning in the 2.9 section. Attributions confirmed."
    },
    {
      "url": "https://www.gnu.org/software/screen/manual/screen.html",
      "result": "nonblock: \"If nonblock is off (this is the default) screen waits until the display restarts to accept the output.\" Confirms the older lineage's blocking default. When the option was added was not checked."
    },
    {
      "url": "https://gitlab.freedesktop.org/Per_Bothner/specifications/-/raw/master/proposals/semantic-prompts.md",
      "result": "OSC 133;A starts the prompt, 133;B is \"End of prompt and start of user input\", 133;C is \"End of input, and start of output\", 133;D is \"End of current command\" with an exit code. Supports the five-role boundary vocabulary in the golden path. readiness-edge-detection's list omits B, the role it arms on."
    },
    {
      "source": "Product tree at its current head (spot-check)",
      "result": "MAX_PARKED = 6 and OUTPUT_RING_CAP 512 KiB still present; `subscribed: bool` still the attachment set; the payload sniff still routes to write_text_line. pushResize now skips the no-op, contradicting a recorded deviation; a WebGL budget was added; line anchors drifted."
    }
  ],
  "documents": {
    "terminal-multiplexing.md": {
      "disposition": "keep",
      "reason": "Boundaries with four neighbours stated once; the cost model's K-counts-attachments caveat, the alternate-screen condition on rule 1, and the three-tier evidence model are internally consistent with the techniques. The GPU-cap claim agrees with the Chromium evidence the react application cites."
    },
    "techniques/attach-detach-lifecycle.md": {
      "disposition": "keep",
      "reason": "Ordered teardown, least-recently-viewed eviction, and focus unevictable with a budget of at least two all hold; the per-client clause defers correctly to multi-client-fan-out."
    },
    "techniques/bounded-replay-buffers.md": {
      "disposition": "keep",
      "reason": "Defers the generic discipline to streaming-output; the position-keyed and atomic-snapshot splices are both sound; the alternate-screen boundary and its gated recoveries are stated with their limits."
    },
    "techniques/renderer-economics.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: GPU-context cap now reads \"per process or page\", matching the golden path and the cited browser evidence."
    },
    "techniques/pty-management.md": {
      "disposition": "keep",
      "reason": "Lineage differences are stated as semantics without overclaiming; the rule that process wait gives the verdict and stream end only corroborates it is sound."
    },
    "techniques/keystroke-injection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"Two rules\" -> \"Three rules\" to match the three bullets; \"the logging rule above\" -> \"below\", where the rule is stated."
    },
    "techniques/multiplexer-state.md": {
      "disposition": "keep",
      "reason": "The single dispatcher, the view-as-loan model, and focus as a per-client singleton with write permission deferred to fan-out are coherent; reload-survival duties are layered on client-state rather than restating it."
    },
    "techniques/occupant-state-detection.md": {
      "disposition": "keep",
      "reason": "Ranks channels and reads from a buffer the user cannot scroll; unknown is never spent as an answer; a programmatic read never marks a session seen. The boundary with lifecycle-signals is stated from both sides. Its dated spinner versions are illustrative, not load-bearing."
    },
    "techniques/multi-client-fan-out.md": {
      "disposition": "keep",
      "reason": "Every mechanic re-confirmed in the pinned tmux tree. The older lineage's blocking default is confirmed by the screen manual; the claim that its non-blocking option came later was not dated."
    },
    "techniques/completion-authority-arbitration.md": {
      "disposition": "keep",
      "reason": "Revoke-not-outrank, the closed set of positive terminators, and a heuristic tier that never asserts exit status are consistent with the semantic-prompts vocabulary, where only D carries an exit code."
    },
    "techniques/readiness-edge-detection.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the input-start role (end of prompt, start of user input; semantic-prompts OSC 133;B) to the role list and named it as the command-ready edge."
    },
    "techniques/capability-revalidation.md": {
      "disposition": "keep",
      "reason": "Revalidates per run with a bounded acknowledgement window, so an infinite wait cannot happen. Demotion is per run and recorded. Consistent with arbitration and readiness."
    },
    "techniques/injected-hook-reconvergence.md": {
      "disposition": "keep",
      "reason": "Repairs on assert and never reinstalls, limits itself to the integration's own invariants, and steps down loudly when it cannot converge. No external claim needing a source."
    },
    "applications/react--attach-detach-lifecycle.md": {
      "disposition": "reverify",
      "reason": "Product tree moved: pushResize now skips the no-op (recorded deviation resolved), a WebGL budget constant was added beside MAX_PARKED, and line anchors drifted. Needs a full re-anchor at a pinned commit."
    },
    "applications/react--keystroke-injection.md": {
      "disposition": "reverify",
      "reason": "Structure still present (the payload sniff routes to write_text_line), but anchors drifted from the pinned 2b5e24223. The four naive call sites and the paste tests were not re-located."
    },
    "applications/rust--pty-management.md": {
      "disposition": "reverify",
      "reason": "Not re-anchored this run; its deviations (temp cleanup, geometry ordering, unobservable submit outcome) may have been fixed as the neighbouring react deviation was."
    },
    "applications/rust--multi-client-fan-out.md": {
      "disposition": "keep",
      "reason": "Negative application labelled unapplied. Its return condition (`subscribed: bool` replaced by a set) has not triggered: the field is unchanged at head."
    },
    "applications/c--multi-client-fan-out.md": {
      "disposition": "keep",
      "reason": "Load-bearing citations re-read at the pinned commit 1dd1717 and confirmed; verified_on moved to 2026-10-31 on that re-check. Line anchors match within a line or two."
    }
  }
}
```
