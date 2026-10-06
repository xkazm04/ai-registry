---
layer: technique
type: technique
subject: combat-pacing-and-dramatic-arc
technique: proxy-driver-limit-declaration
status: forged
laws: [unmeasured-is-not-a-pass, no-gate-self-certifies, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a fairness or pacing verdict was produced by a scripted or AI stand-in for the player, writing the report line that says what a simulated pass does not prove, deciding when a simulated result may be called felt]
---

# Declaring the simulated driver a proxy

The named concern: every fairness figure produced by a stand-in for the player carries, in
the same line, a declaration of what the stand-in was, what it cannot see, and that no human
sample exists — so that a pass is read as a pass *for the proxy* and as nothing more.

## Why the declaration is part of the number

A gate such as the opening-wreck rate is computed by a machine playing the lead vehicle. The
machine has a decision policy, a skill setting, a perfect or absent input latency, a view of
the world that a screen does not give a person, and no hands. A rate measured on it is a
claim about that machine. The naive reading takes the same number for a statement about
players, and nothing in the figure itself contradicts it: it is a clean percentage, it is
reproducible, it is under target. That is exactly the condition under which a team stops
asking.

The errors do not cancel and their direction is not knowable from inside the simulation. A
proxy that brakes for every projectile, never panics on a blind corner and never fights the
camera is *kinder* than a person and understates the early elimination. A proxy that steers
by a diagnostic pursuit controller and fires at everything within range can be *harsher* than
a reasonable driver. Either way the honest statement is that the sign of the bias is unknown.
Reporting it as unknown is not modesty; it is the difference between *not measured* and
*measured fine*.

## The declaration block

Print these beside every proxy-derived fairness figure, in the report line itself and not in
an appendix:

- **Driver policy**: what decisions the stand-in makes (line choice, weapon use, repair), by
  name, and the skill tier it was set to. If different entrants ran different skills, list
  them per scenario.
- **Input path**: whether input was a decision function inside the simulation or a script
  sending ordinary controls to the real device, and at what rate. A scripted device run is
  real hardware and a real build, and it is still not a person.
- **Coverage**: which classes, courses and loadouts the events crossed, and which were not
  run. State the exclusions as exclusions.
- **Sample size and seeds**, as in the gate itself.
- **Human sample: none** (or its size and date, when one exists). The field is mandatory and
  its absence from a report is a defect in the report.

A verdict line then reads *met for the declared proxy, simulated*, never *fair*. A tiered
evidence vocabulary (structurally valid, wired, behaves, felt) is the right companion: proxy
results top out at *behaves*, and *felt* is reserved for a person who played it and said so.

## Procedure

1. Write the declaration before running the sweep, from the harness's own configuration, so
   it is derived from the instrument rather than recalled afterwards.
2. Add the declaration to the report generator, not to the report author's checklist. A
   field the generator emits cannot be forgotten; a field a person must remember is dropped on
   the day the report is rushed.
3. Pair each proxy figure with at least one **device-scripted** observation where it exists
   (a handful of real-build races) and report a disagreement between the two as the headline,
   above the passing simulated rate.
4. Name the human check that would retire the proxy: how many sessions, which drivers, which
   rate observed. Ten first sessions in which a given share ends in the opening is a cheap,
   small, human sample, and it should be planned rather than hoped for.
5. When the human sample arrives, record it beside the proxy figure and let it replace the
   verdict. Do not average the two.

## Decision rules

- When a team member says the numbers show the opening is fair, the correct reply is the
  declaration: *fair for this proxy, over this sample*. A passing figure is an input to the
  owner's judgment.
- When the simulated pass and the first scripted device races disagree, trust the device
  and treat the disagreement as a defect in the model before treating it as variance. A run
  that satisfies every correctness assertion — damage applied, shooter excluded, terminal
  states distinct — says nothing about whether the opening was enjoyable to be in.
- When a gate is tuned to pass for the proxy repeatedly, the risk is fitting the proxy: the
  coefficient ends up right for a machine that never makes a mistake. Change the proxy's
  skill and check that the verdict moves in the expected direction; a gate insensitive to
  driver skill is not measuring driving.
- When the proxy is the same code that produced the content, apply the usual rule that the
  producer does not certify its own work: the declaration lists it as self-reported, and the
  verified-versus-asserted split stays visible.

## What is measured, simulated, authored

Everything this technique governs is **simulated or device-scripted**. The declaration itself
is a statement of limits, **authored** by whoever owns the report. By construction it
contains no human-felt claim.

## When not to use this

- **When a human sample already exists** and is the basis of the figure; declare its size and
  collection method instead. This technique is the stand-in's label, not a replacement for a
  playtest.
- **For purely structural checks** (a floor on health, a damage table lint), where no driver
  decides anything. The proxy is the part that makes a claim about people.
