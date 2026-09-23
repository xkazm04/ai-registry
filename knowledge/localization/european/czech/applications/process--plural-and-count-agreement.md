---
layer: application
type: application
subject: czech
technique: plural-and-count-agreement
stack: process
status: forged
verified_on: 2026-08-24
---

# Process · Czech plural agreement across two real catalogs

Two products in the same fleet hit the Czech count system with opposite
tooling — one with full ICU plural support, one with a two-slot system — and
between them exercised nearly every failure mode this technique names.
Verified against both working trees on 2026-08-24.

## kp — full ICU, and the defects that survive it (~4 800-key catalog)

`kp/docs/i18n/style-cs.md` states the rule (one/few/other
ICU blocks, `many` optional for integer counts) and the escape hatch
(count-invariant neuter verb — "postoupilo {n}" — when the number renders in
a separate badge). The 2026-08 review wave (recorded in
`kp/docs/i18n/review-cs.md`) fixed ~55 keys of ICU
number agreement, the largest theme of the whole 455-key wave, in exactly
the two shapes this technique predicts:

- flat genitive plurals against live counts ("1 aktivních", "3 čeká",
  "4 týdnů") — CS-NUM;
- verbs and adjectives frozen *outside* a plural block while the noun
  declined inside it — CS-AGREE, e.g. `jobs.rediscoveryFeed.swept`, where
  frozen "publikovaných" beside a correctly declining noun rendered
  "1 publikovaných role"; the fix moved the adjective into each branch.
  `pipeline.tab.degradedBannerBody` had reused the *few* form for *other*
  ("5 je nespárovatelné útržky"); `devcase.integrity.backdatedTitle` was the
  one plural whose branches differed by count but had no Czech `few`, so
  2–4 fell through to the genitive-plural branch.

The critical-severity incident is the format-contract one: on the public
market page, call sites (`MarketPulseApp.tsx:110-111`, `parts.tsx:232,303`)
passed `n` as an already-`fmtInt()`-formatted string (NBSP thousands
separator) into `{n, plural, …}`, which evaluated `"38 553" - 0 = NaN` — cs
rendered literally **"NaN volných míst"** on the hero. The worked-around
state (count-invariant genitive plural, correct for every value the data
snapshot actually carries, wrong for a future 1–4) and the real fix (pass
the raw number, restore the branches) are both recorded in `review-cs.md`
under the `jobMarket` section — a textbook source-defect register entry.

## personas — a two-slot system and the settled workarounds (~19k-key catalog)

`personas/docs/i18n/style-cs.md` (Pitfall 1) documents
the constrained case: the i18n system exposes only `_one`/`_other` for cs —
no `_few`. The guide pins exactly the two house patterns this technique
teaches, and forbids inventing a third:

- genitive-plural `_other` for descriptive strings ("{count} nových zpráv",
  "{count} agentů zkontrolováno") — acceptable down to count 2;
- the parenthetical shorthand for tight confirm labels where 2–4 is common
  ("Smazat {count} agent(y/ů)");

plus the explicit ban on the nominative-plural-only `_other` ("agenti",
"návrhy") — flatly wrong at 5+. It also carries the gender-adjacent
agreement pitfall this technique shares a boundary with: a template like
"{name} je nastaven" breaking when a feminine persona name fills the slot.

## Second tree: personas-web — two slots picked by `n === 1`, and no recorded workaround

`personas-web` on `chore/remove-react-virtuoso` at `35d557b` (2026-09-14) is a third
shape: no plural primitive at all. Everything below was read from catalogs and call
sites that day; nothing was rendered.

