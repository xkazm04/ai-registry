---
layer: application
type: application
subject: english
technique: generated-prose-patterns
stack: process
status: forged
verified_on: 2026-09-14
---

# Process · Citing generated-prose rules against shipped landing copy (five fleet products)

A reviewer's pass over real English marketing and UI strings from personas-web, ascent,
gravitone, kp and goat, read in their working trees on 2026-09-14 (uncommitted state included).
The strings were found by searching for the patterns, so this is a sample of the patterns and
not an estimate of how often they occur. No finding below says who or what wrote a string: each
names a span and a rule ID. Several candidates that a word list would flag turn out clean under
the rule's own exceptions, and that half of the lesson is the one a word list cannot teach.

## Findings that stand

**One undeclared Title Case line in six places (personas-web).**
`personas-web/src/app/layout.tsx:69`:

```
    title: `${SITE_NAME} — AI Agents That Work For You`,
```

The same words appear at `layout.tsx:30` and `:76`, `src/app/manifest.ts:9` ("Personas — AI
Agents That Work For You") and `src/app/opengraph-image.tsx:6` and `:14`. Three findings, one
decision: EN-CASE (Title Case on a page title with no declared case policy), EN-TAGLINE (the
name-swap test fails: every agent product could say *AI agents that work for you*), and
EN-META-TITLE (the distinctive term should lead). Six sites mean the fix is a single constant,
not six edits.

**The same description with two punctuation forms (personas-web).**
`src/lib/seo.ts:9`: "…self-healing execution, and 40+ integrations — no code required."
`src/app/homeJsonLd.ts:21`: "…self-healing execution, and 40+ integrations - no code required."
The structured-data copy uses a spaced hyphen as a dash (EN-DASH), and two copies of one
sentence disagree. The briefing for this application called `seo.ts:9` a puffery stack. Under
the swap test most of it passes: "locally or in the cloud", "AES-256 encrypted credential vault"
and "40+ integrations" are checkable facts no competitor can borrow unchanged. Only "self-healing
execution" is unbacked in the sentence, and that is at most one EN-PUFFERY finding.

**A jargon verb and a soft triad (ascent).**
`ascent/src/components/landing/prototypes/index/IndexOrg.tsx:32`: "See which
teams have operationalized AI tooling, agents, and shared conventions." *Operationalized* is
EN-JARGON (*put into daily use*). The list is an EN-TRIAD candidate, a warning for a reviewer to
confirm: agents are a kind of AI tooling, so the weakest item may not be a separate item.

**A hero metaphor the next section contradicts (kp).**
`kp/messages/en.json:731`, key `landing.hero.title`: "Your
hiring,<br></br>on <emph>autopilot</emph>". Line 844, `landing.trust.heading`: "Powerful
AI.<br></br><emph>A human signs every call.</emph>". The hero fails EN-TAGLINE's name-swap test,
while the subtitle at line 732 carries the specific claim a hero line could lead with. "Powerful
AI." is EN-PUFFERY with its proof one element away: the subtitle at line 845 supplies the facts
(EU AI Act, a qualified person makes every decision). Whether proof in a subheading backs a
heading is a reviewer's call, so the finding is a warning. That *autopilot* and *a human signs
every call* pull against each other is a positioning question. The language review flags the
wording and leaves the claim to the marketing side.

**Title Case held consistently, and toasts that break four rules (goat).**
`goat/src/app/features/Landing/LandingMain.tsx:114-115`: title "Browse by
Category", subtitle "Explore rankings across different topics". Its siblings agree:
`sub_LandingLists\FeaturedListsSection.tsx:286-287` ("Featured Rankings" / "Discover the most
popular lists from our community"), `SavedListsSection.tsx:301-302`, `CollectionsSection.tsx:74-75`.
Title Case is consistent across section headers, so EN-CASE is not a mixing finding here. It is
an undeclared choice: record it, or switch the whole class. The subtitles restate their titles
with filler (*across different topics*). No rule in this subject anchors a subheading that
restates its heading; EN-BOLD-LEAD (a label that restates its sentence) is the nearest. Per the
anchor law, that is a candidate for a new rule rather than an unanchored complaint.
In `sub_CreateList\CompositionModal.tsx` the toasts read "List Created!" (line 147) and
"Blueprint Created!" (194): EN-EXCLAIM. Line 117, "Please wait while we prepare your session...",
takes EN-ELLIPSIS (three periods); its *please* and *we* are covered by the exceptions in
EN-PLEASE and EN-WE, because the product is making the reader wait. "Creation Failed" (162) is
EN-ERROR if its description is empty; the description there is a runtime `errorMessage`, so the
review cannot judge it from the catalog.

## Candidates that turn out clean

**`seamlessly`, with its proof beside it (personas-web).** `src/data/blog.ts:97`: "your agents
seamlessly switch to GPT or Gemini — without changing prompts or losing context." The fact follows
in the same sentence, which is EN-PUFFERY's "backed by proof" exception. Cutting the adverb is a
minor optional edit; flagging the sentence as puffery would be a false positive.

**`unlock`, in its literal sense (ascent).** `ScanModal.tsx:235-237`, as rendered (the source
writes the apostrophe as `&apos;`): "Sign in with GitHub to run your scan. Public repositories are
free, and you'll also unlock private repos and saved history."
*Unlock* is on every puffery list, but here it names access gated behind sign-in, with the
unlocked things named in the sentence. It is clean under EN-PUFFERY. The real finding is smaller:
*repositories* and *repos* in one sentence (EN-ONE-TERM).

**A staccato run within its allowance (gravitone).**
`gravitone/gravitone/web/components/variants/StudioDark.tsx:180`: "Type it.
Hear it. Ship it." The page's other headings are a data-driven card title (line 134) and "A voice
for every line." (line 152). One fragment run per page is within EN-STACCATO. Line 152's closing
full stop is EN-END-PUNCT unless the product declares full stops on display headlines, which is a
common and legitimate brand choice. The subtitle at line 181 carries one em dash, a density EN-DASH
does not flag unless the house bans the character.

## What the sample teaches

Of the three puffery words a list would have flagged (*seamlessly*, *unlock*, *powerful*), two
are clean under exceptions written into the rule. The highest-yield findings were about
consistency: one title in six places, one description in two punctuation forms, one undeclared
case policy held across a whole landing page. None of the findings needed a claim about
authorship, and the one gap that no rule covered (a subheading restating its heading) became a
rule proposal instead of taste.
