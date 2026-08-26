---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: canonical-and-derived-split
status: forged
laws: [the-source-locale-is-the-source-of-truth, coverage-is-counted-not-claimed]
shared_with: []
use_when: [deciding whether machine-translated files belong in the main branch, designing where a site fetches translations from, reviewing a pr that adds generated locale files to source control, choosing a fallback behavior for untranslated content, auditing which committed translations carry a quality claim]
---

# Canonical and derived split

A localization pipeline handles two classes of artifact that look identical on
disk: canonical content, which a human wrote and stands behind, and derived
content, which a machine produced from the canonical and can be regenerated at
will. The topology question — what lives on the source branch, what lives in a
separate derived store, what the consumer fetches from where — is really a
trust-class question. Storage location is how a repository communicates trust,
and the recurring failure is storing derived output where canonical content
lives, which silently upgrades its trust class.

## The commit boundary

When output is machine-translated and no human has reviewed it, keep it off the
source branch: publish it to a separate derived store — a dedicated branch, a
generated-artifacts bucket, a free static file host — that the consumer fetches
at runtime, because a source branch is a claim of authorship and review, and
unreviewed machine output can make neither. In one sighted topology, a public
curriculum of five hundred lessons in a dozen languages keeps every
machine-translated lesson on a separate translations branch; the site fetches
translated markdown at runtime exactly the way it fetches the canonical
language, and the canonical language's requests stay byte-identical to the
pre-i18n path. Translation consumes the source; it never touches the source's
serving path — [the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
applied at branch scale, not just string scale.

When derived output has passed a real review — a human or agent review wave
with anchored findings and a placeholder-parity gate — committing it to the
source branch is legitimate, because the commit now carries a quality claim a
named reviewer stands behind. A second sighted topology, a desktop application
in the same fleet, commits its translated string catalogs to main on exactly
this basis: every string went through the review wave first.

The discriminator between the two topologies: machine output is committed to
the source branch only where a human quality claim stands behind it. Unreviewed
machine output is a derived artifact — regenerable, stored beside its cache
key, never committed as if it were source. Committing unreviewed machine
translation to main makes it indistinguishable from reviewed content: the next
reader, the next diff, the next audit all treat it as authored, and the trust
upgrade happens silently, with no reviewer ever having claimed it.

## The hand-authored exception is a contract

When a specific translated artifact must be excellent — a per-language landing
page, a storefront description — hand-author it, commit it to the source
branch, and register it outside the machine pipeline, because a committed
translation is a contract: it asserts a quality claim and a named author or
reviewer who made it. The curriculum topology carries exactly one committed
exception: per-language landing pages, hand-written for quality, on main, with
their own hand-maintained registry independent of the machine pipeline. The
independence matters — an exception the machine pipeline can overwrite is not
an exception, it is a race; and an exception with no registry decays into an
unexplained special case the next maintainer "fixes" by regenerating it.

## The fallback obligation

When derived content is fetched at runtime, the consumer must be able to serve
canonical content for any unit whose derived version is absent — per unit, not
per language — because a derived store fills gradually and a hard dependency
on its completeness either blocks the canonical experience or ships blank
pages. The curriculum site falls back to the canonical lesson wherever a
translation is not yet published, which is what makes incremental publication
safe at all.

Fallback creates the accounting obligation: a locale that silently serves
canonical content looks complete while being empty. Key or file parity proves
nothing; completeness for a fallback locale means derived values actually
present and checked, and the honest percentage goes in the summary —
[coverage is counted, not claimed](../../../_laws.md#coverage-is-counted-not-claimed).
A dashboard that counts files served rather than translations present will
report 100% on day one of an empty pipeline.

## Failure modes

- Unreviewed machine output committed to main "for simplicity": trust class
  silently upgraded; six months later nobody can say which files were reviewed.
- Derived store treated as canonical: someone hand-edits a translated file in
  the derived store, the next pipeline run regenerates it, and the edit is
  lost. Hand edits belong in the canonical source or in the hand-authored
  exception path, never in regenerable output.
- Canonical serving path entangled with the pipeline: the source-language
  experience now depends on translation infrastructure being up. Keep the
  canonical path byte-identical to its pre-i18n form; the pipeline is additive.
- Fallback measured as coverage: "12 languages live" claimed while most units
  serve canonical text. Count derived values present, per language, per unit.
- The exception without a contract: a committed translation with no named
  reviewer and no registry entry is unreviewed output on the wrong branch,
  however good it reads.
