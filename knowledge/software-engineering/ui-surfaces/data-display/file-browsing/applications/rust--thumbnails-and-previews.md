---
layer: application
type: application
subject: file-browsing
technique: thumbnails-and-previews
stack: rust
verified_on: 2026-09-20
verified_against: rust@1.80
---

# Thumbnails and previews — the Drive Finder's thumbnail service

The Finder's thumbnails are produced in the native process, never in the
view: `src-tauri/src/commands/drive/thumbs.rs` decodes, downsizes, encodes
and caches, and the view receives bytes. The module header states the whole
contract in its own first fourteen lines — sizes, cache location, key shape,
failure markers, budget — which is unusual, and is why every obligation below
has a named owner rather than a comment apologising for its absence.

## The cache key names the recomputation

`cache_key` (line 71) builds `<hash(rel_path)>-<mtime_secs>-<size>-<edge>`:
identity, plus two independent content-version signals, plus the requested
size. Every component is load-bearing and the test says so —
`cache_key_shape_and_slash_normalisation` (line 306) asserts that
changing the path, the modification time, the byte size or the edge each
produce a different key. Path separators are normalised first so the same
entry reached two ways shares one key.

The size belongs in the key because one file at three preview sizes is three
derivations: `THUMB_EDGES` (line 26) is the closed set `[96, 256, 1024]` and
`clamp_edge` (line 55) snaps any request to the nearest, ties rounding up, so
a caller cannot mint an unbounded family of cache entries by asking for 97.

The same key formula appears again one tier up, in the view's hot cache:
`src/features/plugins/drive/finder/views/thumbCache.ts` builds
`` `${entry.path}|${entry.modified}|${entry.size}|${edge}` `` from the same
four fields. Two tiers, one notion of staleness — which is what keeps the
nearer cache from serving pixels the farther one has already invalidated.

## Failure is cached, with a shorter life

The gap this corpus names in the sibling gallery application — a corrupt file
re-decoded on every scroll pass — is closed here. `produce` (line 204) checks
for a `.fail` marker beside the entry before attempting a decode;
`read_fail_marker` (line 149) returns the remembered reason if the marker is
younger than `FAIL_TTL` (line 38, 24 hours) and *deletes it and reports
absent* if it is older, so expiry is a side effect of the read rather than a
sweep somebody has to schedule. A decode failure writes the marker and
returns the classified reason (line 227). The round trip and the expiry are
both pinned by `fail_marker_roundtrip_and_expiry` (line 342).

Note the two TTLs are different objects: a successful thumbnail is invalidated
by its *content version* (it never expires on a clock), while a failure is
invalidated by *time*, because the reason a decode failed may be the
decoder's rather than the file's.

## The cache names its reaper

`BUDGET_BYTES` (line 34, 256MB) and `EVICT_TARGET_BYTES` (line 35, 224MB) are
declared next to each other with the hysteresis reason in the comment — "so
one write past the line does not evict on every subsequent call".
`evict_to_budget` (line 170) runs after every successful write, reads the
directory once with metadata only, sorts by modification time and deletes
oldest-first until the total is under target. `touch` (line 141) bumps a
cache hit's mtime so the mtime ordering doubles as recency: a least-recently-
used eviction with no separate index to keep consistent. The view tier names
its own reaper too — `THUMB_CACHE_MAX = 300` object URLs, with the evicted
entry's URL revoked rather than merely dropped.

## Decoding is guarded, off-thread, and atomic on the way out

- **Guardrails, not hope.** `MAX_SOURCE_DIM` (line 45) and
  `MAX_DECODE_ALLOC` (line 46) are installed on the decoder before the
  header is trusted (lines 99–104), so a decompression bomb is refused by
  arithmetic instead of by the allocator. The technique's "possibly hostile,
  possibly gigabytes" is a configured limit here.
- **Off the interactive path.** Everything after path resolution runs in
  `spawn_blocking` (line 266); the command itself is async and the view is
  never blocked by a decode.
- **A reader never sees half a file.** `write_atomic` (line 123) writes a
  sibling temp file and renames, and treats a lost rename race as success
  when the destination now exists — two callers producing the same key is a
  normal event, not an error.
- **Kind gates the rung.** `is_thumbable_ext` (line 50) admits five raster
  formats and anything else returns a validation error rather than an
  attempted decode — the taxonomy deciding which items may climb past the
  kind icon, which is where that decision belongs.

## Never larger than the source

The rule this file contributed to the technique is four lines long
(lines 106–111): resize only when `decoded.width() > edge ||
decoded.height() > edge`, otherwise re-encode at the source's own size. The
comment names the trap — "`resize` upscales as readily as it downsizes; a
thumbnail must never be larger than its source" — and
`decode_to_jpeg_downsizes_and_keeps_aspect` (line 325) pins both directions:
a 400×200 source at edge 96 becomes 96×48, and a 40×20 source at edge 96
stays 40×20. Without the branch the second case goes through the same
`resize(96, 96)` as the first and comes back 96×48 — more bytes than the
original, and blurrier than showing the original untouched. That is the
defect the branch was written against.

## Derived data emits no change event

The module header closes with the line that keeps the refresh cycle from
feeding itself: "Thumbnails are derived data, so nothing here emits a drive
event." A cache write that announced itself as a store change would make
every thumbnail generation look like a mutation of the folder being browsed,
and the listing would refresh in a loop it started.
