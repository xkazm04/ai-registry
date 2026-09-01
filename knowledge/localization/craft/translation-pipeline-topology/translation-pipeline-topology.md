---
layer: golden-path
type: golden-path
subject: translation-pipeline-topology
status: reconciled
use_when:
  - deciding what translated content is committed, generated, or served at runtime
  - a repository is about to commit machine translations to its source branch
  - designing or reviewing a CI translation pipeline for a large content set
  - a language switcher offers languages the store cannot serve
  - adding a language requires touching more than one file
techniques:
  - canonical-and-derived-split
  - source-hash-translation-cache
  - sharded-translation-ci
  - canonical-fallback-serving
  - language-registry-single-source
  - hand-authored-exception-contract
  - source-identical-value-audit
---

# Translation pipeline topology

The language subjects in this bundle answer one kind of question: what a
*correct* translation is — register, script, agreement, the rules a native
reviewer holds a string to. This subject answers the question that comes
before any of that and outlives every individual string: **where do
translations live, how do they move, and what may claim to be source?**
Topology is decided once per repository, usually implicitly, usually by
whoever wired the first language in — and every later language, reviewer
and consumer inherits that decision.

The stance, in one sentence: **a translation's storage location is a trust
claim.** The source branch asserts "a human stands behind this"; a derived
store asserts "a machine produced this and can produce it again". The
principal failure of localization pipelines is not bad translation — the
language subjects govern that — it is *trust-class laundering*: unreviewed
machine output committed beside reviewed content, indistinguishable from
it, inheriting its authority ([the source locale is the source of
truth](../../_laws.md#the-source-locale-is-the-source-of-truth) is this
bundle's anchor for which text may claim primacy; this subject extends the
same discipline to which *translations* may claim review).

## The two legitimate topologies, and the discriminator

Both of these are correct, in different repositories, and the discriminator
is a single question: **does a human quality claim stand behind the
translated text?**

- **Reviewed-and-committed.** Every translated string passed a review gate
  — anchored findings, format checks, a named wave — before landing. The
  catalog is source; it is edited, diffed and owned like source. This is
  the topology for product string catalogs, where every string ships to a
  user and the review investment is the point.
- **Derived-and-served.** Machine translations never touch the source
  branch. They live in a derived store (a branch, a bucket, release
  assets), keyed to the exact source they were made from, regenerable at
  will, served at runtime with per-unit fallback to the canonical
  language. This is the topology for large corpora where full human review
  is not on offer — and its honesty is structural: nothing in the source
  branch claims a review that never happened.

The hybrid is the norm, and it is a *contract*, not a leak: a small,
enumerated set of hand-authored translations may live on the source branch
inside a derived-and-served pipeline — because for exactly those pages a
human wrote and vouched for the text
([hand-authored-exception-contract](./techniques/hand-authored-exception-contract.md)).
What is never legitimate is the drift between the two: machine output
promoted to the source branch because committing was convenient, which
upgrades its trust class silently and permanently
([canonical-and-derived-split](./techniques/canonical-and-derived-split.md)).

## What the derived topology owes its consumers

A derived store is allowed to be incomplete every day of its life — that
is its virtue; a language is servable from the first shard — but only if
three obligations hold:

- **Every miss falls back to canonical, per unit.** A reader never gets a
  blank, an error, or a stale mix inside one unit; and the canonical
  reader's path is byte-identical to what it was before languages were
  added ([canonical-fallback-serving](./techniques/canonical-fallback-serving.md)).
- **What is offered equals what is served.** The switcher, the export
  matrix, every surface that names a language derives from the same
  registry that drives the builds — so no surface can promise a language
  the store lacks
  ([language-registry-single-source](./techniques/language-registry-single-source.md);
  [coverage is counted, not claimed](../../_laws.md#coverage-is-counted-not-claimed)).
- **Work is incremental and resumable by construction.** Derived units are
  keyed by a digest of their exact source, the cache publishes with the
  store, and an unchanged source unit is never re-translated
  ([source-hash-translation-cache](./techniques/source-hash-translation-cache.md));
  CI shards are sized so every job finishes and publishes inside the
  runner's hard limits, with disjoint write slices
  ([sharded-translation-ci](./techniques/sharded-translation-ci.md)). The
  unit of progress is the published shard — an attempted run that could
  not publish is compute spent on nothing, forever.

## What the reviewed topology owes its consumers

The committed catalog makes the stronger claim — *a human stands behind this* —
and therefore carries the harder obligation: the claim has to be checkable at
the door, because nothing downstream can tell a reviewed string from a
placeholder by looking at it.

- **Key parity is not a coverage number.** That every locale carries every key
  says a key exists, never that its value was translated; and per-unit fallback
  actively hides the difference, rendering source-language text that reads like
  a shipped translation. Translatedness has to be recovered from the values —
  by comparing each against the source locale, against a committed allowlist of
  the values legitimately allowed to match
  ([source-identical-value-audit](./techniques/source-identical-value-audit.md);
  [coverage is counted, not claimed](../../_laws.md#coverage-is-counted-not-claimed)).
- **The floor of that check is per-locale, and it is a terminology decision.**
  How much of a correct catalog legitimately matches its source is set by the
  target's script and borrowing register, not by how well it was translated — so
  the allowlist is enumerated and ruled against each language's termbase, never
  reduced to one percentage across locales.

## Failure modes this subject exists to prevent

- **Trust-class laundering** — unreviewed machine output committed as if
  reviewed; the drift is invisible until a native speaker files the bug.
- **The all-or-nothing job** — one run per language, larger than the
  runner's limit, timing out before publishing; infinite spend, zero
  progress.
- **The promising switcher** — a UI offering languages the pipeline never
  built, because offer and build read different lists.
- **Re-translation churn** — unchanged source re-translated every run,
  producing diffs nobody asked for in text nobody reviewed
  ([clean strings stay untouched](../../_laws.md#clean-strings-stay-untouched),
  at pipeline scale).
- **The silent hand-authored rot** — committed exception pages drifting
  from a canonical that moved, with no staleness check tying them back.
- **Parity mistaken for coverage** — a green key-parity build read as a
  translation claim, in a catalog format that cannot represent "untranslated"
  and a type contract that makes copying the source value the only legal way to
  add a key.

## Boundary

What a correct translation *is* belongs to the language subjects. How a
review wave is run — anchors, exemplars, gates — is the craft the fleet's
review skills carry, and it applies inside the reviewed-and-committed
topology. This subject owns the storage, movement and trust shape those
activities happen in, and it is deliberately engine-agnostic: swap the MT
model, the CI vendor or the host and every rule here survives, because
none of them is named.
