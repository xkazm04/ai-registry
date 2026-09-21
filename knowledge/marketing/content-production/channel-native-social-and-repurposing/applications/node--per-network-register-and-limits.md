---
layer: application
type: application
subject: channel-native-social-and-repurposing
technique: per-network-register-and-limits
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Per-network register and limits - the workspace's social and repurpose tools

Verified against the Czech-first marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08). The workspace has the
register-and-limit table rendered from one source into the prompt, the deterministic
clamp, and the clampable-versus-model partition; it also shows the deviation the
technique warns about - one register table per tool rather than one shared, and one
limit per network rather than per account.

## The table, rendered into the prompt

`src/lib/social/types.ts:20-25`, `PLATFORM_LIMITS`: 2200 / 2200 / 3000 / 2200 for the
conversational, visual, professional and short-video networks. The distribution
module's `CHANNEL_LIMITS` (`src/lib/distribution/generate.ts:22-27`) holds the soft
repurposing budgets - Newsletter 600, professional 3000, visual 2200, microblog 280 -
and the comment at `:19-21` states the shared-source rule: budgets are *"shared by the
deterministic repurpose() output and the AI repurpose tool so both honour the same
limits"*.

`src/lib/ai/tools/social.ts:39-44`, `PLATFORM_GUIDE`, holds the register per network as
one phrase each (conversational: friendly, light emoji; visual: emoji plus three to six
hashtags at the end; professional: matter-of-fact, minimum emoji; short-video: short
and playful, hook in the first sentence, three to five trending hashtags). The prompt
builder renders each requested network as
`- <label> (<key>): <register> | max <limit> znaků` (`:66`), so the register and the
limit reach the model on one line from the two tables. The system instruction adds the
margin - *"Nepřekračuj limit znaků dané platformy (raději mírně pod ním)"* (`:35`) - and
the triad (`:32`).

## Clamp for length, re-prompt for absence

`src/lib/ai/tools/_shared.ts:16-17`, `clamp`: `s.slice(0, n - 1).trimEnd() + "…"` when
over `n`. `lenViolation` (`:50-51`) emits the one canonical sentence, and
`LEN_VIOLATION_RE` (`:58`) matches exactly that shape, *"anchored at both ends so a
free-text violation that merely mentions a limit ... can never be mistaken for a
clampable overrun"* (`:53-57`). `partitionViolations` (`:67-75`) splits into
`clampable` and `needsModel`; the LLM wrapper (`src/lib/llm/index.ts:357`) re-prompts
only when `needsModel` is non-empty. The comment at `:38-45` gives the economics in the
technique's words: a length overrun *"is deterministically repaired by clamp() ... so
paying for a second full model call to fix it is pure waste"*.

Both tools apply it. `validateRepurpose` (`src/lib/ai/tools/repurpose.ts:87-110`)
emits `lenViolation` for an overrun (`:100`) and a free-text *"Chybí varianta pro
kanál"* for a missing channel (`:105-107`); `normalizeRepurposeTracked` (`:118-142`)
clamps every model variant to its channel limit (`:133`) and backfills missing
channels from the deterministic `repurpose()` (`:136-140`). `validateSocial`
(`social.ts:106`) and `normalizeSocialTracked` (`:170-192`) mirror it with
`PLATFORM_LIMITS`.

## The write path re-checks the ceiling

`src/app/api/social/posts/route.ts:130-134` refuses a post over
`PLATFORM_LIMITS[platform]` with HTTP 422, independent of which generator produced it.
The technique's "the generator's clamp is a convenience; the endpoint's check is the
gate" is realised literally.

## Fallback labelled as fallback

`repurpose.ts:158-166` and `:174-188`: `modelCount` (channels the model actually
filled) drives a `backfill` state of `"none" | "partial" | "full"`, and a real-provider
run is re-labelled `meta.demo = true` when fully backfilled or `meta.partialDemo = true`
when partly (`:186-188`). The header at `:82-86` records the incident this closes: an
empty `variants` array used to pass validation, skip the repair, and let the normaliser
backfill every channel from templates *"while meta.demo stayed false - i.e. canned
content billed as a real generation"*.

## Structural facts the tree proves

1. Clamp-versus-re-prompt is decidable by the *shape* of the violation string, and the
   narrow anchored matcher is what makes the decision safe.
2. A missing channel must be a validation failure, or backfill silently masquerades as
   generation - the tree's own incident.
3. The endpoint's limit check and the generator's clamp are independent, and both
   exist.

## Deviations

- **Two register tables, not one.** `PLATFORM_GUIDE` in the social tool (`social.ts:39-44`)
  and the register bullets in the repurpose system prompt (`repurpose.ts:24-28`)
  describe the same networks in two places, in slightly different words (the visual
  network's hashtag count matches; the professional network is "klidně s odrážkami" in
  one and not the other). The technique asks for one table rendered into both.
- **One limit per network, not per account.** The microblog budget of 280 is the free
  tier's ceiling; a paid-tier account is capped at the floor. The limits are also
  below the current documented ceilings for two networks (the short-video feed now
  accepts several thousand characters; the conversational network far more), which is
  safe but unlabelled as a deliberate floor.
- **Register is prompt-only.** No validator checks hashtag count or placement; the
  register is enforced by the model's compliance and the reviewer's eye, which the
  technique accepts, but the limit is the only half with a gate.
- The visual network's closing line says the link is in the profile
  (`generate.ts`, `instagramCta`), but nothing strips a URL the model may have written
  into the visual caption; the "link is the system's" rule is instructed (`repurpose.ts:30`)
  rather than enforced.
