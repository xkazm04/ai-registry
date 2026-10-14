---
layer: application
type: application
subject: test-input-generation
technique: model-based-oracle
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# A set-algebra model for query semantics, run through the real binary (cass)

The tree is cass (coding_agent_session_search), a Rust CLI that indexes local
coding-agent transcripts and answers Boolean, time-window and filter queries over
them. Read at commit `7fc01958d367`. The stack version is the toolchain pin (nightly 2026-08-31, written as a dotted date); the crate version is
`Cargo.toml:3 "version"` (0.10.0); the toolchain is a dated nightly pinned in
`rust-toolchain.toml` with no release number. The test file was read, not run.

## Why it exists

An internal audit of the project's documentation against its behaviour found the
query language wrong in a way thousands of example tests had not seen: OR bound more
tightly than AND and parentheses were ignored
(`docs/planning/REALITY_CHECK_AND_BRIDGE_PLAN_2026-09-01.md:238 "OR binds tighter than AND and parentheses are ignored"`).
The audit grouped its findings into classes, the first being silent substitution
(`docs/planning/REALITY_CHECK_AND_BRIDGE_PLAN_2026-09-01.md:332 "silent substitution"`),
and named metamorphic relations as the oracle for the wrong-answer class
(`docs/planning/REALITY_CHECK_AND_BRIDGE_PLAN_2026-09-01.md:343 "metamorphic relations (OR monotone up, AND down"`).
That is the technique's motivating case almost exactly: a well-formed wrong answer
invisible to every check of shape, found by holding an independent model of what the
answer should be.

## The shape

`tests/search_metamorphic.rs` generates a corpus whose meaning is known before
anything is indexed: 22 sessions across two agent formats and two workspaces, ten
messages each, five invented terms assigned to each message with a fixed probability
(`tests/search_metamorphic.rs:268 "next_random(&mut rng) % 100 < 40"`), driven by a
deterministic generator so the corpus is identical on every run
(`tests/search_metamorphic.rs:220 "Deterministic xorshift, so the corpus is identical on every run."`).
It indexes that corpus with the shipped binary and then requires every query's hit
set to equal what a small reference computes from the known map: union for OR,
intersection for AND, difference for NOT, exact subsets for time windows and for
workspace and agent filters
(`tests/search_metamorphic.rs:6 "small set-algebra reference computes: OR is union"`).
The Boolean grammar is checked over fixed precedence cases and over seeded random
expressions (`tests/search_metamorphic.rs:14 "cases and over seeded random expressions"`):
forty of them, from one fixed seed
(`tests/search_metamorphic.rs:660 "let mut rng = 0x0052_21B0_u64;"`).

## Which rung, and which model-building rules

**Rung 3, a reference model.** The reference is a recursive evaluation over ordered
sets (`tests/search_metamorphic.rs:589 "fn eval(&self, corpus: &Corpus)"`), and a
disagreement prints the missing and unexpected message ids per query
(`tests/search_metamorphic.rs:361 "missing {missing:?}, unexpected {extra:?}"`). It
catches exactly the class rungs 1 and 2 cannot: a search that returns a plausible,
well-ordered, wrong set.

- **Written from the specification: satisfied, by an unusual construction.** The
  generator does not produce query text and then parse it; it produces an expression
  tree and renders text that the documented grammar parses back into that tree
  (`tests/search_metamorphic.rs:610 "Query text that the documented grammar parses back into"`),
  choosing operator spellings and redundant parentheses at random. The model never
  parses anything. The system's parser is therefore under test and the model shares
  no code with it, which is the strongest form of independence the technique asks for:
  the two sides do not merely come from different authors, they do not perform the
  same operation.
- **Optimized for obviousness: satisfied.** Set union, intersection and difference
  over a few hundred ids, recomputed per query. Nothing in it needs a second reading.
- **Models the observable contract: mostly satisfied, with one accommodation.** The
  generator keeps terms out of each session's first message because that message
  becomes the title, which is indexed with every message of the conversation
  (`tests/search_metamorphic.rs:260 "The first message becomes the title"`). That is
  internal layout leaking into the model's world. The model does not encode it; the
  generator steers around it, so the term-to-message contract is checked only in the
  region where the title rule cannot interfere, and the title rule itself is outside
  the oracle.
- **Discard counting: present in the form this generator needs.** Every generated
  expression is valid by construction, so there are no first-hop rejections to count.
  What can waste the budget instead is a case whose reference answer is empty or the
  whole corpus, which no engine can fail informatively. The test counts those and
  requires at least half of the forty to be informative
  (`tests/search_metamorphic.rs:713 "informative >= 20,"`), and a separate relation
  checks that the reference sets are non-trivial so an engine returning nothing or
  everything cannot pass by accident
  (`tests/search_metamorphic.rs:364 "so an engine that returned nothing or"`). This is
  the technique's discard-fraction signal translated to a generator that cannot emit
  invalid input.

## The round trip on an output channel

The technique's normalize-once rule is asserted on an output the system makes about
itself. With metadata enabled, search echoes the grouping it actually searched; the
test searches that echo, requires the same hits, and requires the echo of the echo to
be identical (`tests/search_metamorphic.rs:707 "is not a fixpoint: it echoes"`). The
first hop is the generated text, which the system is free to normalize; the assertion
is that the normalized form is a fixed point. That turns an explanatory field, which
nothing else would ever check, into part of the tested contract.

## Two implementations, one model

The same fixed cases and the same forty expressions run a second time against the
SQLite full-text fallback lane, opened read-only with no lexical index present
(`tests/search_metamorphic.rs:807 "fn the_fts5_lane_answers_the_same_sets()"`), and
queries that lane cannot express go through its source scan
(`tests/search_metamorphic.rs:803 "Queries FTS5 cannot express (standalone NOT,"`). A
defect shared by both engines is still caught, because the comparison is to the model
and not between the lanes. A deletion relation adds a negative control first, proving
the forgotten session contributed hits before it was forgotten, so the relation can
fail (`tests/search_metamorphic.rs:735 "Negative control: the session contributes term hits before the forget"`).

## What the realization cannot do

- **Explore.** One seed and forty expressions of depth three make this a generated
  regression suite, not a search. The same forty inputs run forever; a precedence
  defect that needs depth four or a sixth term is out of reach until someone changes
  the seed or the bounds.
- **Shrink.** A failure prints the case and its set difference. At depth three over
  five terms the cases are already small, so this costs little here, but nothing
  reduces a failing expression to its minimal form.
- **Check ranking or snippets.** The model predicts membership only; the order and the
  excerpt of each hit are outside it.
- **Show that the model has ever been wrong.** The tree records the audit finding the
  implementation wrong; it keeps no record of a disagreement resolved in the system's
  favour. The technique reads a model that has never been wrong as a warning sign.
  Here the tree-instead-of-text construction makes derivation from the implementation
  unlikely, but the record that would prove it is absent.

## What the tree's shape says about the technique

It confirms rung 3 on the technique's own motivating class, and it adds a
construction worth naming: when the system's job includes parsing a notation, generate
the meaning and render the notation, so the model never parses and cannot share the
parser's misreadings. It also shows the boundary of model independence: the generator,
not the model, is where internal layout leaks in, here as a region of the input space
the oracle silently declines to cover.
