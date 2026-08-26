---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: canonical-fallback-serving
status: forged
laws: [coverage-is-counted-not-claimed, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [deciding what to serve when a translation is not yet published, wiring a language switcher to a partially translated corpus, launching a new language before its translation is complete, keeping the source-language reading path unchanged after adding i18n, a switcher offers a language the store cannot deliver]
---

# Canonical-fallback serving

The serving side of a translation pipeline has one contract: a reader who
selects a language gets a complete, coherent unit every time — never a blank,
never an error, never a stale mix inside one unit. The pipeline that fills
the store is incremental and perpetually partial; the serving layer is what
makes partial coverage honest instead of broken. The mechanism is per-unit
fallback: the reader's selected language sets a parameter, the fetch tries
the derived store's translated unit for that language, and when that unit is
not yet published it serves the **canonical source-locale unit** instead —
whole, current, correct, per
[the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth).

## Fall back per unit, and only per whole units

The fallback granularity is the unit the reader consumes — one lesson, one
page, one document — not the site and not the fragment.

- Site-level fallback ("this language is only 60% done, serve everything in
  the source locale") throws away published work and makes the language
  invisible until an arbitrary threshold.
- Fragment-level mixing (translated headings over source-locale body, or a
  translated unit patched with newer source-locale paragraphs) produces the
  stale mix the contract forbids: the reader cannot tell where the
  translation ends and cannot trust either half.

When the store's copy of a unit exists but predates a canonical revision
that changed it, the decision rule is the same: a whole coherent unit beats a
fresher mix, so serve the translated unit until the pipeline republishes it —
or, where staleness is tracked per unit, fall back to the whole canonical
unit. Never splice.

## The canonical path stays byte-identical

Adding languages must cost the source-locale reader nothing. The test is
exact: the canonical-language serving path — URL shape, fetch target,
returned bytes — is identical to the pre-i18n path. Achieve this by making
translation purely additive: translated units live in a derived store (a
derived branch, a parallel tree) that the canonical path never consults, and
the language parameter's absence or canonical value short-circuits straight
to the original fetch. The failure mode this prevents is the i18n tax:
routing every reader through a lookup-then-fallback indirection so the
majority locale inherits the new system's latency, cache misses, and outage
surface. When the derived store is down, source-locale readers must not
notice; when it is empty, the site is exactly what it was before i18n.

## Offer only what you serve: the switcher is derived, not aspirational

The language switcher is generated from a single language registry — the same
registry the pipeline consumes — so the offered-language set is derived from
the served-language set. The UI can never promise a language the store lacks,
because the list of promises and the list of pipeline targets are one
artifact. This is
[coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed)
applied to the switcher: an offered language is a claim, and the only
acceptable backing for the claim is the pipeline actually serving it. The
recurring defect is a hand-maintained language menu drifting from the
pipeline config — a listed language whose every unit falls back is
technically "served" by the fallback but is a false promise, and a
pipeline-added language missing from the menu is published work no reader can
reach. One registry, two consumers (pipeline matrix, switcher), zero drift.

The registry is also the honesty boundary in the other direction: adding a
language is one registry entry, and because every unpublished unit falls back
per unit, the language is **servable from day one** — a reader who selects it
sees translated units where they exist and canonical units where they do not,
with coverage visibly growing as shards publish. Partial coverage needs no
launch gate, no "coming soon" page, and no threshold debate; the fallback
makes 5% coverage as safe to offer as 95%.

## Failure modes

- **Blank or error on miss**: a missing translation surfacing as a 404 or an
  empty pane converts an incomplete pipeline into a broken site, and makes
  every new language a launch risk instead of a registry entry.
- **The i18n tax**: the canonical path rerouted through the translation
  store's lookup, so the source-locale majority pays latency and shares the
  derived store's failures. Diff the canonical path's bytes and hops against
  pre-i18n; any difference is the defect.
- **Aspirational switcher**: menu maintained by hand, drifting from the
  pipeline registry in either direction — false promises or unreachable
  published work.
- **Fragment splicing**: mixing locales inside one unit to chase freshness;
  the reader gets a document no one wrote.
- **Fallback hiding the count**: because every miss falls back silently, key
  or unit parity proves nothing about translatedness — coverage numbers must
  come from counting published translated units in the store, never from the
  absence of serving errors.
