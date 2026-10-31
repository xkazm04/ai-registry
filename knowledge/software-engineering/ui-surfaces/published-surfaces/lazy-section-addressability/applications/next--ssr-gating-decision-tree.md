---
layer: application
type: application
subject: lazy-section-addressability
technique: ssr-gating-decision-tree
stack: next
status: forged
verified_on: 2026-10-31
verified_against: next@16.3
applied: code
ab_verdict: better
proof: ab-paired
---

# The gating decision tree, audited against a streaming prerender (Personas marketing site)

How the `personas-web` tree applies
[ssr-gating-decision-tree](../techniques/ssr-gating-decision-tree.md), measured
against the HTML its production build actually emits. The stack version is
witnessed by the tree's `package.json` (`"next": "^16.3.8"`), and the build log
of the measured run printed `Next.js 16.3.8 (Turbopack)`.

The tree already carries a written version of the decision tree: the doc
comment on `createLazySection` in `src/components/sections/LazySection.tsx`
lists when to use `ssr: true` and when `ssr: false`, and the `/athena`
module states its reason for going client-only at the top of the file. So
the question this application asks is not whether a rule exists. It asks
whether the page a reader without script receives matches the rule.

## The instrument

A clean worktree of `origin/master` at `a648e8bd`, `npm ci`, `next build`, then
a dependency-free script over the prerendered `index`, `features`, `how` and
`athena` HTML. It splits each document's text into what is visible with
scripting off and what sits only inside hidden streaming segments
(`<div hidden id="S:n">`, revealed by an inline swap script), and it lists the
placeholder labels and the address wrappers. Positive control: `/features`
already names its seven gated placeholders, and the instrument read 7 of 7.

## What the configuration said and what was emitted

| Page | Section-level configuration | Emitted, scripting off |
| --- | --- | --- |
| `/` | 5 of 6 stages `ssr: false`, none with a reason; Vision server-rendered | hero, primary call to action, footer: 80 words; 6 of 6 address wrappers; 6 placeholders, 0 named |
| `/features` | 7 `ssr: false` behind named gates, one design section static | "Skip to main content Loading...": 5 words |
| `/how` | 4 `ssr: false` | 5 words |
| `/athena` | 8 `ssr: false`, reason stated | 5 words |

Three disagreements, and none of them is visible from reading the flags:

- **The flag is moot behind a viewport gate.** Every client-only home section
  sits inside a gate that renders a placeholder on the server whatever the
  section's mode is. Render mode is decided in two places, the section's
  flag and the stage's gate, and the gate wins. Neither place recorded that.
- **A section declared server-rendered showed its skeleton.** Vision, which
  the factory's comment names as the example of `ssr: true`, has its full
  content in the bytes (a raw-text fetch reads it) but inside a hidden
  streaming segment. A browser with scripting off shows the skeleton. The two
  non-executing readers the technique names, the text extractor and the
  script-disabled browser, receive different pages.
- **A route-level loading boundary hid three whole pages.** The app's only
  `loading.tsx` wraps every route in a suspense boundary, and the static
  prerender emitted its fallback in the visible document and the real page in
  a hidden segment. No section setting is involved.

## A and B

- **Target**: gated home placeholders that carry the section's name. A 0 of 5,
  B 5 of 5. Arm B passes each stage's existing scroll-map label (no new copy)
  into the gate, writes in `lazy.tsx` why every `ssr: false` there is
  client-only (it is gated, so a server render reaches no reader), and adds a
  test that fails if an ungated stage is client-only. Un-gating one stage as a
  mutation fails that test by name.
- **Floor**: address wrappers 6 of 6 in both arms; the other three pages'
  script-free text identical across arms; manifest tests 7 of 7, typecheck and
  build green. Held.
- **Arm C (measured, not shipped)**: the same build with the root loading
  boundary moved aside. Script-free words went from 5 to 226 on `/features`
  (all seven named placeholders appear), 5 to 325 on `/how`, 5 to 58 on
  `/athena`. It did not ship because that file is the app's only loading
  boundary. Deleting it also removes the navigation fallback on the dashboard
  and other dynamic routes, and no instrument in the run could measure that
  floor.

Arm B shipped on the project's default branch with the pre-push gates green.

## What this realization cannot do

- The audit reads prerendered files. It does not fetch a deployed page, so a
  CDN or middleware rewrite between build and reader is outside it.
- There is still no download route in the pre-script document. The only
  download pointer on `/` is an in-page address whose content is client-only,
  and the navigation's download control is a button. The technique's "a
  reader must still see when script fails" entry is unmet there, and arm B did
  not change it.
- Nothing runs this audit on a schedule. It ran once, by hand, in this
  application.
