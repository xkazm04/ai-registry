---
source: github:storytold/wordcraft
kind: repository
url: https://github.com/storytold/wordcraft
title: "storytold/wordcraft: a Rust word processor, read for Rust coding excellence (panic containment and lint policy)"
author: storytold
words: 2614 (landing page via ingest); in-tree sweep read about 5,500 words of operating documents (AGENTS.md, architecture.md, xtask layering rules) plus 9 Rust files
extracted: 8
accepted: 2
declined: 0
leads: 2
already_covered: 2
untriaged: 3
dispatched: 0
applied: 2
shipped: 0
run_id: wc-1014
siblings: 2
rescan_when: a workspace lint table appears in the root manifest (the panic-deny set moving from per-crate attributes to workspace lints); or the layering checker gains a lint-presence rule; or 8 weeks elapse (2026-12-09)
---

# A Rust word processor read for panic containment and lint policy

**Class:** vendor-style repository over a system in the tree (85k lines, 15 crates).
The ingest returned the landing page (2,614 words), the advertisement. The run
cloned the tree at `04f6f53b8a4d` (2026-10-14), swept the operating documents
(`AGENTS.md`, `docs/architecture.md`), the instrument (`xtask/src/layers.rs`,
the lint config, the manifest) and the failure paths (`Session::run`, the
decoder and protocol-handler catches, the panic hook, the sweep test). The 9,000-word
roadmap, the parity documents, the layout and rendering crates and the 800 tests
were **not read**. Siblings live at start: 2 (`if1014`, `rvg-1014`), holding
unrelated subjects. Fetches: 0 of 3 (the tree is the primary).

Operator focus: Rust coding excellence. Prior-run focus: apply (named weakest).

## Design record (routing count)

| decision | forces | corpus |
| --- | --- | --- |
| Catch an escaped panic at the one command chokepoint, convert to the ordinary error, restore a whole snapshot | a crash loses the user's writing; nested commands move the history stacks | NONE; nearest crash-capture (reports, does not restore) |
| Wrap each foreign-bytes parser and the foreign protocol handler | hostile input to code the team did not write | NONE (folded into the same technique) |
| Deny the panicking constructs at every crate root; tests exempt by config | prevention must be cheap enough to hold | prose-rule-drift owns the gate-gap half (application written) |
| Sweep every registered command with junk parameters | a new command is fuzzed without anyone remembering | catch: rule-registry-enumerated-fixtures, stage-ordered-fuzz-targets |
| Crate layering table with intra-layer order and UI-toolkit ban | the UI must stay swappable and the core must build on the web | catch: layering-rules family; not read in depth |

Routing count: NONE = 1 mechanism (containment, with its two edge doors folded in),
so one technique. Fewer than three: no forge handoff. `resilience/` is at the
ten-child cap, so a subject for panic policy could not have been placed there
anyway (V1); the technique went into error-handling beside crash-capture.

## Triage

| # | Candidate | Impact | G/R/C | Decision |
| --- | --- | --- | --- | --- |
| 1 | containment boundary restores state, three doors, net not licence, unwind-absent targets | new-technique | 3/1/2 | accepted, landed |
| 2 | panic rule: lint set present at 18 of 19 roots, absent at the one unguarded root; indexing rule prose-only; gate selects 2 packages | fills-stack-gap (application) | 2/0/2 | accepted, landed as application |
| 3 | registry-enumerated junk-parameter sweep | none | - | already covered (rule-registry-enumerated-fixtures) |
| 4 | layering table with intra-layer order | none | - | already covered (layering family), not read in depth |
| 5 | parity floor that only rises | - | - | untriaged: ratchet shape; anchors `crates/engine/src/catalog.rs`, `xtask/src/parity.rs`; not verified against quality-gates |
| 6 | clean-room asset attribution gate (`cargo xtask assets`) | - | - | untriaged: anchors `xtask/src/assets.rs`, `ATTRIBUTION.md`; provenance subject not read |
| 7 | typing-parity doc pinned by tests | - | - | untriaged: anchors `docs/typing-parity.md`, `crates/engine/src/tests_typing.rs` |
| 8 | web target has no unwind: lint set is the only defence | corrects-claim | - | folded into 1 as its final section |

Leads: (a) the sweep skips the file-reaching commands and tries four junk values; a
measured sweep that adds them is a lead, return condition "when a project builds a
registry-sweep arm"; (b) a presence gate for the deny set, return condition "when a
fleet Rust workspace adds a workspace lint table".

## Phase 7.5 (apply)

Mode `experiment`, verdict `unmeasurable` on both rows. The seam for row 2 was chosen
to falsify the claim that the fleet shares the gap: personas holds the rule as a
measured ratchet (94 unwrap and 78 expect sites, commented out with an enabling
condition), tracklight and pumper hold nothing. That refuted "no fleet project
has thought about it". Row 1: three fleet workspaces already contain at job and tick
boundaries, which made the technique's service-versus-document boundary explicit and
was written into the technique. No project change shipped: the priced arm (a
workspace clippy run per project) was not run. Instrument named in the applications.
