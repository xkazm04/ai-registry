---
layer: technique
type: technique
subject: sourcing-campaign-honesty
technique: defaulted-value-is-absent-not-advertised
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [a role record has values nobody remembers deciding, wiring normalisation between intake and publication, a generated advertisement promises something the manager denies having agreed]
---

# A defaulted value is absent, not advertised

The concern: **phantom fields** — values that a normalisation, template or
defaulting step stamped onto a record, which are present, well-typed and
plausible, and which no human ever asserted. They pass every "use only the
supplied data" check, because they *are* supplied data. Advertised, they
become promises the employer never made.

## Where phantom fields come from

They are not a bug; they are the predictable output of making a record usable.
Four ordinary mechanisms produce them:

- **Type completion.** A field is required by the schema, so intake fills it
  with the commonest value — an employment type, a currency, a seniority.
- **Template seeding.** A new requisition is cloned from a previous one or
  from a sample, and the unedited fields carry the template's values.
- **Inference.** A derivation step reads a title and concludes a level, or
  reads a location and concludes a work mode. This is often good inference and
  still not an assertion — per [inference must look like
  inference](../../../_laws.md#inference-must-look-like-inference), it must not
  arrive downstream wearing the same clothes as a stated fact.
- **Backfill.** A migration or an import assigns a value so that older records
  satisfy a newer constraint.

None of these is a person deciding. All of them produce a value indistinguish-
able from a decision one hop downstream, which is exactly why the distinction
must be carried in the data rather than remembered by the team.

## Why marketing is where this bites hardest

Elsewhere a defaulted value causes a mild error: a filter matches oddly, a
report is slightly wrong, someone corrects it. In campaign copy it becomes a
**promise made to a stranger in writing**, and the stranger acts on it. The
defaulted work mode becomes "remote-friendly" in a post read by someone who
moves cities. The defaulted employment type becomes "permanent" in an
advertisement for a role that is a fixed term. The defaulted currency turns a
band into a different number entirely.

And it is the failure that survives every review, because the reviewer's check
is "does this match the record" and it does.

## Procedure

1. **Make provenance a property of the value, not of the field.** Each fact
   carries how it got there: stated by a person, derived, defaulted,
   imported. A boolean "is complete" flag on the record cannot express this
   and will not survive contact with the problem.
2. **Resolve defaulted to absent at the campaign boundary.** The fact set that
   reaches the generator contains asserted values only. Defaulted values are
   dropped and reported as absences, so the copy omits the angle and the
   recruiter is told which fact would restore it.
3. **Keep the distinction visible to humans too.** A recruiter looking at the
   role should see that the work mode was assumed, not chosen — otherwise they
   will confirm it in a meeting from the screen and the assumption laundering
   completes itself.
4. **Give assertion a cheap path.** The right response to "this was defaulted"
   is a one-click confirm by someone with the authority to decide, which
   converts it into an asserted fact with an actor and a timestamp. Without
   that path, the rule reads as obstruction and teams route around it.
5. **Audit the defaults periodically by sampling.** Take a set of published
   roles, ask the hiring manager to state the value cold, and compare. The
   disagreement rate on defaulted fields is the size of the exposure and it is
   usually a surprise.

## Decision rules

- **Present is not asserted.** Per [absence of evidence is not
  evidence](../../../_laws.md#absence-of-evidence-is-not-evidence), a filled slot
  whose filler was a system is an absence. State the rule this bluntly,
  because every exception granted to it is granted by someone reasoning "but
  it's almost certainly right".
- **"Almost certainly right" is the wrong test.** The question is not whether
  the value is accurate but whether anyone is accountable for it. A promise
  nobody made cannot be kept deliberately, and the new hire's complaint lands
  on a person who will truthfully say they never agreed to it.
- **A confirmed default is a stated fact.** Once a person with authority
  affirms the value, it is theirs, and it may be advertised like any other.
  The technique creates a conversion path, not a permanent exclusion.
- **Never advertise a derived value as a fact, even a good derivation.** Per
  [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds),
  a level inferred from a title is the system's opinion. Publishing it as the
  role's level makes the system the author of a claim about pay and seniority
  that a candidate will negotiate against.
- **The same predicate governs every surface.** The publication readiness
  check, the posting editor and the campaign generator must agree about which
  values are real. When they disagree, the most permissive one becomes the
  effective policy.

## When not to use it

- **Not for values whose default is genuinely a policy.** If the organization
  has decided that all roles at a site are hybrid three days, that is an
  asserted fact with an actor — the policy — not a phantom. Record it as such;
  do not suppress it because the mechanism that applied it was automatic.
- **Not as a reason to stop defaulting.** Defaults make records usable and
  intake fast. The technique is about what may be *published*, not about how
  the record is built.
- **Not on internal-facing derived values.** A derived level used to route a
  requisition, a derived seniority used to order a list — these are fine as
  long as they are labelled as derivations where a human might read them as
  decisions.
