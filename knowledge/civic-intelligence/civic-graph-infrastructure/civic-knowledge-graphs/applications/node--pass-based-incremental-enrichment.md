---
layer: application
type: application
subject: civic-knowledge-graphs
technique: pass-based-incremental-enrichment
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Node: the generic promote path owned a deny list where its sibling had an allow-list

How a TypeScript/Node civic-graph project (Czech accountability app *politicas*)
keeps many writers from erasing each other's layers, and the one writer whose
guard was half derived.

## What already conformed

A named, unit-tested read-merge helper that every enrichment writer imports;
a pass ledger; a reset guard that compares what the store holds against what the
run re-emits; stamped provenance on every row; and a written, dated account of
the wholesale-replace class with its honest limit (a conditionally computed
property goes stale rather than deleted). The technique's merge half was well
covered.

## The seam chosen to falsify it

The ownership rule says one property has one owning pass lineage, and a generic
writer must not hand a fresh property object to a replace-on-conflict upsert
for a thing another lineage owns. The generic promote script enforced this on
nodes by deriving the refusal set as the enum minus the two kinds it ever
wrote. On edges it kept a two-item deny list over an enum of about two dozen
rels, while its header claimed both halves were enforced. A CAUGHT result would
have shown the deny list was complete because the other rels never reach it;
the seam could have refuted the finding.

## A: the deny list

Any rel outside the two named passed the shared enum gate and, on commit, was
upserted with `{rationale}` as its entire properties: a sponsorship, an
ownership stake, a rapporteur assignment or a roll-call link would lose role,
share, date and scope properties written by their own loops.

## B: the allow list

Promotable edge rels are exactly the two this path has ever written; the
refusal set is derived as the enum minus those, so a rel added later is refused
here the day it lands. The refusal prints its reason, as the node side does.

## Verdict

Target: rels other than the two promotable ones refused. A: 1 of 2 new tests
failed (the eight-rel sweep), B: 18 of 18 green in the file. Floor: the two
interpretive rels still promote, the existing money-rel and node-kind tests,
tsc and eslint held. The technique held, and its decision rule earned a
mechanical form: derive a generic writer's refusal set from the closed
vocabulary minus what it owns, on every kind of row it writes, not on the one
where the incident happened. Not measured: whether any real verdict ever
proposed such a rel; the verdict files were not at hand.
