---
layer: technique
type: technique
subject: maturity-ladders
technique: present-vs-enforced
status: forged
laws: [gate-sees-target, failure-not-empty-success, deletion-is-not-repair]
shared_with: []
use_when: [defining the top rungs of a ladder, an assessment looks too good, deciding what evidence a rung requires]
---

# Present vs enforced

Most capability ladders that overstate do so at one seam: they treat the
*existence* of a thing as the capability the thing was supposed to deliver. The
document exists, so the practice is defined. The configuration file names a
rule, so the rule is applied. This technique is the discipline of separating
existence from operation from enforcement, and of demanding different evidence
for each.

## The four states, and why the middle two are separate

For any control — a policy, a convention, a check, a review step:

1. **Absent** — no artifact, no practice.
2. **Present** — an artifact exists and is discoverable. It may be stale, may
   describe a system that no longer exists, may never have been read.
3. **Practiced** — the artifact describes what actually happens; the behaviour
   is observable in recent activity. Nothing prevents deviation.
4. **Enforced** — a mechanism refuses the deviation. Non-compliance is not
   discouraged, it is *impossible without a deliberate override*, and the
   override is itself visible.

Collapsing 2 and 3 is the classic overstatement. Collapsing 3 and 4 is the
subtler one, and it is the difference between a team that is currently
disciplined and a team whose discipline survives its next hire.

A fifth state is worth a rung only where the domain warrants it: **enforced and
monitored**, where the enforcement mechanism's own health is observed, so a
silently disabled gate is detected rather than assumed to be passing.

## Evidence: each state demands a different kind

| State | What satisfies it | What does *not* |
| --- | --- | --- |
| Present | The artifact's content was retrieved and matches the property | A path that "should" exist; a link; a mention in another document |
| Practiced | Recent activity records show the behaviour occurring | The artifact saying it is done |
| Enforced | A configuration that is *wired to a blocking path*, plus, ideally, a record of it having denied something | A rule defined but not attached; a check that runs in a non-blocking mode |
| Enforced+monitored | The enforcement mechanism reports its own liveness | The absence of failure reports |

Two rules do most of the work.

**Only fetched content proves the upper rungs.** An assessment that promotes on
the *presence of a filename* promotes on a broken symlink, an empty file, and a
placeholder committed six months ago. Where retrieving content is impossible
(rate limits, permissions, cost), the honest outcome is to cap the rung at the
highest level that reference-level evidence supports and say so — not to assume
the content is good.

**A gate must observe what it gates.**
([gate-sees-target](../../_laws.md#gate-sees-target)) A check that runs against a
staged copy, a cached index, or a subset passes precisely when the proxy diverges
from reality, which is the case the gate existed for. When assessing the enforced
rung, ask what the mechanism actually reads, not what it is named after.

**Silence is not compliance.** A gate with zero recorded denials is either
protecting a perfect population or not running at all, and those are
indistinguishable from the outside
([failure-not-empty-success](../../_laws.md#failure-not-empty-success)). Where the
ladder can see denial history, a never-fired gate should attract scrutiny rather
than credit; where it cannot, the enforced rung says "configured to block", which
is a weaker and more honest claim than "blocks".

## Honesty caps

An honesty cap is a rule that lowers a computed rung when the *evidence itself*
is weak, independent of what the criteria say. Three that earn their place:

- **Coverage cap.** If the assessment inspected fewer than a stated fraction of
  the relevant population, cap at the practiced rung; you have seen a sample,
  not a system.
- **Freshness cap.** If the newest supporting evidence predates the subject's
  last significant change, cap one rung below the computed value. Capability
  claims decay.
- **Self-report cap.** Any rung above "present" that rests only on declared
  evidence is capped to "present". Self-assessment is a hypothesis.

Caps must be *reported*, not silently applied — the output says "capped at
practiced: only 12 of 90 services inspected", so the subject knows what would
lift the cap. A cap with no explanation reads as an unfair verdict and gets
argued with instead of acted on.

## When arguable, score the lower rung

Write this into the ladder as a rule with the same standing as the criteria. The
asymmetry justifying it: an inflated rung produces no complaint and no
correction, while a deflated rung produces an evidenced objection that improves
the assessment. A ladder biased upward has no error-correcting loop at all.

The related anti-pattern worth naming: when a criterion turns out to be
frequently unsatisfiable, the tempting fix is to remove it or move it up a rung
so the distribution looks healthier. Removing the criterion that exposes the gap
does not close the gap
([deletion-is-not-repair](../../_laws.md#deletion-is-not-repair)); it converts a
visible weakness into an invisible one at exactly the site where visibility
existed.

## A subject may decline a gap; it may not decline a blind spot

Mature ladders acquire a pressure valve: the subject reviews a gap, decides it
does not apply ("this service is an internal batch job; the platform pages on
failure"), and wants that decision recorded so every re-assessment stops
re-litigating it. Supporting this is correct — an accepted trade-off is
genuinely different from an unread finding — under four rules that keep it from
becoming a rung-laundering device:

1. **A decline never moves the rung.** Choosing not to close a gap is a decision,
   not a capability. If declining raised the rung, cross-subject comparison would
   silently become a measure of how willing each subject is to file paperwork.
2. **It re-renders, it does not hide.** The item moves from "gaps" to
   "deliberately accepted, with reason", preserving the original text. It stays
   visible to anyone reading the assessment.
3. **It survives re-assessment.** Declines are stored separately from the
   computed result and applied as a read-time overlay, so a fresh assessment
   overwrites the verdict without erasing the decision.
4. **Evidence limitations are not declinable.** A subject may accept a real gap.
   It may never dismiss a caveat that says "we could not observe this". The first
   is a trade-off; the second is a blind spot, and letting an annotation silence
   it would let a trade-off launder missing evidence into a clean report. Keep
   the declinable set as an explicit allow-list, and keep every
   evidence-limitation caveat off it.

## Rung and posture are different questions

Keep a separate, stricter threshold for *what the organisation is willing to
permit* than for *what the subject has achieved*. A subject can honestly sit at a
high rung while its posture stays cautious, because the rung answers "what
exists" and the posture answers "how much autonomy do we grant". The structural
reason they diverge is worth stating: a rung derived from a blended or averaged
signal can be carried upward by partial strength on a few dimensions, whereas a
posture typically asserts *each* axis independently. Set the posture threshold
**stricter than the rung floor** deliberately — a confident posture claimed off a
half-strength axis overstates far more than a mixed headline understates — and
document the pairing, or the two constants will be "aligned" by the next person
who reads the mismatch as a bug. Reporting the
pair — high rung, cautious posture — is more useful than either alone, and it
removes the pressure to distort the rung in order to express a reservation about
trust. Where the two are fused, the ladder gets bent every time someone wants to
change the permission.

## When not to use this

Where nothing is enforceable — an exploratory domain, a one-person project, a
capability whose whole value is judgment rather than consistency — an
enforcement rung is an unreachable top that makes the ladder look broken. In
those cases stop the ladder at "practiced" and say so, rather than shipping a
rung nobody can ever occupy. An unreachable top rung is as damaging as a missing
floor: it compresses the entire real population into the rungs below it.
