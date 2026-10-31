---
subject: docs-sync
domain: software-engineering
last_touched: 2026-09-23
dry_streak: 0
---

# docs-sync

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: EXTENDS.

## State

6 -> 9 techniques, 2 -> 3 applications. Golden path extended with five additive
edits and no paragraph rewritten. The three new techniques are the ones that
apply when the doc and the code it describes are in DIFFERENT checkouts, which
every existing technique in the subject had assumed away.

This subject was ranked for attention on a stale reading. The domain note of
2026-08-21 listed it as owing an application; the scan at dispatch time showed it
already carried two. The note is a record of a moment, the scan is the
instrument — the ranking was corrected before dispatch, and the subject was kept
in the wave for depth rather than for debt.

## Open leads (banked, with return conditions)

- **a signal discloses whether it can fail** (proposed law, not added). A report
  emitting several numbers where only some are enforced must label each, because
  enforced and decorative look identical from outside. Three recurrences, one of
  them in this subject's own existing `same-change-enforcement` (a hook assumed
  to be enforcing for fifteen months and never fired). Currently carried as prose
  inside `checked-vs-skipped-denominators`. Return next sweep and decide whether
  it earns an anchor or stays where it is.
- **Coarse watch sets saturate.** Measured at 107 of 116 documents drifting
  (92.2%) against deliberately coarse watch paths. The upward lesson taken was
  that ranking by change volume is what makes a saturated signal usable, and that
  narrowing the sets to suppress the number would trade triage for a dead signal.
  Worth re-measuring on a second tree before the ranking rule hardens.

## Declines

- Did not claim the content-model half of this ground. A sibling subject founded
  in the same wave owns the fields on the record and what their absence means;
  this subject owns what asks them a question and how the answer is reported when
  it could not be asked. Both workers stated the same seam independently, in the
  same words, without coordination — which is the strongest evidence available
  that the seam is real rather than negotiated.

---

## Touch 2 — 2026-08-27, `/intake` from [[../../sources/2026-08-27-openwiki-self-correcting-memory]]. Class: EXTENDS.

9 -> 11 techniques, plus two amendments inside existing files. Applications
unchanged at 3. Golden path: heading count 9 -> 11, opening paragraph extended,
two wall sections added, and the economics section's enumeration corrected from
two collectors to three.

## The finding was an asymmetry, not an omission

The subject measures what an **instrument** may claim with total rigour —
`checked-vs-skipped-denominators` alone carries three states, reason classes,
fractions on the headline, exit-code discipline and a fourth not-enumerated
population — and says nothing at all about when a **document** may advance its
own review date. That field is not decorative: wall 7's cross-repo detector
consumes it to choose which window of the other repository's history to query.
So a date advanced by a run that verified nothing moves the detector's horizon
past the changes it exists to find, and the detector goes on reporting clean
because it is now asking about a window in which nothing happened.

Neither slug mapping nor a summary could have surfaced this. Both halves
"cover" freshness; only opening both shows that one gets four measures and the
other gets a sentence. **The hunt that found it: which file MEASURES the thing
both files mention.**

The seam is stated in the golden path already and stops one step short —
`docs-content-model` owns the *shape* of the honest-metadata fields,
`docs-sync` owns *queries* over them, and **neither owned the write rule**,
which is the rule the query's correctness rests on.

## What landed

- **`earned-verification-state`** (new, wall 10) — the stamp advances only on a
  completed recheck over a non-empty population; three clean-looking runs that
  do not earn it. Durable staleness on the artifact, because a finding in a scan
  stream has a *dismiss* transition and a document in dispute for a year reads
  exactly as current as one nobody questioned. *Stale* as suspended belief with
  three resolutions — reaffirm, correct, retract — against the existing
  vocabulary's definition of stale as "actionable", which pushes the common case
  (evidence moved, claim survives) into the rewrite bucket. Binds at the
  proposition, with the cost stated: affordable for a machine-maintained corpus,
  usually not for a hand-written one, and document-level stamping stays correct
  there provided the *reporting* does not imply finer granularity.
- **`repair-rides-the-open-page`** (new, wall 11) — the third collector. The
  economics section enumerated per-change and batch plus a bad third posture;
  repair riding whatever page a worker already opened is a fourth and is what
  makes proposition-level freshness affordable, because cost then scales with
  change volume rather than corpus size. Two conditions and one permanent limit:
  detection stays exhaustive while only resolution is opportunistic; the
  deterministic walk runs **before** the no-op short-circuit, since work an
  earlier run deliberately deferred belongs to no subsequent diff; and it never
  converges on cold pages, so the batch lane stays the backstop and the cold set
  belongs in the catch-up marker's consciously-skipped list. Converging practice:
  repair-on-access in replicated stores, which needs anti-entropy for exactly the
  same reason and fails in exactly the same tail.
