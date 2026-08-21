---
layer: golden-path
type: golden-path
subject: evidence-provenance-weighting
status: forged
use_when: [scoring a candidate against a role, deciding what a skill claim is worth, designing a match or fit algorithm, changing an evidence weight or a scoring model]
techniques:
  - provenance-trust-ladder
  - default-provenance-fails-safe
  - unproven-versus-missing-distinction
  - observed-evidence-minting-gates
  - strongest-provenance-wins-consolidation
  - provenance-rebaseline-and-retuning
---

# Evidence provenance weighting

A hiring system's central act is to turn documents into claims and claims into a
ranking. Provenance weighting is the discipline that decides what each claim is
*worth* — not whether the candidate mentioned a skill, but where the mention came
from, what standing that origin gives it, and what the system is therefore entitled
to say. Get it wrong and the ranking rewards writing. A candidate who lists twenty
technologies in a skills bar outranks one who shipped three of them under load,
because the first produced twenty matches and the second produced three.

The subject is not "trust the résumé less." It is a claim-level typing system. Every
assertion the pipeline holds about a person carries an origin, that origin carries a
discount, and the discount is applied at scoring, at consolidation, and at display —
consistently, or not at all. A ladder used only in the score while the interface shows
undifferentiated green checkmarks has moved the dishonesty from the number to the
screen, where it does more damage, because a recruiter believes screens.

## Provenance attaches to the claim, not the candidate and not the document

The unit is the triple: *this person*, *this skill*, *this basis*. One file usually
spans four or five tiers at once — a professional role that demonstrates two things, a
thesis that demonstrates one, a certificate that attests a fourth, a skills list that
merely asserts eleven more. Neither a per-candidate "document quality" score nor a
per-document one can express that: the same résumé is strong evidence for the skills
its employment section exercises and weak evidence for the ones only its header names.

So provenance is assigned during extraction, at the moment a claim is minted from a
span, and travels with the claim. Reconstructed later by a pass that guesses where each
entry of a finished skill list came from, it is a fabrication with a plausible shape,
and it guesses worst on exactly the claims whose origin the document made ambiguous.

## The ladder is ordinal, and its jobs are ordering and discounting

A provenance ladder ranks bases by how hard the claim would have been to make
falsely. Demonstrated work under observation sits at the top; sustained professional
use beside it; substantial unpaid or contributed work and structured placements just
below; academic work of real scope below that; personal projects and hobby work below
that; coursework and attendance-based certificates lower still; and bare
self-assertion — a skills bar, a header, a checkbox — at the floor. An unrecognised
or unstated origin belongs on the floor with self-assertion, never in the middle and
never at the top.

Two disciplines make the ladder honest.

**It orders more than it measures.** The exact discount at each rung is a tuning
parameter with no ground truth behind it; the *ordering* is the claim, and the
ordering is defensible. State the ladder as a ranking with weights attached, not as a
measurement, and never present a provenance-discounted score as an accuracy figure.
The multiplier is also capped at full credit rather than exceeding it: the top rung
must not inflate a match past what the skill itself is worth. Its advantage over the
next rung is realized where it belongs — in a narrower confidence band, and in winning
consolidation — not in a number that lets one demonstrated skill outweigh the role.

**It never encodes anything but evidential strength.** A rung is not a proxy for
prestige, employer size, institution, or how the candidate spent their twenties.
Unpaid contributed work and short structured placements sit high for one reason — the
artifacts are inspectable — and a team that quietly demotes them because they "aren't
real jobs" has swapped an evidence model for a class filter and will not be able to
explain the resulting selection rates.

The top rung is what makes the ladder more than a penalty box: demonstrated evidence
is **the one path by which a candidate with no track record can outrank tenure on a
specific skill.** A ladder that only discounts is a seniority filter in disguise.

## The discount applies to everyone or it is a discriminatory discount

The most damaging way to ship a provenance ladder is to apply it to *part* of the
population, and it happens by a plausible route: the discount is built for
early-career candidates, whose claims obviously need weighting, while experienced
candidates keep the old generous default because "their history speaks for itself."

The result is exactly inverted. The same unevidenced claim is penalised for the person
least able to evidence it and waived for everyone else — the candidate with a decade
of roles has their unsupported claims credited at the top tier, while the graduate
with a shipped thesis has theirs discounted. A weighting scheme that varies by
candidate segment is not an evidence model, it is a segment preference, and it will
show up in selection rates long before anyone finds it in the code.

One ladder, one default, one population. If a role genuinely requires a different
evidence standard, that is a property of the role, declared on it, applied to every
candidate for it.

## The default is the entire subject

If you remember one thing, remember this: **the value assigned when provenance is
unknown determines whether the whole apparatus protects the process or corrupts it.**