**The mechanism.** English carries four `xOne`/`xOther` pairs:
`roadmapSection.progress.toGoOne/Other`, `roadmapSection.detail.localeOne/Other`, and
`featureVoting.summary.commentOne/Other` and `boostOne/Other`
(`src/i18n/en.ts:2996-2997`, `:3033-3034`, `:3083-3086`). Each pair is chosen with
`=== 1` and filled with `String.replace` (`RoadmapProgress.tsx:37`,
`roadmap/areas.ts:109`, `FeatureVotingSummary.tsx:57` and `:61`). Seven more count
sites pair singular and plural keys without that naming: `AgentDetail.tsx:146` and
`:150`, `MemoryActionsPanel.tsx:102`, `EventsBulkRetryBar.tsx:28`,
`EventsFiltersToolbar.tsx:76`, `SubscriptionCard.tsx:81` and
`app/dashboard/agents/page.tsx:120`. One more site hardcodes English
(`GeologicalLayer.tsx:61`, `"memory" : "memories"`). That makes eleven two-slot
selectors in the catalog, and for Czech every one of them is a slot short.

**The undecided state, on record.** `docs/translation-handoff.md:221-229` (`edc2804`,
2026-04-19) names the problem: "Some languages need different forms for 1 vs 2-4 vs
5+ (ru, cs)". It offers two options: accept "slight awkwardness", or add a helper whose
keys become `{one: string; few: string; many: string}`. It records no choice, and five
months later neither option exists. The proposed schema would have been wrong for
Czech on arrival. It drops `other`, which covers 0 and every count from 5 up and is the
most frequent branch. It adds `many`, which in Czech is selected only by a count
rendered with a fraction digit.

**What the Czech catalog did without a decision** (`src/i18n/cs.ts` at `35d557b`):

| outcome | pairs | example |
|---|---|---|
| genitive-plural `other` (workaround 1) | 4: `toGo`, `locale`, `comment`, `boost` (`:1384-1385`, `:1436-1437`, `:1486-1489`) | *{n} jazyků*: acceptable at 5, wrong at 2–4 |
| nominative-plural `other` (the banned move) | 4: `subscription(s)` *odběry*, `trigger(s)` *triggery*, `suggestion(s)` *návrhy*, `match(es)` *shody* | wrong at every count from 5 |
| a form no count selects | 1: `agentsDeployed` *nasazeních agentů* | locative adjective beside a genitive-plural noun |
| unreadable | 2: `result(s)` *v?sledek* / *v?sledk?* and `failedEvent(s)Selected` (`:1205-1206`, `:1214`) | diacritics replaced by a literal ASCII `?` (byte 0x3F) |
| parenthetical shorthand (workaround 2) | 0 | — |

The unreadable pair is not a plural defect, but it cannot be audited as one either,
because the forms are gone from the file. 92 Czech values carry a `?` inside or at the
end of a word where English has none. `toGoOther` also shows what workaround 1 gives
up: *zbývá {count} fází* is right at 5 and wrong at 3 in both its verb and its noun
(*zbývají 3 fáze*).

Russian in the same tree shows the same split: *предложений* (genitive plural) beside
*подписки* (nominative plural). It also makes the one move Czech did not. `toGoOther`
is recast count-invariant as *Осталось этапов: {count}*, the escape hatch in its
label-and-number form. The mix is therefore not one translator's habit. It is what a
two-slot system produces when nobody writes down which workaround the catalog uses.

**Not shipping, still owed.** Language switching is off unless
`NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true` (`src/stores/i18nStore.ts:33-42`), so none
of this renders to users today. The same-day guide template amendment (`b3fe23f`)
states the `xOne`/`xOther` limitation, and declares it out of scope for guide prose.
Before the switch flips, the catalog owes the one decision this technique asks for:
- **Record a workaround per surface class**: genitive-plural `other` or the
  parenthetical shorthand.
- **Recast the four nominative-plural `other` values.**
- **Re-translate the two lossy pairs.**

## What generalized upward

The upward lessons this subject's technique absorbed from these two repos:
the count-invariant escape hatch as a *named* pattern rather than an ad-hoc
dodge; CS-AGREE as a separate anchor from CS-NUM (branch-content checks
systematically missed the shared tail until it had its own ID); the
render-at-1/3/5 audit procedure; and the rule that a two-slot system gets
exactly two recorded workarounds, decided per surface class, never per
translator.
