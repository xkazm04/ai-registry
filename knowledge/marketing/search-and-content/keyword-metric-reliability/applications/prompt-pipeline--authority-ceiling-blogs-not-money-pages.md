---
layer: application
type: application
subject: keyword-metric-reliability
technique: authority-ceiling-blogs-not-money-pages
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# The authority ceiling as a blog gate and a money-page selector - the SEO agent's four cuts

The open SEO agent (commit `a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06) is a
set of seven slash commands plus reference specs; its keyword command
`.claude/commands/keyword-research.md` is where this subject's metric doctrine is
operationalised as prompt instructions. It realizes this technique fully and, unusually
for a prompt pipeline, labels its own thresholds with their footing on the page where
the model reads them.

## The four cuts, in order (`keyword-research.md:90-129`)

- **Cut 1 - junk** (`:92`): misspellings, other brands, careers, DIY, wholesale, and
  anything on the owner's do-not-offer list.
- **Cut 2 - intent verified on the results page** (`:94-101`): the 6-of-10 count with
  the sentence *"The 6-of-10 threshold is our internal convention, not a documented
  standard - never cite it as best practice"*, and the "err toward transactional"
  correction with its measured basis (82% of classification errors ran informational).
  This cut belongs to the intent subject; it is cited here because it sits inside the
  same ordered pass.
- **Cut 3 - volume floor, 100+/month** (`:103`): with the local exception stated as a
  rule about disclosure - *"if you keep one, say so explicitly with the reason, never
  let it through silently"*. The volume-holding block at `:105-112` then carries the
  order-of-magnitude doctrine verbatim: 1,462 distinct values across 101,897 keywords,
  median 0.51x, 60% accuracy against console impressions; rank only, never present as
  visits, never sum variants, and *"on local terms, do not sort by volume at all ...
  rank by revenue per job, and let volume only break ties"*.
- **Cut 4 - difficulty ceiling** (`:121-129`): the ladder (under 60 -> 30; 70 -> 40;
  80 -> 50) headed *"A rule of thumb, not a law"*, followed by *"Say out loud that this
  is a rule of thumb, because it is. No study supports it. KD and Authority Score come
  from different vendors computed on different bases, so subtracting one from the other
  is not a dimensionally meaningful operation."* The same block holds the link-count
  reading (KD purely referring domains in one vendor; ~58% of the other's score) and
  the 46-72 cross-tool spread, and names the two better predictors with their
  measurements (72.9% of top-ten pages over three years old, position one averaging
  five years; 35-40% versus ~20% first click within three weeks).

The ordering is itself a rule: *"all four cuts in one pass, in this order ... Never
filter halfway and come back later"* (`:90`). The ceiling comes last so that a term
cut on difficulty has already survived junk, intent and volume, and the quarantine
reason is the last gate it hit.

## The blog-versus-money-page scope (`keyword-research.md:62-84`)

The technique's central claim is the command's own headline: *"The difficulty ceiling
applies to BLOG POSTS. Money pages are governed by what the business sells."* The block
argues the two jobs (`:64-68`), states the rankable-variant rule with worked examples -
`seo services` at 65 still gets its hub page; `seo services vancouver` is the page that
ranks, at tier three (`:70-76`) - and lists what the ceiling still decides on a money
page: primary phrasing between a 20 and a 65, spoke count, build order (`:78-82`). The
closing rule, *"Never cut a service the business actually sells because its keyword is
hard. That is optimising a keyword map at the cost of the website"* (`:84`), is the
technique's third decision rule in the source's words.

The header rule is also present: *"State the ceiling AND the Authority Score it came
from in the file header, so the number is never a mystery"* (`:138`), and the
quarantine rule - *"quarantined, never deleted ... grouped by when it becomes useful,
not by rejection reason. A wrong cut is invisible forever"* (`:140`) - with the refill
loop justified at `:9-13`: quarantined terms *"genuinely reopen as Authority Score
climbs"*.

## The references beneath the command

`references/keyword-clusters.md:13-19` restates the ladder as gate 1 of three, again
headed *"a rule of thumb, not a law"*, with the 58%-link-count and 46-72 facts and the
pointer to the two better signals. `references/keyword-strategy.md:12-29` is the
evidence file: each claim tagged `[E]` (evidence) or `[C]` (convention), with the
revenue-per-job rule for local terms explicitly `[C]`. The myths section at
`:157-199` carries the falsifier for the ceiling - *"Myth: target keywords with KD below
your DA. No study exists ... arithmetic theatre. Keep it as a guardrail, never as a
law"* - and for the vendor authority score (*"not a ranking factor ... explicitly
denied"*), the console-as-volume myth, and the zero-volume-converts myth with its only
measured test (11.3 impressions per keyword).

## What the pipeline proves about the standard

A prompt pipeline can carry a convention with its label in the same sentence the model
reads, so the generated map inherits the label rather than the folklore. The `[E]`/`[C]`
tagging in the reference file is the structural version of the
label-convention-as-convention law: the footing travels with the claim into every
downstream prompt. Where the pipeline falls short is that nothing checks the output for
the label - the header rule and the "say out loud" rule are instructions, and the
small Python checkers in the tree (`check_site_complete.py`, `check_page_rhythm.py`)
verify page structure, not map headers. The standard asks for the ceiling and its
authority score to be a required field of the map artifact, verified by a checker, not a
sentence the model is asked to remember.

One deviation in scope: the command's country-database block (`:15-23`) and the
volume doctrine are correct, but the fallback path when no data vendor is connected
(`:88`) marks volumes `ESTIMATE` without saying what the estimate is derived from; the
volume technique requires the method beside the label.

## Verdict

Confirmed: ceiling as a hard blog gate; money pages built for what is sold with the
rankable variant beneath the hub; the ladder labelled as convention with its
dimensional argument; ceiling and authority score in the header; quarantine grouped by
when it reopens; the two better predictors checked per root. Deviation: labels are
instructed, not verified by a checker; the estimate fallback lacks its method.
