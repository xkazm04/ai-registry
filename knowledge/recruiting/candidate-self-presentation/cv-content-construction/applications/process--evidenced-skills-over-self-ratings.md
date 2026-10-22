---
layer: application
type: application
subject: cv-content-construction
technique: evidenced-skills-over-self-ratings
stack: process
status: forged
verified_on: 2026-10-22
applied: code
ab_verdict: better
---

# The CV parser: a skill meter re-drawn inside the skill's name

Pinned at `kp@cd9dce69e`, changed at `kp@33eb526e5` (on the project's main, and in
`origin/main` when this was written). Anchors are root-relative to that tree. The seam was
chosen to falsify "the tree already holds the technique": grouping, evidence ordering and
the CEFR scale for languages were all met, so a CAUGHT outcome could only be the one rule
the structure did not exercise, the meter conversion. It was caught.

## What conforms

- **Skills are grouped and an unevidenced skill is flagged, not removed.** The parser
  builds grouped skill lists and raises a "where did you use it?" question for a skill that
  appears nowhere in the experience, which is the technique's own remedy.
- **A stated level survives as a word.** The owner's own word ("senior", "medior") is kept
  beside the item.

## What the tree did not do

The level was read only as a trailing *word*:
app/features/jobseeker/cv/cvDocument.ts:502 "const LEVEL_WORD =". A trailing pip run,
star run, "85%" or "(4/5)" is not a word, so it stayed inside the skill's name and was
printed as drawn. The tool that was meant to strip self-ratings re-drew them. A percentage
or fraction in the name also broke the match against the experience text and raised a false
"listed only" owner question for a skill the owner had in fact evidenced.

## What changed

A trailing-meter pattern, applied before the level word is read and again after it:
app/features/jobseeker/cv/cvDocument.ts:505 "const METER =" and
app/features/jobseeker/cv/cvDocument.ts:520 "const bare = l.replace(METER". The owner's word
survives, a bare graphic is dropped, and no number is ever mapped to a word, because that is
the inferred level the technique forbids.

## A/B

The target is meter-bearing skill names printed in the parsed output.

| Probe lines | A (before) | B (after) |
| --- | --- | --- |
| pips, stars, "85%", "(4/5)" (6 lines) | 6 printed the graphic in the name | 0 |
| percent and fraction items raising a false listed-only question | 5 of 5 | 0 |
| owner word beside a meter ("senior" plus pips) | word kept, graphic kept | word kept, graphic dropped |

- **Floor**: 121 job-seeker unit tests green, `tsc --noEmit` clean. The new test is red on
  arm A (16 pass, 1 fail) and green on B.
- **Not measured**: how often real uploaded CVs carry a meter, and whether dropping a bare
  graphic should raise an owner question. The return condition is a replay over stored
  uploads.

## What this realization cannot do

It cannot recover what a bare graphic meant, and it should not try: the content is a guess
in the grammar of measurement. It also reads only a *trailing* meter; a meter placed before
the name or in a separate column of a table is not covered, and a text extractor that loses
the glyphs entirely hands the parser nothing to strip.
