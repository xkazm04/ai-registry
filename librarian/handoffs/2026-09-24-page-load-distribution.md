# Page-load distribution plan - 2026-09-24

Subject: `software-engineering/client-architecture/page-load-pipeline` (forged
2026-09-24, commit `9e41d0a8`). This plan takes the subject to every fleet
project that serves a web front end. Six read-only audits produced it, one per
tree, each scoring its tree against all eight techniques with quoted `path:line`
anchors. **Nothing below was measured.** Every audit read source and old build
artifacts only. The first wave exists to replace that with numbers.

## Scope

| Project | Surface | Stack | Applies |
| --- | --- | --- | --- |
| personas-web | public marketing site + guide + demo dashboard | Next 16 | all 8 techniques |
| kp | public landing + authenticated app | Next 16 | all 8 |
| ascent | public landing, about, pricing, report permalinks | Next 16 | all 8 |
| goat | public ranking app with share pages | Next 16 | all 8 |
| politicas | public civic data site (45 pages, feeds, widget) | Next 16 | 7 (no images) |
| personas | desktop app (packaged webview) | Tauri + Vite | render-blocking, fonts, script cost, reservation + `startup-phasing` |
| athena-everywhere / athena-desktop | desktop app (packaged webview) | Tauri + Vite | same as personas |
| athena-everywhere / examples (6) | demo apps | Next 16 | out of scope until one is served publicly |

## What the fleet has in common (fix these once, everywhere)

The audits converged. Four patterns recur across trees that never shared code, so
the plan fixes them as a fleet wave, not project by project.

1. **The first render is served invisible (5 of 5 web apps).** An entrance
   animation rendered on the server writes `opacity:0` into the document around the
   headline. In personas-web it wraps the main content of *every route*, through the
   page-transition wrapper. The largest paint cannot happen until script hydrates.
   The technique `script-cost-is-main-thread-time` now carries this as its own
   section, "hide it", with the served-HTML grep as the check.
   - personas-web: page-transition wrapper + hero `fadeUp` wrappers. **That file is in
     another session's merge conflict right now. Coordinate before editing.**
   - kp: `Hero.tsx` h1 `initial={{ opacity: 0, y: 28 }}`.
   - ascent: four components outside its `Reveal` rule (`ScoreGauge`,
     `OrgIndexInstrument`, `PassportHero`, `CreditMatrixLedger`). The cause is one
     helper whose server snapshot assumes motion.
   - goat: `ShowcaseHeader.tsx` letters at opacity 0 with delays of 0.3 to 1.8 s.
   - politicas: `HeroStory.tsx` and seven page h1s.
   **Measure:** count of inline `opacity:0` ancestors of the page's h1 in the served
   HTML, target 0. **Floor:** no hydration mismatch, layout shift unchanged,
   reduced-motion behaviour unchanged.
2. **No real-visit measurement (5 of 5).** Tracing sample rates are 0, or the
   tracing config is never loaded, and nothing reports load metrics. Without this,
   every later wave is judged in a lab, which `field-measured-load-budget` forbids
   as a verdict. **Change:** a load-metric reporter (largest paint, interaction
   responsiveness, layout shift, with the responsible element and device class)
   into each project's existing consent-gated analytics. About 40 lines each.
3. **The whole message catalog ships with every page (3 trees).** kp sends 672 KB
   to every route, and its landing uses 15 KB. politicas sends 262 KB of 28
   namespaces where the landing needs about 24 KB. The personas desktop entry
   bundle carries a 567 KB English catalog chunk. **Change:** scope the client
   catalog provider to the namespaces the surface renders. **Lead filed** for the
   i18n subject (below), because the rule belongs there and not in page load.
4. **Fonts nobody draws.** personas-web loads a foreign, render-blocking stylesheet
   of six non-Latin families × five weights for English readers who never draw one
   glyph from it. goat imports a foreign font stylesheet from inside its own CSS, a
   second blocking hop, and loads its sans font twice. kp preloads two families its
   landing's first screen never uses, plus the `latin-ext` subset for everyone.
   politicas preloads four unused mono weights (about 37 KB).

## Waves

Every item names its technique, the number that should move (target), and the
number that must not (floor). A change without a target is a lead, not a task.

### Wave 0 - instruments first (every web app, small)

- Field reporter (pattern 2).
- A byte gate that **fails when its input is missing or stale**. personas-web's
  gate silently compared an old build against new ceilings, and passes routes that
  have no ceiling. ascent, politicas and goat have no gate at all. Copy one gate
  across the fleet, reading the framework's per-route bundle stats after `build`.
  Size: 1 script + 1 CI line per project.
