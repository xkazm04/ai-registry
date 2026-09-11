---
layer: application
type: application
subject: dependency-declaration
technique: logical-name-or-address
stack: node
verified_on: 2026-09-11
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A versioned address reached through a wrapper, in Ascent (Node)

Ascent buys billing from a provider that versions its API contract **by import
path** — a dated entry point, so asking for a contract and importing the client
are the same act. That is the address form chosen deliberately, and for the
right reason: a contract binding should not be silently redirectable. This tree
is where the technique's added boundary shows up, because Ascent does not write
every reference to that publisher.

The witness for the stack version is the `engines` field and the lockfile
format; the instrument is commit `05e98064`.

## Two paths to one contract, one of them not ours

Ascent reaches the provider twice. `src/lib/polar.ts` constructs the client
directly. `src/app/api/billing/webhook/route.ts` reaches it through the
framework adapter, which imports the client itself, with its own specifier that
Ascent's manifest cannot rewrite.

The declaration cannot see the consequence, so the experiment asks the same
question of both sides:

| Arm | Question answered from | Revisions found |
| --- | --- | --- |
| A | `package.json` — what we asked for | 1 (`^0.48.1`) |
| B | `package-lock.json` — what resolved | 2, across 3 copies |

Arm B's detail is the finding: `0.48.1` at the root, and `0.47.1` twice more
under the adapter and its shared utility package. One process, two revisions of
one contract-bearing client, reached by two paths through the graph.

The control is what makes the reading informative rather than decorative. A
second family expected to resolve to exactly one copy is measured by the same
instrument and reports **agreement** — so the instrument can return "clean", and
its split reading is a fact about the tree rather than about the script. Without
that arm the report could only ever say "split" and would be measuring nothing.

## What it demonstrates about the technique

Purview was concentrated where the publisher intended — the binding is not
redirectable — but authority over *which address gets written* stayed
distributed across every intermediary. Ascent can pin its own reference and
cannot reach the adapter's. The constraint the publisher expressed for its
direct callers landed on a transitive consumer who cannot satisfy it.

Note that this is not yet a live defect for Ascent, and saying so is part of the
result: the two resolved revisions are adjacent patch releases of the client
package, and the provider states that the **package** version and the **contract**
version move independently. The split is a contract split only once the contract
selector is actually written into those import paths. The value of the
instrument is that it makes the split visible *before* that day rather than
after, which is the only time the information is cheap.

## What this realization cannot do

It reports; it does not gate, and it deliberately exits 0. Wiring it into
`verify` was rejected for this run because the correct failure threshold is not
one revision — a duplicated client at two patch levels is normal and harmless
today — and a gate with a wrong threshold is turned off within a week. The
threshold that would be right is "more than one revision **carrying a different
contract selector**", which nothing in the tree can currently compute, because
no import path in this repository names a contract at all.

It also reads the lockfile rather than `node_modules`, so it describes the tree
npm would install rather than the one on disk. For this question those agree;
for a tree edited by hand or patched post-install they would not.
