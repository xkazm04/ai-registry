---
subject: earned-autonomy-tiers
domain: software-engineering
last_touched: 2026-11-03
dry_streak: 0
---

# earned-autonomy-tiers

First note. The subject was harvested on 2026-10-27 from one node tree, an agentic DevSecOps
control plane (afterlife 009c7893). A Curator dispatch ranked it on "single stack (node)".

## State

5 techniques and 4 applications:
- 2 `node`, from afterlife 009c7893;
- 2 `rust`, from personas 73888ab73a, applying demotion-attribution-integrity and
  effective-tier-is-the-lowest-bound.

asymmetric-promotion-and-demotion, recomputable-promotion-trial and shadow-next-rung have no
application of their own. The personas effective-tier application walks the first two, and
personas has no shadow rung.

## 2026-11-03 - deepen (eat-deepen-1103)

Landed in a0abbf3c3, with the catalog in 4f4ad0703. Lanes:
- **Field.** The registry map joined the subject to one personas context, `commands-curator`,
  matched by words only. Its `standing.rs` is a false match: it is a "standing lane", not a
  ladder. A grep of the committed tree found the real seam in the storage crate's scan-trust
  module, which keeps a per-slice ladder with append-only events, earns at 0.9 over 20 and
  loses a rung on a person's reversal. It was read from `origin/master`. 26 of 26 anchors held
  against a git-archive export.
- **Counter-evidence (web).** Sources: progressive-delivery promotion docs (analysis-driven
  canary steps, human confirmation as an opt-in hook); Tomašev, Franklin and Osindero 2026
  (arXiv 2602.11865), whose quotes were re-fetched verbatim before landing; the Claude Code
  auto-mode docs (a repo cannot widen its own allow rules); Feng, McDonald and Zhang 2025;
  the BMJ 1995 rule-of-three paper; the NIST interval handbook; resilience4j and Kubernetes
  HPA damping. Results:
  - "promotion never by itself" is bounded, not refuted;
  - the rule of three is one-sided;
  - one-event demotion holds for discrete events, while a noisy rate needs a minimum sample.
  Complacency literature (Parasuraman and Manzey) could not be fetched, so it was not
  evaluated.
- **Training-data only (blind).** One agent, no tools, neutral questions. It converged on:
  - freezing the class key at decision time;
  - not letting the agent supply its own risk attribute;
  - applying min(earned, ceiling) at run time;
  - unknown risk as the highest risk;
  - 18 of 20 having a lower bound of about 0.70;
  - a new class starting at L0;
  - promotion to the merge rung needing a person.

  The last of these is stricter than the web lane, and it was adopted because the two
  lanes converge on it.
- **`check-currency --volatile --subject`.** Four hits, none of them a platform-set figure:
  "one day" is prose, "94%" is an example, and two are years.

Landed:
- **demotion-attribution-integrity:** a fourth trap, "a class computed from the action is a
  claim too", with its fixture. It was applied in code in personas (red control), and the fix
  was pushed as 3cb920506a.
- **asymmetric-promotion-and-demotion:** "it does not happen by itself" now has one bounded
  exception, and the golden path carries the same sentence. A simulation over three personas
  slices came out better.
- **recomputable-promotion-trial:** "one-sided" added, plus the 18 of 20 against 0.70 example.
- **Two rust applications.**

Declined: none.

Banked:
- **Contract proposal, not landed.** The proposal targets `docs/skill-clauses/finding-contract.md`,
  the scan-finding/1 contract used by lens-scan, scan-sweep and dowser. That contract prescribes
  four things the subject now refuses:
  - an L2 start for technical slices;
  - the top ceiling for any lens outside secret, authz and money, including a lens nobody
    declared;
  - automatic promotion into L3 auto-merge;
  - a raw-rate bar.

  Changing it is a skill-clause edit with version bumps across three skills, plus a copied
  file in dowser, so it belongs to a skills run. Return: the next lens-scan or scan-sweep
  version bump, or the first L3 slice in any project's trust report.
- personas reports its slice level without re-applying the ceiling, so a reclassified lens
  keeps a level above its new ceiling. The L1 gate is unaffected. The fix is in the contract
  (ceiling at read time); return with the proposal above.
- The app crate's door-level tests (`scan_contract`) could not run on this machine, because
  the test binary would not start. They were not evaluated.

## Impact

The build-registry-map dry run showed no stale verdicts for this subject: no judged pair
exists, so nothing is on any project's `/conform --stale` queue. Pairs: personas 1
(commands-curator, word-matched, `state: unknown`). All 12 maps were regenerated and committed
locally on each project's active branch, unpushed.
