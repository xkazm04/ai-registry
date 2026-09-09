---
layer: application
type: application
subject: money-page-conversion-craft
technique: cro-leak-order
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# The leak order in a command-driven SEO agent: a locked skeleton, a seven-rung cheatsheet, and a checker that enforces "a form exists" rather than the order

The open SEO agent (seven commands, reference specs, small Python checkers; commit
`a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06) carries this subject across
three reference files, one command and two checkers. The structural fact the tree
proves is the one a reader of the technique should expect: **the leak order is
instruction, and only the bottom of it is enforced** - `code/check_page_rhythm.py`
fails a money page with no form, and nothing in the tree machine-checks message
match, the single above-fold action, speed on a phone, or proof beside the form. The
tree is honest about this: the CRO walkthrough "still runs after the draft ... quoted
where satisfied, honest where not" (`references/service-page-template.md:82`), which is
a review step, not a gate.

## The skeleton: hero-proof-first and the five-visible list

`references/service-page-template.md` is "THE locked money-page structure" (line 1),
built "from cro-cheatsheet.md + on-page-seo.md + geo.md" (line 3). Section 2, "Hero -
the 5-second sale" (lines 14-18), is the hero technique verbatim: H1 = the primary
keyword "phrased the way they searched it"; "ONE call to action, visible without
scrolling: click-to-call button (mobile) / short form (desktop). No competing
choices"; the proof line "directly under the H1: stars + exact review count +
license/insured + years ... every item from proof-inventory"; and the 40-60 word
quick answer. Section 8 (line 36) closes with "the form (3-4 fields max, button text
= the outcome: 'Get My Free Quote')" and hands the conversion tag to the thank-you
page.

The progressive-disclosure block (lines 46-72) is the five-visible technique's
source. Line 50 states the default: "The default is COLLAPSED. Visible is the
exception and it has to be argued for." Lines 56-62 are the complete visible list -
H1 and promise, offer/price/guarantee, **one** proof line, every CTA and the form,
one service-area line. Line 54 makes the ranking argument ("content inside accordions
and tabs is indexed and weighted the same as visible content"), which the technique
labels as documented platform behaviour, and line 52 states the half-minute read,
which the technique labels as convention because the spec cites no test for it.

Line 80 is the proof gate: "5+ proof touches minimum per page, every one traceable
to proof-inventory. Count them before registering." The audit command restates it as
a count with the asymmetry the technique keeps - "each must be real and checkable -
unverifiable claims count against, not for. Target: 5+ per page"
(`.claude/commands/audit.md:365`).

## The cheatsheet: seven rungs in leak order, none with a cited test

`references/cro-cheatsheet.md` opens with the quadrant's first cell as its
precondition - "The ads are working if people click. If they click and don't call,
book or submit, the PAGE is the problem" (line 3) - and lists the seven rungs in
descending size (lines 8-43): match the page to the ad, ONE call to action above the
fold, under 2 seconds on a phone, phone version first, proof where doubt happens,
3-4 fields, kill friction. Line 10 gives the message-match rung its platform-price
argument ("a worse Quality Score, which means higher cost per click") and line 18
asserts "Every extra second of load time drops conversions measurably" without a
source. This is the deviation the technique records: the cheatsheet presents every
rung in the same register, and the technique's footing notes - documented for the
price effect of message match, observational for speed and form length, convention
for the rest - are the correction. The cheatsheet's own last line (61) is the
boundary the subject keeps: "Deep CRO - A/B testing, heat maps, session recordings -
is its own discipline."

Lines 47-59 are the diagnostic quadrant, four cells with four routes: "Lots of
clicks, no conversions - This file, top to bottom"; "Good conversion rate, junk leads
- The traffic source is wrong, not the page"; "Few clicks at decent impressions - The
title and meta description"; "Few impressions - Bids, budget or keyword volume."

## The thank-you page doctrine, and where it is enforced

`references/standard-pages.md:9-29` is the thank-you technique's source: "the only
reliable place a conversion event can fire" (line 11); without it "conversion
tracking has to rely on click or event triggers, which break silently and
undercount" (line 13); must-haves at lines 17-22 including "What happens next, with a
time", the tracking snippet "firing on page load", `noindex`, and "Excluded from
sitemap.xml"; must-nots at lines 26-27.

The website half of the tree realises the doctrine structurally:

- `website/app/api/lead/route.ts:13-19` refuses with a 503 and a plain message when
  the lead destination is unset or still a placeholder - the comment at lines 4-7
  gives the reason the technique adopted as an upward lesson: "a lead disappearing
  silently is the worst failure a money page has". Line 30 redirects to `/thank-you`
  with a 303 only after the forward returned OK (lines 27-29 return a 502 otherwise),
  so the page - and the event - is reachable only when the lead exists.
- `website/app/thank-you/page.tsx:8-15` sets `robots: { index: false, follow: false }`
  with the comment "If it shows up in search results, people land here without
  converting and your conversion count becomes fiction"; `website/app/sitemap.ts:7-10`
  lists the pages and comments "DELIBERATELY EXCLUDED: /thank-you"; line 35-37 of the
  page marks the snippet slot "Keep it on page load, not on a click."
- `.claude/commands/service-page.md:19` is the second upward lesson: "Calendar given:
  it goes on `/thank-you`, NOT on the money page. The money page keeps ONE job and one
  primary action - the form ... Two competing CTAs on a sales page split the decision
  and lower both." Line 23 of the thank-you page derives the calendar's embed
  identifier from the configured booking address rather than hardcoding it.

## The checkers: what is machine-checked and what is not

`code/check_page_rhythm.py:145-150` is the only conversion assertion in the tree.
For a route under `/services/`, line 147 fails the page when `<form` is absent - "no
form - a money page with no lead capture is not a money page" - and line 149-150
fails it when the body contains "no results" or "not published here yet": "a section
apologises for having no proof - show the best true material instead". The second
check is the source of the proof technique's apology rule. Everything above line 145
is layout rhythm (text runs, words per visual, sentence counts), and `<form` at line
33 is also counted as a visual block.

`code/check_site_complete.py:236-246` enforces the page-type boundary from the other
side: `/services` and `/blog` fail if they contain a `<form` ("an index is not a
sales page; forms live on child pages") or a dollar price pattern ("an index names the
branch; pricing lives on child pages"). Line 71 and 95 skip `thank-you` from the
crawl and the route set, matching the page's own comment.

Neither checker reads the ad, the fold, the load time or the proof position. The
pipeline enforces that a money page *is* a money page and that an index is not one;
the leak order itself is applied by the command's walkthrough and the owner's eyes.
A team adopting this pipeline should read the rhythm gate as the floor the technique
describes and not as evidence that the seven rungs were checked.
