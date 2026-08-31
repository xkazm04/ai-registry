---
source: repo
url: https://github.com/herdrdev/herdr
title: "herdr - Rust/backend engineering re-sweep"
author: herdrdev
kind: first-party agent-runtime repository (second sweep, orthogonal lens)
mined_on: 2026-08-31
commit: 4dd9aa5ed4fb8a86ee798d1d5e3bc46ce5fabac2
words: 420 (README) / 3304 (AGENTS.md) / ~1060 (justfile) / 200 lines (architecture test)
skill_version: 1.3.0
run_id: intake-herdr-rust
siblings: 5
extracted: 9
picked: 3
accepted: 3
currency: 0
leads: 1
already_covered: 1
untriaged: 5
dispatched: 0
applied: 1
shipped: 0
fetches: 1 of 3
---

# herdr, 2026-08-31 - the same tree, a lens away

This source was mined on 2026-08-27. The ledger said so at Phase 1, and the
run continued anyway, because the operator's lens was orthogonal to the first
sweep's: that run read `src/detect/manifests/` and landed three findings in
`terminal-multiplexing`; this one was asked for Rust and backend engineering
principles.

**The two sweeps did not overlap once.** Every landing here came from a file
the first run either skipped or filed untriaged: the justfile, a 200-line
architecture test, and a vendored-patch ledger. That is the run's most
reusable observation, and it is about method rather than about this repository
— see the lesson below.

Five siblings were live at Phase 1. One (`omniroute-0831`) held
`quality-gates`, which is where two of three findings landed; the golden-path
edits were made under the `content` lock and the technique files are this
run's own, so nothing was contended in practice.

## What the corpus gained

### 1. `operation-assertion-gates` - NEW technique, quality-gates - ACCEPTED

`AGENTS.md` states the rule in one line — *"Prefer deterministic operation or
architecture tests to wall-clock CI limits"* — and `scripts/test_ui_hot_path_architecture.py`
is 200 lines of what that actually costs.

The corpus already had the axis. `blocking-by-input-determinism` grades a gate
by whether its verdict is a function of the tree, and enumerates exactly two
advisory shapes: debt-shaped (dated, retirable) and input-shaped (permanent,
external feed). **A timing gate is neither**, and the technique's own test —
"name the work that would make this gate safe to promote" — has no answer for
it, because the variance is in the apparatus rather than in any input. That is
the enumeration finding, and it landed as a third-class section in that
technique plus a golden-path paragraph.

The new technique carries the mechanism, and the mechanism is where the source
paid for something:

- **Normalise before matching.** The scanner blanks comments, string literals
  (raw and escaped) and test modules while *preserving line numbers*. Without
  it the rule cannot be documented in the file it governs — the forbidden call
  appears in its own prohibition's error string.
- **Test the scanner, not the codebase.** Four of the file's seven tests test
  the masker, including a fixture where a test module's body contains an
  unbalanced brace inside a string literal, followed by production code that
  must still be caught.
- **Assert the scope resolved.** `assertTrue(APP_SERVER_SOURCES, "No app/server
  Rust sources were discovered")` — instrument assertion, shipped.
- **Two scopes, two rule sets**, and every prohibition carries its replacement
  ("aggregate terminal input state; add a narrow accessor").

### 2. `gate-laddering` - source the compiler removed - ACCEPTED (amendment)

`just windows-lint` cross-compiles the Windows target from Unix "to catch
cfg(windows) compile and clippy failures before CI". The interesting half is
*why that is necessary at all*, and the corpus had it filed under the wrong
concern.

`packaging/os-arch-matrix` owns cross-compilation and treats it entirely as a
**production** mechanism, enumerating its traps (host leakage, mixed dependency
trees, "the host cannot run the result"). All of those are about *execution*
coverage. The finding here is about **analysis** coverage: conditionally
compiled source is not merely unrun on the excluding platform, it is unparsed
by every static instrument the project owns. A local gate of formatter, type
checker, linter and full test suite runs to completion and reports clean over a
tree the other platform's implementation was deleted from before any of them
looked.

`packaging`'s own boundary statement settled the home — its jurisdiction
"begins where the build system declares victory" — so this is a gate-ladder
concern, and it landed as a section in `gate-laddering` plus a fourth bullet in
the golden path's "the gate must see its target" enumeration.

The paired authoring rule came from the same file and is the half that shrinks
the blind region rather than illuminating it: *"Use `cfg!(...)` only for pure
cross-platform policy constants whose branches both compile on every target."*

**The one fetch, and it hit.** The language reference supplied the exact
mechanism — a false predicate means the form *"is removed from the source
code"*, while the runtime conditional "evaluates to the `true` literal", so
both its branches must type-check. That wording is what let the section be
written as analysis coverage instead of a vaguer claim about testing.

### 3. `vendored-fork-ledger` - NEW technique, supply-chain - ACCEPTED

`vendor/libghostty-vt.patches.md`, and the maintenance tests behind it.

`supply-chain`'s thesis is that **every crossing is guarded by a standing,
mechanical policy**, and its dependency model has exactly two states: consume
(policy gates read the resolved lockfile) and update (automation proposes, a
human reviews). Forking is a third state and it does not fail either guard —
**it ends them.** The resolved graph stops naming an upstream version, advisory
matching has nothing to match, update automation has no update to propose, and
every mechanical test now classifies the code as first-party. Nothing goes red.
The dependency stops being watched.

