---
layer: golden-path
type: golden-path
subject: agent-session-archive
status: forged
use_when: [keeping coding-agent transcripts that a harness deletes on its own schedule, building search or replay over local agent session history, deciding what an archive of third-party transcripts may delete, citing an archived session from a lesson or a memory]
techniques:
  - capture-before-parse
  - prefix-proof-retirement
  - root-relative-session-identity
  - declared-message-coordinates
  - queryable-surface-redaction
  - ingest-disposition-accounting
---

# Agent session archive

A coding-agent harness writes a transcript of every session to a store on the
machine it runs on: one append-only file per session, or a local database, in
a layout and record format the harness chooses and changes between releases.
An agent session archive is the system that keeps those transcripts after the
harness is done with them, turns them into something searchable, and serves
them back to people and to agents as evidence. Three facts about the source
define the subject, and they all point the same way: **a third party writes
the records, owns their format, and deletes them on its own clock.** Nothing in
the archive's design may assume the source will still be there, still be in
the shape it was, or still be where it was.

The deletion is not hypothetical. One installation measured on a single day:
the harness keeps transcripts for a default window of thirty days and then
deletes them; the documented minimum is one day, and no setting disables the
cleanup. The store held 17.1 GB in 16,525 files, and the most recent seven days
alone had written 4.8 GB, so keeping everything raw grows at roughly 250 GB a
year. A process cache on the same machine had kept only the structure of each
session: of the 3,705 sessions it remembered, 1,773 (48%) had transcripts the
harness had already deleted. Their structure survived. Every question nobody
thought to ask when that structure was extracted is now unanswerable, because
the bytes it would have been answered from are gone. That ratio is the subject
in one number: **a derivation kept in place of the source is a bet that you
already know every question you will ever ask.**

## Where this subject stops

The bundle's boundary contract names its own force as receiving traffic you
did not emit, on clocks you do not own, and this subject is the at-rest form of
it. The in-flight form belongs to the sibling
[multi-provider-event-normalization](../multi-provider-event-normalization/multi-provider-event-normalization.md):
it maps wire events from many senders onto one model as they arrive, and it
preserves the raw provider strings so a mapping can be redone. It keeps no raw
bytes, because a wire event has no at-rest source that can vanish. A transcript
does. Per-harness usage extraction stays with that sibling's usage-extractor
technique; the archive feeds it and does not restate it. The sibling
[analytics-store-design](../analytics-store-design/analytics-store-design.md)
owns the fact table of normalized calls; an archive's normalized store is a
record of conversations, and the questions it answers are about what was said
and done, not about what it cost.

On the engineering side, the neighbour that owns trace capture emits its own
records and names its own reaper. Here the reaper belongs to somebody else and
the archive's job is to outrun it. The neighbour that owns entity versioning
thins history the system created, and its rule of doing the arithmetic before
the engineering holds here unchanged; what it lacks is a source that can vanish
from outside. The neighbour that keeps a companion's self as files with a
database as an index has the right inversion, files true and index derived, but
there the system owns the files. Incremental scanning owns the ledger of
identity, fingerprint and ruleset version, and this subject adds the writer
that is still appending while the scan reads. Distilling sessions into durable
memories or lessons belongs to agent memory, and ranking over the archive
belongs to retrieval. Redacting what crosses to a hosted third party belongs to
the outbound telemetry-redaction neighbour, whose force is a change of custodian;
this subject's redaction force is amplification by its own index.

The rule a reader uses to pick: **ask who deletes the source.** If your own
system does, on a schedule you set, you have a retention problem and a
neighbour owns it. If a third party does, on a clock you cannot change, you are
here.

## Once upstream prunes, the archive is the record

The naive design calls the archive a cache: a faster, searchable view of
transcripts that live somewhere else. That is true for exactly as long as the
harness keeps the source, and then it silently stops being true. The class of
a store is not fixed when it is designed. **An external deletion promotes a
cache into the record**, without a migration, a config change or anyone
noticing, and every operation that was safe on a cache, from a cleanup script
to a rebuild that starts by deleting the old store, becomes data destruction.

So the archive declares its layers by what they can be rebuilt from. The
verbatim capture of each source has no other source once upstream prunes, so it
is the record. The normalized store of conversations and messages is a
projection of the capture, re-derivable by parsing it again; where no capture
is kept, the normalized store is promoted into the record and inherits its
protections. Every search index, embedding set and rollup is a projection of the
normalized store with a named rebuild path. Three consequences follow. Cleanup
carries a written list of what it may never delete, and the list names the
capture and the normalized store, not just "user data". A rebuilt index proves
the index, never that the sessions under it are recoverable from upstream.
And a backup carries the record and states, in its own receipt, which
projections it omitted and the command that rebuilds them.

