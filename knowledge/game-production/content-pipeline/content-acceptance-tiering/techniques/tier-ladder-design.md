---
layer: technique
type: technique
subject: content-acceptance-tiering
technique: tier-ladder-design
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [designing an acceptance ladder for a new content domain, auditing whether an existing rung earns its place]
---

# Tier ladder design

The procedure for deriving the rungs of an acceptance ladder for a content domain you
have not laddered before, and for auditing rungs that already exist. The output is an
ordered list of tiers, each with a stated evidence kind, a stated blindness, and a
stated deferral legality.

## Procedure

**1. Enumerate the defect classes, not the checks.** Before naming a single rung, list
the ways a piece of content in this domain has actually gone wrong. Pull them from
incident memory, not imagination: the item that shipped with an empty description, the
creature that referenced a removed faction, the ability that was granted to nobody, the
character that stood motionless, the material that read as plastic. Twelve to thirty
entries is a healthy list. A ladder derived from checks you already own reproduces your
current blind spots exactly.

**2. Group defects by the kind of evidence that reveals them.** For each defect, write
down the smallest thing you must *look at* to see it. Not the cheapest tool — the
smallest evidence. An empty description is visible in the artifact's own data. A dead
faction reference needs the artifact plus the graph it sits in. Motionlessness needs a
running frame. This grouping, not your tooling, produces the rungs.

**3. Order the groups by containment.** Group A sits below group B when B's evidence
subsumes A's: everything readable at A is still readable at B, plus something more.
Where two groups are not comparable — declared state and a recorded human choice are
genuinely orthogonal — order them by *what the pipeline needs first* and note the
orthogonality, because it will matter when you write the roll-up.

**4. Apply the strictly-more test to every adjacent pair.** Name one defect from your
step-1 list that passes the lower rung and is caught by the higher one. No named defect,
no rung: merge it downward. Write the naming defect into the rung's definition — it is
the rung's reason to exist and the thing you will re-check when someone proposes a
seventh tier.

**5. Declare each rung's blindness explicitly.** For every rung, write the sentence
"this rung cannot see ___". A rung whose blindness you cannot state is a rung you do not
understand, and it will be quoted as stronger evidence than it is. The blindness
statements collectively are the argument for why the ladder has as many rungs as it has.

**6. Prove each rung bites, by mutation.** For every rung, take an artifact that passes
it, corrupt exactly the thing the rung claims to grade, and assert the verdict flips.
This is the only test that distinguishes a working rung from one that checks a proxy —
that a selection *index* is present rather than grading what was selected, that a field
*exists* rather than what is in it. Keep the probes as a permanent suite, one per rung
per content class, and treat the count of rungs that survive mutation as a ratchet that
may only go up. The first run of this probe is reliably humbling; budget for it.

**7. Mark deferral legality per rung.** Which rungs may legitimately report *unable to
run here*, and for what environmental reasons? Rungs that need only the artifact and its
graph may never defer — the environment is always present. Rungs that need a running
system or a rendered frame may. This marking is what the completion predicates read.

## Decision rules

**When a proposed rung's distinguishing defect is a subset of the rung below it, merge
it.** Two rungs that catch the same class differ in thoroughness, not in kind, and
thoroughness belongs inside one rung as more checks — not outside it as another tier.

**When a rung's evidence requires an environment the authoring workstation lacks, it
belongs above the deferral line, whatever it costs.** The line is drawn by environment
dependence, not by runtime. A perceptual check that takes two seconds still sits above
the line if it needs a built client.

**When one rung's evidence is produced by the same process that authored the artifact,
split the observer out or drop the rung.** Self-produced evidence is a self-report; a
rung built on it will pass universally and silently. If no independent observer exists
for that evidence kind, you do not yet have that rung — record the self-report as an
input and leave the rung unmeasured.

**When the domain has no perceptual surface, do not create a perceptual rung.** A
ladder with a permanently-deferred top rung teaches everyone to ignore the top rung, and
that habit transfers to domains where the rung is real. Content classes may legitimately
have different ladder heights; make the applicable rung set a property of the class.

**When you are tempted to add a rung for a *phase* rather than an evidence kind, stop.**
*Imported*, *reviewed*, *scheduled*, *assigned* are pipeline states. They belong in a
workflow model, not in an evidence ladder, and mixing them dilutes every completion ratio
computed over the ladder.

## Sizing: three rungs, five, or seven

Rung count is a property of the domain, not a convention to copy.

- **Three** suits a domain with no behaviour: declared state, static rules, perceptual.
  Static props, iconography, localized strings.
- **Five** is the common shape for systemic content: declared state, recorded human
  choice, static rules, runtime behaviour, perceptual truth.
- **Seven** appears where a single evidence kind splits into genuinely distinct
  observations. Runtime commonly splits into *it activated at all* and *it produced the
  right magnitudes* — different traces, different blindness, both real. Perceptual can
  split into *renders without artefacts* and *meets the craft bar*, because the first is
  machine-checkable and the second is a judgment against a shipped standard.

Split a rung when and only when the two halves have different blindness statements and
different deferral legality. Otherwise the split adds bookkeeping and no information.

## When not to use this

Do not ladder a domain whose acceptance is genuinely single-valued. A pure data table
with one validator does not need five tiers around one check; it needs the check, and a
status that distinguishes ran-and-passed from never-ran. The ladder earns its cost when
evidence kinds differ, and a one-kind domain gets all the honesty benefit from the
status vocabulary alone.

Do not use a ladder to model *approval workflow*. Who may sign off, in what order, with
what escalation, is an organizational structure that changes with the org chart. An
evidence ladder changes only when the physics of the content change, which is why it can
be trusted for years. Keeping them separate is what keeps the ladder stable enough to
be worth building.

Do not retrofit rungs to match an existing dashboard's columns. The dashboard is a view;
if the derived ladder has four rungs and the dashboard has six columns, the dashboard is
wrong.
