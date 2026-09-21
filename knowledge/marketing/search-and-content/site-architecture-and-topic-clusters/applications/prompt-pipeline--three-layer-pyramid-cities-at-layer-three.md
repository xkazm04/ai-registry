---
layer: application
type: application
subject: site-architecture-and-topic-clusters
technique: three-layer-pyramid-cities-at-layer-three
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# The pyramid as a spec file plus an exit gate - an open SEO agent

The prompt pipeline at commit `a47c1ecd57016568cc791d24af9d809768d8d5ab` (2026-09-06)
realizes the three-layer pyramid as one reference spec that three commands read, and
one Python exit gate that enforces the part of it a script can see. The split between
what the spec says and what the gate checks is the structural finding of this document.

## The spec

`references/pyramid-structure.md:10-15` draws the tree literally - layer 0 home, layer
1 `/services/ /blog/ /about /contact /quote`, layer 2 one service page or one flat
post, layer 3 `/services/plumbing/toronto` - and line 21 states the rule the technique
is named for: "City pages are the ONLY thing that goes to Layer 3." Lines 23-24 keep
the blog flat ("No `/blog/category/post` subfolders") and locate editorial hierarchy in
links, never depth. The seven rules at lines 42-50 are the technique's rule list in the
same order: three layers max, 3-click, URL equals hierarchy, hubs before spokes, one
page per keyword, sitemap mirrors the tree, indexes are real pages.

Two things in the spec are upward lessons this technique took. First, lines 29-38 put
the thank-you page **off-tree and mandatory** with four properties stated as deliberate
(noindex, out of the sitemap, out of the nav, exempt from the 3-click and orphan rules)
and the reason - "if it ranks, people land there without converting and the conversion
count becomes fiction". The technique carries this as the fifth line of its tree.
Second, lines 87-91 label the 3-click rule honestly: the engine "doesn't count slashes",
click depth is the signal, so the rule is "an engineering target for MONEY pages, not a
Google law", and nested-versus-flat city URLs is "the one real disagreement" settled
by consistency. The spec's own evidence tag is what let the technique write the rule as
convention with crawl-data support rather than as engine behaviour.

Lines 54-63 are the conditional-locations rule verbatim - a location page needs a
real address, and service-first (`/services/plumbing/toronto`) versus location-first
(`/locations/toronto/plumbing`) is "one road and never both". Line 67 is the doorway
warning that this subject hands to `local-page-doorway-prevention` rather than owning.

## The gate, and what it proves

`code/check_site_complete.py` is the `/build-website` exit gate ("The run is not done
until this passes", line 2). Its route discovery at lines 89-102 walks the app tree, or
crawls from `/` when `--base` names a foreign site (lines 69-86), so the same checks run
on an imported site. The pyramid enters the gate in three places:

- **Layer three is a city, hard-coded.** Line 197: `if route.startswith("/services/")
  and len(parts) == 3` - a three-segment services route *is* a city spoke, its hub is
  `parts[:2]` (line 198), and lines 199-211 demand the hub link down and the spoke link
  up. Line 261 treats a two-segment services route as a hub that must be linked from
  the services index. There is no branch for a four-segment route; a fourth layer is
  not rejected, it is simply invisible to the wiring check.
- **Written map rows derive their route from their title.** Lines 130-142 parse
  `## N. Service page: <title>` and, when the title matches `(.+?) in ([A-Za-z .-]+)$`,
  place it at `/services/<service>/<city>` - the map's naming convention *is* the
  pyramid's URL rule, and a written row with no live route fails (line 171).
- **Indexes are real pages.** Lines 223-256: `/blog` may not be an `<article>`, may
  not share its H1 with any post, `/services` and `/blog` may carry no `<form>` and no
  `$1,000`-shaped price, and the services H1 must contain "service". This is rule 7 of
  the spec and the hub definition at spec lines 97-101, enforced as page *type* rather
  than as a heading rename - the comment at lines 236-238 says why.

## Structural facts

**The gate enforces one of the two permitted stacks.** The spec allows location-first
for branch chains (lines 58-63); the gate's wiring check only recognises
`/services/<service>/<city>`. A site built location-first passes route rendering and
placeholder checks and receives no hub-spoke verification at all. Confirmed for the
default stack, a deviation for the alternative: the technique's "one stack, never both"
rule is held by the spec, not by the machine.

**"Three layers max" is not machine-checked.** Nothing in the gate fails a
four-segment route. The rule is held by the command that creates URLs ("check any URL
you are about to create against the tree", spec line 4) - a prompt-time gate, not an
exit-time one. The technique states the rule as a build constraint accordingly.

**The thank-you exemption is implemented, not merely documented.** Lines 71-72 and 95
skip `thank-you` in both discovery modes, which is exactly the "exempt from the 3-click
and orphan rules" property at spec line 32. The spec and the gate agree here, which
is rarer than it should be, and the technique's off-tree line rests on it.

**Redirects on restructure are owned by a command, not a check.** Spec lines 120-122
assign 301s for moved URLs to `/build-website`; no checker verifies old URLs resolve.
The technique's decision rule that a move ships with redirects before going live stands
as the standard; the pipeline's realisation of it is a prompt instruction.
