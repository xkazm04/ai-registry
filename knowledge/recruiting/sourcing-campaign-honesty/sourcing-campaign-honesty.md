---
layer: golden-path
type: golden-path
subject: sourcing-campaign-honesty
status: forged
use_when: [generating recruitment marketing or campaign copy from a role record, deciding what a machine may claim about an employer, a generated advertisement reads well but nobody can source its claims, designing the prompt or template that produces sourcing assets]
techniques:
  - stated-facts-only-gate
  - hook-taxonomy-bounded-by-what-is-provable
  - defaulted-value-is-absent-not-advertised
  - no-fabricated-testimonial
  - missing-fact-as-a-warning-code
  - regeneration-produces-new-copy-not-a-reshuffle
---

# Sourcing campaign honesty

Recruitment marketing is the part of hiring where a machine is asked to be
persuasive about a workplace it has never seen, on behalf of people who will
not read the output before it ships, to strangers who will later be able to
check every word from the inside. Campaign copy — the social post, the short
video script, the outreach hook, the careers-page blurb, the boosted
advertisement — is generated in seconds and audited over a year.

This subject owns the **generation** of that copy: the contract that decides
what a generator is allowed to claim, and the structural devices that make
overpromising impossible rather than merely discouraged.

## Why the honesty constraint here has to be structural

Every other falsehood in a hiring process is discovered *before* the hire, by
the party it damages, while the cost is still refundable. An inflated
requirement is discovered at screening — the candidate does not get through, or
does and the requirement is quietly dropped. A wrong score is discovered at
interview. A bad interview is discovered at debrief. The process is a sequence
of increasingly expensive checks, and each check catches the previous stage's
errors.

**Recruitment marketing has no such downstream check.** Nothing in the funnel
ever re-reads the advertisement. The candidate does — continuously, and in
detail, because the advertisement is the only description of the job they had
when they decided to change their life. Every claim in it becomes an
expectation, and the expectation is measured against reality in weeks one
through twelve, which is exactly when a new hire is still cheap to lose and
still connected to the market they left.

So the falsehood is discovered *after* the hire, by the party it damages, when
the cost is a resignation, a re-run of the whole requisition, and one more
person telling their network what your advertisement was worth. Early
attrition attributed to "culture fit" is very often a claim in an
advertisement that nobody could keep. That asymmetry is the whole reason this
subject exists as a discipline of *structure* rather than of *editing*:

- **A human reviewer cannot detect an invented fact.** A recruiter reading
  generated copy about a role they did not scope has no way to know that
  "generous learning budget" was supplied by the generator rather than by the
  hiring manager. It reads exactly like a fact they had forgotten. Detection
  requires comparing the copy to the input record line by line — which is
  work nobody does at the volume campaigns are produced.
- **A reviewer who could detect it would still approve it.** The invented
  claim is, by construction, the most attractive sentence in the draft. The
  incentive at review time points the wrong way.
- **Volume defeats review entirely.** Campaign generation exists because a
  team needs twenty assets, not one. A control that works only when someone
  reads carefully has already failed at the moment the feature earned its
  place.

The conclusion is uncomfortable and load-bearing: **you cannot review your way
out of a format that requires invention.** If a copy format can only be filled
by making something up, no prompt instruction, no reviewer, and no
post-generation lint will save it. The format must not exist. Honesty here is
enforced at the level of *what may be asked for*, not *what came back*.

## The fact set is the safety property

The single design decision that makes generated recruitment marketing safe is
that the generator does not receive the role. It receives a **fact set**: an
explicitly constructed, closed list of assertions someone actually made, each
one traceable to a person or a decision. Everything else about the role — the
notes, the internal commentary, the normalised fields, the inferred values —
stays outside.

This inverts the usual instinct, which is to give the model everything and
instruct it to be careful. That instinct fails for a reason worth stating
plainly: **a generator's job is to produce the shape of the genre, and the
genre has slots.** Recruitment marketing, as a form, contains a pay hint, a
benefit, a growth promise, a culture note. A model asked to write in the genre
will fill the genre's slots — from the surrounding text if it can, and from
the prior distribution of all recruitment marketing if it cannot. It is not
lying; it is completing a pattern. Instructions to "only use provided facts"
compete against that pull and lose intermittently, which is the worst
possible failure profile: rare enough to pass a demo, common enough to ship a
false promise every week.

So the enforcement is the fact set's construction, not the instruction.
Whatever is not in the set cannot be written, because the generator was never
told it. And the fact set is built by a rule that is stricter than "non-empty":
**a value must have been asserted by someone.** This is where the concept of a
phantom field earns its keep. A normalisation step that stamps a default onto
an incomplete record — a work mode, a seniority, a currency, an employment
type — produces a value that is present, well-typed, and *never asserted by
any human being*. Downstream it is indistinguishable from a decision. Rendered
into an advertisement it becomes a promise the employer never made and cannot
be held to knowingly, but will be held to anyway. The rule that follows is
short: **a defaulted value is absent, not advertised.** The pre-publish
fillability discipline works with the same phantom-field notion from the other
direction — asking whether a record is complete enough to *post* — and the two
must agree about which values are real, or one screen will call a role ready
while the other refuses to speak about it.

