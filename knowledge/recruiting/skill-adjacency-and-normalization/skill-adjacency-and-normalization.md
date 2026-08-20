---
layer: golden-path
type: golden-path
subject: skill-adjacency-and-normalization
status: forged
use_when: [matching a candidate's skills against a role's requirements, building or editing a skill taxonomy, deciding what partial credit a near-miss skill earns, debugging why a match fired or failed, extending matching to a second language]
techniques:
  - canonical-term-with-surface-aliases
  - hierarchy-credit-specialization-and-generalization
  - sibling-adjacency-below-the-match-threshold
  - whole-token-matching-over-substring
  - bilingual-surface-parity-and-coverage-floors
  - unmodelled-term-graceful-fallback
---

# Skill adjacency and normalization

Two people describe the same capability and never use the same words. A hiring
manager writes the requirement in the house dialect of their team; a candidate
writes their history in the dialect of the last place that employed them — often
in another language, usually with different abbreviations, always at a different
granularity. Between those two strings sits every automated matching decision a
hiring system will ever make. This subject makes the two comparable, and grades
how much credit a *near* miss deserves without ever letting a near miss be
reported as a possession.

It is two operations that must never be confused. **Normalization** maps a
surface — the literal characters someone typed — onto a canonical term: a claim
about *vocabulary*, that these two strings name the same thing. **Adjacency**
relates one canonical term to another and assigns graded credit: a claim about
*capability transfer*, that holding this makes it likelier you can do that.
Collapse them and every failure of one is indistinguishable from a failure of
the other — a recruiter looking at a wrong result cannot tell whether the system
misread a word or overreached on a relationship, and neither can the person
maintaining it.

## A match is a hypothesis about words, not a finding about a person

The single most consequential sentence in this subject: **a matched requirement
is not a verified capability.** Matching establishes only that the candidate's
record contains a term the taxonomy relates to the term in the requirement. It
says nothing about whether the person did the work, how long ago, at what depth,
or under whose observation. That is the [provenance](../evidence-provenance-weighting/evidence-provenance-weighting.md)
half of the problem and it belongs to the sibling practice; this one owns the
adjacency half. But failing to *say* it is what makes matching systems
dangerous, because every interface renders a match as a green tick, and a green
tick reads to a human as verification.

