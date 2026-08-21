---
layer: technique
type: technique
subject: interview-run-of-show
technique: fixed-opening-and-closing-blocks
status: forged
laws: [a-candidates-process-never-stalls-on-your-constraints, every-decision-names-its-actor]
shared_with: []
use_when: [building the skeleton of an interview plan before allocating question time, interviews keep ending abruptly with no time for candidate questions, deciding what a plan may cut when it runs long]
---

# Fixed opening and closing blocks

Every interview plan begins and ends with blocks whose length does not vary with how
many questions the round contains. They are budgeted **first**, deducted from the booked
duration, and what remains is the only thing the question allocation is allowed to spend.

The rule exists because these two blocks are simultaneously the most compressible-looking
and the least compressible parts of the conversation. They look like overhead. They are
the parts that make the rest of it mean anything.

## What the opening block carries

Three to five minutes, and it does four jobs:

- **Orientation.** Who is present and in what role, what this round is for, and where it
  sits in the loop. A candidate who does not know whether this is a technical deep-dive
  or a motivation conversation aims their answers at the wrong target and is then rated
  for the miss — a measurement error the process created and then attributed to the
  person.
- **The shape of the next N minutes.** How long it will run, roughly how it is
  structured, and that there will be time for their questions at the end. Saying this
  up front is what stops a candidate from spending their one chance to ask something on
  minute nine.
- **Disclosures owed before assessment begins.** That a machine is participating or
  transcribing, that a recording is retained, that the notes go to a panel. These are
  obligations in their own right, and they are also the sort of thing that poisons a
  conversation when it surfaces halfway through.
- **Naming the actor.** The candidate is told who is assessing them and who will decide,
  per [every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor).
  "Someone from the team will get back to you" is the version that later becomes a
  candidacy nobody owns.

The opening is not rapport-building padding, and it is not the interviewer talking about
the company for eight minutes. Where a role pitch is warranted it is its own block with
its own minutes, usually near the end, and it competes with everything else for them.

## What the closing block carries

Five minutes minimum, and two jobs:

- **The candidate's questions.** This is the half of the conversation where they are
  assessing you, and cutting it converts a two-way conversation into an examination.
  Teams underrate how much of a candidate's accept/decline is decided here. It is also
  diagnostic: what someone asks with their five minutes is real signal about what they
  care about — though it is signal to interpret, not to score on an axis it was never
  designed to feed.
- **What happens next, and by when.** A concrete next step and a concrete date. Not
  "we'll be in touch". The candidate leaves the call and immediately has to make
  decisions — whether to keep another process warm, whether to book a competing final
  round — and a process that will not tell them its timeline forces those decisions to
  be made against the worst assumption. A candidate's process must never stall on your
  internal constraints, per
  [a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints);
  if you genuinely do not know the date, say when you will know.

## Decision rules

- **Deduct before you budget.** Opening plus closing come out of the booked duration
  before question time is allocated. A plan that budgets questions against the full slot
  and then appends a closing has already overrun by the length of the closing.
- **These blocks are never the overrun's casualty.** Designate the open block as the
  thing that flexes and shrinks to zero. If the plan is still over after that, cut a
  question. The closing is cut last, and cutting it is a defect to be reported, not a
  normal adaptation.
- **Their length scales with the round, not with the question count.** A first screening
  call and a final round have different openings — the final round's closing carries more
  because there is more to say about what happens next — but neither varies because the
  question list got longer.
- **The interviewer gets an explicit two-minute warning position in the plan**, i.e. the
  clock time at which the closing must start regardless of where the conversation is.
  Interviewers do not overrun because they are careless; they overrun because a good
  answer is in progress and nothing told them the boundary had arrived.

## When not to use this

- **Machine-conducted rounds still need both blocks**, but they are authored as
  conversational turns rather than clock allocations, and the disclosure content is
  usually mandatory rather than discretionary. Do not drop them on the theory that a
  machine does not need warming up — the candidate does.
- **Segment handoffs inside a panel** do not each need a full opening and closing; the
  panel has one of each, and the segments have a one-line handoff. Repeating the full
  opening four times is how a panel round loses fifteen minutes.
