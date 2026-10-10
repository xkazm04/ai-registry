---
layer: application
type: application
subject: medium-format-fidelity
technique: two-viewport-verification
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A phone instrument that never visits an article

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The blog and guide are those of the `reading-column-and-type-scale` application beside this
file.

## What the suite has

- **Two projects.** The desktop project runs at the test runner's default window and skips
  phone specs, playwright.config.ts:35 "testIgnore". The phone project emulates a 390-pixel
  phone, playwright.config.ts:45 "browserName", and runs only the specs under e2e/mobile.
- **A good probe, on other routes.** The phone baseline asserts no horizontal scroll from
  top to bottom, e2e/mobile/baseline.spec.ts:80 "has no horizontal scroll at phone width".
  It measures with the body's horizontal clip lifted,
  e2e/mobile/baseline.spec.ts:112 "content overflows once body". That clip is real:
  src/app/globals.css:68 "overflow-x: hidden;". The probe is the technique's method, done
  well.
- **Theme seeding, on one spec.** The phone landing spec writes a stored theme before load,
  e2e/mobile/m-landing.spec.ts:18 "dark-midnight", and another case seeds the light theme.
- **No article route on a phone.** No phone spec visits the blog or the guide. The desktop
  specs check that the blog and guide render and carry content
  (e2e/guide.spec.ts:13 "/guide"), with no seeded theme. Since a first visit picks one of
  eleven themes at random (see the `light-and-dark-rendering` application), each desktop run
  checks an unknown scheme. No screenshot comparison exists anywhere in the suite.

## What an article check would meet

- **Guide tables.** 34 table rows in guide content. Each table scrolls inside its own box,
  src/components/guide/blocks/MarkdownTable.tsx:18 "my-6 overflow-x-auto". Its header
  cells do not wrap, so a phone gets a scroller, not a sideways page.
- **Line length.** The column measurements are in the reading-column application: 44
  characters at 390, and 99 to 108 at the wide end. The wide end is where this site's
  defect is, and its guide column grows with the window up to 832 pixels.

## Simulation

Policy A is the technique before 2026-10-10. Two widths, 390 and 1440, in both schemes,
with a scroll-width probe and screenshots. Policy B adds four things:
- the wide check sits where the column is at its maximum;
- a site-wide phone check does not cover articles unless it visits them;
- each render seeds its scheme;
- a page-level clip is lifted before probing.

- **The phone baseline.** A reads it as the two-viewport check done: a 390 probe exists
  and passes. B asks which routes it visits: none of the article routes. So the posts'
  narrow-width check has not run.
- **The desktop blog and guide specs.** A notes that they assert presence, not layout. B
  adds that the scheme is unseeded, so even a layout assertion would hold for one theme in
  eleven, chosen at random. The repository already seeds a theme in its landing spec; B
  points to that pattern.
- **The probe itself.** Both accept it, and B's clip rule is already met: the probe lifts
  the body's clip. Same verdict.

B finds the gap in two of three cases where A would pass the suite, and agrees on the
third. This is judgment on the suite's code; no test was run.

**Falsifier:** a phone run over every blog post and guide topic, seeded with each theme,
that finds nothing. That would mean the gap is in coverage only, with no defect behind it.
Nothing was added to the suite: the project's map does not join this bundle.
