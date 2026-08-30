---
layer: technique
type: technique
subject: diff-comparison
technique: invisible-differences
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [a row is marked changed and both sides look identical, deciding how to render whitespace-only and line-ending changes, a reviewer approves code that does not do what they read]
---

# Invisible differences

Every other technique in this subject assumes the difference, once found,
can be *shown*. A whole class of differences cannot: the two sides differ
in characters that occupy no visible extent, or in characters that occupy
the extent of a different character than the one they are. Trailing
spaces, tabs against spaces, indentation depth, line terminators, byte-order
marks, non-breaking spaces, zero-width joiners and separators, and — the
adversarial end of the same class — glyph-identical characters from other
scripts and bidirectional overrides that reorder the display of text
without reordering the text.

The rendering surface owns this, entirely and alone. The comparison
already got the answer right; the kernel saw two different byte sequences
and said so. What fails is the last step, where the reader is shown a row
marked *changed* whose two sides are, to the eye, the same row. And the
reader's response to that is not "I should look closer" — it is "this
surface is broken", generalized immediately to every other row. **One
unexplainable highlight costs more trust than ten missing ones**, because
a missing difference is invisible while a false-looking one is a standing
accusation against the instrument.

## Two failure directions, and the second one is an attack

The benign direction is the one above: a change is marked and its cause is
unrenderable, so the marking reads as a defect in the tool.

The malicious direction inverts it, and is the reason this technique is not
a polish item. Because the reader believes the rendering rather than the
bytes, a difference that renders as innocuous while executing as something
else turns the comparison surface into the delivery mechanism. This is a
demonstrated, catalogued attack class against review surfaces
specifically — bidirectional-override reordering (CVE-2021-42574) and
glyph-identical substitution (CVE-2021-42694) — and the finding that
matters here is that it landed against *every* surface examined at once,
across unrelated products and independent implementations. That is the
signature of a class defect in how comparison surfaces render, not of
anybody's bug.

Read through this subject's own frame, it is
[_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target) with the
reader as the gate. The reviewer is the check; the rendering is what the
check inspects; and if the rendering is a proxy that can diverge from the
thing being approved, the check is watching a proxy and goes blind exactly
when someone wants it to. So the obligation is not "warn about suspicious
characters" — it is that **the reader's view and the executed artifact must
not be able to disagree**, and where they can, the surface says so at the
character.

## The three classes, and their one vocabulary

The classification that has survived independent reinvention is
three-way, and it is worth stating because "suspicious characters" as a
single bucket is unusable — the response differs per class:

- **No visible extent.** The character renders as nothing, or as a blank
  indistinguishable from other blanks. Operationally: drawing it in the
  text colour on the background colour leaves the background unchanged.
- **Impersonating.** The character renders as, or close enough to, a
  different and more expected character. It has an extent; the extent is a
  lie about which character it is.
- **Out of the expected repertoire.** The character is neither of the
  above but sits outside the set this content is expected to be written
  in — which is not itself a finding, and is a useful *filter* only when
  the expected repertoire is declared. Absent that declaration this class
  is noise, and a surface that marks it anyway trains the reader to
  dismiss the other two.

One closed vocabulary of marks covers all three, defined once and rendered
identically wherever the product compares anything
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)) —
the same rule that governs added/removed/changed, and for the same reason.
It also needs the same escape hatch: content that legitimately contains
material from another script must be declarable as expected, or the marks
become permanent and are read as decoration.

## Whitespace changes carry their magnitude, not a colour

The everyday half of the class deserves the everyday discipline. A
whitespace-only change is rendered with a mark that says **what and how
much** — indentation increased by four, tab replaced by spaces, line
terminator changed, trailing space added — because the reader's next
question is always the magnitude and the colour cannot answer it. A row
tinted "changed" with no visible cause is the worst rendering available;
a row carrying an explicit depth marker is a complete answer that costs
one glyph.

The stakes are not uniform. Where indentation carries meaning, an
indentation-only change *is* a semantic change — a block moving from one
enclosing scope to another with no other edit — and it is precisely the
change the eye cannot catch. That is also why the reader's
whitespace-suppression toggle is dangerous in the specific case it is most
often used: suppressing whitespace in an indentation-significant text can
render a real relocation as no change at all.

## Every suppression is a view, and views are labelled and reversible

This is the same claim the normalization ledger makes, arriving from the
other side. A ledger entry is the *system's* standing assertion that some
class is not a difference. A reader-facing toggle — ignore whitespace,
ignore case, hide generated content, hide reordering — is the *reader's*,
made ad hoc, and it has the identical power to make a real change vanish.
So it inherits the identical obligations, plus one:

- **Visibly on.** The surface states which suppressions are active
  wherever it states its level, not in a settings panel two clicks away.
- **Counted, never silent.** A suppressed class surfaces as a count with
  its predicate — "14 lines differ only in whitespace" — which keeps it a
  *disclosed* omission rather than a fabricated silence. Filters annotate;
  they never delete.
- **Carried by the reference.** The extra obligation: a suppression is
  part of the claim, so any link, citation, or handoff of the comparison
  carries it. Two people opening the same reference and seeing different
  differences is the failure this prevents, and it is worse than either
  seeing the wrong thing alone — they will argue about the change instead
  of about the tool, and neither has any way to discover which of them is
  looking at a filtered view.
