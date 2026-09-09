---
layer: application
type: application
subject: on-page-and-metadata-craft
technique: mechanical-layer-only-never-the-copy
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# The copy rule of an SEO command pipeline: an enumerated boundary, a count, and a deletion gate

The open SEO agent (seven slash commands plus reference specs; commit
`a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06) states the technique three
times - once as a hard rule in its root instructions, once at the top of its audit
command, once at the top of its fix command - and each statement carries the same two
enumerated lists, the same one-question test and the same altered-sentence count. It is
the source of the technique's shape, and it proves a structural fact the draft had only
asserted: the rule is only enforceable because it is stated as *lists*, not as a
principle.

## Where the rule lives

- `CLAUDE.md:47` - the root hard rule, marked CRITICAL: audits and fix passes change
  "title tags, meta descriptions, alt text, heading TAGS, schema, canonicals, link
  anchors, image files, slugs, broken markup" and "do NOT touch body sentences - not
  for flow, not for clarity, not for keyword density". The test is stated verbatim:
  "mechanical SEO problem, or me writing? If it's the second, stop." Pages needing
  content route to the writing commands "where the user approves the draft". The
  sentence count closes it: "Report the count of body sentences altered after any fix
  pass - zero is the expected answer."
- `.claude/commands/audit.md:14-37` - the same rule expanded into the two lists. May
  change (lines 18-24): titles and descriptions "for Google, not readers", alt text,
  heading tags "the tag, not the words inside it", a missing keyword "where it fits
  naturally in the sentence that's already there", schema, canonicals, anchors, image
  formats, file names, slugs, genuinely broken things. May not (lines 26-30): "Any
  sentence in the body copy, for any reason", stories, asides, "the order or structure
  of an argument", anything "just because it reads better your way".
- `.claude/commands/audit.md:34` - the veto mechanism: the smallest insertion, keep
  every other word, show before and after. `:36` - the pass "confirm[s] in the report
  that the copy survived intact - state how many body sentences were altered".
- `.claude/commands/seo-optimization.md:10-30` - the fix command repeats the boundary
  and adds the upward lesson the draft lacked (below).

## The deletion gate, and the waiver that makes the loop terminate

- `.claude/commands/audit.md:40-59` - "you delete nothing": not a thin page, a
  duplicate, an orphan, a 4 MB hero, an old post. Each has a non-deletion fix (lines
  44-50), removal is a recommendation with four fields (`:52-53`) grouped under "Needs
  your approval to remove" (`:55`), and redirects and consolidations "count as
  deletions - same approval" (`:57`).
- `.claude/commands/audit.md:63-90` - the waiver rule: three types only (platform
  limit, crawler artifact, owner decision), each with evidence, and two scores always
  shown (fixable, denominator excluding waivers; raw, waivers as failures). Without
  this the loop to 100 "either runs forever or the finished job looks failed".

## The upward lesson: "how it loads" is not "whether it stays"

`seo-optimization.md:16-22` and `:32-36` exist because an earlier run treated deferring
a script and inlining a font as deletions, refused them under the deletion rule, and
"end[ed] with an unchanged score and nothing to show for it". The command now says
explicitly that swapping how an asset loads - defer, preload, lazy-load, self-hosted
font, inlined critical style - is mechanical and in scope, and that the deletion rule
"is about REMOVING things from the page, never about how they load". The draft's
may-change list now carries the loading lever as its own item, taken from this incident.
A second lesson at `:24`: a flat performance score must be explained (blocked, noise
with three run values, or at ceiling), never reported bare.

## Where the tree confirms the checklist as the floor

`references/on-page-seo.md:8` sets the fix scope in one line - "Fix only the failed
items, smallest possible edit, body copy and voice untouched" - and `:145-149` has the
audit report fails "named and located" so the fix is surgical. The 80 checks
themselves (`:14-137`) mix mechanical items with copy items (section 5 grades length
against the top three; section 13 grades named proof), which the copy rule resolves by
waiver-and-route rather than by edit: `seo-optimization.md:75` lists "needs something
only I can provide - a photo, a credential" as a waiver reason.

## Deviations

- The boundary is enforced by instruction only. The pipeline is a prompt over a file
  tree with no schema between the fixer and the page; nothing structural stops a body
  block from being rewritten, and the sentence count is self-reported by the same agent
  that made the edits. The technique's decision rule - give an automated fixer a schema
  with no field for body blocks - is the standard the tree falls short of.
- `on-page-seo.md:16,19` carry "50-60 characters" and "140-160 characters" without
  saying the engine cuts by width; the copy rule is honest, the length rule is a proxy
  presented as the mechanism. See the pixel-budget application for the tree that does
  it honestly.
