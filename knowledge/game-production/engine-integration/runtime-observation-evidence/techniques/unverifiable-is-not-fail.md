---
layer: technique
type: technique
subject: runtime-observation-evidence
technique: unverifiable-is-not-fail
status: forged
laws: [unmeasured-is-not-a-pass, a-verdict-is-bound-to-its-content, no-gate-self-certifies]
shared_with: []
use_when: [designing the outcome vocabulary of an automated gate, a failure rate is dominated by infrastructure gaps, deciding what a harness reports when it cannot run]
---

# Unverifiable is not fail

The concern: what an observation reports when it **could not observe**. Two-valued gates
force this into failure, and that single decision corrupts every number computed downstream.
A harness that could not capture a frame has learned nothing about the artifact; recording
that as a failure asserts something false about the artifact, and does it in a form
indistinguishable from a real defect.

The cost is not abstract. A quarter later someone reads a twelve percent perceptual failure
rate and acts on it. The truth was two percent defects and ten percent never-looked. Those
require opposite responses — a content queue versus an infrastructure repair — and the
two-valued gate made them the same number.

## The outcome vocabulary

Four values, not two:

- **Pass** — the observation ran at the required tier and the assertions held.
- **Fail** — the observation ran at the required tier and something measured was wrong.
- **Deferred** — the observation ran or was attempted and **could not decide**: the judging
  observer was unreachable, the result could not be uniquely attributed, the capture came
  back empty.
- **Skipped** — the observation was **never attempted**: no runtime configured, prerequisite
  absent, out of the requested scope.

Deferred and skipped are both honest and neither is a fail, but they are not the same thing
and must never share a bucket. Deferred means your judging path is broken; skipped means
your coverage is incomplete. Reporting them together makes it impossible to tell which. Each
gets its own count, its own list, and a reason string naming the specific missing thing.

## The verdict table for a perceptual check

Worth stating literally, because every clause is load-bearing:

- No runtime environment configured → **unverifiable**. An honest unknown, never a silent
  pass and never a fail.
- Environment present, but no frame produced (the run failed or timed out) → **unverifiable**.
  An environmental capture failure is not a defect in the content.
- Frame produced but measurably black or near-empty → **fail**. The system booted and
  rendered nothing. This is a real observed failure and it needs no interpreting observer at
  all — a byte-size floor plus a non-black pixel fraction decides it mechanically.
- Frame produced and non-empty → **pass** as a floor. If an interpreting observer is
  configured and reachable, its adverse verdict overrides the floor.
- Frame produced, interpreting observer unavailable → **pass at the floor**, with the frame
  retained for review. **An observer outage never downgrades an already-captured frame.**

That last clause is the asymmetry that keeps the layer honest. Evidence that exists is
stronger than the availability of the thing that would have interpreted it. The mirror
asymmetry holds too, and points the other way: an unverifiable *condemnation* still
condemns — a measurably black frame is a failure whether or not anyone can explain it —
while an unverifiable *pass* does not elevate.

## Procedure

**1. Make the third outcome representable before you need it.** Retrofitting a third value
into a boolean-typed result is a migration across every consumer. Type the outcome as an
enumeration from the first commit.

**2. Attach a reason to every non-pass, and make the reason name the specific missing
thing.** "unverifiable" alone is nearly as useless as "fail" — "no display environment
configured", "declared scene produced no frame", "requested identifier matched three
registered results" are actionable.

**3. Route unverifiable to a different destination than fail.** Failures go to the content
owner. Unverifiables go to whoever owns the harness. If they land in the same queue, the
harness never gets fixed, because every triage pass reads them as flaky content.

**4. Refuse a substituted subject.** When the specific requested observation target is
unavailable, do not silently fall back to a known-good one. The resulting verdict would be
about a different artifact. Report unverifiable, naming the target that was missing. A
fallback target is legal only when nothing specific was requested.

**5. Make ambiguous attribution terminal.** When a requested result could correspond to
several registered ones, do not credit one. This is the single path by which a harness
produces an actively false verdict instead of a missing one; it is worth an explicit check
and an explicit terminal-unverifiable outcome that names the colliding identities. Retrying
cannot break a name collision, so retry logic must not treat it as transient.

**6. Keep unverifiables out of pass rates, and report them beside.** Never fold them into a
denominator that is presented as a quality measure. A dashboard that shows "94% passing"
over a population where 20% were never observed is lying by arithmetic.

**7. Make expensive observers advisory, not blocking.** A gate that takes minutes and can be
unverifiable for environmental reasons should not stop a pipeline. Run it opt-in and
advisory, report what it found, and let the unverifiable rate itself be the signal that the
harness needs attention.

## Decision rules

- When you cannot tell whether an outcome is a fail or an unverifiable, it is an
  unverifiable. Falling to the conservative side is what keeps the layer trustworthy.
- When a cheap mechanical check can condemn without an interpreting observer, let it — do
  not make a real, observed failure contingent on an optional service being up.
- When an unverifiable rate exceeds a small threshold, treat it as an incident against the
  harness with the same seriousness as a failing gate. Silence must never propagate upward
  as green.
- When an observation is unverifiable, retain whatever partial evidence exists. The frame
  that could not be judged is still a frame somebody can look at.

## When not to use

Do not use the third outcome as a place to put results you find inconvenient. An assertion
that fails intermittently is a flaky assertion, not an unverifiable one; the distinction is
whether the observation *was made*. If it ran and produced a measurement you dislike, that
is a fail, and reclassifying it is how a gate stops meaning anything.
