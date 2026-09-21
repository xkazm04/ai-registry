---
layer: application
type: application
subject: copy-quality-gates
technique: copy-contract-before-drafting
stack: process
status: forged
verified_on: 2026-09-14
---

# An acceptance list is not a termbase: eight tier names under one copy contract (personas-web)

`personas-web` on `chore/remove-react-virtuoso` at `35d557b` (2026-09-14). The copy
contract is `docs/i18n/copy-contract.json`, adopted in `0b197f1` the same day. Its
checker lives under `.claude/skills/native-copy/`, a directory link, so git tracks
nothing beneath it; checker line numbers are from the working copy. Catalog line
numbers are `src/i18n/en.ts` at `35d557b`.

## The contract against the technique's list

- **Mechanics table: present, and counted before it was declared.** The `_notes`
  (`:3-9`) record both forms first:
  - spelling: US 255 against UK 5
  - dashes: em 1,098 against en 13
  - double quotes: straight 448 against curly 12
  - ellipsis: three dots 51 against the single character 15
  - case: Title Case in 235 of 277 heading-class strings, 231 of which are connector
    use-case titles

  That last count is why sentence case was declared with a carve-out instead of
  sweeping 231 titles. Step 1 done as written.
- **Register per surface: absent.**
- **Termbase with forbidden variants: absent.** The contract has
  `"terms": { "accept": [33 strings], "reject": [] }` (`:25-28`).
- **Exemplars: absent.** **Rule dispositions:** `"rules": {}` (`:29`), defaults
  throughout. **Money-page list, briefs, fact sheets: absent.**

## What `terms.accept` does

The checker blanks accepted terms before pattern rules run (`maskText`,
`scripts/lib/rules.mjs:37-48`). It removes them before judging case (`caseShape`,
`:125-128`). A comment in the spelling rule calls the list "the explicit cure" for
proper names (`:204`).

That makes it an exemption list. It answers *may this string appear without a
finding*. A termbase answers *which string must appear for this concept, and which
must not*. The contract has only the first, filed under the name `terms`, which
invites reading it as the second.

## Three conflicts no exemption can see

**Tier names.** The catalog and its pipeline use eight names across three sets and two
orphans, for a pricing section with three cards:
- **The cards:** *Local, Cloud, Enterprise* (`:1825-1827`).
- **Features on those cards** point to tiers that are not cards: *Everything in Free*
  (`:1845`) and *Everything in Pro* (`:1850`).
- **The FAQ:** "Cloud plans (Starter, Pro, Team)" (`:2017`) and "Pro and Team plans
  include burst auto-scaling" (`:2029`).
- **The guide translation template at `35d557b`:** "Tier names: Starter, Team,
  Builder." (`scripts/i18n/translate-guide-subagent-prompt.md:152`).

None of the eight is in `terms.accept`, and all eight pass every check. The measured
cost is that the missing ruling reached a translation pipeline as an instruction:
13 subagents were told to preserve a vocabulary the catalog does not use.

What the tiers *are* is a fact, not a language choice. Under "when a claim is not on
the fact sheet, the writer asks", the correct move is the one the same-day apply pass
made (`b3fe23f`). It recorded all three sets in `docs/i18n/glossary.md` as UNRESOLVED
for the owner and chose none. That is step 2, "group candidate renderings", carried up
to the ruling, which is not the writer's to make.

**Claude CLI and Claude Code.**
- `en.ts` says *Claude CLI* on five lines (`:2008`, `:2009`, `:2025`, and the labels
  `connectCli` `:2040` and `requiresCli` `:2043`).
- It says *Claude Code* on one (`:3280`), which in the same sentence tells the reader
  to "connect the CLI".
- Across English source outside the locale catalogs, the split is **9 lines against
  13**.

`terms.accept` lists *Claude Code* and *Claude Desktop* (`:26`) and not *Claude CLI*,
so the list looks like a ruling for one side. It is not one. Nothing forbids *Claude
CLI*, and it draws no finding.

**The vault.** *Credential Vault* is accepted as a product name (`:26`). English source
(`en.ts`, `src/lib/seo.ts`, `src/data/blog.ts`, `src/data/tour.ts`, guide content)
spreads the concept across three renderings:
- *Credential Vault* on 4 lines
- *credential vault* on 6 lines, including `SITE_DESCRIPTION` (`seo.ts:9`)
- *encrypted vault* on 5 lines

The exemption covers the capitalized form wherever it appears and is silent on the
other two. A termbase row would name one rendering and two forbidden variants, and the
checker could then find them.

## The conflict that is not one: 40+ and 25+

`src/data/blog.ts:205` heads "40+ Pre-Built Connectors", and `:207` names fifteen
services "and 25+ more". Fifteen and 25+ make 40+: consistent.

The hazard around this numeral is different. *40+* counts integrations in
`seo.ts:9`, `homeJsonLd.ts:33`, `tour.ts:43-45`, `security.ts:64` and
`changelog.ts:186`, and it counts persona templates at
`src/components/sections/vision-grid/data.ts:49`. The only recorded ruling about the
number is `src/data/roadmap-phases.ts:40`: "a deliberate floor, not a count". Whether
40+ is true belongs on a fact sheet, not in a termbase.

## What the tree owes

1. **Split `terms` in two.** Keep `accept` for checker exemptions. Add a termbase of
   concept, rendering and forbidden variants, seeded from the renderings counted
   above, which is exactly the catalog drift step 2 starts from.
2. **Operator rulings on tier names and on CLI against Code.** Each forbidden variant
   becomes checkable the moment its row is written.
3. **A pricing and integrations fact sheet before money-page copy is redrafted.** The
   claims beside the tier names ("No tiers", `:1738`; "Zero telemetry", `:1860`) are
   facts to verify, and no contract row can settle them.
