---
layer: technique
type: technique
subject: declared-process-graph
technique: per-kind-field-whitelist
status: forged
laws:
  - one-authority-per-vocabulary
  - failure-not-empty-success
shared_with: []
use_when: [a declared field appears to have no effect on a running node, adding a node kind to a topology document, deciding whether an unrecognized key is a refusal or a warning]
---

# Per-kind field whitelist

A node in a topology document declares a **kind** — a program to launch, an
operator hosted inside a shared runtime, a bridge to a foreign message system, a
reference to a composite body — and each kind consumes a different set of fields.
The document's shape is therefore not one schema but a family of them, indexed by
kind, and the technique is to make that family explicit: **for every kind, the
complete set of fields it consumes; for every field outside that set, a refusal
that names where the field does belong.**

## The failure this prevents

The alternative is not a different design; it is the absence of one. A parser
that deserializes the union of all fields into one structure and lets each kind
read the ones it cares about will **parse the misplaced field and discard it**.
The document is accepted. The graph starts. The node runs — correctly, by its own
lights, and without the behavior the author declared. Nothing is logged, because
nothing detected anything: the field was well-formed, it was in a legal position
syntactically, and the code that would have noticed is the code that never ran.

This is the purest form of empty success
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The author reads the document as the description of the system; the system reads
a strict subset of it; and the divergence is discovered days later, from the
outside, as behavior that "should be impossible given the configuration". The
cost is not the debugging time. It is that after one such incident nobody trusts
the document, and a topology document nobody trusts is replaced by tribal
knowledge about what actually takes effect.

The same failure has a permissive-looking variant that is worse: accept the
field, log a warning, continue. On a start path a warning is scrollback. The
process that would have read it is a person watching a terminal at three in the
afternoon on the day of the change, and not the automation that deploys it six
weeks later.

## The procedure

**Enumerate the kinds as a closed vocabulary with one authority.** The set of
kinds, and the field set each one consumes, live in exactly one place —
the classifier that decides which kind a node is
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Every other consumer — the validator, the expander, the spawner, the documentation
generator — derives from it. Two hand-maintained copies of "which fields does a
bridge node take" drift on the next kind that is added, and they drift silently,
because the copy nobody updated still parses.

**Classify before you read fields.** The discriminator runs first and answers
exactly one question: which kind is this node? Deriving the kind *from* which
fields are present is the mistake underneath the whole failure class — it makes
every field simultaneously a datum and a type tag, so a misplaced field cannot be
misplaced by construction; it just changes what the node is.

**Refuse anything outside the kind's set, and name the destination.** The refusal
must carry three things: the node's identifier, the offending field, and the kind
or the position that field belongs to. "Unknown field" is diagnosis withheld; the
author wrote the field somewhere, believing it applied, and the single most
useful thing the refusal can say is where it would have applied. In practice most
misplacements are a field written one level up or one level down from its real
home — on the node instead of inside its hosted-operator block, on the composite
instead of inside its body — so the hint is nearly always available and nearly
always the whole fix.

**The hint says move, not remove, whenever the field has a real home.** This is
not politeness. The most common misplacement is a node's own wiring written one
level too high — the inputs and outputs on the wrapper instead of on the
component that consumes them — and an author who follows "remove these fields"
has just deleted the node's connections and made a second, worse document. Where
the field belongs somewhere, the message names where; only where it belongs
nowhere does it say remove.

**Re-assert the discriminator where the classification path short-circuits.** A
whitelist checks the fields a node *sets*, and it deliberately does not include
the kind discriminators themselves — for ordinary nodes, a node carrying two
discriminators is caught by the classifier, which cannot decide what it is. But a
kind whose classification stops early, before the ordinary discriminator check
runs, has no such backstop: its own check is the only validator it will ever
have, and it must reject a conflicting discriminator explicitly. A composite that
also declares a hosted operator is the standard case, and without the explicit
rejection it passes and has the operator block silently dropped.

**Refuse the whole document, not the node.** Skipping the offending node and
starting the rest produces a topology that is a strict subset of the declared
one, which is the same lie in a larger font.

**Report every violation in one pass.** A document with four misplaced fields
should not take four start-fail cycles to correct; the checks are cheap and the
author is holding the whole document in their head exactly once.

## Decision rules

- When a kind is added, its field set is added to the same authority in the same
  change; a kind whose legal fields are defined anywhere other than the
  classifier is not finished.
- When a field is legal on more than one kind, that is a fact about the field and
  it is declared once, not copied per kind — otherwise removing the field from
  one kind leaves it silently legal on the others.
- When a field is deprecated, it stays in the whitelist with a deprecated
  disposition and a refusal message that names the replacement. Deleting it
  outright turns every old document into "unknown field" with no path forward,
  and the author's next move is to guess.
- When a field is consumed only after a document rewrite — an expansion, a
  template instantiation — its legality is checked **before** the rewrite, in the
  code that performs it. A check that runs on the rewritten form cannot see a
  field the rewrite deleted, and that is the exact case where parse-then-discard
  survives an otherwise strict validator.
- The same check runs at **every nesting level and from every entry point**. A
  lint command that checks a fragment in isolation and a start command that
  checks the whole document must apply the identical whitelist, or the lint
  reports a fragment valid and the start path hard-fails on it — the worst
  possible division of labour, because the author trusted the cheaper tool.
- When the document must tolerate forward-compatible additions — a newer author
  writing a field this reader does not know — say so explicitly with a versioned
  envelope, and confine the tolerance to a marked region. Blanket tolerance and
  strict per-kind legality are mutually exclusive, and a document that is an
  instruction to a runtime should choose strictness; a document that is a
  description read by arbitrary tools should choose tolerance.

## When not to use this

Do not apply it to a region of the document that is deliberately opaque —
a node's own configuration block, passed through to the program unread. The
runtime cannot know that vocabulary and must not pretend to; the whitelist
governs the fields *the runtime itself* consumes, and its boundary with the
pass-through region is stated in the document's shape rather than guessed.

Do not apply it to presentational keys — a label, a comment, a layout hint —
that no consumer reads for behavior. Refusing those buys nothing and teaches
authors that the validator is pedantic, which is how a validator's real refusals
start getting worked around.
