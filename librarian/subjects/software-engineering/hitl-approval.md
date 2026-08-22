---
domain: software-engineering
subject: hitl-approval
last_touched: 2026-08-22
touched_by: harvest
dry_streak: 0
---

# hitl-approval

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - harvest wave (run 4)

Gained `severity-sla-ladder`, `cosmetic-vs-enforced-threshold-invariant` and
`fail-loud-classification-default` (7 -> 10 techniques), and its first non-`rust`
application, `react--cosmetic-vs-enforced-threshold-invariant`. See [[2026-08-22-4]].
**The single-stack debt below is retired.**

The negative space the wave found: `unattended-mode` establishes that a no-human path
exists, `gate-state-machines` owns the states and `decision-records` owns the verdict -
but nothing owned the *clock*. How the deadline is derived per severity, that a second
purely cosmetic urgency ladder must exist and be provably faster than the enforcing one,
and what an item classifies as when its payload will not parse.

The load-bearing find is the invariant between the two ladders. It is asserted at load
time rather than documented, because no single edit sees both tables - and in the tree it
was taken from, **the module holding that assertion is imported by nothing**, so it never
runs. That became a section of its own: an assertion is only as live as its module, so
put the check on the side that acts.

### 2026-08-22 - `/research` (run 4)

Gained `human-performed-steps` (6 -> 7 techniques). Source:
[[2026-08-22-skills-v1-2-release]].

The subject's golden path declares it owns "two flows that are mirror images of each
other" - review and consent - and in both the human decides while the machine acts. The
finding is a third: the machine must not act at all, so the human performs the step and
the machine's job is to carry everything around it. An executable runbook, deterministic
by requirement rather than by preference, because that is what makes it reviewable before
a credential is pasted in and what keeps the credential off any inference path.

Method note worth keeping: **a subject that enumerates its own completeness is good
hunting ground.** The claim "two flows, mirror images" invites exactly one question.

### 2026-08-22 - `/research` (run 2), earlier

`unattended-mode` gained a section on inferred versus enumerated scope. See
[[2026-08-22-ai-agent-race-exploded]].

## Open leads

- **This subject is now at ten techniques, and nothing enforces a ceiling.** Two
  concurrent waves each added to it while respecting the observed house maximum of nine
  in isolation; the union is ten. Neither wave was wrong and the gate does not check.
  The next structure pass should decide whether nine is a real bar worth enforcing or an
  observation that has been overtaken - and if it is real, which of the ten is a section
  of another rather than a technique of its own.
- **Three flows now, and the golden path's opening still says two.** The research pass
  stated the third; the framing paragraph was written when there were two. A `/deepen`
  pass should decide whether the opening is rewritten around three flows or whether the
  third is deliberately a subordinate case. The harvest's three techniques do not touch
  that framing - they sit under the clock, not under the flow taxonomy.
- **`resume-after-decision` and the runbook's resumability overlap.** Stated once, in the
  research technique, by reference. Check the seam if either is deepened.
- **`paired-tables-assert-their-relation`** (proposed law, not added). When two tables key
  off one closed vocabulary and must stand in a fixed relation, the relation belongs in
  code that runs at load. Sightings here, in this bundle's key-parity gates, and in
  schema-versus-migration parity.

## Standing debt

- ~~**Single stack** (`rust`)~~ - retired by the harvest wave, run 4.
- Two research-added techniques still carry no application.
- **Never swept by `/librarian`.**

## Declines

None.