## Three ways a claim becomes false, and only one is a lie

Precision here matters because the remedies differ.

- **Invented.** The claim has no source at all. The generator supplied it
  because the genre wanted it. This is what everyone thinks about and it is
  the easiest of the three to prevent, because the fact set simply does not
  contain it.
- **Defaulted.** The claim traces to a value in the record that a system, not
  a person, put there. It survives every "did you use only the provided data"
  check, because it *was* provided. This is the failure that ships.
- **Borrowed.** The claim is true of the company but not of the role, or true
  of the role last quarter, or true of the headquarters and not the site being
  hired for. Nobody invented anything; the fact was simply carried across a
  boundary it does not hold across. Scope is part of a fact, and a fact set
  that stores values without their scope will export this failure silently.

A campaign generator that defends only against invention is defending against
the least likely of the three.

## Some formats are the problem, not their wording

The sharpest instrument in this subject is *format exclusion*, and it is worth
teaching as a general move because practitioners reach for it far too rarely.

Consider the employee-testimonial hook — "here is what someone on the team
says about working here". It is the highest-converting format in recruitment
marketing, which is precisely why it is proposed in every campaign brief. And
it cannot be generated honestly at all. Not "must be generated carefully":
**cannot**. A testimonial's entire persuasive value comes from its being a
specific person's actual experience. A generated one is a fabricated quotation
attributed to a real workforce. There is no wording that makes it acceptable,
because the thing that is false about it is not any sentence — it is the
speech act. Softening it ("our team often says…") preserves the fabrication
and adds evasion.

So the correct control is not a rule about how to write testimonials. It is
that **the testimonial hook is not in the taxonomy of hooks the generator may
produce.** Not offered, not selectable, not reachable by asking nicely. If the
organization wants a testimonial, it collects one from a named consenting
employee and inserts it as an attributed asset — which is a different workflow
with a consent step, not a generation problem.

The general form of the move: when a format's value depends on a property the
generator cannot possess — first-hand experience, an endorsement, an
attributed opinion, a measured outcome — the format is removed from the menu.
Everything else in this subject is a filter on content; this one is a filter on
*form*, and it is the only control that survives an operator who wants the
output badly.

## Thin copy is a finding; padded copy is a fault

The predictable consequence of a strict fact set is that some campaigns come
out thin. Three facts make a short post. The naive product response is to let
the generator elaborate — and elaboration is exactly the failure mode, wearing
a helpful expression.

The correct response is to **return the thin copy together with a machine-
readable statement of what was missing and what it would have been used for.**
Not a warning that copy quality is low; a per-fact code naming the absent
fact. "No pay fact: the pay hook was omitted." "No work-mode fact: the
location line is generic." "No team-size fact: the growth angle could not be
grounded."

This changes the recruiter's experience from *"the tool writes weak copy"* to
*"my requisition is missing three things and here is which sentence each one
buys me."* It converts a quality complaint into a data-completeness task with
a visible payoff, which is the only reliable way to get a hiring manager to
supply a fact they have been avoiding. It also makes the honesty constraint
legible rather than mysterious — the recruiter sees *why* the copy is thin,
and does not conclude the generator is simply bad and go write the
advertisement by hand with all the invented claims restored.

The corollary is a hard rule: **a missing fact never becomes generic prose.**
"Competitive package" is not what you emit when the pay fact is absent; the
absence is what you emit. Silence plus a diagnostic beats a euphemism, always.
That is the same test the advertisement-language discipline applies to human-
written postings — a phrase never satisfies a fact test — and the two sides of
the seam have to state it identically, or a claim blocked when a person types
it will leak through when a machine generates it.

## The degraded path is where honesty is actually tested

Copy generation is usually built with a fallback: when the model is
unavailable, over budget, or returns something malformed, something still has
to come back, because a recruiter waiting on an asset will not accept an error
where copy should be. That fallback is where most systems quietly abandon the
contract — it reaches for a template with the genre's slots pre-filled,
because a template is easy and nobody expects much of the degraded path.

The correct fallback is built from the same fact set and is honest by
construction: assemble one asset per angle that has facts to stand on, and
**produce fewer assets rather than weaker ones**. A pack of three grounded
variants where eight were requested is a correct output; eight variants padded
to reach the number is a failure that happens to look complete. Two details
make this work in practice. Keep one angle that needs no fact beyond the role
itself, so the degraded path can never return empty — an empty result gets
treated as a bug and routed around. And record which path produced the output,
because a recruiter comparing yesterday's rich pack to today's thin one
deserves to know whether the record changed or the generator did.

