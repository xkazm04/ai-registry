---
layer: application
type: application
subject: cv-content-construction
technique: career-change-framing
stack: process
status: forged
verified_on: 2026-10-22
applied: code
ab_verdict: better
---

# The tailored CV: a career changer's bridge printed after the career it leaves

Pinned at `kp@ecd695a97`. Changed at `kp@0045121b7`, then corrected at `kp@0dedc692e`
after the project's own pre-push review refuted the first rule. The job-seeker module's
tailoring pass already cites this technique by name, so the seam was chosen to falsify
"the tree holds the whole technique". A CAUGHT outcome would be a rule of the technique
that the tailored sheet does not carry, and that is what the read found.

Anchors are root-relative to that tree.

## What conforms

- **The target line is stated as sought, never as a held title.**
  app/features/jobseeker/cv/cvDocument.ts:429 "export const CV_OBJECTIVE" writes the
  seeker's target under the headline as what they are looking for, and the CV's own
  headline stays.
- **The chronology is kept in order and off-target roles are compressed harder.**
  app/features/jobseeker/cv/cvTailor.ts:396 "BULLET_BUDGET.offTarget" caps an earlier
  role with nothing relevant in it, with the transferable bullets ranked first. A
  one-line role keeps its title, employer and dates.
- **Bridging evidence outside paid work is collected and dated.** Projects, theses,
  courses and certifications become a dated projects section, and the tailoring pass keeps
  only those that speak to the target.

## What the sheet did not do

The technique's hybrid structure puts the relevant projects **above** the main history
when the bridge is outside paid roles. The tree built the section and then always set it
after the experience:
app/features/jobseeker/cv/cvDocument.ts:89 "the bridging evidence of a career change; set after the".
So the tool that gathered the career changer's bridge then printed it last, and a reader
skimming the entry heads met the whole prior career first. That is the exact failure the
technique opens with.

## What changed, and what refuted the first version

The first rule read titles alone: projects led when no tailored role's title spoke to the
target. The project's pre-push agent review blocked it with a counter-case from the
tree's own reference CV. That CV belongs to a teacher whose paid role already holds the
bridge (assessment dashboards built in SQL and Power BI). Its title is off target, so the
title-only rule printed a capstone course above the paid work holding the stronger
evidence. The technique already names that case: "the part of the old job that was
already the new job" is bridging evidence too.

The corrected rule asks two questions, in order:
app/features/jobseeker/cv/cvTailor.ts:432 "const bestProject = Math.max(0," and
app/features/jobseeker/cv/cvTailor.ts:434 "const projectsFirst = projects.length > 0 &&".
Projects lead only when no role title speaks to the target **and** the best relevant
project scores at least as high as the best role, bullets included. Otherwise the history
leads, with its relevant bullets first. The renderer and the reading-order export follow
the flag together:
app/features/jobseeker/cv/DesignedCv.tsx:159 "doc.projectsFirst ? projectsSection" and
app/features/jobseeker/cv/cvRoundTrip.ts:46 "if (doc.projectsFirst) entries". The feature
document states the conditional order in the same change.

## A/B, three arms

The target is the number of lines on the reading-order sheet before the first entry that
carries the bridge.

| Case | A (original) | A' (titles only) | B (titles, then evidence) |
| --- | --- | --- | --- |
| Teacher whose data work is all in projects | 14 | 9 | 9 |
| Reference teacher, data work in the paid role | experience first | projects first (wrong) | experience first |
| Analyst whose current title is on target | 6 | 6 | 6 |
| Teacher with no projects | 9 | 9 | 9 |

- **Floor**: 324 job-seeker unit tests green, `tsc --noEmit` clean, the export round-trip
  check clean over the new order. Each new test is red on the arm it guards against: the
  projects-first test on A, the paid-bridge test on A'.
- **Not measured**: how often the flag fires on real tailored sheets, and how often a
  short project ties a role on relevance. The return condition is a replay of stored
  tailored sheets with their targets.

## What this realization cannot do

It cannot tell an unrelated jump from a related, incremental move. That is the reading
the technique says employers actually make. The order moves the bridge into view. It
does not make the bridge coherent, and only the summary and the bullets can do that.
