---
subject: generative-provider-auditing
domain: game-production
last_touched: 2026-09-01
dry_streak: 0
---

# generative-provider-auditing

First touch: 2026-09-01, an `/intake` run on a sponsored faceless-channel walkthrough
([[../../sources/2026-09-01-faceless-channel-claude-code]]). The source authorized nothing
in this subject — every content candidate it raised was already covered, twice over in the
case that mattered — but verifying one of those catches found a live consumer that
violates the subject's central technique, and the run landed there instead.

## State

6 techniques unchanged, 3 -> 4 applications. The new one is the subject's **first
application of `never-the-account-default`**, which until now was the only technique in
the subject with no tree behind it — notable given the golden path opens by calling
Identity the first of its four audited properties.

Landed:

- `applications/node--never-the-account-default.md` — `applied: code`,
  `ab_verdict: better`, `proof: ab-paired`. Shipped to the consumer as `e3b3f09`
  (not pushed).

## What the tree said back

The application is a **negative** one and that is why it is worth keeping. The consumer had
independently derived this technique's first decision rule — *a request parameter is a
claim by the caller, only the echoed identity is a claim by the party that did the work* —
and implemented it for **cost**, with a `CostBasis` discriminator and a comment arguing
from a real incident. It never occurred to anyone that the same argument governs
**identity**, which sat one line above as a bare required string.

So of the four properties this subject enumerates, that tree had modelled the epistemic
status of three (cost, custody, re-routing) and of Identity none. Nobody designed the
asymmetry. It is the strongest evidence the run produced, and it is evidence *for* the
subject's framing: the four properties really are separable, and a team can win the
argument for one while never noticing it applies to its neighbour.

## Open

- **`undisclosed` is declared but unreached.** The new enum carries a state for a provider
  whose contract exposes no identifier at all — the case the technique's *When NOT to use
  this* governs — because that shape is now a marketed product category rather than a
  hypothetical (the source's one genuine currency signal). No vendor in the consumer's
  roster is in that state, so the branch is untested in any tree.
  **Return condition:** a connected project adopts a routing-owning provider.
- **Nothing refuses on the field yet.** The technique asks that unattributable output be
  kept out of shipping classes; the consumer now makes attribution status legible but no
  gate reads it. A future application could measure whether legibility alone changes a
  shipping decision, which is the honest open question about this whole class of change.
- The five recorded identities are all `requested`. Upgrading any to `vendor-reported`
  needs per-adapter response parsing — named in the application as its return condition.

## Watch

`never-the-account-default` is now applied once. A second consumer would be worth having
specifically because this one **agreed with the technique in three places and missed it in
the fourth** — a second tree showing the same partial adoption would promote "teams model
basis for numbers and not for identities" from an anecdote to a pattern worth stating in
the golden path.
