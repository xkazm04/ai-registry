---
layer: technique
type: technique
subject: grant-source-landscape
technique: dedup-records-who-carried-it
status: forged
laws: [provenance-per-field, small-samples-stay-silent]
shared_with: []
use_when: [resolving overlap between two sources covering the same publisher, a downstream verdict wants to know how many sources agreed, deciding what the upsert may overwrite, an aggregator is about to be counted as an independent source]
---

# Dedup records who carried it

Deduplication answers *which payload wins*. It is routinely made to answer a
second question it was never asked — *how many publishers asserted this* —
and it answers that one by destroying it. The merge is the last moment the
answer exists: before it, the corpus holds three rows from three feeds;
after it, one row, and nothing anywhere remembers there were three.

The fix is small and it is structural, not analytical. **Write the carrier
set on the surviving row at merge time.** One collection of source
identifiers, appended by the upsert rather than replaced by it. It costs a
column and a line in the merge path, and it is the only place in the system
where the number can be obtained at all.

## Why precedence loses it

[stable-dedup-key-selection](./stable-dedup-key-selection.md) resolves
cross-source overlap two ways, and both are correct about identity while
being lossy about multiplicity:

- **Deliberate overlap, resolved by precedence.** The richer source upserts
  over the thinner one's row. The right payload survives — and the fact that
  the thinner source *also carried this opportunity* is overwritten along
  with the fields it lost on. Precedence is a rule about field values; it
  should never have been a rule about existence.
- **Accidental overlap, left as separate rows.** Both rows survive under
  their own source keys, which correctly avoids fuzzy entity resolution on
  untrustworthy fields. But two rows nothing ever relates are not a
  corroborated fact; they are a duplicate the corpus has agreed to tolerate.

Neither is wrong. Both leave the same hole: the ingest boundary is the only
layer that sees the overlap, and it currently spends that knowledge on
choosing a winner and then discards the rest.

## What the number is worth here

An open call is a claim that something is live and applicable to. The
strongest cheap evidence for that claim is that several publishers
independently say so — a call carried by a clearinghouse, a national
registry and a curated floor entry is a different confidence proposition
from one a single scraper lifted off an agency page last night, and the
difference is available for free at ingest.

The bundle already prices this everywhere except here. A verification
verdict ships with its source count attached, because a yes divorced from
how many checks decided it is a rumor. A document consensus counts reports
across filings and orders the checklist most-corroborated first. A portal
resolution waits for corroboration before letting one report override
anything. Each of those consumes a number that the corpus's own ingest
layer had, and dropped, one merge earlier.

## The carrier set is publishers, not adapters

This is the discipline that decides whether the number means anything, and
it is where a naive carrier count goes wrong in exactly the direction that
makes it dangerous — it inflates, confidently.

**Two adapters onto one upstream are one carrier.** A live search interface
and a nightly bulk extract of the same clearinghouse agree because they are
the same database twice. `stable-dedup-key-selection` already tells those
two to share a key scheme on purpose; the carrier set must inherit that
knowledge and record the publisher once, not the adapters twice.

**A republisher is not a witness.** Aggregators, mirrors, and portals that
re-export a registry's feed multiply the row count without adding an
observation. Where an adapter's upstream is another source already in the
corpus, it declares that at onboarding and contributes its *origin's*
identifier to the carrier set, never its own.

The consequence, and the reason the discipline is not optional: a carrier
count assembled without it measures how many places relayed something, which
correlates with how loudly it was promoted and not at all with whether it is
true. That is a worse input to a confidence display than no number, because
it looks like evidence.

## Decision rules

- **When the upsert overwrites a row, union the carrier sets rather than
  replacing, because** the losing source's payload is what lost, not its
  testimony.
- **When an adapter is onboarded, record its upstream, because**
  independence cannot be recovered later from the rows — by then every
  carrier looks alike, and the only surviving distinction is the one
  onboarding wrote down.
- **When a surface displays a corroboration count, display the carriers,
  because** a bare "3 sources" invites the reader to assume three
  independent ones, and naming them lets a reader who knows the field catch
  a republisher the onboarding missed.
- **When the carrier set holds one entry, show it as one source and not as
  a confidence signal**
  ([small-samples-stay-silent](../../../_laws.md#small-samples-stay-silent)):
  single-carrier is the corpus's normal case, not a defect, and dressing it
  up as weak corroboration is a lie told with a true number.
- **When overlap is accidental and both rows are kept, relate them anyway,
  because** a soft link recording "these two may be the same call" is
  cheaper and more honest than either merging them on fuzzy fields or
  pretending they are unrelated.

## When not to use

Do not let the carrier set become a merge trigger. It records what the
existing overlap resolution already decided; a row does not become mergeable
because several sources carried something similar, and using multiplicity to
justify fuzzy entity resolution reintroduces exactly the corruption
`stable-dedup-key-selection` declines.

Do not compute it for single-source corpora, and do not add the column
speculatively to a corpus with one adapter. The number is worth having when
overlap exists; before that it is a field that will be wrong by the time it
matters, because nobody maintained it.
