---
layer: application
type: application
subject: hitl-approval
technique: oracle-before-gate
stack: react
verified_on: 2026-08-31
verified_against: react@19
applied: simulation
ab_verdict: better
proof: structural-only
---

# A review queue that knows the verdict and does not use it (React)

The unified Backlog is the human review surface for machine-raised findings in
the Personas web client, and it is a clean instance of the technique's central
claim because it holds **both halves and joins neither**: every consequence term
is modelled, ordered and filtered on, and the one field that speaks to
verifiability is rendered as a badge and consulted by nothing.

## The census

Three functions in `src/features/overview/sub_manual-review/components/backlog/backlogModel.ts`
decide what a reviewer sees and in what order. Their terms, in full:

| function | line | terms |
| --- | --- | --- |
| `triageValueScore` | 77 | `impact`, `effort`, `risk` |
| `withinLevelRanges` | 159 | `effort`, `risk` |
| `hasLevelFilter` | 165 | `effort`, `risk` |

Three distinct terms across three functions. `impact` is what happens if the
item matters; `effort` and `risk` are what it costs to act and what it costs to
be wrong. All three are properties of consequence, which is exactly the axis the
subject's gate map already keys on — and the scorer is explicit about the
arithmetic: `impact * 2 - effort - risk`, "reward impact, charge for effort +
risk" (line 73).

The sort keys are six — `category`, `title`, `project`, `value`, `quick`,
`created` (line 100). Four are identity or metadata; `value` and `quick` both
resolve back to the same three consequence terms. **No ordering, scoring or
filtering path in the surface takes a verifiability term of any kind.**

## The field that is already there

`BacklogIdea` carries `verifyState: string | null` (line 35), populated from the
stored `verify_state` in `toBacklogIdea` (line 67), and the backend exposes a
writer for it (`src/api/devTools/devTools.ts:944-946`,
`dev_tools_set_finding_verify_state`, which also takes `verifyEvidence`). So the
tree has a per-item verification state *and* a place to record the evidence
behind it.

It is referenced four times in the Backlog surface. Two are the declaration and
the mapping above. The other two are renders — `<VerdictChip verifyState={…} />`
in `SwipeCard.tsx:119` and `BacklogDetailLedger.tsx:76` — plus one more as a
neutral tag in `triageAdapters.ts:755`. Every occurrence is plumbing or pixels.
Zero are decisions.

## The structural fact

This is the shape worth reporting, because nobody designed it. The team built a
verification state, gave it a durable column, gave it an evidence field, gave it
a writer command and a chip in two surfaces — and then wrote three decision
functions that do not mention it. No review rejected that; it fell out of
building the consequence model first and the verification model second, with
nothing forcing them to meet.

It is the technique's "decoration" clause in a tree that had every ingredient
for the alternative already sitting in the same file. A reviewer working the
queue sees the chip and can act on it with their own attention, but the queue
cannot: it cannot sort the checkable to the front, cannot filter the
unverifiable out of a focus session, and cannot report how many of the pending
items are pending because nobody can settle them.

## What A and B were

Three real cases from this tree, walked under the current model (A) and with a
verifiability term admitted (B).

1. **The focus deck's next card.** `BacklogFocusDeck` and `BacklogPanel` order
   by `triageValueScore`. A: two items with identical impact/effort/risk are
   interchangeable, and the deck hands over whichever sorted first. B: the one
   with a recorded verdict and evidence comes first, because it is the one the
   reviewer can finish. Falsifier: if `verify_state` is null across essentially
   the whole table, B reorders nothing and the term is dead weight until the
   scanners populate it.
2. **The effort/risk popover.** `withinLevelRanges` lets a reviewer narrow to
   cheap, low-risk items for a short session. A: "cheap" means cheap *to fix*.
   B: a session bounded by reviewer attention wants cheap *to judge*, which is a
   different set — a one-line change with no oracle is expensive here and the
   filter cannot say so. Falsifier: if effort and verifiability turn out
   correlated in the stored rows, the existing filter is already an adequate
   proxy and the second control is redundant.
3. **The pending count.** The panel reports how many items await a human. A:
   one number. B: the number split by oracle presence, per the technique's
   `count-carries-predicate` clause — the un-settleable remainder is the part
   that will be approved without being decided, and it is currently
   indistinguishable from the rest.

Verdict `better` on the strength of case 3, which needs no new data at all: the
`verifyState` column already exists and the split is a `groupBy` over rows the
surface has in hand. Cases 1 and 2 both carry a falsifier that depends on how
populated the column actually is, which this run did not query.

## What this realization cannot do

The proof here is `structural-only`. Nothing behavioural was run: the backlog
rows live in the application's local database, which this run did not open, so
the *distribution* of `verify_state` across real findings is unmeasured and all
three cases above are reasoned rather than observed. That distribution is the
one number that would move the verdict on cases 1 and 2 from argued to
measured — if the column is null everywhere, the finding is about a feature
nobody finished rather than about a queue that ignores what it knows.

The instrument that would settle it is a single count of stored findings grouped
by `verify_state`, which the existing `dev_tools` surface could answer without
new schema.
