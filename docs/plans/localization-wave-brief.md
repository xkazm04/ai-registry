# Localization bundle — language-subject wave brief (2026-08-24)

You are a subject-forger for ONE language subject of the `localization` bundle in this
registry (`C:\Users\kazda\kiro\ai-registry`). Your dispatch prompt names your language,
its locale code(s), its category, and your technique slugs. This file is the wave's
shared contract; [`docs/forge-brief.md`](../forge-brief.md) is the general forge
contract and applies except where this brief narrows it; `docs/rkb-profile.md` is the
format spec. Read the bundle's `knowledge/localization/index.md` and `_laws.md` before
writing anything, and read ONE existing subject as a quality reference
(`knowledge/recruiting/assessment/structured-interview-scorecards/` is a good one).

## What a language subject IS

The transplantable mastery of localizing a product INTO your language — everything
that is true for ANY product shipping that language, written so that both a human
localizer and a review agent can act on it. The reader profile that matters most: an
agent auditing or translating catalog strings in bulk, which needs **citable anchors**
— stable rule identifiers it can put in a typed error record.

The boundary you must hold: product voice, termbases, exemplar pairs, format
contracts, and house rulings that overrule an authority are the CONSUMING REPO's
artifacts. Never absorb them. When a source repo's ruling illustrates a general
mechanism (e.g. "the house may overrule the authority when the ruling is recorded"),
teach the mechanism; leave the specific ruling downstairs.

## Two-phase order (the whole point)

1. **Expert draft FIRST.** You are a principal localizer for your language. Draft the
   golden path and techniques from what you know to be true of the language. Before
   writing, do 2–4 targeted web searches to harden currency: your language's published
   localization style authority (e.g. a major OS vendor's public style guide for the
   language), its CLDR plural rules, and any UI-convention reference you need to check
   rather than remember. Fold findings in as craft with the authority named as
   provenance — an authority citation is what turns a rule from taste into an anchor.
2. **Reconcile against the fleet SECOND.** Your dispatch prompt lists repo anchors:
   - `C:\Users\kazda\kiro\personas\docs\i18n\style-<locale>.md` — a real, worked
     per-locale style guide for a 19k-key consumer product in 14 locales. Mine it for
     upward lessons (rules a real catalog needed that your draft lacks) and for
     incident-shaped teaching. Its product-specific rows stay out.
   - For cs, de, fr additionally the kp repo (`C:\Users\kazda\kiro\kp\docs\i18n\`):
     `style-<locale>.md`, `constructions-<locale>.md`, `review-<locale>.md`. The
     constructions files are the crown jewels: anchored rule sets with IDs
     (`CS-NOM`, `DE-FORMAL`, `FR-APOS`…), provenance from a published style
     authority, and settled exceptions found by over-applying rules and reverting.
     **Preserve those rule IDs verbatim** — kp's review records already cite them,
     and the whole point of migrating them here is that every future project cites
     the same anchors. Generalize the prose; strip the product examples or replace
     them with neutral ones; keep each rule's trigger/rule/source/exception shape.

## Rule identifiers

Every construction- or convention-rule you write gets a stable ID: `<CODE>-<NAME>`
with your language's two-letter code uppercased (`JA-HONORIFIC`, `AR-BIDI`,
`ES-USTED`…). Existing kp IDs for cs/de/fr are already minted — keep them, even where
you move a rule between techniques. IDs are append-only anchors: a future project's
audit cites `CS-NOM` and must keep resolving to the same rule. Put each rule under an
`## <ID> · <short name>` heading inside the owning technique so the anchor is
findable by grep.

## Structure per subject

- `<language>.md` — golden path, 120–220 lines. What localizing into this language
  demands; the register system and how a B2B product versus a consumer product
  chooses within it; what makes a translated string smell translated in THIS
  language; the load-bearing distinctions; how the language's plural/counting system
  relates to CLDR categories; script and direction facts a layout engineer must know.
- `techniques/<slug>.md` — one per assigned slug, 60–150 lines each, carrying the
  anchored rules. Cite `_laws.md` anchors in `laws:` only where genuinely
  load-bearing.
- `applications/process--<technique>.md` — 1–2 per subject, `stack: process`,
  `verified_on: 2026-08-24` (you are verifying today, against real trees), citing
  the personas and (where applicable) kp artifacts freely: real file paths, real
  check scripts, real incident records. This is where product names and catalog
  paths are ALLOWED and useful.

Frontmatter exactly per `docs/forge-brief.md`. Category depth: your subject sits at
`knowledge/localization/<category>/<subject>/`, so `_laws.md` is `../../_laws.md`
from the golden path and `../../../_laws.md` from inside `techniques/`.

## Purity (the gate will fail you)

Upper two layers: no catalog paths, no i18n library / TMS / MT product names, no
fleet product names (the consuming apps' names included — one of them is also an
ordinary word in several languages; keep it out regardless). Named standards and
public style authorities are fine and encouraged: CLDR, MQM, Unicode, ICU-as-standard
("the CLDR plural categories", "a message-format's plural syntax"), a vendor's
published localization style guide cited as a rule's source. Keep concrete message
syntax examples generic where possible; put stack-specific syntax in applications.

## Quality bar

Match the density of the existing bundles: decision rules stated as rules ("when X,
do Y, because Z"), exceptions that were found by reverting an over-applied rule are
told as such, numbers only where a real count backs them. A subject that reads like a
Wikipedia article about the language has failed — this is localization craft, not
linguistics. When done run `node scripts/check-bundles.mjs` from the registry root
and fix what it reports for YOUR subject (ignore other subjects' mid-forge failures,
including `taxonomy.json assigns ... which has no folder` for subjects not yours).

Final report, 5–10 lines: files written, technique count, rule-ID count (minted vs
preserved), which claims were upward lessons from the fleet's style guides, gate
status for your subject.