- **Amendment to `dated-corrections`** — "Retraction is a verb, never an
  absence." The source's whole-set reconciliation contract is right and its
  retraction signal is wrong: **omission**, which makes a worker forgetting and a
  worker deciding produce byte-identical results. That is the silent rewrite the
  technique opens by rejecting, relocated from the sentence to the set, at the
  one site where the disappearance is unobservable by construction
  (`deletion-is-not-repair`, already in the file's frontmatter). Disposes of the
  attractive counter-argument too: a durability guard proves the *write*
  completed, never that the omission was *intended*.
- **Amendment to `doc-rot-detection`** — "Proving the loop converges, not just
  that the sensor fires." Replay the source's own history through checkpoints,
  classify every claim four ways, and read the trajectory rather than the
  endpoint, because state at checkpoint N is the product of repairs at N-1.
  Written explicitly against `gate-liveness`, which is the real prior art: a
  seeded violation proves the detector fires and **cannot construct a fabricated
  claim at all**, because a seed is a known-bad input the tester wrote while
  fabrication is content the writer invented. The protocol detail that earns
  trust: the replay must contain **reverts**, the only change that tests whether
  the loop can un-stale a claim rather than only ever adding staleness.

## Honest limits

- The replay-harness amendment describes a protocol this registry has not run.
  It is written from the source's stated method and from mutation-testing
  convergence; the vendor's own percentages are deliberately **not** cited, since
  benchmark claims are the least reliable thing a vendor repository ships.
- `earned-verification-state`'s proposition-granularity section has no
  realization here. This subject's three applications are all file-granularity.
  A corpus that actually binds claims to evidence versions is the realization to
  hunt for next.

## Open leads

- **Law candidate, one sighting**: a verification stamp names what it was
  verified against. Recurs at three unrelated sites in this run alone. Return on
  a second sighting in a different bundle.

## 2026-09-01 — [[2026-09-01-slideops-readme]] — one technique, EXTENDS

11 -> 12 techniques. `rendered-surface-coupling`, plus wall 12 of the golden
path. No existing paragraph rewritten.

The finding is an **asymmetry between two subjects this corpus already holds**,
which is why it had gone unwritten: a document's rendered figures are derived
artifacts with the same standing claim as the prose, and each existing
discipline disqualifies them for a *different* reason. `codegen/drift-gating`
needs byte-stable output and rasterization is not byte-stable, so that gate goes
red on a toolchain upgrade that changed nothing visible. `doc-rot-detection`
resolves coupling by reading, so a figure terminates at the ladder's third rung
and is `unverifiable` permanently rather than occasionally. Both owners can
correctly say it is not theirs, and it falls between them.

Resolution written into the technique: digest the **inputs** — source document,
rendering parameters, renderer identity — never the output bytes. The input set
fails in both directions and both are stated: too narrow and a renderer upgrade
substitutes the picture behind a green gate; too wide and the gate fires on every
dependency bump and gets switched off.

The source repository is the exemplar and it is a *negative* one. It implements
the input-digest discipline for every quoted snippet inside the documents it
generates, and guards the composite image on its own landing page — whose
generator's docstring says it rots the same way — with a review-template
checkbox. The remedy was one directory away.

## Honest limits (2026-09-01)

- **Unapplied, and not for lack of trying.** No managed project has a single
  authored documentation figure — 6 of 7 have zero image references in any
  markdown, and the seventh's 22 are scraped web artifacts, not authored docs.
  No seam exists to test against and a simulation would have needed invented
  cases. Return condition: a managed project growing an authored figure in a
  maintained document.
- The technique's input-set composition is argued, not measured. Nobody in this
  run built the digest and watched it fail in either direction.

## Boundary recorded

`repository-landing-document` (new this run) decides whether a figure earns its
place on a landing document; this subject decides whether it is still true. The
two are confused often enough that both sides now say so in prose.

---

## 2026-09-01 (second touch today) — [[2026-09-01-openwiki-v050]]

Class: SHARPENS. One amendment to `dated-corrections`, one application. No new
technique, and the reason is the finding.

**The source this subject argued against conceded, one release later.** On
2026-08-27 `dated-corrections` gained its "Retraction is a verb, never an
absence" section by rejecting one detail of a vendor's claim-reconciliation
contract: omission as the retraction signal, on the grounds that it makes
forgetting and deciding produce byte-identical results. The v0.5.0 delta ships
the reversal — an explicit withdrawal field, an omitted healthy claim retained,
an omitted *flagged* claim refused by the runtime. Verified in the
implementation rather than the prose, per the rule this subject's own prior run
established.

**The amendment is not a victory lap; it is a correction of our own cure.** Our
rule refused *every* omission, which forces the worker to re-declare the complete
set on every pass — precisely the round-trip cost that
`repair-rides-the-open-page`, two files away in this same subject, exists to
avoid. The two techniques were quietly in tension and nobody had noticed. The
shipped resolution is three-way and cheaper: bind omission to the
non-destructive reading, and reserve the refusal for claims *already flagged
stale*, where retaining silently would re-stamp evidence as current and launder
a known-broken claim into a fresh confirmation. Two new rules came with it —
withdrawal idempotent while confirmation stays strict (retry safety across a
split write), and a result floor that refuses a pass emptying the set.

## Measured (2026-09-01)

The subject's own registry has the defect. `scripts/signals-collect.mjs` folds a
rolling 30-day window into a whole-file replace, so an aged-out subject is not
expired — it is unwritten, and the replacement carries no evidence it was there.
Same recorded inputs, one variable (the window): 87 pairs at 30d with **0
dropped**, 71 at 8d with **16 dropped**, 51 at 4d with 36. At the shipped window
the defect is real and not yet observable — the oldest consult is 2026-08-23 —
so the honest output is a date rather than a verdict: **the first genuine silent
drop lands 2026-09-22.**

The **asymmetry** is the durable half. `librarian-scan.mjs` models
unknown-versus-zero at *bundle* granularity with visible care and explicit
prose; at *subject* granularity the same distinction is destroyed by the write
path rather than by a decision. One lane, one author, modelled where it was
thought about and lost where it was not.

## Honest limits (2026-09-01)

- **Nothing was committed to the collector**, and the ship zero is deliberate.
  The repair is a schema decision on a lane whose key set is closed and
  validated, and the 2026-08-27 run already left this lane owing an unemitted
  `citations` key. A second key before the first is emitted widens the gap.
  Return condition / named instrument: `signals-collect.mjs` emitting
  `citations`.
- The three-way rule is corroborated by one vendor's reversal plus this
  registry's own seam. That is a first-party account and an internal
  measurement, not two independent producers. **A second independent system
  binding omission to retain would promote this toward a law candidate**; on one
  sighting it stays a technique.


### 2026-09-03 - `/intake`, from a vendor's official MCP server monorepo

`same-change-enforcement` gained a zeroth design. Source: [[2026-09-03-microsoft-mcp]].

The technique is a deep treatment of the hard case - prose coupled to source by a mapping,
with its measured 54.3% wrong-document rate, satisfaction-by-prefix, and a dismissal
protocol - and it never named the strictly better case that should be tried first. If the
document can be *derived*, regenerate it and assert byte-equality with what is committed,
with the repair command in the failure message.

It dominates every mapping-based gate the file describes for a structural reason worth
stating: there is no satisfaction ambiguity at all. The target is the file itself and the
predicate is equality, so satisfaction-by-prefix cannot happen, the wrong-document failure
cannot happen, and there is no empty success. The file's entire autopsy is about a gate
that could not see its target; this shape's target is unmissable. The precondition -
derivability - is why it is not always available, and the rest of the technique stands
unchanged for everything that is not.


### 2026-09-04 - `/intake`, from a credential-borrowing CLI's policy test suite

Three techniques, 12 -> 15, and three source-tree applications plus two fleet
applications. Source: [[2026-09-04-agent-reach]].

The family fills a **stage one** the subject had assumed away in all twelve
walls: every one of them discovers the source a document is *about* and judges
the prose against it, which presupposes that the claim HAS a source area. A
promise about what a system does NOT do has as its truth-maker the fact that no
code exists, so nothing can be coupled to it, and wall 5 correctly returns
`unverifiable` forever.

**The strongest argument came from the subject's own prior work, not from the
source.** Wall 12 had already found the permanent-`unverifiable` category for
figures - "unverifiable permanently rather than occasionally" - and the two
resolutions are opposites: a figure cannot be *read* and is fixed by digesting
its inputs; a promise has *no inputs*, so the comparison cannot be inverted and
the mechanism has to change instead of moving. Pairing them is what kept
`negative-claims-are-pinned` from reading as a restatement of the rot verdict.

`prose-as-an-execution-surface` is the one with reach beyond this subject's
usual concerns: it moves a document from something that can be false to
something that RUNS, which changes the severity class and the gate's population
- text a reader will act on, including what the program prints, not files with
a documentation extension.

`translations-drift-against-the-product` states a seam with
`hash-pinned-translation-pipeline` rather than competing with it. That subject
pins a translation to its SOURCE; this one pins it to the PRODUCT, and the
failures are independent - staleness relative to a stale source is zero, and a
page authored directly in a target language has no source unit to pin at all.
Both required; neither corrects the other.

**Fleet reach, stated as its own state:** 1 of 3 landed techniques had a seam
worth a code change (personas, shipped), 1 came back `not-better` for the
technique's own stated disqualifier, and 1 is **unapplied for want of a seam** -
no project in the fleet ships prose documentation in a second language. The
corpus is ahead of the fleet on that third one and the return condition says so.

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923), L350 AMEND to `same-change-enforcement`: the counter-evidence joined the landing - a predicate imported into CI carries its flaw (any doc under the prefix passes) into a binding gate.

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): personas 1.

