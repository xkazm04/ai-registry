---
source: web (vendor blog + its own open-source repository)
url: https://www.langchain.com/blog/self-correcting-memory-openwiki, https://github.com/langchain-ai/openwiki
title: "Building Self-Correcting Memory in OpenWiki" + the OpenWiki repository
author: one vendor, both artifacts (paired single-voice source)
kind: first-party release walkthrough + vendor repository (engine and operating rules in one tree)
mined_on: 2026-08-27
words: 1559 (blog) / 4739 (repository page)
skill_version: 0.14.0
extracted: 17
picked: 8
accepted: 8
already_covered: 0
declined: 0
leads: 3
untriaged: 9
dispatched: 0
fetches_spent: 0
---

# OpenWiki, 2026-08-27 — the run whose best finding was the one I got wrong first

Run 34. A vendor's announcement of an agent-maintained documentation tool, plus
that tool's own repository. Two artifacts, **one voice**, which is the fact that
shaped the triage: within-batch convergence is void here, so nothing could be
corroborated by "both sources say it," and every landing had to earn its way on
corpus-internal grounds or on training-data convergence.

## Class: a paired single-voice source

The blog is a **first-party practitioner account**, release-walkthrough
sub-class — organised around one version's changes, so it states what was wrong
before, which is the property that makes the sub-class worth seeking out. The
repository is a **vendor repository**, and it behaved exactly as that row
predicts in one respect and against it in another: the benchmark claims were the
least useful thing present, but the "stated production rules" half was unusually
dense — a dozen named operating constraints, most of them failure modes the team
clearly paid for.

Expected yield, said out loud before the table: amendments and catches, one or
two techniques, no new subject, because a single vendor's design is n=1 and the
corpus already held `docs-sync` (9t), `agent-memory` (10t), `claim-verification-and-provenance`
(6t, civic) and `hash-pinned-translation-pipeline` (6t) on this exact ground.
**That calibration was right about the shape and low on the count** — eight picks
all landed — and the reason is worth keeping: the source's subject matter *is*
this registry's subject matter, so the fraction of it touching our own machinery
was much higher than for an ordinary vendor source.

0 of 3 fetches. Seventh consecutive zero-fetch run for a source carrying its own
primary material.

## The run's actual lesson: the authority beat the count, again

The biggest finding nearly shipped wrong, and the failure mode is one the method
already names.

Mapping the registry's own contribution lane, I read the two live contributor
files in `signals/`, saw two counters per subject — `consults` and `deviations` —
and concluded the schema had no channel for a verification verdict. That was a
clean, satisfying finding: both fields measure the consumer against the standard,
so nothing could ever falsify a published claim. I wrote the technique and the
golden-path section on it.

Then I read the checker. `check-signals.mjs` accepts a **third** key, `citations`,
carrying `resolved` / `moved` / `gone` per application, keyed by slug and never by
path, with the privacy rule enforced in the failure message itself: *"the verdict
is counts only; WHICH anchors vanished is a fact about one tree and stays there."*
The channel exists, and it is designed better than the thing I was about to
propose.

**The corrected finding is strictly stronger than the wrong one.** The registry
does not lack the channel; it has it, specified correctly, and:

1. `signals-collect.mjs` — the lane's *only* writer — constructs
   `{ consults: {}, deviations: {} }` and has no code path that emits a verdict;
2. `librarian-scan.mjs` reads the block and takes `gone`, discarding `resolved`
   and `moved`, which are the two counts that carry the denominator.

Specified, unpopulated, half-consumed. That is a much better technique than
"add a field," and it is `absent-guard-is-loud` in a form worth naming: **the
test for whether a contribution channel exists is not whether the validator
accepts it, but whether the collector emits it unasked.** An optional
contribution converges on absent.

