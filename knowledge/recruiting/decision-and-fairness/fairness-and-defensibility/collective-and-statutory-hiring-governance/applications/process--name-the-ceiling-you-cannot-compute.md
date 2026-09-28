---
layer: application
type: application
subject: collective-and-statutory-hiring-governance
technique: name-the-ceiling-you-cannot-compute
stack: process
verified_on: 2026-09-28
applied: simulation
ab_verdict: better
---

# The governance banner as the product's honest ceiling

This is a copy artifact enforced as code. Two sentences — one per governed mode —
constitute the whole of what the tool tells a recruiter about the limits of its own
authority, and both are generated from the mode rather than written into a screen.
Re-read at `8f3c89560` (2026-09-28): the two sentences are unchanged, and what the
first reading named as remaining work — the ceiling travelling with the list — is
unchanged too.

## The two sentences

`governanceNote(mode)` (`app/_lib/group-eval-governance.ts:61`) returns `null` for the
default mode and one string for each governed one. Its own docstring names the design:
"Honest, mode-specific guidance shown to the recruiter — including the named ceiling:
the app holds no demographic/veteran data, so statutory preferences can't be computed
and must be applied by a human before certification" (`:58-60`).

The eligibility-list sentence (`:69-73`) carries all three parts the standard requires
in one breath:

> Eligibility-list mode: candidates are an ordinal, fit-ranked list — not a
> discretionary AI pick, and nothing is auto-sealed. Apply any statutory preferences
> (e.g. veterans') before certifying; **the app holds no such status and cannot compute
> it.**

*What* must happen (apply the preference, before certifying), *who* (a human in the
certification path), and *why the system cannot* (it holds no such status). The last
clause is the one most products omit, and omitting it converts a governance boundary
into an apparent backlog item — a reader who is told only that preferences are "not yet
supported" waits for a release.

The committee sentence (`:63-66`) names a different ceiling and is correspondingly
different in content, not just in wording: "the AI comparison is ADVISORY input for the
search committee — it does not pick or seal a hire. Capture each evaluator's assessment
and the committee's decision in your governance process." That second clause is an
honest handoff of a real gap. The product has no interviewer-level identity and no
independent-scoring-before-debrief flow — still none at this reading — so it cannot
host the anti-anchoring discipline a committee needs, and rather than implying it does,
it names the step and gives it to the process outside. This is the technique used
correctly on a capability limit rather than a legal one.

## The ceiling is mandatory output, and it is localized

The banner is not a configurable notice. In governed modes it is always part of the
payload (`group-eval-run.ts:919`), and it is composed at render time from the persisted
**mode enum** rather than from the stored English string:
`governanceText` (`app/features/hiring/decisions/groupEval/localize.ts:84`) maps
`committee` and `eligibility_list` onto catalog keys and falls back to the stored
`governanceNote` only for a payload saved before the enum existed (`:89`). The comment
calls it "the compliance-critical governance banner" (`:81-83`).

That indirection matters more than it looks. The payload comment at
`group-eval-run.ts:915-918` states the rule: the English note is still persisted for
older readers, "but the modal composes the banner from `governanceMode` through the
catalog … this banner is compliance guidance and must not be the one English paragraph
in a Czech workspace's modal." The ceiling sentence is only useful if it is read, and a
compliance sentence in a language the reader does not use is decoration. The Czech
catalog carries the full clause including the ceiling — *"aplikace tyto údaje nemá a
nedokáže je vypočítat"* (`messages/cs.json:4496`) — so nothing is lost in translation
precisely where loss would matter.

Note the deliberate asymmetry with the *sealed* artifact, which stays canonical English
forever (`group-eval-run.ts:814-823`). Guidance is localized because a human must act on
it now; the record is not, because an auditor must compare it across tenants and years.

## The hole is kept open

There is no veteran-status field, no demographic capture feeding the ranking, and no
"complete the statutory ordering" affordance anywhere in the eval path. The absence is
the design, and the sentence is what makes the absence legible. `buildEligibilityList`
(`group-eval-governance.ts:50-56`) produces `rank / entryId / label / score` and nothing
else — there is no slot a preference adjustment could be written into, which is the
structural version of the same refusal.

## Where the ceiling is stated, and where it drops a clause

The deterministic summary repeats it in the eligibility branch — "Apply any statutory
preferences before certifying — nothing is auto-sealed" (`group-eval-run.ts:787`) — so
it rides into the sealed rationale as well as the banner. That is correct: the standard
asks for the ceiling to travel with the artifact, not only with the screen.

The list's own footer is the second place it appears, and it is shorter than the
banner: "Ordinal ranking only. Apply statutory preferences (e.g. veterans') before
certifying. Nothing here is auto-sealed." (`GroupEvalModal.tsx:160`, `en.json:4401`).
*What* and *when* survive; *why the system cannot* does not. On the modal the banner
above (`GroupEvalModal.tsx:137`) supplies the missing clause, so the screen is whole.
The sealed summary line is the same two-of-three sentence, and it travels alone.

**Deviation, still open.** The sentence does not travel further than the modal and the
record. The raw payload is served by `app/api/decisions/group-eval/route.ts:30`, where
`eligibilityList` arrives beside an English `governanceNote` field that a consumer may
or may not render, and outside the modal none of the modules that read `topPick` renders the
note. No CSV, export or dossier consumer exists yet, so the gap is latent rather than
live — the first export built on this payload inherits it. The standard's rule — the
sentence is adjacent to the ordering, in the export and in the printed packet, and
states all three parts wherever it stands alone — is the remaining work, and it is a
rendering change rather than a data one: everything needed is already on the payload.

## Applied: the sentence names a step for one position only (simulation)

This pass conditioned the technique: the ceiling sentence is position-specific,
and a register runs under a certification regime the tool must know. Three real
paths at kp `aa43bceb0`, with the technique as it stood (A) and as conditioned
(B). A search of the app tree for certificate, quality category, pass-over and
rule-of-N concepts finds none outside the governance sentences themselves; the
positive control, the "before certifying" sentence, is found.

**1. A public employer runs its applicant pool through kp, and certifies
elsewhere afterwards.** kp sits before certification. The sentence "Apply any
statutory preferences (e.g. veterans') before certifying; the app holds no such
status and cannot compute it" names the right step. A passes, and B passes.

**2. A selecting official receives a certificate and loads those names into a
role to compare them.** kp sits after certification, and nothing in the tree
can know it. The same sentence now names a step that already happened at the
examining office, the preference is already in the certificate's order, and
`buildEligibilityList` re-ranks the names by fit. A passes: the what, the who
and the why are all present. B fails it twice. The sentence hides the step the
official still owes, the pass-over procedure. And the list is a competing order
that shows whom to pass over.

**3. The register is category-rated.** Inside the highest category the official
may choose anyone, and preference-eligible candidates are listed first. kp's
eligibility list orders the whole field by fit, one axis. A has no rule about
regimes and passes. B requires the regime as per-posting configuration and
finds none.

B finds a gap on 2 of 3 paths that A certifies, and agrees with A on the one
path where the old sentence is right. **Better**, at simulation. The falsifier is
a deployment that only ever runs before certification; kp has no public-sector
tenant on record to say which it would be. The return for code is a posting-level
"certified list" flag that, when set, keeps the certificate's order and shows the
fit score beside it, with a pass-over line in place of the "before certifying"
sentence. It waits for a public-sector user.
