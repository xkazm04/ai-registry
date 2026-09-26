---
layer: application
type: application
subject: platform-format-adaptation
technique: format-as-measured-template
stack: next
status: forged
verified_on: 2026-09-26
verified_against: next@16.3.3
---

# A platform-limit table with no provenance, enforced as a refusal — a marketing app's social composer

*Verified against the systedo-case tree at commit `451b6e17`, 2026-09-24, read
on 2026-09-26. The version is witnessed by the tree's own `package.json`
dependency pin; engines `node 24.x`.*

This is the technique's first reading outside a video studio, and a transplant:
the container is a **text post**, not a vertical clip. The video-only half of
the technique does not apply here: canvas, occlusion, duration band, word budget
by delivery mode. The half about *what a platform-fact table may claim and
enforce* applies unchanged. That half is the one this tree gets wrong, in the
exact shape the technique names.

## The table

`src/lib/social/types.ts:19-25`:

```ts
/** Practical caption character limits per platform. */
export const PLATFORM_LIMITS: Record<SocialPlatform, number> = {
  facebook: 2200,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
};
```

One bare number per platform. The table has:

- no source;
- no date;
- no statement of whether each number is the platform's **ceiling** or a
  **performing band** someone chose.

The docstring's word "practical" suggests the second. Three of the four entries
are identical, which a per-platform measurement rarely produces. The lane that
read this tree could not match the Facebook and TikTok entries to a dated
platform source, and nothing in the tree tries to.

A second table, `src/lib/distribution/generate.ts:20-27`, mixes the two kinds in
one object:

```ts
/** Soft per-channel character budgets, ... so both honour the same limits. */
export const CHANNEL_LIMITS = {
  Newsletter: 600, LinkedIn: 3000, Instagram: 2200, "X / Twitter": 280,
} as const;
```

- `"X / Twitter": 280` is a platform ceiling.
- `Newsletter: 600` is a craft target, and no platform imposes it.

Both sit under the same "soft budget" docstring and the same enforcement. This is
the technique's "ceiling vs band" conflation, transplanted to characters.

## The enforcement

The first table is not advice. It is a validator at three points:

- **`src/app/api/social/posts/route.ts:130-133`** refuses the post with a 422
  error to the user: `Příspěvek překračuje limit ${PLATFORM_LIMITS[platform]}
  znaků.` ("The post exceeds the limit of N characters.")
- **`src/lib/ai/tools/social.ts:112-120`** reports an AI draft over the number as
  a length violation.
- **`src/lib/ai/tools/social.ts:185`** silently truncates the model's output to
  it: `clamp(content, PLATFORM_LIMITS[platform])`.

`src/components/social/Composer.tsx:193` shows the same number as the over-limit
state in the editor. The second table is enforced the same way on the repurposed
variants (`src/lib/ai/tools/repurpose.ts:95-100`). There, a newsletter teaser
over a chosen 600 is reported as a violation of the same kind as a tweet over
the real 280.

This is the refusal rule's failure case exactly: "a rule with no number behind it
may steer a composition; it must never become a validator". Here the number
exists, but its provenance does not, and that is the same failure one step
removed. The number looks like knowledge, so three layers defer to it.

## What the technique would change

1. **Split every entry into two fields.**
   - `ceiling` is the platform's published hard limit, with a source and an
     `as_of` date. Only this may refuse.
   - `target` is the band the product wants to write to, graded ASSUMED until
     someone measures it. It may steer: the prompt, the editor's colour. It may
     not refuse or truncate.
2. **Date the ceilings and give them a clock.** Platform caption limits move on
   the platform's schedule, as the vertical-video ceilings in this subject's
   process application moved.
3. **Keep the craft target out of the ceiling table.** `Newsletter: 600` belongs
   in a target table with its reason, not next to X's 280.

The tree already practises the discipline in one place. The Instagram publish
path in `src/lib/social/providers.ts:146-150` labels itself "the
documented-plausible simplification": a claim stamped with its grade. The limit
tables are where that habit stopped.

## Boundary

No video, reel or caption-on-frame pipeline exists in this tree at `451b6e17`.
Its only vertical format is a still-image preset: `story916`, 864×1536, at
`src/lib/images/types.ts:63`. That preset is generated natively at its own
aspect rather than cropped, so it satisfies the golden path's reframe rule by
construction. It carries no safe-area data. Studio images do not yet reach a
social post, so no occlusion is ever in play.
