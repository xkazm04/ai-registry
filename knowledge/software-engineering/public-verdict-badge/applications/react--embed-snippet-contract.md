---
layer: application
type: application
subject: public-verdict-badge
technique: embed-snippet-contract
stack: react
status: forged
---

# A snippet generator that pins what it means

`src/components/badge/BadgeGenerator.tsx` is the client surface where a repo
owner builds the code they will paste into a README. It is small, and almost
every line of it is a decision about what the pasted artifact will assert
years later.

## The pinning rule, and the drift it prevents

`BadgeGenerator.tsx:35-39`:

> The gate badge's pass bar. Without an explicit `min_level` the badge route
> evaluates the archetype-dependent DEFAULT policy — a bar the badge author
> never saw or chose, which silently changes if the repo's detected archetype
> changes. The generator therefore always pins an explicit `min_level` on gate
> URLs and states what "pass" means.

This is the sharpest available argument for pinning, because the drift needs
no actor at all: the default is *derived* from the repo's detected archetype,
so adding a directory can change the bar a public badge advertises. Nobody
edited the snippet and nobody edited the service. `:75` therefore always sets
`min_level` on gate URLs, even at the `L3` default, and the UI states the bar
in words beside the badge.

Cosmetic parameters are treated oppositely: `:70` omits `style` when it equals
`flat`, because a badge whose shape modernizes harms nobody.

## One policy behind two snippets

The same page also offers a "guard it in CI" block, and two renderings of one
bar is exactly the shape that drifts. `src/app/badge/gate-snippets.ts:1-9`
resolves both server-side from a single `PUBLIC_GATE_POLICY` (`:22`), running
it through the canonical enumerators — `describeGatePolicy` for the
per-condition fragments and `ciActionYaml` for the workflow — so that:

> Hand-rolling either would let the public page advertise a bar the action
> doesn't take.

`GATE_YAML` (`:27`) and `GATE_QUERY` (`:30`) are two projections of one value,
and the generator interpolates the repo the user just typed into the same
section (`BadgeGenerator.tsx:49-56`), which is why the block renders from
inside the component rather than beside it.

## The other contract surfaces

- **Three markup forms from one model.** `:97-107` emits Markdown, HTML, and
  AsciiDoc from the same `badgeUrl` / `reportUrl` / `alt` triple. Each form
  wraps the image in the link, so no form loses the audit path.
- **Absolute addresses.** `:64` derives the origin client-side precisely
  because a relative address is useless in the destination README.
- **Alt text carries the claim**, not the word "badge" (`:95`), and is the
  same string in all three forms.
- **The link resolves from durable identity.** `parseRepo` (`:20-28`)
  normalizes pasted URLs, `@`-prefixes and `.git` suffixes down to
  `owner/repo`, validated by `validRepoNamePart` from `src/lib/badge.ts` — the
  same predicate the server route enforces at `route.ts:47-53`, single-sourced
  so the client cannot advertise a name the endpoint rejects.

## The preview exception

`:87-91` renders the on-page preview from `badgeUrl + preview=1` rather than
from `badgeUrl` itself, while the copyable snippet keeps the canonical
address. Two effects, both deliberate: the extra param makes the response
`private` (uncacheable by the CDN, so the preview is always live), and it
takes the request off the canonical path that `route.ts:230` tallies, so the
generator page cannot manufacture reach impressions for every repo anyone
types into it. `:188` restates it at the call site — "the preview is the app's
OWN image and must not be counted."

## Deviation

The generator does not pin the rubric or engine version, so a snippet's
`level` badge can change meaning when the scoring rubric changes underneath
it. That is defensible for a level badge — the level *is* the current
assessment — but it means the pinning discipline is applied to exactly one
meaning parameter today. A second one (the rubric version) would need the same
treatment the moment level definitions are revised.
