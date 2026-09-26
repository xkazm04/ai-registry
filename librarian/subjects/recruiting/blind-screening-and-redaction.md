---
domain: recruiting
subject: blind-screening-and-redaction
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L3
---

# blind-screening-and-redaction

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-bsr-0926)

The Curator lane dispatched this run on the finding "never swept by the
librarian", with registry HEAD 55c6bce2 at dispatch. It worked from origin/main
e1e199ba in a detached worktree. It read the one tree the applications cite,
kp, at 2ee8cc971 (Node 24, Python 3.12), and again after its own commits.

**Depth rung: L3.** The headline finding was measured on kp's own redactor
with an identity-twin probe, before and after a code change. L2 primary sources
supplied the rest:
- the randomised and pilot trials, and a 2025 synthesis;
- the résumé-obfuscation and name de-identification papers;
- the regulator and court texts.

**Lanes:**
- a counter-evidence lane on the web, unconstrained, nine claims;
- a blind training-data lane, ten questions;
- the consumer tree.

**Counter-evidence: two absolutes refuted, one flipped, the rest conditioned or
confirmed.**
- **Refuted: "the largest field evidence is discouraging".** Web and blind
  agree. The sign follows the screeners' baseline disposition. A municipal
  randomised trial and a national pilot were positive, and a real-process
  public-service pilot was null. A 2025 synthesis says anonymisation helps
  "only when discrimination is high". The hiring effect in the largest trial
  is weakly significant (10%). "The second effect was larger" became "a little
  over half".
- **Refuted: "under-masking is the less common failure".** Web, blind and tree
  agree.
  - Gender stays predictable from obfuscated résumés at AUROC 0.8.
  - 2026 preprints show models recovering ethnicity from language fields and
    gender from hobbies.
  - Name de-identification methods show recall gaps across most demographic
    dimensions.
  - kp's own misses fell on the feminine participle and on skill-word
    surnames.
- **Flipped, in name-versus-role:**
  - One skill term does not make a headline.
  - A lone name token in the body is masked only where it reads as the
    person. The old rule was "full aggression".
- **Conditioned:**
  - The audition result outruns its paper; it does not fail to survive it
    (web and blind).
  - The framed shortlisting experiment was hypothetical (web and blind).
  - The empty identity field proves what a model said, not what it used
    (web and blind).
  - A span tagger infers nothing, and a weaker extractor misses unevenly
    (web and blind).
  - Tier-2 markers travel on a separate channel where a veteran preference, a
    guaranteed interview or an adjustment depends on them (web and blind).
  - A controller holding the original still processes personal data, dated
    2026-09 (web, with blind agreement on the principle).
- **Tree-only conditions, each with its measured case:**
  - The name-found flag guards omission, not a wrong detection: a header
    returned as the name printed "identity redacted".
  - Channel substitution puts the document inside the prompt, so it must be
    fenced.
  - An enrichment keyed on identity is an unmasking channel.
- **Verified and left untouched:**
  - the procedural claim;
  - fail-closed at the send;
  - the three states;
  - typed placeholders;
  - ordering and re-attachment from the held identity;
  - mode in the result identity;
  - "reject stays a human act".

**Convergence.** The new technique, identity-twin-mask-invariance, is
converged. The tree lane gave three identity-dependent defects in one commit
and 8 of 9 planted twins diverging. The web lane gave demographic recall gaps
in name de-identification. The blind lane reached "audit recall by name origin"
independently.

**Tree lane.** kp had moved since 2026-08-20:
- 10864715c fixed a header-as-name false detection, Czech titles, the feminine
  participle and the month-name collision.
- b64e23f82 fenced the inline blind CV.
- 9990c12bd dropped the GitHub handle in blind runs.
- fde5c76e5 added a preflight that holds a blind run over a textless CV.
- The trust findings are now coded at birth.

All line references in the three applications had moved.

**Landed:**
- 25e28026: two refutations and two flips; seven conditions; one new
  technique; all three applications re-verified to 2026-09-26, the node one
  against node@24.
- fbcac201: a process application for the new technique carrying the code
  verdict, and the fail-closed application corrected for the preflight
  routing.

**Applied** (5 rows in [[applied]]):
- code, better, in kp 4433df0c5, three rows:
  - the twin suite: 8 → 6 of 9 planted twins diverge, all six in the stated
    gap; the decidable suite goes from 2 failures to green;
  - the headline majority rule;
  - the lone-token rule.
- unapplied: the evidence flip. kp's copy already makes only the procedural
  claim.
- unmeasurable: model-reader under-masking. It needs a distributional lane over
  the model path.

## Impact

No kp context pairs this subject: 0 pairs, so 0 stale verdicts. The map was
regenerated in kp 59a2029ba, committed and not pushed. kp's impact table showed
19 stale verdicts, none of them on this subject.

The missing join is itself the finding. kp's `cv-extraction` context holds
`pipeline/jobfit/redact.py` and publishes four other subjects:
structured-output, cv-authenticity-screening, regulated-credential-gating and
cv-parsing-and-career-reading. `pipeline-core` (pipeline.py) and
`shared-api-utilities` (cache-key.ts) do not pair it either. kp's commit hook
confirmed it: consult-check listed eight governing subjects for `redact.py`,
and this one was not among them. So `/conform` has never judged this subject
against the one tree its applications read.

## Owed to projects

For kp, recorded and not fixed:
- The result cache key carries no masking-policy digest. The 2026-08-22
  redactor fix did not move it, and neither did 4433df0c5.
  `archetypeRegistryDigest` is the pattern to follow.
- Nothing stops an unblinded re-run from replacing a blind verdict, and
  re-attachment records no actor.
- The preflight's "Run without blind screening" leaves no record that a blind
  run was requested and refused. Refusals are coded but not counted.
- The pronoun, honorific and age patterns cover English and Czech only. A
  German or French CV gets its header skipped but keeps its gendered terms,
  with no escalation.
- Tier 3 is unmasked and there is no per-role policy. There is no
  removed-share metric.
- The twin set is English and Czech only.
- There is no distributional lane over the model path. It is shared with
  [[adverse-impact-and-proxy-neutrality]].

## Open leads

Each lead came from a single lane:
- **Name anonymisation can raise model refusals.** From the web lane: a June
  2026 preprint reports a 42% refusal rate on one model when names were
  removed. Return when a second source or a project's own refusal counts
  agree.
- **Prestige masking helps candidates from non-elite backgrounds.** From the
  blind lane only, and the evidence is vendor claims. Return with
  peer-reviewed evidence.
- **The recruitment high-risk regime's application date moved to 2027-12-02**
  (web, as of 2026-09). The subject names no regulation. Place it only if a
  regulatory application is ever written, and re-check within 12 months.

## Declines

- **Naming the trials, papers, regulations or courts in upper layers.** The
  subject's voice keeps them generic, as its sibling does, and the dates carry
  the currency.
