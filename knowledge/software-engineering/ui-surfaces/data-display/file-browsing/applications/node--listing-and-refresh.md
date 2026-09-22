---
layer: application
type: application
subject: file-browsing
technique: listing-and-refresh
stack: node
verified_on: 2026-09-20
verified_against: node@24
---

# Listing and refresh — the registry indexer's read layer

Ascent indexes a knowledge registry by walking a repository tree it does not
own, over an API that can truncate, and renders what it found in a Knowledge
tab. `src/lib/registry/index-walk.ts` is the read contract, deliberately
split out as the pure half of `index-registry.ts` — "given a tree, which
blobs are artifacts, and how do we read one without letting a 40MB 'skill' or
a 20k-file repo blow the request budget" (header comment). It is the
technique's read contract with almost nothing left out, plus two instructive
places where the disclosure half is thinner than the detection half.

## Selection is a declared exclusions policy, applied once

Every lane has a predicate, and every predicate states the *shape* it accepts
rather than just the name: `isArtifact` (line 53) requires exactly three path
segments so "a nested stray" is never mistaken for an artifact; `isMemoryNote`
(line 59) additionally drops any underscore-prefixed file, which is how the
generated index excludes itself; `isUsageFile` (line 77) and `isSignalsFile`
(line 104) each require exactly one level and one extension "so a README or a
nested stray in the lane is not mistaken for a contribution". `isBundleIndex`
(line 91) is the strongest case for the policy being a *decision* rather than
an accident: a bundle is ~1,000 markdown documents, and the walker
deliberately selects the one generated summary instead, because "indexing
those would blow the file cap and tell us nothing the index does not".

The policies live in one module that every reader calls. The technique's
warning — parallel walkers drifting on exactly this, one skipping hidden
files and another only hidden directories — is structurally prevented here
rather than remembered.

## Caps and per-entry failures are counted, never silent

`selectArtifacts` (line 133) takes a `warnings: string[]` and its inner
`take` helper (line 135) pushes one before truncating:
`${label}: ${hits.length} files exceeds the ${MAX_INDEXED_FILES} cap — only
the first ${MAX_INDEXED_FILES} were indexed`. The doc comment states the law
in the technique's own terms: exceeding a cap is reported "because a silently
short index is indistinguishable from a registry that lost files".

`cappedReader` (line 169) is the per-entry half. An oversized blob pushes
`"…KB exceeds the …KB cap — skipped"` and returns `null`; a throwing read
pushes `"…: could not be read (<message>)"` and returns `null` (lines
176–185). Neither aborts the pass — the function's own comment says why: "so
one unreadable file can never abort the pass". That is skip-and-count-then-
disclose implemented exactly, and it is pinned by
`index-registry.test.ts` lines 138–139 and 191, which assert a warning per
skipped path and a warning containing "exceeds the … cap".

The store's own truncation is disclosed rather than inherited silently:
`index-registry.ts` line 195 turns a truncated tree response into
`"GitHub truncated the file tree — this index is partial."`, and line 298
turns a persistence-off pass into `"N artifacts were read and parsed but not
mirrored — persistence is off."`. A capped listing, a partial listing and a
listing that was never written are three facts with three sentences.

## Where the disclosure thins: the count survives, the reasons do not

`POST /api/org/:slug/registry/index` returns `warnings: result.warnings ?? []`
in full (`src/app/api/org/[slug]/registry/index/route.ts` line 42), so the
reasons cross the wire. The surface then drops them:
`src/features/shared/registry/RegistryActions.tsx` lines 97–99 take
`d.warnings.length` and append `· N files skipped` to the success toast.
Nothing renders *which* files, or why.

That is the technique's rule honoured at the read layer and lost at the last
step, and the cost is visible in the file itself. `MAX_BUNDLE_INDEX_BYTES`
(line 163) is an 8MB ceiling that exists only because the shared 256KB
`MAX_FILE_BYTES` was applied to a class of entry it did not fit; the comment
carries the project's own measurement — "a 229-subject bundle measured 1.3MB
(2026-09-16) and was silently skipped under 256KB, which left the Knowledge
tab without its largest bundle" — and `index-registry.ts` line 332 now builds
a second reader, `cappedReader(source, warnings, MAX_BUNDLE_INDEX_BYTES)`,
for that lane alone. Whatever the warning said at the time, the sentence a
reader could see was "N files skipped" — not one anybody can act on, and not
one that names a bundle. That is why the largest bundle read as missing
rather than as skipped.

Two things generalize. A cap sized for hand-written entries excludes
generated ones *preferentially*, because generated entries are the ones that
grow with the corpus — so what a shared cap removes is correlated with what
the surface most needs. And a disclosure is only as good as its narrowest
hop: counted at the walker, carried by the transport, collapsed at the
render, it ends up indistinguishable from silence.

## The gap: a second reader that collapses the zero cases

`readFileAtRef` in `src/lib/registry/read.ts` (line 150) reads one path at a
past commit for the history timeline, and returns `null` for absent,
unreadable, oversized and wrongly-encoded alike (lines 162–168), with no
warning channel at all. The comment defends it — "so a commit that predates
the file resolves to 'no version' rather than failing the timeline" — and for
*absent* that is right. For *oversized* it is the technique's named defect: a
file that exists and is merely too big renders identically to a file that did
not exist yet, so the timeline reports the corpus gaining a document later
than it did. The module holds two readers with two error policies, and only
one of them can tell its zeroes apart.

## Refresh is explicit, and the previous listing survives a failed one

There is no watcher and no poll. The refresh is the re-index the route
performs on demand — "re-read the mapped registry at HEAD and rebuild the
mirror rows" (route header) — with the read failure mapped to a 502 whose
contract line states the invariant: "the tree could not be read; the previous
index survives". The surface reads the mirrored rows, so the staleness window
is "as of the last successful index", which is a stated property rather than
an accident, and a failed refresh degrades to the older listing instead of to
an empty one. Manual refresh as the only strategy is the technique's floor,
not its ceiling; what makes it honest here is that the window is named and
the failure does not erase.