So: the word "matched" belongs to the internal vocabulary and never appears
unqualified in the recruiter-facing one. What a surface may show is what
matched, at what distance, and on what basis — [inference must look like
inference](../_laws.md#inference-must-look-like-inference), and a taxonomy walk
is inference.

## The credit ladder and the reporting threshold are two different numbers

Almost every serious defect in this area comes from one economy: someone used
the score as the report. **Credit** is what a relationship contributes to a
continuous score — any value in the interval, and small values are useful,
because they break ties in the right direction without asserting anything.
**The threshold** is the line above which the system is willing to *say* "this
requirement is addressed". It is a publication rule, not a scoring one.

The load-bearing arrangement is that the weakest adjacency tier sits deliberately
**below** the threshold. A cousin capability then does exactly what it should —
it nudges a ranking, so that between two otherwise identical candidates the one
who has worked in the neighbourhood sorts higher — while never appearing anywhere
as a capability the person holds. Setting the weakest tier above the threshold
is not a tuning choice; it converts the taxonomy into a machine for minting
claims nobody made.

The corollary: the two numbers must be *visibly* related wherever they live,
with the relationship written down as an invariant and pinned by a test. It is a
one-character edit to raise a constant, and the person raising it six months
later will be tuning recall, not thinking about claims.

## Direction is not symmetric

Hierarchies invite a symmetric reading — "these two terms are related, give
partial credit" — and the symmetric reading is wrong in a way that always
flatters the candidate.

- **Specialization implies the general.** A narrow, demanding instance of a broad
  discipline demonstrates the discipline almost in full; the residual doubt is
  about breadth, not capability. Credit is near, but not at, an exact match.
- **Generalization does not imply the specific.** Holding the broad discipline
  shows only that the narrow instance is *learnable*. That is real and worth
  roughly half an exact match, and nothing more.
- **Siblings imply almost nothing, and that "almost" is the point.** Two
  instances of one parent share vocabulary, workflow and mental model, so a
  practitioner of one arrives faster than a stranger. Real, and small.
- **Distance decays to zero, and fast.** Terms whose nearest common ancestor is a
  grandparent are not neighbours in any sense a hiring decision may use. Return
  zero, not a small number: small numbers across a long requirement list sum into
  a rank change nobody can explain.

Write these as asymmetric constants with the asymmetry commented, not as one
"relatedness" number, because a single number cannot express the direction and
whoever tunes it later will tune it in the flattering direction.

## Three buckets, disjoint and exhaustive

Adjacency only becomes safe once the output has somewhere honest to put a
near-miss. Every requirement lands in exactly one of three states:

- **Addressed** — a match at or above the reporting threshold, carrying its
  strength so a partial hit is distinguishable from an exact one.
- **Claimed but unproven** — the candidate said something on the subject and it
  did not clear the bar. This is where every sub-threshold adjacency hit lives.
- **Never claimed** — the record is silent on this requirement.

The middle bucket is the one systems omit, and omitting it forces every
near-miss into one of the other two. Pushed up, it becomes a false claim. Pushed
down into "missing", it overstates the gap — and where missing must-haves drive
a hard filter, it eliminates a candidate for having offered a related capability
instead of nothing. A two-state model has no correct answer available to it.

## Graded credit only exists where the graph has edges

A credit ladder is inert in a family whose terms carry no parent links: with
nothing to walk, every comparison collapses back to exact-or-nothing. It is
invisible in aggregate and fails in the direction nobody expects — the families
a team modelled *first* tend to be flat lists of tool names, while families
added later get real hierarchies, so near-miss candidates in the founding domain
receive *less* graded credit than equivalents in a domain the product barely
serves. Measure edge density per family, not just term count.

## Surfaces are hostile: the word-grid rule

Normalization works over text people wrote for other humans: inflection,
hyphenation, dotted and slashed compounds, casing, diacritics, plurals, and a
dozen ways to abbreviate one thing. The tempting response is progressive
loosening — fold case, strip punctuation, then, since the two spellings still
differ, compare the texts as compacted, punctuation-free blobs.

That last step is where matching systems die. Once compacted, the comparison is
a substring test, and substring tests over natural language mint capabilities
out of coincidence: a sentence about a personal quality contains the letters of
a mobile platform; a database's name contains its query language; a broad
commercial term contains a narrower one; an infrastructure product's name
contains an unrelated framework. None of these are exotic — they are the
ordinary consequence of deleting the spaces from human prose.

The rule that survives contact with real text: **a compact match must begin
where a word begins and end where a word ends.** Keep the mapping from the
compacted stream back to original character positions and require both endpoints
to land on a word boundary of the *original*. The rule needs exactly one
relaxation — a suffix allowance for single plain-token terms, so an inflected
form in a heavily-inflected language still resolves; a compound term carrying a
hyphen or a dot has no business absorbing trailing characters.

This matters most because the compact fallback usually lives in the
*deterministic* part of the pipeline — the part that runs when no model is
available, the part everyone assumes is safe. A deterministic bug hands out the
same wrong credit to every candidate, forever, with no anomaly in any metric.

## The second language is the first-class one

A hiring product built for a bilingual market is tested, demoed and tuned in
whichever language its builders think in, then used in production on job
descriptions written in the other. The predictable outcome is that the second
language resolves *worst* in exactly the term families the product exists to
serve, because those families carry the most aliases, the most local
abbreviations and the most inflection.

Two disciplines answer this. **Parity is a property of the term, not of the
taxonomy**: every canonical term carries surfaces in every supported language,
and a term with surfaces in only one is an incomplete term. And **coverage
floors per family act as a ratchet**: measure resolution from realistic
second-language text, pin the number, raise it whenever a repair lifts it. Per
family rather than as one global average — an average over a large vocabulary
looks healthy while the family the product sells against sits at half coverage.

## Never assume the domain

A skill taxonomy written by engineers acquires an engineering centre of gravity
within a week, and then quietly mishandles every role that is not one. The
neutral default matters: an unrecognised role family resolves to a general
default, never to the builders' own family, and the vocabulary of families is
opened deliberately beyond the founding domain. This is
[meaning-does-not-live-in-a-label](../_laws.md#meaning-does-not-live-in-a-label)
applied at the top of the funnel — a job title is a display string, and the
rules that consume it must key off a stable, explicitly broadened vocabulary
rather than pattern-matching what the team happens to recognise.

## What happens to a term the taxonomy has never seen

Vocabulary moves faster than any hand-maintained graph, so a matcher meets
unmodelled terms every day. Two responses are wrong: dropping the term (which
reports a requirement as unaddressed when the record answered it verbatim) and
inventing a relationship (which is fabrication). The right response is a narrow
fallback — literal identity credited as the exact match it is, plus a *bounded*
overlap of distinctive tokens for near variants, capped strictly below the
weakest curated adjacency tier so a guessed relationship can never outrank one a
human wrote down. No hierarchy walk, no invented parents, and a marker that the
term was unmodelled so the gap is countable. Unmodelled terms are a work queue,
and the fallback keeps that queue visible rather than substituting for the graph.

## The seam with evidence strength

An unproven skill has two independent causes. The *relationship* can be weak —
reached by generalization or sibling adjacency rather than an exact match. The
*basis* can be weak — the record asserts the skill without showing it. It can be
both. A reason vocabulary distinguishing adjacency from provenance from both is
what lets a recruiter act correctly: an adjacency-only doubt is answered by a
targeted probe ("you've done the broader thing — walk me through the narrow
instance"), a provenance-only doubt by asking for evidence of work the person
may already do well. Collapse the reasons and both probes become the same
useless generic question.

The rule that keeps them independent: adjacency never touches the provenance
grade, and provenance never manufactures an adjacency reason. Each dimension
reports its own finding, and the display composes them.

## Failure modes this standard exists to prevent

- **The green tick that means nothing** — a taxonomy walk rendered in the visual
  grammar of verification.
- **Free credit from compaction** — a substring test over punctuation-stripped
  prose minting capabilities out of letter sequences, for every candidate.
- **Symmetric hierarchies** — one relatedness number crediting "knows the general
  field" as though it were "has done the specific thing".
- **Threshold creep** — the weakest tier tuned above the reporting line to
  improve recall, converting nudges into claims.
- **Long-distance credit** — cousins three steps apart contributing amounts that
  sum, across a long requirement list, into an unexplainable ranking.
- **The monolingual taxonomy in a bilingual market** — aliases maintained in the
  builders' language and audited by a global average that hides the collapse.
- **The silent drop** — an unmodelled term treated as an absent one, so a
  candidate who literally named the requirement scores as though they had not:
  [absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence)
  in its normalization costume.
- **The two-bucket output** — matched or missing, with no home for a near-miss.
- **The flat family** — a term list with no parent edges, where the credit ladder
  is inert and the global metrics look fine.
- **The engineering-shaped world** — a role family vocabulary that handles the
  builders' own domain well and everything else by accident.

## The techniques

- [canonical-term-with-surface-aliases](techniques/canonical-term-with-surface-aliases.md)
  — one identity per capability, and the lint that keeps the graph honest.
- [hierarchy-credit-specialization-and-generalization](techniques/hierarchy-credit-specialization-and-generalization.md)
  — asymmetric directional credit, and why the directions differ.
- [sibling-adjacency-below-the-match-threshold](techniques/sibling-adjacency-below-the-match-threshold.md)
  — the nudge that is never a claim, pinned as a contract.
- [whole-token-matching-over-substring](techniques/whole-token-matching-over-substring.md)
  — the word-grid rule, its one relaxation, and the gates it earns.
- [bilingual-surface-parity-and-coverage-floors](techniques/bilingual-surface-parity-and-coverage-floors.md)
  — per-family coverage as a ratchet, and why the second language degrades first.
- [unmodelled-term-graceful-fallback](techniques/unmodelled-term-graceful-fallback.md)
  — bounded credit for terms the graph does not hold, and the queue that makes.
