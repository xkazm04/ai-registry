---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: contest-door-at-the-point-of-decision
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: task
ab_verdict: unmeasurable
proof: structural-only
---

# A reconsider queue with no door, in a tree that already knows it

The version witness is the CI pin `node-version: 24` in the repository's own workflow, whose
comment names the verified local toolchain (v24.14, LTS). The tree is a self-hosted hiring workspace with screening behind
human approval gates. It is the one place in this fleet where the technique's premise
can be read off both halves at once, because the queue exists and the door does not.

## What the tree has

**The queue, built to the sibling technique's rules.** A rejected entry is offered for
reconsideration only when its newest decision is the machine's own, and a human
rejection, including one issued after a reinstatement, is deliberately kept out:

- `app/_lib/db/pipeline.ts:1333 "A human reject"`
- `app/_lib/db/pipeline.ts:1251 "Reconsider"`

**The promise, on the candidate's status page.** The page for a decided application
carries a sentence, translated into every shipped locale:

- `messages/en.json:2249 "You can request a human review of any decision at any time. Just reply to any message from the hiring team."`

**No path from that sentence to the queue.** The tree's own comment on inbound mail is
explicit that it has exactly one receiver, an HTTP endpoint for lead intake, and no
inbound-email provider and no MX route:

- `app/_lib/comms-truth.ts:31 "There is no inbound-email provider and no MX"`

A reply to a decision message therefore lands wherever the operator's outbound relay
sends replies, which the application neither reads nor records. Where an operator has
wired forwarding into the lead receiver, a candidate's message is handled as a lead
that already exists, and the only thing the tree does with it is halt a sourcing
sequence:

- `app/_lib/inbound-lead.ts:179 "recordOutreachReply(outcome.entryId, webhook.workspaceId)"`

The sourcing logic is right for its purpose and answers a different question from
"has this person asked a human to review a decision".

## The tree already names it

The compliance backlog carries the defect as an open row, with the regulator's own
wording quoted beside it:

- `docs/features/compliance/regulatory-backlog.md:153 "Art. 22(3) contest is prose with no mechanism."`

So this application adds no discovery. What the technique contributes is the shape of
the fix, and one distinction the row does not draw.

## What the technique adds to the row

1. **The door and the queue are two mechanisms.** The tree finished the second. The
   first is a control delivered with the decision, a stored request keyed to the sealed
   decision with a receipt time, an acknowledgement carrying a named contact and a
   configured timescale, and a routing step.
2. **The routing step has two exits, because the queue rejects human decisions by
   design.** A request against an automated rejection joins the existing queue with the
   candidate's added material; a request against a person's decision becomes a review
   assigned to someone else. The row, as written, would send both to one queue and the
   queue would silently drop the second kind.
3. **The door must be universal.** The tree's agent-facing surfaces route human
   involvement at declared points; that rule must not be reused for this request. Any
   channel, any status, no "wrong place".
4. **A found-late count** is the instrument for the door's leaks, and it can only be
   computed after the door records anything.

## The applied row

Mode `task`. The plan (files, size, the measurable and the gate) was written into the
tree's own task folder; **no code step was taken**, because the row sits in the owner's
compliance backlog with a sequencing decision the run cannot make (a new store is a
schema change, and the tree's local main carries unpushed sibling work). The measurable
is the count of requests recorded per decision notice delivered, with the found-late
count beside it and a floor that no existing reinstatement path changes behaviour.

`unmeasurable`, and the instrument that would make it measurable is the request record
itself: until one exists there is no numerator. The return condition is "when the first
step of the plan lands".

## What the realization cannot do

It does not decide whether a reply-address promise should stay on the notice. Without
an inbound mail path the honest notice points at the control, not at a mailbox, and
that is a wording decision in every locale rather than a code one.
