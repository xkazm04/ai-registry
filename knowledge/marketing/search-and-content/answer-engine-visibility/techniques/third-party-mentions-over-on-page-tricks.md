---
layer: technique
type: technique
subject: answer-engine-visibility
technique: third-party-mentions-over-on-page-tricks
status: forged
laws: [label-convention-as-convention, platform-reported-is-not-causal]
shared_with: []
use_when: [prioritising an AI-visibility budget, judging a vendor's citation checklist, deciding whether a markup or manifest-file task is worth doing, explaining why a well-structured page is still not cited]
---

# Third-party mentions over on-page tricks

The strongest off-site predictor of being cited in AI answers is how often the
business is mentioned on sites it does not own - in roundups, forums, trade
listings, review sites and other people's articles - and it outpredicts
backlinks by a wide margin. The on-page items most often sold as AI levers -
structured markup, a manifest file for language models, keyword density,
freshness stunts - have been measured and returned null. Budget follows the
evidence: after the crawlability preconditions and the passage craft, the next
unit of effort goes to being mentioned, not to another markup pass.

## The evidence, sorted by class

**Correlation, large sample, replicated.** A 75,000-brand vendor study found
off-site brand mentions correlate with AI visibility at about 0.66 against
about 0.22 for backlinks; per-engine breakdowns find the engine most distant
from classic search weights classic authority signals least. Multi-engine
citation samples put the bulk of citations on earned media rather than owned
pages, and put a large forum's threads at the top of the cited-domain list
across engines. These are correlations; a mentioned brand may be mentioned
because it is good, and nothing here proves that buying mentions buys
citations.

**Controlled test, null.** A 2026 vendor test of 1,885 pages that added
structured markup against roughly 4,000 matched controls found no meaningful
citation change on any of three engines - a small decline on one, noise on the
others. The often-quoted "cited pages carry markup 2.3 times more often" is a
correlation across millions of URLs that tracks site quality, and the same
vendor published both numbers. Markup stays for rich-result eligibility and
entity resolution; it is not sold as an AI lever.

**Measured absence.** The manifest file: a 137,000-site crawl found 97% of the
files received zero requests in a month; a roughly 300,000-domain model found
no relationship with citation frequency and improved when the variable was
removed; server logs across about 900 sites found the citing crawlers do not
request it; no engine has committed to reading it in production. Ship it if
it takes ten minutes; budget nothing on it.

**Mechanics.** Engines overlap little in whom they cite - one multi-engine
sample found about one domain in nine cited by two engines - so a mention
programme is per surface, and a listicle the engines lean on for "best
[service] in [city]" is a mention with a citation path built in.

## Procedure

1. **Pass the preconditions once.** Crawlers allowed by name, no firewall
   toggle silently blocking them, content in raw markup without script
   execution, fast first paint, real headings and tables. Verified from crawl
   logs or a user-agent fetch, not from the robots file. These do not repeat.
2. **Find where the engines already look for the business's category.** Ask
   each engine the top money questions and record the cited domains. The
   roundups, directories and forums that appear are the mention targets;
   a business absent from the pages the engine quotes is absent from the
   answer.
3. **Earn the mention honestly.** Get listed in the roundups by being a
   candidate worth listing; answer real questions in trade and local forums
   without spam; give a trade publication the original data the sibling
   technique produced; keep one canonical business name everywhere so the
   mentions resolve to one entity.
4. **State the name, place and services in plain text on the site.** The model
   must be able to read who the business is; a logo is not a name. Consistent
   naming across the site and the listings is the on-page half of the mention
   graph.
5. **Report mentions as opportunities with a source, never as a score.** "Not
   listed in the three roundups the engine cited for this query" is a finding;
   an "AI authority score" is a vendor artefact.

## Decision rules

- When a vendor's AI checklist puts markup, the manifest file or keyword density
  in its top tier, discount the checklist, because the one controlled test and
  the two large null results in the field are on exactly those items.
- When the business ranks and is structurally clean but is not cited, look
  off-site first, because the on-page levers have been exhausted by
  construction and the remaining gap is the mention graph.
- When a budget line for "AI optimisation" exists, spend it in this order:
  preconditions, passage craft on money pages, original-data pages, mention
  acquisition; because that is the order of evidence strength and each earlier
  item is a precondition of the next.
- When the goal is one engine, test that engine, because the low overlap
  between engines means a mention on the forum one engine favours may do
  nothing on the engine the client asked about.

## What is convention here

The order of spend is a practitioner reading of the evidence, not a measured
programme. The 0.66/0.22 correlation is one vendor's, on its own sample,
replicated by others in direction but not in magnitude. The 97% and "8 of 9
sites saw no change" manifest-file figures are vendor measurements; the
absence they describe is robust because three independent methods agree.
"Ship it in ten minutes" is a convenience judgement.

## When NOT to use

- As a licence to buy mentions, seed fake reviews or post the business's own
  name into forums. The correlation is with earned mention; a mention
  programme that would embarrass the owner if quoted back is the wrong
  programme, and on review sites it is against the platform's terms.
- When the preconditions have not passed. A blocked crawler makes every mention
  irrelevant; the order is fixed.
- To dismiss markup entirely. It is null for citation and still required for
  rich-result eligibility, breadcrumbs, the entity graph and the business
  listing's own consistency checks; the technique demotes it from the AI
  invoice, not from the site.
