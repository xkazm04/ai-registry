---
layer: technique
type: technique
subject: docs-sync
technique: negative-claims-are-pinned
status: forged
laws: [gate-sees-target, deletion-is-not-repair, absent-guard-is-loud]
shared_with: []
use_when: [a document promises the system does not do something, deciding what a rot scanner owes a claim whose coupling can never be discovered, a boundary statement disappeared in a rewrite and nobody noticed, guidance that was deliberately removed keeps coming back, a reviewer asks which source file backs a sentence and there is none]
---

# Negative claims are pinned, not coupled

Every wall in this subject discovers the source a document is *about* and
judges the prose against it. That pipeline has a stage nobody states, because
in the ordinary case it is free: **the claim must have a source area at all.**

A whole class of documented statement does not. *The tool never signs you in.
The health command does not execute the platform's own status call. Importing
a session here does not inject it into the browser.* Their truth-maker is that
**no code exists**. There is no file to couple to, no history to query, no
diff that could ever owe them. They are not under-mapped; they are unmappable,
and no amount of coverage gating on the map
([source-doc-mapping](./source-doc-mapping.md)) reaches them, because the thing
they describe is the absence of an area rather than an area nobody declared.

## The permanent *unverifiable*, for the second reason

[doc-rot-detection](./doc-rot-detection.md) handles these correctly, and that
is precisely the trap. A document whose coupling cannot be discovered is
`unverifiable`, not clean — the verdict that separates an honest scanner from a
flattering one. But this class is unverifiable **on every scan, forever**. The
scanner is not wrong and never will be; it is reporting a state it can never
leave, and an honest verdict repeated indefinitely is operationally
indistinguishable from a hole.

This subject has met that shape once before. Wall 12 found figures terminating
at the resolution ladder's third rung and being *unverifiable permanently
rather than occasionally* — the same category, reached by a different road, and
worth pairing deliberately because **the two resolutions are opposites**. A
figure is unverifiable because it cannot be *read*, and the fix is to stop
comparing outputs and digest its **inputs** instead
([rendered-surface-coupling](./rendered-surface-coupling.md)). A promise is
unverifiable because it has **no inputs** — that is the entire content of the
claim. Nothing can be digested, so the comparison cannot be inverted, and the
mechanism has to change rather than move.

## They rot in two ways, and neither is a source change

- **Someone builds the thing.** The promise was true when written, and a later
  feature falsified it. No map entry pointed at the capability, because the
  capability did not exist when the map was written, so the change that
  introduced it owed no document —
  [same-change-enforcement](./same-change-enforcement.md) is working exactly as
  designed and cannot fire. This is
  [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) in the
  documentation layer: the obligation is optional by construction, so it is
  absent.
- **Someone deletes the sentence.** A rewrite, a page-tightening pass, a
  translation. A negative claim reads as boilerplate to every editor who did
  not pay for it: it describes no feature, demonstrates nothing, and cutting it
  makes the page shorter and cleaner. The deletion is invisible afterwards
  precisely because the sentence was the only artifact
  ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) — here
  what is removed is the promise itself, and what it exposed was the system's
  own boundary).

Neither failure produces a diff anybody would route to a documentation check,
which is why these survive in corpora that are otherwise well governed.

## Pin the sentence

The mechanism inverts. Instead of coupling the claim to a source area, assert
the claim's **wording** in the test suite: this exact substring appears in this
exact set of documents. And its dual, which is the half most implementations
skip: a **forbidden**-substring sweep over the whole prose corpus for the
phrasings the promise rules out.

Substring, not paraphrase, and the reason is what the artifact is for. A
promise is a **commitment**, not a description. What must survive is the words,
because the words are what a reader relies on and what an auditor quotes back;
a semantic check that accepts a weaker restatement has silently renegotiated
the commitment on the project's behalf.

Three properties decide whether the pin is worth its maintenance.

**The scope is the finding.** *Which* documents must carry the sentence is a
real decision, and it is where these go wrong: pinned in one file, the promise
is absent from the ten pages a reader actually lands on. One worked example
pins a single credential-boundary statement across eleven documents at once —
each localized landing page, the setup guide, the troubleshooting page, the
agent-facing instruction file and its translation — on the principle that a
boundary is load-bearing only where the reader is about to act. Write the scope
down as a list, and the list becomes the record of who needs the promise.

**The forbidden set is a floor.** A pin has every denylist's failure: it
catches the phrasings enumerated. One worked example's forbidden set includes
the *target-language* strings a translator would produce for "automatically
extract credentials from the browser" — because that guidance was removed once,
and the road back in is a translation of it rather than a restoration of it.
Extend the set on every escape; never narrow it to make a document pass.

**The pin does not verify the promise.** It verifies the promise is still
*stated* — [gate-sees-target](../../../../_laws.md#gate-sees-target) read
carefully, because the target here is the sentence and not the system. A
pinned false promise is worse than an unpinned one: it now has a green check
beside it and a test named after it. So the pin's admission ticket is a review
that established the claim's truth **once**, dated, with the wording that
review approved; the pin then preserves that wording and nothing more. This is
[earned-verification-state](./earned-verification-state.md) applied to a claim
that will never earn a second stamp from an instrument — only from a person.

## Where the check belongs instead

Sometimes the promise *can* be backed by a check on the action rather than on
the prose, and then it should be:
[prose-rule-drift](../../../standards-and-gates/quality-gates/techniques/prose-rule-drift.md)
owns that case, and its remedy — enforce in the tool that performs the governed
action — is strictly better than a pin, because it stops the capability from
existing rather than noticing that the paragraph about it moved.

The two are not alternatives when both are available. The action check stops
the promise from becoming false; the pin stops the promise from being edited
away while it is still true. A project with only the first ships a correct
system whose users can no longer find the commitment. A project with only the
second ships a well-tested sentence that may have stopped being true two
releases ago.

## When not to use this

- **The claim is positive and has a source area.** Then it is an ordinary
  coupled claim and the walls above already own it. Pinning it freezes wording
  that ought to be free to improve.
- **The wording is genuinely still in flux.** A pin is a commitment to a
  sentence. Pin a paragraph that is being actively rewritten and the test
  becomes a chore that gets edited to match whatever landed, which trains
  everyone to treat the whole class as noise.
- **Nobody ever established that the claim was true.** Then the work is the
  review, not the test. Pinning first manufactures exactly the flattering green
  this subject exists to prevent.
