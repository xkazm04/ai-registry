# Lessons - technical-blog-post-authoring

Append-only. One block per run, newest last, in the lane format:

```markdown
## <version used> - <YYYY-MM-DD> - <project>
- What the run taught, in bullets.
```

The version slot records the version the run **used**, not the bump it argues for.
Appending here does not require a version bump: a lesson records a run against a
version, it is not a change to the method.

Only lessons that **generalize** belong here. A lesson naming a credential, an account,
a file path or a person is charter memory and stays in the consuming application.

The quality dimensions were distilled from a two-round writing contest held before the
recipe existed (see the `technical-writing` knowledge bundle's applications); that contest
was not a run of this recipe, so it is recorded there as evidence and not here as a lesson.

## 0.1.0 - 2026-10-06 - gravitone-gcloud (first full run, coding-agent CLIs as headless transports)
- Cost and time sat in the critique step (about three quarters of both), not in research or drafting. Two of four reviewers completed; the loop converged on facts (about 70 percent of 68 findings, 17 of them blockers) and moved engagement, insight and voice very little.
- The research phase wrote a confident negative thesis ("no clock inside the child can end a stalled request") without searching the vendor's own error and configuration pages for such a clock; a reviewer found the page. Negative claims need a search receipt in research, and a thesis is stress-tested against the vendor's docs before drafting.
- The writer accepted 65 of 68 findings and the post grew to a 33-minute read, against the standard's own depth-by-replacement law. Give the critique turn a length budget.
- The deterministic check ran only after the final rewrite and failed three dimensions nobody could still fix. Run it after the draft and after every revision.
- The owner's review of the finished post asked for: no em dashes; an opening that tells the situation and shows its sequence as a timeline instead of a clock-by-clock chronicle; no stated reading time; a visual element at least after every second paragraph; a summary or comparison table in the close for readers who read only the opening and the ending. These became the `visual-cadence` technique, edits to the preview, opening and closing techniques, and recipe 0.2.0.

## 0.2.0 - 2026-10-06 - gravitone-gcloud (second full run, judge calibration and drift)
- The house rules from the first run reached the writer as prompt text and still did not hold. After two critique rounds the final post failed four deterministic checks: a run of six prose paragraphs without a visual (limit two), a figure text run of 18 words (limit 12), body text at 17px and chrome text at 10.92px. A rule stated only in the prompt is lost when the writer rewrites for reviewers; it has to be checked after every writer turn, with the failure handed back as a mandatory fix.
- Two of the four failures were template defects, not prose: callouts and citation markers inherited a small font size from the page template, and captions and the byline were plain paragraphs that the checker counted as prose. Fix the page template and say in the prompt how a caption, byline and callout are marked; otherwise every post repeats them.
- The critique writer accepted 94 of 98 findings (3 rejected, 1 deferred) and the post stayed at about 5,300 words even with a stated length ceiling. A ceiling in the prompt is advice; enforce it as a measured check and make the fix turn cut flat material first.
- Cost and time again sat in critique: about 3 hours of agent time and about $58 of reported seat spend, of which the two critique rounds were most. Round 2 repeated a full research pass (about $4) before reviewing; it is worth it only when round 1 changed claims.
- Three of four reviewers completed in both rounds; the fourth was unavailable for account balance in this run as in the first, so the panel of four is not yet a panel of four. The Gemini reviewer completed both rounds at about 11 minutes, so its earlier hang is not a constant; bound it anyway.
- A fix pass after the last critique round is not seen by the external reviewers. Shortened sentences that carry numbers or qualifiers deserve a source check by the human at the gate.
