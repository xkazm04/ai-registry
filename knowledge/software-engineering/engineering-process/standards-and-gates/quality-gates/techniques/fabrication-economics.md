---
layer: technique
type: technique
subject: quality-gates
technique: fabrication-economics
status: forged
laws: [unknown-is-not-a-value, gate-sees-target, deletion-is-not-repair]
shared_with: []
use_when: [a rule demands a value only a human can judge, a required field is passing everywhere and nobody believes the coverage, deciding what a gate should do about a violation whose only cheap fix is a plausible lie]
---

# Fabrication economics

[false-positive-economics](./false-positive-economics.md) says a gate dies of
firing on correct content. This is its mirror, and it kills the *rule* rather
than the gate: **a requirement whose satisfaction cannot be verified is
satisfied falsely, and the gate stays green forever.** Nobody bypasses
anything. The report is clean. The rule has simply stopped meaning what it
says, and the greenness is now evidence of nothing at all.

The mechanism is an economics problem, not a detection problem. Grade a
required field on two axes:

|  | the gate can verify the value | the gate can only verify **presence** |
| --- | --- | --- |
| **the author can produce it cheaply** | ordinary rule; enforce it | ordinary rule; enforce it |
| **the author cannot produce it here** | the gate blocks honestly | **the fabrication cell** |

Only the bottom-right cell is dangerous, and it is common: alternative
descriptions of content, a rationale field, an owner, a justification for an
exception, a summary of a change, a reason code chosen from a list whose last
entry is "other". In every case the gate can decide *present or absent* with
total reliability and cannot decide *meaningful* at all. So the author who has
nothing true to write faces a real gate and two moves — leave it empty and stay
blocked, or write something shaped like an answer and be released. The second is
cheaper, always, and it is *more* attractive the more the author is a program:
a generator asked for a value it cannot obtain will emit the filename, the
adjacent visible label, the empty string, or a stock phrase, at scale, in a
single commit.

**The gate is not fooled by the fabrication. The gate causes it.** That is the
sentence that changes what to build, because it moves the fix from the detector
(which cannot get better — the distinction is not in the data) to the rule's own
design.

One correction to that sentence, measured rather than reasoned: **the gate is
sufficient, not necessary.** A codebase with no such gate anywhere still fills
the field the same way, because the requirement propagates by convention, by
editor completion, and by every tutorial written against a stricter house than
yours. The first tree this was tested against had twenty-one hand-written lint
rules, none of them touching the field in question, and a clear majority of the
population still carried the null-shaped value. So a gate industrialises the
pressure and — usefully — makes it countable; it does not originate it. The
population to audit is any required field whose value domain already contains a
cheap, always-available, unfalsifiable answer, whether or not anything enforces
it today.

## Give the inability a token of its own

The corrective is to make "I could not produce this" **sayable**, in band, with
a value that is not also a legitimate answer:

- **Mint an explicit token.** A distinct marker on the artifact meaning *no
  value was obtainable here* — not an empty string, not a default, not
  omission. The prior art for the authoring half is
  [generated-from-provenance](../../repo-manifest-standard/techniques/generated-from-provenance.md)
  ("leave a marker, never invent"); this technique is what the gate must then
  do about the marker, which is the half that decides whether the marker is
  ever used.
- **The artifact stays non-conforming.** The token is not a waiver and does not
  make the artifact correct. It records that a requirement is unmet, in a form
  something can count.
- **The gate goes silent on it.** A marked site produces no finding. This is the
  step teams refuse, and refusing it is what returns the whole system to the
  fabrication cell: if using the marker still turns the report red, the marker
  buys the author nothing, while the plausible lie turns it green — so the lie
  is still the dominant move and you have shipped an unused vocabulary.
- **The token itself is exempt.** A gate that suppresses the missing-value
  finding must also not flag the presence of the marker. Otherwise the error has
  been relocated, not removed, and the pressure is identical one rule down.
