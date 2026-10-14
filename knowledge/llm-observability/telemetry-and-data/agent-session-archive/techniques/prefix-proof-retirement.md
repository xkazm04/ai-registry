---
layer: technique
type: technique
subject: agent-session-archive
technique: prefix-proof-retirement
status: forged
laws: []
shared_with: []
use_when: [an archive of transcript captures is growing faster than its content, choosing what automatic retention may delete from a store of captures, the capture store hit its byte budget]
---

# Prefix-proof retirement

Automatic retention may retire an older capture of a source only when a newer,
retained capture of **the same source** is verified to contain every byte of
the older one as a prefix. When the store reaches its byte budget, admission of
new captures pauses and nothing is evicted. Retirement by age, size or a
keep-the-last-N count stays an explicit operator command that says what it
destroys. Automatic maintenance never removes bytes nothing else holds.

## Do the arithmetic first

Two growth rates hide inside one disk-usage number, and they want different
answers. The first is **content growth**: what the harness writes. One
installation measured 4.8 GB written in seven days, which is about 250 GB a
year if all of it is kept. No deduplication touches that number, because those
bytes are new; it calls for an operator decision about budget, compression or
colder storage, made with the figure in hand. The second is **capture
amplification**: what the archive writes on top of the content by capturing
the same growing file repeatedly. A session captured k times while it grows
stores about k/2 copies of itself if each capture is a whole-file copy. That
growth is pure waste, and it is the one this technique removes.

The arithmetic also says where the machinery must reach. On the same
installation the store averaged about one megabyte per transcript. A chunking
scheme that applies only to files above several megabytes never touches the
typical session, and the amplification it was built to remove continues at
full rate below its threshold. Size the chunk to the transcript population,
not to the largest file: the duplicated tail a recapture writes is bounded by
one chunk, so the chunk size is the waste per recapture.

## Why a prefix, and why proof

Append-only transcripts make most recaptures supersets of their predecessors,
so most old captures are fully contained in the newest one and can go. Not all.
A harness that compacts, forks, rewrites or truncates a session file leaves the
old capture holding bytes the new one does not have, and once upstream has
deleted the file, that old capture may be the only copy of them on earth. Age
cannot tell these two cases apart; neither can size, or a count of captures per
source. Only a byte-level comparison can, so retirement is a proof, not a
policy.

The proof has three parts. **Same source:** the two captures agree on harness,
origin machine, source identity and original path. Two machines that share a
relative path must never retire each other's history. **Verified content:**
both captures' chunks are re-hashed and checked against their addresses before
anything is compared, because a corrupt chunk proves nothing. **Prefix:**
complete chunks compare by address; the changed tail compares byte by byte in
bounded buffers. The proof needs only the two captures, so it works after
upstream is gone, which is when it matters.

A truncation, a rewrite, an origin mismatch or a failed verification is not
proof. Those captures stay.

## The budget is an admission bound

A byte budget on the capture store is the natural control and the natural
trap. Read as "evict until under budget", it selects its victims from whatever
retirement could not prove, which is precisely the rewritten histories and the
sources upstream already deleted: the unique evidence. So the budget governs
**admission only**. When it is reached, new captures pause, the pause is
reported as a state with a count of the sources it is holding back, and the
operator decides. The pause must be loud. Upstream keeps deleting while capture
is paused, so a silent pause is the same data loss as eviction, arriving one
retention window later. A default budget smaller than a realistic archive is a
pause on day one; set the default from measured archives, and report the
headroom.

## Protections that do not depend on the proof

- **Keep the newest captures per source,** at least two, so a newer capture
  that is itself damaged never leaves a source with only that one.
- **Hold down young captures.** A capture younger than a few hours is never
  retired: its successor may be racing an append, and a proof against a
  half-written capture is a proof against the wrong bytes.
- **Never auto-select what the policy does not recognise:** orphaned chunks,
  abandoned staging files, captures tagged by an operator, records in a layout
  the current code did not write. Unknown is not disposable.
- **Log every retirement with its proof,** so the store can show, for any
  missing capture, which capture contains it.

## Explicit eviction

Age, size and count rules are legitimate operator tools. They run as a
command, preview first, and the preview counts the bytes that no other capture
contains, separately from the bytes that are merely duplicated. An operator who
is about to destroy unique evidence must be told so in that number, before the
command applies.

## When not to use it

Sources that are rewritten in place rather than appended, such as a database
file, rarely produce prefix relationships; for them, chunk-level deduplication
still removes unchanged regions, and retention falls back to a keep-N policy
the operator chose, stated as such. And where the arithmetic says the whole
archive fits comfortably for years, keep everything and revisit at a stated
threshold; the proof machinery earns its place when captures are frequent.
