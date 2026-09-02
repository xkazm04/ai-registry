---
layer: technique
type: technique
subject: browser-credential-boundary
technique: omit-the-column-not-the-value
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [designing a table a public role can read, a secret and its consumers share a schema, a policy edit could re-expose a filtered field]
---

# Omit the column, do not filter the value

Filtering is a promise. Every place that reads the table promises to leave the
sensitive field out of its projection, and the promise holds until the next
contributor writes a query, the next policy edit widens a predicate, or the
next feature "just needs one more field". Under a client-held credential there
is not even a set of places to audit: the caller composes their own query, so
"we don't select that column" is not a control, it is a description of your own
client's habits.

Structural exclusion replaces the promise with a fact. **If the shape a public
role can reach has no column for the value, no query can return it.** Not
because everyone remembered, but because there is nothing to remember — the
statement that would leak it does not parse.

This is [one-validation-door](../../../_laws.md#one-validation-door) taken to
its structural conclusion. The law's usual form puts every writer through one
validating door; the stronger form removes the need for a door by removing the
thing it would have guarded. A field that does not exist in the reachable shape
needs no filter, no policy predicate, no review, and no test — and survives the
edits that would defeat all four.

## Where the value goes instead

The value has to live somewhere, and there are three honest homes:

- **A different table, with no grant to the public role.** The simplest and
  usually the right one. Sensitive material sits in its own relation whose
  browser-facing grant was never issued; the reachable table carries a
  reference and nothing else.
- **A different tier entirely.** If only server-side code needs the value, it
  need not be near the browser-reachable schema at all — it belongs behind the
  broker, in the server's own configuration or its secret store.
- **Nowhere, because it is derived on demand.** The strongest version: the
  value is computed by the party that needs it, from material only that party
  holds, and is never persisted next to the public shape.

There is a fourth home that is not honest: the same table, populated, with a
policy predicate keeping it away from the anonymous role. It works today. It
depends on a predicate staying correct through every future edit to that
policy, and on nobody ever adding a second policy on the same table with a
broader predicate — ordinary (permissive) policies on one table combine with
OR, so the widest one wins, and a hardening pass that adds a policy can widen
access while looking like it narrowed it. Engines that offer a *restrictive*
policy kind — one that combines with AND and can only ever narrow — give you
a way to make the exclusion survive that edit; reach for it if the column
truly cannot move. But a restrictive predicate is still a predicate, still
edited, still trusted; the column with no home in the reachable shape needs
none of it.

## Encrypted material makes the rule easier, not weaker

Where the browser handles content the server should not read, the pattern
composes: the client encrypts, the store holds ciphertext, and the key **has no
column in that store at all**. The security argument then stops depending on
policy correctness. It does not matter which role can read the row or which
predicate a future edit widens — the ciphertext is not a secret, and the thing
that would decrypt it has no column to ride on.

State that argument in the schema, in the security note at the top of the
definition, in exactly those terms. It is the sentence that stops a future
contributor from "helpfully" adding a key column so the server can index the
content — the change that would silently convert a structurally safe design
into a policy-dependent one.

## The procedure

1. **Enumerate the sensitive class** for the surface: secrets, personal
   identifiers, anything whose disclosure is not recoverable. Name the class,
   do not enumerate instances — instances arrive continuously.
2. **For each shape the public role can reach, assert the intersection is
   empty.** Not "assert the queries don't select them" — assert the *shape*
   does not contain them. This is a check over the catalog, and it is short
   enough to run in the pipeline.
3. **Where the intersection is non-empty, move the column** rather than adding
   a predicate. If it cannot move, that is a design finding to record with an
   owner, not a policy to write and forget.
4. **Write the reason at the definition.** "There is no column for X here, on
   purpose" is a comment that survives refactors; a policy predicate carrying
   the same intent silently does not.

## When not to reach for this

**When the field is needed by the same caller in the same request.** Splitting a
field the browser legitimately needs across two tables to feel safer buys a
join, not a boundary. Omission applies to values the reachable role must never
see.

**When it would fragment a coherent record beyond recognition.** A record split
into five tables because five fields have five sensitivities is a schema nobody
can reason about, and unreasonable schemas grow shortcut views that undo the
split. Group by sensitivity class, not by field.

**When the value is not actually sensitive.** Structural exclusion has a real
cost — joins, extra objects, more migration surface — and spending it on a
field that could simply be public is how a team spends its security budget on
the wrong column and skips the one that mattered.
