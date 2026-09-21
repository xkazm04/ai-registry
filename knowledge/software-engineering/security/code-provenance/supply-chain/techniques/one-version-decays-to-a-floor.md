---
layer: technique
type: technique
subject: supply-chain
technique: one-version-decays-to-a-floor
status: forged
laws: [gate-sees-target, count-carries-predicate, absent-guard-is-loud]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [driving several checkouts onto one dependency version at once, claiming a set of repositories is on a given version, an advisory names a patched version and several codebases must clear it, deciding whether to require one version everywhere or a minimum everywhere, a coordinated upgrade that nobody has re-checked since the day it was done]
---

# One version decays to a floor

Driving several independently resolved codebases onto the same version of a
shared dependency is an **event**. Being on the same version is a **state**.
The event does not maintain the state, and the gap between the two is where a
fleet keeps its most confident wrong belief: *we upgraded, so we are on it.*

The mechanism is arithmetic, not neglect. Each checkout has its own
declaration, its own resolution record, and its own clock. Nothing joins them:
there is no shared resolution, so no repository's install can observe another's.
Every subsequent operation in any one of them — adding an unrelated package,
regenerating a stale resolution, a contributor who cloned before the sweep and
resolved after it — re-resolves that repository alone, against whatever the
range in its own declaration admits on the day it runs. Coherence therefore
does not erode from the outside; it is **dissolved by ordinary work in each
member, and the members are not in contact.**

## Equality is not a maintainable invariant, and a floor is

The reflex after a coordinated sweep is to require the state that the sweep
produced: same version everywhere, checked. The corpus has already measured
where that ends. A check that demands version *equality* refuses working
installations, is discovered to refuse working installations, and is then
switched off — after which it guards nothing
([advisory-version-floors](../../../../backend-platform/model-workflow-contracts/self-describing-model-packages/techniques/advisory-version-floors.md)).
Equality also has no owner: with N declarations and no shared resolution, the
only way to hold it is for every install in every member to be coordinated with
every other, forever, which is a standing cost nobody has ever paid.

The enforceable invariant is a **floor**: nobody below X, everybody free above
it. A floor survives ordinary work, because ordinary work moves versions
forward. It is satisfied by the member that upgraded early and by the member
that upgraded on time, and it is violated only by the case anyone actually
cares about. And unlike equality, a floor has a truth condition cheap enough to
evaluate on demand: one comparison per member.

The floor is per dependency, not per fleet, and only a few dependencies earn
one — the ones whose behaviour reaches code nobody edited, and the ones named
in an advisory. A floor declared for everything is a floor maintained for
nothing.

## The claim needs its predicate, and the declaration is not the fact

"We are on X" is a count without a predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): it does
not say which members were read, what was read in each, or when. Two of those
three are where it goes wrong.

**What was read.** A member's declaration states a *range*; its resolution
record states what the range actually selected. A sweep that edits declarations
and a check that reads declarations agree with each other and with nothing else
— the declaration is a wish, and a permissive range holds its wish while
resolving somewhere else entirely
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The check reads the
resolution record in each checkout.

**When.** The answer is dated or it is not an answer. A coordinated state has a
half-life, so a report from the day of the sweep is evidence about that day.

There is also a trap inside the coordinating act itself. The ordinary command
for "install this exact version" **rewrites an exact declaration into a
permissive range** in several ecosystems. A sweep run that way fixes the
version and silently replaces each member's declared pinning policy with the
opposite one — widening, in the same motion, the aperture through which the
state it just established will drain away. Diff the declarations after a sweep,
not only the resolutions; the sweep is a change to policy as well as to
version.

## The instrument, and where it has to run

None of this is answerable from inside any one repository, which is why it goes
unanswered: the question spans checkouts, and no member's own gate can see its
siblings. So the artifact that outlives a coordinated upgrade is not the
synchronized state — that is already decaying — but a **query that runs where
the checkouts are, reads each one's resolution record, and returns a non-zero
status when any member is below the floor.**

Three properties make it worth having rather than a report nobody reads:

- **An exit code, not a paragraph.** The advisory question is a yes/no with a
  named list, and it deserves a status a caller can branch on.
- **A named caller.** An instrument with no caller is run once, on the day it is
  written, by the person who wrote it, and then the fleet is back to believing
  the sweep. This is the failure mode to expect: the absent check does not
  announce itself, and the fleet reads as coherent precisely because nothing is
  looking ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
- **Slugs, not paths.** The report names members, not locations, so it can be
  quoted into a record that leaves the machine.

Note what this does *not* become. A cross-repository obligation cannot be
gated at a sibling's commit — that boundary is already argued, and the honest
architecture is within-repo gates and cross-repo *reports*
([cross-repo-drift-detection](../../../../engineering-process/codebase-stewardship/docs-sync/techniques/cross-repo-drift-detection.md)).
The floor query is a report with a status code, run by whoever owns the fleet,
not a hook installed in nine repositories.

## The measured shape

One fleet drove six checkouts of one shared framework onto a single patch
version on the day a critical advisory named it. Twenty-two days later, eight
members carried that framework and **two were below that floor** — one by a
patch line, one by two minor lines — and no change in either repository had
mentioned the dependency. The floor query returned non-zero and named both; the
declarations alone would have reported one of them as compliant. Across the
same fleet on the same day, **thirty-seven shared dependencies resolved to more
than one version**, two to seven versions each, including a linter straddling a
major boundary.

Read the two halves together, because they refute opposite errors. The two
below the floor say a coordinated sweep is not a standing state. The
thirty-seven say demanding equality was never on the table: nobody held it for
a single dependency for three weeks, and a rule that requires it is a rule
about a fleet that does not exist.

## Boundaries

- **Whether the new version should be adopted at all** — reading the
  mitigations rather than the fixes, the reach of a framework versus an ordinary
  input, the baseline taken before the bump — is
  [update-automation-review](./update-automation-review.md). That technique owns
  one codebase's decision; this one owns the set's arithmetic afterwards.
- **The effective minimum a single project can claim**, as the maximum over its
  own transitive graph, is
  [toolchain-floor-drift](./toolchain-floor-drift.md). Same word, different
  direction: there the floor rises underneath one project without anyone
  acting; here a floor is declared across many and drains as they act.
- **Which member deserves attention this quarter**, and how heterogeneous
  projects are compared at all, is the portfolio layer's
  ([cross-project-comparison](../../../../engineering-process/standards-and-gates/multi-project/techniques/cross-project-comparison.md)).
  A version floor is a yes/no about exposure, not a dimension in a ranking.