The same reasoning applies to the model's output when it arrives: it is
untrusted input. Validate it at the boundary — drop malformed assets, cap the
count, and map any angle outside the taxonomy onto a member of it rather than
passing an invented category through. A closed taxonomy that is only requested
in the instruction is not closed.

## Variation is not the same as rearrangement

Campaign generation is used iteratively. The recruiter presses regenerate
because the first draft did not land. This creates a specific and rarely
anticipated pressure toward dishonesty: over successive regenerations, the
only way to produce genuinely different copy from an unchanged fact set is to
introduce new material. A generator that "tries harder" on regeneration
invents; a generator that refuses to change produces a visible reshuffle of
the same clauses, which the recruiter reads as broken and works around.

Both outcomes are bad, and the resolution is to be explicit about where
legitimate variation comes from: a *different hook* (a different provable
angle on the same facts), a *different structural beat order*, a *different
register*. Those are real degrees of freedom and they are finite. When they
are exhausted, the honest output is to say so — this fact set supports three
distinct campaigns, and you have seen them — rather than to manufacture a
fourth. Regeneration is a bounded resource, and a generator that pretends it
is unbounded is buying its variety with invented facts.

## Where this subject stops

Four seams, stated so nobody re-teaches a neighbour's craft:

- **The advertisement's language** — bias, coded wording, boilerplate that
  reads as a red flag, the stated-pay-and-place test — belongs to the
  inclusive-advertising discipline. That subject lints an advertisement a
  human wrote; this one governs copy a machine generated. The seam is the
  authoring mode, not the artifact: a generated posting is subject to *both*,
  and the lint is the second gate, not the first. Where the two overlap they
  must agree, and the shared rule is the fact test.
- **Where a pay figure legitimately comes from** — the band's derivation, the
  market data, the internal equity check — belongs to the compensation-banding
  discipline. This subject only asks whether a pay fact was asserted, never
  whether it is right.
- **What the role actually requires** belongs to requirement-inflation control.
  Campaign copy consumes the requirement list; it does not adjudicate it, and
  a hook that dramatises a requirement ("only for people who can X") inherits
  whatever inflation the list carries.
- **Direct outreach to a named individual** — the approach message, contact
  attempts, the halt conditions when someone declines — belongs to the
  outreach discipline. The distinction is broadcast versus addressed: this
  subject governs copy aimed at an audience, that one governs a message aimed
  at a person. Honesty rules transfer across the seam unchanged; consent,
  frequency and halt rules do not exist on this side.

## Failure modes of the naive reading

- **Trusting the instruction.** "Use only the facts provided" in the prompt,
  with the whole role record provided. The instruction is real and it works
  most of the time, and most of the time is not a control.
- **Reviewing the output instead of bounding the input.** A human approval
  step in front of publication feels like the answer and detects almost
  nothing, because the reviewer cannot distinguish an invented fact from one
  they had forgotten.
- **Treating a defaulted field as a fact.** The single highest-yield bug in
  this subject, and it never looks like a bug — the value is present, typed
  and plausible.
- **Softening a format instead of removing it.** Hedged testimonials, "many of
  our engineers say", composite employees, illustrative quotes. Each is the
  same fabrication with a disclaimer, and the disclaimer is not read.
- **Filling absence with genre language.** Every euphemism in recruitment
  marketing exists to occupy the slot where a missing fact should have been.
  A generator that avoids inventing *values* but freely emits the euphemisms
  has kept the letter of the rule and shipped the same false impression.
- **Measuring the campaign only at the top of the funnel.** Click-through and
  application rate reward the most overpromising copy, which is why copy
  drifts toward it. The honest metric pairs the top of the funnel with what
  happened at the bottom: offer-decline reasons, first-90-day attrition, and
  what new hires say was different from the advertisement. A campaign that
  doubled applications and doubled early attrition lost.

## Making the loop closeable

The bottom-of-funnel metric is only available if a hire can be traced back to
the exact creative that produced them. Give every generated variant an
identity, carry that identity in the link it publishes, and record it on the
applicant. Without it, "which claim caused this resignation" is unanswerable
and the honesty rules stay a matter of principle; with it, the organization
can see that the variant leading on pay converts twice as well and retains the
same, or that the one leading on an aspirational angle does the opposite. This
is the only feedback that ever disciplines marketing copy, and it costs one
identifier per variant.

The evaluation side needs the same discipline. When generated copy is scored —
by a rubric, a reviewer, or a model acting as judge — the task description the
judge is given must be the *real* deliverable, honesty contract included. A
judge told to grade "a campaign plan with channels and targeting" against a
system that produces fact-bounded ad variants will mark every output down for
missing things it was never asked to produce, and the resulting scores read as
a weakness in the generator rather than as a defect in the question. Per
[a verdict is bound to what it
judged](../_laws.md#a-verdict-is-bound-to-what-it-judged), a score against a
mis-stated deliverable measures the rubric, not the copy — and here it does
active harm, because it makes the honest generator look like the weak one.
