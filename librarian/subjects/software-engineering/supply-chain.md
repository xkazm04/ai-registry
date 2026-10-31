---
subject: supply-chain
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# supply-chain

First touch: [[2026-08-26-next-16-3-3-fleet]], operator dispatch about a web
framework's patch release. `update-automation-review` gained
`## When the dependency is the framework`; the subject gained its first
`next`-stack application (`next--update-automation-review`,
`verified_against: next@16.3.3`) and the bundle gained the `next` stack plus a
90-day currency window, half the react window, because a citation against this
stack is routinely a claim about a default a *patch* release can retire.

## What the amendment adds, and what it contradicts

The technique tiers **patch bumps as the lightest tier and an auto-merge
candidate**. The amendment is a counter-example to that tier, not a refinement
of it: a patch release of a framework retired a capability one fleet member had
explicitly configured. The tier is priced on the size of the diff; the
amendment argues the reach of the package belongs in the price too.

The structural claim underneath, and the reusable half: **declaratively
requested capabilities have no test surface.** A suite asserts behavior it
calls. A capability requested in config and delivered by the framework is
asserted by no call site, so its removal is green. This is a general statement
about configuration, not about any framework, and it is the part most likely to
be wanted by a neighbouring subject.

## Boundary, stated because it was contested during the run

Four subjects were read for their boundary statements and all four scope *away*
from adopting a framework version across a fleet:

- this subject owns **trust crossings** guarded by mechanical policy;
- `build-and-release/build-economics` owns the **cost of iterating**;
- `operations/perf-instrumentation` owns **the product measuring itself in
  production**;
- `standards-and-gates/multi-project` owns the **portfolio management layer**.

The amendment sits inside this subject because the occasion was an advisory and
the reader arrives via the update-review path. That placement is defensible for
one sighting and should be revisited at two - see the lead below.

## Banked (single-sighted)

- **`framework-stewardship` as its own subject.** Four candidates from one run
  (framework-vs-library reach, label-vs-effect, fleet version coherence, the
  test-surface gap) landed in or beside this subject without any of them being
  about trust. Return condition: a second framework in a different ecosystem
  producing the same shape. At two sightings the amendment should be promoted
  and split out, with this subject keeping only the trust half.
- **The declarative-capability inventory wants a tool.** Documented in the
  amendment as a habit; reconstructed by hand during this run. Return
  condition: a connected project adopting it, or `scripts/fleet-deps.mjs`
  growing a lane that reads config surfaces rather than manifests.
- **The exposure window is named as the metric and has never been measured
  here.** The fleet learned of a critical advisory because an unrelated question
  was asked. Return condition: a watch lane that produces the number.

## 2026-08-31 - `/intake` herdr (Rust/backend lens), run `intake-herdr-rust`

6 -> 7 techniques. New technique `vendored-fork-ledger`.

The finding is a hole in the subject's own model rather than a correction to
anything it says. Its thesis is that every crossing is guarded by a standing
mechanical policy, and its dependency model has two states: consume (policy
gates read the resolved lockfile) and update (automation proposes, a human
reviews). **Forking is a third state, and it does not fail either guard - it
ends them.** The resolved graph stops naming an upstream version, advisory
matching has nothing to match, update automation has no update to propose, and
every mechanical test reclassifies the code as first-party. Nothing goes red.

