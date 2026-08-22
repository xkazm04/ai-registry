---
layer: golden-path
type: golden-path
subject: hash-pinned-translation-pipeline
status: forged
use_when: [translating a large content corpus into many locales, deciding which translated units a source edit invalidated, budgeting a re-translation run, a green completeness board over prose nobody has re-read since the source moved]
techniques:
  - source-hash-provenance
  - drift-classification
  - hash-scope-choice
  - emitter-detector-hash-parity
  - translation-fan-out-sizing
  - shape-sync-is-not-content-sync
---

# Hash-pinned translation pipeline

A translated unit is a **derived value**. Somebody — a person, a service, a
large language model — took a piece of source-language content as it stood at
one moment and produced a target-language piece from it. The source keeps
moving; the derived value does not. So the only question worth engineering
around is not "is this locale translated?" but **"is this translation still
derived from what it claims to be derived from?"** — and a corpus that has not
recorded what each translation was derived from cannot answer it at all, for
any unit, ever, without a bilingual reader and an afternoon.

Hash-pinning is the practice of making that question answerable mechanically:
every translated unit stores the **content hash of the exact source revision it
was made from**, alongside when it was made and by whom, and a detector
recomputes that hash against today's source to name — unit by unit, locale by
locale — precisely which translations have gone stale. The pipeline that
results is not "we translated it once." It is "we can re-translate exactly the
four units that moved, in exactly the three locales that hold them, for a cost
we knew before we started."

Machine and model-assisted translation drove the marginal cost of one unit
toward zero, and that quietly moved the whole problem: when translating was
expensive nobody did it twice and everyone knew exactly what they had; when it
is cheap, corpora go large and multilingual fast and the scarce resource
becomes **knowledge of what needs translating**. A team that cannot scope a
re-translation run has two moves and both are bad — re-translate everything
every release (affordable in machine time, ruinous in review time, because it
churns human-polished prose that was already correct), or re-translate nothing
and let the corpus rot at the speed of source edits.

## The load-bearing distinction: shape sync is not content sync

Every localized codebase builds a shape check first, because a shape check is
a set difference and needs no stored state: does every locale define every key
the source defines, and nothing extra? A generated key type, an exhaustive
compile-time check, a parity gate in the build — these prove **structure**, and
they pass at a hundred percent over a corpus whose prose was translated from a
source revision two quarters gone. There is no type that expresses *"this
string is a translation of that string as it currently reads."* Freshness is a
fact about **two instants**, and every shape check compares two artifacts at
**one**. The gap is structural, not a matter of rigor.

And the failure hides better than the one the shape check catches. A *missing*
translation surfaces in the product as source-language fallback text: visible,
ugly, reported by the first user in that locale. A *stale* translation
surfaces as fluent, confident, plausible prose in the reader's own language
that describes a screen that no longer exists. Nobody reports it, because
nothing looks broken — and the parity board is green, which is precisely why
nobody goes looking. This is the subject's central claim and it has its own
technique:
[shape-sync-is-not-content-sync](./techniques/shape-sync-is-not-content-sync.md).

## The pin lives on the unit, and travels with it

The pin is **per translated unit** — the same granularity the translator works
in — and not per file, per locale, or per corpus. A file-level hash is
correct and useless: edit one unit and every unit in that file reclassifies,
which produces a true statement ("this file has changed") that cannot scope a
single hour of work. The whole value of the practice is the *scoping*, and
scoping is exactly what coarse granularity destroys.

The pin also **travels with the translation**, in the shipped tree, not in a
platform's database beside it. "Is this artifact stale?" is asked by a build
gate, by a reviewer with a checkout, by an agent with no network, and a record
reachable only by querying a service has made freshness an online question
about an offline artifact. The record carries four facts: the unit's stable
identity, the source-content hash, the date, and the translating agent. The
last is what makes a quality question recoverable later — when someone finds a
bad rendering the useful follow-up is "which other units did that pass
produce", and only recorded agent identity answers it. Mature localization
interchange goes further and records the agent that *produced* a translation
separately from the one that last *revised* it, because a single field loses
the ability to say "machine-drafted, human-reviewed".

Note what the record is *not*: it is not review state. Freshness (derived from
current source?) and review (has a human signed off?) are orthogonal axes, and
a system with one field for both will either destroy human polish on every
re-translation run or bless stale text on every review pass. The record's
contents, its placement, the two-axis rule, and the discipline that the pin is
written by the tooling rather than transcribed by the translator are
[source-hash-provenance](./techniques/source-hash-provenance.md).

