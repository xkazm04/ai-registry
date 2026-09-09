---
layer: technique
type: technique
subject: brand-voice-capture
technique: tenant-never-speaks-the-sample-persona
status: forged
laws: [provenance-is-binary-and-labelled]
shared_with: []
use_when: [seeding a default voice per business type, deciding which voice may be injected into a real customer's generation, reviewing a readiness score that an untrained business passes]
---

# The tenant never speaks the sample persona

A product that trains a voice needs something to show before anything is
trained. The usual answer is a seeded profile per business type - "write like
an experienced person from an online shop: factual, helpful, no marketing
filler; address the customer by name and answer in the first sentence" - so
the editor is not blank and a public demo has flavour. The seed is useful and
the technique does not forbid it. It forbids one thing: **a real business's
generations must never carry a voice the business did not save.** The seeded
persona is illustrative data, and illustrative data is labelled and kept
apart from the real branch - it is never presented as the client's own.

## The failure

The resolve step that loads a business's voice typically merges the seed
*under* the saved voices so the editor always has a row per scope. If that
merged state is what generation reads, an untrained real tenant's drafts
arrive in the canned persona: the product is impersonating a brand it has
never met, in whatever language and register the seed was written - a
Czech-language shop-assistant persona on an English-speaking consultancy's
lead replies. Nothing in the output says it is a placeholder. The owner reads
their "voice", recognises nothing, and the product has lied about provenance
on the first draft.

## The rule, pinned at one seam

Injection is decided by one pure function that takes the resolved state, the
set of scopes the tenant actually trained, the project's kind and the
requested scope:

- a **demo** project draws from all voices including the seed - that is the
  seed's job, and the public demo should show what a trained voice does;
- a **tenant** project draws only from voices whose scope is in the trained
  set, then resolves own-scope-else-generic within that pool;
- a voice row with empty directives is an editor draft, not a trained voice,
  and injects nothing even when its scope is listed as trained - a
  saved-then-cleared voice must not fall back to the seed underneath it.

Demo-ness comes from the project's kind at a single seam, never from a name
prefix or a string test, because a naming convention is one rename away from
leaking a persona into a paying customer's drafts. The function is
framework-free so every branch pins in a unit test without a store.

## The seed carries no evidence

The second half of the rule is about readiness. A seeded profile ships with
directives, a few traits and two universal red lines ("never promise a price,
date or discount that is not in the source material"; "when you do not know,
say so and offer to find out") - and **no samples, no facts, no drafts**. A
seeded "five samples" would tick the training milestone for free; a long
seeded red-line list would tick the guardrails milestone without the business
ever having thought about its hard lines. The readiness surface must show an
untrained voice as untrained, and that only holds if the seed contributes
nothing the gates count. Every seeded channel starts supervised; autonomy is
a decision a human makes, never a default the product makes for them.

## Decision rules

- When a generation is for a tenant project, filter the voice pool to the
  scopes that tenant saved with non-empty directives, because anything else
  is the product speaking as a brand it does not know.
- When a generation is for a demo project, allow the seed, because a demo is
  disclosed illustrative output by definition.
- When a saved voice has been emptied, inject nothing rather than the seed
  beneath it, because the owner cleared it on purpose.
- When seeding, include no samples, no facts and no drafts, because a seed
  that ticks a readiness gate makes the gate meaningless.
- When deciding demo-ness, read the project's kind from the one seam that
  owns it, never from a name, because a string test leaks on the first
  rename.

## When NOT to use

Do not extend the rule to the brand *context* - the catalogue-derived fact
block is the tenant's own data, not a persona, and it grounds an untrained
tenant's editorial output legitimately. Do not hide the seed from the editor:
the owner should see the starting register and overwrite it; the rule is
about what generation reads, not what the screen shows. And do not use the
seed's absence from generation as a reason to inject nothing voice-shaped at
all for an untrained tenant - each tool's own "write plainly, on brand" rules
govern there, which is the honest default.
