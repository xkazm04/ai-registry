---
layer: technique
type: technique
subject: telemetry-pii-redaction
technique: denylist-plus-pattern-pass
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [writing the scrub function for an outbound telemetry record, deciding whether a field name is enough of a control, a personal identifier found in a field nobody flagged]
---

# Denylist plus pattern pass

A redactor needs two passes over the record, and they are not alternatives.
The first matches on **keys** and drops their values wherever they appear.
The second matches on **values** and rewrites what it finds inside strings
the first pass let through. Each exists because of the other's blind spot,
and a boundary built from only one of them fails in a way its authors can
describe in advance and still ship.

## Pass one: keyed drops, at any depth

Walk the whole record — every nested object, every array element — and
when a key matches the sensitive set, replace its value with a marker
rather than recursing into it. Two rules make this pass work:

**It matches at any depth, not at the top level.** The identifier that
leaks is rarely a top-level field; it is three levels inside a context
object that somebody attached because it was convenient.

**The match is case-insensitive, and mixes exact keys with a few
substring markers.** Exact keys for the domain identifiers, whose names
you control. A short list of substring markers — the words that mean
"credential" in every naming convention — for the fields you do not
control, because a package will name it one way and your code another. Keep
the substring list short and specific: a marker broad enough to catch an
unrelated field trains contributors to work around the redactor, which is
worse than the leak it prevented.

The set itself has **two halves that age differently**, and separating
them in the source is worth the two lines it costs. The domain
identifiers — the keys that join a record to a person inside your
system — change when your schema changes, and belong next to a comment
saying so. The generic personal-data keys — the ones that hold a name, a
postal address, a telephone number, a date of birth — change almost never,
and they are the half that justifies this pass existing at all: **their
values match no pattern.** A street address is words. A person's name is
words. No value-level rule will ever find them, and the key is the only
signal there is.

## Pass two: patterns over the surviving strings

Then walk the strings and rewrite by shape. The shapes that repay the cost
are the ones with high precision and real frequency:

- **Mail-address shape.** The single highest-yield pattern, and the reason
  it is needed despite the keyed pass is that mail addresses arrive in
  fields called *note*, *query*, *title* and *description* — typed by a
  user into a free-text box, or interpolated into an error sentence by
  code that was not thinking about a boundary.
- **Long digit runs** in the groupings that carry account and payment
  numbers. Precision here is genuinely mixed — timestamps and internal
  counters look similar — so this pattern is where a false-positive budget
  gets spent, and where the clean-survival test earns its place.
- **Token shapes**: long high-entropy strings, and the conventional
  prefixes credentials are issued with.
- **Locations**, which deserve their own rule below.

And one pattern that is not a value shape at all, and is the highest-yield
addition most redactors are missing: **quoted spans**. Product code
interpolates user-supplied names into error prose inside quotes — *could
not load 'the thing the user named'* — and no value-level rule will ever
recognise those characters as sensitive, because they are ordinary words.
Matching on the *syntax of the message* rather than the shape of the value
catches an entire class the other patterns cannot: names of records, names
of credentials, names of workspaces, and the property values a rendering
framework quotes into a component stack. Bound the span length so a stray
apostrophe cannot swallow the rest of the message, and accept that this
pattern has the worst false-positive rate in the set — it eats legitimate
quoted content, which is exactly why the clean-survival case has to hold
the examples worth keeping.

## Locations reduce to scheme and host

An address is the most reliable accidental carrier in the whole payload,
by three routes at once: the query string, which is where forms put what
users typed; the path, which in a resource-shaped product contains the
identifier; and the **authority portion**, which may carry a user name and
password in front of the host and which almost every redactor forgets
because almost every developer has never seen one in the wild.

The rule is aggressive on purpose: reduce an address to its scheme and
host, and drop the rest. If the path carries debugging value — and it
usually does — collapse its identifier-shaped segments to a type marker
before keeping it, rather than passing the raw path through. That is the
same move as
[correlation-preserving-redaction](./correlation-preserving-redaction.md)
applied to a route, and it has the second benefit of making routes
aggregate: a thousand distinct paths become one, and the failure that was
invisible at one occurrence each becomes a ranked row.

## Order, and one authority for the set

Keyed drops run **first**. The cheap exact pass reduces the volume of
string the expensive pattern pass must walk, and this redactor runs on the
failure path, where the process is already unhealthy and the object graph
is already large. Ordering it the other way is not incorrect, merely
wasteful in the moment you can least afford waste.

Order **inside** the pattern pass matters more, and it is the detail teams
get wrong twice. Each rewrite consumes the text it matched, so a broad
rewriter running early hides material a precise one would have handled
better. Run the precise, high-confidence patterns first — identifiers,
mail addresses — then the structural ones, then the broad quoted-span
sweep last. Concretely: a mail address must be matched before the location
pass and before the quoted-span pass, or an address that happens to sit
inside a location or inside quotes is replaced by a coarser marker, and the
record loses the information that an address was there at all. Write the
intended order as a numbered comment above the pass, because the next
contributor will add a pattern to the end of the list by default.

Both passes read their configuration from **one exported set, in one
module** — the hook reads it, the call-site wrappers read it, the tests
read it
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
The failure mode of two copies is specific and reliable: a contributor
adds an identifier to the list they found first, and the other path keeps
emitting it, and nothing anywhere disagrees loudly enough to notice.

There is one case where a second copy is unavoidable: the same product
emits to the same sink from two runtimes in two languages, and no shared
constant can span them. That copy is legitimate and it is still a copy, so
it gets what every unavoidable duplicate needs — a named reconciliation.
State in both files that they mirror each other, name the direction the
change flows, and make the pair a review question at every addition. The
tempting alternative, letting the two drift because "the other one is a
different platform anyway", produces a sink where a field is scrubbed on
one client and emitted raw on the other, which is indistinguishable at the
sink from not scrubbing it at all.

## Decision rules

- **When the field's shape is known, use the key.** A pattern is a safety
  net, not a primary control, and treating it as primary means accepting
  its false-negative rate on your most predictable data.
- **When the field is free text, the pattern is all you have** — so free
  text fields are also the first candidates for being dropped outright.
  Ask what the free-text field is worth in triage before defending it.
- **A false positive is a real cost, and it is not fixed by loosening the
  pattern after one anecdote.** It is fixed by narrowing the pattern with a
  case added to the clean-survival suite, so the next person does not
  loosen it again.
- **Never emit the value you just matched.** The urge to log *redacted a
  mail address from this field: here it is* writes the value to a second
  sink at the exact moment it has been proven sensitive. Log the field and
  the shape; never the value.

## When not to reach for this

If you construct the outbound payload yourself, an allowlist replaces both
passes and is strictly better. And neither pass is the right tool for a
field you know always holds an identifier: that field gets pseudonymised
by construction at the call site, not discovered by a walker later.
