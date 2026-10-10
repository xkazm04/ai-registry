---
okf_version: "0.1"
okf_bundle_name: technical-writing
okf_bundle_title: Technical writing
profile: rkb/0.1
purity: writing
stacks: [process, next]
---

# Technical writing

The craft of the long-form technical article: a post that teaches a practitioner something
true about a mechanism, shows the numbers that prove it, and survives being read by an
expert and a newcomer on the same afternoon. It covers the shape of the argument (an
opening that carries the thesis, a preview that tells the reader what they are about to
spend, a through-line, a closing chapter that settles the account), the register the
sentences speak in, what every number rests on, how figures and tables carry the
structured half of the material, and whether the page still reads once it reaches the
surface it is published on.

This is a **seed bundle**: six subjects, written from a two-round writing contest whose
owner review named the defects, from the round that fixed them, and from the public craft
literature those rounds leaned on, each source re-opened before it was encoded. It is
smaller than a forged domain on purpose. A subject is added when a run teaches something
none of these six can hold, not to reach a count.

## Boundary contract with neighbouring bundles

Cross-bundle links are forbidden by the profile, so the seams are stated here in prose.

- **`marketing` / `content-brief-and-article-composition`** owns the search-driven
  article: what a brief must carry, the quick answer in the first fifty words, retention
  pacing for a scanner, the one call to action. This bundle owns the article whose job is
  to explain a mechanism to a practitioner, where the opening is a scene rather than an
  answer box and there is nothing to convert.
- **`software-engineering` / `long-form-reading-surface`** owns the reading surface as
  software: heading ids, a contents panel, scroll-spy, fixed-chrome offsets. This bundle's
  `medium-format-fidelity` owns what the *article* owes that surface: a column, a type
  scale, both colour schemes, highlighted code, two viewports, and a translation to the
  target platform's capabilities.
- **`localization` / `english`** owns the anchored English construction rules, including
  the catalogue of generated-prose patterns. `voice-and-register` cites that catalogue by
  name and owns only what long-form reporting adds: impersonal results, rhythm across a
  paragraph, and the house decisions a single post must make consistently.
- **`media-generation` / `short-form-narrative-structure`** and its sibling
  `evidence-bound-visuals` own the factual video: beat-level curiosity debts and visuals
  bound to a cited fact. The article borrows the debt idea for its through-line and the
  binding idea for its captions; neither is restated here.

The upper two layers are transplant-clean per the `writing` purity profile: no
publishing platform, no diagram or highlighting library, no model vendor. Applications
name them freely, with their dates.

Cross-cutting invariants live in [`_laws.md`](./_laws.md); techniques cite them by
anchor. Subjects are grouped, and located, by [`taxonomy.json`](./taxonomy.json).

Format: [RKB profile v0.1](../../docs/rkb-profile.md), an OKF profile.
Evidence: consumer-local by design, see the profile, §5.
