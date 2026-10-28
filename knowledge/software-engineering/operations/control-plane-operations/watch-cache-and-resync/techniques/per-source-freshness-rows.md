---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: per-source-freshness-rows
status: forged
laws: [failure-not-empty-success, deletion-is-not-repair]
shared_with: []
use_when: [a polled view shows data without saying how old it is, a failed poll overwrote the last good time, a source that left the watched scope disappears from the view or lingers as if current]
---

# Per-source freshness rows

A polled replica is always some age, and the age differs by source: one
project answered a minute ago, another has failed for an hour, a third left the
group yesterday. A single *last refreshed* for the whole replica averages those
into a number that is true of none of them. The technique keeps **one freshness
row per source** — the time of its last good read and the error of its last
failed one — and derives every staleness claim the readers see from it.

## Procedure

1. **Key the row by source, with a namespace.** A source is whatever is read
   and can fail independently: a project, a policy file, a ledger, the scope
   listing itself. Name them with a kind prefix (*project:<id>*,
   *policy:<scope>*) so one table holds them all and no two kinds collide.
2. **Success sets both fields; failure sets only one.** A good read writes
   its time to *last ok* and clears *last error*. A failed read writes
   *last error* and leaves *last ok* untouched, so the displayed age keeps
   growing from the last moment the data was actually true. A failure that
   resets the time — or writes the failure time as the refresh time — makes
   a broken source look freshly polled
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
3. **Derive age at read time.** Age is *now minus last ok*, computed when
   the view renders, never stored. A source with no last ok has never been
   read successfully and says so, rather than showing a zero age.
4. **Fail dependents with the cause.** When a source fails because the scope
   above it could not be listed, each dependent source records an error
   that names the upstream cause (*the group could not be read: <cause>*),
   so every stale row explains itself.
5. **A source that leaves the scope is marked stale, never deleted.** When a
   project is moved, archived or deleted at the source, the replica records
   the reason on its freshness row and marks its rows stale; the view keeps
   them, aged and labelled, until a person or a retention rule removes them
   ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair):
   deleting the rows erases the evidence of what the replica last knew, and
   a source that comes back would reappear with no history).
6. **Scope the view, not the store.** When one store serves several scopes
   over time — the watched group changed — the rows of the old scope stay
   in the store as stale, and the read path filters the view to the current
   scope by an identity the rows carry. Until a cycle has confirmed the
   current scope, a restarted reader shows none of the scoped rows rather
   than guessing which are whose.

## Decision rules

- **Stale is a state on the row, freshness is a fact about the source.**
  Keep both: the row's state drives the badge; the freshness row explains
  it and dates it.
- **A cache that remembers fetched data per source is forgotten when the
  source leaves**, even though the rows are kept: memory exists to save
  reads, and a source that is no longer polled has none to save. Name the
  forgetting where the memory is declared, so a new memo cannot be added
  without saying how it is reaped.
- **The scope listing itself has a freshness row.** If the replica cannot
  list what it should poll, that failure is a source like any other, and
  the view says the whole replica is stale and why.

## When not to use

A replica that is rebuilt from scratch on every read has no age to report.
The technique earns its table when a replica outlives a single cycle and its
readers would act differently on a minute-old and an hour-old row.
