---
layer: application
type: application
subject: companion-runtime
technique: action-catalog-single-source
stack: react
status: forged
verified_on: 2026-09-23
verified_against: react@19
applied: experiment
ab_verdict: better
---

# The surfaces over the op catalog: one gated, two tolerant (Personas / Athena)

The companion's action vocabulary is declared in Rust (`ALLOWED_ACTIONS`,
`src-tauri/src/companion/dispatcher/catalog.rs:11`; see the rust application for
that side). The React frontend ships in the **same desktop bundle** as that
catalog — one Tauri application, one release — so a frontend and a backend of
different versions never run against each other. Three frontend tables hold a
per-kind judgment or rendering, and they are the evidence for the technique's
"exhaustive when they ship together, tolerant when they do not" condition, one
case on each side of it and one that has crossed over.

Read on 2026-09-23 at `1b8161096`; React `19.2.6` installed (`package.json:167`
declares `^19.2.6`).

## Confirmed: a risk table that names both arms, pinned by reading the Rust source

`actionRisk.ts` (`src/features/plugins/companion/decision/actionRisk.ts`)
classifies each approval action as `low` or `elevated`, which decides whether the
orb recommends approving it. Its header records why it exists (`:6-21`): the
recommendation used to key off an eight-name `Set` inlined in `useDecisionQueue`,
"a second, unchecked copy" of a 56-entry vocabulary, so "every action added after
the list was written shipped as 'look closer'" — including `write_procedural`,
the twin of the `write_fact` it did carry. Landed 2026-09-17 (`8331e5d1b4`).

Three details carry the technique:

- **Both arms are named.** `LOW_RISK` (`:48`) and `ELEVATED_RISK` (`:80`) are both
  explicit, and `isClassified()` (`:151`) asks whether an action was weighed at
  all. The test says why in one line: "With only a low table every string would
  be elevated by fallthrough and this assertion could never fail"
  (`__tests__/actionRisk.test.ts:42-48`). Behaviour still defaults cautious —
  `actionRisk('some_verb_shipped_tomorrow')` is `elevated` (`:84`).
- **The pin reads the declaring language's source.** `allowedActions()`
  (`actionRisk.test.ts:21`) opens `catalog.rs`, regex-extracts the
  `ALLOWED_ACTIONS` block, strips comment lines, and compares in both directions:
  every backend action is classified (`:42`), and no classification names an
  action the backend dropped (`:50`). No codegen was needed.
- **It carries the instrument check.** "reads a non-empty allow-list (instrument
  check)" (`:36`) asserts more than 20 names were parsed: "A regex that silently
  matched nothing would make every assertion below pass while checking nothing."

The file names its own next step (`actionRisk.ts:19-21`): "The durable fix - a
`risk` field on the Rust catalog, exported through a binding - … would replace the
table below with a read." That is the technique's "judgment as a column on the
table".

Two actions it classifies, `compose_dashboard` and `compose_cockpit`, are kept in
a separate `NON_APPROVAL_LOW_RISK` list (`:134`) so the drift test does not read
them as stale — a small instance of the per-producer condition: they reach the
surface by a path that is not an `ALLOWED_ACTIONS` approval.

## Deviation: a label switch with a tolerant fallback inside one bundle

`actionLabel()` (`src/features/plugins/companion/athenaLabels.ts:31`) is a
`switch` over the action string whose `default` returns `titleCase(action)`
(`:112-113`). The header states the reason and the procedure (`:7-16`): the
fallback exists so users see English-ish text "if a backend update adds a new
slug ahead of the frontend", and adding a slug means "Add a key … Add the case
here … No-op in the consuming component". No test compares the cases to the
catalog.

In this product a backend update cannot arrive ahead of the frontend; they ship
together. So the fallback guards against a skew that does not occur, and hides
the drift that does. Measured 2026-09-23 by extracting both sets from source:
the switch has 36 cases against 56 `ALLOWED_ACTIONS`; **22 approval actions have
no case** and render through the title-case synthesis (among them
`remote_instruct`, `dev_merge`, `set_ship_scope`, `fleet_resume`,
`canvas_dispatch`), and the two cases outside the list are the same
`compose_dashboard` / `compose_cockpit` pair as above. The label reaches every
approval card through `ApprovalCard.tsx:83` and the orb's decision prompt
(`decision/useDecisionQueue.ts`, `actionLabel(t, approval.action)`).

The shape that `actionRisk` already proved works here unchanged: a test reading
`catalog.rs` that fails on an unlabeled action. The tree also already has the
generator shape that would make it a type error instead — `src/lib/commandNames.generated.ts`
is a union generated from Rust source by `scripts/generate-command-names.mjs`.

## Deviation: a status vocabulary with a raw-token fallback

`DevOpLedger.tsx` (`src/features/plugins/companion/DevOpLedger.tsx:89-109`) maps
the dev-op status tokens to labels and tones through nested ternaries that fall
back to the raw token and to a grey dot. The type it reads declares `status:
string` (`src/api/companion.ts:421`) and lists the five tokens only in a comment
(`:415`). This is a status vocabulary rather than an action vocabulary, but it is
the same co-deployed-fallback case: a sixth backend status would render as its
identifier with a neutral tone, and nothing would fail. The same file's
neighbour `ChatCardStatus` (`src/api/companion.ts:1927`) is a closed union, which
is the shape this one lacks.

## Applied 2026-09-23 - the co-deployed label surface, read-only experiment

The label switch has 36 cases; 22 of 56 accepted kinds, and 25 of the 59 kinds that can
reach an approval card, have none and render through the title-cased-slug fallback. In
the live store 18 of 120 approval rows (5 of the 16 kinds in use) were carded through
that fallback. The falsifier for "cannot be out of step inside one artifact" is a stored
row that outlives a release: rows do cross releases (8 pending for 44 days), but 0 of
120 carry a kind outside the current table, and approvals are excluded from the data
export, so no row arrives from another install. A generated exhaustive union would turn
all 22 into build errors. Return: the first time a kind is retired while rows of it are
pending - the first live test of the tolerant arm.
