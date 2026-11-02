---
layer: technique
type: technique
subject: live-test-consent-and-evidence
technique: provenance-labels-derived-from-state
status: forged
laws: [output-never-outruns-evidence, checkability-routes-the-pixel]
shared_with: []
use_when: [designing the words a stream tool uses to say how real a result is, choosing what decides whether a surface shows live, simulated, recorded or unverified, reviewing a label that a caller or a page sets by hand]
---

# Provenance labels derived from state

A stream tool labels its outputs: this draw was simulated, this round came from a recorded
source, this proof is verified, this result is pending. Those labels are claims, and they
are trusted exactly as far as the code that picks them. This technique fixes two things:
the labels come from a **closed vocabulary** in which each word has one meaning, and each
label is **computed from the state** of the thing it labels by one function, never passed
in by a caller or added by a screen.

## A closed vocabulary

Define the words once, in one place, with a definition each — for example live,
simulated, recorded, verified, unverified, pending — and make every surface draw from
that set. Two problems disappear. The first is synonyms: a "demo" badge on one page and a
"test" badge on another and "sample" in an export are three words a reader has to guess
are the same, and one day are not. The second is drift toward reassurance: a free-text
label invites "checked" or "OK" where the truth is "pending". A word outside the set
fails to compile or fails a test.

Fix the visual grammar with the words. If a colour or a mark means "this can act on
viewers" on one stamp, it means that on every stamp, and nothing that merely watches
wears it; a reader learns the grammar once and reads every surface by it. The closed set
must also stay closed at the call site: a helper that takes a kind from the set but lets
the caller replace the visible word has reopened the vocabulary through the back door,
because the viewer reads the word, not the kind.

The vocabulary distinguishes **axes** where they differ. Who took part (real audience,
generated crowd), where randomness came from (live public source, recorded), whether
verification ran and what it returned (verified, unverified, not yet run) — each axis has
its own words, and a surface that shows a result names each axis that differs from live.

## Derived, not asserted

For each kind of artifact — a draw, a tally, a proof, a capture — one function takes the
artifact's own state and returns its labels. The state includes the provenance flags on
its inputs, the source of its randomness, and the outcome of any verification actually
run. Nothing else is an input: not the page it is shown on, not the mode of the session,
not a parameter the caller supplies.

The failure each rule prevents is concrete. A page that adds "demo" because it is the demo
page stops adding it when the same artifact is reached from the main screen. A function
that accepts a label argument will one day be called with "verified" by code that never
ran the verifier. A label computed in the interface from the interface's own idea of the
mode disagrees with the store the moment the two drift. Deriving from state makes the
label as reliable as the state and no more
([law: output-never-outruns-evidence](../../../../_laws.md#output-never-outruns-evidence)).

**A mode is not state.** A session launched in live mode, a configuration that enables a
live source: neither has produced a live result. The label waits for the state that
proves it — an accepted seal naming the live source, a verification that ran — and until
that state exists it says **unknown**. Unknown is a word in the vocabulary, with its own
meaning ("not yet established; wait"), not a gap to be filled with the more flattering
default. A state the function does not recognise — an unexpected source, a sentinel it
cannot place — also yields unknown rather than the nearest familiar word.

Provenance is best a typed field on the state. Inferring it from a recognisable value —
a fixed timestamp that only recorded material uses, a known test seed — works until real
data happens to match, and it is invisible to every consumer that does not know the
convention.

**Verified is the hardest word to earn.** It is returned only when a verification ran in
this process, against this artifact, and passed, and the label carries what was checked.
A verification that could not run — no network for the public source, no trusted anchor
supplied from outside the artifact, a signature that the tool cannot authenticate —
yields unverified, never a silent omission and never verified-by-default. And
verification is its own axis, not a promotion: a proof that checks out on a draw whose
randomness the streamer controlled stays labelled streamer-controlled. Passing the check
proves the arithmetic; it does not raise the trust tier the draw was cast under.

## Rendered by code, in a fixed place

The label is drawn by deterministic code from the function's output, in a place the
artifact's own art cannot cover, on every surface that shows the artifact
([law: checkability-routes-the-pixel](../../../../_laws.md#checkability-routes-the-pixel)).
A surface that cannot render the label does not render the artifact.

## Procedure

1. Write the vocabulary as a closed type with a one-line definition per word, grouped by
   axis.
2. For each artifact kind, write one labelling function from its state to its labels;
   give it no other inputs.
3. Make every surface — tool, overlay, export, proof page — call that function rather than
   choosing words itself.
4. Test each function with every combination of axes, including a mixed input and a
   verification that could not run.
5. Search the codebase for label words used as string literals outside the vocabulary
   definition; each one is a surface deciding provenance for itself.

## Decision rules

- **When a surface wants a new word, add it to the vocabulary with a definition**, or use
  an existing one; never a local string.
- **When a label depends on anything other than the artifact's state, remove the
  dependency.**
- **When a verification did not run or did not pass, the word is unverified.** Never
  leave the label off.
- **When two axes differ from live, show two labels.**
- **When the state is not yet known or not recognised, the word is unknown.**
- **When a verification passes, keep the trust-tier label.** Verified sits beside it.

## When not to use it

Labels on purely internal developer views — a debug panel, a log — can be looser, provided
nothing derived from them is shown to a viewer or kept as a record. The technique
governs every word a streamer, a viewer or a reviewer reads as a statement about how real
something was.
