# Subject spec — `dependency-declaration`

**Status:** EXECUTED (2026-08-31, `/intake` run `verou-xl`)
**Origin:** `librarian/sources/2026-08-31-verou-2026-blog.md`, untriaged rows 8–11,
folded into one subject rather than banked as four leads.
**Bundle / category:** `software-engineering` → `engineering-process/codebase-stewardship`
(layout `nested`; the category holds 6 subjects and no subcategories, so a 7th
subject is a legal placement and adds no depth. Verified against
`knowledge/software-engineering/taxonomy.json`, which is the authority — not
against a folder listing.)

## Why a subject and not a technique

The source produced four candidates that each looked standalone at extraction and
turned out to be one subject's worth of material:

| Row | Candidate | Becomes |
| --- | --- | --- |
| 8 | locality / composability / scalability, three invariants a declaration mechanism must hold | `declaration-invariants` |
| 9 | a convenience binding that is the *only* entry point becomes architectural debt | `shortcut-is-not-the-substrate` |
| 10 | an advanced tool priced into a basic, ubiquitous need is a usability cliff | `declaration-cost-floor` |
| 11 | **purview** — not syntax, not immutability — separates a logical name from an address | `logical-name-or-address` |

Two more fall out of the same source once the frame exists: a self-contained
vendored copy outsources composition rather than avoiding it, and the scalability
invariant's remedy is progressive resolution rather than upfront enumeration.

Six techniques with one shared question — **how does a unit name what it needs,
and how does that name become a thing?** — is a subject.

## The boundary that makes it a new subject rather than an amendment

The three neighbours all touch dependencies and none owns this question:

- **`module-design`** owns *where a boundary belongs*. This owns *how a boundary
  is crossed by name*. Its `locality-and-leverage` technique defines locality for
  **code structure** ("things that change together live together"); this subject
  applies that same law to **declarations** and must cite it rather than restate
  it — a library's dependency list changes exactly when the library changes, so a
  mechanism that forces the list into a host document violates the corpus's own
  locality rule, and that argument is borrowed, not minted.
- **`optional-dependency-degradation`** owns *what runs when a dependency is
  absent*. This owns *how it was named in the first place*. The test: if the
  question is "what happens when it is not there", that subject; if it is "who
  wrote down that we need it, and how did the name resolve", this one.
- **`supply-chain`** owns *trust and provenance* of what resolution produced —
  policy gates, vendored-fork ledgers, permission scoping. This owns the shape of
  the resolution mechanism, which is a design question and not a trust question.

## Proposed techniques and the decision rule each must carry

1. **`declaration-invariants`** — locality / composability / scalability, and the
   diagnostic each failure produces. Decision rule: score a proposed mechanism on
   all three before adopting it; a mechanism that fails one predicts a specific
   downstream cost, and the three costs are different.
2. **`logical-name-or-address`** — when a reference should be a context-resolved
   logical name and when a globally-resolvable address. Decision rule: the
   discriminator is **purview** — who controls what the name resolves to — and
   explicitly *not* syntax or immutability, both of which are plausible and wrong.
3. **`progressive-resolution`** — resolve names as the graph is walked versus
   enumerate every transitive edge upfront. Decision rule: enumeration is viable
   only where the full set is known to one party at declaration time.
4. **`shortcut-is-not-the-substrate`** — a convenience binding that is the only
   entry point. Decision rule: ship the shortcut, but the capability must also
   exist beneath it, or it inherits every constraint of its binding.
5. **`declaration-cost-floor`** — what it costs to add one dependency. Decision
   rule: advanced tools for advanced needs is correct; the defect is a
   *foundational* capability whose price of admission is an advanced tool.
6. **`vendored-copy-loses-composition`** — the self-contained bundle. Decision
   rule: it does not avoid composition, it relocates it and loses deduplication
   across the tree.

## Boundaries this subject must NOT absorb

- Trust, provenance, licence and update policy for third-party code (`supply-chain`).
- Runtime behaviour when a dependency turns out to be missing
  (`optional-dependency-degradation`), including the new
  `fallback-retirement-condition`.
- Where module boundaries belong and how deep a module should be (`module-design`).
- Packaging and artifact production (`packaging`, `build-economics`).

## Open questions the drafter had to decide

- Whether `declaration-cost-floor` is a general platform-design doctrine rather
  than this subject's property. **Decided:** kept, but scoped strictly to the cost
  of declaring one dependency, which is measurable, rather than to tiering in
  general, which is not.
- Whether to write the invariants as a law. **Decided: no.** One source, one run;
  laws need convergence across runs. Recorded as a lead in the source note.
