---
okf_version: "0.1"
okf_bundle_name: localization
okf_bundle_title: Localization
profile: rkb/0.1
purity: localization
stacks: [spec]
---

# Localization

The craft of making a product read as if it were written first in each of its
languages: what a specific target language demands of a translator that the source
language never hints at, and the invariants that keep a multi-locale catalog honest
while dozens of hands — human or agent — work on it at once.

The organizing bet of this bundle is that **language mastery is transplantable and
product voice is not**. What "Czech" or "Japanese" requires — the address system, the
agreement mechanics, the typography, the constructions that expose a translation as a
translation — is the same for every product that ships that language, and it is
exactly the knowledge every new project rebuilds from scratch today. So each language
is a subject here, its techniques written as anchored rules an audit can cite by name.
What stays in the consuming repo is everything the bundle must never absorb: the
termbase (what THIS product calls things), the exemplars (THIS product's voice), the
format contract (THIS repo's catalog mechanics), and every house ruling where a
product deliberately overrules its style authority.

Subjects are written for two readers at once. A human localizer gets the craft. An
agent running a mass translation or review pass gets **citable anchors**: every
construction rule carries a stable identifier, so a typed audit finding can name the
rule it rests on — the law that separates a defect from taste. That is what makes
fan-out review by smaller models workable: the expertise is in the bundle, the worker
only has to recognize and cite it.

Cross-cutting invariants live in [`_laws.md`](./_laws.md); techniques cite them by
anchor. Subjects are grouped — and located — by [`taxonomy.json`](./taxonomy.json).
Languages are grouped by the localization problems they share (script, direction,
plural system), not by genealogy.

## Boundary contract with the `i18n-translate` skill

The skills lane's `i18n-translate` owns the **workflow**: the three-pass loop, the
mode dispatch, the merge-gate mechanics, the per-repo contract bootstrap. This bundle
owns the **language knowledge** that workflow consumes: what a finding may cite, what
a language's rules actually are. The skill tells you to audit with typed errors; this
bundle is where the anchors live. Neither restates the other.

The upper two layers are transplant-clean per the `localization` purity profile: a
team localizing a different product, on a different i18n stack, must be able to adopt
a language subject unchanged. Applications are the opposite by design — they cite real
catalogs and real check scripts from the repos this bundle was reconciled against.

Format: [RKB profile v0.1](../../docs/rkb-profile.md), an OKF profile.
Evidence: consumer-local by design — see the profile, §5.
