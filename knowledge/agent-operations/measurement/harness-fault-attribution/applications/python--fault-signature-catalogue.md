---
layer: application
type: application
subject: harness-fault-attribution
technique: fault-signature-catalogue
stack: python
status: forged
verified_on: 2026-10-10
applied: experiment
ab_verdict: better
---

# Python: an agent dispatcher whose failures all said the same sentence

Personas runs an unattended dispatcher. It claims a ranked work item, spawns a headless
agent session against a registry or a project, and settles the item from what the session
left behind: `landed`, `idled`, `declined` or `blocked`. The settle evidence is one line
of text per item, and it is the only record an operator reads afterwards. Two drivers have
written it. An in-app loop ran until 2026-10-01, and a Python CLI loop
(`.claude/skills/curator/loop.py`) has run since 2026-09-28.

## The symptom with no tell

On 2026-10-10 the dispatcher's own tables held 595 plan-lane dispatches settled
`landed`, `idled` or `blocked`. Of the 189 `blocked` items, **182 carried one identical
evidence string**: *"its worker ended without reporting an exit code."* The in-app loop
writes that line for any session that is neither live nor finished and has no exit code.
That condition covers several unrelated faults, and the line keeps none of the state that
would tell them apart. It is a symptom recorded without its tell, which is the failure the
catalogue exists to end.

## A and B, on stored data

The experiment changed no product code. Both arms read the same 595 settled dispatches.

- **Arm A** is the evidence as written. An item counts as attributed when its line names
  an environment cause, such as a ceiling or a usage limit.
- **Arm B** matches each item against a seven-entry catalogue. Each entry has a symptom, a
  tell and a fix, and every tell is read from tables the app already keeps. The tables are
  the fleet's session rows (state and state reason), the commit audit ledger, and the
  session-id prefix that says which driver spawned the worker.

| Signature | Symptom | Tell | Non-landed matched |
| --- | --- | --- | ---: |
| Idle reaper | no exit code | session state `hibernated` ("process freed") or `stale` ("no log growth for 6 min") | 101 |
| Unclearable measurement | idled, "the scan still scores X (never_swept)" | the worker committed, but the scan reason clears only through a subject note | 7 |
| Refusal-as-result | finished, or idled as a dry pass | the session's own final message is a usage-limit banner | 5 |
| Concurrent claim | "its fleet session is gone" | the session id carries the CLI driver's prefix, so the in-app loop settled a worker it never spawned | 3 |
| Ceiling | timed out | the evidence says so already | 2 |
| App restart | awaiting input | state reason "recovered after an app restart" | 0 |

**Target:** the share of non-landed outcomes whose cause is named. Arm A named **2 of
318**. Arm B named **118 of 318** (37%).

**Floor:** no landed item with commits behind it is re-attributed. That held at **0**. The
catalogue touched four landed items. Three were idle-reaper annotations that leave the
outcome standing. The fourth was a `landed` item whose session's final message was a
usage-limit banner and which had **no commits**. That is a correction, not a regression:
a refusal had been recorded as a success.

## What the tree's shape says

**The tell has a shorter life than the verdict.** Of the 185 no-exit-code dispatches,
**112 can no longer be attributed by anyone.** The fleet reaps its session rows, and the
settle line was the only copy of anything, and it held no state. The catalogue's first
decision rule is "add the entry when the fix lands, while the tell is still known". Here
the tell was lost even faster than that. It has to be stamped into the evidence **at
settle time**, because no later triage can recover it.

Two mis-settles are worse than unattributed failures, and only the catalogue sees them:

- **Refusal-as-result fed the saturation streak.** In-app, a usage-limit refusal ends a
  session in a `finished` state. `finished` is read as success, so the item waits for the
  reconcile pass, which finds the finding still standing and settles it **`idled`**. That
  happened five times, and once the item was settled `landed`. The loop's own comment says
  a crashed worker must never be recorded as "she tried and the subject was settled
  ground". A refused worker was recorded exactly that way, because the limit was checked
  on the CLI driver's output text and never on the in-app session's final message.
- **The reaper blocked work that had landed.** 13 of the 63 hibernated `blocked`
  dispatches had registry commits in the audit ledger. Those workers committed, then sat
  idle, perhaps waiting on background agents, and were reaped. A "blocked" there means
  "freed after landing", which is the mirror case the golden path warns is never triaged.

The catalogue cannot separate a model's dry pass from the scan's inability to see a pass.
It can only flag the second when a commit exists. A worker that researched, found nothing
worth landing and wrote no note is still indistinguishable from one that never ran.

## The live driver

Since 2026-10-01 every dispatch comes from the Python loop. It spawns the worker as a
child process, so it has neither the reaper nor the double settle. It already carries one
catalogue entry: `LIMIT_SIGNATURES`, read from the tail of the worker's output. That entry
is bounded so that a report *about* usage limits does not trip it.

Its ceiling branch drops the tell, though. `judge_serial` and `judge_conform` keep the
worker's last words on every failure except a timeout. The timeout evidence is
"timed out after 45 min; N registry commit(s) since dispatch", which names the ceiling
and nothing about what the worker was doing when it fired. Two of the live loop's eight
`blocked` items are timeouts, and one of them had three registry commits behind it.
Stamping the worker's last words on that branch is the catalogue's "add the tell while it
is known" rule, applied to the only driver still running.

That change shipped as Personas `58b2ed20f0`. Its proof is `ab-paired`: identical inputs
went through the judge at the previous commit (A) and through the changed judge (B).
Arm A dropped the last words on both timeout branches, and arm B kept them. Every
non-timeout outcome was identical across the arms, with the same action and the same
evidence. The loop's suite is 26 of 26 green, including a test named for the tell.

## Return condition

**Re-run the affected cells.** The six refusal-settled items still count toward their
subjects' saturation streaks. They are re-dispatchable only once the plan run that holds
them is superseded. Measurable: whether those six subjects are re-ranked by the next plan
run.

**What would falsify the verdict:** a stamped tell that names no more causes than the bare
line did. That would show up as live-loop timeouts whose last words still cannot be told
apart.
