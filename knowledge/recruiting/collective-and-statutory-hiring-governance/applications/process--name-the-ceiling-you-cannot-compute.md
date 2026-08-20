---
layer: application
type: application
subject: collective-and-statutory-hiring-governance
technique: name-the-ceiling-you-cannot-compute
stack: process
---

# The governance banner as the product's honest ceiling

This is a copy artifact enforced as code. Two sentences — one per governed mode —
constitute the whole of what the tool tells a recruiter about the limits of its own
authority, and both are generated from the mode rather than written into a screen.

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

The committee sentence (`:63-67`) names a different ceiling and is correspondingly
different in content, not just in wording: "the AI comparison is ADVISORY input for the
search committee — it does not pick or seal a hire. Capture each evaluator's assessment
and the committee's decision in your governance process." That second clause is an
honest handoff of a real gap. The product has no interviewer-level identity and no
independent-scoring-before-debrief flow, so it cannot host the anti-anchoring discipline
a committee needs — and rather than implying it does, it names the step and gives it to
the process outside. This is the technique used correctly on a capability limit rather
than a legal one.

## The ceiling is mandatory output, and it is localized

The banner is not a configurable notice. In governed modes it is always part of the
payload (`group-eval-run.ts:705`), and it is composed at render time from the persisted
**mode enum** rather than from the stored English string:
`governanceText` (`app/features/hiring/decisions/groupEval/localize.ts:84`) maps
`committee` and `eligibility_list` onto catalog keys and falls back to the stored
`governanceNote` only for a payload saved before the enum existed. The comment calls it
"the compliance-critical governance banner" (`:81-83`).

That indirection matters more than it looks. The payload comment at
`group-eval-run.ts:701-704` states the rule: the English note is still persisted for
older readers, "but the modal composes the banner from `governanceMode` through the
catalog … this banner is compliance guidance and must not be the one English paragraph
in a Czech workspace's modal." The ceiling sentence is only useful if it is read, and a
compliance sentence in a language the reader does not use is decoration. The Czech
catalog carries the full clause including the ceiling — *"aplikace tyto údaje nemá a
nedokáže je vypočítat"* (`messages/cs.json:3049`) — so nothing is lost in translation
precisely where loss would matter.

Note the deliberate asymmetry with the *sealed* artifact, which stays canonical English
forever (`group-eval-run.ts:600-609`). Guidance is localized because a human must act on
it now; the record is not, because an auditor must compare it across tenants and years.

## The hole is kept open

There is no veteran-status field, no demographic capture feeding the ranking, and no
"complete the statutory ordering" affordance anywhere in the eval path. The absence is
the design, and the sentence is what makes the absence legible. `buildEligibilityList`
(`group-eval-governance.ts:50`) produces `rank / entryId / label / score` and nothing
else — there is no slot a preference adjustment could be written into, which is the
structural version of the same refusal.

## Where the ceiling is stated twice, and where it should be stated once more

The deterministic summary repeats it in the eligibility branch — "Apply any statutory
preferences before certifying — nothing is auto-sealed" (`group-eval-run.ts:572`) — so
it rides into the sealed rationale as well as the banner. That is correct: the standard
asks for the ceiling to travel with the artifact, not only with the screen.

**Deviation.** It does not travel further than the modal and the record. The eligibility
list on the payload (`:707`) is consumed by surfaces and exports that do not necessarily
carry `governanceNote` alongside, and a ranked list read anywhere without its ceiling
sentence reads as a complete ordering. The standard's rule — the sentence is adjacent to
the ordering, in the export and in the printed packet, not only in the view that
generated it — is the remaining work, and it is a rendering change rather than a data
one: everything needed is already on the payload.
