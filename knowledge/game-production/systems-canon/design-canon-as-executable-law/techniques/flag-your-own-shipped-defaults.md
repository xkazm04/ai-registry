---
layer: technique
type: technique
subject: design-canon-as-executable-law
technique: flag-your-own-shipped-defaults
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a new conformance checker passes everything on first run, calibrating thresholds without widening them, deciding whether a linter can be trusted]
---

# Flag your own shipped defaults

The named concern: **the calibration that happens silently while a checker is being
written.** An engineer writes a band, runs it over the material at hand, sees failures,
and adjusts until the material passes. Every one of those adjustments felt like fixing a
bug in the check. Collectively they turned the check into a description of the current
corpus — a mirror that reports the status quo as compliance.

This is not laziness and it is not rare; it is the default outcome of writing a checker
against material you also own. The countermeasure is a procedure, and it is this: **the
first target of a new conformance check is your own project's shipped default
configuration, and the findings are published, including the ones against you.**

## Why the first finding must be against yourself

A conformance linter has exactly one credibility problem, and it is not accuracy. Nobody
believes a checker grades anything real until it has condemned something its authors care
about. Until then, every green result is explained away as "well, it was written to pass".

Turning it on your own defaults resolves that in one run, in either direction:

- **It finds something.** Now the check has demonstrated it can bite, and the finding is
  against the party least able to dismiss it. Every subsequent finding inherits that
  credibility.
- **It finds nothing.** Then either your defaults are genuinely conformant — worth knowing,
  and worth stating with the evidence — or the band is too loose, and you now have a
  specific reason to suspect it. A check that passes its author's own material on the
  first run, with no tuning, is a check to be suspicious of.

There is a deeper principle underneath. The party that produced an artifact may not be the
authority that passes it. A team's claim that its defaults are balanced is an input to a
verdict, never the verdict; the linter is the separate observer, and pointing it at the
producer's own output is what makes it one.

## The three honest responses, and the one dishonest one

When the linter condemns your shipped default, there are exactly three legitimate moves:

1. **Fix the default.** The best outcome and the reason the exercise exists. A default
   configuration that violates the design law is shipping the violation to everyone who
   never changes it — which is most people.
2. **Amend the canon, on the record, with reasoning.** Sometimes the finding proves the
   rule was wrong. Changing the rule body — with the argument written into it — is a design
   decision made deliberately, reviewed as a design decision, and it propagates to every
   check automatically.
3. **Keep both, and document the violation in the header of the checker itself**, as a known
   deviation with a stated reason and a location. This is legitimate and badly underused. A
   stated, located deviation is a debt with a name; someone reading the checker in six
   months learns immediately that the default runs hot and why nobody has fixed it.

The fourth move — **widen the threshold until the default passes** — is always available,
always cheap, and always the end of the system's usefulness. It leaves no trace: the test
is green, the band looks deliberate, and the knowledge that it was moved to admit one case
exists only in the mind of whoever moved it.

The structural guard is that the deviation lives in the file header, in the place a
maintainer cannot avoid reading, rather than in a ticket. A comment at the top of the
checker admitting that the project's own default economy runs its faucet hot and its sink
cold — and therefore breaks the balance law this very file enforces — is worth more than
any amount of documentation about how rigorous the system is.

## Procedure

1. **Write the check against the rule, not against the data.** Read the canon rule, parse
   its numbers, encode the comparison. Do not open the corpus yet.
2. **Run it, first, over your own shipped defaults** — the default configuration, the
   starter template, the example content, the seed data. These are the artifacts you have
   the strongest unconscious incentive to let pass.
3. **Record every finding before changing anything.** The raw first-run output is the
   evidence; once you start adjusting, it is unrecoverable.
4. **For each finding, choose one of the three honest responses, explicitly, in writing.**
   Which one, and why. If the answer is "the band is wrong", say what the right band is and
   amend the rule.
5. **Write the surviving deviations into the checker's header** with rule id, what violates
   it, and why it stands.
6. **Only then run it over the wider corpus.**
7. **Re-run against the defaults on every canon amendment.** A rule change can newly condemn
   your own material, and that is exactly when you want to know.

## Decision rules

- **When a new check passes everything on its first run, treat that as a defect until
  proven otherwise.** Construct an artifact you know violates the rule and confirm the check
  catches it. A check that has never failed anything is unmeasured, not passing.
- **When you are about to change a threshold, ask what changed in the design.** If nothing
  did, you are widening to admit a case, and the answer is one of the other three moves.
- **When the deviation stands, it goes in the header, not a ticket.** Tickets close.
- **When a finding is against your own material and you cannot decide, ship the finding.**
  A visible unresolved violation is survivable; an invisible one is not.
- **When you publish the checker's results, publish the self-findings first.** Ordering is
  the whole rhetorical move; a list that opens with other people's failures and buries its
  own at the bottom reads as exactly what it is.
- **When someone else's content fails a rule your own defaults also fail, say so in the
  finding.** It converts an accusation into a shared problem and it is simply true.

## When not to use this

- **There is no shipped default to test.** A checker for a domain where every artifact is
  bespoke has no self-target; substitute the closest thing — the example content, the
  onboarding template, the demo data — and if none exists, the technique does not apply
  and the calibration risk must be managed some other way, usually by having someone who
  did not write the check review its thresholds against the rule.
- **The default is deliberately extreme.** A stress-test configuration exists to violate
  budgets. Exclude it explicitly and say why; do not let it generate noise that trains
  people to ignore self-findings.
- **The findings cannot be published.** If the political cost of your own material failing
  is high enough that the results will be quietly buried, running the exercise privately
  is still worth it — but do not claim the credibility benefit, because that comes entirely
  from the publication.
- **As a one-time ritual.** Its value is in repetition on every canon change. A single
  heroic self-audit at launch, never repeated, decays into a paragraph in a README about
  how seriously the team takes conformance.