A ladder is a discount schedule. A discount schedule with a generous default is not a
discount schedule — it is a mechanism that pays out maximum credit for silence.
Every claim the extractor could not place, every parse that lost the section boundary,
every intake path that never carried an origin field at all, arrives holding the top
of the ladder. And the claims that lose their provenance are not random: they are
concentrated in the messiest documents, the unusual career shapes, the non-native
phrasings, the formats the parser handles worst. So the top-of-ladder default is
awarded disproportionately to the files the system understands least, and the
resulting ranking is *anti-correlated* with the evidence it claims to weigh.

The rule is absolute and it is [absence of evidence is not
evidence](../_laws.md#absence-of-evidence-is-not-evidence): an unknown origin takes
the floor of the ladder, alongside bare self-assertion. Understating a real
professional skill costs a probe in an interview. Overstating an unsupported one costs
a hire. The default must fail toward the cheap error, and — this is the part teams get
wrong even after fixing the number — the fix belongs at the *definition* of the
default, not in the call sites. One forgotten call site that omits the origin argument
reinstates the original bug for one intake path, silently.

## Unproven is a third state, and it is not "missing"

A weak claim and an absent claim are different facts about a person, and collapsing
them destroys information in whichever direction the collapse runs.

- Treat unproven as **missing** and you have knocked out candidates for skills they
  plausibly hold because their evidence was thin — a weighting system operating as a
  hidden hard filter, invisibly, since nothing in the output says so.
- Treat unproven as **matched** and the ladder does nothing at all.

The correct structure is three buckets: matched (present with sufficient standing),
unproven (present, but the basis is weak, adjacent, or self-asserted), and missing
(nothing in the record speaks to it). Evidence strength moves claims between *matched*
and *unproven*, and never into *missing* — that boundary belongs to whether the record
mentions the thing at all. Knockout logic keys on *missing* only, so a knockout can
never be triggered by a discount.

Two calibration facts make this work rather than merely describe it. The floor weight
must sit **below** the match threshold, or a bare self-assertion still clears the bar
and the ladder changes nothing but the tooltip. And a claim demoted to unproven still
contributes its **discounted** share to the score — never zero. Zeroing a weak claim
is the missing-collapse again, arriving through arithmetic instead of bucketing. This
is [uncertainty resolves toward the
candidate](../_laws.md#uncertainty-resolves-toward-the-candidate) at its most concrete.

The bucket also has to say *why*, because the two reasons drive different interviewer
behaviour. "You match a neighbouring skill but not this one" is a scope question —
probe the transfer. "You claim this exact skill but only assert it" is a depth
question — probe the work. A claim can be both, which is weaker than either. The scope
half of that taxonomy belongs to the sibling practice of skill adjacency and
normalization, which owns hierarchies, sibling credit and cross-language matching;
this subject owns the strength half, and the shared reason field is the only place the
two must agree.

## "Matched" is a threshold, not a verification

Every matcher that compares a required skill to a candidate's claims has a similarity
threshold, and every threshold admits partial matches. A moderately permissive
threshold — the usual setting, because a strict one misses obvious synonyms — means
"matched" already denotes *plausibly the same skill*, before provenance is considered
at all. Stack a self-asserted origin on top of a partial string match and the word
"matched" is carrying two independent uncertainties while presenting as a fact.

Two display rules follow. The interface must never render an unverified claim in the
grammar of a verified one — [inference must look like
inference](../_laws.md#inference-must-look-like-inference). A strong badge on a claim
whose provenance was never established is not an omission; it is an affirmative
statement that a verification occurred which the system never performed, and when
display provenance is unavailable the honest fallback is the floor of the ladder. And
an evidence tier is a hypothesis with a probe attached: a recruiter shown "claimed,
not demonstrated — ask for an example" does something useful, while a recruiter shown
a green check does nothing, which is exactly what the discount was meant to prevent.

## Observed evidence is minted under gates, never parsed

The top rung — evidence the system watched being produced — is the only tier that
cannot come from a document. It is minted by a live process, and because it dominates
consolidation, its false positives are the most expensive in the system.

The gate that fails most often is **matching**. When a transcript or work product is
scanned for named skills by substring containment, short skill names detonate:
one- and two-character names are substrings of ordinary English, so a sentence of
neutral praise mints top-tier demonstrated evidence for technologies nobody used. The
candidate then carries the system's strongest evidence for skills they never touched,
and consolidation protects the fabrication by hiding every honest weaker claim behind
it. Token-boundary matching, minimum-length floors and an explicit alias table are the
difference between an evidence tier and a random number generator with good manners.

The other gates are structural: a mint clears a trustworthiness check on the
assessment and a competence bar before it credits anything; it credits nothing when
nothing maps, rather than falling back to the role's whole requirement list; it names
the session and artifact that produced it; it is bound to the rubric version it was
scored under; and it is additive only, never penalising a weak performance. A verdict
is bound to what it judged, and demonstrated evidence that cannot name what was
demonstrated is a rumor wearing the top of the ladder.

## Consolidation keeps the strongest, and keeps the count

The same skill usually appears several times in one file, under different bases. The
resolution rule is simple: **the strongest provenance wins**, because evidence is
disjunctive — one demonstrated instance is not weakened by ten self-assertions
elsewhere, and averaging the tiers lets padding dilute real work. Multiplicity is
recorded as a separate signal (how many independent bases, how recent, how long
sustained) and never folded into the tier itself.

Two guards keep this from becoming a laundering path. Strongest-wins must operate on
claims whose tiers were assigned honestly at extraction, or it promotes the single
most flattering reading of every skill; and it must compare rungs by **ordinal rank**,
not by weight, since the top rungs are deliberately capped at the same weight and a
weight comparison silently lets a résumé line shadow a demonstration. It also
preserves the losing claims rather than deleting them: the audit answer to "why does
this person read as demonstrated?" must terminate at a specific basis, not a collapsed
maximum. Consolidate for display and scoring; retain the full set.

## Weights are dated, and re-baselining is an event

Provenance weights and the thresholds around them are tuned against a cohort at a
point in time, using a particular extractor and matching model. Change any of those
and stored scores stop being comparable to newly computed ones — silently, because a
score is a number and numbers look comparable. A cohort holding both vintages ranks
people partly by when their file happened to be processed.

So a weighting change is an event with a procedure: dated and recorded; the population
recomputed or explicitly marked mixed-vintage; comparative surfaces refusing to span
the boundary; the tuning re-run rather than assumed to carry over; and the operational
consequence — which saved filters and cutoffs were calibrated against the old numbers
— stated, not left for someone to discover. Beware the curated evaluation corpus here:
fixtures authored with real provenance on every claim barely move under a default
change, so a green suite is evidence the change bites only unevidenced data, not
evidence that it is safe. The re-tuning also cannot be validated against outcomes the
old weights caused — [a predictor cannot grade its own
labels](../_laws.md#a-predictor-cannot-grade-its-own-labels) — so the honest check is
a held-back set the score did not act on, or an explicit statement that what was
measured is internal consistency.

## Seams with neighbouring practices

Where a model produced the extraction, the operator-side concerns — which model ran,
what it cost, whether the run degraded, how the judge was scaffolded — belong to the
general practice of language-model observability. What belongs here is the hiring
consequence: a degraded or fallback run yields claims whose provenance is *downgraded
truthfully*, not claims inheriting the tier the healthy path would have produced.
Likewise the storage, tenancy and access rules around candidate claims are general
engineering; the hiring judgment this subject keeps is that a provenance tier is an
assertion about a person and inherits every rule governing such assertions.

## Failure modes this standard exists to prevent

- **The flattering default** — unknown origin scored at the top of the ladder, so
  the least-understood documents get the most credit.
- **The segmented discount** — the ladder applied to one candidate population and
  waived for another, penalising exactly the people least able to evidence a claim.
- **The silent knockout** — weak evidence routed into "missing", so a discount
  quietly becomes a hard filter with no explanation attached.
- **The unearned badge** — a verification tier rendered for a claim whose provenance
  was never established, stating a check that never ran.
- **Substring minting** — top-tier demonstrated evidence fabricated by loose text
  matching, then protected from correction by strongest-wins consolidation.
- **Tier averaging** — real demonstrated work diluted by the volume of self-asserted
  claims around it, rewarding padding.
- **Undated weights** — scores from two weight regimes ranked against each other in
  one cohort, with nothing in the record marking the boundary.
- **Ladder drift** — rungs quietly reordered to encode prestige or employment shape
  rather than evidential strength.

## The techniques

- [provenance-trust-ladder](techniques/provenance-trust-ladder.md) — defining the
  ordinal tiers, what each rung means, and the rules that keep it an evidence model.
- [default-provenance-fails-safe](techniques/default-provenance-fails-safe.md) — the
  value assigned when origin is unknown, and why it belongs at the definition.
- [unproven-versus-missing-distinction](techniques/unproven-versus-missing-distinction.md)
  — the three-bucket structure, the reason taxonomy, and the knockout boundary.
- [observed-evidence-minting-gates](techniques/observed-evidence-minting-gates.md) —
  the only path to the top rung, and the matching discipline it demands.
- [strongest-provenance-wins-consolidation](techniques/strongest-provenance-wins-consolidation.md)
  — resolving multiple bases for one skill without averaging or losing the audit.
- [provenance-rebaseline-and-retuning](techniques/provenance-rebaseline-and-retuning.md)
  — dating a weight change, handling mixed-vintage cohorts, re-tuning honestly.
