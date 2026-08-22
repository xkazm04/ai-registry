---
layer: technique
type: technique
subject: telemetry-pii-redaction
technique: emit-site-inventory
status: forged
laws: [gate-sees-target, one-validation-door]
shared_with: []
use_when: [adopting a hosted error tracker, auditing what an outbound payload can carry, upgrading a telemetry client across a major version]
---

# Emit-site inventory

The inventory is a written enumeration of **every field the transport can
carry off the machine**, each marked with what happens to it. It is the
first artifact of this subject and the one teams skip, because it looks
like documentation and feels like it can be inferred from the code. It
cannot: the code shows what *you* attach, and most of what leaves was
attached by something else.

## Enumerate the payload, not your call sites

The reflex is to list the places the product calls the capture function.
That list is the wrong list. A client library assembles a record from four
authors, and only one of them is you:

- **Caller-authored** — the message you composed, the context object you
  passed, the tags you set, the extras bag. Visible in your own code,
  which is why this is the part every team covers and the part that leaks
  least surprisingly.
- **Product-authored, indirectly** — the exception's own value, which is
  whatever the throwing layer chose to put in it. A data-access layer that
  interpolates the offending row into its error text has authored a
  payload field on your behalf, in a package you did not write.
- **Library-authored** — automatic breadcrumbs from console output,
  outbound network calls with their addresses and query strings,
  navigation events with full locations, and the route or transaction
  name, which in a resource-shaped product is a path with the identifier
  still in it.
- **Runtime-authored** — the stack, and in several runtimes the **local
  variables captured at each frame**. Nobody chose these values. They are
  whatever happened to be in scope at the moment of failure, which on a
  failure path is disproportionately the record that caused it.

Rank the inventory by author in that order and the risk ranking inverts:
the fields nobody chose are the ones most likely to hold something. The
walk that produces the list starts from the transport's own payload
schema — the documented union of everything it may attach — because a
gate that observes only the fields you remembered passes exactly when the
transport adds one
([gate-sees-target](../../../_laws.md#gate-sees-target)).

## Each field carries a disposition, and the vocabulary is closed

Three values, and only three:

- **scrubbed** — the field survives, its contents rewritten by the
  redactor.
- **dropped** — the field is removed entirely before send.
- **passed, with a stated reason** — the field goes out as written,
  because it demonstrably cannot carry user content. The reason is
  recorded next to it, in a sentence, and it is the only entry a reviewer
  ever needs to argue with.

*Probably fine* is not a disposition. Neither is silence: a field present
in the transport's schema and absent from the inventory is the exact
defect this artifact exists to make visible, and the review question at
every client upgrade is one line — *what new fields can the payload carry
now?*

## The inventory lives beside the redactor, not in a wiki

Put the list where the code that implements it is read, because the only
reader who matters is the contributor about to change the redactor or add
a capture site. An inventory in a separate document is consulted the day
it is written and never again; the same list as a block comment above the
scrub function is consulted every time somebody touches the function, and
it is the natural place to record the two facts that keep it honest —
which fields the outbound hook cannot reach at all, and which call sites
carry their own wrapper because of it.

The structural consequence is that the redactor and the inventory are the
same module. One place decides what leaves
([one-validation-door](../../../_laws.md#one-validation-door)); the
enumeration of what could leave belongs in that place, not in a second
location that will drift from it.

## Prefer construction over enumeration where the transport allows it

An inventory is a denylist made legible, and like every denylist it is
complete only on the day it is written. Where the transport lets you
**construct** the outgoing record yourself — supplying a payload rather
than filtering one the library assembled — take that path instead: an
allowlist of fields you built cannot acquire a new one behind your back.
Most hosted error trackers do not offer this for exceptions, which is
precisely why the inventory exists; several offer it for custom events and
metrics, and the inventory should show that the two halves of the product
are governed differently.

## When not to reach for this

An inventory is not warranted for a sink you fully construct, where the
allowlist is the code. It is also not a substitute for reading the
transport's changelog: the artifact records a decision per field, it does
not detect new fields. And it does not belong in a public-facing document
— it names the exact fields an attacker would probe, and its audience is
the three people who maintain the boundary.

## The failure this prevents

Every disclosure in this subject has the same post-mortem sentence: *we
scrubbed the message.* The message was never the problem. The inventory is
the cheapest possible instrument for discovering that before an incident
does, and its cost is one afternoon of reading a schema — which is why a
team that has not spent that afternoon should spend it before writing a
single line of redaction code.
