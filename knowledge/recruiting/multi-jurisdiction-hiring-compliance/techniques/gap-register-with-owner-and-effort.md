---
layer: technique
type: technique
subject: multi-jurisdiction-hiring-compliance
technique: gap-register-with-owner-and-effort
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
shared_with: []
use_when: [publishing a trust or compliance posture, planning conformance work, answering where a product falls short of a regulation]
---

# Gap register with owner and effort

## The concern

A compliance posture that lists only what is done is useless twice over. It
cannot be used internally to plan, because it contains no work. And it exposes
the organisation to a misrepresentation claim that is easier to prove and often
worse than the non-conformance it was hiding — an omitted gap reads as a
positive assertion of completeness to everyone who sees the page.

The register is the honest inverse: every obligation from the article map
carries a standing of *met*, *partial*, or *not met*, and anything short of met
carries an **owner** and an **effort estimate**. Those two fields are what
converts a confession into a plan, and their absence is what makes most
compliance documents inert.

## Why owner and effort specifically

- **Owner** is two things, not one. It carries the *regulatory role* that owes
  the duty — builder, operator, or both — and, for anything you owe, a named
  role with authority to schedule work. The regulatory half tells a customer
  which rows are theirs to close; the accountable half stops the row from being
  rediscovered at the next review in the same state. A team noun is not an
  owner and "engineering" is not an owner.
- **Effort** makes the gap *comparable*. Without it, every gap looks equally
  large and the register is triaged by anxiety. With it, the register sorts:
  three gaps closable in a week are done before the one that needs a quarter,
  and a gap whose estimate is "unknown" is flagged as needing a spike, which is
  itself a scheduled piece of work rather than an open question.

An estimate does not need to be precise. Three bands — under a day, under a
week, longer — carry almost all the planning value and none of the false
confidence, and they are coarse enough that nobody argues about them instead of
closing the gap.

## Procedure

1. **Derive rows from the article map**, one per obligation, preserving the
   role assignment from
   [provider-versus-deployer-duties](provider-versus-deployer-duties.md). A
   register that regroups obligations by theme loses the ability to answer
   "which of our own duties are unmet".
2. **Use three standings, never two.** *Partial* is the honest majority state
   and collapsing it into met is where the misrepresentation enters. Partial
   requires a sentence saying which part is done and which is not.
3. **Never render an unassessed obligation as met, as not-applicable, or as
   absent.** *Not yet assessed* is a fourth standing and belongs in the register
   with an owner, because an obligation nobody has looked at is the highest-risk
   row on the page ([law](../../_laws.md#absence-of-evidence-is-not-evidence)).
4. **State the hard classifications rather than burying them.** That hiring AI
   falls in the highest risk tier a regime defines belongs at the top of the
   register, not in a footnote. Readers who find it themselves conclude you hid
   it.
5. **Record refused derogations as rows.** Where a regime offers an exemption
   and you declined it, that is a decision with reasoning, and it is one of the
   most credible things on the page. Silence about an available exemption looks
   like ignorance of it.
6. **Say only what the register holds.** Every *met* needs evidence you could
   produce on request — a document, a control, a test, a recorded process
   ([law](../../_laws.md#say-only-what-the-record-holds)). "Met" without
   producible evidence is *partial*.
7. **Date each row and the register.** A row met eighteen months ago against a
   provision since amended is not met; without dates nobody can tell.
8. **One register, one projection — and the projection drops columns, never
   rows.** The internal register carries evidence pointers, gap identifiers and
   working notes; the published surface carries the same rows with the same
   standings and a plain-English summary a non-specialist can check you on.
   Dropping *columns* is discretion. Dropping *rows* is the omission this whole
   technique exists to prevent, and it is what turns the public copy into the
   only maintained artifact within two quarters.
9. **Quote enforced numbers, not written ones.** Any duration on the
   register — a retention window, a consent lifetime, a response deadline —
   must be read from the setting that actually enforces it. A hard-coded number
   in a compliance sentence is true on the day it is written and false the first
   time an operator changes the configuration, and nobody will notice, because
   the sentence still renders.

## What belongs on a hiring product's register beyond the obvious

The rows teams routinely miss, all of which are deployer-side and none of which
a vendor discharges:

- A **mandatory impact assessment** performed before AI-assisted candidate
  evaluation goes live, with human oversight at every advancement gate recorded
  as the stated mitigation — an assessment written after deployment is a
  description, not an assessment.
- **Sub-processor disclosure**: a maintained, published list of the parties who
  process candidate data on your behalf, with a change-notification path.
- **Data-subject rights beyond erasure**: access, rectification, portability,
  objection, and the right to an explanation of an individual decision. Products
  reliably build deletion and stop, because deletion is the one that appears in
  the headlines.
- **Retention windows set by limitation periods**, not by storage cost, and
  reconciled against any conflicting erasure duty rather than resolved by
  whichever job runs first.
- **Worker and representative notification** before a workplace system goes
  live.

## Decision rules

- When a gap has no owner after one review cycle, escalate it as a governance
  failure rather than leaving it unassigned — the missing owner is the finding.
- When an effort estimate is unknown, schedule a time-boxed investigation and
  record that as the effort. "Unknown" is never a resting state.
- When a gap is closed, keep the row — struck through, dated, and carrying the
  evidence that closed it. A register that only shows the present cannot
  demonstrate a trajectory, which is much of what a reader is assessing, and
  deleting closed rows makes a re-opened one look new.
- When publishing, publish every row. Selecting rows for publication
  reintroduces exactly the omission the technique exists to prevent.
- When a row is partially closed, say which half. "Partially closed — candidates
  now receive a structured explanation of their own decision; the full sealed
  record remains internal by design" is a usable sentence. "In progress" is not.

## When not to use this

Do not use a gap register as a substitute for fixing something dangerous.
Documenting an unmet duty that is actively harming candidates — a screening
gate running without human oversight, an adverse action taken automatically —
is not mitigation; it is a dated confession. Those close first and appear on
the register only in the past tense.

Do not merge the register with the regime catalog. The catalog says what
applies; the register says how you stand. A table that does both grades itself
and drifts toward flattering rows.
