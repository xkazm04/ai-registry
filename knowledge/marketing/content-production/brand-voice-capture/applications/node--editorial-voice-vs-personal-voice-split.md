---
layer: application
type: application
subject: brand-voice-capture
technique: editorial-voice-vs-personal-voice-split
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Editorial voice versus personal voice split - the mode router decides per surface

The Czech-first adtech workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) routes every AI
generation through one mode table, `src/app/api/ai/modes.ts`, and the table
is where the split lives: each mode's `prepare` step resolves the grounding
that mode may receive, server-side, before the generator runs. The tree
proves the technique structurally - the decision is made once per surface in
a router, not left to each tool's prompt - and it is the source of the
technique's "the twin enters where the article becomes a post" rule.

## The editorial branch: brand context, no trained voice

The comment at `modes.ts:598-603` is the technique's thesis in the tree's own
words:

> No twin voice, deliberately: the trained voice is the OPERATOR's personal
> voice (their [professional-network]/e-mail register). A brief and its
> article are brand editorial on the company's own site, already voiced by
> `brand` (the catalogue-derived context). The twin enters exactly where the
> article becomes a personal post - the `repurpose` / `social` rows below.

The `brief` mode (`:604-619`) resolves `deps.resolveBrandContext`, saved
keywords and ad patterns, composes them into `value.brand`, and never touches
`resolveTwinVoice`. The `article-draft` mode (`:620-626`) resolves only
`value.brand`. Neither has a voice field to fill.

The brand context itself is `deriveBrandContext` in
`src/lib/brand/context.ts:37-100`: name via `promptSafeName` so a demo marker
never grounds public copy (`:83-84`), top-four categories, item count, a price
band computed within the single dominant currency with other currencies
omitted rather than merged (`:50-59`), the sale nature as `hybrid` when
offerings disagree rather than whatever the first row says (`:75-79`),
top-four differentiators and channels, and the closing line "stay within this
catalog and the brand's vocabulary - don't invent other products." The
header comment (`:34-36`) is explicit that this is "facts only - the model
still writes in the requested locale and to the user-chosen tone." It returns
`""` when there is nothing real to say - an untrained, uncatalogued tenant
gets no grounding rather than a plausible one.

## The personal branch: brand context plus the scoped trained voice

`repurpose` (`:670-690`) picks the scope from the channel -
`value.channels.includes("Newsletter") ? "email" : "social"` - and sets
`value.voice = await deps.resolveTwinVoice(...)`. `social` (`:695-714`)
resolves `"social"` and spreads `...(voice ? { voice } : {})` into the skill
input alongside brand and performance grounding. `twin-reply` (`:630-663`)
resolves the brand context after a draft gate and the reply tool loads the
channel voice on its own path. Every personal surface receives both the fact
block and the voice; every editorial surface receives only the fact block.

`resolveTwinVoice` (`src/lib/twin/load.ts:36-55`) is tenancy-checked and
degrades to `undefined` on a store error, and `loadTwinVoice` (`:28-32`) goes
through `selectInjectableVoice` in `src/lib/twin/inject.ts:25-38` - so the
personal branch is also where `tenant-never-speaks-the-sample-persona` is
enforced: a tenant's pool is filtered to `trainedScopes`, then resolved
own-scope-else-generic, then rejected if directives are empty.

## Disclosure on the response, not sniffed from the prompt

`modes.ts:676-686` sets `meta.voiceApplied = { scope }` only when a voice
resolved and the scope is `email` or `social`, with the comment: "the
client's ONLY honest basis for a voice pill. Prompt-sniffing would
false-claim on untrained twins because the prompt also carries the user's
prose." The technique's fourth decision rule is this line.

## What the tree proves, and the deviation

Confirmed: the split is a router property, decided in `prepare` per mode,
with the editorial modes structurally unable to receive a voice (no field)
rather than merely instructed not to. Confirmed: the personal branch adds the
voice on top of the brand context rather than replacing it. Confirmed:
disclosure rides on server metadata. Upward lesson: the "voice follows the
surface at the repurpose step" rule and the newsletter-to-email scope mapping
came from this router. Deviation: there is no editorial *style* profile - the
editorial branch has facts and a user-chosen tone word only, which is the
technique's "institutional is not generic" caveat unmet; the standard stays.
