---
layer: application
type: application
subject: civic-source-adapters
technique: publisher-sentinel-values
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node: three kinds of missing collapsed into one null in a contract-register cell

The politicas repo scrapes the public contract register's result table
(`lib/ingest/sources/smlouvy.ts`). Its value column is the sentinel case the
technique describes: the publisher writes the literal `Neuvedeno` ("not
stated") instead of an amount. The stack is Node 24, witnessed by the CI pin in
`.github/workflows/ci.yml` (`node-version: 24`).

## What the tree did

The sentinel half was already right and pinned by tests: `Neuvedeno` maps to
null, never to 0, and the sentinel text sat inline in the parser. The sibling
birth-date sentinel and the vote-code vocabulary in the shared normalizer were
also conformant (named constant, documented source, an explicit `unknown` arm,
a merged `abstain_or_not_voting` category, and an unrecognized outcome code
kept in its own `void` class that the quality scorer counts as uncategorized).

The seam chosen to falsify "the tree already holds this" was the one place a
null could mean more than one thing. `parseValueCell` returned the same
`{ valueCzk: null, valueNote: null }` for three different facts: the publisher's
`Neuvedeno`, an empty cell, and any text the CZK regex refused (a foreign
currency such as `1 200 EUR`, or a changed cell format). The row type's comment
said null meant "the publisher's own Neuvedeno", which was false for the other
two. Coverage reporting could not tell "the publisher says unknown" from "our
parser gave up", so a format change or a run of foreign-currency contracts would
have looked like more sentinels.

## What changed

A closed `ValueState` (`stated | not_stated | absent | unparsed`) is returned
by `parseValueCell` and carried on `SmlouvyRow`; the sentinel text became a
named constant. The change is additive: `valueCzk` and `valueNote` are
unchanged and no consumer reads the new field yet.

## Result

A: the new tests (a foreign-currency cell must not share a state with
`Neuvedeno`; each existing case asserts its state) run against the unchanged
source: 8 of 37 fail. B: with the change, 273 of 273 ingest tests pass, `tsc` is
clean, eslint is clean on the two files. The floor (every existing value/note
assertion) held. Not measured: how many live rows land in `unparsed`; that needs
a harvest run and is the instrument that would show whether foreign currency is
common enough to model.

## What the technique should say

Its three-kinds-of-null rule held and was the finding; the application shows the
rule is cheapest at the parser's return type, where it is one closed union,
rather than as a flag added after rows are stored.
