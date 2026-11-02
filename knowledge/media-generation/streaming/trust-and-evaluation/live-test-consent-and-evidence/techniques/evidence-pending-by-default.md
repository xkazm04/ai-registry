---
layer: technique
type: technique
subject: live-test-consent-and-evidence
technique: evidence-pending-by-default
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [writing a status page, checklist or submission about what a stream tool does against the platform, deciding whether a feature may be described as working live, reviewing claims before a release or a demo]
---

# Evidence pending by default

Every statement about how a streamer tool behaves against the real platform is a claim,
and every claim starts **pending**. It becomes verified when, and only when, a piece of
observed evidence is attached to it. This technique gives those claims a closed status
vocabulary, defines what counts as evidence for each status, and makes the default the
honest one.

## The vocabulary

Keep it small and closed, so nothing can be written that does not mean one thing:

- **pending** — the claim is made; no observation backs it yet. The default for every row.
- **verified live** — observed against the real platform, with the evidence attached.
- **verified offline only** — the code path is proven against a recording or a
  rehearsal; the platform part is not.
- **failed** — a live observation contradicted the claim.
- **not applicable** — the claim does not involve the platform, with a reason.

Words outside the set — "should work", "mostly", "in progress" — are refused by
whatever renders the list, because each of them is a way to imply verified without
saying it ([law: unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass)).

Pending is split by **who owes the next step**: more building, a run only the account
owner can perform, a review only the owner can give. An undifferentiated pending column
cannot be worked; a split one is a to-do list with names on it. A team that also uses
"done" for non-platform deliverables keeps it, on one condition: every done row names the
narrow artifact it proves and, in the same cell, what it does not — "code complete; no
live result". Done never closes a live exit.

## What evidence is

Verified live needs a record a stranger could follow: the date, the live run that
produced it, the owned channel and accounts it ran against, what was sent, what the
platform returned, and where the record is kept — a log excerpt with secrets removed, a
capture, a link to the run's output. "I tried it last week and it worked" is not evidence;
it is a pending row with a memory attached.

Three things that feel like evidence are not, and each has a name in the vocabulary that
is not "verified live". Code written and merged: pending. A hermetic twin passing against
a recorded response: verified offline only. A dress rehearsal lighting every overlay:
verified offline only. Each is real work and worth recording; none observed the platform.
Nor is a clean exit code, nor a working example bundled with a verifier, nor a schedule
that says the run is planned for Tuesday.

## Evidence covers exactly what it observed

- **One observation is one case.** A single moderation action observed live verifies that
  action, not the action vocabulary; each variant the claim covers needs its own run or
  stays pending.
- **An acknowledgement is not the outcome.** The broadcasting software accepting a request
  to add a source is not a picture showing the source; the platform's interface echoing a
  long reason is not evidence of where the platform's own limit sits, especially when the
  tool truncated before sending.
- **Evidence postdates the request.** An observer that asks an operator to act discards
  whatever was already queued, because an event from before the instruction is not
  evidence of the instructed act — least of all when the act being checked is a
  restoration.
- **No limit is found by force.** A rate or action cap that was not reached naturally on
  owned accounts stays unmeasured. Driving traffic at the platform to find it is load on
  a shared service, and an invented threshold standing in for it is a pass nobody
  observed.
- **Expected is not recorded.** A table that shows the expected success line beside each
  check keeps that column visibly separate from the recorded timestamp and evidence
  reference, so a pattern is never read as a result.

## Holding the line at deadlines

The pressure on this vocabulary is always the same: a date arrives, the code is done, the
live run has not happened, and the row is rounded up. The rule is that the row records
what was observed, not what is expected, and that a mixed list is presented as mixed. A
reader who sees ten verified rows and four pending ones knows what to trust; a reader who
sees fourteen verified rows, four of them invented, can trust none of them once one is
found out ([law: output-never-outruns-evidence](../../../../_laws.md#output-never-outruns-evidence)).

Evidence also ages. A verified row carries its date, and a public restatement of it after
the platform has changed — a new version of an endpoint, a changed permission — re-runs
the live test or downgrades the row.

Two more habits stop a list contradicting itself. Any summary — a status line at the top
of the page, a count on a slide — is derived from the rows, never typed separately; a
header left saying pending above rows that have since passed is the same defect as a
header saying passed above rows that are pending, and it trains readers to ignore
headers. And the document says what its own author checked: "this pass ran no live
checks; the counts below were reported by another run at the cited revision" lets a
reader weight each row by who observed it.

## Procedure

1. List every claim the tool's documentation, interface, demo or submission makes about
   platform behaviour, one row each.
2. Set every row to pending.
3. For each row, name the live test or supervised run that would verify it and the owned
   accounts it needs.
4. Move a row only by attaching evidence; record the date, the run and who observed it.
5. Render the list and every summary of it from the rows, with the vocabulary enforced,
   and show the counts per status beside it.

## Decision rules

- **When a row has no attached observation, it is pending.** Whoever wants it green owes
  the run.
- **When only the offline twin or a rehearsal backs a row, it is verified offline only.**
  Never verified live.
- **When a live run contradicts a row, it is failed**, even if the code is about to be
  fixed; the fix moves it back to pending, not to verified.
- **When a claim is restated publicly**, check its date; an old observation is re-run, not
  re-quoted.

## When not to use it

Claims that involve no platform behaviour — a layout, a local calculation, a file
format — are verified by ordinary tests and need no live evidence; mark them not
applicable with the reason rather than leaving them out, so the list stays complete.
