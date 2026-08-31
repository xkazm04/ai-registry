---
subject: test-input-generation
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# test-input-generation

First touch: [[2026-08-31-tigerbeetle-blog]] — **subject created**, XL specced
and forged in the same session
(`docs/subject-proposal-test-input-generation.md`, EXECUTED). Six techniques:
`generator-bounds-the-space`, `swarm-feature-sampling`,
`negative-space-generation`, `exhaustive-when-bounded`, `model-based-oracle`,
`inside-out-invariants`. One application (`rust--generator-bounds-the-space`).

Placed beside `test-harness` on that subject's **own stated boundary** — "the
tests themselves assert facts; the harness decides which facts get checked" —
which excludes input generation by design. Adding these there would have
falsified the neighbour's opening paragraph.

The hole was corpus-wide and invisible to `research-map`: zero hits for
`deterministic simulation`, `swarm test`, `property-based`, `generative test`,
while all 56 `fuzz` hits are *fuzzy matching*. Established by concept grep with
proper nouns removed, not by the slug map.

`swarm-feature-sampling` is written from **Groce et al., ISSTA 2012**, not from
the source: the practitioner post states no limits, the paper states the
decisive one (omission loses when a defect needs several features at once).

## Open leads

- **Seed management** — recording, replaying and minimising a failing seed.
  Named as open question 4 in the spec and deliberately not absorbed. Adjacent
  to `flake-lifecycle` and to reproducibility; currently homeless.
- **A portfolio technique for generator classes.** The source's five-fuzzer
  taxonomy contributed two rows; the idealized-lab, single-subsystem-hammer and
  whole-system-performance rows are recorded untriaged in the source note.
- **Assertion discipline** as its own subject would be this subject's nearest
  new neighbour; two sightings so far, both one organisation, so it stays a
  lead.

## Single-stack debt

One application, `rust`. The techniques are language-neutral and the subject
would benefit from a `node` or `process` realization — a property suite in a
scripting ecosystem, or a generator design walked as a method.
