---
subject: conformance-checking
domain: software-engineering
last_touched: 2026-09-07
---
# conformance-checking

Coverage notes for `software-engineering/engineering-assessment/maturity-and-conformance/conformance-checking`.

## 2026-09-06 — `harbor-0906` (intake, `github:av/harbor` @ `4c20a82`)

Landed two techniques — `inline-predicate-rung-inference` (9th) and
`rule-registry-enumerated-fixtures` (10th) — plus two source-tree applications.

**Both sit against `declared-then-proven`'s assumption of two artifacts.** That
technique's proof ladder (presence / shape / execution) assumes a declaration
the project writes and a checker somebody else wrote, with the rung assigned
deliberately by the checker's author. The source collapses the pair: every
claim in a 593-entry specification carries its own inline shell predicate, so
there is no checker to drift into a transcriber — the failure `declared-then-proven`
exists to prevent is structurally removed, and the rung choice moves to the
claim's author with nowhere to record it.

The finding is measured rather than argued, and the measurement is the
technique's own subject: 543 of 593 claims (91.6%) carry a command, but
classified by the binary each actually **invokes**, 62.8% are text matches,
16.0% parse-and-assert, and only 20.8% execution. The headline coverage number
answers "has a command"; it is read as "is proven"; the two are five times
apart. The first classifier written for this got it wrong in the flattering
direction — matching a binary name anywhere in the command string rather than
at invocation position reported execution at 40% — and that error is now in the
technique as its instrument warning, because a rung classifier is written by
someone who already believes the spec is well proven.

