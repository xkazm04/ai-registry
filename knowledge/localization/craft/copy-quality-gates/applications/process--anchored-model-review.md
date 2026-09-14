---
layer: application
type: application
subject: copy-quality-gates
technique: anchored-model-review
stack: process
status: forged
verified_on: 2026-09-14
---

# Three fresh reviewers on one product's money pages: what the veto caught, what 2-of-3 kept, and what "nothing new" measures (personas-web)

`personas-web` on `chore/remove-react-virtuoso`. The review ran against the tree at `7c05f33`, and
its repair is commit `4445215` (2026-09-14). Line numbers are `src/i18n/en.ts` and
`src/data/blog.ts` at `4445215`. The instrument is native-copy 1.2.0, whose review mode implements
this technique. That means `copy-check.mjs`, its `--veto` layer (`scripts/lib/veto.mjs`) and
`references/review-checklist.md`. The contract is `docs/i18n/copy-contract.json`. It declares US
spelling, an em dash ban, straight quotes, dot ellipsis and sentence case. Blog titles and connector
use-case titles are the declared Title Case carve-outs.

The whole procedure ran once, end to end, and every step was counted. This is the first run of the
technique on a real tree, so the numbers matter more than the verdicts.

## The run in numbers

| Step | Measured |
| --- | --- |
| Mechanical pass (whole catalog) | `checked 3144 strings (2382 fragments) in 38 files from 6 sources; 0 unreadable; errors 276 (new 0), warnings 338`. 614 findings: typography 568, usage 29, register 3, locale-convention 5, whitespace 5, mistranslation 2, style 1, grammar 1. One was new (an EN-CLICHE warning on unchanged guide copy); 613 were baselined |
| Mechanical findings inside the review scope | 25 (EN-DASH 17 errors, EN-AMPERSAND 3, EN-CASE 3, EN-LATIN 2), handed to the reviewers as "already decided" |
| Units in scope | 165 units, 1,784 words: `hero`, `compareSection`, `pricing`, `faqSection`, `downloadSection`, `footer` and the four `featurePages` entries in `en.ts` (155); `SITE_DESCRIPTION` in `src/lib/seo.ts` (1); `BLOG_POSTS[0]`, `[1]` and `[3]` title, description and body (9). 29 surface classes |
| Checklist | 72 binary questions over 65 rule IDs, in 7 sets selected by surface class; 12,556 bytes. The contract excerpt given beside it: 1,832 bytes |
| Raw findings | reviewer 1: 35, reviewer 2: 28, reviewer 3: 31 (94) |
| Suppressed by the veto | 4: V-SYNONYM-SWAP 2, V-SHAPE 2. Every other veto (unknown rule, authorship, not verbatim, ambiguous span, skeleton, accepted term, rule guard) fired **0** times |
| Kept after the veto | 90, in 41 clusters (same key, same rule, overlapping span) |
| Kept at 2 of 3 | **28** clusters. 21 were reported by all three (75% of kept). 13 clusters (31.7%; 14.4% of the 90 findings) came from one reviewer only |
| Split | 11 language defects repaired (1 major, 10 minor) in 10 units, plus the 8 em dashes those strings held; 17 agreed clusters escalated to the owner |
| After the repair | `errors 270 (new 0), warnings 338`; baseline 601 to 596 fingerprints |
| Idempotence re-review | one fresh reviewer, the 10 repaired units: 8 findings, **0** on a span the repair wrote, **0** flip-backs |

Each reviewer ran as a fresh subagent. Its inputs were three files: the units with key, file, line
and surface class, the contract excerpt, and the checklist. Its only output was a JSON array. Each
reviewer took about 83k to 91k tokens and 4 to 6 minutes; the re-reviewer took 57k and 2 minutes.

## What the veto actually caught

With a tight prompt, none of the failure shapes the veto exists for appeared. No reviewer cited an
unknown ID, alleged authorship, quoted a span that was not verbatim, or quoted an ambiguous span.
The checklist named every ID and demanded a unique verbatim span, and the reviewers complied. **All
four suppressions were instrument defects, and two of them hid real agreed findings.**

- **V-SHAPE ×2: a unit with no key.** `SITE_DESCRIPTION` is an exported constant. The extractor
  gives it the key `""`, and `--strings` prints that as `-`. The veto then cannot accept a finding
  on it under either form: `""` fails V-SHAPE, and `-` fails V-UNKNOWN-UNIT. The units file for the
  reviewers repeated the empty key, and reviewers 1 and 3 copied it. Both flagged "40+
  integrations" (EN-ONE-TERM, against "Connectors" elsewhere): **an agreed finding on the meta
  description, dropped as malformed.** It is the site-wide description metadata, the string most
  likely to be quoted under the site's name in a search result. Rescuing the finding needed the lib's `applyVeto` imported with
  a resolver mapping the key.
