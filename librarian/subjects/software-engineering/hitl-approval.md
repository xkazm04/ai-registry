---
domain: software-engineering
subject: hitl-approval
last_touched: 2026-08-27
touched_by: intake
dry_streak: 0
---

# hitl-approval

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-27 - `/intake` (run 33)

Gained `fixed-policy-amendable-plan` (10 -> 11 techniques) and a new golden-path
section, "What none of the three flows governs: the machine's own terms". Source:
[[2026-08-27-agentic-engineering-practical-guide]] - a first-party practitioner
account of one coding-agent harness, 173 recorded harnesses over four weeks.

**The open lead below about the opening paragraph is now larger, not smaller: there
are four flows.** The three the subject owned all gate an *action*. The fourth
governs the machine's **terms** - the scope it was given, the route it intends, the
definition of done - which the subject had treated as static from dispatch, because
both repairs look wrong on sight: a plan the executor cannot amend is defeated by
the first fact arriving after dispatch, and a plan it can amend is a policy whose
first edit removes whichever constraint was working. The resolution is to split the
record by **write authority rather than by content**, at which point the split
becomes a trigger predicate like any other in this subject.

**The subject had denied too much, and the denial is what hid this.**
`gate-state-machines` states that approval transitions are driven only by a human -
correct for verdicts, and read across the whole harness record it forbids the
amendment lane the source measured as the normal case. An amendment is not a
verdict: a verdict says a gated thing may take effect, an amendment says the route
changed inside a scope already granted. Conflating them fails both ways - every
amendment treated as a verdict buries the human, a verdict treated as an amendment
lets the executor approve itself.

Method note, and it is the same enumeration run 4 hunted: "two flows that are mirror
images of each other" has now yielded a third flow (run 4) and a fourth (run 33)
from two unrelated sources. **A completeness claim does not stop being good hunting
ground after it has been hunted once.**

Also worth recording: the source's *headline* claim - put the boundary where the
agent cannot edit it - was **already owned and better**, by the golden path's "The
gate lives in the substrate, not the prompt". The landing came from the source's
failure list, not from its thesis.

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

- **This subject is now at eleven techniques, and nothing enforces a ceiling.** No
  longer a two-wave coincidence: a third pass (run 33) crossed it again, deliberately,
  each addition defensible on its own. Two concurrent waves each respected the observed
  house maximum of nine in isolation; the union was ten, and intake made eleven.
  No wave was wrong and the gate does not check.
  The next structure pass should decide whether nine is a real bar worth enforcing or an
  observation that has been overtaken - and if it is real, which of the ten is a section
  of another rather than a technique of its own.
- **Four flows now, and the golden path's opening still says two.** Run 4 stated the
  third, run 33 the fourth; the framing paragraph was written when there were two, and
  each pass has added a section rather than rewriting the frame. This is the subject's
  largest structural debt and it should not absorb a fifth addition untouched. A
  `/deepen` pass should decide the real taxonomy, because the four are not one list:
  review and consent gate an *action* at two different moments, the third removes the
  machine from the action entirely, and the fourth governs the *terms* rather than any
  action at all. The plausible reframing is two axes - what is gated (an action or the
  scope) and who acts (the machine or the human) - rather than a flow list that grows
  by one every time somebody hunts the enumeration.
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

## 2026-08-27 - /intake, from a coding-agent harness tree ([[2026-08-27-whip-coding-agent-harness]])

Two sections added to `consent-gates`, plus a `use_when` entry. A seam, not a hole - the
technique already owns "the scope of subsequent is the design decision" and names three
axes (agent, capability, target).

**It warns only about the tuple collapsing too wide.** The narrow failure is quieter and
concentrated in one place: wherever the capability axis is not an operation the system
defined but **a string the agent composed** - a command line, a query, a request path.
There is no capability to key on and no target to separate from it, so the grant records
the literal action, the next invocation differs by one argument and misses it, and the
asking never stops. The fatigue trade the first-use grant exists to make never happens,
and the human learns to answer without reading: the exact failure the gate was built to
prevent, reached by way of a gate that fired correctly every single time.

Remedy landed: declare how many leading tokens of a composed action constitute its
identity, treat the rest as its target. Flags are never counted (an added flag would
silently reshape the grant), and an unknown prefix falls back to the whole literal string
- this rule may only ever fail toward asking too often.

Second section from the asymmetry hunt: the technique gives **four** dimensions of
disclosure for the *action* and says nothing about disclosing the *grant*, which is the
half that outlives the moment. So the remember-this path renders the rule it is about to
install, in the terms the gate will later match on, before installing it. Landed with its
cheapest justification rather than a principled one: a human shown "this will allow
<verb> <subcommand> with any arguments, in this workspace" is the **only** available audit
of the prefix table, because in isolation every entry in that table looks reasonable.
