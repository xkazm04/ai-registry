---
okf_version: "0.1"
okf_bundle_name: marketing
okf_bundle_title: Marketing
profile: rkb/0.1
purity: marketing
stacks: [prompt-pipeline]
---

# Marketing

The craft of getting a small or mid-size business found, chosen and measured: organic
search and the content that earns it, paid search and shopping advertising, the
measurement and diagnosis of marketing performance, conversion and lead handling, local
visibility, brand voice, and the honest use of generative models across all of it.

The organizing bet of this bundle is that **marketing knowledge decays at two speeds,
and the bundle keeps them apart.** The upper layers hold what a principal practitioner
would still defend after every platform renames its features: that the results page is
the verdict on intent, that a tool's volume number is an ordinal not a forecast, that
efficiency is not profitability, that a proof nobody gave you is a lie, that a
before/after read is not an experiment. The dated half - a platform's character limits,
the current click-through cost of an AI answer box, which listing fields a business
profile exposes this year - lives in applications and in techniques that say plainly
which of their thresholds are convention and which are measured. A rule that lacks a
study is labelled as convention wherever it appears; presenting a widely repeated
marketing claim as documented behaviour is the domain's most common failure and the
bundle refuses to reproduce it.

Subjects are written for two readers at once. A marketer gets the craft: what to do,
in what order, and what would tell them they are wrong. An agent generating a keyword
map, an ad set, a client report or a review reply gets **decision rules with their
predicates** - the sample-size gate before a verdict, the anti-fabrication clause that
is structural rather than instructed, the reciprocal thresholds that cannot disagree -
so that generated marketing output is publishable as-is rather than plausible.

The upper two layers are transplant-clean per the `marketing` purity profile: no ad
platform, search-data vendor, site builder, social network, CRM or model vendor is
named upstairs, and no product of the fleet this bundle was forged against. A team on a
different platform in a different market must be able to adopt a subject unchanged.
Applications are the opposite by design: they cite the real prompts, formulas, feeds and
tests of the workspace and the prompt pipeline this bundle was reconciled against, and
they name their stack in the filename. `prompt-pipeline` is the stack of a
command-driven agent workflow whose knowledge lives in prompt and reference files.

Cross-cutting invariants live in [`_laws.md`](./_laws.md); techniques cite them by
anchor. Subjects are grouped - and located - by [`taxonomy.json`](./taxonomy.json):
search and content, content production, paid advertising, measurement and economics,
local and zero-budget visibility, conversion and leads, positioning and proof.

Format: [RKB profile v0.1](../../docs/rkb-profile.md), an OKF profile.
Evidence: consumer-local by design - see the profile, section 5.
