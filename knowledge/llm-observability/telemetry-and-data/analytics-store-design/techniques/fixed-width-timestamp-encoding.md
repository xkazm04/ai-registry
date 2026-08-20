---
layer: technique
type: technique
subject: analytics-store-design
technique: fixed-width-timestamp-encoding
status: forged
laws: []
shared_with: []
use_when: [storing timestamps as strings across heterogeneous backends, debugging range filters that miss rows, adding any code path that formats a timestamp]
---

# Fixed-width timestamp encoding

When a store must behave identically on an embedded relational store, a
networked relational store, and a document store, the safest representation
of time is often a string — every backend stores strings, compares strings
byte-wise, and indexes strings the same way. That choice buys portability
and sells it back for one obligation: **lexicographic order on the strings
must equal chronological order on the instants, always.** This technique is
that obligation made operational.

## The canonical form

One format, chosen once, used by every writer:

- A standard calendar-date-and-time form, UTC only, with the literal zone
  designator — never a numeric offset, which sorts differently and admits
  the same instant in many spellings.
- **Fixed fractional-second width.** This is the load-bearing clause. A
  formatter that emits "as many digits as needed" produces
  `…T10:00:00Z`, `…T10:00:00.5Z`, and `…T10:00:00.500001Z` — three widths
  whose byte order no longer tracks time order once the shorter string is a
  prefix of a range bound. Pin maximal precision, zero-padded, every time.
- One producer function. All code that formats a timestamp for storage or
  comparison calls a single codec routine; nothing formats inline.

With this in place, three whole query families become trivially correct on
every backend: string range filters (`ts >= since AND ts < until`), ORDER BY
over the timestamp, and keyset cursors that resume "after (ts, id)". Without
it, all three are *usually* correct — failing only on rows whose fractional
seconds happen to end in zeros, which is the worst kind of bug: rare,
data-dependent, and invisible in tests seeded with full-precision clocks.

## The structural guard

The invariant is too cheap to violate and too expensive to debug to be left
to convention. Some crate will not link the shared codec — a client library,
a rejection path in the API, a background runner — and will re-implement the
format inline. The day one of those copies drifts to a variable-width form,
every store backend inherits the corruption at once.

So the invariant gets a **guard test**: a build-time check that scans every
source file in the workspace for the timestamp-formatting call and fails
unless each occurrence pins the canonical width-and-zone arguments. Decision
rules for the guard itself:

- It scans *source text*, not behavior — the point is to catch the copy that
  never runs in tests. Assemble the search needle at runtime so the guard's
  own source does not match it.
- Its failure message teaches: name the invariant, the breakage class
  (range filters, ordering, cursors), and the sanctioned codec routine —
  the next developer sees the message, not the design discussion.
- It covers clients and tools, not just the server: an SDK that formats
  client event time variably poisons the store from outside.

This pattern — a repo-wide grep with teeth, guarding a cross-cutting textual
invariant — generalizes well beyond timestamps, but timestamps are where it
pays for itself first.

## Where the encoding must also hold

- **Ingest validation.** Skew rejection ("event time too far from server
  time") parses the client string against the same canonical form; accepting
  looser forms at the door creates rows that break the sort later.
- **Cursors.** A keyset cursor embeds a timestamp; if the cursor's encoder
  and the column's encoder ever differ, pagination silently skips or repeats
  at the boundary.
- **Cross-backend migration.** Byte-identical strings are what make a dump
  from one backend loadable into another with history ordering intact — the
  quiet payoff of the whole discipline.

## When not to use this

- On an analytical warehouse with a true timestamp type, native
  date-partitioning, and no need to byte-match a string peer — there, use
  the native type and let the copy's schema state the mapping explicitly.
- When only one backend will ever exist and it has a well-behaved native
  temporal type with the comparison semantics the queries need; the string
  contract is the price of heterogeneity, and without heterogeneity it
  buys less (though the single-codec rule still pays).
- Never use variable precision "to save bytes". The savings are single
  digits per row; the cost is a correctness bug in every range query.
