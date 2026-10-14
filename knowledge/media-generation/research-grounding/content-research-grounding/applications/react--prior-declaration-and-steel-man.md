---
layer: application
type: application
subject: content-research-grounding
technique: prior-declaration-and-steel-man
stack: react
status: forged
verified_on: 2026-10-14
---

# React: the steel-man field on a case tension (stat-reel board)

stat-reel's board brainstorm proposes use cases, each with a `tension`:
`{expectation, reality, strength}` where strength is "how checkable the claim
is" (`.claude/skills/board/references/case-brief.md`). The strength grade was
declared by the same author that wrote the tension, and nothing in the
record held the opposing case: `validateCaseIdea` in
`apps/server/src/library.ts` required only the three fields. A "strong"
tension therefore arrived unexamined, which is the failure this technique
names.

The prior-declaration half did not fit this seam: a brainstorm case is a
proposal with `data_status: "guess"` and an explicit instruction not to spend
time verifying, so there is no research run whose verdict could be classified
discovery or mirror. The steel-man half did.

## The change

`tension.counter = {provenance: found | constructed | absent, case, searched?}`.
Rules, in the technique's order: a `strong` tension must carry one; the
provenance mark is required so a constructed opposition is visible as
authored by the mind it opposes; `absent` must be dated (`searched:
YYYY-MM-DD`) and its `case` says what was searched; a surviving counter-case
is graded `moderate`, which the brief now says. A tension graded weaker than
strong may omit it, so the field costs nothing where the claim is modest. The
server validator and the board skill's mirror (`scripts/lib.mjs`) enforce the
same `counterProblems`, and a mirror test pins them together.

## Evidence

Arm A (old validator): a strong tension with no counter-case accepted, the new
steel-man test fails. Arm B: refused with a message naming the three
provenances; malformed or undated `absent` refused; moderate unchanged. 475
server tests, 41 board script tests, typecheck and biome ratchet green.

Not measured: whether authors write real opposition or fill the box with a
constructed line (the field marks that, it cannot prevent it), and whether
graded-down tensions change which cases the owner accepts. The mandate stops
at the brainstorm; a verification stage that gathers data is where a *found*
counter-case could be searched, and stat-reel has no such stage yet.
