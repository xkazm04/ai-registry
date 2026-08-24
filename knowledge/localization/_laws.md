# Laws — localization

Cross-cutting invariants. Techniques cite them by anchor; a technique that cites a law
must genuinely rest on it. Each recurred across every language this bundle covers,
usually with an incident attached — they are the shape of the domain, not style
preferences.

---

## <a id="format-skeleton-is-inviolable"></a>The format skeleton is inviolable

Whatever the message-format system, a translated value keeps the source value's
machine-readable skeleton byte-identical: every placeholder name, every rich-tag name,
every syntax keyword, every brace. The words move; the skeleton does not. A renamed
placeholder or a translated syntax keyword is not a style defect — it is a runtime
failure that ships silently, because the string still reads fine to every human
reviewer. Any audit that types errors marks a skeleton break **critical**
unconditionally, and any bulk-write path refuses a value whose placeholder set differs
from the source's.

The corollary that trips careful translators: *position* is not part of the skeleton.
Moving a placeholder to where the target grammar wants it is required, not permitted —
the failure mode is preserving English word order out of caution, not moving a brace.

## <a id="the-source-locale-is-the-source-of-truth"></a>The source locale is the source of truth

Translation consumes the source catalog; it never edits it. A source string that is
ambiguous, concatenated from fragments, missing a plural, or carrying a hardcoded
format is a **source defect**: it caps quality for every locale at once, and the fix
belongs to the source's owner, not to whichever localizer hit it first. Source defects
are recorded in a durable register and surfaced — never silently worked around in one
locale, which hides the defect while the other locales keep paying for it.

## <a id="every-finding-cites-an-anchor"></a>Every finding cites an anchor

A translation error exists when a finding can cite the rule it breaks: a termbase row,
a style rule with an identifier, a grammar rule, a format contract clause, a length
budget. "This feels translated" with no anchor is taste, and acting on taste is how
review loops degrade strings that were already right. The productive response to a
real defect with no anchor is to **mint the anchor** — add the rule, with an
identifier, to the artifact that should have held it — so one review pays for every
string audited after it. This law is what turns a pile of per-language style notes
into a compounding system.

## <a id="one-concept-one-rendering"></a>One concept, one rendering

Within one product and one locale, a domain concept has exactly one rendering, decided
once and recorded in the termbase. Two good translations of one concept is a defect
even though neither is wrong — and its inverse holds too: one settled word must not be
reused for a second concept. Independent translators working disjoint sections **will**
split terms; this is a certainty to budget for with a consolidation pass, not a risk
to hope against. The consolidation signal is mechanical (term present in source,
canonical rendering absent in target — matched on a diacritics-folded stem), but the
ruling on each candidate is judgment: most candidates are legitimate senses, not
violations, and a scripted rewrite from this signal destroys correct distinctions.

## <a id="the-authority-is-a-hypothesis"></a>The authority is a hypothesis until counted

Style authorities disagree with each other, and termbases drift from the catalogs they
govern. Before enforcing any rule — a published style guide's row, a glossary entry, a
register decision — count its actual occurrences in the catalog it is about to be
applied to. When the catalog is coherent and the authority is absent, the catalog wins
and the authority's row is corrected in place, with the ruling recorded so no later
run re-litigates it. A product may deliberately overrule its house authority; that is
legitimate exactly when the overruling is written down where the rule lives.

## <a id="clean-strings-stay-untouched"></a>Clean strings stay untouched

A refine pass rewrites only what a typed finding flagged. Unanchored "improve it
again" passes measurably degrade translations that were already right, and a wholesale
overwrite of a human-reviewed catalog is a regression by definition. The discipline
holds at every scale: per string (no drive-by rephrasing), per batch (gated refine),
and per system (sparse patches over full-catalog rewrites, so a clean value cannot be
accidentally rewritten in a merge).

## <a id="coverage-is-counted-not-claimed"></a>Coverage is counted, not claimed

Self-reported completeness runs short — a reviewer asked to audit two hundred strings
audits a hundred and thirty and honestly reports success. Every sweep states the
number actually reviewed against the number assigned, short batches are re-run against
the **current** catalog (never the original snapshot, which reverts the first pass's
fixes), and the honest percentage goes in the summary. A locale whose untranslated
strings fall back silently to the source language extends this law downward: key
parity proves nothing about translatedness, so coverage there means values checked,
not keys present.
