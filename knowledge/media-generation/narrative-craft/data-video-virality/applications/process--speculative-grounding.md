---
layer: application
type: application
subject: data-video-virality
technique: speculative-grounding
stack: process
status: draft
verified_on: 2026-10-22
applied: code
ab_verdict: better
---

# A branch year on the what-if case validator

The `StatReel` studio (see process--recognizable-cast) already separates what-if cases from
observed ones, and a what-if must state its method. The seam was chosen to falsify "the tree
already grounds its speculation". Half of that held: the method is required and the brief says
the video is labelled a simulation. The numbers were not enforced. A what-if needed only a
non-blank method, and its timeline was one span with no point where real data stops, so the
baseline, the reach and the 2100 limit were prose.

## A and B

- **A (as it was):** a what-if was valid whatever its span. Four constructed cases were all
  accepted (4 of 4): 15 years of real baseline, a 110-year stretch hung on a 30-year baseline,
  a timeline running to 2110, and a branch point outside the timeline.
- **B (the rule applied):** a what-if may declare `branch_year`, the last year of real data. A
  declared one needs 20 years of real baseline (10 when the series is monthly or finer), a
  speculative stretch of at most twice the baseline, and nothing past 2100. The brainstorm
  check and the server both enforce it (0 of 4 accepted), and the year is stored with the case.
  Any other kind refuses a branch year.

A 30-year baseline with a 30-year stretch, a monthly series with a 15-year baseline, and a case
with no branch year passed in both arms. Floor: the typecheck, 1641 vitest tests, the 24 script
tests, the 41 board harness tests and the lint ratchet were all green. The policy step did not
run, because no policy file changed.

## What this cannot do

- **Absence passes.** A case with no `branch_year` is not checked, so a what-if can still skip
  the rule. Making it required waits on how the owner's existing cases are shaped.
- **Real baseline is self-declared.** The check trusts the year. It cannot tell whether real
  data exists up to it.
- **Steps 2, 4, 5 and 7 have no field.** The stated model, the two-worlds display, the
  on-screen label and the quarter-to-two-fifths share are video and channel properties. The
  case schema carries none of them, and the minority share has no counter.

Return when the owner has judged a batch of what-if cases with the year declared. Count
rejections by rule, and decide whether `branch_year` becomes required.
