---
layer: technique
type: technique
subject: ability-authoring-to-engine
technique: declared-vs-referenced-tag-audit
status: forged
laws: [unmeasured-is-not-a-pass, compiling-is-not-wiring]
shared_with: []
use_when: [scoring vocabulary hygiene across a content set, finding references to names nobody declared, finding declared names nobody uses]
---

# Declared versus referenced tag audit

## The concern

A shared vocabulary has two populations: the names **declared** by the system that owns
them, and the names **referenced** by the content that uses them. In a healthy system these
sets are equal. In every real system they diverge, in both directions, and the two
divergences have different politics.

- A name **referenced but not declared** breaks. Something looks it up, finds nothing, and
  either errors or — much more often in a tag-like system — resolves to nothing and the
  condition it guarded silently never fires. This one gets found, because it produces
  symptoms.
- A name **declared but not referenced** breaks nothing. It sits in the registry looking
  exactly like a real name. The next author reads it as available vocabulary and uses it.
  The generator you brief with the registry treats it as house convention. Nothing forces
  anyone to notice, so nothing does.

Most teams audit only the first direction. The insight of this technique is the
**symmetric** treatment, and weighting the two **equally** is a deliberate stance worth
arguing: the first defect costs one bug, which is bounded and eventually observed. The
second costs the reliability of the reference material every future authoring pass depends
on, which is unbounded and never observed. A registry that describes the system is an
asset; a registry that describes a system that used to exist is a trap that no one can tell
apart from the asset.

## The procedure

**1. Collect the declared set from the owning declaration.** Parse the authoritative source
— the one place the system says these names exist. Not a hand-kept list; the same
extraction that briefs the author, so the rule and the check share one source.

**2. Collect the referenced set from every content source that can reference.** This is the
step with the trap in it. A system usually has more than one authoring surface: the
hand-written content, the generated-and-adopted content, the data-driven content. An audit
that reads only one of them reports the others' names as absent and their bugs as
non-existent.

**3. Normalise both sides into one dialect before comparing.** Identifiers that live in two
syntaxes across this seam will match nothing otherwise, and the audit will report a
catastrophe that is entirely an artifact of spelling.

**4. Compute the three sets and score them as an overlap index.**

    matched    = declared ∩ referenced
    undeclared = referenced \ declared
    orphaned   = declared \ referenced
    score      = matched / (matched + undeclared + orphaned)

That is the intersection over the union, scaled to a percentage. Its virtue is complete
explainability: every point lost corresponds to one *named* entry in one of the two problem
lists, so the score is never a mood — it is a count with the names attached. Report the
lists, always. A score without its breakdown cannot be acted on and will be argued with.

**5. Gate the vacuous perfect score explicitly.** Two empty sets divide to nothing and, left
alone, will render as a perfect result. Empty-on-both-sides is not perfect hygiene; it is a
measurement that did not happen — the parse found no source, or the content set was not
loaded. Return the unmeasured state as its own value from the scoring function itself, and
make it impossible to plot beside a real score. Delegating this guard to the caller works
until the second caller arrives, which is why the guard belongs where the division does.

**6. Attribute each referenced name to the side it came from.** Report, alongside the
totals, which references were contributed by each authoring surface. This is what makes a
blind spot visible: if the audit is later computed from one source alone, the attribution
line goes empty and says so, instead of the score quietly improving because half the
references vanished. A metric that improves when a data source disappears is worse than no
metric.

**7. Keep the computation pure.** No I/O, no rendering, order-independent, duplicate-
collapsing. It then runs on either side of the seam, in a test, in a gate, or in a report,
and the number is the same number everywhere.

## Decision rules

- **When you audit one direction, audit both.** A one-directional audit is a tool for
  keeping a registry tidy in the direction that hurts you today.
- **When one direction genuinely deserves more weight, weight it explicitly and publish the
  weights.** Equal is the default and the defensible one; anything else is a policy, and a
  policy that is not written down is a bug.
- **When either input set is empty, the result is unmeasured, not a score.**
- **When an orphan is intentional — reserved vocabulary, a planned feature — annotate it in
  the declaration rather than exempt it in the audit.** Exemption lists inside checks are
  invisible to the people reading the declaration; annotations are not.
- **When a name is undeclared but must ship, it is declared as pending, guarded at use, and
  counted in the delta.** Fabricating a declaration to make the score go up converts a
  visible defect into an invisible one.
- **When the score is used as a gate, gate on the named lists, not the number.** A
  percentage lets a large vocabulary absorb a real bug into rounding.

## When not to use it

- **When the vocabulary is open by design.** Systems where content legitimately mints names
  at runtime have no meaningful orphan set, and the audit reduces to a reference check.
- **When declaration is not centralised.** If names can be declared in several places and
  you can only parse one, the orphan list is fiction. Fix the extraction first, and until
  then report only the direction you can compute — labelled as partial.
- **When the content set is a moving target.** Auditing mid-migration produces a score that
  measures the migration. Snapshot both sides at one revision, or say which revision the
  verdict is bound to.
