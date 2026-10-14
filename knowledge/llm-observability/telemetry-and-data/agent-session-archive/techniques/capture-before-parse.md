---
layer: technique
type: technique
subject: agent-session-archive
technique: capture-before-parse
status: forged
laws: [never-present-absence-as-an-answer]
shared_with: []
use_when: [deciding when an archive copies a transcript relative to parsing it, a harness changed its transcript format and sessions stopped appearing, pulling session history from another machine]
---

# Capture before parse

Separate the inventory of what will be read from the reading of it, and copy
the bytes of every inventoried source into the archive **before any parser
runs**. Each parsed conversation then records which capture it was derived
from. Whether a source is kept must never depend on whether today's parser
understood it.

## Why the parser may not decide what is kept

A parser of a third-party format is the component most likely to be wrong, and
its wrongness is quiet. A new record type is skipped, a renamed field reads as
absent, a format moved from line-delimited files to a database yields no files
at all. None of these raise an error. The signature of a format change is a
source that parses to **nothing**, and a pipeline that captures what it parsed
keeps nothing of exactly that source. While upstream still holds the file the
loss is recoverable by fixing the parser. After the harness's retention window
passes, it is not. The one failure capture exists to survive is the one a
parse-gated capture is guaranteed to miss.

The same holds for partial parses. A parser that drops a third of each
transcript's records, because it does not recognise tool results, produces
sessions that look complete. If the archive kept only what was parsed, the
fix ships into a world where the dropped records no longer exist anywhere.

## Procedure

1. **Inventory with the parser's own discovery rules, but without its
   semantics.** Enumerate source files using the same root expansion, filters
   and deduplication the parser will use, so the inventory and the parse
   cannot disagree about scope. Include sidecars a reconstruction needs, not
   just the primary log. The inventory reads file metadata and nothing else.
2. **Copy bytes, verbatim and addressed.** Store each source as chunks
   addressed by their content digest, and record the source's identity, size,
   digest and capture time in a manifest. Chunking makes repeated captures of
   an append-only file cheap (see
   [prefix-proof-retirement](./prefix-proof-retirement.md)).
3. **Parse, and stamp the capture on every record.** A conversation derived
   from a source carries the identity of the capture it was read from, so a
   later re-derivation knows which bytes to read and a reader can ask whether
   what they are looking at still has its source.
4. **Keep a re-derivation path that reads captures, not upstream.** After a
   parser fix, the archive re-parses from its captures, including sources the
   harness deleted months ago. This is the test of the whole technique: index
   once, delete the upstream file, change the parser, and re-derive.

Capture does not need the source to be finished. A transcript still being
appended can be captured now and captured again later, and the older copy
retires once the newer one is proven to contain it. Parsing a file still being
written is the hazard; copying it is not. Defer the parse, never the copy.

## Cadence is set by the deletion horizon

A capture that runs less often than the harness deletes is a capture with a
hole in it. Schedule capture on an interval that is a small fraction of the
shortest retention window the harness allows, not the window it defaults to,
because a user can shorten the window to a day without the archive knowing.
Where the harness offers a callback at the end of a session that names the
transcript path, capture there as well: it is the earliest moment the file is
complete, and it costs one copy. Report which sources are within a safety
margin of the deletion horizon and have no verified capture; that list is the
archive's real exposure, and it is the number to alarm on.

## The boundary case: a capture that scales by skipping

The tempting optimisation for a large store is to skip the pre-parse capture
when there are too many files, and let capture happen per parsed conversation
instead. On a store of tens of thousands of transcripts, the threshold is
crossed on every run, and the technique has been switched off for exactly the
installations that need it: a file that parses to no conversations is never
captured. **Throttle capture by rate, never by a condition on the parse.**
Spread a large backlog across runs with a byte budget per run, order the
backlog by deletion risk (oldest upstream modification first), and report the
backlog. A slow capture that reaches every file eventually is a capture; a fast
one that skips the files the parser cannot read is a parse log.

## What is never captured

Some stores hold more than transcripts. A local database that also keeps
credentials, approval records or application settings is not copied wholesale,
because the copy would carry the parts the archive deliberately leaves out.
For those, read the conversation content in place and report the store as
excluded from capture, by name, so the absence is a stated policy rather than a
gap. Exclusions that an operator configures are enforced at the capture
boundary and again at the index boundary; see
[queryable-surface-redaction](./queryable-surface-redaction.md) for why one is
not enough.

## Other machines: additive, namespaced, same readers

History from another machine is captured the same way, with one more rule:
**the transfer never deletes.** A synchronisation that mirrors deletions turns
a misconfigured, unmounted or freshly wiped remote into an instruction to erase
local copies, and it does so on the run that looks most routine. Pull into a
namespace per remote, so two machines' identical paths cannot collide, and parse
the pulled bytes with the same readers as local sources, so a remote session is
not a second-class record with its own bugs. The origin is stamped at ingest and
becomes part of identity, and a remote workspace path rewritten to a local
equivalent keeps its original value; both are
[root-relative-session-identity](./root-relative-session-identity.md).

## When not to use it

If the archive is honestly a convenience view over sessions the harness keeps
indefinitely, under a retention setting you control, capture duplicates what
upstream already guarantees. Say so in the archive's documentation and treat
the store as a cache. The moment that guarantee is not yours, it is not a
cache. And do not extend capture to stores whose bytes you must not hold: an
opt-out that disables capture is legitimate, provided it names its price in
plain words: from then on, a session the harness deletes is gone from
everywhere, and the archive's rows are the last trace of it.
