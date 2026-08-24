---
layer: application
type: application
subject: skill-adjacency-and-normalization
technique: canonical-term-with-surface-aliases
stack: data
status: forged
verified_on: 2026-08-23
source: EuropeanCommission/ESCO
---

# Canonical identity in a published multilingual skills taxonomy

**Pin.** Publisher: the European Commission (DG Employment, Social Affairs and
Inclusion). Dataset: ESCO, the multilingual classification of European Skills,
Competences and Occupations, at `https://ec.europa.eu/esco/api`. Every query below
carries `selectedVersion=v1.2.1`, the version the portal's download page names as
current (last update 10/12/2025); the API accepts exactly `latest`, `v1.1.0`,
`v1.1.1`, `v1.2.0`, `v1.2.1`, rejecting `v1.0.0`–`v1.0.3`, `v1.2.2` and `v1.3.0`
with `ConstraintViolationException` / "Invalid ESCO version". Retrieved 2026-08-23
(server `Date: Sun, 23 Aug 2026`). Terms: the portal footer's legal notice points at
the Commission's reuse policy — Decision 2011/833/EU, default licence CC BY 4.0,
attribution plus an indication of changes, third-party rights and trade marks
excluded. The documentation page states no rate limit and no separate API terms;
each result below is one request, and no bulk sweep was run.

## The identity is stable; the surfaces are not

Concept `http://data.europa.eu/esco/skill/ccd0a1d9-afda-43d9-b901-96344886e14d` is
the first result of `GET /search?text=Python&language=en&type=skill` under all five
accepted versions, and `GET /resource/skill?uri=…ccd0a1d9…&language=en&
selectedVersion=v1.2.1` returns `preferredLabel` as **28 languages, one label each**
— en "Python (computer programming)", cs "Python (počítačové programování)". One
URI, 28 display strings, four published versions: the label is not the identity.

The same call refutes stability of *surfaces*. That URI, fetched the same day at
`selectedVersion=v1.2.1` and with no version parameter (the default, `latest`),
returns near-disjoint English alias sets — v1.2.1: `Python 3K`, `Python` (n=2);
default: `Python3000`, `Python prog`, `Python2`, `Python 3k`, `Py3K`, `Python3`,
`Pyston` (n=7). **The default dataset is not any named version**, so an alias count
taken without `selectedVersion` cannot be reproduced: pin a mirrored taxonomy.

## The core claim, executed: an alias resolves to the concept

`GET /search?text=Py3K&language=cs&type=skill&limit=5&selectedVersion=v1.2.1`
returns `total: 1`, that result being URI `…ccd0a1d9…`, `searchHit: "Py3K"`, title in
Czech. `Py3K` is a Czech-side alternative label sharing no whole token with any
preferred label, and it lands on the same URI the English preferred label reaches
(`text=Python (computer programming)`, `language=en` — `total: 581`, rank 1
`…ccd0a1d9…`). **Confirmed**: an alias resolves to the canonical concept, not a
sibling, across a language boundary.

The 581 is a category difference, not a defect: `/search` is a ranked full-text
surface, not a normalizer. Each result carries `searchHit`, the exact matched
string — `"Py3K"` (a label) versus, for `text=Kubernetes`, a sentence naming
VMware, kvm, Xen, Docker and Kubernetes (a description). No key of a default result
declares a match *type* or a score, so that discriminator is derivable but never
declared — and deriving it is mandatory: `text=Java` returns `JavaScript` at rank 8
and `interact verbally in Javanese` at rank 10, both with `searchHit` a *label*.

## Per-language surfaces: the schema has parity, the data does not

ESCO keys `alternativeLabel` by language exactly as the technique requires; the data
does not fill it. One call, `GET /resource/concept?uris=<8 skill URIs>&language=en&
selectedVersion=v1.2.1`, over Python, Java, JavaScript, Ruby, Swift, C#, COBOL, R:

