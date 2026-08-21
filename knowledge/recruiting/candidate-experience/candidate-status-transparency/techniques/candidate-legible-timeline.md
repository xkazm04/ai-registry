---
layer: technique
type: technique
subject: candidate-status-transparency
technique: candidate-legible-timeline
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [designing the visual progress element of a candidate status page, deciding how many steps to show, writing the copy for each step]
---

# Candidate-legible timeline

The concern: a phase label alone ("in screening") tells a candidate nothing
about the shape of the process they are inside. A timeline does — it shows how
many stages exist, which are done, where they are now, and how much is left.
It is the single element that most reduces "did this go anywhere?" anxiety,
and it is also the element most likely to be built as a mirror of the internal
board, which is exactly what must not happen.

A candidate-legible timeline is a **fixed, short, ordered spine of steps
written from the candidate's point of view**, onto which the current phase is
projected. It is not a rendering of your stages.

## The procedure

1. **Fix the spine at four to six steps.** Something like: applied → under
   review → interviewing → decision → outcome. Fixed means the same steps
   appear for every candidate and every role, so the page is comprehensible
   at a glance and so the count is not itself a leak about how a particular
   requisition is being run.
2. **Write each step as an event in the candidate's life**, not a stage in
   your workflow. "We are reviewing your application" — not "In triage". The
   test: a candidate who has never worked in hiring should be able to say what
   happens next, and what they are expected to do.
3. **Render exactly three step states**: completed, current, not-yet-reached.
   Three is enough. Adding sub-progress inside a step ("60% through review")
   invents a measurement nobody made.
4. **Project the phase onto the spine.** The current step comes from the
   role-derived phase, so a board rename cannot move the marker. An off-path
   terminal outcome — declined, withdrawn — must never render as a spine lit
   halfway and then abandoned, because a truncated trail reads as *your
   application is stuck*. Two resolutions are valid: complete the spine to its
   final step, or replace the trail entirely with a terminal card that states
   the outcome. Choose one and apply it to every off-path terminal; what is
   not acceptable is the half-lit trail.
5. **Attach only events the candidate was party to.** Applied on a date;
   interview held on a date; outcome on a date. Never internal transitions
   they never saw — a candidate reading "moved to hold, 11 days ago" learns
   something true and unhelpful, and asks about it.
6. **Give the timeline a stated last-updated moment** and derive it on read.
   A timeline is a claim about the present; without a timestamp the candidate
   cannot tell a quiet process from a stale page.
7. **Keep a left-open page fresh, then stop.** Candidates bookmark this page
   and leave the tab open for weeks; a view frozen at the stage it held when
   the tab was opened breaks the only promise the surface makes. Revalidate on
   an interval *and* whenever the tab regains focus — and cease once the
   outcome is terminal, because there is nothing left to advance to.
8. **Do not let a step promise a channel that does not exist.** "Watch your
   email for next steps" is only true where outbound delivery is actually
   configured; where it is not, the step says the team will be in touch
   directly. The delivery-truth sibling owns the capability check; the timeline
   consumes it rather than assuming a channel.

## Decision rules

- **When the internal process has more stages than the spine, collapse.** The
  spine is fixed; your board is not. Multiple roles mapping to "under review"
  is correct behaviour, not lost fidelity.
- **When a step has no date, show no date.** An empty step is honest. A
  projected or estimated date is a promise about a human decision you do not
  control, and per
  [inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)
  a forecast rendered in the same grammar as a recorded event will be read as
  a commitment.
- **When copy would reassure rather than inform, cut it.** "Great news, you're
  moving along!" attributes an evaluation to a stage transition. Per
  [say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds),
  the timeline reports position, not sentiment.
- **When a candidate withdraws or the requisition closes, still complete the
  spine.** Every terminal path ends at the outcome step. The visual grammar
  should never leave a finished story looking unfinished.
- **When a step expects something from the candidate**, say so at that step,
  in the imperative, with the action available there. This is the one place
  the timeline may be more than descriptive, and it is where it earns most of
  its deflection value.

## When NOT to use it

- **Very short processes.** A one-touch application with an automated
  screening outcome does not need a five-step spine; four of the steps will
  never be reached and the page implies a process richer than the one being
  run. A single honest sentence is better.
- **High-volume seasonal intake where nothing is individual.** If every
  application genuinely sits untouched until a batch review, a timeline
  implying continuous progress is decorative. Say when the batch is reviewed.
- **Internal dashboards.** Recruiters need the real board with real stage
  names and real counts. The spine is a candidate artifact; reusing it
  internally hides the operator's own process from them.