## The techniques, in the order a session meets them

**Bytes before meaning.** The parser is the most fragile component in the
archive, because the format it reads is somebody else's and changes without
notice. Its characteristic failure is not an error: a format change makes it
produce nothing. If keeping a source depends on parsing it, the change that
breaks the parser also discards the evidence needed to fix it, and once
upstream deletes, the loss is permanent. Inventory first, copy the bytes
second, parse third, and never let today's parser decide what is kept.
History from another machine follows the same rule through an additive pull
that never propagates a deletion. That is
[capture-before-parse](./techniques/capture-before-parse.md).

**Retention that cannot destroy evidence.** Transcripts are appended to, so
successive captures of one session are mostly the same bytes, and a store that
keeps every capture grows by multiples of the content. The fix is not age
eviction. An older capture may be retired automatically only when a newer
capture of the same source provably contains every byte of it; when the byte
budget is reached, capture pauses and nothing is evicted, and age, size and
count rules remain explicit operator commands. That is
[prefix-proof-retirement](./techniques/prefix-proof-retirement.md).

**Identity that survives the scanner.** Two ingest paths that root the same
file differently produce two sessions. Two machines that share a relative path
merge into one. A harness that moves its own layout produces one native session
id under two roots. Identity is the origin machine, the harness, and the path
relative to the harness's own store root, computed at one chokepoint, and a
move is honoured only with proof. That is
[root-relative-session-identity](./techniques/root-relative-session-identity.md).

**Citations that resolve to one message.** Normalization drops records, so a
message's position in the archive and a line in the source file stop agreeing
on the first dropped record. A citation names its coordinate space, binds the
conversation's identity, and fails rather than substituting a neighbour. That
is [declared-message-coordinates](./techniques/declared-message-coordinates.md).

**Redaction where content is re-served.** An index re-serves every stored
string to every later caller. Precise credential-shape rules belong on the
irreversible ingest stage, noisy recall-oriented scanners on the reversible
pre-share stage, and the verbatim capture is declared sensitive at rest rather
than redacted, because redacting it would defeat the reason it exists. That is
[queryable-surface-redaction](./techniques/queryable-surface-redaction.md).

**An account of every source.** "Found 312 sessions" is silence about the ones
not found. Every inventoried source ends each run with one disposition from a
closed set, transient conditions never receive terminal ones, a file still
being written is deferred rather than parsed, and the parser's own version is
part of the key that lets a source be skipped. That is
[ingest-disposition-accounting](./techniques/ingest-disposition-accounting.md).

## The failure modes of the naive reading

Each technique answers a failure that looks like success. A parser that
understands nothing reports zero sessions and exits cleanly. A retention job
that evicts by age reports the space it reclaimed, not the unique bytes it
destroyed. A duplicate session reads as a busy afternoon. A citation into the
wrong line reads as a citation. A secret in a search result reads as a search
result. A scan that skipped a third of the store because it scoped discovery to
the folder it was launched from reports what it found, and nothing about what
it did not look at; one machine ran three scripts with three different folder
rules over the same transcripts, and every one of them missed the sessions
launched from somewhere else.

The common cure is the bundle's first law applied to a store:
[never present absence as an answer](../../_laws.md#never-present-absence-as-an-answer). A source that parsed to nothing is a finding. A capture
that paused is an alarm. A lookup that matched two rows is an error. An archive
that cannot say what it did not keep cannot be trusted about what it did.

## What good looks like

A healthy archive can answer five questions without reading its own code.
*What could we lose today?* Every source whose upstream age is near the
harness's deletion horizon and that has no verified capture, as a list. *Can
we re-derive everything from what we hold?* Yes, from the captures, by a
named command, after a parser fix, including for sessions upstream deleted
months ago. *Is any session in here twice, or two sessions as one?* No, and a
test that indexes one file through two roots proves it. *Where did this
citation come from?* One archived message, by a declared coordinate, or an
error. *What did the last run not read, and why?* A disposition per source,
with the transient ones queued for retry. An archive that cannot answer one of
these has its gap exactly where the harness's next scheduled cleanup will find
it.
