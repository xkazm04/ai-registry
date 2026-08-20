---
layer: technique
type: technique
subject: early-career-potential-assessment
technique: transferable-meta-skill-credit
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [scoring a career changer, deciding what prior work in another field is worth, building a prior-role to competency mapping]
---

# Transferable meta-skill credit

A career changer's file contains years of real, supervised, consequential work — in the
wrong field. Naive domain matching scores that at nothing. This technique converts the
prior role into the *meta-skills* it demonstrably exercised, credits them at the tier
their provenance earns, and bounds the credit by how far the old domain sits from the
new one.

The framing that makes it defensible: this is not a sympathy adjustment. A teacher who
held a classroom for four years has evidence of explaining hard things to resistant
audiences under time pressure, produced in a paid job with consequences — a stronger
evidentiary condition than a claim, a course, or a side project. The credit is earned;
what the technique adds is a way to see it.

## The procedure

1. **Maintain an explicit prior-role to meta-skill map.** A reviewable table: each
   recognized prior occupation maps to a small set of competencies it genuinely
   evidences. A teacher — mentoring, communication, structuring material, handling a
   room. A nurse — precision under stress, prioritization, safe handover, working to
   protocol. A supervisor — scheduling, de-escalation, accountability for a shift's
   output. Keep the sets short; three to five defensible entries beat a dozen generous
   ones.
2. **Keep the map multilingual and label-independent.** Job titles arrive in whatever
   language the person wrote them in and in whatever words their employer used. Match
   through a stable normalized vocabulary with per-language surface forms, never through
   a display string ([meaning-does-not-live-in-a-label](../../_laws.md#meaning-does-not-live-in-a-label)).
   A map that only fires in one language systematically underscores a whole population
   of applicants, and does it silently.
3. **Credit at the professional tier.** The meta-skill was demonstrated in employment,
   so it enters at the tier employment-demonstrated evidence earns for anybody — not at
   a lower "transferable" tier invented for the occasion. A separate, weaker tier for
   transferred skill is the asymmetric-discount failure in a new costume.
4. **Grade the bridge with domain distance.** How far the prior domain sits from the
   target is graded coarsely and used to raise the credit where the fields neighbour
   each other and to frame the narrative where they do not — not to apply a second
   discount on top of the provenance one. See
   [domain-distance-grading](domain-distance-grading.md).
5. **Include a baseline for any prior professional role.** Whatever the occupation,
   having held a job evidences turning up, working with others, owning an outcome and
   delivering. Grant a short baseline set to every mapped or unmapped prior role, so a
   person whose occupation your table does not recognize still gets what employment
   itself demonstrates.
6. **Attach the basis to every credited skill.** Each credit names the prior role it
   came from and the fact that it is transferred rather than directly evidenced in the
   target domain
   ([a-claim-carries-its-sample-and-its-basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
   A recruiter reading "communication: strong" needs to know it came from four years of
   teaching, both to trust it and to probe it.

## Decision rules

- **When no map entry matches the prior role, credit the baseline only, and say the
  occupation was unrecognized.** An unmapped occupation is unmeasured, not zero-skilled;
  flag it so a recruiter can add the entry. Never let a model improvise a mapping at
  runtime: free association about what a job "is like" reproduces occupational
  stereotype, varies by phrasing and language, and cannot be reviewed before it affects
  someone.
- **Gate the credit on the rubric the candidate is being scored under, not on the
  classifier's label for them.** Anyone on the early-career scoring path who has real
  prior employment earns this credit — a career changer misread as a student, a student
  whose part-time job was in another field, a returner whose route did not parse. Gating
  on the archetype identifier means every classification error additionally destroys the
  candidate's transferred credit, compounding one mistake into two. The mapping is
  naturally self-limiting: with no prior-role evidence it yields nothing, so a true
  beginner gains nothing from the wider gate.
- **When a prior role is short or unrepeated, damp the credit rather than dropping it.**
  Three months of retail evidences less than four years of it. Duration belongs in the
  strength of the credit, not in its existence.
- **When the target role's requirements do not include the meta-skill, do not credit
  it into the total.** Show it as context. Crediting communication into a score for a
  role that never asked for communication inflates one population's totals in a way that
  is impossible to defend when compared across candidates.
- **When the map grows past a few dozen entries, review it as policy, not as data.**
  Every entry is a statement about what an occupation implies, and every such statement
  is a candidate for adverse impact. Ownership matters: the map is a hiring-policy
  artifact, reviewed by the people accountable for hiring policy.
- **Prefer under-crediting to over-crediting when uncertain.** An under-credited
  candidate loses points but stays legible; an over-credited one advances into an
  interview that discovers the gap, which wastes their day and damages their record.

## When not to use it

- **Not for regulated competencies.** Precision under stress does not transfer into a
  licensed clinical or safety-critical duty. Where a credential is statutorily required,
  transfer credit is irrelevant and the gate is the gate.
- **Not to fill a genuine hard requirement.** Meta-skills substitute for other
  meta-skills, not for a specific technical capability the role cannot function without.
  A transfer-credited score should never make a candidate look qualified on a must-have
  they do not hold.
- **Not for candidates already in the target domain.** Someone with three years of
  in-domain work does not additionally receive transferred credit for the same years;
  that is the same evidence counted twice.
- **Not as a substitute for asking.** The map produces a hypothesis strong enough to
  justify a conversation. The conversation, not the table, is where a transferred skill
  becomes demonstrated in the new context.
