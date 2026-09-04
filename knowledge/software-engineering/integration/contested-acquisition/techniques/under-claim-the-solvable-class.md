---
layer: technique
type: technique
subject: contested-acquisition
technique: under-claim-the-solvable-class
status: forged
laws: [unknown-is-not-a-value, one-authority-per-vocabulary]
shared_with: []
use_when: [writing the precedence rules of a refusal classifier, two refusal markers are present at once, an expensive response keeps running against refusals it never clears]
---

# Under-claim the solvable class

Most classifiers are written to be *right*, and their precedence rules are
tuned toward whichever reading of the evidence is most likely. That is the
correct instinct almost everywhere. It is the wrong instinct here, and the
reason is a structural asymmetry that shows up in no other classification
problem in the acquisition path.

**Capability and confidence are inversely ordered.** Rank the refusal classes
by how tractable they are — how much a response you own could do about one —
and the classes get *more* tractable in exactly the direction your evidence
gets *less* trustworthy. The signals that mark a tractable class are cheap
signals: a visible element, a recognizable widget, a familiar shape. They are
cheap for you to read and cheap for the other side to emit, which means the
evidence for the classes you can act on is precisely the evidence that can be
present without the situation being what it looks like.

So the rule is not "pick the most likely class". It is:

> **On any ambiguity, resolve to the least capable class. Always.**

## Why the two reflexive precedences are both wrong

**Most-specific marker wins.** The usual tiebreak: the narrower, more
particular signal beats the broader one, because specificity is normally a
proxy for confidence. Here it inverts. The narrow markers are the ones that
belong to the tractable classes, so specificity systematically pulls the
verdict toward the classes you are least entitled to claim. A broad signal
that a source is running an opaque, invisible check is *positive* evidence
about the whole page — and it stays true whatever else is co-present, because
an opaque shell is free to contain anything at all, including something shaped
exactly like the thing you know how to handle.

**Highest capability wins.** The other reflex: when two classes are possible,
take the one you can do something about, because at worst you waste an
attempt. That reasoning is only sound when the wasted attempt is free and its
failure is legible. Neither holds. The attempt costs a model call, a gesture,
or a person; and its failure is **indistinguishable from a genuine attempt at
a genuine instance of that class**, which is worse than the cost. You now have
a metric that says you clear this class some fraction of the time, computed
over a population that was never that class.

## The test

There is one question to ask of a classifier in this subject, and it is not
about accuracy:

> **Does your classifier's error direction point at an honest refusal?**

An optimistic classifier's errors point at a confident claim to handle
something you cannot; a pessimistic one's errors point at declining to try
something you might have cleared. Both are errors. Only the second produces an
output the caller can act on, and only the second keeps the success rate of
each response measured over the population it was actually elected for.

This is the acquisition-path form of
[unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value): an
ambiguous body is a *we do not know*, and rendering it as the most capable
definite class is the laundering step. The boundary where it happens is the
one where a maybe meets a switch statement that has no maybe.

## Procedure

1. **Order the classes by capability**, least to most, once, in the document
   that defines the vocabulary. The order is a design artifact, not an
   emergent property of the code.
2. **Give the least capable classes positive markers of their own.** A class
   reached only as a fallback is a class that loses every tie by accident. The
   opaque class must be able to *win* on evidence, not just catch what fell
   through.
3. **Evaluate in capability order, least first, returning on the first hit.**
   The precedence chain then reads as the rule it implements, and a reviewer
   can check it by reading it.
4. **Keep one exception, explicitly.** A signal that is emitted *only* by a
   refusal — never by a page served successfully — is high-confidence proof
   the response is a refusal, and it may outrank a general "this looks like
   real content" guard. Distinguish it in the code from the signals that merely
   prove the *mechanism is present*, which ride along on successfully served
   pages and must lose to content every time.
5. **Refine within a class the same way.** Where a class needs a sub-choice to
   drive a response, default the ambiguous case to the safest sub-choice
   rather than the most specific one, and reuse the class's own markers so the
   sub-choice can never contradict the class
   ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).

Step 5's corollary is worth stating on its own, because it is where the rule
most often leaks: when a detector and a classifier both decide something about
the same evidence, they share the marker vocabulary or they eventually
disagree. A separately-maintained second copy of "what a refusal looks like"
drifts on the first extension, and the drift surfaces as a class assigned to a
page the detector never thought was a refusal.

## The corroboration trap

A guard written as "this narrow signal counts only when corroborated" is
vacuous when the corroborating check can be satisfied by the very token that
triggered it — a substring of the trigger, a broader spelling of the same
word. The guard then passes on every instance and the classifier claims the
tractable class universally, which is the exact failure this technique exists
to prevent, arriving through the door marked *caution*. Require the
corroborating evidence to be a **separate signal**, and write the test that
feeds the trigger token alone and asserts the class does not promote.

## When not to use this

Do not carry this precedence outside the acquisition path. In a
classification problem where the classes are equally cheap to act on and the
evidence is not adversarial, deliberately under-claiming is just a worse
classifier — you are paying accuracy for a safety margin that buys nothing.
The rule earns its cost from two conditions together: the responses are
unequally and non-trivially priced, and the evidence for the cheap-to-act-on
classes is the evidence that is easiest to produce without meaning it.