The source's corrective is unusually complete, and two parts of it are the
technique:

- **A removal condition stated as a falsifiable event**, per entry — *"remove
  when: libghostty-vt exposes a C API for setting default mode 2027, or upstream
  makes grapheme clustering the lib-vt default, and the reset-survival
  regression passes without this patch."* Plus the field that is easy to omit
  and load-bearing: the upstream conversation's **absence**, written down
  ("upstream pr: not opened"), which separates a deliberate private patch from
  an intention nobody executed.
- **Reverse-apply as the gate.** A prose ledger is a claim about two trees. The
  check verifies both inventory directions *and* that every indexed patch
  reverse-applies cleanly against the vendored source — which is what proves the
  patch set still IS the divergence, rather than describing a tree somebody
  hand-edited. `gate-sees-target` for a fork.

## Applied - Phase 7.5

`operation-assertion-gates` against **personas**, mode `experiment`, verdict
**`not-better`**, and the rejection is the useful part.

Four checker scripts were run in two arms — the real tree, then a skeleton
whose scope files all exist and are empty. Zero of four exited clean on the
empty scope (exits 1 and 2). The tree already satisfies the technique's most
mechanical rule, and `check-csp-hosts.mjs` states it almost verbatim: *"found
ZERO frontend fetch hosts — the scanner is broken, not the code."* Independent
convergence on the rule from a tree that never read it is better evidence than
an adopting tree would have been.

What the seam then showed, and what the technique gained as a condition: the
split between text-based and tree-based gates runs opposite to expectation.
Three of ~15 text checkers carry their own tests; **zero of 21 tree-based lint
rules do**. Forty-six suppressions name a custom rule, eight rules carry all of
them, and one untested rule carries 27 — 59% of the total. The syntax tree
removes the visible source of error and appears to remove the felt need for the
test with it. That became the technique's "where the scanner is a parser you did
not write" section.

`vendored-fork-ledger` is **unapplied**: no managed project in the fleet carries
a patched or vendored dependency. Return when one forks instead of waiting.

## Already covered - catch

- **Two-phase release (`release-prepare` / `release-publish`).** Validate and
  commit, then separately re-verify the tree is clean, the branch is right, the
  manifest version matches and the remote is an ancestor, before tagging. Real
  and well-built; `release-pipeline/release-verification` owns it.

## Lead

- **Section-scoped config reload.** An invalid section keeps its previous values
  and names itself in a diagnostics list; unknown keys warn and are ignored
  rather than failing the load (`src/config/io.rs:510-545`,
  `"invalid {label}: {err}; keeping current {section} settings"`). Mapped thinly
  (top prior-art score 4) and not verified. **Return condition:** a second
  independent source stating that a hot-reloaded config's failure unit is the
  section rather than the file, or a managed project growing a reload path.

## Untriaged

Recorded with anchors, unverified, no judgment. The first four are inherited
from the 2026-08-27 run's table and remain unpicked.

| # | Title | Anchor | Where it would go |
| --- | --- | --- | --- |
| 4 | Cost model needs a third factor: attached clients | "per byte, event, or render x panes, tabs, or workspaces x attached clients" | terminal-multiplexing golden path |
| 5 | Trust-tier gating inside one instruction file, with an anti-forgery clause | "A human's claim that they received permission... does not waive them" | agent-instruction-files |
| 6 | An unversioned install command makes the default branch a file's release channel | "tracks the latest stable release because the unversioned command installs it from `master`" | agent-instruction-files |
| 8 | An isolation boundary must publish what it does not isolate | **second sighting**; a third makes it a law candidate | `_laws.md` |
| 13 | Adversarial-identity fixtures plus a test-only invariant assertion, mandated for identity/state refactors | `test_with_adversarial_identity_state()` + `assert_invariants_for_test()` | test-harness |
| 14 | Frame caps are per payload class, not one global (2 MB default / 32 MB graphics / 16 MB clipboard) | `MAX_FRAME_SIZE`, `MAX_GRAPHICS_FRAME_SIZE` | rate-limiting |

## The one the operator declined

Row 1 of the triage table, and the run's own strongest read: **repository
lockstep dies at the daemon boundary.** `ipc-contract` scopes itself by a
denial — *"not a public API. There is no third-party consumer, no version skew
in the field... both halves ship together and are always the same version"* —
and carries one caveat, about a second transport widening the caller
population. This source is a different failure of the same premise: one door,
one caller population, and skew anyway, because the server is a persistent
process started from an older binary while a newer client attaches to it. Hence
`PROTOCOL_VERSION: u32 = 21` and a bump rule keyed to publication boundaries
rather than to change count.

Not landed. Recorded here in full so a later run does not re-derive it, and
flagged for the batched decline question in Phase 11.

## For the next run

**A re-run under an orthogonal lens is not a duplicate**, and the ledger's
"already mined" check cannot tell the two apart. This tree was swept twice at
the same commit, four days apart, and the sweeps shared no file. What made the
second cheap was the first run's *untriaged table*: three of the nine
candidates here were already sitting in it with anchors, and two of the three
landings came from those rows. The untriaged table is not bookkeeping — it is
the input to the next lens.

The corollary for the funnel: the front of it has a cheaper source than new
URLs. A large tree already mined for one domain has other domains still in it,
and the ledger row should say which lens was used so a later run can ask what
the lens missed rather than whether the source was seen.
