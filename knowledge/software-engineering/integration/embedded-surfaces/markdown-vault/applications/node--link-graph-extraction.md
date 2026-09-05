---
layer: application
type: application
subject: markdown-vault
technique: link-graph-extraction
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@22
---

# Link graph extraction in Foam, the second stack (Node/TypeScript)

*Verified against `foambubble/foam` at `3452c984a7f5d62fbabfa7ed800263aa3c48dfb0`
(2026-08-13). Monorepo declares `engines.node >= 22` and TypeScript `^5.8`; the
graph lives in `packages/foam-core`.*

The subject was forged from a single Rust tree, so every claim in
[link-graph-extraction](../techniques/link-graph-extraction.md) was one
implementation's claim. Foam is an independent implementation — different
language, different runtime, different editor host, no shared lineage — that
solves the same problem. It agrees with the technique on the two things the
technique cares most about, and it **disagrees on the resolution model, on how
links are located in the source, and on what an unresolved link is.** Those three
disagreements are the reason this file exists.

## Agreement: one extractor, one resolution semantics

`packages/foam-core/src/services/markdown-link.ts` is a single abstract class,
`MarkdownLink`, with two regexes and one entry point (`analyzeLink`, `:13`),
consumed by the graph, the preview renderer, the rename service and the
completion provider alike. Its sibling `link-integrity.ts` uses the same
decomposition to rewrite links on rename. There is one normalizer in the
workspace (`workspace.ts:528`) and one resolver
(`markdown-provider.ts::resolveLink`, `:88`). The technique's structural claim —
that link resolution is a vocabulary needing one authority — is what a second
independent implementation converged on without contact.

## Disagreement 1: identifiers are path suffixes, not basenames

The technique says links "name targets by note title, resolved
case-insensitively against an index of every note's basename". Foam's index is
not a basename index. `FoamWorkspace` stores resources in a trie keyed by the
note's path **with its segments reversed** (`getTrieIdentifier`, `:350-365`), so
a prefix search in that trie is a *path-suffix* search over the vault. `[[bar]]`
matches any note whose path ends in `bar`; `[[zoo/bar]]` narrows it to those
ending in `zoo/bar`. Basename lookup is the one-segment case of a general
scheme, not the scheme.

The inverse operation is the giveaway: `getShortestIdentifier` (`:480-509`) walks
reversed path tokens until the candidate set empties, producing the *minimal
unambiguous suffix* for a note. That is the function a writer's link text is
supposed to contain, and it exists because the resolution model is suffix-based.
A basename index has no such inverse.

Duplicate titles are handled one layer up from where the technique puts them.
`listByIdentifier` (`:266-291`) returns **all** matches, filters to exact-case
matches when there is more than one, and sorts by path; only `find` (`:373`)
collapses that to `[0]`. So the ambiguity survives as data through the API and
is discarded at the last possible moment — which is what lets a completion UI
offer both candidates and a linter report the ambiguity as its own finding,
rather than each re-deriving it. The technique's "the resolver picks a
deterministic winner" is true of Foam's final step and misleading about its
design: the winner is picked once, at the top, and the ambiguity is preserved
everywhere below.

There are also two resolution rules the technique has no counterpart for:
a directory identifier resolves to that directory's index note, with a declared
`index` > `readme` priority (`_directoryIndex`, `:36-40`, `:171-183`), and
multi-root workspaces resolve a vault-absolute path against each root in
priority order (`find`, `:385-394`).

## Disagreement 2: locate by structure, decompose by pattern

The Rust tree extracts links by scanning text with a regex. Foam does not scan.
`markdown-parser.ts` builds a real markdown AST (`unified` + `remark-parse` +
`remark-wiki-link` + `remark-frontmatter`) and the link plugin visits **typed
nodes** — `wikiLink`, `link`, `image`, `linkReference` (`:717-797`). Regex
appears only afterward, inside `analyzeLink`, decomposing the `rawText` of a
node the parser has already certified as a link.

That layering deletes a false-positive class rather than filtering it. Content
inside a fenced code block or an inline code span is a `code`/`inlineCode` node,
which the link visitors never match, so a wikilink written as an example in
documentation is not an edge — asserted directly by
`markdown-parser.test.ts:121` ("should skip wikilinks in codeblocks") and `:137`
(inline). A regex extractor reports both as edges, and then as broken links,
and the human cannot make the finding go away without editing correct prose.
Footnote references arrive as `linkReference` nodes and are excluded explicitly
with the reason in place (`:775-782`).

The same tree shows the cost side honestly: this is five link node types, a
reference-definition resolution pass, and an embed sigil recovered by reading
the character before the node's start offset (`:722`) because the wikilink
plugin does not model embeds. Parsing is not free; it is correct.

## Disagreement 3: an unresolved link is a node, not a flagged edge

The technique says "unresolved links are still edges". Foam makes the *target* a
first-class node: an unresolved wikilink resolves to `URI.placeholder(target)`
(`markdown-provider.ts:120`), a URI in its own `placeholder` scheme
(`uri.ts:99-102`, `:201-202`), and `FoamGraph` keeps a `placeholders` map
alongside `links` and `backlinks` (`graph.ts:21-29`). Placeholders have
backlinks. They appear in `getAllNodes`. They are garbage-collected when their
last backlink disappears (`disconnectResource`, `:234-237`).

The consequence the technique misses is what this costs to maintain
incrementally. When a note is **added**, it may fill a placeholder — and every
note that linked to that placeholder now resolves somewhere else. Resolution
cannot be cheaply inverted, so `onResourceAdded` re-resolves the sources of
every existing placeholder (`reconnectAffectedPlaceholderSources`, `:174-182`).
Deleting a note is the mirror: its former backlinks are exactly the sources that
must be recomputed (`onResourceDeleted`, `:151-156`). A full rebuild hides this
entirely; the fan-out exists only once the graph is maintained in place. Seven
equivalence tests pin incremental output against a rebuild
(`graph-incremental.test.ts`), including two rename cases.

## The debounce finding

The subject tells the application to debounce change events into batches. Foam's
graph does the opposite, deliberately, with the reason at the call site
(`graph.ts:87-90`): the incremental handlers are "NOT debounced: debouncing
coalesces events, but incremental updates need every event (each carries a
distinct diff to apply)." Debounce is correct for a consumer that responds by
recomputing from scratch — coalescing ten events into one saves nine rebuilds.
It is wrong for a consumer that responds by applying a diff, because the nine it
drops were the diffs. This is a genuine correction to the technique's blanket
advice and has been carried upstairs.

## What this tree does *not* validate

- **Normalization.** `normalize` is `v => v.toLocaleLowerCase()`
  (`workspace.ts:528`) — locale-sensitive, with no Unicode canonical
  normalization anywhere in the repository (`grep` for `normalize('NF`/`NFC`/`NFD`
  across all packages returns nothing). So on a filesystem storing decomposed
  filenames, a link typed in composed form is not guaranteed to resolve. This
  tree is evidence that the gap is *easy to ship*, not evidence that case-folding
  suffices; the technique's normalization step was corrected from the literature,
  not from here.
- **Orphans.** Foam has placeholders and ambiguity reporting, but no orphan
  detector in core, so its treatment of the exemption-predicate problem is not
  testimony either way.
- **Cache honesty.** There is no TTL-bounded graph cache to compare against the
  Rust tree's: Foam maintains the graph incrementally from editor events instead,
  which is a different answer to the staleness question and inherits the
  watcher's blind spots rather than bounding them.