`rule-registry-enumerated-fixtures` extends `fixture-repo-testing` downward.
That technique pairs fixtures at repository granularity ("one per clause where
affordable") and mentions the per-rule fixture only in a closing clause, as the
fallback when a live path cannot be mutated. For a checker that is a **registry
of independent rules** rather than one program, the fallback is the primary
form and can be made structural: pair per rule id, enumerate the pairing from
the registry, and an unfixtured rule then fails discovery instead of review.

**The boundary was witnessed, not hypothesized.** The source's own suite has
four passes; the enumeration covers the declarative one, and a rule implemented
in code in another pass is bridged by a hand-maintained map inside the harness —
precisely the hole the enumeration was built to close, reopened one entry at a
time. It also produces a false reading in the other direction, which caught
this run first: the fixture directories show an unbroken numeric sequence with
one id missing, and the natural inference (a retired rule) is wrong.

Placement was not contested. Both techniques answer this subject's stated
question — what an executable verdict about a repository may claim — and
neither belongs in `quality-gates`, whose audience is the author who just broke
the build rather than an owner being assessed.

Applied: `bash--inline-predicate-rung-inference` (experiment, `better`,
ab-paired, 1.9x arm difference on the execution share) and
`deno--rule-registry-enumerated-fixtures` (simulation, `unmeasurable`,
structural-only — the instrument that would make it measurable is named, and it
is the union enumeration the technique recommends).

Shipped downstream: the second technique's seam in a managed desktop project —
22 gate scripts reachable from its `check:*` registry, 2 with a negative
control — now carries an enumerating ratchet and its own self-test.

## 2026-08-31 — `whatwg-html-0831` (intake, `github:whatwg/html` @ `778afd9`)

Landed `declared-deviation-register` (7th technique) plus a golden-path section,
"Some failures are decisions, and they need their own class", and one application
(`rust--declared-deviation-register`, simulation, `better`).

**Found by a corpus-wide empty, not by a gap in this subject.** `research-map`
returned `PRIOR ART: none` for `"intentional nonconformance"` and for
`"why we deviate"` across 341 subjects in 8 bundles. The method warns that a
near-empty is more dangerous than an empty, so the four nearest subjects were
opened before believing it: `vendored-fork-ledger` in `supply-chain` covers
copying and patching somebody's code (the guards *end*), `standard-versus-consumer-split`
in `knowledge-registry` covers what publishes versus what stays local,
`ipc-contract` explicitly disclaims public-API economics, and
`generated-from-provenance` in `repo-manifest-standard` reserves manifest space
for "intent, exceptions, deliberate deviations and their reasons" as *human
fields a synthesizer must not overwrite* — which is a write-protection rule, not
a publication rule. None of them holds this. The empty was real.

The home was contested and the argument is worth keeping. This subject's own
boundary statement pushes contract *declaration* to `repo-manifest-standard`
("declared there, proven here"), which reads as an exclusion. It is not, because
the register's function is arithmetic rather than declarative: an accepted
deviation is a **third finding class** in a checker's output, never a suppression
(which inflates the pass ratio by exactly the number of failures the team
accepted — the incentive backwards) and never an ordinary failure (which
calibrates a team to a permanent non-zero floor, after which nothing new is
visible). That consequence lands directly on `pass-ratio-comparability`'s stated
concern, which is why it belongs here and not next door.

The golden path's four outcome kinds — hard failure, failure, warning, unable to
check — sort findings by what the checker *knew*. The fifth sorts by what
somebody *decided*, and the new section says so without disturbing the ladder.

Shared root with `fabrication-economics`, landed the same run into
`quality-gates`: both are a true, known violation that must be declared in band
and must not be reported as news. **They were deliberately not merged**, against
the standing preference for synthesis, because the decision rules do not overlap
— an author who could not comply versus a maintainer who chose not to, with
different failure modes (an undetectable fabrication; a repair that reintroduces
the avoided problem) and different required fields. The discriminator is stated
in both files.

Uncontended on the board for the whole run.


## 2026-09-02 - intake (dora, run intake-dora-0902)

`declared-deviation-register` gained "Key the entry by the finding's
identity, never by its position" and cites `identity-survives-reuse`: a
waiver keyed by file:line:column is an index-based key that un-matches on
any unrelated edit above the site, and the accepted finding then
resurfaces as a regression with no visible cause. Key by rule plus symbol
or mutation name; where a position cannot be avoided, a non-matching entry
is reported loudly, never dropped. Source: a mutation-testing waiver
written as a line-pinned regex, caught by an adversarial review and
rewritten to key on the mutation's name. New application
`node--declared-deviation-register` (simulation, better, structural-only):
the fleet's ratchets already key by identity, and the application says
what that keying does not provide (no site, no motivation - a ratchet with
honest keys, not a register).

## 2026-09-03 - intake run `intake-boa-0903` (source: a language engine's conformance tester)

New technique **`edition-stratified-conformance`**, the eighth. `pass-ratio-comparability`
named the force ("a new standard version moves every score... two different measurements
sharing an axis") and stopped at refusal; the source showed the mechanism for a
specification that accumulates editions with an upstream suite that grows monthly: pin the
suite's revision beside the ignored list (reason classes: unimplemented / pending /
deliberate), classify each check by the maximum of its features' minimum editions from
one authoritative map and report cumulatively so older editions hold still, diff finding
sets by identity (newly passing, newly failing, new crashes, fixed crashes) with the
crash as its own class at the hard-failure rung, and post the diff beside the change
against a trunk baseline stored outside the repository, with the gate decision human
except for a named new crash. Applications: `rust--edition-stratified-conformance` (the
source tree, every move anchored) and `node--edition-stratified-conformance` (**code,
better, ab-paired**): the fleet's maturity index keyed its outcomes lane by rubric version
and its regression-alert lane by nothing - a rubric bump would have paged every org at
once - and a nine-line guard moved dispatches 1 -> 0 under the file's own suite. Lead
banked: spec-step comments as a per-line deviation register (`declared-then-proven`'s
neighbour), return condition a second stepped-specification implementation.

## 2026-09-04 - `gamedev-res` (intake, `github:Kavex/GameDev-Resources` @ `f7c89aa`)

No technique. One application - `applications/process--checker-false-positive-discipline.md`
- and it is a **confirmation**, which is the outcome worth recording.

`checker-false-positive-discipline` ends its decision rules with a warning it did
not evidence: *"Provide an exemption path, and make exemptions expire. Permanent
silent suppressions recreate the false-pass problem with paperwork."* A twelve-year
public curated index built the exemption path exactly as prescribed - declared in
the repository, a stated reason per entry in its own commit, host-scoped rather
than check-scoped, reviewable in one place - and omitted only expiry. Measurement:
**two of nine exempted hosts have no remaining row in the checked file**, the
clearer one exempted in 2020 for a service shut down in 2016 and still present
three years after its last link was removed.

The subject predicted the failure and the tree supplies the number. Also recorded:
one 2016 commit performs this technique's whole dispute procedure by hand - removes
a link that answered 500, exempts two hosts that answered 403, same change, status
code as the sole discriminator. The maintainer could always tell a true finding
from a narrowable detector. What had no clock on it was the artifact that telling
them apart produced.

This run's own instrument then reproduced the subject's canonical false positive:
a URL regex over raw markdown reported 6 dead citations, of which 5 were template
literals and regex fragments inside fenced code blocks - *"never pattern-match a
language you have a parser for"*, in this run, before the commit. Narrowed, not
deleted.

## 2026-09-07 — `unstorage` (intake, `github:unjs/unstorage` @ `7f773be1`)

Landed one technique — `derived-expectation-needs-an-evidence-floor` (11th) —
plus a source-tree application against this registry's own gates.

**It sits beside `declared-then-proven`'s ladder rather than on it.** Presence,
shape and execution all assume the declaration's subject can be reached at
check time. The source's dependency manifest cannot be: it describes optional
peers deliberately not installed, so nothing loads, runs or stats, and the only
evidence in the room is the source text that imports them. The check derives
the expected manifest from that text and diffs. That is a fourth shape, and the
one that fails toward silence — when the derivation stops finding anything the
superset assertion gets *easier* to satisfy.

Measured on the source tree, two arms: the regex as shipped derives 24
dependency facts across 33 drivers (14 legitimately empty) and 33 pass;
renaming the `importLib` helper derives 0 and 33 still pass, with a
byte-identical report. The legitimate empty cases are what make the broken
empty case invisible, and they are unavoidable — deriving rather than declaring
is the right call precisely when most members have nothing to declare.

**The boundary against `negative-control-tests` is worth keeping straight**, and
it is now written into both files: that technique proves one case's assertion
can fire, and here the per-case control passes while the derivation shared by
every case is dead. The control exercised the arm that was never in danger.
`rule-registry-enumerated-fixtures` is the closer relative — same move, harness
asserting what no individual case can see — and the two now cite each other.

**Applied to this registry, `better`, shipped.** Three gates here derive
evidence by pattern-matching source; `check-citations.mjs` already carried the
floor and its own probe controls, arrived at independently, which is this
technique's strongest corroboration. The usage and signals gates had neither and
are the harder must-not-match shape. Four arms on a planted absolute path:
drifted patterns ship the leak at exit 0 with the lane reporting OK; the added
control refuses and names the dead pattern, at no false-positive cost on the
healthy path.

Open for a later run: the technique's per-case clause (separate *derived
nothing* from *derived and matched*) is unexercised — both shipped gates have a
single population, so only the citation gate could demonstrate it.

