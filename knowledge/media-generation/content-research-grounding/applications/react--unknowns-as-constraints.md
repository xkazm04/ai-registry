---
layer: application
type: application
subject: content-research-grounding
technique: unknowns-as-constraints
stack: react
status: forged
---

# React: the constraint ledger (Gravitone notebook app)

The Gravitone review app scores every rendered script against the research
notebook's declared unknowns in
`app/_phases/script/constraints.ts` — the module's header names the contract:
*"every notebook `unknown` carries an `impact`, which is a rule about what
the script may not say… each render, scored against the limits the research
declared."* The consumer relationship is declared on the schema side too:
`pipeline/NOTEBOOK-SCHEMA.md:31` routes `unknowns[].impact` to "the render
gate — `script/constraints.ts` scores every render against each `impact`",
and `:32` gives `obligations` the same gate for the must-say sweep.

## The data shape

`CONSTRAINT_LEDGER` (`constraints.ts:39-58`) is a map of render id → rows of
`{unknownId, state, how}` with `state: "honoured" | "at-risk" |
"not-applicable"` (`:26`). Every render carries a row for every unknown —
including explicit not-applicable rows with reasons ("no liquidity claim"),
so an unchecked constraint can never masquerade as an inapplicable one. The
canonical at-risk row (`:44`) quotes the offending clause: *"'when Treasury
yields climbed … Bitcoin was sold' reads as causation. The notebook only
measured correlation and asks for 'moves with'. One clause away from
compliant."* — the render text is judged, not the writer's intent.

## The two structural fixes, as shipped

The file's comment block (`:6-21`) records the incident that forged the
technique's keying rules: rows once addressed unknowns **by array index**,
inline in the render module; resolving one unknown shrank the array from
four to three, every stored index pointed one slot left, the last pointed at
`undefined`, and reading `.impact` crashed the Script step. Both fixes are
structural, not null checks: (1) rows name unknowns by `id`, resolved
through `UNKNOWN_BY_ID` (`:23`); (2) resolved unknowns are *kept* in the
notebook, which enables the derived `EffectiveState` `"superseded"`
(`:28-31`) — a render honouring a since-lifted constraint is flagged as
over-hedged, not passed.

`ledgerFor()` (`:79-104`) applies the remaining rules: a row whose unknown no
longer exists lands in `dangling` — *"surfaced, never hidden: it means the
render was scored against a rule that has vanished, and the score is
therefore incomplete"* — and the result exposes `atRisk` and `superseded`
counts for the UI. The closing comment at `:20-21` states the invariant: a
row that cannot resolve is reported, not dropped — "a ledger that quietly
renders four rows as three is the same defect wearing a guard clause."

## The neighboring gate: syntheses are not facts

The same notebook layer separates model reasoning from research findings in
`app/_phases/_shared/notebook/conclusions.ts:1-45`: conclusions are **off by
default** ("a fact is in-scope until you cut it; a conclusion is out until
you let it in — the asymmetry is the safeguard"), each states its *leap*
past the evidence and its falsifier, and — the file's hard-won correction —
leap (distance from evidence) and *subject* (distance from an accusation)
are orthogonal axes: *"a falsifiable defamation is still defamation.
Disprovable is not printable."* Naming rules hang on `subject`, never on
`leap`. Together the two modules are the render gate's two halves: unknowns
bound what facts may say; the conclusion gate bounds what reasoning may
enter at all.
