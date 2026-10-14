---
layer: application
type: application
subject: jurisdiction-modelling
technique: eligibility-regime-detection
stack: node
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Node: one regime predicate, and the gate that used half of it

The grant-writing product already realizes the technique end to end, which is
what makes it a good place to look for the part of the technique that decays:
the predicate is published once, and a consumer written before it kept a
private copy of half of it.

## What the tree gets right

The predicate is one pure function in the jurisdiction registry
(`usesEntityTypeEligibility`): true when the eligible-code set is empty *and*
the profile lists entity types. It is derived from the profile's shape, with
no `regime` flag, and its comment names the reason it is shared: the
onboarding form and the server-side org-profile parser must not drift. Both
import it. The legal-form profiles (Czechia, the UK, the supranational
programme) leave the code table genuinely empty; the founding market hangs
applicant codes off each entity type, with the jurisdiction default as the
fallback. The gate tests walk the legal-form branch through pass, fail,
unknown (unset form) and unknown (unrecognised form), which is the
procedure's fifth step.

## The seam that could falsify it

The hunt asked whether every consumer routes through the predicate. One did
not: the matcher's applicant-type check branched on `eligibleCodes.length ===
0` alone. For every registered profile the two agree, so nothing was visibly
wrong. They diverge on a profile with no codes and no entity types, which the
form treats as code-regime (it collects nothing) and the gate treated as
legal-form, answering "set your organization's legal form" about a field the
form never shows. The profile scaffolder forbids that shape, so the divergence
was reachable only by a hand-built profile.

## A and B

Arm A (the tree as found): a registry-wide test pinning gate branch equal to
predicate passed for all eight registered profiles; the synthetic codeless,
entity-type-less profile failed it (1 of 2 tests red). Arm B (the gate calls
the shared predicate): 2 of 2 green, the full suite green (380 files, 3626
tests), type-check and lint clean. Verdict `better`, with the limit stated:
this is a drift pin on a latent divergence, not a user-visible fix, and the
shipped data never exercised it.

## What it says about the technique

"Audit every consumer that assumes one regime" has a second half the
procedure does not state: audit for consumers that re-derive *part* of the
predicate. A partial copy passes every fixture drawn from real profiles,
because real profiles satisfy both halves. The durable guard is a test that
iterates every registered profile and asserts each consumer's branch equals
the shared predicate, so a new profile or a new consumer cannot add a
disagreement silently.