- `alternativeLabel.en`: min 1, max 6, median 2.5 (n=8).
- `alternativeLabel.cs`: min 0, max 10, median 1.0 (n=8). Four of the eight —
  Swift, COBOL, C#, R — carry **no `cs` key at all**, though all eight carry a
  localized Czech `preferredLabel`.
- **8 of 8** have *byte-identical* `alternativeLabel` sets across `cs`, `de`,
  `fr`, `es`, `pl`, `it`: one non-English set per concept, replicated into every
  non-English slot. JavaScript's Czech list is its Italian list.

Taxonomy scope, not technique gap — ESCO localizes the *concept label* and treats
aliases as a language-neutral retrieval aid — but it is the failure
`bilingual-surface-parity-and-coverage-floors` predicts: importing ESCO as surfaces
buys a Czech vocabulary with `Pyston` and no bare `Python`.

## The bare ambiguous surface

The technique says qualify both surfaces or leave the ambiguous one off both. ESCO
does neither: it qualifies the *preferred label* — `Python (computer programming)`,
`Ruby (computer programming)`, `Swift (computer programming)` — and keeps the bare
string as an `alternativeLabel` (`Python` on `…ccd0a1d9…`, `Ruby` on `…0ccdfe98…`,
`Swift` and `Java` likewise, at v1.2.1). Nor is that uniform: `GET /resource/skill?
uri=…/51586df8-1c46-4b47-8583-773cb63bf00b` returns `preferredLabel` **`R`** —
bare, identical in en, cs and de — and `text=R` returns `total: 8091`.

A retrieval vocabulary can afford this: a human picks from a ranked list. A matcher
cannot — `text=Access` returns `total: 206` with `monitor guest access` at rank 1 and
`Microsoft Access` at rank 2, and `text=SAS` returns `Sass` among five hits, so rank
1 as the resolution picks the wrong concept silently. Consumer clause: **a bare
ambiguous alias from a foreign taxonomy is a search hint, not a surface**.

## What the lint meets in a real taxonomy

The entry shape gives a term "a parent, or an explicit statement that it is a root",
singular. ESCO is a polyhierarchy: `GET /resource/skill?uri=…/04f1b938-d4d4-4cb1-
a863-982af76b9d93` (`SAS language`) returns **two** `broaderSkill` links,
`statistical analysis system software` and `computer programming`, so a
single-parent lint rejects a correct entry. **Technique gap**: the shape should be
"zero or more parents, root an explicit state", and `hierarchy-credit`'s
take-the-lower rule for two paths becomes the normal case, not a lint failure.

Scoped negative: these queries found **no** duplicate surface — one identical string
on two concepts. `Java`/`JavaScript`/`Javanese` and `SAS`/`Sass` are fuzzy *retrieval*
collisions, not duplicated labels, and this sample cannot rule duplicates out.

## Sightings

`GET /resource/skill?uri=…/21d2f96d-35f7-4e3f-9745-c533d2dd6e97` (`computer
programming`) returns 35 `narrowerSkill` and **no `broaderSkill` key** — one level
deep, so Python, COBOL and SAP R3 are mutual siblings while `R`, parented under
`statistical analysis system software`, is unrelated to Python. And `text=Terraform`
and `text=htmx` both return `total: 0`, `_embedded.results: []` — a clean empty, no
nearest-neighbour guess — while `text=Kubernetes` returns one concept matched only
on its description, unmarked as such.

## Verdicts

- **Confirmed.** One opaque identity per capability, stable across 28 languages and
  every accepted version; an alias resolves to it across a language boundary.
- **Refuted as practiced.** The ambiguous-surface rule: ESCO qualifies the preferred
  label and keeps the bare surface as an alias, and `R` is bare throughout. The rule
  holds for a matcher, and gains a consumer clause.
- **Sharpened.** Surfaces are version-scoped — one URI, near-disjoint English alias
  sets under `v1.2.1` and under the API default.
- **Technique gap.** Single-parent entry shape versus a real polyhierarchy; and 8/8
  concepts share one alias set across six non-English languages, 4/8 carry none.
