---
layer: application
type: application
subject: agent-instruction-files
technique: context-reset-redelivery
stack: claude-code
verified_on: 2026-09-08
verified_against: claude-code@2.1.263
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A caching injector delivers yesterday's floor, measured (Claude Code)

Run 2026-09-01 against Claude Code 2.1.252 in a throwaway git repository
with a project-local `SessionStart` hook, isolated from every fleet
checkout. Two arms, one variable: whether the injector re-reads the file
it is delivering, or replays what it composed the first time.

The instruction floor was a one-line file the hook renders into context.
Between the two opens of each arm, the file was edited — the shape of an
operator correcting a rule mid-afternoon.

## The two arms

| Arm | Injector | Open 1 (file says `RULE-V1`) | Open 2 (file says `RULE-V2`) |
| --- | --- | --- | --- |
| A | composes once, writes a digest, replays it | `RULE-V1` | **`RULE-V1`** |
| B | re-reads the file on every delivery | `RULE-V1` | **`RULE-V2`** |

The model was asked for the active rule and answered with the delivered
value, so the reading is of what arrived in context rather than of what
the hook believed it sent.

**The producer signal is identical in all four opens.** Both hooks ran,
both exited zero, both wrote their run marker. Nothing on the producing
side distinguishes the arm that delivered a stale rule from the arm that
delivered the current one — which is the technique's claim, reproduced:
the composed digest is a cache, and nothing in the session says it is one.

## What this measures, and what it does not

The mechanism is proven: an injector that stores its output re-delivers
the stored copy, and the harness faithfully delivers whatever it is
handed. That is the whole causal chain the technique names.

The **trigger** is corroborated but not observed. A compaction cannot be
forced from a headless single-turn invocation, so the re-delivery here was
driven by a fresh open rather than by a mid-session reset. What the arms
establish is that *when* a re-delivery happens, a caching injector serves
the old bytes; what they do not establish is this harness's per-event
re-injection behaviour on `clear` and `compact`. Those are separate rows
and this run did not earn them — recorded uncovered rather than inferred
from the open that worked.

## The fleet's position

Across the seven projects the bridge resolves, **none ships a
`SessionStart` injector at all**. The one hook in the fleet is a `Stop`
hook in `pumper`, which checks documentation drift rather than delivering
context. So no project holds the arm-A defect this run measured — there is
no caching injector to fix.

That is a cleaner result than it first reads, and it relocates the
exposure rather than removing it. Every project's floor is delivered
entirely by the harness's own native re-injection, whose behaviour on a
context reset **no project has verified and none could name if asked**.
The fleet has not chosen arm B; it has inherited whatever the vendor does,
which is the same position the technique warns about one layer down.

The cheap standing check is the one this run used: a unique marker in the
file, changed between deliveries, quoted back. It costs one throwaway
session and it converts an assumption into a row.

## The reset-event enumeration, re-read at 2.1.263 (2026-09-08)

The technique asks the injector to enumerate the reset events the harness
actually raises and to treat an unenumerated one as unhandled. Between the
version above and 2.1.263 the release log moved that enumeration four
times, and none of the four is visible from inside a session:

- the session-start event's `source` field gained a fourth value, `fork`,
  for a session that begins as a copy of another's context — distinct from
  `resume`, which the earlier enumeration treated it as;
- a directory change inside a session now re-resolves the project scope
  immediately — settings, hooks, skills and agents of the new directory take
  effect on the move rather than on the next resume — so a scope change is a
  redelivery event with no reset at all;
- a new lifecycle event fires when a working directory is added mid-session,
  which is the same shape: the floor's *set of files* changed and no context
  was cleared;
- the session-start event on a resume now carries the session's staleness
  and an estimated re-cache cost, which is the first time the harness has
  handed the injector a number it could branch on.

The rule survives unchanged: re-derive from the file on every event, and
keep the event list as dated data with its verification method. What moved
is only the list, and it moved in the direction the technique predicts —
toward events that redeliver without resetting, which a replaying injector
cannot distinguish from an ordinary turn. Verified by reading the release
log for the versions between the two dates; no arm was re-run.
