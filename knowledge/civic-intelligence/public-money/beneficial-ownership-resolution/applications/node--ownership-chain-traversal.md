---
layer: application
type: application
subject: beneficial-ownership-resolution
technique: ownership-chain-traversal
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Node: the public-ownership classifier files "private" on a one-hop read

The politicas money loop decides whether a supplier's money is its own public
mandate or could reach a politician in `classifyPublicMandate`
(`lib/analysis/public-body.ts`): own legal form first, then the current
shareholders read from the register, then the negative cases. Everything
without evidence answers `unknown`, which is the upward walk's rule applied to
legal forms and to an unreadable record. The one place it was not applied is
the owner itself: a current corporate owner with a private-law form counted as
evidence that the company is private, though nothing above that owner had been
read. A separate depth-2 pass records the parent's legal form and stops; it
never records where the chain ends.

## A and B

- A: the shipped classifier. A corporate private-form owner, none public, gives
  `private`.
- B: an opt-in `requireOwnerChain` flag. Each shareholder may carry
  `upstream: "private-terminal"`, set only by a walk that ended non-public.
  With the flag on, a current owner without that mark gives `unknown`, still
  attributable (silence is not evidence of public ownership either).

## What was read

The committed 2026-08-23 sweep report (33 `private` verdicts) joined to the
depth-2 report. 16 of the 33 rest on a corporate owner; 17 rest on natural
persons or owner-less records. Under B the 16 (2.5 bn CZK of contract volume)
become `unknown`; none can be proven `private-terminal` from the records,
because they carry the parent's form and not the chain's end. The floor held:
attributable flags, the other four kinds and the 17 other private rows
unchanged, existing and new classifier tests green.

The seam was chosen to falsify "a private form on the owner is harmless". It
was not: a state railway's research institute and its advertising subsidiary
were filed `private` through the state railway company, a form-private
company owned by the state. The live register lists the state as a text-only
shareholder entry (no identifier, neither person shape) that was dated out in
2012, which the reader skips by shape, a second reason the one-hop answer
cannot be trusted at the last owner.

## Cost and what was not done

B is review load: about a third of the 16 are plainly private group chains that
need an upward walker to earn the mark. That walker (bounded, with depth and
fetch-budget stops recorded per entity) is not built, and the sweep does not
pass the flag yet, so the published verdicts are unchanged. Measured on the
committed report, not the live store.
