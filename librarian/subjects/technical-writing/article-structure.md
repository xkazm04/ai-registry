---
subject: article-structure
domain: technical-writing
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# article-structure

A composition subject forged on 2026-10-05 from one writing contest, with five techniques
and one `process` application. It was revised on 2026-10-06 by the owner's notes from the
first full pipeline run. The subject had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-as-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
rank was real, and the golden path had fallen behind its own techniques. The 2026-10-06
owner rule took the read time out of the preview and added a summary table to the close. Both
techniques were changed, but the golden path still promised "an honest read time" in three
places and described a three-move close.

Three lanes ran:
- **Field lane** on `personas-web` at `01eaee60` (origin/master). It read the blog's static
  data file and the components that print the read time, measured ten posts, and walked the
  history back to the authoring commits. Nothing was committed to the project.
- **Counter-evidence web lane.** Sources: NN/g's F-pattern (2017), layer-cake (2019), table of
  contents (2023) and inverted-pyramid (2018) articles; Google's "Organizing large documents";
  Brysbaert 2019 (Crossref record and preprint abstract, re-checked in-session); and the
  SearchPilot read-time split test (2022). Blocked: ScienceDirect, SAGE, Medium help (403),
  and a UAGC writing-centre page (navigation only).
- **Training-data-only blind lane.**

**Corrected:** the golden path was synced to the 2026-10-06 rule. The preview promises a
route and a return, and the read time stays in the header. The close carries a comparison
table where the body compared things. The deterministic check no longer looks for an in-text
read time.

**Condition gained (field), content-preview-block:** "leave it to the platform" holds only
where the platform computes the figure. On the field blog every read time is a typed field:
66 minutes stated for 15.8 minutes of text at 238 wpm across n = 10 posts. The figures were
4.15x too high at the authoring commit, and none moved through nine later edits. The preview's
"under five minutes" rule must read the computed length. Landed in the technique, the golden
path's failure mode, and `next--content-preview-block--personas-web`.

**Condition gained (convergence: field + blind + web), golden path + information-carrying-headings:**
the five parts are the argued article's shape. A tutorial needs a what-you'll-build preview,
action-named step headings and a next step. On the field blog's three tutorials, the argued
shape raises 19 findings, none of them useful for the genre, and the tutorial shape raises 3
real ones. Landed as a golden-path distinction, a "When not to use" clause, and
`next--information-carrying-headings--personas-web`.

**Sources:** the layer-cake article (verbatim checked against raw HTML) now sits beside the
F-pattern citation, because NN/g frames the F-shape as the failure. Brysbaert 2019 was added
for the 238 wpm rate.

**Verified and left untouched:**
- The opening scene as the smallest instance of the problem. The blind lane's seductive-details
  research (vivid but irrelevant openings lower recall) is already the subject's rule.
- The short-post rule for previews. NN/g's 2023 testing, where users ignored a table of
  contents, and the signaling literature's dependence on prior knowledge both support the
  "under five minutes, one line" rule as written.
- "No new material in the close." It already sits in the narrow form both lanes back: no new
  fact.

**Declined:**
- Front-loading the result over the close (inverted pyramid). The opening already carries the
  thesis with its numbers. A length condition on the numeric recap has one unverified source
  (UAGC, navigation only) and no second one.
- Displayed read time raises engagement. One controlled split test was null on search
  traffic, and the "+40%" figure circulating in marketing posts has no method. Nothing was
  landed either way.

**Banked leads:**
- The `process` application attributes Medium's 12-seconds-declining image schedule to the
  platform's help centre. The counter lane found that schedule only in third-party write-ups,
  and the help page returns 403. Return: when the help page is fetchable, re-check it and move
  `verified_on`.
- The advance-organizer meta-analyses (Barnes & Clawson 1975, null; Luiten et al. 1980, small
  positive) were behind 403 or scanned PDFs. Return: when a text copy is reachable, for a
  sourced condition on the preview's comprehension claim.

## Impact

`build-registry-map --dry-run` at the run's tree: no project's map joins `technical-writing`,
so no verdict went stale and no `/conform --stale` queue grew. The field project
(`personas-web`) has a blog but no context joined to this bundle. The seam (typed
`readingTime`) is recorded in the applications, not applied.
