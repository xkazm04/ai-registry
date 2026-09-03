---
layer: technique
type: technique
subject: invariant-placement
technique: derived-properties-cannot-be-forged
status: forged
laws: [derivation-names-recomputation, absent-guard-is-loud]
shared_with: []
use_when: [a safety property currently carried by an annotation or a comment, a composite whose guarantee must not survive a part changing, reviewing an override of an automatically computed property, deciding whether a marker should be declared or computed]
---

# Derived properties cannot be forged

A property of a composite can be established two ways. The author can
**declare** it — an annotation, a marker, a comment, a documented promise. Or
the toolchain can **derive** it from the parts, mechanically, every time the
composite is examined. The two look interchangeable in a design document. They
have opposite failure characteristics, and the difference is the strongest
structural argument available in this whole subject.

**A declared property has exactly two failure modes, and no mechanism prevents
either.**

- It can be **omitted**. A part changes so that the property no longer holds,
  and the declaration — which is in a different file, written months earlier by
  a different person — is not revisited. Nothing fires. The property is now
  false and still asserted.
- It can be **asserted falsely**. Someone writes the annotation because the
  code would not otherwise be accepted. It is the cheapest available move, it
  leaves no trace, and every downstream reader treats it as established.

**A derived property has neither.** It cannot be omitted, because it is
recomputed from the parts on every examination — change a part and the
composite's property changes with it, without anyone acting. And it cannot be
asserted falsely, because nobody asserts it at all; it is a function of the
structure.

The everyday instance is cross-thread transferability. Where the toolchain
derives, from a composite's parts, whether it may be moved to another thread or
shared between them, adding a single non-shareable part silently makes the
whole composite non-shareable, and the first attempted transfer is a checker
error rather than a race. The comparison that matters is not against a
*worse* language — it is against the same property carried by a naming
convention and a paragraph in a header, which is what the alternative always
is in practice. That version is advisory, unenforced, and wrong within two
refactors.

## The design move

Wherever a property of a composite is *a function of its parts*, arrange for it
to be computed rather than declared:

- **Prefer a toolchain that derives.** Where the language derives the property
  (transferability, comparability, copyability, layout compatibility), do not
  reintroduce a declaration alongside it.
- **Where the toolchain does not derive, derive it yourself and gate on the
  derivation.** A property computed by a check that walks the parts is
  weaker than one the checker computes — it is a gate, with all of a gate's
  liveness obligations — and it is still categorically stronger than an
  annotation, because it cannot be omitted and cannot be asserted falsely.
- **Never let a declaration and a derivation coexist as peers.** Two sources
  for one property is a race with a delay fuse; the declaration wins in the
  reader's mind and the derivation wins in the machine, and they diverge
  exactly when someone edits a part.
- **Make the *negative* derivable too.** A composite that must *not* have a
  property often has no part that naturally denies it — the parts are all
  benign and the restriction is a fact about the resource behind them. The
  move is to include a zero-width part whose only purpose is to deny the
  property, so that the restriction is derived like every other one rather than
  documented. It costs nothing at run time and converts "please read the note
  saying this handle is not thread-safe" into a refusal.
- **Say how it is recomputed.** Any property that is stored rather than
  computed on demand names its recomputation path
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)),
  and a derived property that has been cached — into a manifest, a generated
  header, a documentation table — is a stored derived value like any other.

## The override is where the guarantee is spent

Every derivation mechanism worth using has an escape hatch: a way for an author
to assert the property in defiance of what the parts imply. It exists because
the derivation is conservative — it must be, to be sound — and there are real
composites whose parts deny a property their behaviour actually has.

That escape hatch is the entire attack surface. The derivation's two
guarantees — cannot be omitted, cannot be asserted falsely — hold everywhere
except at the override, where both are surrendered at once, deliberately, in
one line. So:

- **The override is reserved for overriding the derivation, and for nothing
  else.** Not for silencing a checker, not for unblocking a build, not for a
  case someone has not finished thinking about.
- **Every override carries a written justification at the site**, stating the
  argument for why the property holds despite the parts. An override with no
  justification is an unexamined assertion at the one place in the system where
  assertions are unexamined by construction.
- **Overrides are enumerable and reviewed.** They are the population that
  matters; a codebase can hold thousands of derived properties and a dozen
  overrides, and the dozen is the entire risk. Count them, list them, and let a
  rising count be a finding.
- **An override whose justification is "the checker is too strict" is a defect
  report, not a justification.**

## When not to use it

**Where the derivation is wrong for your composite** — which is exactly the
case the override exists for, and the case where this technique stops
protecting you. A conservative derivation produces false denials, and a
codebase that responds to every false denial by restructuring parts it should
not restructure has let a tool design its data. Use the override; write the
argument; accept that the guarantee at that composite is now the argument's
quality and not the mechanism's.

**Where the property is genuinely not a function of the parts.** Ownership,
sensitivity classification, retention class, regulatory scope: these are facts
about meaning, not structure, and no derivation reaches them. They are declared,
and the correct instrument for a declaration is a gate that requires it to be
present and a review that judges whether it is right — a declared property with
no gate is an
[optional guard](../../../../_laws.md#absent-guard-is-loud).

**Where the derivation is unstable across toolchain versions.** A property that
appears and disappears as the deriving tool improves is a moving contract; pin
the tool, or carry the property explicitly with a gate that checks it against
the derivation.

## Decision rules

- If a property is a function of the parts, compute it; never declare it.
- One source per property. A declaration alongside a derivation is drift with a
  fuse.
- Where nothing in the parts denies a property that must be denied, add a
  zero-cost part that denies it.
- The override is the only place the guarantee is spent — justify it in
  writing, enumerate the overrides, and treat a rising count as a finding.
- A declared property that no mechanism requires is not a property; it is a
  preference with good grammar.
