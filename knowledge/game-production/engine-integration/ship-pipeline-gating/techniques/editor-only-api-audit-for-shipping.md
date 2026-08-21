---
layer: technique
type: technique
subject: ship-pipeline-gating
technique: editor-only-api-audit-for-shipping
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [code compiles in development and must survive a shipping configuration, auditing a source tree for capability that does not exist in the shipped build, a symbol resolves locally and fails on the build machine]
---

# Editor-only API audit for shipping

## The concern

A capability exists in the development configuration and is absent from the shipped one.
The compiler will catch some of these and not all: a call may be guarded by a
conditional-compilation symbol that is defined in both configurations, or reachable
through an indirection the compiler cannot see, or present in a build that is compiled
in a mode nobody tests. The class of bug is **configuration-conditional capability**: the
same source producing meaningfully different programs depending on a symbol nobody
inspects, where the difference is only observable in the configuration that ships.

This is not specific to any one toolchain. Every system with a rich development
environment and a stripped runtime has it: authoring-time reflection stripped from the
runtime, debug-only diagnostics compiled out, a hosting API present only when a
supervisor is attached, a test-only injection point. The audit is the cheap static
observer of that class.

## Procedure

1. **Enumerate the tokens.** Maintain an explicit list of the identifiers whose
   availability is configuration-conditional. Curate it: the value is in a short list of
   genuinely dangerous names, not in a long list that produces noise and gets muted.
2. **Enumerate the guard symbols.** For each token, record which conditional-compilation
   symbols legitimately guard it. A token guarded by the *right* symbol is correct code;
   the audit's job is to tell that from the alternatives.
3. **Scan with a guard stack, not a text match.** Walk each file line by line,
   maintaining a stack of open conditional blocks. On an opening directive, push the
   symbol it tests; on the closing directive, pop. When a token is found, the verdict
   depends on the stack contents at that line.
4. **Classify each hit into three outcomes**, not two:
   - guarded by an accepted symbol → correct, no finding;
   - guarded by some other symbol → **finding**, and the high-value one, because a naive
     scanner reports it clean;
   - unguarded → finding.
5. **Scan the dependency declarations too, not only the call sites.** Pulling in a
   configuration-conditional header or module is a violation in its own right and an
   independent one: the dependency fails to resolve in the shipped configuration whether
   or not anything in the file ever calls into it. An audit that only looks at usage
   misses the whole class.
6. **Ignore what is not code.** Strip trailing comments before matching, or every
   commented-out line and every explanatory note about the token becomes a finding, and
   the check is muted within a month.
7. **Report location and guard state.** A finding says the file, the line, the token, and
   the enclosing guard (or its absence). A finding that says only "token present" costs
   the engineer the whole investigation the scanner already did.
8. **Treat unscannable files as unscanned.** A file that could not be read or whose
   directives did not balance is a third verdict. It must not be counted among the clean.

## Why the nesting matters

A grep for the token fails in both directions, and the two failures are unequal.

- **False positives** on correctly guarded code: every legitimate use is reported.
  Survivable but corrosive — a check with a high false-positive rate is disabled within
  two sprints, and then it catches nothing.
- **False negatives** on code guarded by the wrong symbol: the scanner sees a guard
  nearby, or a naive "is this line inside any conditional block" heuristic reports it
  safe, and the defect ships. This is the failure the technique exists to prevent, and it
  is only preventable by tracking which symbol is on the stack.

Nesting compounds it: an accepted guard inside a rejected one, or the reverse, is common
in real code and is exactly where hand-reasoning fails. The stack answers it mechanically.

**The alternative branch inverts the guard, and a stack that ignores that is wrong.** A
conditional's else-branch is at the same nesting depth but under the *negation* of the
condition — code there is reached precisely when the guard symbol is undefined, which is
the shipped configuration. A scanner that keeps the stack unchanged across the
else-directive treats that branch as guarded and returns clean on the single most
suspicious placement in the file. Push the negated condition on the alternative branch;
the depth is unchanged, the truth value is not. This is a small implementation detail
with a large blast radius, and it is the first thing to check in any guard-aware scanner
you inherit.

## Decision rules

- **When a hit's guard stack contains no symbol from the accepted set, report it** — even
  if it is guarded by something. "Guarded" is not the property that matters; "guarded by
  the symbol that is actually undefined in the shipped configuration" is.
- **When the token list grows past what a person will read, stop growing it.** Split into
  a fatal tier and an advisory tier rather than diluting one list.
- **When a finding is a known, reviewed exception**, record the exception at the site in
  a form the scanner reads, not in a side file. A suppression list that lives away from
  the code goes stale silently.
- **When the audit and the compiler disagree**, the compiler is not automatically right.
  It compiled the configuration you asked for; the audit is about the configuration you
  did not.
- **Run it in preflight.** Its evidence is the source tree, which exists before anything
  expensive starts, so its placement is the front of the pipeline.

## When not to use this

- When the shipped and development configurations are genuinely identical — a pure
  interpreted deployment with no build-time stripping. Then the class does not exist and
  the scanner is theatre.
- When the toolchain can give a hard link-time or load-time error for the whole class.
  Prefer the toolchain: it is exhaustive where the token list is curated. Keep the audit
  only for the residue the toolchain cannot see.
- As proof that the shipped configuration is correct. This is a static audit against a
  finite list of known-dangerous names. It cannot see a capability nobody put on the
  list, and it cannot see runtime divergence with no textual signature. It reduces the
  probability of one class of failure; it is not a statement about the built artifact,
  and the artifact-level gates still run.
