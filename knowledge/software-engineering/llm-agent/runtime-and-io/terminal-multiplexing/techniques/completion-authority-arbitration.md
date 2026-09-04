---
layer: technique
type: technique
subject: terminal-multiplexing
technique: completion-authority-arbitration
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a command that sleeps returns before it finishes, the session was killed mid-run because output went quiet, only the first line of a multi-line script comes back, two evidence tiers over one stream disagree about whether a run ended, a driver reports an exit status nobody produced]
---

# Completion authority arbitration

An occupant that emits no lifecycle hooks can be **given** them. Wrap the
session's startup so that the program announces its own command boundaries —
a prompt about to be drawn, an input path now live, the command line as
submitted, execution beginning, execution finished with a status — into the
same stream it was already writing output to. The occupant did not ship a
protocol; it accepted one. That is the middle tier of this subject's three:
above the screen-scraping of
[occupant-state-detection](./occupant-state-detection.md), below the native
announcements that
[lifecycle-signals](../../../orchestration/fleet-orchestration/techniques/lifecycle-signals.md)
prefers and this subject defers to.

The middle tier's distinctive cost is not parsing. It is that **the host now
runs two tiers of evidence over one stream** — the protocol it installed, and
the heuristic it still needs for every session where the installation did not
take. This technique owns the arbitration between them, and specifically the
one decision that arbitration turns on: who is allowed to say a run is over.

## Promotion must revoke, not outrank

The heuristic tier's completion rule is some form of *quiet means done*: the
stream has produced nothing for a short interval, the prompt looks redrawn,
so the run has ended and the collected bytes are the result. On the fallback
path that rule is not wrong. It is the best available reading of a channel
that carries no boundaries, and it is why the fallback path works at all.

The failure is what happens when the protocol tier arrives and the quiet
rule is merely *ranked below* it. Ranking answers the case where both tiers
speak and disagree. It does not answer the case that actually occurs: the
protocol tier says a command started and then, correctly, says nothing at
all, because the command is sleeping, compiling, or waiting on a remote
answer. A lower-ranked rule that can still fire while the higher-ranked one
is silent has not been outranked — it has been made the default. The
observed shape of the defect: a two-second quiet window taken as completion,
the pseudo-terminal torn down on a ten-second sleep, and the first line of a
three-line script returned as the run's output with no indication that
anything was missing.

So the rule is stronger than precedence. **Promoting a run to the protocol
tier revokes the heuristic tier's authority to conclude that run.** The
idle detector may keep running — its output is still useful as a liveness
observation, a progress hint, a reason to redraw — but the specific power to
declare a run finished is transferred, not shared. Two evidence tiers over
one stream need an explicit transfer of authority, because the weaker tier's
verdict is produced by *absence of evidence*, and absence is exactly what the
stronger tier's silence looks like.

## The terminator set is closed, and every member is positive

On the protocol path a run ends on exactly three events, and the set is worth
writing down as a set:

1. **The completion marker**, carrying the exit status of the command.
2. **A timeout** the caller supplied, which ends the *wait*, not the command.
3. **The stream ending** — the child exited or the device reached
   end-of-file, which
   [pty-management](./pty-management.md) distinguishes from each other and
   from silence.

Every member is a positive event that something emitted or that a process
table can confirm. Nothing in the set is "we stopped hearing anything",
because that is what a running command sounds like. A run still waiting on
one of the three is *unknown*, and rendering unknown as completion is the
laundering step this whole technique exists to prevent
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## What each tier may assert

| Tier | May assert started | May assert finished | May assert exit status |
| --- | --- | --- | --- |
| **Native announcements** | yes | yes | yes |
| **Injected protocol** | yes, on the start marker | yes, on the three terminators | yes, from the completion marker |
| **Screen heuristic** | inferred, weakly | only while no protocol run is open | **never** |

The last cell is the one that catches synthesized results. The heuristic
tier has no access to an exit status — nothing in a screenful of text is the
number the shell recorded — so a driver that returns a status while running
on that tier invented it. The honest shape is a result whose status field is
absent and whose tier field says why. A harness that fills in success
because it stopped watching has spelled failure and empty success the same
way ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
at the one boundary where a caller was about to act on the difference.

## A timeout is an outcome, not a completion

The second terminator deserves its own rule, because it is the one most often
collapsed into the first. A timeout means the caller stopped waiting. It does
not mean the command stopped running, and it does not license the collected
bytes to be labelled as the command's output. The result of a timed-out run
carries three facts a completed run does not: that it timed out, that the
output is a prefix rather than the whole, and what the host did next — left
the command running, sent an interrupt, or tore the session down. A driver
that returns a truncated prefix under the same shape as a finished run
teaches its callers that partial results are normal, which is how a
truncation becomes a silently wrong answer three layers up.

Timeouts belong to the caller, per run, because only the caller knows whether
this command is a directory listing or a full build. A host-wide constant
tuned for interactive commands is the idle heuristic wearing a different hat.

## The tier is a property of the run, and it travels with the result

Arbitration is decided per run, not once per session — the protocol can be
present at startup and absent for a particular command, which is
[capability-revalidation](./capability-revalidation.md)'s subject and not
restated here. What this technique requires is that the decision be
**recorded on the result**: which tier concluded the run, and on which of the
terminators. The consumer of a driven session is usually a state machine one
subject over, and the same rule applies here as to a screen-derived state —
a fleet that records how an outcome was learned can weigh a protocol-reported
failure against a heuristic-reported success correctly, and one that flattens
them into a single field will eventually trust a quiet screen over an exit
code.
