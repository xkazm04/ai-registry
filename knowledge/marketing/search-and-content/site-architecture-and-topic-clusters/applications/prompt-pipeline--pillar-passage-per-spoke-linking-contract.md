---
layer: application
type: application
subject: site-architecture-and-topic-clusters
technique: pillar-passage-per-spoke-linking-contract
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# The linking contract, and which half of it a markup check can see

The prompt pipeline at commit `a47c1ecd57016568cc791d24af9d809768d8d5ab` (2026-09-06)
states the hub-spoke linking contract in three reference files and enforces it in one
exit gate. Reconciling the technique against it settles one question precisely: the
*link* half of the contract is machine-checked, the *passage* half is not, and the
pipeline knows it.

## The contract in the references

`references/keyword-clusters.md:173-192` is the contract's canonical statement, headed
"a link is not enough, the STRUCTURE must be visible" and marked "Owner-defined and
non-negotiable" (line 175) - which is why the technique labels it as owner convention
rather than engine behaviour. Blogs (lines 177-183): the pillar "carries an H2 section
about each spoke: a short passage introducing the subtopic with the link inside it. A
bare 'related posts' list fails; the passage is the point"; each spoke "references its
pillar by name early in the body and links up"; every post links to its money page.
Services (lines 185-190): the hub carries an H2 covering its cities, "a passage per
city with the link inside it", every live spoke appears there or is "an orphan in
spirit even if some other link exists"; spokes link up; city spokes do not all
cross-link. Line 192 is the same-day rule: "a new spoke means the hub's section grows
a passage the same day."

`references/hub-spoke-pages.md:26-34` supplies the pillar formula the technique folds
in: one H2 per spoke with a 2-4 sentence passage and the link inside (line 30, tagged
CONVENTION with three named practitioner sources), the table-of-contents rule marked as
"learned on a real page" (line 31 - an upward lesson the technique kept), breadth not
depth so the pillar never out-covers its spoke (line 32), and the living-index rule
with its single compounding case (line 34). Lines 52-56 give the service-hub half with
its evidence tag: orphaned city pages as "the #1 doorway tell", nav inclusion as the
first recovery step in documented de-indexings.

`references/pyramid-structure.md:103-110` turns the contract into per-page quotas and
adds the placement rule the technique carries - "one qualifier line in the hero" that
anchors to the areas section, and "the full section mid-page - after the proof/reviews,
before the FAQ. Never a lone footnote link, never below the final CTA" (line 106).
`references/keyword-strategy.md:86-88` is the source of the 130-170 word passage band,
cited to one query fan-out analysis, which the technique reports as a practitioner
figure rather than a platform number.

## The contract in the gate

`code/check_site_complete.py:189-221` is the enforcement. For every three-segment
services route the hub HTML must contain `href="<spoke>"` (line 200) and the spoke HTML
must contain `href="<hub>"` (line 210). Between them, lines 203-208 are the pipeline's
own admission of the passage problem: the comment reads "a footnote link is not a
section: the hub needs a heading that names the areas/cities block the spokes live
under", and the check collects every `<h2>`/`<h3>` text and requires
`area|cities|city|serve|location` to appear in one of them. Lines 212-216 require the
blog index to link every post; lines 217-221 require the nav on five main pages to
reach `/services` and `/blog`.

## Structural facts

**The gate proves link presence and heading presence; it cannot prove a passage.** A
hub with an "Areas we serve" H2 followed by a comma-separated list of twelve city links
passes lines 200-208 and fails the contract at `keyword-clusters.md:188` and the spam
pattern named at `hub-spoke-pages.md:55`. Nothing in the gate counts sentences around a
link or verifies one section per spoke. The technique's "checking it by machine"
section is written from this: a check reporting "linked" is read as "the link half is
linked".

**Editorial clusters are not wired-checked at all.** The gate checks that `/blog` links
every post (line 213-216) and nothing about post-to-pillar or pillar-to-spoke links.
The blog contract at `keyword-clusters.md:177-183` is held entirely by the `/blog-post`
and `/keyword-research` commands reading the map's hub/spoke labels. A deviation from
the technique's standard; the standard stands.

**The "orphan in spirit" clause has a machine reading, and it is narrower than the
prose.** Line 200 fails a spoke absent from its hub's HTML anywhere - which catches the
literal orphan - but a spoke present only in the footer passes both the link check and,
if any H2 mentions "serve", the heading check. The prose forbids exactly this ("never a
lone footnote link", pyramid-structure line 106); the gate cannot see placement.

**Same-day wiring is a command rule, not a gate rule.** Line 192 of keyword-clusters
assigns it to `/service-page` and `/blog-post`; the gate only sees the end state. Since
the gate runs at build exit rather than per spoke, a spoke shipped between full builds
with an unedited hub is caught late. The technique's decision rule that the hub is
edited in the same change as the spoke is the standard the pipeline states; the gate is
its backstop, not its enforcement.

**Hubs-before-spokes is enforced by a title convention.** `map_expected_routes`
(lines 115-143) derives a city spoke's route from its map title's `... in <City>`
suffix and places it under `/services/<service>/`, so a city row whose service hub was
never written fails at line 171 with "no page at" the hub-derived path. The build-order
rule is thereby checked indirectly, through the URL a city row must resolve to.
