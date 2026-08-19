---
layer: application
type: application
subject: beneficial-ownership-resolution
technique: role-period-reconciliation
stack: node
status: forged
---

# Node: population-wide period reconciliation against the official register

The politicas money loop reconciles every MP-to-company tie's period
against ARES VR (the Czech official officer/shareholder register) in
`scripts/case-loops/money/reconcile-ares-vr.ts`, with the doctrine stated
in `.claude/skills/money-loop/SKILL.md:34-49` and the reader-facing flags
in `features/money/tieFlags.ts`.

## The sweep (reconcile-ares-vr.ts:1-31)

The source graph's periods come from Hlídač státu, which year-rounds and
defaults to "ongoing"; ARES VR carries day-precise `vznikFunkce` /
`zanikFunkce`. The script deterministically fetches the VR record for all
260 `linked_to` ties (batch 002 completed the population — 260/260, and
the skill doc pins the rule "refresh via the script on re-ingest, don't
re-derive"), matches the MP by **exact birth date** (never name-only — the
same discipline as `money-feed.ts`'s `bridgePerson`), and derives
corroboration + `role_valid_from/to` + `temporal_status` per tie. No LLM
anywhere in the loop; fleet mode writes payloads only, never
`review_state` — the human gate is untouched.

## The three-state and four-way vocabularies (reconcile-ares-vr.ts:12-25)

Corroboration is exactly the technique's three states:
`registry-confirmed` (one VR entry's birth date matches),
`conflicting` (record read in full, no match — or multiple people share
the date), `registry-unconfirmed` (check could not be attempted).
Temporal status, set only when confirmed, is the four-way verdict:
`current` / `historical` / `money-postdates-role` /
`historical-no-money` — with the paid-for reading rule P37: undated money
is `historical-undated-money`, never "postdates". The naive "contracts
signed while in role" boolean was tried and demoted for barely
discriminating (SKILL.md:37-38). Payoff measured on batch 001's head:
11/15 top-ranked ties were stale or money-postdates-role.

## Disclosure, not repair (tieFlags.ts:52-101)

The register's end date wins for arithmetic, but the override is disclosed
via `STALE_ONGOING_FLAG` ("the 'ongoing' period is stale") — written by
the reconciler *exactly when* the graph left the period open and VR has an
end; the card's copy says the end date comes from the registry and the
source's "ongoing" is inaccurate. On the live graph 42 of 211 ties carry
it. Sibling flags implement the technique's other rules:
`approximate-dates-no-day-precision` (old entries confirm only the year),
and `clean-handoff-not-revolving-door` — a machine trace that the role
ended and the stake passed to unlinked persons, whose copy explicitly says
"this is not a human confirmation of the tie". The flag dictionary is one
definition (`KNOWN_TIE_FLAGS`), and an unknown token is never hidden — it
renders literally with `known: false`.

## One classifier, imported (reconcile-ares-vr.ts:34-45)

The script is the main writer of `tie_class` and originally carried its
own copy of `classifyTie`, which drifted from the copy the UI reads (a
missing public-marker term flipped one waterworks company from `steward`
to `manager`, and the surface then read the disagreement as an
investigative correction instead of two vintages of one heuristic). The
fix imports the classifier from `features/money/reviewTypes.ts` — the
bundle's one-definition law enforced at the exact place a restated literal
had already lied once.
