---
layer: technique
type: technique
subject: multi-jurisdiction-hiring-compliance
technique: provider-versus-deployer-duties
status: forged
laws: [every-decision-names-its-actor, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [mapping a regulation article by article, answering a customer conformance question, deciding whether a duty is yours or your vendor's]
---

# Provider versus deployer duties

## The concern

Modern AI regulation does not impose one undifferentiated duty on "whoever uses
AI". It splits obligations between the party that develops a system and places
it on the market, and the party that deploys it under its own authority. Every
article maps to one role or the other, and a conformance plan that does not
carry that mapping will either duplicate the vendor's work or — far more
commonly — leave the deployer's own duties entirely unaddressed on the
assumption that a supplier's assurance covers them.

For a hiring product this is sharpened by the fact that AI used in recruitment,
screening and candidate evaluation is classified in the highest non-prohibited
risk tier, where the duty set is at its densest.

## The split, in substance

**The builder owes the system:** a risk-management process across the
lifecycle; data governance for training and evaluation data; technical
documentation sufficient for an assessor; automatic logging capability;
accuracy, robustness and cybersecurity appropriate to the purpose;
human-oversight *affordances* designed in; and instructions for use precise
enough that a deployer can act on them. Registration and conformity
declarations sit here too.

**The operator owes the use:** use in accordance with those instructions;
assignment of human oversight to people with the competence, the training and
the actual authority to override; input-data relevance for the intended
purpose; monitoring in operation and escalation when something looks wrong;
retention of the logs the system produces for the required period; notification
of affected workers and their representatives before putting the system into
service in the workplace; and, for some deployers, an impact assessment on
fundamental rights performed *before* deployment.

Two of those deployer duties are irreducible and cannot be bought: **oversight
competence** and **worker notification**. No vendor can be competent on your
behalf, and no vendor can notify your workforce.

## The both-hats case

A platform that builds a screening capability and also operates it for a
customer wears both roles at once, and so does a customer that materially
modifies a system or puts its own name on it — substantial modification or
rebranding can convert a deployer into a builder for regulatory purposes.

The failure here is averaging: producing a single "compliance status" that
blends duties from both roles into one percentage. Map each duty to a role
explicitly, even where the same organisation holds both, because the roles
separate the moment a customer self-hosts, a white-label deal is signed, or the
capability is sold as a component. A map built role-by-role survives that
event; a blended status has to be rebuilt.

## Procedure

1. **Enumerate article by article**, not theme by theme. Each row: the
   provision, the role it binds, what the obligation actually requires, your
   current standing, and the evidence. A thematic summary loses the role
   assignment, which is the whole point.
2. **Assign a role to every row before assessing any row.** Assessing first
   invites the blend.
3. **Mark the irreducible deployer duties separately** and check them against
   reality, not against intent: is there a named person with override
   authority; have they been trained; can they actually reverse an outcome in
   the product, or only file a ticket
   ([law](../../_laws.md#every-decision-names-its-actor)).
4. **Verify that oversight is real, not nominal.** A human-in-the-loop who sees
   only a ranked list and a recommendation, with no view of the basis and no
   route to disagree, satisfies nobody's oversight duty. The duty is discharged
   by an override that is available, informed and used
   ([law](../../_laws.md#no-adverse-outcome-is-solely-automated)).
5. **Write the instructions-for-use as a deliverable**, not documentation.
   Where you are the builder, the deployer's ability to comply is bounded by
   what you told them: intended purpose, known limitations, the populations the
   system was evaluated on, what the logs contain, what oversight is expected
   of them, and what constitutes a substantial modification that would move the
   role boundary.
6. **Push the duty you cannot discharge to the party who can, in writing.**
   Where the deployer must notify workers, the builder's obligation is to
   supply the facts that notice needs and to say plainly that the notification
   is theirs. Silence here reads as coverage.
7. **Re-run the map when the product changes shape.** Adding a capability that
   influences advancement can move a component from a low tier into the
   high-risk tier; a rebrand or a self-hosted deployment moves roles.

## Decision rules

- When a duty could plausibly sit with either party, assume it is yours and
  discharge it; the cost of duplicated diligence is far below the cost of a
  gap neither party covered.
- When a vendor offers a conformance assurance, read it as evidence about the
  *builder* duties only, and record it as such. It is not evidence about your
  oversight, your notification or your retention.
- When an exemption or derogation is available — narrow procedural task,
  preparatory step — assess it against what the system does to a candidate's
  progression, not against how the feature is described internally. A
  capability that influences who advances is not preparatory. Record the
  refusal and its reasoning; it is worth more under scrutiny than the effort
  it saved.
- When both roles are held, publish the map with the role column intact rather
  than a merged status.

## When not to use this

Do not apply this split to regimes that do not draw it. Several
anti-discrimination frameworks place the duty squarely on the employer
regardless of who built the tool, and a candidate's claim runs against the
employer whatever the supply chain looks like. Reading a role split into such a
regime produces the comfortable and false conclusion that the vendor is
answerable.

Do not use the map as a marketing artifact. Its value is that it names what is
unmet; that job belongs to
[gap-register-with-owner-and-effort](gap-register-with-owner-and-effort.md),
and a map edited for publication stops being a plan.
