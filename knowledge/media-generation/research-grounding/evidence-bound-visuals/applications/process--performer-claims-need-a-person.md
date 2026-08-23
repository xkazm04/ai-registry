---
layer: application
type: application
subject: evidence-bound-visuals
technique: performer-claims-need-a-person
stack: process
status: forged
verified_on: 2026-08-23
refresh_by: 2027-08-23
---

# Where the rule is codified, and one field instance — August 2026

The technique states the craft claim in jurisdiction-neutral terms: a
first-person experience claim asserts an experiencer, and a synthetic one
does not exist. That claim is not only craft. It is codified, and the
codified form is narrower and harder than the craft form in a way worth
recording, because it removes an exit the craft version appears to leave
open.

`refresh_by` is set to one year rather than the derived default: this is a
regulatory landscape, and the technique's whole procedural claim rests on
what the rule treats as a violation.

## The codified form

In the United States, the FTC's **Rule on the Use of Consumer Reviews and
Testimonials**, 16 CFR Part 465, took effect **2024-10-21**. The operative
section for this technique is §465.2 ("Fake or false consumer reviews,
consumer testimonials, or celebrity testimonials"), which reaches
testimonials that materially misrepresent that the endorser **exists**, or
that they **used or had experience with** the product or service. The
Commission's final-rule notice is explicit that the prohibition is
indifferent to whether the fake was produced by a human or by a generative
model.

Two consequences the craft statement does not make obvious:

1. **Disclosure is not a universal cure.** The technique offers labelling as
   the remedy for a synthetic performer, and for the *provenance* question
   that is right. But a testimonial that misrepresents experience is treated
   as deceptive on its own terms — the exit is to stop asserting the
   experience, which is why the technique's two honest exits are moving the
   claim into the brand's voice or sourcing a real user, and not "keep the
   line and add a label".
2. **The composite is squarely inside it.** "Representative customer"
   personas assembled from genuine feedback still misrepresent that a
   single endorser exists.

Verification note on source class: the rule text and the Commission's own
final-rule notice are the citation; the several compliance write-ups
consulted alongside them agreed with each other and with the rule on the
points above, but they are commentary and were not relied on for the
operative language. Non-US jurisdictions were not surveyed — the technique
is written jurisdiction-neutral precisely because this application is not.

Sources resolved 2026-08-23: eCFR, 16 CFR Part 465 §465.2; FTC final rule
notice for 16 CFR Part 465.

## The field instance

A widely-circulated tutorial published 2026-08 ("Turn Claude Into a One
Person Marketing Team", Nate Herk) demonstrates the pipeline this technique
governs, end to end, and walks past the rule without naming it. It is worth
recording because it is not a careless example — it is a *careful* one, and
the care is what makes it useful.

The run: an agent with the brand's positioning documents drives a
model-aggregation service to cast four synthetic "creators" as still images,
derive storyboards from them, animate the boards, and — notably — run an
automated quality-assurance pass that screenshots the finished clips and
**rejects** takes with defective packaging text. So the pipeline has a
review gate, and the gate fires on a logo error.

What no gate fires on is the script. The accepted clips deliver first-person
experience claims in the voice of the synthetic creators — the morning
routine the product replaces, what the speaker reaches for, the product
"doing two jobs instead of one" — presented as customer testimony, with no
label anywhere in the frame or the workflow. The operator's own critique of
the output is that it reads "very salesy… not completely organic", and the
proposed fix is to make it *more* organic by studying real creator content
and approving scripts. That fix moves in the direction the technique warns
about: it improves the assertion without touching whether there is anyone
behind it.

Three things this instance evidences for the technique:

- **The gradient claim is real, and observable.** The pipeline's quality
  effort ran entirely on fidelity — packaging, logo, product consistency —
  and fidelity is the axis that strengthens the unfounded claim. A QA pass
  can be genuinely good and structurally blind here.
- **Cast time is the only tractable point.** The four creators were
  ratified as reference stills before any board or clip existed, and every
  downstream asset inherits them. Catching the pairing after the boards
  were derived would have voided the ratified identities — which is the
  technique's step 3, observed rather than argued.
- **The absence is silent.** Nothing in the run produces a record of
  whether a performer is synthetic. The information exists only in the
  operator's head at the moment of casting, which is precisely the moment
  the technique says to write it down.

Deviation, self-reported: none of this is machine-enforced in the observed
run; the cast record the technique specifies did not exist there. Recorded
as a live instance of a named defect, not as a validated implementation.