- A served-HTML check for pattern 1, runnable in CI: fetch `/`, fail on
  `opacity:0` above the h1.

### Wave 1 - fleet-wide, one to ten lines each

| Project | Change | Technique | Target / floor |
| --- | --- | --- | --- |
| all 5 | pattern 1 | script-cost (hide it) | inline opacity:0 above h1 = 0 / no hydration mismatch |
| personas-web | load the non-Latin font stylesheet only for those locales, else preconnect | render-blocking, fonts | foreign origins on `/` critical path 1 to 0 / non-Latin locales still render |
| goat | delete the CSS-level font `@import`, route families through the framework font loader | render-blocking, fonts | requests to font hosts to 0 / headings keep their face |
| goat | drop `priority` from the decorative 1.1 MB backdrop (drawn at ~0.25% opacity) | priority | no high-priority image on `/` / backdrop still shows |
| ascent, personas-web | drop `priority` from the logo shared by every route | priority | image preloads per route to 0 / logo does not shift |
| kp | preload only fonts the landing's first screen draws; `latin` preloaded, `latin-ext` not | fonts | font preloads on `/` at most 3 / Czech diacritics still render |
| politicas | remove unused mono weights 500/600 | fonts | 4 fewer preloaded files / no glyph falls back |

### Wave 2 - script cost, per project

| Project | Change | Target |
| --- | --- | --- |
| kp | scope the message catalog per surface (pattern 3); lazy-load the nine spotlight previews | about 650 KB less on `/` |
| politicas | scope the catalog; import the error reporter only when a DSN exists; load chart components dynamically on three routes | at least 70 KB compressed less HTML; 120 KB less shared JS; about 400 KB less per chart route |
| ascent | import the auth client inside the click handlers | 226 KB less shared first load on 47 routes |
| personas-web | keep the animation library out of the root layout; hero static text as a server component | shared floor below ~848 KB |
| goat | stop the provider tree remounting the whole app after idle (verify first) | root mounts once per navigation |
| personas (desktop) | take the English catalog out of the entry graph; paint the shell before the content gate; split the single boot number into phases | entry graph at most 1.4 MB; shell paint under 300 ms |
| athena-desktop | hide the window until the chrome's first commit; add startup phasing; lazy panel modules | 0 off-theme frames; a boot baseline |

### Wave 3 - structural, needs an owner's decision

- **Static marketing pages.** ascent and politicas render every public page per
  request: a session read in the header in ascent, a cookie-based locale in the
  root layout in politicas. So every document is sent with `no-store`, which
  blocks back/forward restoration and disables their `revalidate` settings.
  kp's public routes are probably the same (inferred, not observed).
  `navigation-reuse`. Size: large; the locale change in politicas is a routing
  change.
- **Share pages rendered on the server** (goat `/share/[code]`, `/collections/[slug]`),
  the main entry from social links. `discoverable-critical-resources`.
- **One placeholder per slot** (personas-web `LazyMount` + section skeleton; ascent
  video stage). `layout-stability-by-reservation`.

## How the knowledge reaches each project

1. Each project's `.ai/registry-map.json` joins its contexts to subjects. The
   new subject is unmapped everywhere until the map is rebuilt:
   `node scripts/build-registry-map.mjs --project <slug>`. `/conform` does this in
   its sweep and judges each pair.
2. Skills that carry the knowledge-sync clause (`perfect`, `architect`,
   `ship-loop`, and now `illustrate`) read the governing golden paths before
   proposing. Once the map carries `page-load-pipeline`, their proposals cite it.
3. Wave items ship under intake's Phase 8 rule: a paired measurement, a pathspec
   commit on the project's branch, never pushed. A wave-1 item is a coverage
   change inside an existing context, so it needs no direction proposal.

## Coordination

- personas-web's main checkout was mid-merge on 2026-09-24 (a scan-sweep branch
  touching `PageTransition.tsx`, `SwarmView.tsx`, `.ai/applied.jsonl`). Pattern 1's
  personas-web fix touches the conflicted file. It lands after that merge, from
  a worktree.
- The /illustrate prototype branch `illustrate/landing` (worktree `C:/t/pw-ill`)
  also touches the landing's hero. Its variants render visible on the server by
  construction. Pattern 1's fix applies to the current hero, so land it on the
  project's main branch, not the prototype branch.

## Leads

- **i18n: ship the catalog each surface renders, not the catalog** (3 trees, pattern
  3). Return condition: a pass over the i18n subject (`client-architecture/i18n`)
  or the first measured wave-2 catalog split.
- **Framework default `no-store` on dynamic documents** as a back/forward-cache
  blocker: inferred from the framework's source in two trees and never observed.
  Return condition: one `curl -I` plus a restore test on a production build.
