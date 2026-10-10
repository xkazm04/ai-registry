---
subject: evidence-and-sources
domain: technical-writing
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# evidence-and-sources

A grounding subject forged on 2026-10-05 from one writing contest. It had five techniques
and one `process` application. The subject had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-es-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
rank was real. `check-currency` reported nothing expired or at risk. There was also an
event: dp-da-1010 had banked a proposal for this subject (no-link renderer; scenario figures
in the indicative).

Three lanes ran:
- **Field lane** on `personas-web` at `01eaee60` (origin/master), the same ten-post blog as
  the `article-structure` and `depth-and-audience` passes. It listed every number in the
  bodies (45 rows, with the exclusions written out), classed each one, read the renderer
  and walked the eleven commits to the data file. Nothing was committed to the project. The
  Director re-read the anchors in a `git archive` of the tree, and all 22 held under
  `check-anchors`. One Director error was caught before landing: the specifications count
  was 12 in a draft, and the lane's rows give 8.
- **Counter-evidence web lane.** Sources: O'Keefe 1999 (author PDF); Allen 1991; Piccardi
  et al. 2020; O'Keefe 1998; Johnson and Wiedenbeck 2009; Fogg et al. 2001; Zittrain et
  al. 2014; Klein et al. 2014; Jones et al. 2016; Pew 2024; Mogull 2017; Walters and Wilder
  2023; van der Bles et al. 2020; Durik et al. 2008; Gustafson and Rice 2020; Jensen 2008
  (abstract blocked; the 2011 non-replication via PMC); Budescu et al. 2009; GUM 7.2.6. The
  Director re-checked ten of these in raw text (PDF text, PLOS XML, arXiv API, Crossref,
  Pew HTML). One scope was narrowed: Jones's "over 75% drifted" counts only the
  references whose snapshots could be compared with the live page. Blocked: the Wiley
  page for Jensen 2008, the abstract of Borah 2014, and Chung 2012.
- **Training-data-only blind lane.** It named the same primary studies the web lane
  verified (Allen, O'Keefe 1999, Piccardi, Zittrain, Klein, Pew, van der Bles, Jensen,
  Gustafson and Rice) with no priors. It also gave the worked-example treatment
  (conditional, same sentence, out of headlines) and the no-link renderer treatment
  (attribution in the prose) unprompted.

**Corrected:**
- "Believed by experts; discounted by the first expert" (golden path and technique). No
  study isolates expert readers, and education did not moderate the sidedness effect
  (O'Keefe 1999). It is restated as untested judgment. The measured half is that an
  unanswered objection does worse than none.

**Conditions gained:**
- **counter-evidence-alongside-the-thesis.** Listed is not answered. The table gains an
  answer column: refuted, bounded or conceded (web + blind convergence).
- **numbered-in-page-citations.**
  - Name the load-bearing source in the sentence. Readers rarely click (0.29%), and on a
    renderer with no links the sentence is the citation (field + web + blind convergence;
    closes dp-da-1010's proposal).
  - The entry gains a snapshot taken at citation time (Pew, Klein, Jones). A DOI where one
    exists.
  - Re-read the cited sentence, not just the link (Mogull, Jones).
- **inference-labelled-as-inference.**
  - A fourth kind, the worked example: conditional mood, round inputs, out of titles. Do not
    cite it, because asking for a source invents one (field + blind convergence; closes the
    other half of dp-da-1010's proposal).
  - A marker word does not replace the inputs (field).
  - Label the reasoning, not the data, and prefer a range to a probability word (Durik,
    van der Bles, Gustafson and Rice, Budescu).
  - Round once at the end (GUM 7.2.6).
- **own-measurement-disclosure.**
  - Cut the run, not the headline. The field's 2026-09-14 copy pass removed the 94% and kept
    the 30-second median from the same test (field only).
  - A figure in a title loses its hedge (field + blind).
- **dated-current-data.** A post's date dates its numbers only until someone edits them.
  Field-derived, and unmeasurable on the witness, since no surviving number changed.
- **Golden path.** Synced to all of the above. Three failure modes were added: the
  unanswered objection, the scenario stated as fact, and the half-withdrawn measurement.
  The decorative citation now separates rot after publication from fabrication. The
  boundary now names marketing's `honest-proof-and-illustrative-data` for a product
  surface's illustrative figures.

**Verified and left untouched:**
- The Diataxis "Explanation" quote, verbatim in raw HTML.
- The Wikipedia "Signs of AI writing" sections: broken external links; invalid DOIs and
  ISBNs. That page adds that most links rot over time, and that is now in the golden path.
- Evans's pattern 10, "unsupported statements".
- "Weight by design, not by count", "over-labelling hides the real inferences" and "when not
  to use it" in every technique. No lane refuted them.

**Declined:**
- Walters and Wilder 2023's fabricated-citation rates as an upper-layer figure. They
  measure two named generations of a chat model, and the Wikipedia sign already carries the
  claim without a product name.
- O'Keefe 1998 (citing sources, r = .064) and Fogg 2001 (self-report) as the basis for a
  "citations raise credibility" rule. The effect is small and partly self-reported. It is
  mentioned only as "a little" beside Piccardi.
- The FTC endorsement guides (blind lane: testimonials imply typical results). That is
  advertising law, and it belongs to `marketing`. It was not verified here.

**Banked leads:**
- The field's corrections (telemetry claim, 2026-10-05) moved no date either. The dated rule
  may want to cover corrected claims, not only numbers. Return: a witness that edits a
  surviving number, or a second correction with no date.
- Specifications on an open-source product: cite the implementing file. This is owned by
  marketing's `claims-derived-from-product-code`. Return: a technical article (not a
  product surface) that cites code for a spec claim.
- No experiment found on whether a displayed "updated" date changes trust (Fogg 2001 is
  self-report only). Return: if one appears.

**Fact-check notice** (personas-web copy, kept apart from the evidence findings, not acted
on):
- The Slack tutorial says the bot runs locally "24/7", and two other posts say scheduled
  agents pause when the machine sleeps.

## Impact

Read from each project's committed `.ai/registry-map.json` through `loadFleet()` at
`779a1878`. `voice-io` was the known positive and appears in all 12 maps (6 to 57 hits).
`evidence-and-sources` and `technical-writing` appear in none, and `gigs` has no map. No
verdict went stale, and no `/conform --stale` queue grew. `build-registry-map --dry-run`
lists 62 subjects in its impact table and this one is not among them. The field seams are in
three `next` applications and six `applied.md` rows, and were not applied to the site.
