---
layer: technique
type: technique
subject: acceptance-verdict-spine
technique: gate-check-dependency-map
status: forged
laws: [no-gate-self-certifies, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [designing a terminal shippability gate, a gate reports pass over a condemned upstream unit, an operator cannot tell what is blocking a check]
---

# Gate check dependency map

The named concern: **a terminal gate has no data of its own, so its verdict must be a
declared derivation over the resolved verdicts of named upstream units.**

## The map

Write the dependency down as data: each named check on the gate maps to the list of
upstream units whose acceptance it actually verifies.

```
"Rules unit test"      -> [ numeric attributes, economy ]
"Equip and use in-engine" -> [ animation set, inventory integration ]
"Visual review"        -> [ 2D icon, 3D mesh, material ]
"Performance budget"   -> [ 3D mesh, effects ]
```

Four properties come out of writing it down rather than computing it implicitly:

- The gate's meaning is **auditable by a designer**, not just by whoever reads the
  code. Someone can look at "Visual review" and say "that should also depend on the
  material variants" — a conversation that is impossible when the dependency is
  implicit.
- Coverage is **checkable**: a unit that appears in no check is a unit the terminal
  gate does not gate, and that is either intentional or a hole.
- The gate can **name its blockers** by unit, not by an aggregate score.
- The map is a single source, so the badge, the checklist rows, the log line and any
  banner detail derive from one evaluation and cannot disagree.

## The procedure

For each named check, for each dependency:

1. **No artifact at all** → a blocker with status *missing*.
2. **An artifact exists** → read its **resolved** verdict — the same merge every other
   surface uses, carrying which layer decided. Any status other than pass is a
   blocker recording both the status and the deciding layer.
3. The check passes when it has no blockers.
4. The check is **deferred, not failed**, when it has blockers and *every* blocker is
   itself deferred. A generator or a runtime that has not run makes the gate's own
   verdict unobservable; reporting a failure there is as dishonest as reporting a
   pass ([unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass)).
5. Render each blocker as the unit **and the layer that condemned it** — "icon
   (deferred · drain)", "brief (fail · judge)", "mesh (not produced)".

That last field is the operator's routing information. Without it they are told a
check is blocked but not by what kind of evidence, so they cannot know whether to fix
data, re-run the out-of-band runner, or re-judge.

## Read the resolved verdict; never re-derive it

The single most important rule here, and the one that fails in practice.

A gate that has access to its siblings' *raw produced data* can only re-run their own
local checkers. It sees no out-of-band outcome and no craft judgment. So the unit
that gates everything becomes the one place in the system where two of the three
authorities are invisible — and it prints success over units the rest of the product
shows as condemned. The concrete shape of this incident: an item-wide gate printed a
passing visual-review row while the icon it depended on was recorded, out of band, as
deferred with the reason "not a generated asset". The gate's own log line read
success.

The fix is **injection, not a store import**. The gate receives a resolver function —
"give me the resolved verdict for this sibling unit" — as part of its context. The
authoring surface fills it from its store, the headless path from its own. The gate
stays pure and context-fed, so it grades identically wherever it runs, and it never
becomes a second authority
([one authority per quantity](../../../_laws.md#one-authority-per-quantity)).

Two details make the injection practical:

- **A function, not a map.** Lazy resolution grades only the handful of units a given
  check depends on, instead of every sibling on every context build.
- **Optional, with a stated fallback.** A caller that cannot resolve verdicts — a
  rollup, a bare unit test — omits it, and the gate falls back to the sibling's own
  checker, *labelled as such* so the reduced evidence is visible in the output.
  Absence of context must never regress a satisfied unit; it must also never
  masquerade as full resolution.

## Decision rules

- **When a check has no dependencies, it is not a check.** Delete it or give it real
  inputs.
- **When a dependency is missing entirely, that is a blocker, not a skip.**
- **When blockers are mixed** — some failing, some deferred — report a failure. A
  known failure dominates an unknown.
- **When the gate is evaluated in more than one place, share the evaluation
  function**, not the intent.

## When NOT to use this

- **For a unit that grades its own produced data.** Derivation is for gates with no
  data; a primary check must read the artifact.
- **For rollups over hundreds of units.** This shape suits a bounded checklist a human
  reads. A large rollup wants aggregation with its own vocabulary for partial
  knowledge, not a blocker list.
- **When the dependency is genuinely dynamic** (which units exist depends on the
  content). Then derive the map from the content's own declaration — but still derive
  it explicitly, and still render it, rather than folding it into the evaluation.