The technique prices the fork: a recorded upstream commit, per-patch entries
carrying a removal condition stated as a falsifiable event (and the upstream
conversation's *absence*, written down), two-way inventory, and clean
reverse-application of every patch against the vendored tree - which is what
proves the index still describes the tree rather than one somebody hand-edited.

**Unapplied.** No managed project in the fleet carries a patched or vendored
dependency; none has a manifest-level source override. Return when one forks.

## 2026-08-31 — `toolchain-floor-drift` (second intake touch today)

Touched by [[2026-08-31-tigerbeetle-blog]] — gained `toolchain-floor-drift` and
`rust--toolchain-floor-drift`.

The **mirror of `update-automation-review`**: that technique owns the update you
make, this one owns the floor that rises when you make none. A transitive
dependency raises its declared minimum in a *patch* release — normal maintenance
in several ecosystems — so the effective floor is the max over the whole graph
and moves with no manifest diff to review.

Placement was argued rather than assumed. The golden path frames this subject as
*trust* crossings (secrets out, third-party code in, permissions, archives), and
this finding is about *compatibility*, not trust. It lands here anyway because
the golden path names dependency resolution as one of its four crossings and
because the two neighbouring techniques already own the halves it sits between:
`update-automation-review` (the bump you make) and `dependency-policy-gates`
(the standing acceptance policy a floor clause belongs in).

Carries a rare thing for this ledger: **a real measured protocol** — top 100
packages by download, most recent major releases, compatibility by binary search
with an actual build across compiler releases 1.0–1.94, dated, with the author's
own caveats preserved. Cited as an order of magnitude (~2-year viability
window), never as a constant.

**Applied, `better`, `ab-paired`.** A managed tree declares a compiler floor of
1.80.0 against a resolved graph whose effective floor is 1.88.0 — 60 of 518
packages above the claim. The structural fact: the same repository declares a
*runtime* floor and runs a job at it, while every job touching the compiler runs
at stable. Two identical claims, asymmetric enforcement, nobody's decision.

## Open leads

- **The drift rate is unmeasured.** This run measured a gap on one date, not how
  fast it opened. Return when historical resolutions can be replayed.

## 2026-08-31 — `/intake` (`semantica`)

8 -> 10 techniques. Landed `verification-scope` and `lockfile-freshness-oracle`,
both from a repository whose `.github/requirements/README.md` is the densest
document in its tree and states **mechanisms** where most sources state rules.

`verification-scope` is deliberately distinguished from `dependency-policy-gates` in
its opening, because the two look like the same advice and are found differently.
That technique's "inventory the resolution mechanisms" finds *missing* ecosystems by
listing. This one cannot be found by listing: nothing is missing from the list, the
install step is present, the verification flag is on it, the lockfile is complete —
and a source build still fetches its own build backend outside the hash check,
because the flag's scope is a **stage** and the command runs several. The second
family (a tool subcommand that "downloads" a model, a driver, a plugin) falls out of
the same question.

`lockfile-freshness-oracle` owns the check that guards the artifact every other guard
in this subject reads. Its core claim is that the naive construction is worse than
absent — it fires whenever a stranger publishes a release, so it gets switched off
along with the real condition — and the correction is one step away: re-resolve with
the committed file as a *constraint*.

Phase 7.5 ran both against `personas`:

- `verification-scope` → `better`. The dependency-policy engine and the advisory
  scanner are installed with a lockfile flag and **no version pin**, 3 sites, and a
  fourth project references the pattern. The flag pins the tool's dependencies and
  leaves the tool floating. `dependency-policy-gates` already names exactly this
  hazard from the other direction ("engine floats, policy frozen, gate silently
  dead") — two techniques converging on one unpinned line. Ship 0 (confirmation).
- `lockfile-freshness-oracle` → `not-better`, **and it corrected the technique**.
  The ecosystem's strict-install command already *is* the constrained-resolution
  oracle: it refuses when the lockfile cannot satisfy the manifest and never
  resolves, so upstream releases cannot fire it. 62 manifest dependencies, 0 drift,
  and any nonzero would have failed the install rather than needing a gate. The
  technique now opens by telling the reader to check that first, and names the case
  where it does not hold — a lockfile *compiled* from the manifest by a separate
  tool, which is the source's own situation and the reason it needed a hand-built
  check. Without the A/B this technique would have prescribed duplicated logic to
  every ecosystem whose installer already enforces it.

## 2026-09-02 - intake [[2026-09-02-sentry-self-hosted]]

Class: EXTENDS. `update-automation-review` gained "Release age is a tier input" - a minimum
release age (security exempt), the operated-major ceiling for a distribution's stateful
components, and event-expiry as an acceptable exception form (pointing at
`dependency-policy-gates`). `process--update-automation-review`: experiment over 67 bot
proposals in four fleet repos; 8 superseded, 4 within 3 days, **1 real** after calibration
removed grouped-proposal rebuilds. Verdict unmeasurable for the supply-chain half, instrument
named. A fleet tree (politicas) already carried the event-expiring ignore before this source
was read. 10 -> 10 techniques, 5 -> 6 applications.


## 2026-09-02 — intake, [[2026-09-02-monai]] (second run on this subject today; a sibling held the subject at the time — technique file written, golden-path line edited under the content lock)

**Landed** `unsafe-deserialization-off-by-default` beside `archive-extraction-safety`:
the container rule owns paths and sizes; this one owns what a member instantiates once
opened. Rule in three parts — restricted loader is the default, permissive is a per-call
opt-in named for the hazard (with an env override read once and logged, carrying its own
removal version), and the storage format migrates to data-only so the opt-in retires.
Prove the guard with two archives built from the project's own member set (producer-shaped
must load identically restricted; hostile-shaped must be refused restricted and accepted
permissive). Source: a framework's 1.5.1–1.6.0 release notes, which flipped three load
paths after four advisories (weights-only checkpoint loading, an array loader gaining a
default-off pickle flag, serialization moved from native pickling to structured text with
an env escape hatch). Corroboration: training-data convergence — the same default flip in
three ecosystems between 2019 and 2025. Zero fetches. Prior art before this run: none
(uncapped grep for deserialization/pickle across all bundles: 0 owning files).

**Applied and shipped** on a game project's motion-research scripts at mode `code`,
verdict `better`, proof `ab-paired`: four archive readers, three permissive, one (the
newest) restricted; the tree's only producer writes seven numeric arrays and a scalar.
Harness: producer-shaped archive loads identically under both arms; hostile-shaped
archive with one object member is executed under A and refused under B. Three sites
flipped in one pathspec commit on the project's active branch, not pushed.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+2 techniques.

- **`build-time-dependency-tier`** — the graph holds two populations with different
  blast radii, split by execution phase. One policy over the resolved graph prices
  a build-time dependency by its *runtime* exposure (often nil) and misses that its
  actual exposure is a developer's workstation with a live credential agent plus
  the runner. The build-time tier gets its own inventory, review tier and reach
  question, and is usually sparse enough to enumerate by hand. Escalate when a
  package *newly acquires* build-time execution. The subject had this as a review
  *signal* (`update-automation-review.md:53-54`) and as a tiering input, never as a
  structural claim. Inverts under hermetic, network-isolated, credential-free
  builds — and the isolation must cover the developer's build, not only the
  runner's.
- **`review-attestation-ledger`** (`stage: fleet`) — advisory matching answers *is
  this known bad*, which is silent about everything nobody has looked at. The
  complementary axis is a committed per-version record of who reviewed what against
  which criteria, with the burden shared by importing peers' records under a
  declared trust relationship. Pooling is load-bearing because cost tracks churn.
  Both inversion halves carried: below readable-graph size with no external
  obligation it is bookkeeping for a review nobody performs; and **an unread import
  is worse than no ledger, because it renders as coverage.** Also: unmaintained is
  not vulnerable, and no advisory database reports abandonment.

**Convergence:** the source's dependency policy independently enforces exactly the
four dimensions `dependency-policy-gates` names, in the same order, with the same
deny-by-default posture, and independently reaches allowlist-not-denylist for
licences. Same clock-vs-diff scanning partition too. **Catches:** vendoring
(`vendored-fork-ledger` — "forking a dependency does not break its guards, it ends
them" — the source has nothing on vendoring at all) and lockfile trust, where the
corpus additionally owns the characteristic failure of the freshness check.

## 2026-09-04 - /intake `Everywhere` (run `everywhere-build`)

Two techniques. `vendored-fork-ledger` owned the **record** a fork owes and
nothing owned the **mechanism** it owes it for.

- **`patching-mechanism-ladder`** - four rungs chosen by the dependency's shape,
  not by taste: fork-and-carry; mirror shadowing (keep the upstream tree
  pristine, build a parallel project that includes it file by file and
  substitutes only what changed, masquerading as the ordinary package reference
  so the rest of the graph resolves); runtime hooking; build-time rewriting. The
  rejections for mirror shadowing are all structural - a private feed
  contradicts an open-source posture, publishing customized builds to the public
  feed is pollution, mounting the whole upstream source degrades CI. Cites
  `vendored-fork-ledger` three times as the record and names the trap: the rungs
  that leave the upstream tree pristine are the ones where the record gets
  skipped, because it feels like no fork happened.
- **`signature-preserving-patching`** - **the mechanism is chosen against the
  distribution channel, not only against the code.** Runtime injection trips
  heuristic malware detection and cannot inherit the application's signature;
  build-time rewriting produces ordinary artifacts that do. The worker sharpened
  the argument past the source: start-up modification does not *invalidate* the
  signature, it produces a **valid** signature over modules that no longer
  determine behaviour - the verdict arrives intact at the loader having stopped
  meaning what the verifier reads it to mean, and nothing errors. Audit
  corollary: reviewing the shipped artifact answers "what was modified" for a
  build-time rewrite and cannot for a start-up one, where the only account is a
  description of the change.

Kept as two rather than one: the first filters by the dependency's shape, the
second is a veto applied afterwards by the destination, and it discriminates
between exactly the two rungs the shape questions cannot separate. Boundaries
with `signed-artifacts` and `packaging/signing-and-trust` cited across with the
discriminator named - this owns the choice upstream of both, "the choice of
patching mechanism decides whether there is anything left for either chain to
sign."

Note for a later sweep: `antivirus` / heuristic-detection as a *design force*
returned zero across the corpus before this landing. It is now modelled here
only; if a second source raises it, check whether it wants to be a law.

Unapplied: no authorized fleet project patches a dependency by either
mechanism. Return condition in `applied.md`.

### 2026-09-16 - `/harvest backlog` wave 1, one technique

`reading-is-not-running`: three source notes ([[2026-09-15-ai-engineering-coach]], [[2026-08-31-knip]], [[2026-09-07-rodin-worldgen]]) banked the same shape untriaged - a read verb that silently executes content somebody else authored. Homed here rather than in sidecar-provisioning, beside `unsafe-deserialization-off-by-default`, because the discriminator is who authored the executing bytes: that technique owns formats encoding object construction, where a restricted loader exists; this owns content that *is* a program, where it does not. game-production's engine-integration-safety holds the opposite side (our automation as guest). Measured by replay on personas' read-only scan lane (2/3 planted markers fired -> 0/3 with a digest over the local import closure). The falsifying arm is the reusable part: hashing only the named config file still let an imported module run.

## Architecture review - 2026-10-31

First architecture review of this subject, against `e1fcb7785`. The trust-crossing thesis holds across all 18 techniques. The findings are completeness and accuracy, not structure: the golden path's prose and closing list both under-name the techniques its frontmatter lists; one technique overstates why deserialization defaults flipped; one technique miscounts its own bullets twice; one application misstates an advisory range and another miscomputes a release interval. Applications rest on private evidence that was not reopened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/supply-chain",
  "date": "2026-10-31",
  "baseline": "e1fcb7785",
  "digest": "sha256-b2:f5666db1094acd9f",
  "disposition": "clarify",
  "coverage": "All 26 current documents (golden path, 18 techniques, 7 applications) read in full. Primary sources opened for the deserialization-default history, release-age floors and bot ignore semantics, the AVIF advisory and compiler release dates. Not evaluated: any connected-project tree, pipeline log or harness behind the seven applications; the toolchain survey; the license-reach blind A/B. No verification date refreshed.",
  "counterexamples": [
    "A tensor framework flipped its loader default to restricted as a pre-announced hardening with a release-long warning and no CVE, so 'defaults flip only after an advisory' is false.",
    "Eight compiler minors at a six-week cadence is under a year, so a graph can overtake a declared floor at half the survey's typical window.",
    "On a bot where ignore rules also apply to security updates, an operated-major ceiling written as an ignore silences the security proposals it was never meant to mute.",
    "In a hermetic, credential-free build that also covers developer builds, the build-time tier collapses into the runtime tier and the extra inventory is ceremony.",
    "Process-private state written and reloaded within one lifetime gains nothing from the restricted loader."
  ],
  "sources": [
    {
      "url": "https://dev-discuss.pytorch.org/t/bc-breaking-change-torch-load-is-being-flipped-to-use-weights-only-true-by-default-in-the-nightlies-after-137602/2573",
      "result": "Read. Motivation: pickle 'can import and execute arbitrary functions'; warned 'since version 2.4'; cites no CVE or advisory. Refutes 'each after an advisory'."
    },
    {
      "url": "https://ubuntu.com/security/CVE-2019-6446",
      "result": "Via search results with SUSE advisory: NumPy before 1.16.3 used pickle unsafely; fix 'Set allow_pickle to false by default'. Supports one advisory-driven flip."
    },
    {
      "url": "https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference",
      "result": "Read. cooldown: 'only available for version updates, not security updates'; default 'not considered for a version update until 3 days after its release'. Supports release-age floors with security exempt."
    },
    {
      "url": "https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/controlling-dependencies-updated",
      "result": "Read. Ignore applies 'when it opens pull requests for version updates and security updates'. Supports 'an ignore rule also suppresses the security proposals'."
    },
    {
      "url": "https://docs.renovatebot.com/configuration-options/#minimumreleaseage",
      "result": "Read. minimumReleaseAge 'requires Renovate to wait for a specified amount of time before suggesting a dependency update'; scopes include vulnerabilityAlert, so the security exemption is explicit configuration."
    },
    {
      "url": "https://github.com/advisories/GHSA-2xp9-vwfh-vxw4",
      "result": "Read. Affected '>= 10.0.0, < 15.5.24' and '>= 16.0.0, < 16.3.3'; CVSS 4.0 9.5; 'Until a fix has propagated, optimization of AVIF files is disabled.'"
    },
    {
      "url": "https://www.cycognito.com/blog/emerging-threat-cve-2026-75604-next-js-remote-code-execution-via-windows-path-traversal/",
      "result": "Secondary only (search results): Windows path traversal in the cache path, fixed in 15.5.24/16.3.3. Official record not reached; ranges disagree across secondaries."
    },
    {
      "url": "https://raw.githubusercontent.com/rust-lang/rust/master/RELEASES.md",
      "result": "Read. 1.80.0 (2024-07-25), 1.88.0 (2025-06-26): eight minors is eleven months, not two years."
    },
    {
      "source": "Toolchain viability survey cited by toolchain-floor-drift",
      "result": "Searched, not reached. The two-year figure stays unverified."
    }
  ],
  "documents": {
    "supply-chain.md": {
      "disposition": "clarify",
      "reason": "Thesis and boundaries hold. Two gaps: the closing technique list omits verification-scope, lockfile-freshness-oracle and unsafe-deserialization-off-by-default although the frontmatter lists all 18; and the body never mentions unsafe-deserialization-off-by-default, reading-is-not-running, license-reach-follows-integration-form or one-version-decays-to-a-floor, so a reader of the prose alone misses four techniques. Add the missing list entries and one sentence each in the sections they extend (archives, dependency policy, updates). The one-version list item also uses ' - ' where every other entry uses an em dash."
    },
    "techniques/secret-scanning-architecture.md": {
      "disposition": "keep",
      "reason": "Staged-diff placement, three-outcome wrapper, announced skip plus binding backstop, fingerprint allowlist with stale-entry failure and rotate-first response are internally consistent and match the golden path."
    },
    "techniques/dependency-policy-gates.md": {
      "disposition": "keep",
      "reason": "Four deny-by-default clauses, lockfile as target, pipeline steps as an ecosystem, expiring exceptions and the two liveness hazards hold. Cosmetic only: the body cites failure-not-empty-success but the laws field omits it."
    },
    "techniques/license-reach-follows-integration-form.md": {
      "disposition": "keep",
      "reason": "Form ladder (data, separate program, dynamic link, combined work), pair-keyed policy and the form-change-without-license-change event are sound and explicitly scoped as engineering policy, not legal opinion. Frontmatter claims applied: blind-ab / better with no application document in this subject; the evidence is not re-checkable here."
    },
    "techniques/verification-scope.md": {
      "disposition": "keep",
      "reason": "Stage-not-command scope of a hash flag, isolated source builds fetching their backend, and downloader subcommands are product-neutral mechanisms; decision rules follow from the text."
    },
    "techniques/lockfile-freshness-oracle.md": {
      "disposition": "keep",
      "reason": "Constrained re-resolution, strict-install-first (the correction from the 2026-08-31 A/B), semantic comparison and one-lockfile-per-matrix-cell are consistent."
    },
    "techniques/scheduled-deep-analysis.md": {
      "disposition": "keep",
      "reason": "Commit- versus clock-triggered partition, recency monitoring and owner routing hold."
    },
    "techniques/permission-manifest-scoping.md": {
      "disposition": "keep",
      "reason": "Deny-by-default manifests, remote-content boundary, one-authority allowlists and declared-versus-used verification with a nonzero-population assertion hold."
    },
    "techniques/archive-extraction-safety.md": {
      "disposition": "keep",
      "reason": "Canonicalized containment, link-entry policy, streaming budgets, verify-before-extract, quarantine-then-promote and the sentinel are standard and consistent."
    },
    "techniques/unsafe-deserialization-off-by-default.md": {
      "disposition": "clarify",
      "reason": "Rule holds. One factual over-reach: three ecosystems flipped the default 'each after an advisory'. The array library's flip did follow a CVE (CVE-2019-6446: default changed to allow_pickle=False), but the tensor framework's 2.6 flip cites no advisory: its announcement gives pickle's ability to 'import and execute arbitrary functions' as the reason, links a checkpoint-poisoning incident, and says the change was warned 'since version 2.4'. Reword to what the sources show."
    },
    "techniques/reading-is-not-running.md": {
      "disposition": "keep",
      "reason": "Parse-before-evaluate, digest over the local import closure and loud refusal are supported by the recorded three-arm replay; boundaries with deserialization and extension trust are stated."
    },
    "techniques/update-automation-review.md": {
      "disposition": "clarify",
      "reason": "Doctrine holds and the two unstable claims check out: release-age floors exist on the major update bots (Renovate minimumReleaseAge, scoped also to vulnerabilityAlert so the security exemption must be set explicitly; Dependabot cooldown, 'only available for version updates, not security updates'), and on at least one bot an ignore also mutes security proposals (GitHub: ignore applies 'when it opens pull requests for version updates and security updates'). Two internal count errors: 'Two habits close it' is followed by three bullets (the third detached by a blank line), and 'Two failure modes show up immediately in that number' is followed by three, the third (version-range drift) not being visible in that number at all."
    },
    "techniques/toolchain-floor-drift.md": {
      "disposition": "reverify",
      "reason": "Mechanism and the build-at-the-floor, resolve-as-a-consumer lane are sound. The roughly-two-year viability figure is the technique's one number and its source (a survey of the top hundred packages, binary search over compiler releases) was not reached this run; the text already hedges it as an order of magnitude."
    },
    "techniques/vendored-fork-ledger.md": {
      "disposition": "keep",
      "reason": "Ledger fields, falsifiable removal condition, two-way inventory plus reverse-apply, the re-vendoring walk and exact-pinning the overridden version are consistent."
    },
    "techniques/patching-mechanism-ladder.md": {
      "disposition": "keep",
      "reason": "Four rungs selected by shape, rung zero, posture-based rejection of the mirror's alternatives and what each rung leaves visible to the guards are coherent."
    },
    "techniques/signature-preserving-patching.md": {
      "disposition": "keep",
      "reason": "Channel as veto, valid-signature-over-stale-behaviour, audit corollary and the no-channel exceptions are coherent and correctly delegated to packaging and signed-artifacts."
    },
    "techniques/build-time-dependency-tier.md": {
      "disposition": "keep",
      "reason": "Execution-phase split, host-exposure pricing, hand inventory and hermetic-build inversion hold."
    },
    "techniques/review-attestation-ledger.md": {
      "disposition": "keep",
      "reason": "Two-axis framing, delta certification, pooling as load-bearing, unread-import-renders-as-coverage and the both-conditions-fail scope hold."
    },
    "techniques/one-version-decays-to-a-floor.md": {
      "disposition": "clarify",
      "reason": "Event-versus-state, floor over equality, resolution record over declaration and the cross-checkout query are sound. The measured shape says six checkouts were driven and twenty-two days later 'eight members carried that framework and two were below that floor'; it does not say whether the two were among the six swept. If they were not, the paragraph's reading (a sweep is not a standing state) does not follow from them. Not applied: the private fleet data was not reopened."
    },
    "applications/next--update-automation-review.md": {
      "disposition": "clarify",
      "reason": "Advisory facts re-checked: GHSA-2xp9-vwfh-vxw4 is 'Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used', CVSS 4.0 9.5, mitigation 'Until a fix has propagated, optimization of AVIF files is disabled.', which supports the subtraction finding. Its affected range is '>= 10.0.0, < 15.5.24' and '>= 16.0.0, < 16.3.3'; the application writes the second as '<16.3.3'. CVE-2026-75604 reached only through secondary sources (Windows path traversal, fixed in 15.5.24/16.3.3). Fleet lockfiles and configs not reopened; verified_on unchanged."
    },
    "applications/node--secret-scanning-architecture.md": {
      "disposition": "reverify",
      "reason": "Measured counts (3,186 skip messages, 40.0% path exemption, 443 of 963 test files) are a dated private measurement not re-run."
    },
    "applications/process--dependency-policy-gates.md": {
      "disposition": "reverify",
      "reason": "350-run zero-verdict history and the engine-float outage are dated private pipeline evidence not reopened."
    },
    "applications/process--unsafe-deserialization-off-by-default.md": {
      "disposition": "reverify",
      "reason": "Two-arm harness is internally consistent; the private tree and harness were not re-run."
    },
    "applications/process--update-automation-review.md": {
      "disposition": "reverify",
      "reason": "67-proposal count and calibration are private. Its claim that on this bot an ignore also silences security proposals is now corroborated by the bot vendor's documentation."
    },
    "applications/rust--archive-extraction-safety.md": {
      "disposition": "reverify",
      "reason": "Guard, sentinel and the three named gaps are a dated reading of a private source file not reopened."
    },
    "applications/rust--toolchain-floor-drift.md": {
      "disposition": "clarify",
      "reason": "Arithmetic error: 'Eight minor versions is roughly two years of releases, which is the same order as the window the technique cites'. At the six-week cadence eight minors is 48 weeks; the release notes date 1.80.0 to 2024-07-25 and 1.88.0 to 2025-06-26, eleven months. The graph overtook the claim in under a year, half the cited window. The measurement itself (60 of 518, effective 1.88) was not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the five clarify items the record above named that a primary source or verified arithmetic supports, against `dcca8ad22`. one-version-decays-to-a-floor stays clarify. With every applied item now keep, the overall disposition is `reverify`: toolchain-floor-drift's survey and the private application evidence remain unconfirmed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/supply-chain",
  "date": "2026-10-31",
  "baseline": "dcca8ad22",
  "digest": "sha256-b2:e5bfd6c5d6581fc1",
  "disposition": "reverify",
  "coverage": "All 26 documents decided. The five clarify items with a primary source or verified arithmetic were applied and the edited passages re-read; one-version-decays-to-a-floor stays clarify (needs private fleet data). Other documents byte-unchanged and keep their dispositions. No private tree or runtime reopened; no verification date refreshed.",
  "counterexamples": [
    "A tensor framework flipped its loader default to restricted as a pre-announced hardening with a release-long warning and no CVE, so 'defaults flip only after an advisory' is false.",
    "Eight compiler minors at a six-week cadence is under a year, so a graph can overtake a declared floor at half the survey's typical window.",
    "On a bot where ignore rules also apply to security updates, an operated-major ceiling written as an ignore silences the security proposals it was never meant to mute.",
    "In a hermetic, credential-free build that also covers developer builds, the build-time tier collapses into the runtime tier and the extra inventory is ceremony.",
    "Process-private state written and reloaded within one lifetime gains nothing from the restricted loader."
  ],
  "sources": [
    {
      "url": "https://dev-discuss.pytorch.org/t/bc-breaking-change-torch-load-is-being-flipped-to-use-weights-only-true-by-default-in-the-nightlies-after-137602/2573",
      "result": "Read. Motivation: pickle 'can import and execute arbitrary functions'; warned 'since version 2.4'; cites no CVE or advisory. Refutes 'each after an advisory'."
    },
    {
      "url": "https://ubuntu.com/security/CVE-2019-6446",
      "result": "Via search results with SUSE advisory: NumPy before 1.16.3 used pickle unsafely; fix 'Set allow_pickle to false by default'. Supports one advisory-driven flip."
    },
    {
      "url": "https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference",
      "result": "Read. cooldown: 'only available for version updates, not security updates'; default 'not considered for a version update until 3 days after its release'. Supports release-age floors with security exempt."
    },
    {
      "url": "https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/controlling-dependencies-updated",
      "result": "Read. Ignore applies 'when it opens pull requests for version updates and security updates'. Supports 'an ignore rule also suppresses the security proposals'."
    },
    {
      "url": "https://docs.renovatebot.com/configuration-options/#minimumreleaseage",
      "result": "Read. minimumReleaseAge 'requires Renovate to wait for a specified amount of time before suggesting a dependency update'; scopes include vulnerabilityAlert, so the security exemption is explicit configuration."
    },
    {
      "url": "https://github.com/advisories/GHSA-2xp9-vwfh-vxw4",
      "result": "Read. Affected '>= 10.0.0, < 15.5.24' and '>= 16.0.0, < 16.3.3'; CVSS 4.0 9.5; 'Until a fix has propagated, optimization of AVIF files is disabled.'"
    },
    {
      "url": "https://www.cycognito.com/blog/emerging-threat-cve-2026-75604-next-js-remote-code-execution-via-windows-path-traversal/",
      "result": "Secondary only (search results): Windows path traversal in the cache path, fixed in 15.5.24/16.3.3. Official record not reached; ranges disagree across secondaries."
    },
    {
      "url": "https://raw.githubusercontent.com/rust-lang/rust/master/RELEASES.md",
      "result": "Read. 1.80.0 (2024-07-25), 1.88.0 (2025-06-26): eight minors is eleven months, not two years."
    },
    {
      "source": "Toolchain viability survey cited by toolchain-floor-drift",
      "result": "Searched, not reached. The two-year figure stays unverified."
    }
  ],
  "documents": {
    "supply-chain.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the three missing technique-list entries (verification-scope, lockfile-freshness-oracle, unsafe-deserialization-off-by-default), one sentence each linking license-reach-follows-integration-form (dependency policy), one-version-decays-to-a-floor (updates), unsafe-deserialization-off-by-default and reading-is-not-running (archives), and normalized the one-version list separator."
    },
    "techniques/secret-scanning-architecture.md": {
      "disposition": "keep",
      "reason": "Staged-diff placement, three-outcome wrapper, announced skip plus binding backstop, fingerprint allowlist with stale-entry failure and rotate-first response are internally consistent and match the golden path."
    },
    "techniques/dependency-policy-gates.md": {
      "disposition": "keep",
      "reason": "Four deny-by-default clauses, lockfile as target, pipeline steps as an ecosystem, expiring exceptions and the two liveness hazards hold. Cosmetic only: the body cites failure-not-empty-success but the laws field omits it."
    },
    "techniques/license-reach-follows-integration-form.md": {
      "disposition": "keep",
      "reason": "Form ladder (data, separate program, dynamic link, combined work), pair-keyed policy and the form-change-without-license-change event are sound and explicitly scoped as engineering policy, not legal opinion. Frontmatter claims applied: blind-ab / better with no application document in this subject; the evidence is not re-checkable here."
    },
    "techniques/verification-scope.md": {
      "disposition": "keep",
      "reason": "Stage-not-command scope of a hash flag, isolated source builds fetching their backend, and downloader subcommands are product-neutral mechanisms; decision rules follow from the text."
    },
    "techniques/lockfile-freshness-oracle.md": {
      "disposition": "keep",
      "reason": "Constrained re-resolution, strict-install-first (the correction from the 2026-08-31 A/B), semantic comparison and one-lockfile-per-matrix-cell are consistent."
    },
    "techniques/scheduled-deep-analysis.md": {
      "disposition": "keep",
      "reason": "Commit- versus clock-triggered partition, recency monitoring and owner routing hold."
    },
    "techniques/permission-manifest-scoping.md": {
      "disposition": "keep",
      "reason": "Deny-by-default manifests, remote-content boundary, one-authority allowlists and declared-versus-used verification with a nonzero-population assertion hold."
    },
    "techniques/archive-extraction-safety.md": {
      "disposition": "keep",
      "reason": "Canonicalized containment, link-entry policy, streaming budgets, verify-before-extract, quarantine-then-promote and the sentinel are standard and consistent."
    },
    "techniques/unsafe-deserialization-off-by-default.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'each after an advisory' now reads that one flipped after a published advisory and another as an announced hardening behind a release-long warning, matching CVE-2019-6446 and the tensor framework's 2.6 announcement."
    },
    "techniques/reading-is-not-running.md": {
      "disposition": "keep",
      "reason": "Parse-before-evaluate, digest over the local import closure and loud refusal are supported by the recorded three-arm replay; boundaries with deserialization and extension trust are stated."
    },
    "techniques/update-automation-review.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Two habits' -> 'Three habits' with the detached bullet rejoined; 'Two failure modes show up immediately in that number' -> two show up in it and a third stays invisible to it."
    },
    "techniques/toolchain-floor-drift.md": {
      "disposition": "reverify",
      "reason": "Mechanism and the build-at-the-floor, resolve-as-a-consumer lane are sound. The roughly-two-year viability figure is the technique's one number and its source (a survey of the top hundred packages, binary search over compiler releases) was not reached this run; the text already hedges it as an order of magnitude."
    },
    "techniques/vendored-fork-ledger.md": {
      "disposition": "keep",
      "reason": "Ledger fields, falsifiable removal condition, two-way inventory plus reverse-apply, the re-vendoring walk and exact-pinning the overridden version are consistent."
    },
    "techniques/patching-mechanism-ladder.md": {
      "disposition": "keep",
      "reason": "Four rungs selected by shape, rung zero, posture-based rejection of the mirror's alternatives and what each rung leaves visible to the guards are coherent."
    },
    "techniques/signature-preserving-patching.md": {
      "disposition": "keep",
      "reason": "Channel as veto, valid-signature-over-stale-behaviour, audit corollary and the no-channel exceptions are coherent and correctly delegated to packaging and signed-artifacts."
    },
    "techniques/build-time-dependency-tier.md": {
      "disposition": "keep",
      "reason": "Execution-phase split, host-exposure pricing, hand inventory and hermetic-build inversion hold."
    },
    "techniques/review-attestation-ledger.md": {
      "disposition": "keep",
      "reason": "Two-axis framing, delta certification, pooling as load-bearing, unread-import-renders-as-coverage and the both-conditions-fail scope hold."
    },
    "techniques/one-version-decays-to-a-floor.md": {
      "disposition": "clarify",
      "reason": "Event-versus-state, floor over equality, resolution record over declaration and the cross-checkout query are sound. The measured shape says six checkouts were driven and twenty-two days later 'eight members carried that framework and two were below that floor'; it does not say whether the two were among the six swept. If they were not, the paragraph's reading (a sweep is not a standing state) does not follow from them. Not applied: the private fleet data was not reopened."
    },
    "applications/next--update-automation-review.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: second AVIF affected range now '>=16.0.0 <16.3.3' as the advisory states. verified_on unchanged (fleet lockfiles not reopened)."
    },
    "applications/node--secret-scanning-architecture.md": {
      "disposition": "reverify",
      "reason": "Measured counts (3,186 skip messages, 40.0% path exemption, 443 of 963 test files) are a dated private measurement not re-run."
    },
    "applications/process--dependency-policy-gates.md": {
      "disposition": "reverify",
      "reason": "350-run zero-verdict history and the engine-float outage are dated private pipeline evidence not reopened."
    },
    "applications/process--unsafe-deserialization-off-by-default.md": {
      "disposition": "reverify",
      "reason": "Two-arm harness is internally consistent; the private tree and harness were not re-run."
    },
    "applications/process--update-automation-review.md": {
      "disposition": "reverify",
      "reason": "67-proposal count and calibration are private. Its claim that on this bot an ignore also silences security proposals is now corroborated by the bot vendor's documentation."
    },
    "applications/rust--archive-extraction-safety.md": {
      "disposition": "reverify",
      "reason": "Guard, sentinel and the three named gaps are a dated reading of a private source file not reopened."
    },
    "applications/rust--toolchain-floor-drift.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'roughly two years of releases' corrected to under a year (1.80.0 2024-07-25, 1.88.0 2025-06-26), now read as half the technique's cited window rather than the same order. verified_on unchanged."
    }
  }
}
```
