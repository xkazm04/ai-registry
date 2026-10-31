---
domain: software-engineering
subject: proof-carrying-agent-actions
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# proof-carrying-agent-actions

Subject note. Part of [[index]]; graded against [[standard]].

## Architecture review - 2026-10-31

First review. The subject arrived in one harvest commit (`f1fdb04e6`) with a golden
path, six techniques and two node applications drawn from one public tree. The rule set
is internally consistent: the verdict fold (envelope, any false, any unknown, empty set,
then pass) reads the same in the golden path, the inconclusive technique and the
application's cited `verdictOf`. The three general claims the golden path leans on were
checked against primary sources: Necula's proof-carrying code, SWE-bench's
fail-to-pass and pass-to-pass sets, and the SLSA verification summary. All three hold as
stated. Every line anchor in both applications was re-read at the pinned commit and
resolves. That re-read found three text problems: one unstated deviation, one
overstatement, and one imprecise sentence in a technique.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/proof-carrying-agent-actions",
  "date": "2026-10-31",
  "baseline": "baf129d93",
  "digest": "sha256-b2:23bc66291b15d414",
  "disposition": "clarify",
  "coverage": "All 9 documents read in full. Three primary sources opened for the golden path's general claims. For the two applications, every cited file and line range was fetched from the public repository at commit 009c7893 and compared with the text, along with the two exploit fixtures (input.pass.json, input.weakened.json, weakened.diff). Nothing was executed: the prove job, the unit tests and the CLI were read, not run. The techniques' generic engineering guidance (strength ladder, hashing an import closure, hold-and-escalate) is design advice with no single primary source. It was judged for internal consistency only.",
  "counterexamples": [
    "A rescan that pins only the scanner engine version still accepts a rule-set change between base and head. The cited checker compares engine_version alone, while the golden path asks for 'the same version and rule set'.",
    "A needle matched after lower-casing can match failure text that names a different thing in a case-sensitive path or identifier. The technique forbids case-folding, and the cited exploit-test checker lower-cases both sides.",
    "SLSA's verification summary carries a subject digest, a verifier id and a policy, as the golden path says. Its result is two-valued (PASSED or FAILED), so borrowing the attestation shape does not carry the inconclusive third value. The gate must add that itself.",
    "A fixture that forges three things at once stays refused when any one of its detectors breaks. The application records this as a deviation, and the technique names it as the reason for one forgery per fixture."
  ],
  "sources": [
    {
      "url": "https://courses.grainger.illinois.edu/cs421/fa2010/papers/necula-pcc.pdf",
      "result": "Necula, Proof-Carrying Code (POPL 1997). Abstract: 'the untrusted code producer must supply with the code a safety proof that attests to the code's adherence to a previously agreed upon safety policy'; 'The host can then easily and quickly validate the proof without using cryptography and without consulting any external agents.' Supports the golden path's opening analogy as written."
    },
    {
      "url": "https://huggingface.co/datasets/princeton-nlp/SWE-bench",
      "result": "FAIL_TO_PASS: 'the set of tests resolved by the PR and tied to the issue resolution'. PASS_TO_PASS: 'tests that should pass before and after the PR application'. test_patch: 'A test-file patch that was contributed by the solution PR'. Supports 'Benchmarks for patch evaluation call these fail-to-pass and pass-to-pass sets'."
    },
    {
      "url": "https://slsa.dev/spec/v1.0/verification_summary",
      "result": "verifier.id: 'URI indicating the verifier's identity'. policy: 'Describes the policy that the subject was verified against'. The subject is listed with a name and a digest. verificationResult: 'Either PASSED or FAILED'. Supports the subject-digest / verifier / policy shape in the golden path and evidence-binds-to-the-measured-change. It also shows the result field is two-valued (counterexample above)."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Re-read at the pinned commit: src/schemas/proof.ts (1-2, 5-14, 29, 61-68), engine/proofs/common.ts (54-55, 67-71, 83-84, 101), engine/decide/gate.ts (1-3, 68-75), engine/proofs/exploitTest.ts (28-39, 57, 60-61, 82-84, 96-102), engine/proofs/citedDiff.ts (2-3, 8, 18), engine/proofs/weakening.ts (26-45, 95-109), engine/README.md (5, 9, 46-47, 65), engine/policy/load.ts (47), .gitlab-ci.yml (21, 139-174), engine/proofs/__tests__/exploitTest.test.ts (39, 104, 112, 122, 142-143). Every anchor resolves and every quote matches. Two discrepancies: exploitTest.ts:31 and 60-61 lower-case both the failure text and the vector before matching, which the claims application does not disclose; input.weakened.json differs from input.pass.json in claims, vector, claim_ids, job refs and the base finding list as well as the diff."
    }
  ],
  "documents": {
    "proof-carrying-agent-actions.md": {
      "disposition": "keep",
      "reason": "The PCC analogy, the fail-to-pass/pass-to-pass naming and the attestation shape match their primary sources. Boundaries with fleet-orchestration, quality-gates, judgment-guardbands and earned-autonomy-tiers are explicit. Every technique summary agrees with its technique, including the verdict fold, the needle floor and the edited-expectation inconclusive case."
    },
    "techniques/claims-never-decide.md": {
      "disposition": "keep",
      "reason": "The four-author input table, the needle floor and parameter cap, the recomputed verdict field and the base-commit reading of configuration are consistent with the golden path and with the application that cites them."
    },
    "techniques/evidence-binds-to-the-measured-change.md": {
      "disposition": "clarify",
      "reason": "'one pair can be rebased into a different change' is imprecise. A fixed base/head pair has exactly one diff; a rebase produces a new pair. The sentence should say a branch can be rebased into a different change under the same name, which is the case the digest exists for. Everything else is consistent, and the attestation shape matches SLSA's verification summary."
    },
    "techniques/inconclusive-routes-to-wait.md": {
      "disposition": "keep",
      "reason": "The fold order matches the golden path and the cited verdictOf. Failures outranking unknowns is consistent with test-not-weakened's rule that other weakening fails a proof despite an edited expectation. Mapping checker errors to the inconclusive exit matches the cited engine's '2 inconclusive or error'."
    },
    "techniques/negative-fixtures-prove-the-verifier.md": {
      "disposition": "keep",
      "reason": "The fixture taxonomy is consistent with the proof-class technique (a misclassified change gets the stricter class's verdict). Asserting the exit and reason through the production entry point is coherent, and the limits section is honest."
    },
    "techniques/proof-class-bound-to-action-class.md": {
      "disposition": "keep",
      "reason": "Discriminated classes with every field required, the envelope read at base, derive-then-compare, and failing closed at policy load are mutually consistent. The reviewer-class exemption from the envelope is reasoned."
    },
    "techniques/test-not-weakened-check.md": {
      "disposition": "keep",
      "reason": "The strength ladder and hunk pairing agree with the cited weakening.ts (3 typed or exact, 2 partial, 1 truthiness, 0 trivial; moved lines are not removals). The edited-expectation inconclusive rule matches exploitTest.ts:82-84."
    },
    "applications/node--claims-never-decide.md": {
      "disposition": "clarify",
      "reason": "All anchors resolve and the quotes match at 009c7893. Undisclosed deviation: exploitTest.ts:31 defines squash as whitespace-collapse plus toLowerCase, and lines 60-61 apply it to both the failure text and the vector. The exploit-test needle match is therefore case-folded, against the technique's 'not case-folded into coincidence'. Only the cited-diff quote is compared after whitespace alone. Add it to the Deviation section."
    },
    "applications/node--negative-fixtures-prove-the-verifier.md": {
      "disposition": "clarify",
      "reason": "Anchors resolve. The count of seventeen (8 honest + 9 refusing) and every-class coverage are correct. 'only the diff differs' overstates. input.weakened.json also differs from input.pass.json in claims, vector form, claim_ids, job refs and the base scan's finding list. What it shares is the JUnit files and a same-version rescan that closes the finding, so the diff is what decides the verdict."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the three clarify items from the record above. One technique sentence was made
precise. One application now discloses its case-folded needle match, and the other no
longer overstates how its weakened fixture differs. No item was left owed. Both
applications' citations were re-checked at the pinned commit, so their verified_on date
moved. Nothing was executed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/proof-carrying-agent-actions",
  "date": "2026-10-31",
  "baseline": "f0fb680d2",
  "digest": "sha256-b2:1138b618a1ca23e4",
  "disposition": "keep",
  "coverage": "All 9 documents decided. The three clarify items in the first 2026-10-31 record were applied and the edited passages re-read. Each rests on a source line re-read at commit 009c7893 this run or on the internal logic of the sentence. Every citation in both applications was re-checked against the public repository, so their verified_on moved to 2026-10-31. verified_against was left untouched, and nothing was executed. The other six documents are byte-unchanged and keep their dispositions.",
  "counterexamples": [
    "A rescan that pins only the scanner engine version still accepts a rule-set change between base and head. The cited checker compares engine_version alone, while the golden path asks for 'the same version and rule set'.",
    "A needle matched after lower-casing can match failure text that names a different thing in a case-sensitive path or identifier. The technique forbids case-folding, and the cited exploit-test checker lower-cases both sides.",
    "SLSA's verification summary carries a subject digest, a verifier id and a policy, as the golden path says. Its result is two-valued (PASSED or FAILED), so borrowing the attestation shape does not carry the inconclusive third value. The gate must add that itself.",
    "A fixture that forges three things at once stays refused when any one of its detectors breaks. The application records this as a deviation, and the technique names it as the reason for one forgery per fixture."
  ],
  "sources": [
    {
      "url": "https://courses.grainger.illinois.edu/cs421/fa2010/papers/necula-pcc.pdf",
      "result": "Necula, Proof-Carrying Code (POPL 1997). Abstract: 'the untrusted code producer must supply with the code a safety proof that attests to the code's adherence to a previously agreed upon safety policy'; 'The host can then easily and quickly validate the proof without using cryptography and without consulting any external agents.' Supports the golden path's opening analogy as written."
    },
    {
      "url": "https://huggingface.co/datasets/princeton-nlp/SWE-bench",
      "result": "FAIL_TO_PASS: 'the set of tests resolved by the PR and tied to the issue resolution'. PASS_TO_PASS: 'tests that should pass before and after the PR application'. test_patch: 'A test-file patch that was contributed by the solution PR'. Supports 'Benchmarks for patch evaluation call these fail-to-pass and pass-to-pass sets'."
    },
    {
      "url": "https://slsa.dev/spec/v1.0/verification_summary",
      "result": "verifier.id: 'URI indicating the verifier's identity'. policy: 'Describes the policy that the subject was verified against'. The subject is listed with a name and a digest. verificationResult: 'Either PASSED or FAILED'. Supports the subject-digest / verifier / policy shape in the golden path and evidence-binds-to-the-measured-change. It also shows the result field is two-valued (counterexample above)."
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Re-read at the pinned commit: src/schemas/proof.ts (1-2, 5-14, 29, 61-68), engine/proofs/common.ts (54-55, 67-71, 83-84, 101), engine/decide/gate.ts (1-3, 68-75), engine/proofs/exploitTest.ts (28-39, 57, 60-61, 82-84, 96-102), engine/proofs/citedDiff.ts (2-3, 8, 18), engine/proofs/weakening.ts (26-45, 95-109), engine/README.md (5, 9, 46-47, 65), engine/policy/load.ts (47), .gitlab-ci.yml (21, 139-174), engine/proofs/__tests__/exploitTest.test.ts (39, 104, 112, 122, 142-143). Every anchor resolves and every quote matches. Two discrepancies: exploitTest.ts:31 and 60-61 lower-case both the failure text and the vector before matching, which the claims application does not disclose; input.weakened.json differs from input.pass.json in claims, vector, claim_ids, job refs and the base finding list as well as the diff."
    }
  ],
  "documents": {
    "proof-carrying-agent-actions.md": {
      "disposition": "keep",
      "reason": "The PCC analogy, the fail-to-pass/pass-to-pass naming and the attestation shape match their primary sources. Boundaries with fleet-orchestration, quality-gates, judgment-guardbands and earned-autonomy-tiers are explicit. Every technique summary agrees with its technique, including the verdict fold, the needle floor and the edited-expectation inconclusive case."
    },
    "techniques/claims-never-decide.md": {
      "disposition": "keep",
      "reason": "The four-author input table, the needle floor and parameter cap, the recomputed verdict field and the base-commit reading of configuration are consistent with the golden path and with the application that cites them."
    },
    "techniques/evidence-binds-to-the-measured-change.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'one pair can be rebased into a different change' now reads 'a branch can be rebased into a different change under the same name'."
    },
    "techniques/inconclusive-routes-to-wait.md": {
      "disposition": "keep",
      "reason": "The fold order matches the golden path and the cited verdictOf. Failures outranking unknowns is consistent with test-not-weakened's rule that other weakening fails a proof despite an edited expectation. Mapping checker errors to the inconclusive exit matches the cited engine's '2 inconclusive or error'."
    },
    "techniques/negative-fixtures-prove-the-verifier.md": {
      "disposition": "keep",
      "reason": "The fixture taxonomy is consistent with the proof-class technique (a misclassified change gets the stricter class's verdict). Asserting the exit and reason through the production entry point is coherent, and the limits section is honest."
    },
    "techniques/proof-class-bound-to-action-class.md": {
      "disposition": "keep",
      "reason": "Discriminated classes with every field required, the envelope read at base, derive-then-compare, and failing closed at policy load are mutually consistent. The reviewer-class exemption from the envelope is reasoned."
    },
    "techniques/test-not-weakened-check.md": {
      "disposition": "keep",
      "reason": "The strength ladder and hunk pairing agree with the cited weakening.ts (3 typed or exact, 2 partial, 1 truthiness, 0 trivial; moved lines are not removals). The edited-expectation inconclusive rule matches exploitTest.ts:82-84."
    },
    "applications/node--claims-never-decide.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the Deviation section now records that the exploit-test needle is case-folded (exploitTest.ts:31, 60-61), with the standard restated; citations re-checked at 009c7893 and verified_on moved to 2026-10-31."
    },
    "applications/node--negative-fixtures-prove-the-verifier.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'only the diff differs' now says the fixture shares the JUnit files and a same-version rescan that closes the finding, differs in claims, vector and job references, and that the diff decides the verdict; citations re-checked at 009c7893 and verified_on moved to 2026-10-31."
    }
  }
}
```
