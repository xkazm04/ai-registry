---
layer: technique
type: technique
subject: markdown-vault
technique: replicated-substrate
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [notes appear twice under conflict-suffixed names, staleness fires on every note after a fresh checkout, a full walk stalls or pulls the whole corpus over the network]
---

# Replicated substrate

The subject's physics section names one other writer: the human, in their own
editor. In practice a shared store almost never sits on a plain local disk. It
sits inside a replicated folder — a cloud-sync client, a peer-to-peer syncer, a
mobile companion, a version-control checkout — and that replication agent is a
**second concurrent writer with none of the human's properties**. It writes
without intent, at times nobody chose, files nobody authored. It rewrites
metadata the application reads as signal. And it can present the tree in states
a local filesystem never produces.

Everything the [editor-interop](./editor-interop.md) discipline assumes about
the peer — that it is a person, that its writes are edits, that a file present
in a listing is a file — is false for this one. The rules below are what the
application owes a store whose ground is a replica.

## Its artifacts enter the corpus as records

When two replicas diverge, the agent does not block and does not ask. It
materializes the loser beside the winner as a **new file with a decorated name**
and the same extension — a suffix naming a device and a timestamp, a
parenthetical, a numeric bounce. A merge tool leaves its own residue: backup
copies of the pre-merge content, and files still carrying inline conflict
markers in the body.

Every one of these passes a walk that collects note-extension files and skips
dot-prefixed directories, because none of them is hidden and all of them are
notes. The consequences are not cosmetic:

- the corpus doubles a note's content, so a full-text index returns both and a
  judgment pass reading a corpus summary sees the same claim twice;
- the duplicate is linked by nobody, so it lands in the orphan count as a
  defect the human did not create and cannot fix by writing;
- a body carrying merge markers parses as a record and lints as clean.

So a vault walker's exclusion policy has a class its three declared decisions
([vault-walking](./vault-walking.md)) do not cover: **replication artifacts are
excluded by name pattern, and the exclusion is reported, not silent.** A note
quietly dropped from every view is how a human loses the only surviving copy of
an edit. The honest shape is a fourth defect class in the integrity lint —
*this file looks like a replication artifact* — with the pair it shadows named,
so the human resolves it instead of the application guessing.

## Its writes destroy the metadata a detector reads

The staleness detector treats modification time as a proxy for review-currency
and says so ([knowledge-integrity-lint](./knowledge-integrity-lint.md)). What
the proxy caveat does not say is that the corrupter is usually mechanical, not
editorial. A fresh checkout of a version-controlled vault writes every file at
checkout time, because the history format stores content and not timestamps: a
corpus of decade-old notes reports as reviewed this morning, uniformly, and the
detector goes silent exactly when a new reader most needs it. Uploads made
through a replication agent's web or mobile surface can stamp download time the
same way.

This is not universal — several replication agents preserve modification time
faithfully on their desktop path, and a file-copy tool asked to preserve times
does. That is precisely the problem: the signal is *sometimes* meaningful and
the application cannot tell which case it is in. The durable answer is
**in-band**: a review date the human writes in the record's own fields, which
survives every copy, checkout and re-sync because it is content. Modification
time stays as the fallback for records that carry no such field, and the
distinction is visible in the finding — a review candidate derived from a
declared date is a different claim than one derived from a timestamp the
substrate owns.

## A listing is not the corpus

Two states a replicated tree reaches that a local disk does not, both of which
defeat the existing false-clean guard:

- **Dematerialized records.** On-demand file features leave a file's metadata
  in place while its content lives only on the server. It appears in a listing
  with a plausible size; opening it blocks on a network fetch. A cheap
  enumeration therefore stays cheap and *lies about what a read will cost*: the
  expensive form of the walk — the one that reads bodies to extract links or
  build an index — silently becomes a full download of the corpus, on a
  connection nobody consented to spend. Platforms expose attributes that mark
  these files precisely so a bulk reader can decline. Per
  [unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value), a record
  whose content is not local is **unknown**, not empty: it must never be
  indexed as a note with no links, counted as an orphan, or linted as stale.
- **Partial trees.** Mid-replication, the tree is simply incomplete. Files that
  will exist are absent. Nothing is unreadable, so nothing errors, so the
  abort-on-unreadable policy that protects the lint from a false clean does not
  fire — and per
  [failure-not-empty-success](../../../_laws.md#failure-not-empty-success) the
  pass reports a confident verdict over a corpus that is not all there. Every
  note that has not arrived is a broken link from the notes that have.

Per [gate-sees-target](../../../_laws.md#gate-sees-target), both cases are a
gate reading a proxy while believing it reads the target: the directory entry
is the proxy, the record is the target, and on a replica they come apart. The
countermeasure is not a better walk — the walk cannot distinguish a
never-written note from an unarrived one. It is a **declared precondition**: a
pass whose output is a claim about the whole vault asks the substrate whether
it is settled, and when it cannot know, it says which state it ran in rather
than publishing the verdict unqualified.

## Watch and write, on ground that moves

Change watching and atomic replace both degrade here, and in ways worth
stating with the practices they qualify:

- **Watchers do not work uniformly on remote or replicated paths.** The
  kernel-level mechanisms are documented as not delivering events for changes
  made on the far side of a network filesystem; recursive watches are capped by
  a per-user resource that a large corpus exhausts; event queues overflow under
  a replication storm and drop everything with a single overflow signal whose
  documented recovery is *discard all caches and rescan*. Platform APIs coalesce
  by design and their own documentation advises a periodic full scan as a
  backstop. So the time-based staleness bound layered under the watcher is not
  belt-and-braces caution — on a replicated vault it is the primary mechanism,
  and the watcher is the optimization.
- **Replacing a file replaces its identity, and the agent notices.** The atomic
  temp-then-rename write is seen by the substrate as delete-then-create, not
  modify. It produces upload churn, and against a concurrently-writing replica
  it is one of the reliable ways to manufacture the conflict artifacts of the
  first section. Nothing here argues for abandoning atomic replace — a torn
  note is worse — but the write path on replicated ground earns a bounded retry
  and a rate limit that a local-disk write path does not need.

## Choosing to be a bad neighbour, on purpose

The tempting conclusion is that the application should detect its substrate and
adapt. Mostly it should not: substrate detection is a long tail of platform
probes that rot faster than the corpus does. What it should do is far cheaper
and holds everywhere:

1. Exclude replication artifacts by name, and report the exclusions.
2. Prefer in-band dates to substrate metadata for any temporal claim.
3. Treat a non-local record as unknown, never as empty.
4. Make the expensive walk's cost — and its dependence on the substrate —
   visible to whoever triggers it, rather than discovering it as a stall.
5. Say, in any whole-corpus verdict, that it was computed over what was
   present at the time.

None of these needs to know which agent is underneath. That is the point: the
application stops assuming the ground is a disk, without pretending to know
what it is instead.
