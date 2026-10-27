---
layer: technique
type: technique
subject: proof-carrying-agent-actions
technique: negative-fixtures-prove-the-verifier
status: forged
laws: [failure-not-empty-success, gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [a verifier of agent work ships with only passing fixtures, changing a proof checker, adding a proof class or a new way to forge one]
---

# Negative fixtures prove the verifier

A verifier's job is to refuse. A test suite for it that contains only honest
proofs checks that it accepts them, which a function returning "pass" also does.
The suite that matters is the one that feeds the verifier dishonest proofs and
asserts that it refuses each one, for the right reason, on every build. This
technique is that suite, and the rule that the pipeline asserts the verifier's
*expected exit* for every fixture rather than its success.

## The fixture set

Per proof class, one honest fixture and one dishonest fixture for every way the
class can be forged. For a security fix that means at least:

- **honest** — red at base naming the vector, green at head, suite unweakened,
  finding gone on a same-version rescan, diff inside the envelope; expected
  verdict: pass;
- **weakened** — the exploit test passes at head because an assertion was
  removed or loosened; expected: fail, with the weakening named;
- **fitted** — the test is green at base as well as head; expected: fail;
- **wrong red** — the test fails at base for an unrelated reason; expected:
  fail;
- **fabricated rescan** — the block claims the finding is gone, the rescan
  output is absent or from a different scanner version; expected: inconclusive
  or fail, whichever the class declares;
- **out of envelope** — the fix is genuine and also touches paths the class
  does not allow; expected: fail;
- **misclassified** — the declared class does not match the paths touched;
  expected: the stricter class's verdict;
- **incomplete** — a required observation is missing; expected: inconclusive.

Each fixture is a frozen set of inputs — commit pairs or recorded observations —
and an expected verdict and exit. The fixtures that model forgeries are written
the way an agent would actually write them, from the forms seen in practice, not
from what is easiest to detect.

## Assert the exit, not success

The pipeline job runs the verifier over every fixture and asserts that the exit
equals the expected one. A dishonest fixture that exits zero fails the job. An
honest fixture that exits non-zero fails the job. An inconclusive fixture that
exits as pass or as fail fails the job. Asserting "the verifier ran without
error" or "the job is green" over a run where most fixtures are supposed to
fail would be meaningless; the job is green only when every fixture got the
verdict it was written to get ([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

The assertion is a few lines of pipeline script — run the verifier, capture its
exit, compare it with the expected one, print one line per fixture with a mark,
the class, the fixture, the exit got and wanted and the verdict read back from
the output, and fail the job at the end if any line was wrong rather than at the
first. A reader of the job log then sees the verifier refuse in public: one
section headed honest evidence, one headed dishonest evidence, every line
marked. That log is itself evidence a third party can read without trusting the
verifier's authors.

Assert the reason as well as the exit where the verifier reports one. A
weakened fixture refused because the envelope check happened to trip has proved
the envelope check, not the weakening check; the next change to the envelope
will silently leave weakening undetected. The same trap catches fixtures that
forge several things at once: a weakened fixture that also removes a test and
adds a skip will stay refused when any one of its three detectors breaks. Keep
one forgery per fixture where the class allows it, so each detector has a
fixture that only it can refuse.

## Run the real verifier on the real path

The fixtures are run through the same entry point the gate uses — the same
binary or module, the same policy loading, the same exit mapping — not through
a test harness that calls the inner functions. Most refusal bugs live at the
edges: a policy file that failed to load and defaulted to permissive, an exit
code remapped by a wrapper, a field the parser drops. A suite that bypasses the
edges proves the core and gates on the edges
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

## The suite grows with the forgeries

When a forgery is seen in the field that the verifier missed, the first change
is a fixture reproducing it, committed failing; the fix to the verifier follows
and turns it green. When a proof class is added, it lands with its fixtures.
When a verifier change makes a dishonest fixture pass, the build breaks exactly
as a code change breaks a test, and the fixture is not edited to match — that
would be weakening the verifier's own oracle. A verifier with no dishonest
fixtures for a class has an absent guard for that class, and the job should say
so rather than pass quietly ([_laws: absent-guard-is-loud_](../../../../_laws.md#absent-guard-is-loud)).

## Decision rules

- Every proof class has at least one honest fixture and one dishonest fixture
  per known forgery, plus an incomplete fixture for the inconclusive path.
- The pipeline asserts each fixture's expected exit, and its reason where the
  verifier reports one; green means every fixture got its intended verdict.
- Fixtures run through the verifier's production entry point, policy loading
  and exit mapping included.
- A missed forgery becomes a fixture before it becomes a fix.
- Each detector has a fixture only it can refuse; a fixture that forges
  several things at once proves the set, not any one member.

## When not to use this

Fixtures prove the verifier refuses the forgeries someone thought of. They do
not prove it refuses forgeries nobody has thought of yet, and a long list of
green negative fixtures is not a security argument on its own. Pair the suite
with periodic adversarial attempts — a person or a separate agent tasked with
getting a dishonest proof past the checker — and fold each success back in as
a fixture.
