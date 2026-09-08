# Lessons - cx

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-09-07 - firetv

- **Authored from a real need, before its first run.** A Next.js prototype of a TV-plus-phone
  product had sixteen TV screens and seven phone screens composed in one day, and the next job was
  not more screens but walking them as a user would, one at a time, across several sessions. No
  lane skill did that: `/explorer` finds defects in code, `/uat` checks acceptance, `/perfect`
  polishes a build. The gap was a *journey* walk with a CX lens, a stop-and-review rhythm, and a
  vault that survives the session boundary.
- **The stop is the unit, not the screen.** The first draft keyed everything by screen. That fails
  the moment a screen is met in two journeys - a hint screen reached from a homework page and the
  same screen reached from a phone question are different experiences with different reads. A stop
  is one screen in one scenario; ids are stable; `replan` reorders and never renumbers.
- **The user's turn is one prompt and it is prose.** The other lane skills make every prompt a
  single keystroke, and that discipline is kept for triage. But the thing this skill exists to
  collect - the user's own read and expectation for a screen - is not a menu choice. So Phase 5 is
  one prompt with a free-text default lane and keystroke triage inside it, and the expectation
  outranks the read: a contradicted proposal is withdrawn, never argued.
- **Zero proposals must be a legal outcome.** A review skill that always returns a table teaches
  the user to skim the table. The read allows an empty table with one sentence, and the heuristics
  reference names "filling the table" as an anti-pattern.
- **Every proposal names its heuristic or dies.** This is the whole defence against taste. The
  heuristic list lives in `references/` so a consumer can extend it via the overlay's
  `## Heuristics` without a fork; the 10-foot-UI and second-device sections came straight from the
  product that prompted the skill and are written generally enough to transplant.

## 1.0.0 - 2026-09-08 - firetv
- A stop for a screen that does not exist yet reads as a spec: the executor builds the read, and the real read only happens on the built screen. When the map adds new screens, budget a second round at that stop for the user's review before moving on.
- The user's review of a freshly built screen can redirect branding (module names, illustrations, a mark). Keep a hook for an image skill (/leonardo) in the overlay's Repo law or Run section so the executor can generate assets instead of leaving placeholders.
