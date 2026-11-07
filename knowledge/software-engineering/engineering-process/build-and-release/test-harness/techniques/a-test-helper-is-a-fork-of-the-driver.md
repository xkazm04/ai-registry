---
layer: technique
type: technique
subject: test-harness
technique: a-test-helper-is-a-fork-of-the-driver
status: forged
laws: [gate-sees-target, count-carries-predicate, unknown-is-not-a-value]
shared_with: []
applied: experiment
ab_verdict: unmeasurable
use_when: [a helper compiles or runs a snippet for tests and the shipped command does more, a test fixture builds the store by a different route than the boot path, a fake answers with a passing default, a guarantee is gated on a host type the product does not run, deciding what a green suite may claim when every test goes through one convenience, a bug reproduces only through the real binary]
---

# A test helper is a fork of the driver

A convenience that compiles, boots or runs something for tests is a second entry point. It is written
once, to be short, usually before the real command has acquired its setup. Then the command grows: it
loads a standard library, injects a real checker, names the file, opens the store in the mode production
uses. The helper does none of that, and nothing goes red, because every test agrees with the helper.
Each test through it is now a test of a program no user can run
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

This is not [proved-off-the-path](./proved-off-the-path.md). There, production never contains what the
test composed, so a walk from the entry point finds zero calls. Here the code under test is the shipped
code and the walk finds it. What differs is everything placed around it, so that test passes and the
fork stays.

## Which axes fork

Four come up, and a helper can match on three and fork on the fourth.

- **What is loaded.** The command runs with a standard library, seed data or a plugin set; the helper
  runs with an empty one.
- **What is injected.** The command gets the real checker; the helper keeps a stub or a fake.
- **Identity.** The helper uses a fixed module name, path or tenant, so anything keyed on identity takes
  one branch forever. An identifier format no test ever used is found only by running the real binary.
- **Mode.** The store, runtime or transport is opened differently, usually for speed.

Mode is the one a careful helper still forks on. Measured on our own schema with two connections and no
busy wait: under the default rollback journal, a write with a reader's transaction open was refused as
locked; under the write-ahead journal the same write committed and the reader kept its snapshot. With no
reader open both arms behaved alike. So a fixture built from the shipped migration chain, which is the
expensive part to keep faithful, still answers a locking question differently from production if it skips
one setting. One connected project has that shape across about 1,700 call lines, and its own comment
names the difference as a fidelity gap left for later. It was read, not run. Nobody chose that gap for the
tests that depend on it.

## The fork can be a whole implementation

The same thing happens one size up. A guarantee is built and gated on a host type, while the product runs
a sibling type. The gate stays green and the feature is unprotected until someone wires it in. One tree
recorded that blocker in its own decision log: an atomic operation existed on a host the app did not use.
Ask of each gate which binary's path it took.

## A passing default is the worst setting

Results that depend on the missing setup come back as whatever the default says. A fake whose default is
"satisfied" reports a pass for every constraint nobody configured, with no diagnostic, which is
[an unknown rendered as a value](../../../../_laws.md#unknown-is-not-a-value). Give the fake no default,
so each test states what it assumed.

## The rule

1. **The default helper does what the shipped command does.** Share the construction function rather
   than restating it, so a new setup step reaches both.
2. **A cheaper variant says what it leaves out, in its name.** Speed is a fair reason to skip a step. A
   neutral name is what turns a choice into an accident.
3. **Check the claim.** Run the same input through the helper and through the shipped entry point, and
   compare the results on severity, code, phase and location, leaving out message text. For a fixture,
   compare the settings and the schema it ends with. A binary older than the source yields no verdict, so
   report that as unprovable and not as a match.
4. **Do not migrate hundreds of call sites at once.** Keep a shrinking list of those still on the
   unfaithful helper, and let the count travel with any claim the suite makes
   ([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).

What is measured here is the fork, not the remedy. The comparison in step 3 is a plan in the tree it came
from and has not landed there, so its cost and its yield are unknown. The no-default rule for fakes is our
own inference.

## When not

Pure logic with no setup has nothing to fork. A helper that is deliberately cheaper and says so is fine,
provided the claim it supports is limited to what it kept. Every test need not go through the full boot:
the [fidelity ladder](../test-harness.md) exists because that costs too much. The defect is a lower rung
being read as the higher one.
