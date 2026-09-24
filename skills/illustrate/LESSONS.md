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
