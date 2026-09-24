# Lessons - illustrate

Append-only. One block per run: `## <version used> - <YYYY-MM-DD> - <project>`.

## 1.0.0 - 2026-09-24 - personas-web

- First run: hero, platform grid and use-cases on the landing page, three directions
  each, nine builders in parallel in one worktree, each owning only its variant files.
  Gates green, 12 tabs captured at 2 widths x 2 motion preferences, 0 blank, 0 infinite
  animations under reduced motion. Every variant dropped the loops the current
  sections run (4 in the hero, 1 in use-cases). Owner decision pending.
- **The brief was wrong in two places, and both builders were right to override it.**
  The hero contact sheet used the app's real eight build frames instead of the eight
  the brief listed, and the sigil builder found the app's petals encode persona
  dimensions, not tools. A survey-written brief guesses; the source app states. The
  method now tells builders to verify nouns and override.
- **The capture instrument treated a desktop-only column as a failure.** At 390 px the
  hero's illustration column is hidden by design, and the click timed out. It now
  records "hidden by layout" and moves on. Fixed in 1.0.1.
- **The switcher template set state in an effect**, which the project's hook lint rule
  rejects. It now reads the query through useSyncExternalStore. Fixed in 1.0.1.
- **Parallel builders see each other's half-written files.** Four builders reported a
  type error or a hydration error from a sibling's file in progress. All were gone at
  the director's verification. Tell builders in the brief to ignore errors outside
  their own files and report them, which they did.
- **The baseline read found a defect bigger than the section:** the served HTML hides
  the hero's h1 at opacity 0 until hydration, and the page's route wrapper does the same
  for every route. That was routed to the page-load plan, not fixed on the prototype
  branch, per Phase 2's "fix the baseline separately".
- Variants widened the hero slot by 44-64 px. At consolidation, cap the winner at the
  slot's width. The brief should state the slot's width in pixels, not "roughly".

## 1.0.1 - 2026-09-25 - personas-web

- **Owner verdict on round 1: the skill overflowed with descriptive text.** The goal
  was an abstracted idea carried by illustration and animation, with a dominant visual
  structure and text labels as support. Picks: hero kept CURRENT (the abstract ring,
  roughly zero words) over three text-rich product mockups; tools took the persona
  card; platform took the exploded layer stack. Measured after consolidation, the two
  kept variants still held 92 and 131 words with runs of 16-19 words. The method
  produced this: the brief asked for "real nouns", "sample values" and faithful
  screens, and every builder complied with sentences. 1.1.0 adds the text budget, the
  mute test, a word list in every spec, silhouettes for product-true art, and an
  instrument check that flags text-heavy art.
- **The owner's picks favour spatial structure.** Both picked variants lead with a
  shape (a stack, a card that grows) and both rejected mechanism variants read as
  panels of prose. Weight the triad toward structures that survive the mute test.
- **Removing a worktree with --force emptied this skill's source directory.** The
  worktree held a junction into `ai-registry/skills/illustrate`; the forced recursive
  removal followed it. Restored from HEAD, with nothing lost because everything was
  committed. 1.1.0 makes unlinking before removal a stated step.
- **Consolidation found two hidden contracts the variants had not honoured:** the
  guided tour's spotlight anchor (`data-tour-diagram`) and its click targets
  (`data-card-id`) on the replaced section. The project's anchor test caught both.
  Add to the builder brief: grep the section for tour, analytics and test hooks and
  carry them into every variant.

## 1.1.0 - 2026-09-25 - personas-web

- **The 1.1.0 text metric split words on the letter "s".** The instrument's word
  counter shipped as `/s+/` instead of a whitespace class, so "Constraint" and "Opus"
  counted as two words and every run length was wrong. Two builders caught it from
  their own numbers. The cause was an editing pipeline that stripped the backslash
  from a regex written through a shell heredoc; the unit tests exercised the verdict
  and not the counter. 1.1.1 fixes it, exports the counter, and tests it directly.
  Any pure logic an instrument runs inside a browser page gets a tested twin.
- **Fixed page chrome (a cookie banner) covered the bottom of every capture.** 1.1.1
  adds `--hide <selectors>` so a run can hide overlays that are not part of the
  section.
