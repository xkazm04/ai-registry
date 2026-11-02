---
layer: technique
type: technique
subject: live-test-consent-and-evidence
technique: live-tests-behind-an-exact-flag
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [adding a test that calls the real streaming platform, keeping continuous integration hermetic while live tests exist, reporting test results where some live tests did not run]
---

# Live tests behind an exact flag

A test that reaches the real platform must never run because it happened to be in the
suite. It runs when an operator asks for it, in a way that cannot be asked for by
accident, and when it does not run the report says so. This technique keeps live tests in
the same codebase as the ordinary suite, next to the code they exercise, while making them
inert by default.

## Default hermetic

The suite developers run on save and continuous integration runs on every change opens no
connection to the platform. Credentials present in the environment do not change that: a
developer who once ran a live test keeps the token in their shell, and a build machine may
hold secrets for an unrelated job. "We have a token, so run live" is the inference that
turns a refactor's test run into a ban on the test channel at three in the morning. The
gate is a flag, and the token is only what a gated test uses once the gate is open.

## Exact value, not truthiness

The flag is armed only by one documented value — a specific word or a specific number —
compared exactly. Any other value, including an empty string, a different word, a
lowercase variant or a value meant for a different flag, leaves it disarmed. Truthy checks
fail in a predictable way: a flag left at "0" or "false" by a script that meant to disable
it reads as non-empty and arms the suite. Exactness also gives the flag a single obvious
spelling to search for in logs and shell histories.

Where live tests vary in blast radius, separate flags arm separate groups: reading channel
state is a different decision from banning an account, and an operator who wanted the
first should not get the second. And a test flag arms tests only. A product capability
that also reaches a live service — a live randomness source, a cloud model — has its own
opt-in, and the test flag never implies it.

## The guard runs first and is itself tested

The comparison is the first thing a live test does: before it reads any other
configuration, opens the credential store, resolves a name or opens a socket. A disarmed
run then has touched nothing, and its failure message can say so truthfully. The guard is
a pure function of the flag's value, and it has its own hermetic test that feeds it the
near-misses — absent, empty, "0", "true", the right value with a leading or trailing
space — and the right value, without ever setting the process environment. A guard that
is only exercised when somebody arms it is a guard nobody has seen refuse.

## Arm for one command

The operator sets the flag for a single command and removes it in a cleanup step that
runs whether the command passed, failed or was interrupted. A flag exported into a shell
and left there arms every later command typed into that shell, including the ordinary
suite run an hour later. Run one live test at a time, serially: the platform limits
concurrent connections per credential, and two observers on one channel each see the
other's events.

## Every live test has an offline twin

For each live test there is a hermetic twin that drives the same client code against a
response recorded from the platform. The twin runs in the default suite and proves
parsing, error mapping and the decision the tool makes on each outcome. The live test
proves only what the twin cannot: that the platform still returns that response, to this
request, with this credential. Keeping the pair together means a platform change shows up
as the live test diverging from its twin's recording, which is precisely the information
wanted.

## Skipped is reported as skipped

A live test that did not run is **skipped**, by name, with the reason — flag absent, flag
present with the wrong value, owned target missing. It is never counted as passed, and a
summary line that rolls skipped tests into a green total is wrong in the direction that
matters ([law: unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass)). A
reader of the report must be able to answer "did anything touch the platform in this run"
without reading the log.

Skipping is right for the ordinary suite, where nobody asked for the platform. It is wrong
when an operator explicitly selects the live tests and the flag is missing or wrong: that
operator believes the platform is about to be touched, and a quiet skip lets them walk
away believing it was. There the guard fails, red, with a message that names the flag and
states that no credential or network access was attempted. Keep that red run as evidence
the guard works. Inside an armed run, the same rule holds for waits: an expected event
that does not arrive in time fails as "not verified", never passes by timeout.

## Procedure

1. Choose one environment variable or command-line switch per blast-radius group and
   document its exact arming value next to the tests it arms.
2. At the top of each live test, before any other read, compare the flag to that value
   exactly; on mismatch, skip in the ordinary suite or fail in an explicit live run, with
   a reason that names the flag but never echoes a credential. Test the guard with the
   near-misses.
3. Write the offline twin first, from a response captured on a supervised live run.
4. Make the test report distinguish passed, failed and skipped, and make continuous
   integration fail if any live test ran there at all.
5. Document the arming as a set-run-unset pattern for one command at a time.
6. Record each live run's date, flag group and owned accounts with the results.

## Decision rules

- **When a test opens a connection to the platform, it is gated.** No exceptions for
  "read-only" calls that still spend the channel's rate budget.
- **When the flag is set to anything other than its value, skip and say why.** Never
  guess what the operator meant.
- **When a live test and its twin disagree, the twin's recording is stale.** Re-record it
  from a supervised run; do not loosen the live test.
- **When continuous integration needs live coverage**, run it as a separate, manually
  triggered job on owned accounts, never as part of the per-change suite.

## When not to use it

Calls to the team's own services, or to a local copy of the broadcasting software, are
not platform calls and are governed by their own test lanes. A one-off supervised
exploration in a scratch script, run by a person watching the test channel, does not need
the flag; anything that is committed and could be run again does.
