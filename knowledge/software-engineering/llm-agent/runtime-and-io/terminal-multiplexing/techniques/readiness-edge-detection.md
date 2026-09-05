---
layer: technique
type: technique
subject: terminal-multiplexing
technique: readiness-edge-detection
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [the first command after startup is swallowed, a capability probe passes on markers emitted during startup, the detector believes an input mode that is not yet enabled, a detector and an executor each parse the same stream]
---

# Readiness edge detection

An injected command-boundary protocol has to be detected before it can be
used: the host must decide, per session, whether the integration installed
successfully and the stronger tier is available. The detection problem looks
trivial — the protocol emits markers, so watch for a marker — and that
reading is wrong in a way that costs exactly one command, always the first
one, which is always the one someone is using to decide whether the
integration works.

This technique owns the arming edge: which observation may promote a session
to the protocol tier, and what the emitting side owes the observing side so
that the observation means what it says.

## The first marker is not the readiness marker

A shell's startup runs commands. The wrapper's own initialization, the
integration script itself, and anything the user's configuration executes all
pass through the same machinery that emits markers — so the stream carries a
completion marker for a command nobody typed, and a prompt-start marker for a
prompt still being composed, before the line editor has accepted a single
keystroke. A detector armed on *any* protocol traffic therefore declares the
capability available during a window in which writing to the session does
nothing useful. The keystrokes land in a device whose reader is not yet
listening for them, and the first command is lost with no error anywhere.

The marker vocabulary has distinct roles for a reason, and the fix is to use
them: a prompt-start marker says a prompt is being drawn; a command-line
marker reports what was submitted; an execution marker says a command has
begun; a completion marker carries its status. Exactly one role means *the
input path is now live*, and that one — the command-ready edge — is the only
observation that may arm the session. Waiting for a specific role rather than
for protocol traffic is the whole of the correction, and it is a one-line
change that a detector written from the protocol's shape rather than from its
semantics will not make.

## Advertise a capability only after enabling it

The complement of the rule above lands on the emitting side, and it is the
subtler half. A readiness marker composed into the prompt string is emitted
while the prompt is being *assembled* — which is before the line editor has
finished installing the input mode that prompt implies. The observer receives
a truthful marker at an untruthful moment: it arms, and its own parser's mode
state still says the paste bracketing is off, so the first injection is
encoded under an assumption the session no longer matches. The bug is not in
either component. It is in the ordering.

**A readiness marker is emitted by the component that owns the state it
advertises, at the moment the state becomes true.** Moving the emission out
of the prompt string and into the line editor's own initialization hook is
what makes the observer's belief follow reality instead of preceding it. The
general form is [gate-sees-target](../../../../_laws.md#gate-sees-target)
turned around: a detector that watches a proxy for readiness — a marker
printed *near* the enabling code, a banner, a settled screen — passes exactly
in the window where the proxy and the target disagree, which is the window
the detection existed to cover.

Two corollaries worth stating, because they generalize past this protocol:

- **Nothing that runs before the capability exists may announce it.** If the
  only place available to emit from runs early, the answer is a different
  emission site, never an added delay. A delay is a guess at the size of a
  race.
- **The advertisement must be re-emitted on every cycle where the state is
  re-established**, not once at install — otherwise a session that
  re-initializes its line editor drops back to an unadvertised state that the
  observer never learns about.

## One reader, one parser, across both phases

Detection and execution are two phases over one stream, and the temptation is
to give each its own reader: a small detector that scans for a marker, then a
full parser for the run. That split loses the thing that makes the second
phase correct. By the time detection succeeds, the stream has already carried
mode changes, cursor state, and the marker sequence's own framing — state the
executor needs and cannot re-derive, because the bytes that established it
are gone. A second parser starts from a default it has no evidence for.

So the reader and the parser are single instances that span both phases, and
the phase is a flag on them rather than a boundary between two
implementations. The marker vocabulary is a closed set, and one parser is its
authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a private detection-time matcher is a second definition of that vocabulary
that will diverge the day a role is added, and it silently drops the terminal
state in the meantime.

## Failure to arm is a labelled state, not an error

A session that never reaches the readiness edge is normal: the integration
may not be installed, the shell may not be one it supports, a user may have
disabled it. The host must not block startup waiting for an edge that is not
coming, and must not report an error the user cannot act on. It runs the
session on the fallback tier, records *why* the promotion did not happen —
timed out waiting, no protocol traffic seen at all, traffic seen but never a
command-ready role — and moves on. That distinction is the entire diagnostic
surface for this lane, and the three reasons point at three different fixes.

Arming is deliberately a one-way edge within a session's startup: once the
command-ready role is seen, later startup noise cannot un-arm it. It is not a
permanent verdict for the session's whole life, however — the protocol can
disappear mid-session, which is
[capability-revalidation](./capability-revalidation.md)'s subject.
