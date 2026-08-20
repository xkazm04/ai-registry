---
layer: technique
type: technique
subject: llm-era-work-sample-design
technique: anchor-the-task-to-the-role-not-the-material
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [building an exercise on top of an existing substrate, the exercise title drifted toward the sample domain, checking an exercise for unstated requirements]
---

# Anchor the task to the role, not the material

An exercise needs concrete material — a seeded substrate, a service, a dataset —
to make ambiguity real. The moment that material exists, it exerts gravity on
the whole design: the title drifts toward its domain, its libraries become
implicit requirements, and its shape starts dictating what "good" means. This
technique is the counter-force. **The material is where the person will work.
It is not what the role is.**

## The concern

Three distinct defects grow from the same root:

- **Role renaming.** The substrate handles invoices, so the exercise goes out
  titled for an invoicing specialist. Nothing in the hiring need said that. The
  label now filters the pool by domain familiarity nobody asked for, and it
  misrepresents the job to every person who reads it — a claim about the role
  that the record of the hiring need does not hold, per
  [say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds).
- **Tool smuggling.** The substrate uses a particular framework, queue or data
  layer, so the exercise silently requires fluency in it. A candidate who would
  do the job well is now scored on something the role brief never listed. Every
  smuggled tool is an unstated must-have.
- **Requirement inflation.** Each of the above adds a bar. Left unchecked, an
  exercise assembled from a substrate ends up asserting a dozen requirements
  when the role has four, because nobody ever wrote them down as requirements —
  they arrived as scenery.

The underlying law is that meaning does not live in a label
([meaning-does-not-live-in-a-label](../../_laws.md#meaning-does-not-live-in-a-label)):
a domain word appearing in the material is a display string, and deriving the
role's identity, its requirement list, or its scoring emphasis from it is
exactly the derivation that law forbids.

## Procedure

1. **Fix the role definition before the material is chosen.** Write the role's
   must-haves from the hiring need alone — what the person will be responsible
   for, at what seniority, with which recurring judgments. This list is the
   authority; the substrate is selected afterwards to exercise it.
2. **Cap the must-have list.** Eight is a defensible ceiling for a work sample;
   most roles justify four to six. Anything past the cap is either a nice-to-have
   or scenery that crept in. The cap works because it forces the removal
   conversation to happen at design time rather than at rejection time.
3. **Name the role from the responsibility, never from the substrate's
   domain.** If the hiring need says "platform engineer", the exercise is for a
   platform engineer even if the seeded material is a scheduling service.
4. **Audit for smuggled tools.** Walk the exercise and list every technology a
   candidate must know to complete it. For each, check that the role's own
   brief mentions it. If it does not, either make it optional (supply a working
   example so familiarity is not required), abstract it away, or add it to the
   brief honestly as a requirement the hiring manager has now agreed to.
5. **Check compatibility before committing to the substrate.** Ask whether the
   role's actual work *can* be done on this material. If it can, do the role's
   work on it — a security specialist threat-models the supplied service, an
   analyst stress-tests the supplied model, a marketer diagnoses the supplied
   funnel. If it genuinely cannot, do not force it: build a small representative
   set of materials in the role's own domain and state in the brief that the
   supplied context does not fit. Never produce an exercise in the material's
   domain when that differs from the role being hired for.
6. **Use the role's vocabulary throughout.** Starting materials are documents,
   records, models, designs or recordings depending on the role. Inherited
   internal naming for the material bucket is not an excuse to describe it that
   way to the candidate.
7. **State the terrain explicitly to the candidate.** "This substrate is a
   scheduling service; the role is not scheduling-specific and no prior domain
   knowledge is expected." One sentence removes the deterrence effect and
   removes the excuse that domain unfamiliarity produced a weak result.
8. **Check the probes against the role list.** Every planted decision point
   should map to a responsibility on the must-have list. A probe that maps to
   nothing is measuring scenery.

## Decision rules

- **When the substrate's domain word appears in the exercise title, remove it**
  — unless the role brief itself names that domain as a requirement, in which
  case it was never scenery.
- **When a candidate cannot complete the task without a tool the brief omits,
  the exercise is wrong, not the candidate.** Fix the exercise; do not score
  the gap.
- **When the hiring manager wants the material's domain to matter, promote it
  to a stated requirement first.** Then it can be assessed and defended. What is
  forbidden is grading it while pretending it is not there.
- **When a role has genuine domain requirements, keep them in the brief and out
  of the title's identity claim.** "Backend engineer, works on claims systems"
  is honest; "claims engineer" invents a profession.

## When not to use it

- **Genuinely domain-defined roles.** Some roles really are about the domain —
  a compliance specialist for a specific regulatory regime, a clinician. There
  the domain is a stated requirement from the start and matching the exercise to
  it is correct. The technique still applies to the *tools*: domain expertise
  being required never licenses smuggling a framework requirement in beside it.
- **Trials and paid work-trial periods** where the person is doing real work on
  the real system. There the material is the job, by definition. What survives
  is the requirement cap, which still governs what you are entitled to assess.

## What good looks like

Two candidates from different backgrounds, neither of whom has seen this
domain, can both start the exercise within ten minutes of opening it, and the
scoring conversation afterwards is entirely about judgments they made — not
about which of them happened to have used this stack before.
