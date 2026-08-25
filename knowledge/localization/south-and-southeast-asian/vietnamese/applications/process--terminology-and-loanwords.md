---
layer: application
type: application
subject: vietnamese
technique: terminology-and-loanwords
stack: process
status: forged
verified_on: 2026-08-24
---

# Term-stratum rulings in a real vi termbase — Personas

The Personas app's Vietnamese style guide
(`C:\Users\kazda\kiro\personas\docs\i18n\style-vi.md`, companion to
`docs/i18n/glossary.md`) is a worked instance of every rule in
terminology-and-loanwords: a ~25-row termbase, a recorded borrow-vs-translate
test, and three shipped incidents in `src/i18n/locales/vi.json`.

## The name-vs-concept test, stated as house law

The guide's loanword policy ends with exactly the VI-LOAN test: "is this a
**name** (Director, Brain, Cockpit, a tier's brand name, a model name) or a
**concept** (agent, vault, fleet)? Names don't translate. Concepts do." Its
casing split matches VI-LOAN-INVARIANT's boundary case: `Director`/`Brain`/
`Cockpit` stay capitalized as proper names (exactly one of each exists), while
`persona`/`twin`/`workflow` stay borrowed but lowercase and invariant, because
the user can have many — the guide explicitly notes `twin` takes no capital
*because* it is a common noun, unlike Director.

## Incident 1: the Sino near-synonym split (one concept, one rendering)

Shipped `vi.json` rendered *agent* as both `tác nhân` and `tác tử` — in the same
`sidebar` section (`agents: "Tác tử"` next to `all_agents: "Tất cả tác nhân"`),
and *persona* drifted between the borrowed form and `tác nhân`, collapsing two
product concepts into one word. This is VI-STRATUM's predicted failure: two
defensible Sino-Vietnamese compounds sharing the `tác` stem, split across
translators. The ruling (persona → borrowed everywhere; agent → `tác nhân`
everywhere; `tác tử` banned) is recorded in the guide's Pitfalls #1 so no later
pass re-litigates it.

## Incident 2: the calque with a wrong metaphor

*Healing* shipped as `chữa lành` — literally "to cure [a person]", importing the
medical metaphor the product's glossary explicitly forbids ("never medical
cure"): `"healing_started": "Đã bắt đầu AI chữa lành"` reads as if the software
is sick. The guide overrode it to `tự phục hồi` (self-recovery) — the
VI-TERM-AUTHORITY case where a rendering is a *correct literal translation* and
still a defect, and where the correction is recorded where the rule lives
(termbase row plus pitfall entry).

## Incident 3: a brand name translated into an adjective

The shipped file rendered tier names as descriptions — `tiers.starter_label:
"Đơn giản"` ("Simple") for the **Starter** plan — despite the glossary's "keep
the tier NAMES in English." The fix pattern is the split VI-LOAN teaches:
translate the word *tier* (→ `gói`), never the name (`Gói Starter`).

## Length-driven loan rulings

The termbase records slot-level loan fallbacks exactly per the VI-LENGTH ladder:
`lab` → `phòng thí nghiệm` in prose but the borrowed `Lab` in tight chrome, with
an explicit prohibition on inventing the initialism "PTN"; `credential` →
`thông tin xác thực` kept at 19 characters because "consistency beats brevity
here" — a deliberate refusal of per-string shortening that would fragment the
term.
