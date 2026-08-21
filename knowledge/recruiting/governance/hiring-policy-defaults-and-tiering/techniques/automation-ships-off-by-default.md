---
layer: technique
type: technique
subject: hiring-policy-defaults-and-tiering
technique: automation-ships-off-by-default
status: forged
laws: [no-adverse-outcome-is-solely-automated, uncertainty-resolves-toward-the-candidate, every-decision-names-its-actor]
shared_with: []
use_when: [shipping a hiring feature that can act without a human, setting the initial state of an automation toggle, onboarding a new organisation onto a hiring system]
---

# Automation ships off by default

## The concern

The difference between a product that *assumes* automation and one that *offers* it is a
single boolean's initial value. A hiring system that ships with unattended rejection
enabled has decided, on behalf of every organisation that installs it, that machines may
end applications. A system that ships with it disabled has decided nothing — it has left
the decision where it belongs, with an organisation that must actively turn it on and will
be identifiable as having done so.

This technique is the asymmetry rule applied to the switches that can end an application:
**the shipped position of an automation toggle is the position whose failure mode is
reversible.**

## The asymmetry, stated precisely

Automation settings in hiring are not symmetric in consequence, and the design must not
treat them as one uniform class.

| Behaviour | Failure mode if wrongly on | Reversible? | Ships |
| --- | --- | --- | --- |
| Auto-advance a strong candidate | a person reviews someone who did not need reviewing | yes, cheaply | on is acceptable |
| Auto-hold an uncertain candidate | a queue grows | yes | on |
| Auto-send a scheduling invitation | a candidate receives a message slightly early | mostly | on with a settle delay |
| Auto-reject | a person is removed from the process by nobody, told nothing they can appeal, and never surfaces the defect | **no** | **off** |

Only the last row is genuinely irreversible, and it is the row the rule exists for. The
table is worth writing down in the product because it converts an argument about caution
into an argument about reversibility, which is answerable.

The optimistic action is also the one a guess may buy and the pessimistic one is not:
[uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)
means an unsure system may advance or hold, never remove.

## The procedure

1. **Enumerate every path by which the system can complete an adverse action without a
   human click.** Include the ones that are not called automation: nightly sweeps, staleness
   expiry, bulk tools with an "apply all", import routines that resolve conflicts, retry
   paths that re-execute a queued action. The toggle only protects the paths it covers, and
   the uncovered path is always the one written last.
2. **Give the adverse capability exactly one switch, at the organisation layer, off.** Not
   one per team, not one per requisition, not several partial switches that interact. One
   named capability with one owner.
3. **Make enabling it a recorded act.** Actor, timestamp, previous value, and — this is the
   part usually skipped — a required acknowledgement of what is being enabled, stated in
   outcome terms rather than feature terms: not "enable automated decisions" but "allow
   this system to reject candidates without a person reviewing them"
   ([every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
4. **Keep the capability inert in code as well as in configuration.** With the switch off,
   the adverse branch must not merely be skipped at the last moment — the proposal should
   not be produced, and if it is produced anyway by a caller that did not check, the apply
   boundary refuses it. A toggle enforced at one site is a toggle that a new caller reaches
   around.
5. **Preserve the off position through every provisioning path.** New organisation, cloned
   configuration, restored backup, imported settings, seeded demo data, test fixture
   promoted to production: each of these is a way for an on-position to arrive without an
   actor. Assert the default in the provisioning code, not only in the schema.
6. **Report the enabled set.** Anyone accountable should be able to ask "which parts of our
   organisation currently permit unattended adverse action" and get a list with names and
   dates, not a tour of settings screens.

## Decision rules

- **When a new automated capability can produce an adverse outcome, it ships off, in the
  same change that introduces it.** Adding the capability on and turning it off later means
  every organisation that upgraded in between ran it.
- **When a customer asks for it on by default for their tenant, refuse and offer to help
  them turn it on.** The value of the recorded act is destroyed by pre-arranging it.
- **When the toggle is off, the machine may still compute and record its recommendation.**
  Suppressing the *analysis* wastes the signal a human reviewer needs. What is suppressed is
  the *execution*. Recommendation, route and applied outcome are three different
  vocabularies, and only the third is gated here.
- **When a bulk tool exists, it is covered by the same switch as the nightly path.** Two
  code paths, one capability. A bulk tool with its own enablement is an automation switch
  that was never reviewed as one.
- **When the switch is turned off after having been on, in-flight proposals do not
  complete.** Disabling means stopping, not draining. The alternative is a queue of adverse
  actions executing under a policy that was withdrawn.
- **When measuring adoption, the fraction of organisations that enabled it is a product
  signal, not a failure.** Low adoption of unattended rejection means the safeguard is
  working; treating it as a funnel problem is how the default gets flipped.

## The onboarding conversation this creates

Shipping off forces a conversation at the moment an organisation is most able to have it:
someone must decide, articulate why, and put their name on it. That conversation is the
mechanism. It surfaces which cohorts are shielded, what the bars are, who reviews the
queue, and what happens when the queue is not worked — questions that a pre-enabled system
never prompts anyone to ask, because nothing ever required an answer.

It also produces the artifact that matters under scrutiny. "Our policy is that we do not
auto-reject" is an assertion. "Unattended rejection is disabled; here is the configuration
history showing it has never been enabled" is evidence, and it is evidence the system
produced by itself.

## When NOT to use it

- **Not for automation whose failure is inconvenience.** Ship auto-advance, auto-hold,
  reminder sends and enrichment on if they are good. Applying the off-by-default rule
  uniformly makes the product unusable and teaches everyone to flip every switch during
  setup, which defeats the rule where it matters.
- **Not as a replacement for cohort shields or the undecided verdict.** Those hold when the
  switch is *on*, which is the state this technique is designed to make deliberate rather
  than to prevent. A system whose only protection is the off position is one enthusiastic
  administrator away from having none.
- **Not for statutory or safety gates.** Where a check must run — a credential
  verification, a jurisdictional restriction — it is not a toggle at all. Do not model a
  requirement as a default-off feature; model it as a constraint no layer can clear.
- **Not as an excuse to leave the enabled path untested.** The off default protects
  adopters, not the code. The enabled path is the one that will run at the largest and most
  motivated customers, and it deserves the heavier test suite.