## Architecture review - 2026-10-31

First architecture review, against `10247cc6c`. All 23 documents read in full. The
technique layer is internally sound and its neighbours are drawn cleanly; the
clarify items are five internal inconsistencies (a miscount, two outcome-ladder
contradictions, a ratio quoted against the wrong baseline, a boolean write-back
read as conformance) and two source-wording corrections in applications, each
checked against the document or a primary source opened this run. Private-tree
applications were not re-run and keep `reverify`. No verification date was
refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/conformance-checking",
  "date": "2026-10-31",
  "baseline": "10247cc6c",
  "digest": "sha256-b2:58a3b7c0b9efb42c",
  "disposition": "clarify",
  "coverage": "All 23 current documents (golden path, 11 techniques, 11 applications) read in full. Arithmetic in inline-predicate-rung-inference and its bash application recomputed. Primary sources opened: the JSON-RPC 2.0 specification section 6, the MCP 2025-06-18 changelog, the boa test262 configuration at the pinned commit, a 2025 Scorecard study, and secondary accounts of the Google and Coverity false-positive bands. Not evaluated: every private or managed tree behind the node and process applications, the harbor and GameDev-Resources trees, and the remaining boa anchors beyond the configuration file.",
  "counterexamples": [
    "A crashed conformance test is recoverable and the run continues past it, so by finding-severity-ladder's own test (harm already irreversible when observed) it is not a hard failure, even though it may legitimately block a change on its own.",
    "A classifier that reads 40% execution against a resolved 20.8% overstated by 1.9x; quoting 5.5x compares against an intermediate 7.2% that was itself wrong.",
    "A write-back that flips a bare verified boolean keeps a stale true from outliving a broken command, yet still carries none of the provenance (run, time, standard version, rung) claim-write-back requires of a stamp.",
    "JSON-RPC 2.0 section 6 says a server 'should respond with an Array'; a server that answers a batch with one error response is non-conforming to a lower-case should, not to a MUST.",
    "A Scorecard-style check can stop false-passing an absent surface by reporting inconclusive (-1) rather than a score, which is the unable-to-check outcome this subject prescribes."
  ],
  "sources": [
    {
      "url": "https://www.jsonrpc.org/specification",
      "result": "Section 6: 'The Client MAY send an Array filled with Request objects'; 'The Server should respond with an Array containing the corresponding Response objects'. Supports the batch finding in rust--declared-deviation-register but refutes its wording 'requires a server to accept'."
    },
    {
      "url": "https://modelcontextprotocol.io/specification/2025-06-18/changelog",
      "result": "Major change 1: 'Remove support for JSON-RPC batching (PR #416)'. Confirms and sharpens the application's 'the protocol layered on top has been moving away from it'."
    },
    {
      "url": "https://raw.githubusercontent.com/boa-dev/boa/665f03924a54e5162be227e7e909612e36f6e35a/test262_config.toml",
      "result": "Opens with commit = \"d86b2294eb0a17eaa281ff12c73c473ec864c72f\"; ignored features grouped under '### Unimplemented features:', '### Pending proposals' and '### Non-standard'. Confirms the pin; the application names only two of the three reason classes."
    },
    {
      "url": "https://arxiv.org/pdf/2504.14026",
      "result": "Scorecard returns -1 when evidence is absent: 'for Dangerous-Workflow, -1 means no GitHub Actions workflows were found'. Consistent with checker-false-positive-discipline's workflow-level false-pass family as a past behaviour; the passage on the older full-marks behaviour was reported by search but not read verbatim."
    },
    {
      "url": "https://6826.csail.mit.edu/2020/papers/google-analysis-cacm.pdf",
      "result": "Via search summary: code-review checks must have under 10% effective false positives. Supports the one-in-ten band; the one-in-five outer limit traces only to a secondary account of the Coverity CACM 2010 paper (below 20%). The techniques phrase both as 'roughly', so kept."
    }
  ],
  "documents": {
    "conformance-checking.md": {
      "disposition": "keep",
      "reason": "Neighbours drawn precisely; every section points at an owning technique. The 'fifth' outcome (accepted deviation) counts against the golden path's own four; finding-severity-ladder also names not-applicable as a fifth state, a naming overlap but not a contradiction."
    },
    "techniques/declared-then-proven.md": {
      "disposition": "keep",
      "reason": "Ladder, self-declared-flag rule, execution-as-untrusted-code and placeholder rule are coherent and match the applications."
    },
    "techniques/finding-severity-ladder.md": {
      "disposition": "keep",
      "reason": "Consequence-based severity and unable-to-check exclusion are sound. The 'roughly one-in-five' band is supported only secondhand but is stated as approximate guidance."
    },
    "techniques/pass-ratio-comparability.md": {
      "disposition": "keep",
      "reason": "Denominator rules and refusal rules are correct and consistent with the process application."
    },
    "techniques/claim-write-back.md": {
      "disposition": "clarify",
      "reason": "'three additional rules' introduces a list of four bullets (credential scope, commit ordering, number validation, stated skip). Change to four."
    },
    "techniques/checker-false-positive-discipline.md": {
      "disposition": "keep",
      "reason": "Mechanical causes and exemption-expiry rule hold; the process application confirms the expiry warning. Scorecard workflow false-pass is a past behaviour, consistent with the study opened."
    },
    "techniques/fixture-repo-testing.md": {
      "disposition": "keep",
      "reason": "Three shapes, ran-check-count assertion and isolation rules are sound."
    },
    "techniques/declared-deviation-register.md": {
      "disposition": "clarify",
      "reason": "'produces a third outcome, beside the four in this subject's ladder' is self-contradictory; the golden path calls the same class the fifth. Reword to name it its own outcome beside the four."
    },
    "techniques/edition-stratified-conformance.md": {
      "disposition": "clarify",
      "reason": "Places a crash 'at the hard-failure rung' as 'already irreversible when observed', contradicting finding-severity-ladder (irreversible harm, ideally one class, short-circuits, no percentage) while this technique keeps rendering the percentage beside it. State that a crash is its own class, not a hard failure, and keep it as the one regression that may block alone."
    },
    "techniques/inline-predicate-rung-inference.md": {
      "disposition": "clarify",
      "reason": "'inflated ... by 5.5x' compares 40% with the intermediate 7.2%; against the resolved 20.8% it is 1.9x, which is what the bash application reports. Also 'five times apart' is 91.6% vs 19.1% of the whole spec (4.8x); say roughly."
    },
    "techniques/rule-registry-enumerated-fixtures.md": {
      "disposition": "keep",
      "reason": "Union-enumeration remedy and severity/fixture separation are sound; boundary witnessed by the deno application."
    },
    "techniques/derived-expectation-needs-an-evidence-floor.md": {
      "disposition": "keep",
      "reason": "Population-level floor and the boundary against negative-control-tests are coherent."
    },
    "applications/node--edition-stratified-conformance.md": {
      "disposition": "reverify",
      "reason": "Paired arms internally consistent; the private tree and its suite were not re-run."
    },
    "applications/node--derived-expectation-needs-an-evidence-floor.md": {
      "disposition": "reverify",
      "reason": "Four-arm table consistent and the incompleteness limit is stated; gates not re-run."
    },
    "applications/node--declared-deviation-register.md": {
      "disposition": "reverify",
      "reason": "Honest structural-only account; tree not reopened."
    },
    "applications/node--declared-then-proven.md": {
      "disposition": "clarify",
      "reason": "Write-back flips a bare verified boolean, which claim-write-back says a stamp must not be (no run, time, version or rung). The application reads it as confirmation without naming the deviation. Add one sentence; source anchors otherwise not reopened."
    },
    "applications/deno--rule-registry-enumerated-fixtures.md": {
      "disposition": "reverify",
      "reason": "Structural-only by stated reason; the source tree was not reopened."
    },
    "applications/rust--declared-deviation-register.md": {
      "disposition": "clarify",
      "reason": "'Section 6 ... requires a server to accept an array' overstates the spec's lower-case 'should respond with an Array'. 'Moving away from it' can cite the MCP 2025-06-18 removal of batching. Remaining anchors at e7fbae7bb not reopened."
    },
    "applications/node--fixture-repo-testing.md": {
      "disposition": "reverify",
      "reason": "Consistent with the technique and names the missing fresh-install fixture; tree not reopened."
    },
    "applications/process--pass-ratio-comparability.md": {
      "disposition": "reverify",
      "reason": "Deviation (no unable-to-check bucket) stated correctly; tree not reopened."
    },
    "applications/process--checker-false-positive-discipline.md": {
      "disposition": "reverify",
      "reason": "Measurement and limits clearly stated; the public index was not re-joined."
    },
    "applications/rust--edition-stratified-conformance.md": {
      "disposition": "clarify",
      "reason": "Config pin confirmed at the pinned commit, but the ignored list has three reason-class headings ('Non-standard' too), and the application names two. Add it; other anchors not reopened."
    },
    "applications/bash--inline-predicate-rung-inference.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed and consistent (57.5% = 341/593; 1.9x = 40/20.8); the tree was not re-classified."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the seven clarify items the record above named, against `10247cc6c`.
Four are technique-text consistency fixes, three are application wording
corrections checked against the JSON-RPC 2.0 specification, the MCP 2025-06-18
changelog and the boa configuration at its pinned commit. The applications that
were not reopened keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/conformance-checking",
  "date": "2026-10-31",
  "baseline": "10247cc6c",
  "digest": "sha256-b2:c3359cb777744ccf",
  "disposition": "reverify",
  "coverage": "All 23 documents decided. The seven clarify items of the first 2026-10-31 record were applied as minimal in-voice edits and the edited passages re-read; the other 16 documents are byte-unchanged and keep their dispositions. Sources as in the first record, all opened this run. No private tree was re-run and no verified_on date was moved.",
  "counterexamples": [
    "A crashed conformance test is recoverable and the run continues past it, so by finding-severity-ladder's own test (harm already irreversible when observed) it is not a hard failure, even though it may legitimately block a change on its own.",
    "A classifier that reads 40% execution against a resolved 20.8% overstated by 1.9x; quoting 5.5x compares against an intermediate 7.2% that was itself wrong.",
    "A write-back that flips a bare verified boolean keeps a stale true from outliving a broken command, yet still carries none of the provenance (run, time, standard version, rung) claim-write-back requires of a stamp.",
    "JSON-RPC 2.0 section 6 says a server 'should respond with an Array'; a server that answers a batch with one error response is non-conforming to a lower-case should, not to a MUST.",
    "A Scorecard-style check can stop false-passing an absent surface by reporting inconclusive (-1) rather than a score, which is the unable-to-check outcome this subject prescribes."
  ],
  "sources": [
    {
      "url": "https://www.jsonrpc.org/specification",
      "result": "Section 6: 'The Client MAY send an Array filled with Request objects'; 'The Server should respond with an Array containing the corresponding Response objects'. Supports the batch finding in rust--declared-deviation-register but refutes its wording 'requires a server to accept'."
    },
    {
      "url": "https://modelcontextprotocol.io/specification/2025-06-18/changelog",
      "result": "Major change 1: 'Remove support for JSON-RPC batching (PR #416)'. Confirms and sharpens the application's 'the protocol layered on top has been moving away from it'."
    },
    {
      "url": "https://raw.githubusercontent.com/boa-dev/boa/665f03924a54e5162be227e7e909612e36f6e35a/test262_config.toml",
      "result": "Opens with commit = \"d86b2294eb0a17eaa281ff12c73c473ec864c72f\"; ignored features grouped under '### Unimplemented features:', '### Pending proposals' and '### Non-standard'. Confirms the pin; the application names only two of the three reason classes."
    },
    {
      "url": "https://arxiv.org/pdf/2504.14026",
      "result": "Scorecard returns -1 when evidence is absent: 'for Dangerous-Workflow, -1 means no GitHub Actions workflows were found'. Consistent with checker-false-positive-discipline's workflow-level false-pass family as a past behaviour; the passage on the older full-marks behaviour was reported by search but not read verbatim."
    },
    {
      "url": "https://6826.csail.mit.edu/2020/papers/google-analysis-cacm.pdf",
      "result": "Via search summary: code-review checks must have under 10% effective false positives. Supports the one-in-ten band; the one-in-five outer limit traces only to a secondary account of the Coverity CACM 2010 paper (below 20%). The techniques phrase both as 'roughly', so kept."
    }
  ],
  "documents": {
    "conformance-checking.md": {
      "disposition": "keep",
      "reason": "Neighbours drawn precisely; every section points at an owning technique. The 'fifth' outcome (accepted deviation) counts against the golden path's own four; finding-severity-ladder also names not-applicable as a fifth state, a naming overlap but not a contradiction."
    },
    "techniques/declared-then-proven.md": {
      "disposition": "keep",
      "reason": "Ladder, self-declared-flag rule, execution-as-untrusted-code and placeholder rule are coherent and match the applications."
    },
    "techniques/finding-severity-ladder.md": {
      "disposition": "keep",
      "reason": "Consequence-based severity and unable-to-check exclusion are sound. The 'roughly one-in-five' band is supported only secondhand but is stated as approximate guidance."
    },
    "techniques/pass-ratio-comparability.md": {
      "disposition": "keep",
      "reason": "Denominator rules and refusal rules are correct and consistent with the process application."
    },
    "techniques/claim-write-back.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"three additional rules\" now reads \"four additional rules\", matching the four bullets."
    },
    "techniques/checker-false-positive-discipline.md": {
      "disposition": "keep",
      "reason": "Mechanical causes and exemption-expiry rule hold; the process application confirms the expiry warning. Scorecard workflow false-pass is a past behaviour, consistent with the study opened."
    },
    "techniques/fixture-repo-testing.md": {
      "disposition": "keep",
      "reason": "Three shapes, ran-check-count assertion and isolation rules are sound."
    },
    "techniques/declared-deviation-register.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"a third outcome, beside the four\" now reads \"an outcome of its own, beside the four\", consistent with the golden path calling it the fifth."
    },
    "techniques/edition-stratified-conformance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: a crash is no longer placed at the hard-failure rung; the text now says it is not a hard failure in finding-severity-ladder's sense (nothing irreversible, the run continues) but is the one regression that may block a change on its own."
    },
    "techniques/inline-predicate-rung-inference.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the instrument bias now reads 1.9x against the resolved 20.8% (5.5x against the unresolved 7.2%), matching the bash application; \"five times apart\" became \"roughly five times apart\"."
    },
    "techniques/rule-registry-enumerated-fixtures.md": {
      "disposition": "keep",
      "reason": "Union-enumeration remedy and severity/fixture separation are sound; boundary witnessed by the deno application."
    },
    "techniques/derived-expectation-needs-an-evidence-floor.md": {
      "disposition": "keep",
      "reason": "Population-level floor and the boundary against negative-control-tests are coherent."
    },
    "applications/node--edition-stratified-conformance.md": {
      "disposition": "reverify",
      "reason": "Paired arms internally consistent; the private tree and its suite were not re-run."
    },
    "applications/node--derived-expectation-needs-an-evidence-floor.md": {
      "disposition": "reverify",
      "reason": "Four-arm table consistent and the incompleteness limit is stated; gates not re-run."
    },
    "applications/node--declared-deviation-register.md": {
      "disposition": "reverify",
      "reason": "Honest structural-only account; tree not reopened."
    },
    "applications/node--declared-then-proven.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: one sentence names the deviation that the write-back flag is a bare boolean with none of the provenance claim-write-back asks of a stamp. Other source anchors were not reopened; verified_on unchanged."
    },
    "applications/deno--rule-registry-enumerated-fixtures.md": {
      "disposition": "reverify",
      "reason": "Structural-only by stated reason; the source tree was not reopened."
    },
    "applications/rust--declared-deviation-register.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: section 6 is now quoted as the server \"should respond with an Array\" rather than \"requires\"; \"moving away from it\" now cites the MCP 2025-06-18 removal of batching. Remaining anchors at e7fbae7bb not reopened; verified_on unchanged."
    },
    "applications/node--fixture-repo-testing.md": {
      "disposition": "reverify",
      "reason": "Consistent with the technique and names the missing fresh-install fixture; tree not reopened."
    },
    "applications/process--pass-ratio-comparability.md": {
      "disposition": "reverify",
      "reason": "Deviation (no unable-to-check bucket) stated correctly; tree not reopened."
    },
    "applications/process--checker-false-positive-discipline.md": {
      "disposition": "reverify",
      "reason": "Measurement and limits clearly stated; the public index was not re-joined."
    },
    "applications/rust--edition-stratified-conformance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the third reason-class heading \"Non-standard\" added beside the two named, confirmed at the pinned commit. Other anchors not reopened; verified_on unchanged."
    },
    "applications/bash--inline-predicate-rung-inference.md": {
      "disposition": "reverify",
      "reason": "Arithmetic recomputed and consistent (57.5% = 341/593; 1.9x = 40/20.8); the tree was not re-classified."
    }
  }
}
```
