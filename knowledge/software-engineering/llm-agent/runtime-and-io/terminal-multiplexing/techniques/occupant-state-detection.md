---
layer: technique
type: technique
subject: terminal-multiplexing
technique: occupant-state-detection
status: forged
laws: [unknown-is-not-a-value, gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [driving a hosted interactive program that emits no lifecycle hooks, automation typed into a confirmation dialog it did not know was open, deciding whether a quiet session is thinking or waiting for you, a status classifier changed its verdict because the user scrolled]
---

# Occupant state detection

The session ladder says whether anyone is *watching* a session. This
technique answers the orthogonal question the ladder cannot: **what is
running inside, and will it accept input right now?** A multiplexer that
only hosts terminals never needs to ask. One that lets software drive its
sessions — an orchestrator answering a prompt, a script waiting for a build,
one agent handing work to another — needs the answer before every write, and
needs it to be trustworthy enough to act on.

The boundary with the neighbours is what makes this technique small. The
fleet's state machine — the registry, the transition door, the staleness
sweeper, the precedence rules when two instruments disagree — is
[fleet-orchestration](../../../orchestration/fleet-orchestration/fleet-orchestration.md)'s
subject, and its
[lifecycle-signals](../../../orchestration/fleet-orchestration/techniques/lifecycle-signals.md)
technique owns it completely. That technique's tier one is the session's own
runtime announcing its transitions, and it is right that this is the gold
standard. **This technique exists for the case where tier one does not
exist**: the occupant is a third-party interactive program that emits no
hooks, speaks no structured event stream, and offers exactly one channel —
the screen it paints. What follows is how to turn that channel into a signal
good enough to hand to the door. It is a supplier to that state machine, not
a rival for it, and where the occupant *does* emit lifecycle events this
technique should not be built at all.

## The screen is a weak channel, so rank what it carries

The neighbouring subject correctly ranks raw output as the weakest evidence
of life: an interactive program repaints its status line forever, so bytes
prove nothing about progress. The recovery is to stop treating the screen as
one undifferentiated stream and rank the channels inside it:

| Rank | Channel | Why it ranks here |
| --- | --- | --- |
| **Declared** | terminal title and progress escape sequences the occupant sets deliberately | the occupant *chose* to say this; it is a statement, not an artifact of drawing |
| **Structural** | named regions of the grid — the input box body, the area below the last rule, the last non-empty line above the prompt | the occupant owns the layout; a signal keyed to a region it controls cannot be produced by accident |
| **Incidental** | any text anywhere on the pane | matches whatever happens to be on screen, including text the occupant did not write |

A classifier built on the third rank is the one that fails in the field, and
it fails in a specific way worth naming: **the screen contains text the user
typed.** A human who types the words of a confirmation prompt into the
occupant's own input box will impersonate a blocked session to any rule that
searches the whole pane. Anchoring each rule to a region — and to the shape
the occupant renders it with, such as a marker at column zero that wrapped
continuations do not reproduce — is what separates the occupant's claims
about itself from everything else sharing the grid.

## Classify from a surface the user cannot move

The rendered viewport is the wrong input, and for a reason that has nothing
to do with its content: **the user can scroll it.** A classifier reading the
visible screen returns a different verdict depending on where a human
happened to leave the scrollbar, which means the machine's belief about a
session changes when nobody touched the session. The read that feeds
detection is a separate source from the read that feeds a human — the
bottom of the active buffer, taken regardless of viewport position — and
keeping them separate is [gate-sees-target](../../../../_laws.md#gate-sees-target)
applied to a surface that moves under the gate.

This is why a multiplexer that offers programmatic reads should expose the
detection buffer as its **own named source** alongside the human-facing
ones, rather than letting callers approximate it by reading the viewport.
The sources answer different questions and neither substitutes for the
other.

## Rules are data, dated, and reloadable

The occupants ship weekly. A spinner glyph changes, a dialog gains a line,
a new tool joins the supported set — and every one of those is a
classification bug in a program that is otherwise correct. Encoding the
rules as compiled logic makes each of them a release.

The standard is a **per-occupant manifest**: a versioned data file naming
the occupant, declaring a minimum engine version, and carrying an ordered
list of rules, each with a state, a priority, a region, and explicit
boolean gates — all-of, any-of, and a none-of clause for the near-misses
that would otherwise steal a match. Manifests reload without restarting the
runtime, so the fix for a drifted signal is a data edit verified against a
live session, not a build.

Two disciplines keep the manifest honest:

- **A version-specific signal carries its version, inline.** "This glyph
  covers releases up to 2.1.227; the half-circle is the 2.1.228 spinner" is
  a dated claim a later reader can check, and the alternative — a silent
  regex that stops matching — is a classifier that quietly degrades to
  unknown on every upgrade.
- **The manifest is the single authority for the vocabulary**
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
  The states a rule may assert are the states the runtime publishes; a rule
  file that can invent a state the consumers do not handle is an unmapped
  transition waiting to happen.

Build the rules from captured evidence rather than from the occupant's
documentation: drive a real session into the target state, capture the
detection buffer, then decide which visible controls are invariant and which
are alternatives. What the occupant's docs describe is its intent; what the
manifest must match is its output.

## Unknown is a state, and it must not be spent

The most important cell in the vocabulary is the one that admits defeat. An
occupant can be present and unclassifiable — sitting in a transcript viewer,
an overlay, a settings menu the rules do not model — and there are exactly
two wrong answers. Reporting it as ready invites a driver to type into a
modal. Reporting it as finished invites a caller to harvest a result that
does not exist. **Unknown proves nothing, least of all completion**
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

Two mechanisms make it safe:

- **Recognized-but-unclassifiable rules that suppress the update.** A rule
  can match an overlay, declare the state unknown, and explicitly decline to
  write it — so a full-screen viewer opened over a working session holds the
  previous verdict instead of replacing a true state with a shrug. The rule
  earns its place by being *recognized*: the classifier knows what it is
  looking at and knows that what it is looking at hides the answer.
- **A waiting vocabulary that names unknown separately.** A caller waiting
  for a session to settle almost never wants unknown in the accept set, and
  a caller debugging one always does. That is a choice the caller makes
  explicitly, never a default that quietly folds unknown in with success.

## The occupant is busy, blocked, or ready — and the difference is the contract

The states are worth naming because each carries a different obligation for
whatever drives the session:

- **Busy.** Working. Input may be queued but the session will not answer now.
- **Blocked.** The occupant has raised an approval or a question and is
  waiting on a human decision. The driver's obligation is the strong one:
  **refuse to type into it.** A write aimed at a program that is showing a
  dialog does not reach the program's normal input path; it answers the
  dialog, with whatever the first keystroke happens to mean. The correct
  posture is to reject the write, report that the session is blocked, and
  let the caller read the dialog before deciding — which makes "blocked" the
  one state a driver must check *before* acting rather than after.
- **Ready.** At its prompt, accepting input.
- **Finished-unseen.** Ready, but arrived there while nobody was looking.

That last one earns its place by solving a real problem: a fleet's operator
needs to know which sessions finished *while they were away*, and readiness
alone cannot say. The rule that makes it work is a discipline about what
counts as looking: **a programmatic read must not mark a session seen.**
Only a human's attention — focusing the session, or an explicit focus
command — clears the flag. A classifier that let its own polling count as
attention would erase the operator's notification queue by observing it,
which is the observer changing the thing it measures for no benefit to
anyone.

## What the multiplexer owes the state machine

The output of this technique is a signal with the same shape as a runtime
hook: an observation, timestamped, carrying a state from a closed
vocabulary, delivered to the fleet's transition door rather than written
into the registry directly. Everything the neighbour subject says about
arbitration then applies unchanged — the door decides, a sweeper still
assumes the classifier lied, and evidence still overturns a standing claim.

The one fact to pass along with it: this signal is *derived*, not declared.
A fleet that records how a state was learned can weigh a screen-derived
"ready" against a process-level "gone" correctly. A fleet that flattens both
into the same field cannot, and will eventually trust a spinner over a
corpse.