- **V-SYNONYM-SWAP ×2: a word the fix kept is treated as a swap.** The span was "just a complete
  agent platform" (`compareSection.description`, `en.ts:1738`). The fix, "just an agent platform",
  removes "complete" and leaves "just" alone. "just" sits in the veto's `simply/just/easily` group,
  so it counts as flagged in the span and as swapped in the fix. The rule's own intent is a
  neighbour from the same group replacing the flagged word. A word present in both span and fix
  is not a swap, and the veto has no way to tell. **The two reports would have formed a 2-of-3
  cluster.**

The lesson for the technique's "each veto rule is born from a recorded rejection": both rejections
here are the veto's own. The first false positives of a new veto layer are false vetoes. Read
`suppressed` finding by finding, not only its counts, until the layer has a record.

## What 2-of-3 did and did not merge

Agreement was high where a rule has one trigger and one span. Every mechanical-looking judgment
reached 3 of 3: EN-RANGE on "1–5", EN-COMPOUND on "per-agent", EN-REDUNDANCY on "all caps
entirely". So did every tier-name EN-ONE-TERM.

It broke in three recognizable shapes:
- **One defect, two keys.** The hero headline renders `headingLine1` and `headingLine2` as one
  line (`en.ts:1862-1863`). Reviewer 1 filed EN-TAGLINE on line 1; reviewers 2 and 3 filed it on
  line 2. The cluster survived only because two chose the same key.
- **One span, two rules.** "bank-grade" (`en.ts:3176`) came as EN-CLICHE twice and EN-PUFFERY
  once. Matching on rule identity is exact; matching the same span under any rule gave 38 clusters
  instead of 41, with the same 28 agreed.
- **A page-level rule judged per unit.** EN-STACCATO allows one fragment run per page. The home
  page has four: `hero.descriptionBold`, `hero.trustLine`, the identical
  `downloadSection.noSignupLine`, and `footer.slogan`. Which run counts as "the second" depends
  on reading order. Reviewer 1 flagged trust line and download line; reviewer 2, download line
  and bold description; reviewer 3, all three. The agreed set was therefore an artifact of order,
  and every proposed fix differed. A density rule needs one finding per page, not per unit.

Single-reviewer findings were not all noise. The re-reviewer independently raised two of the 13
singles again ("OpenAI" against "GPT"; the "whenever someone notices" baseline).

## Repair or escalate: the split that decided most of the work

**Of 28 agreed findings, 17 (61%) could not be repaired by a language edit.** Ten carried
`fix: null`, as the reviewers were told to return when a fix needs a fact: every tier name, the
"Go Cloud" button on a tier marked Coming Soon, "Focused on users", the hero tagline, "In our
testing", "by 94%" and "No orchestration markup". Seven had a fix but were escalated by rule:
- **EN-ONE-TERM (2):** an EN-ONE-TERM fix is a termbase ruling, and this tree has no termbase.
  This covers "Orchestration" as the title of the `triggers` card (authored that way in
  `89d52e1`) and "integrations" against "connectors".
- **The page-level fragment runs (3).**
- **The "Intelligent" puffery (1):** it sits in a hero headline whose tagline finding needs a
  new line.
- **"bank-grade" (1):** it is part of a claim contradiction.

The 11 repairs (`4445215`):
- `compareSection.offerBody`: "optional, not required"
- `footer.motto`: "so you can focus on what matters most"
- `hero.downloadCta`: bare "Download" becomes "Download Personas"
- `faqSection.questions[2].a`: "team features on top"
- `faqSection.questions[4].a`: "per-agent"
- `faqSection.questions[5].a`: "1–5" and "all caps entirely"
- `featurePages.multi-provider.description`: the comma chain
- `BLOG_POSTS[0].title`: brand first
- `BLOG_POSTS[1].title`: "Personas Self-Healing Engine"
- `BLOG_POSTS[1].content`: "isn't whether … it's"

Two consequences a future run should plan for:
- **An edited string is re-gated whole.** The house style guide says so: the baseline
  fingerprints `rule|file|key|sha1(text)`, so an edited string's old em dashes come back as new
  errors. Every repaired string therefore also lost its em dashes. That is 8 dashes in 6 strings,
  one of them inside an escalated claim sentence (`blog.ts:97`, punctuation only). The flagged
  span is never the whole edit.
