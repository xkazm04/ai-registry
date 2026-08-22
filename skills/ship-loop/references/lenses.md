# Audit lenses, the journey lens, and the CP0 questions

## The default lenses (read-only subagents, one per lens, fanned out in parallel)

Each lens returns: a 🟢🟡🔴 verdict for its dimension(s) · top 3-6 gaps with `file:line` evidence · one strength worth protecting. Findings are impact-ranked (frequency × reachability × cost), not by the severity word. Scope each lens tightly for a large codebase — "verdict + top gaps + evidence, **do not fix anything**, be concise" — and hand it the repo's context map (when one exists) to target files.

| Lens | Feeds | Inspects |
|---|---|---|
| **functional** | dim 2 (+ spot-checks dim 1) | Do modules/pipelines/commands actually *produce* (not stubs)? Are documented capabilities real? Honesty of claims vs docs and README. |
| **tests** | dim 3 (+ e2e coverage feeding dim 4) | Suite green? Meaningful coverage of stores/lib/API, load-bearing paths; skipped or disabled tests and why. |
| **uat / e2e** | dim 4 | Deterministic e2e status; which journeys are walked; whether a `uat/` overlay exists and how stale its certification is. Full UAT runs are backlog items, not lens work. |
| **value-capture / trust surface** | dim 5 | Billing, tiering, packaging, licensing, install/update path — or, re-pointed by the overlay, the product's real value surface (data contracts, acceptance ladders, bridge integrity, ground-truth derivation). |
| **security** | dim 6 | Auth boundary and route gating; secrets never logged/committed; file/script/spawn paths that can't traverse or exec arbitrary input; storage integrity; no secret in prompts or artifacts. |
| **ux** | dim 7 | Shared primitives reused (not hand-rolled); a11y floor (status not hue-only, text-size floor, focus ring); reduced motion; loading/empty/error states; theme variants. |
| **architecture-ops** | dims 1, 8 | Build health; module registries and store/persist patterns; docs in sync with code; CI story; scripts/hooks; release/deploy/signing/updater path; migrations; mid-refactor state. |
| **value-market** | dim 9 (or the ledger) | Is the tooling genuinely useful vs alternatives? Where is the defensible moat? Production-reality checklist → `value-case.md`. With journeys declared, this lens is replaced by the journey lens. |

The overlay's `Lenses` section may add lenses (e.g. a bridge-integrity lens for a product with an external engine) or rename these; the mapping to dimensions must stay explicit.

## The journey lens (only when the overlay declares value journeys)

Run per journey at boot and re-judged at every checkpoint:

1. Walk the journey end-to-end as its **owner persona** (the overlay names one per journey; reuse `uat/characters/*` when the repo has a UAT overlay) against the *current code*, not the docs.
2. Ask one question: "can they complete the loop today, honestly?"
3. Light: 🔴 broken/absent · 🟡 runs but a load-bearing step is missing, dishonest, or manual · 🟢 runs end-to-end, evidence-backed, tested.
4. Write the one sentence that says what the journey can and cannot do today, the **next slice** (the smallest change that moves the light), and the backlog items that slice needs (tagged with the journey).

A milestone that touches a journey re-judges its light at the gate. A milestone that neither moves nor protects a light should say so in the journal.

## CP0 — the four questions (AskUserQuestion, one at a time, single-keystroke answerable)

Adapt the options to the product; these are the shapes that worked:

1. **Ship bar — what does *done* mean?** e.g. "internal tool that reliably drives my loop" / "shareable dev tool others could run" / "distributable beta: a colleague can install + auto-update" / "public product path". With journeys declared, default: every light 🟢.
2. **Cadence** — *milestone* (batch 3-8 items → full gate → check in) / *continuous* (autonomous until the ship bar; stop only for product decisions that can't be auto-decided) / *per-item* check-ins.
3. **Milestone 1 cluster** — which theme or journey first (e.g. build/refactor green first · tests & e2e · the product's trust surface · product decisions · journey J1's next slice).
4. **UAT depth** — deterministic e2e only (each gate) / e2e + a live spot check / full character-driven UAT run (if a `/uat` overlay is adopted).

Then confirm the drafted `config.md` (gates order, dimension names, conventions). If AFK: provisional defaults in `decisions.md`, marked re-askable; proceed only with reversible non-decision work.

## CPn — after each milestone gate

Present milestone results (items closed with SHAs, gate line, ledger/scorecard delta), re-ask any deferred question, confirm auto-decisions taken while AFK, then recommend the next milestone.
