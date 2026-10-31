---
layer: application
type: application
subject: period-comparison-significance
technique: yoy-364-day-shift
stack: process
status: forged
refresh_by: 2027-01-31
verified_on: 2026-10-31
---

# The year-over-year baseline in the tools a client already reads (October 2026)

A dated survey of which year-over-year baseline the analytics surfaces a client
compares against actually compute, mapped to the technique's 364-day rule. Refresh by
the frontmatter date: comparison menus are product decisions and one of them moved
away from the technique inside the period this note covers.

## The analytics suite most clients open first is calendar-aligned

Google Analytics 4's help page "Change and compare date ranges in reports"
(support.google.com/analytics/answer/13412290, read 2026-10-31) lists three
comparison choices: **Previous period**, **Previous period (match day of week)** and
**Previous year**. Its own worked example shows what each does: for Wed, Jan 11 to
Thu, Jan 12, 2023, "Previous year" compares against Tue, Jan 11 to Wed, Jan 12 - the
same calendar dates, one weekday off. The page carries the note that the **Previous
year (match day of week)** option "has been removed from Google Analytics".

Two consequences for an agency surface built on the technique:

- A client who cross-checks the agency's year-over-year delta against that suite will
  see a different number on any weekday-shaped metric, and the difference is the
  weekday gap the technique exists to remove. The agency surface should name its
  baseline ("versus the same weekdays last year") so the disagreement reads as two
  definitions, not as an error.
- The adjacent-window side moved the other way: weekday matching survives there, as
  "Previous period (match day of week)", which starts the comparison on the same
  weekday rather than immediately before - a seven-day-multiple offset for windows
  that are not whole weeks.

## A privacy-first analytics tool offers both and names them

Plausible's "Compare stats" documentation (plausible.io/docs/compare-stats, read
2026-10-31) offers **Year over year** with a choice of **Match day of week** ("aligns
the comparison by day of the week to avoid weekend/weekday skew") or **Match exact
date**. Its example is exactly the 364-day shift: Sunday 1 to 7 January 2023 compares
against Sunday 2 to 8 January 2022 under weekday matching, and against Saturday 1 to
7 January 2022 under exact-date matching. This is the technique's rule shipped as a
named, user-visible choice, which is the rendering the technique asks for when both
baselines are offered.

## The retail calendar the technique leans on

The National Retail Federation's 4-5-4 calendar page (nrf.com/resources/4-5-4-calendar,
read 2026-10-31) states that a 53-week year "occurs approximately every five to six
years, though this is not always the case", names 2006, 2012, 2017 and 2023 as
53-week years, and restates a 53-week year in the subsequent year by pushing each
week back one so holidays align; the alternative it names is to leave the year
unrestated and ignore the 53rd week of sales. Both mechanisms apply to chained
52-week fiscal years; a rolling one-year 364-day shift never accumulates the drift
they correct.

## Not evaluated

Adobe Analytics Workspace's comparison menu was searched but no official page
confirming or denying a weekday-aligned year-over-year option was opened; its
documented "last year" choices read as calendar-aligned, which is unconfirmed here.