## Architecture review - 2026-10-31

First architecture review, against `78f3ddcb0`. All 26 documents read in full.
The load-bearing claims were checked against the exemplar project's own
measurement document (composed 2026-08-17) and against the pinned
`da5044d2` tree of the public CLI that three applications read.

One finding corrects this note's own earlier prose. The never-fired hook was
described above, and in four documents, as dead for "fifteen months". The
primary record says the three-target hook landed on 2026-05-16 and the replay
was composed on 2026-08-17: three months, not fifteen. The 0.00% figures, the
93.0% tool-result share, the 54.3% wrong-document rate and the 33.0% unmapped
share all reproduce from that record. Another finding is in an application: the
catch-up-marker reading called the hook "alive" four days after the replay found
it had never fired.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/docs-sync",
  "date": "2026-10-31",
  "baseline": "78f3ddcb0",
  "digest": "sha256-b2:fd96220db75846a1",
  "disposition": "clarify",
  "coverage": "All 26 documents (golden path, 16 techniques, 9 applications) read in full. Primary checks: the exemplar's own measurement record and deferred-fix register for the hook figures and dates; the exemplar's marker, coupling map, path guard, promise-pin record and hook registration as they stand on 2026-10-31; the public CLI's test file, install guide, export guide, server entry point, CI workflow, changelog, landing pages and contract test at the pinned commit; a search summary of the claim-reconciliation vendor's quickstart. Not evaluated: the sibling guide-site repository (not present), any re-run of the replay, the A/B arms, or the fleet sweep.",
  "counterexamples": [
    "A hook that landed on 2026-05-16 and was replayed on 2026-08-17 cannot have been dead for fifteen months; the date arithmetic in the source record gives three.",
    "A marker whose note says the per-change hook 'now prevents this kind of drift' stays untouched for three months whether the hook works or not; untouched is evidence of nothing when the hook never fired.",
    "A test file can pin a boundary in eleven documents while the prose describing it names only nine; the scope list is the finding, so a short enumeration understates it.",
    "A changelog removal entry with an upstream issue link can be about a third platform; citing it as the record of two other retirements makes the translation story look better documented than it is.",
    "A technique that both says a missing claim is 'a validation error the runtime refuses' and, two paragraphs later, that omission of a healthy claim retains it, contradicts itself unless the first sentence names the strict form as one option."
  ],
  "sources": [
    {
      "source": "Exemplar project's measurement record for documentation sync (composed 2026-08-17) and its deferred-fix register entry 105",
      "result": "'since the three-target hook landed (d584207f7, 2026-05-16)'; '18,908 of 20,322 such events (93.0%) are tool results'; turns 1,414 / editing turns 477 / edits 2,367 / visible 0; 'exit 0, 12 of 12'; '761 entry-commit pairs ... only 348 (45.7%) touched the doc the entry names'; '1,421 of 4,304 source files (33.0%) match no entry'. Supports every figure the golden path and same-change-enforcement cite; refutes 'fifteen months'."
    },
    {
      "source": "Exemplar project's tree on 2026-10-31",
      "result": "The hook's walk still breaks at the first user-shaped event (line 98) and the hook appears in neither settings file. The marker holds anchor 201bfeec6 dated 2026-05-16, 84 updated topics, three missingCoverage entries, an empty topicsFlagged and the 'bulk rewrites should not be needed again' sentence. The map now holds 44 entries (28 with no flows, 21 with no marketing module, none without a doc). The promise-pin record holds one pin with four required phrases, one document, reviewed 2026-09-04, and four forbidden phrases. Setup remediation lines 563/636/648 hold; the companion scraper's README line 112 is no longer an install line."
    },
    {
      "url": "https://github.com/Panniantong/Agent-Reach/blob/da5044d26fc6adddb6554d5679c94ac22e76e428/tests/test_auth_guidance_policy.py",
      "result": "235 lines, ten test functions (not nine). The environment boundary is pinned in 11 listed documents: four landing pages, cookie-export, install, troubleshooting, the setup guide, two skill files and a social reference. The secrets test forbids eight markers: two cookie subcommands x two quote styles, a Groq key, an OpenAI key, a GitHub token and a proxy URL (two API keys, not three). The verified-glyph suppression sits at 116-124; the backend-state test at 199-208."
    },
    {
      "url": "https://github.com/Panniantong/Agent-Reach/blob/da5044d26fc6adddb6554d5679c94ac22e76e428/CHANGELOG.md",
      "result": "Lines 59-62 describe LinkedIn and another job-board channel. The one removal entry is Instagram at 48-51 ('aggressive anti-scraping measures broke all available open-source tools', instaloader#2585). Neither name the localized-page test forbids appears anywhere in the file. Line 22 holds the 'corrected misleading documentation' entry the negative-claims application cites."
    },
    {
      "url": "https://github.com/Panniantong/Agent-Reach/blob/da5044d26fc6adddb6554d5679c94ac22e76e428/docs/cookie-export.md",
      "result": "'Both commands use a hidden prompt. For non-interactive automation, send the same exported value through stdin and add `--stdin`; never place cookies in the process arguments.' Supports the prose-surface application. The install guide's archive-URL lines (62, 77), the server's stderr hint (32-36), the CI pins (41, 66; matrix 3.10-3.13) and the routing line at README 218 / ja 207 all hold."
    },
    {
      "url": "https://github.com/langchain-ai/openwiki/blob/main/openwiki/quickstart.md",
      "result": "Seen only through a search summary: the host submits retractedClaimIds for removals and OpenWiki retains current issue-free claims. Consistent with dated-corrections' three-way rule; the pinned commit was not reopened."
    }
  ],
  "documents": {
    "docs-sync.md": {
      "disposition": "clarify",
      "reason": "(1) 'fifteen months' (two sites) should be three: hook landed 2026-05-16, replay 2026-08-17. (2) The closing technique list omits rendered-surface-coupling. (3) Wall 2 says 'never from a conversation transcript' while same-change-enforcement keeps a validated transcript walk as the last resort and keeps the in-session nag. (4) Wall 10's 'Eight walls govern' miscounts the nine walls before it. (5) Owed, not mechanical: the heading says fifteen load-bearing walls over sixteen techniques; named-duplication-points has no wall. (6) Minor: wall 15 says the product-anchored check buys one thing (no retired capability advertised) while the technique also covers omitting a current one."
    },
    "techniques/source-doc-mapping.md": {
      "disposition": "keep",
      "reason": "1,421 of 4,304 (33.0%), 229 and 131 reproduce from the primary record. The 37-entry figures are the exemplar's dated state; the map has since grown, which the application now records."
    },
    "techniques/same-change-enforcement.md": {
      "disposition": "clarify",
      "reason": "Every figure reproduces from the primary record except 'fifteen months' (three sites), which should be three. The derived-document and shared-predicate sections are sound."
    },
    "techniques/coupled-surface-inventory.md": {
      "disposition": "keep",
      "reason": "Report-not-gate for cross-repo surfaces and the reconcile-against-ground-truth rule are sound and consistent with cross-repo-drift-detection's direction argument."
    },
    "techniques/dated-corrections.md": {
      "disposition": "clarify",
      "reason": "Internal contradiction: 'a claim that is simply missing is a validation error the runtime refuses' stands unqualified above the subsection that binds omission of a healthy claim to retain. Name the refusal as the strict form."
    },
    "techniques/doc-rot-detection.md": {
      "disposition": "keep",
      "reason": "Verdict ladder with broken above stale is coherent. The replay-harness protocol is stated as method, and the note already records that it was not run here."
    },
    "techniques/catch-up-markers.md": {
      "disposition": "clarify",
      "reason": "'fifteen months' (three sites) should be three. The marker's four fields and the hope-recorded-as-fact example match the primary marker."
    },
    "techniques/cross-repo-drift-detection.md": {
      "disposition": "keep",
      "reason": "Direction argument, commit-date bound, never-auto-advance, coarse-plus-rank and pair-keyed caching are sound and consistent with the application's measurements."
    },
    "techniques/source-as-data-without-the-app.md": {
      "disposition": "keep",
      "reason": "Scrape versus refused-resolution sandbox and the partial-parse trap are well bounded; the third option is correctly conditioned on regenerating rather than trusting a committed copy."
    },
    "techniques/checked-vs-skipped-denominators.md": {
      "disposition": "keep",
      "reason": "Three states, reason classes, fraction headline, exit code following the denominator and the profile clause are consistent with each other and the laws they cite."
    },
    "techniques/earned-verification-state.md": {
      "disposition": "keep",
      "reason": "The write rule closes the seam the golden path names. Proposition binding has no realization here, which the note states and the text prices honestly."
    },
    "techniques/repair-rides-the-open-page.md": {
      "disposition": "keep",
      "reason": "Exhaustive detection with opportunistic resolution, walk-before-no-op, and the cold tail routed to the marker are coherent with dated-corrections' sparse protocol."
    },
    "techniques/rendered-surface-coupling.md": {
      "disposition": "keep",
      "reason": "Input-digest resolution and both failure directions are sound. The input-set composition is argued, not measured, as the note records."
    },
    "techniques/negative-claims-are-pinned.md": {
      "disposition": "clarify",
      "reason": "The worked example calls the eleven-document pin a 'credential-boundary statement' and lists five document kinds. At the pinned commit the eleven-document pin is the environment-variable boundary over four landing pages, four guides, two skill files and a platform reference."
    },
    "techniques/prose-as-an-execution-surface.md": {
      "disposition": "clarify",
      "reason": "'any of five translated landing pages' should be four. The worked example ships four landing pages, and the application says four."
    },
    "techniques/translations-drift-against-the-product.md": {
      "disposition": "keep",
      "reason": "Two-anchor argument and per-page asymmetry are confirmed by the pinned test file (all four pages for routing, two for the retired names)."
    },
    "techniques/named-duplication-points.md": {
      "disposition": "keep",
      "reason": "Arithmetic is consistent: 8 runs x 12 sites = 96; 47 + 45 = 92; each arm 4 x 12 = 48; six literal sites (five caps + one table). The source tree was not reopened."
    },
    "applications/node--source-doc-mapping.md": {
      "disposition": "clarify",
      "reason": "It reads the hook's design without saying the hook never fired for any entry, and quotes 'never once fired for live-roadmap' as if the defect were one glob. Add a dated note: hook never fired, now unregistered, map at 44 entries. Leave the 2026-08-21 table as it is."
    },
    "applications/process--catch-up-markers.md": {
      "disposition": "clarify",
      "reason": "Claims the hook is 'not only alive', four days after the project's replay found it never fired. Its framing that the marker 'closes the loop' contradicts the technique and golden path. Needs a dated correction."
    },
    "applications/node--dated-corrections.md": {
      "disposition": "reverify",
      "reason": "The collector has changed: WINDOW_DAYS now sits at line 54, the window at 85, the write at 223, and citations are discussed at 216. The 2026-09-22 drop date has passed and the drop was not re-measured."
    },
    "applications/node--cross-repo-drift-detection.md": {
      "disposition": "reverify",
      "reason": "The guide-site repository it reads is not present in this checkout set. Nothing was re-run. Its claims are internally consistent: 116 to 23 keys, 107 of 116 is 92.2%."
    },
    "applications/python--prose-as-an-execution-surface.md": {
      "disposition": "clarify",
      "reason": "Says nine tests; the pinned file has ten. Says three API keys; the eight markers hold two. Line ranges end at 176 and 198, not 174 and 196. All other citations hold."
    },
    "applications/python--negative-claims-are-pinned.md": {
      "disposition": "clarify",
      "reason": "'Nine tests' (three sites) should be ten. The eleven-document enumeration names nine kinds and omits the install guide and the platform reference. Line ranges 74-124, 116-124 and 199-208. Other citations hold."
    },
    "applications/python--translations-drift-against-the-product.md": {
      "disposition": "clarify",
      "reason": "Cites CHANGELOG.md:59-62 as the record of the two retirements. Those lines describe other channels, and the only removal entry (48-51) is a third platform. 'Never did' about the primary page is an unverified claim about history. Test ranges, the routing lines and the contract test hold."
    },
    "applications/node--negative-claims-are-pinned.md": {
      "disposition": "reverify",
      "reason": "The pin record matches the text: four required phrases, one document, a reviewed date and four forbidden phrases. The A/B arms and the eight tests were not re-run."
    },
    "applications/node--prose-as-an-execution-surface.md": {
      "disposition": "reverify",
      "reason": "The desktop remediation lines hold. The one cited landing-page install line (pumper README:112) has moved and is no longer an install line. The fleet-wide credential sweep was not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the clarify items above that rest on the primary record or an
internal inconsistency, against `0f30830bc` (no commit touched the subject
between the two baselines). Three python applications had every citation
re-opened at the pinned commit, so their `verified_on` moved to 2026-10-31.
So did the marker application, whose cited fields were re-read. The source-map
application keeps its 2026-08-21 date, because its table is a dated measurement
the tree no longer matches. Still owed: a wall for named-duplication-points
(the golden path says fifteen walls over sixteen techniques) and the wall-15
wording. Both need authoring, not correction.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/docs-sync",
  "date": "2026-10-31",
  "baseline": "0f30830bc",
  "digest": "sha256-b2:cd086fefbf743abc",
  "disposition": "clarify",
  "coverage": "All 26 documents decided. Ten documents edited and the edited passages re-read; the other 16 are byte-unchanged and keep their dispositions. Sources as in the earlier 2026-10-31 record; nothing new opened. No verified_against written; verified_on moved only on four applications whose citations were re-checked.",
  "counterexamples": [
    "A hook that landed on 2026-05-16 and was replayed on 2026-08-17 cannot have been dead for fifteen months; the date arithmetic in the source record gives three.",
    "A marker whose note says the per-change hook 'now prevents this kind of drift' stays untouched for three months whether the hook works or not; untouched is evidence of nothing when the hook never fired.",
    "A changelog removal entry with an upstream issue link can be about a third platform; citing it as the record of two other retirements makes the translation story look better documented than it is."
  ],
  "sources": [
    {
      "source": "Exemplar project's measurement record (composed 2026-08-17) and its tree on 2026-10-31",
      "result": "As in the earlier 2026-10-31 record: hook landed 2026-05-16, never fired, unregistered; marker fields as cited; map at 44 entries."
    },
    {
      "url": "https://github.com/Panniantong/Agent-Reach/tree/da5044d26fc6adddb6554d5679c94ac22e76e428",
      "result": "As in the earlier 2026-10-31 record: ten tests, eleven-document environment pin, two API keys, Instagram as the only changelog removal."
    }
  ],
  "documents": {
    "docs-sync.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: 'fifteen months' became three at both sites; rendered-surface-coupling added to the technique list; wall 2 now says 'not from a conversation transcript ... (a last resort, validated against captured real events)'; wall 10 opens 'The walls above govern'. Still owed: the heading counts fifteen walls over sixteen techniques, with no wall for named-duplication-points; wall 15's 'exactly one thing' omits the omitted-capability half the technique states."
    },
    "techniques/source-doc-mapping.md": {
      "disposition": "keep",
      "reason": "1,421 of 4,304 (33.0%), 229 and 131 reproduce from the primary record. The 37-entry figures are the exemplar's dated state; the map has since grown, which the application now records."
    },
    "techniques/same-change-enforcement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'fifteen months' became three at all three sites (heading, lesson 1, closing). Other figures reproduce from the primary record."
    },
    "techniques/coupled-surface-inventory.md": {
      "disposition": "keep",
      "reason": "Report-not-gate for cross-repo surfaces and the reconcile-against-ground-truth rule are sound and consistent with cross-repo-drift-detection's direction argument."
    },
    "techniques/dated-corrections.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the retraction paragraph now says a missing claim is 'never read as withdrawn — the strict form refuses it as a validation error, and the cheaper form below retains it', removing the contradiction with the three-way rule."
    },
    "techniques/doc-rot-detection.md": {
      "disposition": "keep",
      "reason": "Verdict ladder with broken above stale is coherent. The replay-harness protocol is stated as method, and the note already records that it was not run here."
    },
    "techniques/catch-up-markers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'fifteen months' became three at all three sites."
    },
    "techniques/cross-repo-drift-detection.md": {
      "disposition": "keep",
      "reason": "Direction argument, commit-date bound, never-auto-advance, coarse-plus-rank and pair-keyed caching are sound and consistent with the application's measurements."
    },
    "techniques/source-as-data-without-the-app.md": {
      "disposition": "keep",
      "reason": "Scrape versus refused-resolution sandbox and the partial-parse trap are well bounded; the third option is correctly conditioned on regenerating rather than trusting a committed copy."
    },
    "techniques/checked-vs-skipped-denominators.md": {
      "disposition": "keep",
      "reason": "Three states, reason classes, fraction headline, exit code following the denominator and the profile clause are consistent with each other and the laws they cite."
    },
    "techniques/earned-verification-state.md": {
      "disposition": "keep",
      "reason": "The write rule closes the seam the golden path names. Proposition binding has no realization here, which the note states and the text prices honestly."
    },
    "techniques/repair-rides-the-open-page.md": {
      "disposition": "keep",
      "reason": "Exhaustive detection with opportunistic resolution, walk-before-no-op, and the cold tail routed to the marker are coherent with dated-corrections' sparse protocol."
    },
    "techniques/rendered-surface-coupling.md": {
      "disposition": "keep",
      "reason": "Input-digest resolution and both failure directions are sound. The input-set composition is argued, not measured, as the note records."
    },
    "techniques/negative-claims-are-pinned.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the worked example now pins 'a single credential boundary (which environment variables the direct commands read)' across the eleven documents the pinned test lists by kind."
    },
    "techniques/prose-as-an-execution-surface.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'any of five translated landing pages' became 'any of four localized landing pages'."
    },
    "techniques/translations-drift-against-the-product.md": {
      "disposition": "keep",
      "reason": "Two-anchor argument and per-page asymmetry are confirmed by the pinned test file (all four pages for routing, two for the retired names)."
    },
    "techniques/named-duplication-points.md": {
      "disposition": "keep",
      "reason": "Arithmetic is consistent: 8 runs x 12 sites = 96; 47 + 45 = 92; each arm 4 x 12 = 48; six literal sites (five caps + one table). The source tree was not reopened."
    },
    "applications/node--source-doc-mapping.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: a dated correction section records that the hook never fired for any entry (0 of 2,367 edits), is registered in no settings file, and that the map is now 44 entries; the 2026-08-21 table is left as measured and verified_on unchanged."
    },
    "applications/process--catch-up-markers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'not only alive' removed and a dated correction added (replay 2026-08-17 found 0 of 2,367 edits seen since 2026-05-16; hook unregistered), withdrawing the closes-the-loop framing; marker fields re-read and verified_on moved to 2026-10-31."
    },
    "applications/node--dated-corrections.md": {
      "disposition": "reverify",
      "reason": "The collector has changed: WINDOW_DAYS now sits at line 54, the window at 85, the write at 223, and citations are discussed at 216. The 2026-09-22 drop date has passed and the drop was not re-measured."
    },
    "applications/node--cross-repo-drift-detection.md": {
      "disposition": "reverify",
      "reason": "The guide-site repository it reads is not present in this checkout set. Nothing was re-run. Its claims are internally consistent: 116 to 23 keys, 107 of 116 is 92.2%."
    },
    "applications/python--prose-as-an-execution-surface.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: nine tests became ten, three API keys became two, line ranges 153-176 and 177-198; every citation re-opened at da5044d2 and verified_on moved to 2026-10-31."
    },
    "applications/python--negative-claims-are-pinned.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'nine tests' became ten (three sites); the eleven-document list now includes the install guide and the platform reference; ranges 74-124, 116-124, 199-208; verified_on moved to 2026-10-31."
    },
    "applications/python--translations-drift-against-the-product.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the changelog paragraph now says the changelog records neither retirement, cites the actual removal entry (48-51, a third platform) and carries a dated correction of the :59-62 citation; 'never did' became 'at this commit'; verified_on moved to 2026-10-31."
    },
    "applications/node--negative-claims-are-pinned.md": {
      "disposition": "reverify",
      "reason": "The pin record matches the text: four required phrases, one document, a reviewed date and four forbidden phrases. The A/B arms and the eight tests were not re-run."
    },
    "applications/node--prose-as-an-execution-surface.md": {
      "disposition": "reverify",
      "reason": "The desktop remediation lines hold. The one cited landing-page install line (pumper README:112) has moved and is no longer an install line. The fleet-wide credential sweep was not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (after re-verification)

This record follows re-verification of applications: one document changed since the previous record (node--source-doc-mapping, verified_on 2026-08-21 -> 2026-10-31); the other 25 are byte-unchanged and keep their dispositions.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/docs-sync",
  "date": "2026-10-31",
  "baseline": "21e53f34c",
  "digest": "sha256-b2:1591e8093d4e5809",
  "disposition": "clarify",
  "coverage": "All 26 documents decided. One document changed since baseline 0f30830bc's record (commit 2a8351e4d, a verified_on move only) and was re-read in full; its citations were re-opened at personas@22260d77 (map: 44 entries, 28 without flows, 21 without a marketing module, 0 without a doc, 39 onboardingFlows keys; hook 239 lines with the three target types at 8-22; check-doc-map-paths.mjs present; hook registered in no settings file). The other 25 are byte-unchanged and carry their prior dispositions and reasons. Overall stays clarify: the golden path's owed wall and wall-15 wording are unchanged.",
  "counterexamples": [
    "A hook that landed on 2026-05-16 and was replayed on 2026-08-17 cannot have been dead for fifteen months; the date arithmetic in the source record gives three.",
    "A marker whose note says the per-change hook 'now prevents this kind of drift' stays untouched for three months whether the hook works or not; untouched is evidence of nothing when the hook never fired.",
    "A changelog removal entry with an upstream issue link can be about a third platform; citing it as the record of two other retirements makes the translation story look better documented than it is."
  ],
  "sources": [
    {
      "source": "personas@22260d77 (scripts/docs/feature-doc-map.json, scripts/docs/check-doc-sync.mjs, .claude/settings.json)",
      "result": "The application's 2026-10-31 correction figures reproduce: 44 entries, 28/21/0, 39 flow keys, 239-line hook, no settings registration."
    },
    {
      "source": "Exemplar project's measurement record (composed 2026-08-17) and its tree on 2026-10-31",
      "result": "As in the earlier 2026-10-31 record: hook landed 2026-05-16, never fired, unregistered; marker fields as cited; map at 44 entries."
    },
    {
      "url": "https://github.com/Panniantong/Agent-Reach/tree/da5044d26fc6adddb6554d5679c94ac22e76e428",
      "result": "As in the earlier 2026-10-31 record: ten tests, eleven-document environment pin, two API keys, Instagram as the only changelog removal."
    }
  ],
  "documents": {
    "docs-sync.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: 'fifteen months' became three at both sites; rendered-surface-coupling added to the technique list; wall 2 now says 'not from a conversation transcript ... (a last resort, validated against captured real events)'; wall 10 opens 'The walls above govern'. Still owed: the heading counts fifteen walls over sixteen techniques, with no wall for named-duplication-points; wall 15's 'exactly one thing' omits the omitted-capability half the technique states."
    },
    "techniques/source-doc-mapping.md": {
      "disposition": "keep",
      "reason": "1,421 of 4,304 (33.0%), 229 and 131 reproduce from the primary record. The 37-entry figures are the exemplar's dated state; the map has since grown, which the application now records."
    },
    "techniques/same-change-enforcement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'fifteen months' became three at all three sites (heading, lesson 1, closing). Other figures reproduce from the primary record."
    },
    "techniques/coupled-surface-inventory.md": {
      "disposition": "keep",
      "reason": "Report-not-gate for cross-repo surfaces and the reconcile-against-ground-truth rule are sound and consistent with cross-repo-drift-detection's direction argument."
    },
    "techniques/dated-corrections.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the retraction paragraph now says a missing claim is 'never read as withdrawn — the strict form refuses it as a validation error, and the cheaper form below retains it', removing the contradiction with the three-way rule."
    },
    "techniques/doc-rot-detection.md": {
      "disposition": "keep",
      "reason": "Verdict ladder with broken above stale is coherent. The replay-harness protocol is stated as method, and the note already records that it was not run here."
    },
    "techniques/catch-up-markers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'fifteen months' became three at all three sites."
    },
    "techniques/cross-repo-drift-detection.md": {
      "disposition": "keep",
      "reason": "Direction argument, commit-date bound, never-auto-advance, coarse-plus-rank and pair-keyed caching are sound and consistent with the application's measurements."
    },
    "techniques/source-as-data-without-the-app.md": {
      "disposition": "keep",
      "reason": "Scrape versus refused-resolution sandbox and the partial-parse trap are well bounded; the third option is correctly conditioned on regenerating rather than trusting a committed copy."
    },
    "techniques/checked-vs-skipped-denominators.md": {
      "disposition": "keep",
      "reason": "Three states, reason classes, fraction headline, exit code following the denominator and the profile clause are consistent with each other and the laws they cite."
    },
    "techniques/earned-verification-state.md": {
      "disposition": "keep",
      "reason": "The write rule closes the seam the golden path names. Proposition binding has no realization here, which the note states and the text prices honestly."
    },
    "techniques/repair-rides-the-open-page.md": {
      "disposition": "keep",
      "reason": "Exhaustive detection with opportunistic resolution, walk-before-no-op, and the cold tail routed to the marker are coherent with dated-corrections' sparse protocol."
    },
    "techniques/rendered-surface-coupling.md": {
      "disposition": "keep",
      "reason": "Input-digest resolution and both failure directions are sound. The input-set composition is argued, not measured, as the note records."
    },
    "techniques/negative-claims-are-pinned.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the worked example now pins 'a single credential boundary (which environment variables the direct commands read)' across the eleven documents the pinned test lists by kind."
    },
    "techniques/prose-as-an-execution-surface.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'any of five translated landing pages' became 'any of four localized landing pages'."
    },
    "techniques/translations-drift-against-the-product.md": {
      "disposition": "keep",
      "reason": "Two-anchor argument and per-page asymmetry are confirmed by the pinned test file (all four pages for routing, two for the retired names)."
    },
    "techniques/named-duplication-points.md": {
      "disposition": "keep",
      "reason": "Arithmetic is consistent: 8 runs x 12 sites = 96; 47 + 45 = 92; each arm 4 x 12 = 48; six literal sites (five caps + one table). The source tree was not reopened."
    },
    "applications/node--source-doc-mapping.md": {
      "disposition": "clarify",
      "reason": "re-verified 2026-10-31 against personas@22260d77: the dated correction's figures hold, and verified_on moved to 2026-10-31. That move leaves the document internally inconsistent: the heading 'Every measurement the technique cites still holds' over the 2026-08-21 table (37 entries, 20/13) and the closing section's present-tense 'There are 37 entries' now sit under a verification date at which the map has 44. Either date those passages as the 2026-08-21 state or restore verified_on, which the previous record kept on purpose."
    },
    "applications/process--catch-up-markers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'not only alive' removed and a dated correction added (replay 2026-08-17 found 0 of 2,367 edits seen since 2026-05-16; hook unregistered), withdrawing the closes-the-loop framing; marker fields re-read and verified_on moved to 2026-10-31."
    },
    "applications/node--dated-corrections.md": {
      "disposition": "reverify",
      "reason": "The collector has changed: WINDOW_DAYS now sits at line 54, the window at 85, the write at 223, and citations are discussed at 216. The 2026-09-22 drop date has passed and the drop was not re-measured."
    },
    "applications/node--cross-repo-drift-detection.md": {
      "disposition": "reverify",
      "reason": "The guide-site repository it reads is not present in this checkout set. Nothing was re-run. Its claims are internally consistent: 116 to 23 keys, 107 of 116 is 92.2%."
    },
    "applications/python--prose-as-an-execution-surface.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: nine tests became ten, three API keys became two, line ranges 153-176 and 177-198; every citation re-opened at da5044d2 and verified_on moved to 2026-10-31."
    },
    "applications/python--negative-claims-are-pinned.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'nine tests' became ten (three sites); the eleven-document list now includes the install guide and the platform reference; ranges 74-124, 116-124, 199-208; verified_on moved to 2026-10-31."
    },
    "applications/python--translations-drift-against-the-product.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the changelog paragraph now says the changelog records neither retirement, cites the actual removal entry (48-51, a third platform) and carries a dated correction of the :59-62 citation; 'never did' became 'at this commit'; verified_on moved to 2026-10-31."
    },
    "applications/node--negative-claims-are-pinned.md": {
      "disposition": "reverify",
      "reason": "The pin record matches the text: four required phrases, one document, a reviewed date and four forbidden phrases. The A/B arms and the eight tests were not re-run."
    },
    "applications/node--prose-as-an-execution-surface.md": {
      "disposition": "reverify",
      "reason": "The desktop remediation lines hold. The one cited landing-page install line (pumper README:112) has moved and is no longer an install line. The fleet-wide credential sweep was not re-run."
    }
  }
}
```

## Architecture review - 2026-10-31 (after application rewrite)

This record follows the rewrite of node--source-doc-mapping against personas@`22260d77`: the body now describes the 44-entry map and its current guards, and the 2026-08-21 table and 37-entry sentences sit under a dated History heading. It moves from `clarify` to `keep`; the golden path stays `clarify`, so the subject stays `clarify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/docs-sync",
  "date": "2026-10-31",
  "baseline": "a374d84e3",
  "digest": "sha256-b2:c2b893562ca55eb8",
  "disposition": "clarify",
  "coverage": "All documents decided. The rewritten application was read in full; the map was re-counted with node at personas@22260d77 and check-doc-map-paths.mjs was run read-only (exit 0, 84 nodes against 17346 files); every hook and guard anchor was printed. The other documents are byte-identical to the previous record (git diff against 21e53f34c shows only the rewrite) and carry its dispositions.",
  "trigger": "The previous record marked node--source-doc-mapping clarify; its body was rewritten, staling that record.",
  "counterexamples": [
    "A hook that landed on 2026-05-16 and was replayed on 2026-08-17 cannot have been dead for fifteen months; the date arithmetic in the source record gives three.",
    "A marker whose note says the per-change hook 'now prevents this kind of drift' stays untouched for three months whether the hook works or not; untouched is evidence of nothing when the hook never fired.",
    "A changelog removal entry with an upstream issue link can be about a third platform; citing it as the record of two other retirements makes the translation story look better documented than it is."
  ],
  "sources": [
    {
      "source": "personas@22260d77 (scripts/docs/feature-doc-map.json, scripts/docs/check-doc-sync.mjs, .claude/settings.json)",
      "result": "The application's 2026-10-31 correction figures reproduce: 44 entries, 28/21/0, 39 flow keys, 239-line hook, no settings registration."
    },
    {
      "source": "Exemplar project's measurement record (composed 2026-08-17) and its tree on 2026-10-31",
      "result": "As in the earlier 2026-10-31 record: hook landed 2026-05-16, never fired, unregistered; marker fields as cited; map at 44 entries."
    },
    {
      "url": "https://github.com/Panniantong/Agent-Reach/tree/da5044d26fc6adddb6554d5679c94ac22e76e428",
      "result": "As in the earlier 2026-10-31 record: ten tests, eleven-document environment pin, two API keys, Instagram as the only changelog removal."
    },
    {
      "source": "personas at 22260d77 (read; check-doc-map-paths.mjs run, the hook not run)",
      "result": "feature-doc-map.json: 44 entries, 28 without onboardingFlows, 21 without marketingModule, 0 without doc; onboardingFlows 39 keys, 38 flows, 36 referenced, none unknown; :2 _comment says marketingModule never exits 2 while check-doc-sync.mjs:168-172 and :236 exit 2 on it; check-doc-sync.mjs:98 turn boundary, :131-135 exit 0 on unreadable map; no settings file registers the hook; package.json:142 check:doc-map inside the check chain."
    }
  ],
  "documents": {
    "docs-sync.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: 'fifteen months' became three at both sites; rendered-surface-coupling added to the technique list; wall 2 now says 'not from a conversation transcript ... (a last resort, validated against captured real events)'; wall 10 opens 'The walls above govern'. Still owed: the heading counts fifteen walls over sixteen techniques, with no wall for named-duplication-points; wall 15's 'exactly one thing' omits the omitted-capability half the technique states."
    },
    "techniques/source-doc-mapping.md": {
      "disposition": "keep",
      "reason": "1,421 of 4,304 (33.0%), 229 and 131 reproduce from the primary record. The 37-entry figures are the exemplar's dated state; the map has since grown, which the application now records."
    },
    "techniques/same-change-enforcement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'fifteen months' became three at all three sites (heading, lesson 1, closing). Other figures reproduce from the primary record."
    },
    "techniques/coupled-surface-inventory.md": {
      "disposition": "keep",
      "reason": "Report-not-gate for cross-repo surfaces and the reconcile-against-ground-truth rule are sound and consistent with cross-repo-drift-detection's direction argument."
    },
    "techniques/dated-corrections.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the retraction paragraph now says a missing claim is 'never read as withdrawn — the strict form refuses it as a validation error, and the cheaper form below retains it', removing the contradiction with the three-way rule."
    },
    "techniques/doc-rot-detection.md": {
      "disposition": "keep",
      "reason": "Verdict ladder with broken above stale is coherent. The replay-harness protocol is stated as method, and the note already records that it was not run here."
    },
    "techniques/catch-up-markers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'fifteen months' became three at all three sites."
    },
    "techniques/cross-repo-drift-detection.md": {
      "disposition": "keep",
      "reason": "Direction argument, commit-date bound, never-auto-advance, coarse-plus-rank and pair-keyed caching are sound and consistent with the application's measurements."
    },
    "techniques/source-as-data-without-the-app.md": {
      "disposition": "keep",
      "reason": "Scrape versus refused-resolution sandbox and the partial-parse trap are well bounded; the third option is correctly conditioned on regenerating rather than trusting a committed copy."
    },
    "techniques/checked-vs-skipped-denominators.md": {
      "disposition": "keep",
      "reason": "Three states, reason classes, fraction headline, exit code following the denominator and the profile clause are consistent with each other and the laws they cite."
    },
    "techniques/earned-verification-state.md": {
      "disposition": "keep",
      "reason": "The write rule closes the seam the golden path names. Proposition binding has no realization here, which the note states and the text prices honestly."
    },
    "techniques/repair-rides-the-open-page.md": {
      "disposition": "keep",
      "reason": "Exhaustive detection with opportunistic resolution, walk-before-no-op, and the cold tail routed to the marker are coherent with dated-corrections' sparse protocol."
    },
    "techniques/rendered-surface-coupling.md": {
      "disposition": "keep",
      "reason": "Input-digest resolution and both failure directions are sound. The input-set composition is argued, not measured, as the note records."
    },
    "techniques/negative-claims-are-pinned.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the worked example now pins 'a single credential boundary (which environment variables the direct commands read)' across the eleven documents the pinned test lists by kind."
    },
    "techniques/prose-as-an-execution-surface.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'any of five translated landing pages' became 'any of four localized landing pages'."
    },
    "techniques/translations-drift-against-the-product.md": {
      "disposition": "keep",
      "reason": "Two-anchor argument and per-page asymmetry are confirmed by the pinned test file (all four pages for routing, two for the retired names)."
    },
    "techniques/named-duplication-points.md": {
      "disposition": "keep",
      "reason": "Arithmetic is consistent: 8 runs x 12 sites = 96; 47 + 45 = 92; each arm 4 x 12 = 48; six literal sites (five caps + one table). The source tree was not reopened."
    },
    "applications/node--source-doc-mapping.md": {
      "disposition": "keep",
      "reason": "rewritten 2026-10-31 against personas@22260d77: body now states the current map (44 entries; 28 no flows, 21 no marketing module, 0 without doc; 39-key registry with 38 flows, 36 referenced), the path guard as a step of npm run check with its fail-loud floors, and five present gaps (hook registered nowhere and its turn boundary at :98, fail-open map read at :131-135, the map comment contradicting the hook on marketingModule exits, coarse docs/features satisfaction, no coverage gate); the 2026-08-21 table, the 37-entry wording and the 2026-08-17 replay moved under History unaltered."
    },
    "applications/process--catch-up-markers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'not only alive' removed and a dated correction added (replay 2026-08-17 found 0 of 2,367 edits seen since 2026-05-16; hook unregistered), withdrawing the closes-the-loop framing; marker fields re-read and verified_on moved to 2026-10-31."
    },
    "applications/node--dated-corrections.md": {
      "disposition": "reverify",
      "reason": "The collector has changed: WINDOW_DAYS now sits at line 54, the window at 85, the write at 223, and citations are discussed at 216. The 2026-09-22 drop date has passed and the drop was not re-measured."
    },
    "applications/node--cross-repo-drift-detection.md": {
      "disposition": "reverify",
      "reason": "The guide-site repository it reads is not present in this checkout set. Nothing was re-run. Its claims are internally consistent: 116 to 23 keys, 107 of 116 is 92.2%."
    },
    "applications/python--prose-as-an-execution-surface.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: nine tests became ten, three API keys became two, line ranges 153-176 and 177-198; every citation re-opened at da5044d2 and verified_on moved to 2026-10-31."
    },
    "applications/python--negative-claims-are-pinned.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'nine tests' became ten (three sites); the eleven-document list now includes the install guide and the platform reference; ranges 74-124, 116-124, 199-208; verified_on moved to 2026-10-31."
    },
    "applications/python--translations-drift-against-the-product.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the changelog paragraph now says the changelog records neither retirement, cites the actual removal entry (48-51, a third platform) and carries a dated correction of the :59-62 citation; 'never did' became 'at this commit'; verified_on moved to 2026-10-31."
    },
    "applications/node--negative-claims-are-pinned.md": {
      "disposition": "reverify",
      "reason": "The pin record matches the text: four required phrases, one document, a reviewed date and four forbidden phrases. The A/B arms and the eight tests were not re-run."
    },
    "applications/node--prose-as-an-execution-surface.md": {
      "disposition": "reverify",
      "reason": "The desktop remediation lines hold. The one cited landing-page install line (pumper README:112) has moved and is no longer an install line. The fleet-wide credential sweep was not re-run."
    }
  }
}
```
