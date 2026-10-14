---
layer: technique
type: technique
subject: agent-session-archive
technique: ingest-disposition-accounting
status: forged
laws: [never-present-absence-as-an-answer, estimation-announces-itself]
shared_with: []
use_when: [an ingest run reports a session count and nothing else, a transcript that was being written got parsed half-way, deciding which sources an incremental ingest may skip, several tools disagree about how many sessions exist]
---

# Ingest disposition accounting

Every source in the inventory ends every ingest run with **exactly one
disposition** from a closed set, and the run reports the inventory as its
denominator. A test asserts that the inventory covers every path the parser
read. A run that reports "found N sessions" with no inventory beside it has
said nothing about the sources it did not find, and those are the ones a
format change, a locked database or a narrow folder rule removed.

## The closed set

The set is small and each member answers a different follow-up question:

- **indexed:** every record from the source is stored.
- **partially indexed:** some records stored, others quarantined; says how
  many of each, so the partial count is never read as the whole.
- **deferred:** the source is still being written; retried next run.
- **locked:** the live application holds it; retried next run.
- **quarantined:** a record-level failure the current parser cannot handle;
  retried when the parser changes.
- **excluded:** operator policy; reported by rule name.
- **unsupported:** a known, explicit limitation of this host or reader, such as
  an encrypted store or a format version the reader does not speak.
- **unproductive:** read without error and yielded nothing. This is the
  format-change signature, and it is never folded into indexed-with-zero.

The last one deserves its own member because a reader that understands
nothing looks exactly like a session that contained nothing, and only the
inventory can tell them apart.

## Transient never becomes terminal

The most damaging accounting error is giving a transient condition a terminal
disposition. A file being appended to, parsed half-way, fails like a corrupt
file; if the failure is classified by matching words in an error message, it
can be filed as a resource failure and quarantined permanently. In one
archive's history this happened to most watch-mode ingest attempts on one
platform, including small files the harness was writing at the time: live
sessions, quarantined for good, by the mechanism meant to protect the run.

Two rules prevent it. Classify failures by their type, never by their text.
And defer any source modified within a short window before parsing it. The
cheap signal is the strong one here: a modification time inside the window
catches writers that buffer their appends and hold no lock and no open
writable handle, which lock probes and open-handle probes both miss. A false
positive defers a just-finished file by one cycle; a false negative quarantines
a live session. A window of a couple of minutes is a reasonable default.

A deferral has one more obligation. A coarse "everything since" watermark must
not advance past a deferred source, or the next run starts after it and the
source is never revisited. Hold the watermark while any source is deferred or
excluded mid-run.

## Certify completion, do not assume it

A source is recorded complete only after every record derived from it was
delivered and stored, and only if its fingerprint did not change while it was
read. A reader that cannot prove where one source ends and the next begins
says so and is never treated as certifying anything; guessed boundaries are
worse than none. An unreadable or missing source cannot prove a completed
parse, and an observation error is never stored as a value a later comparison
could match.

## The skip ledger is keyed on the parser too

An incremental ingest skips sources it has already read, keyed on the
source's identity and fingerprint. The engineering neighbour that owns
incremental scanning states the missing third component as the ruleset
version; for an archive, the ruleset is the parser. Put a digest of the
parser's own source, computed at build time, into the ledger key, so any
parser change re-reads every source without anyone remembering to ask. The
same holds for the redaction pattern set. For the fingerprint, a content
digest is the honest key; a metadata tuple is cheaper, and if it is used it
includes the change time and the file identity, because size and modification
time together are defeated by a same-length rewrite with the time restored.

## One inventory for every consumer

When several tools read the same transcripts, each with its own discovery
rule, they disagree about how many sessions exist and none of them is wrong
by its own definition. One installation ran three scripts with three folder
rules over one store, and all three missed sessions launched from outside the
folders they scoped to. Discovery is one shared function. It never scopes by
the folder a session was launched from; project attribution comes from the
working directory recorded inside the session.

## The coverage test, and the side it cannot see

The inventory and the parser are tested together: on every fixture, every
path the parser produced a conversation from must appear in the inventory.
That catches a parser reading what discovery never listed, which would escape
capture. The opposite direction, inventoried and produced nothing, is not a
test failure; it is the unproductive disposition, reported per source, with
its bytes held by [capture-before-parse](./capture-before-parse.md).

## When not to use it

A one-time import of a known-good export, run by hand and checked by eye,
does not need a disposition ledger. The ledger earns its keep when ingest runs
unattended and repeatedly over a store whose format, locks and contents change
under it, which is every archive of a live harness.