## Four verdicts, four actions — not a severity scale

A drift detector's output vocabulary is closed and has exactly four members:
**fresh** (recorded hash matches current), **stale** (recorded hash differs),
**missing** (the source has this unit and the locale does not), and
**orphaned** (the locale holds a unit the source no longer has). Each names a
**distinct action** — do nothing, re-translate, translate for the first time,
delete — and that is why the set must not be collapsed into severities. Rank
stale and missing as "warning" and you have thrown away the difference between
work that has a previous target to diff against and work that starts from
nothing; rank orphaned as "info" and it accumulates forever.

The vocabulary is
[one authority](../../_laws.md#one-authority-per-vocabulary): the report, the
work-scoping audit and the release gate all derive from one definition, or
they disagree the first time somebody extends it. And every count it emits
[carries its predicate](../../_laws.md#count-carries-predicate) — "twelve
stale" is not a finding until it says twelve units, under which hash scope,
measured by which function. The verdicts, their actions, and the honest
handling of a translation that carries no record at all are
[drift-classification](./techniques/drift-classification.md).

## What goes into the hash is a policy, written down

The digest's input set is a **statement about what "changed" means**, and it
is the highest-leverage decision in the subject. Hash the whole record and a
tag rename or a reordering pass marks the entire corpus stale, the team spends
a fortune re-translating prose that did not move, and the *next* real finding
is disbelieved — a detector with a history of false positives has a shorter
useful life than no detector. Hash only the body and a heading edit ships an
updated title in the source language and a stale one everywhere else, reported
as fresh, which is the worse failure because the number is green.

The rule is short: **a field is in the hash if and only if a change to it
should force a re-translation** — equivalently, hash exactly the bytes that
were handed to the translator, and nothing that was not. Everything downstream
of that decision (composite ordering, separators, whitespace normalization,
and the fact that changing the scope reclassifies the whole corpus at once and
is therefore a planned migration) is
[hash-scope-choice](./techniques/hash-scope-choice.md).

## The hash function is a contract between two programs

The hash is computed twice by two different programs at two different times:
once by the **emitter**, when a translation is produced, and once by the
**detector**, when freshness is checked. They must agree byte for byte,
forever, including on field order, separators and normalization — sharing a
digest primitive while assembling its input differently is not sharing a hash
function.

When they drift, the failure is loud and completely undiagnostic: the report
says the whole corpus is stale, which is indistinguishable from a genuine
mass source import except by the fact that *everything* moved at once. The
corpus is fine; the instrument moved. The standard is one implementation
imported by both, and where the two genuinely cannot share code, a written
specification with a **fixed test vector both sides assert** — a known input
and its expected digest — because a specification with no shared vector is a
comment, and a comment is not a mechanism. The parity contract, the
version-stamping that makes a deliberate function change a visible format
event, and the whole-corpus-reclassification signature that lets a detector
suspect itself are
[emitter-detector-hash-parity](./techniques/emitter-detector-hash-parity.md).

## The run is budgeted before it is spent

Before a re-translation run starts, a **read-only audit** answers, per locale
and per verdict, exactly how much work exists — not as one total, because one
total is the least useful shape of that number. Four hundred units across
fourteen locales concentrated in one locale is a focused pass; the same four
hundred spread evenly is a broad sweep, and they are different plans, different
schedules and different review assignments. The audit sizes in the unit the
work is actually billed in — source volume, not record count, because a unit is
forty words or four thousand — and it is separately invokable, because an audit
you can only obtain by starting the work is not an audit. It doubles as the
resume ledger: because verdicts are *recomputed from state* rather than tracked
in a job queue, an interrupted run resumes by re-running the audit. That is
[translation-fan-out-sizing](./techniques/translation-fan-out-sizing.md).

## The detector is also a gate

A freshness report nobody is obliged to read decays into a dashboard. The same
detector therefore runs in a strict mode that exits non-zero on any stale or
missing unit, and that mode is a release gate.

One word in that sentence carries the weight, and it is the one that fails
silently: **wired.** A detector carrying a strict flag that its own header
comment calls a release gate, which no pipeline, hook or scheduled job ever
invokes, is not a gate — it is a program that could be one, and it collects all
of a gate's reputational credit while delivering none of its enforcement. The
route in is always the same: the tool is written in one work stream, the last
mile of wiring belongs to another, and nobody owns the seam. So the change that
builds a freshness detector is the change that invokes it, or the invocation
never happens.

The ordinary gate discipline then applies: it must distinguish "checked,
nothing stale" from "read nothing and had nothing to say"
([failure-not-empty-success](../../_laws.md#failure-not-empty-success)), it must
run over the tree that ships rather than a summary of it
([gate-sees-target](../../_laws.md#gate-sees-target)), and the way it is
silenced must be re-translation and never re-stamping. Bulk-rewriting recorded
hashes to current turns the whole corpus green in one command and is the
localization form of deleting a failing test
([deletion-is-not-repair](../../_laws.md#deletion-is-not-repair)) — with the
extra cruelty that after the re-stamp, nothing in the tree remembers which
units were stale.

## Where this subject's walls sit

The [catalog subject](../i18n/i18n.md) next door owns the artifact translations
land in: how strings are keyed and addressed, how a catalog is split and lazily
delivered, how key parity and value parity are gated, how placeholders and
plural categories survive a translator, how a locale is resolved and rendered at
runtime, and what a locale's bytes and typography cost on the wire. All of
that is answerable by looking at the locale files. This subject owns the
**production** of what goes into them: which source revision each unit was
translated from, whether it still is, and what the next run costs. The rule
for picking is one sentence — *if the question can be answered from the locale
files alone, it belongs to the catalog subject; if answering it requires
knowing what the source looked like when the translation was made, it belongs
here.* Neither completeness parity can see staleness, and not for want of
rigor: both compare catalogs to catalogs at one instant, and staleness is a
fact about two.

The closest analogue anywhere in the graph is
[documentation rot detection](../../engineering-process/codebase-stewardship/docs-sync/techniques/doc-rot-detection.md),
which asks whether a prose document is still a plausible description of the
source it is coupled to. Same shape, three differences. Its coupling is
declared or inferred per document and frequently cannot be established at all,
which is why *unverifiable* must be a first-class verdict there, while here
every unit carries its own pin and the analogous state is a much narrower
population. Its comparison is heuristic — timestamps, dead references, counts
that no longer reproduce — where here it is exact. And its two sides are
different kinds of artifact, prose about code, whereas here they are the same
kind in two languages, which is what makes the exact comparison possible at
all. Use that subject for prose that *describes* a system; use this one for
prose that *is another prose's translation*.

[Artifact signing](../../security/signed-artifacts/techniques/canonical-hashing.md)
hashes content too, and the difference is the threat model rather than the
arithmetic. There the hash is adversarial — it proves nobody tampered, so it
needs collision resistance, a canonical byte form robust against a hostile
re-serializer, and a signature over a statement rather than over content alone.
Here it is cooperative: it proves nobody *edited*, and the only adversary is
your own two programs disagreeing. Both disciplines share the one-authority
rule for canonicalization; neither shares the other's stakes. A freshness pin
reaching for cryptographic ceremony has bought insurance against an attacker
who is not in the story, and a truncated digest that would be negligent on a
signature is entirely adequate on a pin.

Three things sit outside all of it. **Translation quality** — register,
terminology, tone — is a review discipline; this subject knows only whether a
translation is *current*, and a fresh translation can be terrible. **The
translating agent's instructions** — how a model is told what it must not
translate, how its output is checked — are real craft that belongs at the
application layer, where a concrete pipeline can be shown. And **similarity
scoring**: fuzzy match percentages answer "how different?", where a verdict
needs "same or not". A pipeline may use both; only the exact comparison can be
a gate.

## The techniques

- [source-hash-provenance](./techniques/source-hash-provenance.md) — the
  record's four fields, its placement in the shipped tree, the freshness/review
  split, and the pin written by tooling rather than transcribed.
- [drift-classification](./techniques/drift-classification.md) — the closed
  four-verdict vocabulary, one action per verdict, and the unpinned unit.
- [hash-scope-choice](./techniques/hash-scope-choice.md) — the digest's input
  set as written policy, composite-scope mechanics, scope change as migration,
  and the prefix scope nobody chose.
- [emitter-detector-hash-parity](./techniques/emitter-detector-hash-parity.md)
  — one function or one asserted specification; parity as necessary and not
  sufficient; the detector that can suspect itself.
- [translation-fan-out-sizing](./techniques/translation-fan-out-sizing.md) —
  the read-only pre-run audit, per locale and per verdict, in billable units,
  doubling as the resume ledger.
- [shape-sync-is-not-content-sync](./techniques/shape-sync-is-not-content-sync.md)
  — why a passing parity gate is the most misleading green in a localized
  codebase, the ordering rule, and the forbidden repair.
