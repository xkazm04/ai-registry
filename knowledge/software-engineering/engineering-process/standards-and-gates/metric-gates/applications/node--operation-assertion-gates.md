---
layer: application
type: application
subject: metric-gates
technique: operation-assertion-gates
stack: node
verified_on: 2026-10-31
verified_against: node@22
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A desktop product that already refuses an empty scope

A cross-platform desktop application ships two kinds of hand-written
assertion gate: roughly fifteen standalone checker scripts under `scripts/`
(`check-csp-hosts.mjs`, `check-event-registry.mjs`, `check-command-contract.mjs`,
`check-themes.mjs` and siblings), and twenty-one custom lint rules under
`eslint-rules/` that run inside the linter against a parsed syntax tree. Both
families are the technique's subject: rules about what the source text may
contain, enforced by reading it.

The technique was tested here on its most mechanical claim — *refuse an empty
scope as a fatal error* — and the tree **rejected it as an improvement**,
because the tree already does it.

## The paired run

Two arms, same four checkers, same interpreter. Arm A ran each checker against
the real repository. Arm B ran the same file from a skeleton directory whose
scope files all exist and are empty, so every scan resolves and returns nothing
— the exact condition under which
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
predicts a false green.

| checker | arm A (real tree) | arm B (empty scope) |
| --- | --- | --- |
| `check-csp-hosts` | exit 0 | exit 2 |
| `check-event-registry` | exit 0 | exit 1 |
| `check-command-contract` | exit 0 | exit 1 |
| `check-themes` | exit 0 | exit 2 |

Zero of four passed on an empty scope. The measurable named before the run —
*count of checkers that exit clean having read nothing* — was already zero, so
applying the rule moves it nowhere. `not-better`, and the arm count is four.

The messages show the refusals are designed rather than incidental, which is the
distinction that matters: an uncaught exception also exits non-zero, and is not
the same thing as an asserted instrument. `check-csp-hosts` states the rule
almost verbatim — *"found ZERO frontend fetch hosts — the scanner is broken, not
the code"* — and `check-themes` answers with `FATAL: could not find :root block`.
This is independent convergence on the technique's rule from a tree that never
read it, which is better evidence for the rule than an adopting tree would have
been.

One partial: `check-command-contract` reaches its non-zero exit through a bare
`throw` that prints a stack trace (`scripts/check-command-contract.mjs:62`). The
message is correct and the exit code is safe, but it is safe by the runtime's
default rather than by an exit path the script chose. Fail-safe by accident is
one refactor away from fail-open.

## What the tree does not satisfy

The rule that discriminates here is the other one — *test the scanner itself* —
and the split ran opposite to expectation:

- Text-based checkers under `scripts/`: three carry their own test files
  (`scripts/__tests__/check-binding-orphans.test.mjs` and two siblings).
- Tree-based lint rules under `eslint-rules/`: **zero of twenty-one** have a
  test of any kind.

The suppression distribution is consistent with the imprecision-to-bypass
sequence the technique describes. Forty-six suppressions across the source name
a custom rule; eight rules carry all of them, and one untested rule,
`no-hardcoded-jsx-text`, carries twenty-seven — fifty-nine percent of every
suppression written against the whole custom rule set. Thirteen of the
twenty-one rules have never been suppressed once.

That distribution is suggestive, not decisive: rule scope and firing frequency
are uncontrolled, and a rule that fires on far more sites will accumulate more
suppressions whatever its precision. What it does establish is that the gate
family with no precision measurement is the one whose suppressions concentrate,
and that nothing in this tree measures the precision of any of the twenty-one.

## Re-checked 2026-10-31 at personas@22260d77

**The lint-rule half of this reading was wrong when it was written.**
`src/test/eslint-rules/customRules.test.ts` has existed since 2026-05-01. At
the last commit to it before 2026-08-31 (`1fe2036f4`) it already tested 12 of
the custom rules, `no-hardcoded-jsx-text` among them. The "zero of
twenty-one" count came from looking for tests next to `eslint-rules/` and
under `scripts/`, and they live under `src/test/`. At HEAD there are 22 rules
(plus a shared helper, `_classname-strings.cjs`), and three files under
`src/test/eslint-rules/` cover 16 of them. The six with no test are
`enforce-reduced-motion-fallback`, `no-module-scope-en-value`,
`no-unprefixed-wide-min-width`, `no-unstable-store-selector`,
`no-whole-store-subscription` and `role-button-requires-keydown`. The rule
that carried the most suppressions was therefore a tested rule, so the
untested-rules-attract-suppressions reading above does not hold. Fixture
tests are still not precision measurements, and the point that nothing
measures any rule's precision stands. Suppressions have also moved: about 45
`eslint-disable` lines in `src/` name a custom rule. `enforce-base-modal`
now leads with 16, and `no-hardcoded-jsx-text` is down to 7.

The empty-scope refusals hold. `check-csp-hosts` now states the rule as a
positive control plus two zero guards: "walked ZERO files under src/ — the
walker is broken" and "parsed ZERO connect-src hosts … the parser is
broken" (`scripts/check-csp-hosts.mjs:184-189`). Its header now says that
zero real fetch sites is a legitimate result once the control passes. The
quoted "found ZERO frontend fetch hosts" line is gone. `check-themes` still
prints `FATAL: could not find :root block` (`scripts/check-themes.mjs:793`).
The command-contract refusal is still a bare `throw` (line 62 above). There
are now 19 `scripts/check-*.mjs` checkers and six `scripts/__tests__/check-*`
test files. The paired run and its `not-better` verdict are left as
recorded.

## What this application cannot claim

It judges rather than measures the second half. Proving the scanner-test rule
here would mean authoring twenty-one fixture suites and re-measuring the
suppression count over a following quarter, which is a project of its own and
larger than the finding that motivates it. The A/B above is real and its scope
is exactly one rule of the technique; the rest is a structural reading of a tree
that happens to hold both arms of the split.