Two runs now say the same thing (2026-08-22's category-nesting error, this one),
and it should be read as settled rather than as advice: **structural claims are
verified against the authority — the checker, the schema, the taxonomy — never
inferred from the data lying around.** Data shows what contributors happened to
send. Only the validator says what the lane is.

## The cluster, which is a statement about the bundle

Eight of the seventeen candidates sat on one neighbourhood: *the lifecycle of a
claim whose evidence moved.* The corpus covers this at file granularity
(`source-doc-mapping`), at artifact granularity (`source-hash-provenance`), with
verdicts in another bundle (`three-verdict-vocabulary`, civic), and by
recency/usage decay (`decay-and-forgetting`). Nothing owned **proposition-level**
evidence binding. The cluster was the finding, and it is about `docs-sync`, not
about the vendor.

## What landed

**Four techniques, two amendments, one application.** Two picks merged into each
of the first two techniques, because in both cases the operator's two rows were
two rules about one surface.

- **`docs-sync/earned-verification-state`** (picks 1 + 7) — the asymmetry that
  made this the run's best knowledge finding: `docs-sync` measures what a
  *report* may claim with total rigour (three states, reason classes, fractions,
  exit codes, the fourth number) and says **nothing** about when a *document* may
  advance its own review date — even though wall 7's cross-repo detector consumes
  exactly that field to choose its query window. An unearned bump does not just
  mislead a reader; it moves the detector's horizon past the changes it exists to
  find, and the detector then reports clean forever. Also carries durable
  staleness on the artifact (a scan finding has a *dismiss* transition; a document
  in dispute for a year reads as current) and the three resolutions of *stale* —
  reaffirm, correct, retract — where the existing vocabulary defines stale as
  "actionable" and pushes the common case into the wrong bucket.
  The seam: `docs-content-model` owns the field's shape, `docs-sync` owns queries
  over it, **neither owned the write rule**.
- **`docs-sync/repair-rides-the-open-page`** (picks 5 + 4) — a third collector.
  The golden path's economics section enumerated two (per-change, batch) plus a
  bad third posture; opportunistic repair riding whatever page a worker already
  opened is a fourth, and the one that makes claim-level freshness affordable
  because cost scales with change volume rather than corpus size. Carries the
  ordering rule (the deterministic walk runs *before* the no-op short-circuit,
  because carried-over deferred work belongs to no subsequent diff) and the honest
  limitation the source's design implies but does not state: it never converges on
  cold pages, so the batch lane stays the backstop and the cold set belongs in the
  catch-up marker's skip list. Converging practice: repair-on-access in replicated
  stores, which needs anti-entropy for exactly the same reason.
- **`telemetry-pii-redaction/exclusion-bounds-reads-not-output`** (pick 9) — the
  contested home, and the argument for it: every technique in that subject assumes
  the sensitive value *passes through* the pipeline, which is what lets a scrub
  find it and an absence assertion prove it left. A composed artifact breaks the
  assumption completely — the fact is reconstructed, so no string ever entered for
  a scrubber to match. The source's own honest sentence is the finding: an ignore
  list is a *read* boundary and does not guarantee a topic is never mentioned,
  because the excluded area stays derivable from the tests, configuration and
  history that remained.
- **`knowledge-registry/verification-is-contributed`** (pick 17) — see above. The
  central move, which I only got from reading the real implementation: **a count
  crosses a publish boundary that an anchor cannot.** That reduction is what makes
  the loop closable at all.
- **Amendment, `dated-corrections`** (pick 6) — the contradicted pick, and per the
  standing rule the best one to keep. The source's set-reconciliation contract is
  right (complete set in, complete set out, one authoritative state per pass) and
  its retraction signal is wrong: **omission**. That makes forgetting and deciding
  produce byte-identical results — the silent rewrite this very technique opens by
  rejecting, moved from the sentence to the set, at the one site where the
  disappearance is unobservable by construction. Also disposes of the source's own
  guard: refusing to finish until the set is persisted proves the *write*
  completed, never that the omission was *intended*.
- **Amendment, `doc-rot-detection`** (pick 8) — a replay harness over the source's
  own commit history, with checkpoints, classifying every claim four ways. Written
  against `gate-liveness`, which is the real prior art and which it does not
  duplicate: a seeded violation proves the detector fires; it cannot measure
  convergence (state at checkpoint N is the product of repairs at N-1) and **it
  cannot produce a fabrication at all**, because a seed is a known-bad input the
  tester constructed while fabrication is content the writer invented. The detail
  nobody invents by accident, and the reason to trust the protocol: the replay
  includes **reverts**, which are the only change that tests whether the loop can
  un-stale a claim.
- **Application, `node--verification-is-contributed`** — the negative kind, written
  against this registry. The verdict channel is specified, emitted by nothing, and
  read one-third. Best line of evidence: the collector is the lane's only writer,
  so what it cannot emit the lane cannot contain regardless of what the validator
  permits — the validator's permissiveness is unobservable from outside. Nobody
  designed that demonstration; it fell out of having exactly one generator.

## Leads (banked, return conditions attached)

- **An external portable format now exists for this registry's artifact class.**
  The source ships its output as a versioned open knowledge format with front
  matter for provenance, sources, verification and lifecycle — the same fields
  this profile carries under its own names, plus `stale_after`, which we do not
  have. **Return when a second, independent producer emits the same format**, or
  when a consumer asks to read a bundle with a tool that expects it. Not acted on:
  one vendor emitting a format is not a standard, and the registry's own profile
  already states its position on staleness deliberately.
- **Law candidate: a verification stamp names what it was verified against.**
  Recurs in this run at three unrelated sites (the document's review date, the
  application's `verified_on`, the contribution lane's verdict) and is the same
  claim each time: a stamp recording only *when* has no recomputation path and
  can only ever decay on a guess. Has the cross-cutting, clock-proof shape a law
  needs. **ONE sighting.** Return on a second, in a different bundle.
- **Owed to this registry: the collector does not emit the verdict it validates.**
  The technique now says the test is whether the collector emits unasked; this
  registry fails its own test. **Return when `signals-collect.mjs` is next
  touched** — the change is a third key beside `consults` and `deviations`, and
  the consuming end needs `resolved` and `moved` stopped being discarded before
  the number would mean anything.

## Untriaged — reached the table, nobody picked them

Recorded with anchors so a later run does not re-derive them. **Nobody verified
any of these**; they are not declines.

| # | Candidate | Anchor | My read at triage |
| --- | --- | --- | --- |
| 2 | Key freshness to the evidence version, not a calendar date | "comparing the version of the source that originally supported a claim against the version that exists" | likely catch — `doc-rot-detection`'s `use_when` already rejects timestamp checks |
| 3 | Derive the stale flag; never store a status field | "does not need to persist a separate status flag for this" | likely catch — `content-hash-vs-status-drift` (game-production) names it |
| 10 | Advance the provenance stamp on body change only; front-matter changes do not | "any body change, including whitespace, advances the stamp" | partial — `hash-scope-choice` probably owns it |
| 11 | Degrade a failed artifact in place, leave the repair marker in-band | failed diagram "converted in place to a plain text fence with a short comment explaining why" | partial — a twist on `catch-up-markers` |
| 12 | Streaming-only gateway answers HTTP 200 with empty content | "leaves you with a blank wiki and no error" | partial — a real silent-success class, may sit in `agent-cli-transport` |
| 13 | A credit pre-check reserves the advertised output ceiling, not expected spend | "on a low credit balance every request can fail with a 402" | partial — `cost-metering` neighbourhood |
| 14 | A framework's model metadata caps aliases it predates | "older metadata otherwise limits newer aliases to 4,096 tokens" | likely catch — `dated-capability-matrix` |
| 15 | The portable knowledge format itself | "the root index declares okf_version" | real, but currency not content — banked as a lead above |
| 16 | Ephemeral runners lose uncommitted resume state | "ephemeral CI runners do not retain uncommitted run state after failure" | likely catch — `ephemeral-versus-warm-runners` |

## Method notes

- **The operator picked all eight rows I marked "real gap" and none of the four I
  marked "likely catch."** Third consecutive run where the read column carried the
  triage. It is worth continuing to state a read even when it feels like
  overstepping; withholding it moves the guesswork to the person with less context.
- **Two picks merged into one technique, twice.** Rows 1+7 were two rules about
  the artifact's own verification state; rows 5+4 were a collector and its
  ordering precondition. Landing them as four files would have been padding. When
  the operator picks two rows that turn out to be one decision, say so and land one.
- **The class's fetch prediction held.** First-party plus its own tree corroborates
  corpus-internally; the only thing a fetch could have bought was the vendor's
  benchmark numbers, which are the least useful thing present and which the
  landings deliberately do not cite — the replay *protocol* is the finding, not the
  percentages it produced.