- **The skill's repair rule and this run disagree.** `review-checklist.md` §4 says to apply
  critical, major and mechanical minor fixes and leave judgment minors noted. This run repaired 10
  judgment minors because the operator's brief asked for every agreed language defect. Record
  which rule a run followed; the idempotence number below depends on it.

## "It must find nothing new" measures two things

The re-reviewer raised 8 findings on the 10 repaired units:
- **4 repeats** of findings raised before the repair, on spans the repair did not touch
  ("In our testing", "by 94%", "OpenAI", "whenever someone notices").
- **4 new** relative to the three original reviewers, every one on text that predates the repair:
  - "Paid cloud" against "Cloud plans"
  - "using Claude CLI", an EN-ARTICLE that is arguably wrong on a product name
  - "depending on tier"
  - "seamlessly switch", which after the dash removal reads directly beside the fact the
    reviewer said makes it redundant

None sat on a span the repair wrote, and none proposed reverting one.

By the technique's letter, the check failed: something new was found. What it measured was a
fourth sample's recall. Three samples had missed four pre-existing defects in 455 words. The
repair's stability, which is what idempotence exists to test, was perfect. **Split the measure:**
findings on spans the repair wrote plus flip-backs (target 0; here 0), reported separately from new
findings elsewhere in the repaired unit (which estimate panel recall; here 4). A single "nothing
new" number invites either a second repair round the technique forbids, or a shrug.

## What went to the owner

These are claims and terms, untouched. The facts behind the language findings:

1. **Tier names.** The cards say Local, Cloud, Enterprise (`en.ts:1825-1827`). Beside them:
   "Everything in Free" and "Everything in Pro" (`:1845`, `:1850`), "Cloud plans (Starter, Pro,
   Team)" (`:2017`), "Pro and Team plans" (`:2029`) and "Paid cloud" (`:1740`).
   `docs/i18n/glossary.md` holds them UNRESOLVED.
2. **"Go Cloud" on a Coming Soon tier** (`:1829`, `:1831`): what does the button do?
3. **"ship free forever. No tiers"** (`:1738`) beside paid Cloud and Enterprise tiers.
4. **"Zero telemetry"** (`:1786`, `:1860`, `:2045`; "We don't collect analytics", `:2013`;
   `blog.ts:41`, `:53`) beside `src/lib/analytics.ts` (consent-gated Sentry metrics) and
   `@sentry/nextjs` error reporting (`src/lib/sentry.ts`). Scope the claim to the desktop app in
   words, or drop it.
5. **"bank-grade AES-256" and "nothing is ever sent to the cloud"** (`:3176`) beside cloud
   execution (`:1864`, `:2013`, `:2025`).
6. **"seamlessly switch to GPT or Gemini without changing prompts or losing context"**
   (`blog.ts:97`), and the automatic switch at `:3181`: an unverified guarantee.
7. **"In our testing … by 94% … from 'whenever someone notices' to under 30 seconds"**
   (`blog.ts:105`): name the test and the baseline, or cut.
8. **The hero headline** "Intelligent agents / that work for you" (`:1862-1863`) fails the
   name-swap test.
9. **One fragment run for the home page** (`:1822`, `:1860`, `:1865`, `:2045`).
10. **"Focused on users"** (`:1746`) names no mechanism.
11. **Terms without a termbase:**
    - "Orchestration" titling the triggers card (`:1756`)
    - "No orchestration markup" against "No per-run markup" (`:1740`, `:1739`)
    - "40+ integrations" against "Connectors" (`blog.ts:60`, `seo.ts:9`)
    - "Claude CLI" (`:2008`, `:2025`, `:2040`, `:2043`) against "Claude Code" (`:3280`)
    - "OpenAI" against "GPT"

## What the tree owes, and what the method owes

- **Tree.**
  - A termbase, so that the 7 EN-ONE-TERM escalations among the 17 become checkable.
  - A pricing and privacy fact sheet, so the 10 `fix: null` findings get facts.
  - A human pass on the money pages. The technique's decision rule says the model advises there,
    and nobody has decided yet.
  - A `translate sync` for the 7 changed `en.ts` keys, now stale in 13 locales. The blog has no
    locale copies.
- **Method, as proposals** (not applied here):
  - A key for keyless exports, or a veto resolver that accepts `file:line`.
  - V-SYNONYM-SWAP ignoring group words present in both span and fix.
  - Page-scoped clustering for density rules.
  - The two-part idempotence measure.
  - A gold set, so the reviewer's edit rate is known before its 28 agreements are trusted. None
    exists in this tree.
