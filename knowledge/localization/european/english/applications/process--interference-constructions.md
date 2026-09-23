---
layer: application
type: application
subject: english
technique: interference-constructions
stack: process
status: forged
verified_on: 2026-09-14
---

# Process · Interference in two Czech-derived English catalogs (systedo-case, politicas)

Two products whose English came out of Czech, read in their working trees on 2026-09-14
(uncommitted state included). One ran an anchored English construction file inside its review
loop and recorded what the first wave found. The other ships an English column that follows its
Czech column clause by clause. Read together, they show what the interference rules catch,
what a single favourite rule absorbs that it should not, and why every audit starts by counting.

## systedo-case: an anchored file, and the rule that earned "validated"

`systedo-case/docs/i18n/constructions-en.md` states its direction first
(lines 3-6): "`en` is this repo's **derived** locale … this file governs writing *English out of
Czech*". Its sibling `style-en.md` records that the direction later flipped (line 3: "`en` is
the **source** locale (see `contract.md` — reversed 2026-08-05)") and draws the right conclusion
at lines 5-8: the existing strings "were *derived from Czech*, so where this guide and a shipped
string disagree, the guide wins and the string is a re-authoring candidate." A catalog keeps its
Czech shapes after its source of truth changes; the interference rules apply to the strings'
history, not to the current contract.

The file's reason to exist is the anchor law, stated at lines 13-16: "Because `/i18n-translate`
Pass B **requires every finding to cite an anchor**, a repo with no constructions file reports
those strings **clean**."

Lines 86-104 record the first fan-out wave: "changed 24 `en` values across 65 files. **A quarter
of them were this rule** (6 of the platform slice's 16), making it the dominant source-side
defect". The pairs shown, with their keys:

| Key | Before | After | Rule in this subject |
|---|---|---|---|
| `SpeedLead.timedOut` | Model timed out | The model timed out | EN-ARTICLE |
| `SpeedLead.generatingStatus` | Generating on-brand reply with model… | Generating an on-brand reply with the model… | EN-ARTICLE |
| `MonthlyReport.note` | (the same you see in the dashboard) | (the same data you see in the dashboard) | none: an elided head noun |
| `profit.marginAriaLabel` | Margin {channel} | Margin for {channel} | EN-PREP |
| `profit.poasSub` | Profit per ad currency | Profit per unit of ad spend | EN-IDIOM-CALQUE |

Two teaching points come out of the table. First, the file says six pairs (line 22-23: "now
carrying six real pairs") but shows five, and only two of the five are article fixes in the
strict sense. The rest are a dropped head noun (Czech lets *stejná* stand alone), a missing
preposition where Czech uses a bare genitive, and a lexical calque that the file itself glosses
at lines 106-108 as "a literal de-korunization of cs `zisk na korunu reklamy`. It is not English
at all, and no glossary or style guide would flag it." A rule that becomes the review's favourite
bucket absorbs its neighbours; a finer anchor set points each fix at its cause, which is what lets
the next reviewer find the same cause elsewhere. Second, `SpeedLead.timedOut` sits on the
boundary of EN-ARTICLE's telegraphic exception: it is a status line, but a full-sentence one,
and the product correctly gave it the article.

## systedo-case: the spelling count that overruled two agents

Lines 26-48 are the counted table behind EN-SPELLING. "A measurement over the 3 286 `en` values
says otherwise — it is genuinely mixed": `analys*` 19 British against 4 American, `catalogue` 0
against `catalog` 13, `-ised/-isation` 3 against `-ized/-ization` 5, `centre` 0 against `center` 2.
Two agents had each reported a consistent British column; line 47-48 names the failure: "an agent
that greps a handful of files and reports a house convention has usually found its own sample,
not the catalog." The ruling (lines 44-46) is to park the decision and "match the immediate
neighbours of the string you are editing", not to sweep from a sample: EN-VARIANT's order
(declare, count, sweep) executed in miniature, with the declaration still owed.

A second-order lesson sits in `style-en.md` lines 31-34: a quoted example "carried an em dash and
the British `catalogue`, both of which the live string has since lost … **A guide that quotes the
catalog verbatim goes stale when the catalog moves**".

## politicas: an English column that follows the Czech clause by clause

`politicas/messages/en.json` and `cs.json` hold the same keys on the same
lines. I found no localization contract naming the source locale; the derivation is read from
the shape, because the English reproduces the Czech clause order and dash positions exactly. The
column is article-correct throughout the strings below: the first-order rules were solved. What
remains are the second-order shapes that pass both a grammar checker and an article-focused
review.

**`landing.lead`, line 456** (the home page lead).
cs: "Hlasování ve sněmovně, veřejné smlouvy firem, které poslanci vlastní nebo řídí, a novely
zákonů — spojené do jednoho indexu přispění poslanců 10. období."
en: "Chamber votes, the public contracts of firms MPs own or run, and amendments to laws — fused
into one contribution index of the MPs of the 10th term."
The Czech genitive chain *indexu přispění poslanců 10. období* arrives as "index of the MPs of the
10th term" (EN-NOUN-PILE), and the Czech verbless sentence (list, dash, participle) arrives
without a finite verb (EN-ORDER: English wants a subject and a verb in a lead). A rewrite under
the rules: *The contribution index combines Chamber votes, public contracts of firms that MPs own
or run, and amendments to laws into one score for every MP in the 10th term.* The sentence that
follows, "Not an opinion: an index with published weights…", is clean: it passes
EN-FALSE-CONTRAST's exception, because readers of a political ranking do suspect opinion.

**`landing.rankingIntro`, line 464.**
cs: "Vyberte řádek — rozklad i živý vzorek nahoře se přepnou na vybraného poslance."
en: "Pick a row — the breakdown and the live specimen above switch to the selected MP."
*Vzorek* means a sample or preview; *specimen* is its dictionary sense for laboratories and
typefaces (EN-COLLOCATION, and a lexicon row worth adding beside EN-FALSE-FRIEND even though
the words are not cognates). The Czech reflexive *se přepnou* was rendered correctly as a plain
verb, so EN-REFLEXIVE holds. Rewrite: *Select a row to switch the breakdown and live preview
above to that MP.*

**`landing.joinKeyDesc`, line 477.**
cs: "8 číslic, na kterých graf drží firmu a její smlouvy z registru smluv. Dotace a dary nese firma
jako součet z Hlídače, ne jako jednotlivé záznamy."
en: "8 digits on which the graph holds a firm and its contracts from the contracts register.
Subsidies and donations ride on the firm as a total from Hlídač státu, not as individual
records."
The Czech relative clause and its figurative *drží* (holds) arrive intact as "on which the graph
holds a firm", and *nese* (carries) is swapped for a different figure, "ride on"
(EN-IDIOM-CALQUE, twice); the description opens on a numeral (EN-NUMERAL). The object-first Czech
*Dotace a dary nese firma* was correctly reversed into an English subject, so EN-ORDER held
where the stakes were highest. Rewrite: *An eight-digit company ID that links each firm to its
contracts in the contracts register. Subsidies and donations are attached to the firm as totals
from Hlídač státu, not as individual records.*

## What the two catalogs teach together

A first review wave on derived English finds articles, because articles are the densest
first-order defect. Once they are fixed, the remaining interference is structural and lexical:
noun chains, verbless sentences, figurative verbs carried over from the source, dash positions
copied from it. No grammar tool flags those. Each needs its own anchor, and each fix belongs to
the source owner, because every locale translated from this English inherits it.
