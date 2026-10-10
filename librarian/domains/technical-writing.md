---
domain: technical-writing
subject: null
last_swept: 2026-10-10
layout: nested
demand_known: none
---

# Technical writing

Coverage note for the `technical-writing` bundle. It was opened by the first `/deepen` run on
the bundle (dp-as-1010). No librarian sweep has run yet.

## Saturation ledger

| Subject | Depth rung | Last pass | Yield | Dry streak | Clock | Demand |
| --- | --- | --- | --- | --- | --- | --- |
| article-structure | L2 primary + L3 field measurement (n = 10 posts) | 2026-10-10 | 1 correction, 2 conditions, 2 applications (`next`) | 0 | stack default | none: no project map joins the bundle |
| depth-and-audience | L2 primary + L3 field measurement (n = 10 posts) | 2026-10-10 | 2 citation corrections, 6 conditions, 2 applications (`next`) | 0 | stack default | none: no project map joins the bundle |
| evidence-and-sources | L2 primary (meta-analyses) + L3 field measurement (n = 45 numbers in 10 posts, 11 commits) | 2026-10-10 | 1 correction, 10 conditions, 3 applications (`next`) | 0 | stack default | none: no project map joins the bundle |
| figures-and-tables | L2 primary (perception and accessibility studies) + L3 field measurement (n = 10 posts, 117 paragraphs; 9 card routes; guide renderer) | 2026-10-10 | 4 corrections, 9 conditions, 3 applications (`next`) | 0 | stack default | none: no project map joins the bundle |
| medium-format-fidelity | L2 primary (reading, polarity and highlighting studies; WCAG; screen-size statistics) + L3 field measurement (66 paragraphs wrapped in the site's font; 11 themes' contrast computed; test suite and feed read) | 2026-10-10 | 5 corrections, 15 conditions, 5 applications (`next`) | 0 | stack default; the Medium map row a vendor landscape | none: no project map joins the bundle |
| voice-and-register | L2 primary (psycholinguistic given-new studies; corpus studies of generated text; detector tests; style authorities) + L3 field measurement (238 blog sentences split and banded; pronoun, tell and dash counts over blog and guide; copy gate run on an export) | 2026-10-10 | 6 corrections, 17 conditions, 4 applications (`next`) | 0 | stack default | none: no project map joins the bundle |

Every subject in the bundle has now had one deepen pass.

## Source-class memory

From one pass, so these are tallies, not rules:
- Usability-research publishers' own articles were rich and fetchable. Raw HTML matched the
  quotes; the fetch tool's summaries were not used as quotes.
- Publisher pages for the reading-research meta-analyses returned 403. Crossref and the
  preprint server's API carried the venue and the abstract.
- Platform help centres (read-time rules) return 403 to fetch tools. The figures circulate
  through third-party write-ups that do not always separate the platform's statement from
  the author's.
- Marketing posts on read-time engagement carry figures with no method. One controlled SEO
  split test was found, and it was null.
- Second pass (dp-da-1010): journal abstracts came through Crossref, and one method section
  through an author-hosted PDF where the publisher copy failed. The method changed what the
  finding covers (mouseover definitions, ten terms per paragraph), so read the method
  before landing an abstract's claim.
- The blind lane named the same five primary studies the web lane verified, with no
  priors. These are tallies from two passes, not a rule.
- Third pass (dp-es-1010): open-access venues (PLOS XML, arXiv API, PMC) and author-hosted
  PDFs carried verbatim text for every meta-analysis landed; Wiley returned 403. The
  Crossref abstract alone would have overstated one scope (a drift figure measured only
  over comparable snapshots), so the full text was read before the figure landed.
- The blind lane again named the web lane's primary studies with no priors (nine of them).
  Three passes now, all in one domain, so still a tally.
- Fourth pass (dp-fat-1010): OpenAlex abstracts, arXiv PDF text, PLOS XML and W3C HTML
  carried verbatim text for every study landed. ACM, SAGE and Taylor and Francis returned
  403, and the table-guidelines paper is closed access, so its guideline titles stayed
  summary-only and were declined. OpenAlex metadata caught a wrong first name in a drafted
  citation.
- The blind lane again named the web lane's primary studies with no priors. Four passes
  now, all in one domain, so still a tally.
- Fifth pass (dp-mff-1010): PubMed efetch, Springer HTML, W3C TR HTML and raw web-archive
  captures (`id_`) carried verbatim text. OpenAlex had no abstract for three of the four
  papers tried. The platform's help centre still returns 403 live. One archive capture
  reproduced on re-read and two did not, so a lane's archive quote is re-read before it
  lands. Screen-size trackers report screens, not viewports, and one series moved fourfold
  in six months, so a single tracker is a weak source for a width.
- The blind lane again named the web lane's primary studies with no priors (three
  highlighting studies, three polarity studies). Five passes, one domain: still a tally.
- Sixth pass (dp-var-1010): author-hosted PDFs (an essay, a 1974 study, a grammarian's
  paper), PMC full text, Europe PMC abstracts and the arXiv API carried verbatim text;
  ScienceDirect returned 403 and the style authority's live page was bot-blocked, so a
  web-archive capture carried it. Two quotes a lane reported were absent from its saved
  files and were re-fetched before landing, and a drafted arXiv author name was wrong
  until checked against the record. Trade press relaying a second-hand figure (a magazine's
  em dash count) was declined until the primary is read.
- The blind lane again named the web lane's primary studies with no priors (Reinhart,
  Liang, Pullum, Haviland and Clark). Six passes, one domain: still a tally.

## Field witnesses

- A product blog in the fleet (`next`, static data file, ten posts, three tutorials). It is
  the bundle's first non-`process` witness. Typed read times there are a live seam. Its
  renderer cannot link, and its 45 body numbers carry no source: the evidence seam is live
  too, and its git history (an unsourced figure cut on 2026-09-14) is itself evidence.
- The same site's blog renderer draws no image, table or code block, and its guide renderer
  draws tables without alignment or a caption slot. Both are live seams for
  figures-and-tables, and the guide's parser carries a defect recorded in that subject's note.
- The same site is the medium-format-fidelity witness:
  - a 768-pixel blog column holding 99 characters per line;
  - eleven themes, one picked at random, with the system preference never read;
  - inline code that fails contrast on two light themes;
  - a phone test suite that visits no article;
  - a summary-only feed.

  Five seams, five `next` applications.
- The same site's blog and guide are the voice-and-register witness:
  - a pronoun search where 6 of 8 blog hits are prompts the reader pastes or code;
  - a blog with high sentence-length spread, where a monotony rule fires only on parallel
    structure and heading artifacts;
  - one "not just" frame repeated across posts and the guide;
  - a five-rule house sheet with a gate, no person rule, and a checker that reads Markdown
    bullets as dashes.

  Four seams, four `next` applications.
