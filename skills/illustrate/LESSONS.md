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

## 1.1.1 - 2026-09-25 - personas-web

- **Owner picks on the /features round:** memory RUN-TWICE (transformation), AI models
  ROUTER (mechanism), security NESTED-VAULT (physical metaphor). Across the two runs
  the product-true family has now lost every section it entered as a silhouette or a
  mockup (hero, platform, security) except where it drew one card that grows (tools).
  The winners share a shape: one strong structure that reads muted, with motion that
  shows a change (a tangle straightening, tokens sorting, rings locking). The triad
  should lead with mechanism, transformation and metaphor, and include product-true
  only when the real artifact is itself the claim.
- **The picture-first budget held without owner correction:** every /features variant
  came in at 4-6 words (budget 30) and the owner chose among them without asking for
  less text. The budget did not need to be tighter; the word list in the spec did the
  work.

## 1.1.1 - 2026-09-25 - personas-web (revamp round)

- **Owner verdict: all 15 variants discarded.** Five text-heavy sections (team canvas,
  get started, pricing; healing, lab), three directions each, built into a new
  one-section-per-screen layout. In the owner's words: "in all cases it generated huge
  illustrations representing very little, cutting all text leading into no idea what
  is meant behind. Balancing of visual/text part was not successful, so sizing and
  fidelity of the visual side." Every variant passed the 1.1 instrument (2-15 words,
  0 blank, 0 loops) - the instrument measured only the ceiling, so a picture could say
  nothing and pass. 1.2.0 adds the floor: SPARSE / TINY-LABELS / TEXT-THIN flags, the
  cold-read test by a fresh reviewer, the competitor-swap test, a 1-2 sentence lede,
  a label plan instead of a word list, and a size plan (size to content, not slot).
- **The director's brief made it worse, and the method let it.** The project brief
  asked for art "the largest element", sized to fill a full-screen slot of about
  1600x1000px, "one short lede line (shorten the current lede)" and the eyebrow
  dropped. Every builder complied: art scaled to the slot with five marks in it. A
  brief that dictates size or silence overrides the balance for all builders at once;
  1.2.0 names it an anti-pattern.
- **The 1.1.1 lesson "lead with metaphor" was wrong in its generality.** The
  metaphors this round (a puzzle, a balance scale, a staircase of generations, a
  kintsugi bowl) were generic - they fit any product. The accepted nested vault works
  because its rings carry real layer names. 1.2.0 demotes the physical metaphor to
  "only when it fails the competitor-swap test". Product-true lost again, but as
  skeleton bars; 1.2.0 asks for real content in reduced quantity instead.
- **Builders' source-app checks found four fidelity errors in the CURRENT sections**
  (an assembly line where the app runs steps in parallel; a fallback-provider switch
  and a 47ms figure healing never does; a six-axis radar where the lab scores one
  composite; UI modes read as price tiers). Keep "verify every noun in the source
  app": it paid off even in a failed round.
- **One builder per section (three variants each) instead of one per variant** kept
  five agents instead of fifteen on a loaded machine; divergence stayed real (the
  three directions per section differed in strategy). A reasonable fallback, not
  the default.
- **Worktree dev servers:** Turbopack refuses a junctioned `node_modules` for `next
  dev` as well as for builds; `next dev --webpack` works and was used for capture.
- **Calibration debt:** the rejected captures were deleted when the owner discarded
  the round, so 1.2.0's SPARSE threshold (45% empty) is set from the three accepted
  illustrations only (23-33% empty). Keep the next rejected round's report.json.