- **Count the tokens somewhere that is not the verdict.** The debt is real and
  the point of the token is that it is enumerable: a census over the artifacts,
  a trend line, a number in a review. Silence belongs to the pass/fail channel
  only ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) —
  what is removed is the finding, never the fact).

The whole design in one line: **the truth is preserved, the payoff is removed,
and the two live in different channels.**

## The conflated-token failure, which is the usual state

Most trees do not have the marker because the field already has a value that
*means* two things. A required attribute whose empty value is read as a positive
declaration — "this element is decorative", "no exception applies", "not
relevant here" — is carrying both the affirmative claim and the shrug on one
token, and once that happens the debt is permanently uncountable: nobody can
separate the sites where someone decided from the sites where someone gave up.

This is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
arriving through a gate rather than through a type. The law's laundering point
is "a boundary where an optional type meets a non-optional one"; a required
field with no unknown in its value domain *is* that boundary, constructed on
purpose, by the rule.

The tell is cheap to look for and does not need the gate: take the population
the rule governs, and ask what share of the passing sites hold the one value
that costs nothing to write. A field at a 100% pass rate whose modal value is
the null-shaped one is not evidence of compliance; it is the census of the
fabrication cell, and the number is usually a majority.

## Say which of your own clauses a machine may not judge

The same reasoning applies one level up, to whoever writes the rules. A contract
of any size contains clauses a machine can decide and clauses that need
judgment — is this description faithful, is this quotation actually a quotation,
is this rationale a reason. Leaving that partition implicit means every checker
implementer redraws it privately, and two conformance runs over the same
contract are then incomparable for reasons neither report states.

So **the contract names its own undecidable clauses and grants the checker an
explicit exemption from them.** Three things follow immediately, all of them
improvements:

- The checker's denominator becomes a property of the *standard* rather than an
  accident of the implementation, which is what
  [pass-ratio-comparability](../../../../engineering-assessment/maturity-and-conformance/conformance-checking/techniques/pass-ratio-comparability.md)
  needs and could not previously get.
- The exempt clauses are exactly the population that needs the inability token,
  and they are now a list rather than a discovery.
- A reader who sees a green report can read what green did not cover from the
  contract itself, instead of inferring it from the checker's silence
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Boundary against the neighbours

[unmeasurable-criteria](./unmeasurable-criteria.md) is the closest technique and
it answers a different question. There the gate faces a **missing value** and
chooses between SKIP, FAIL-CLOSED and REFUSE on one axis: does the absence
describe the subject's world or the gate's own vision? Here the value is
*present and verifiable at the only level the gate operates on* — there is
nothing missing and nothing to skip. The undecidable part is the requirement
behind the field, and the resolution is a fourth state that enumeration does not
contain: **known-violating, deliberately unreported, separately counted.**

Two of that technique's rules also invert here and the inversion is the point. A
skip must be loud, because a silent skip lets a policy become decoration; a
fabrication-relief token must be silent *in the verdict*, because loudness is
the pressure. Both are honest — the difference is that the first is disclosing
what the gate could not see, and the second is declining to pay for a lie. Keep
them apart by asking what a louder report would cause: more information, or a
worse artifact.

Finally, this is not a licence to stop enforcing hard things.
[severity-by-construction](./severity-by-construction.md) still governs: a rule
whose population is *mostly* satisfiable and occasionally not needs the token
for the tail and full enforcement for the body. A rule where the token would be
the majority answer was never a gate — it is a survey, and it should be
demoted and re-scoped rather than left blocking a decision it cannot inform.

## Decision rules

- **Before adding a required field, name what a caller with nothing to say will
  write in it.** If that string exists and passes, the field measures its own
  presence and nothing else.
- **Never let a legitimate value double as the shrug.** If the empty value
  already means something affirmative, the token must be a third value, added
  before the rule is enforced rather than after the census is embarrassing.
- **Grade the relief by who is answering.** A rule filled in by a person once
  per change can carry more judgment than one filled in by a generator across a
  whole tree; the second population needs the token from the first day, because
  its authors cannot be persuaded.
- **A green rate over a judgment field is quoted with the token count beside
  it**, or it is not quoted.
