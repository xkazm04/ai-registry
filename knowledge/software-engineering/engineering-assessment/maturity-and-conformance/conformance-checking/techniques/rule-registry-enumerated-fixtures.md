---
layer: technique
type: technique
subject: conformance-checking
technique: rule-registry-enumerated-fixtures
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a checker is a registry of independent rules rather than one program, adding a rule to a linter or gate suite, proving every rule in a suite can actually fire, a rule was tightened and nothing went red, deciding where a rule's negative control lives]
---

# Enumerate the fixture pairing from the rule registry

[fixture-repo-testing](./fixture-repo-testing.md) tests a checker with whole
projects: one conformant, one non-conformant, one fresh install. That shape is
right when the checker is **one program** producing one assessment.

It underserves the other common shape. A linter, a gate suite, or a
portability sweep is not one program — it is a **registry of independent
rules**, each with its own pattern, its own severity, and its own failure mode.
A single non-conformant fixture repository "breaking specific clauses, one per
clause where affordable" leaves *affordable* as a judgment call, and the rules
that get skipped are the fiddly ones most likely to be wrong.

At rule granularity the pairing can be made structural instead.

## The pairing is a property of the rule, not of the suite

Require every registered rule to ship two fixtures in a directory named by its
own identifier:

```
fixtures/<RULE-ID>/fail.<ext>    # must trigger this rule
fixtures/<RULE-ID>/pass.<ext>    # must NOT trigger this rule
```

Then write one harness that **reads the rule registry, iterates every rule id
in it, and asserts both directions**: the fail fixture produces exactly the
expected number of hits for that rule, the pass fixture produces zero for that
rule. Not zero findings overall — zero *for the targeted rule*, so a fixture
that happens to trip a neighbouring rule does not read as a failure of this one.

Three properties follow, and they are the whole value:

- **A rule added without fixtures fails discovery**, not review. The harness
  enumerates the registry and finds no directory, so the omission is a red
  build rather than something a reviewer might notice.
- **Every rule has a standing negative control.**
  [negative-control-tests](../../../../engineering-process/build-and-release/test-harness/techniques/negative-control-tests.md)
  names the manual version — break it, watch it fail, restore, record in a
  comment — and closes by preferring "a fixture built to be broken over a
  mutation of the live path" for the awkward case. At rule granularity that
  fallback is the *primary* form, because a regex rule has no live path to
  mutate. The negative control stops being an act somebody performed once and
  becomes a re-runnable artifact.
- **Tightening a regex trips the harness.** The usual silent regression in a
  rule suite is a pattern narrowed to kill a false positive, which also stops
  matching the true positive it was written for. The fail fixture is what
  notices.

Pair the fixture with the *incident*, too. A rule whose message names the
failure it was written for — the platform where the construct breaks, the
symptom it produced — turns the fixture directory into a case file, and the
next person deciding whether the rule is still worth its false-positive rate
can read the reason instead of guessing at it.

## The completeness check is only as complete as the registry it iterates

This is the boundary, and it is not hypothetical — it appears in the mature
form of this pattern almost every time, because rule suites grow a second
definition site.

The harness enumerates rule ids from **one** registry, typically the
declarative one: a rules file listing id, pattern, severity, message. Rules
that cannot be expressed as a pattern — a structural check, a guard against a
zero-byte plugin file, anything needing to parse rather than match — get
implemented in code in a separate pass, with their ids defined as constants
there. Those rules are **outside the enumeration**. In the observed case they
were covered by a hand-maintained map in the harness itself, associating a
differently-named fixture directory with the rule id and its expected hit
count.

That map is exactly the hole the enumeration was built to close, reopened one
entry at a time, and it fails silently: a code-defined rule added without an
entry is simply not asserted, and nothing anywhere goes red. It also produces a
convincing false reading in the other direction — an auditor listing the
fixture directories and finding no folder for a code-defined rule id will
conclude the rule was retired, when it is live and merely conventioned
differently.

Two corrections, in order of preference:

- **One authority for the rule vocabulary.** Every rule, whatever pass
  implements it, is registered in one enumerable place — the pattern-based ones
  carrying their regex, the code-based ones carrying a handler reference. The
  harness iterates that one list.
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary).)
- **If two definition sites are genuinely necessary**, make the harness assert
  the *union* and fail on any id it can reach from either site that has no
  fixture — never a hand-listed allow-map, which converts a completeness check
  into a checklist.

## The waiver is part of the rule, and it is counted

A rule strict enough to be worth enforcing will be wrong somewhere. Give it an
inline, per-line, per-rule waiver — a comment naming the specific rule id, not
a blanket suppression — so the exception is local, attributable, and greppable.

Then count the waivers per rule and read the count as a finding about the rule.
One or two waivers are the rule working. A rule with waivers scattered across a
codebase is a rule whose pattern is wrong, and the count is the cheapest
evidence available that it needs narrowing or retiring.

## Severity decides the gate, not the fixture requirement

Keep two dimensions apart. **Severity** — whether a hit fails the build or is
swept as code is touched — is a policy about the finding. **The fixture
requirement** is about the rule's own validity, and it applies at every
severity. A warning-severity rule nobody has proved can fire is an unvalidated
instrument whose warnings are decoration, and it is exactly the rule whose
silence will later be quoted as evidence.

## When not to use this

Where the rule set is small, stable, and exercised constantly by ordinary
development — a handful of checks that go red on real mistakes weekly — the
suite is continuously proving itself and the fixture ceremony adds cost without
information. And where each rule's subject is a whole repository rather than a
snippet, the fixture is a repository and `fixture-repo-testing`'s economics
apply instead: pair at the clause level there, not at the rule level, because
a repository per rule does not scale.
