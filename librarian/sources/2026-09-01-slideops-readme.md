---
source: github:glukicov/slideops
kind: practitioner repository (mined under an inverted rule)
url: https://github.com/glukicov/slideops
title: "SlideOps — turn a repository into a slide deck that tells you when it stops matching the code"
author: single practitioner
commit: 66af7de143647423bca60fff6e8b1251755947cb
words: 1033 landing page / ~2470 in-tree operating docs / ~4200 skill references
extracted: 8
accepted: 7
declined: 0
already_covered: 1
untriaged: 0
leads: 1
dispatched: 1
applied: 1
unapplied: 1
shipped: 0
fetches_spent: 0
run_id: intake-slideops-readme
siblings: 1
---

# slideops, read for its landing document

The operator scoped this run: *README styling, formatting, and the balance of
visual and text elements; not the content. Forge golden paths for writing
READMEs and apply them consistently across the registered repositories.*

## The class reading, and why it inverted

The source is a practitioner repository, which Phase 2b routes to a clone and an
explicit instruction to read the README **last**, as an advertisement. The
operator's scope inverts that: here the README is the **artifact under study**,
not the ad. The inversion is worth recording as a class note rather than as a
one-off, because it generalises — whenever the operator's question is about a
document's *form*, the file Phase 2b distrusts becomes the primary source, and
the tree's job changes from supplying claims to supplying the evidence that the
form was engineered rather than stumbled into.

Swept anyway, and it paid: `scripts/make_hero.py` (the imagery generator),
`skills/slideops/references/style-guide.md` (a first-party style document that
states each rule beside the command that detects violations of it),
`docs/*.md` (the pages the README routes to), `.github/workflows/ci.yml` and
`.github/pull_request_template.md`. Expected yield stated before triage: 4-8
candidates, one subject-sized gap, the rest small formatting techniques. Actual:
8 extracted, one subject, one technique elsewhere, one instrument.

Zero of three web fetches spent — the fifth consecutive first-party-codebase run
to spend none. Corroboration was corpus-internal and repository-internal, and
the fleet survey was a real measurement on real trees.

## Candidates

**1. Repository landing document: routing, balance, visual rhythm** — ACCEPTED,
XL, forged this session as
`software-engineering/codebase-stewardship/repository-landing-document`.
`research-map` returned no prior art for `readme`, and I did not trust the empty
until I had read the four nearest neighbours: `docs-content-model` owns a docs
*site*, `docs-sync` owns freshness rather than form, `machine-authored-documentation`
owns model-authored acceptance, `markdown-vault` owns markdown as a database.
None owns composition. Spec at `docs/subject-proposal-repository-landing-document.md`,
dispatched to one forge worker, seven techniques landed. Candidates 4-7 below
were folded in as its techniques rather than minted beside it.

**2. Rendered imagery is a coupled surface no text checker can see** — ACCEPTED,
landed as `docs-sync/techniques/rendered-surface-coupling.md` plus wall 12 of
that subject's golden path. Triaged as a technique; verification made it
stronger than triaged. The finding is an **asymmetry between two subjects the
corpus already holds**: `codegen/drift-gating` fails a rendered surface because
rasterization is not byte-stable, and `doc-rot-detection` fails it because an
image cannot be read, so it terminates at the coupling ladder's third rung and
is `unverifiable` permanently rather than occasionally. Each discipline
disqualifies it for a different reason, which is how it comes to sit in a gap
both owners correctly disclaim. Resolution: digest the inputs, never the output.

**3. The PR checkbox that guards a generated image** — ALREADY COVERED, and
recorded here so nobody proposes it again. `docs-sync` already carries
`gate-sees-target` as its towering law with a far stronger exemplar (a hook that
saw 0.00% of 2,367 edits across fifteen months). This repository's PR-template
checkbox is the same shape at lower resolution. It survives as corroboration
inside candidate 2, not as its own landing.

**4-7. Style-rule detectors, input-channel typography, evidence-linked badges,
figure captions** — ACCEPTED, folded into candidate 1 as techniques.

**8. A README conformance checker for the fleet** — ACCEPTED, landed as
`scripts/check-readmes.mjs`. Dependency-free, asserts itself against a
hand-counted fixture before reporting, and takes `--path` so a reference
repository and the fleet are measured on **one** counter.

## The structural fact

The source repository implements the input-digest discipline for every quoted
snippet inside the documents it generates — each citation carries the digest of
the source lines it quotes, verified by a dependency-free sweep in milliseconds
— while the composite image on its own landing page, whose generator's docstring
states plainly that it "rots exactly like a slide does", is guarded by a
review-template checkbox and nothing else. The remedy was one directory away and
one level of abstraction from where it was needed. Nobody designed that; it is
the ordinary case, and it is better evidence for the technique than an adopting
tree would have been.

## Two corrections this run made to itself

Both are worth more than the landings, because both were the instrument catching
its own author.

**The hand-count was wrong and the instrument caught it.** My Phase 3 survey
credited one fleet project with seven images. They were badge images. The
corrected finding is simpler and stronger — **7 of 7 fleet projects carry zero
figures, zero captions, zero callouts and zero routing**, and one has no landing
document at all. The spec had already been dispatched with the wrong table; it
was corrected mid-run and the worker rewrote every citation of it.

**The counter disagreed with the rule, and the rule won.** The forged
`visual-text-cadence` states a *closed break set* — figure, table, fenced block,
callout, or a heading with content under it, with badge rows, horizontal rules,
bare headings and jump bars explicitly excluded as furniture. My draft counter
admitted paragraph breaks and bare headings, and it read the same corpus at 39
lines where the rule's own break set reads 96. Reconciling the instrument to the
rule invalidated the threshold argument the worker had written from the draft
numbers, so the subject's measurements and its defence of fifteen were rewritten
against the corrected distribution (10, 19, 20, 20, 22, 90, 96). The reference
repository now fails the rule too, at nineteen — which is the expected result
and is stated as such: a reference that passed every rule it inspired would be
evidence the rules were fitted to it.

## Apply

`repository-landing-document` (router + cadence + input-channel cluster) ->
**gravity**, mode `experiment`, verdict **better**. Both arms on one instrument:
findings 3 -> 0, words 2,089 -> 581, routed pages 0 -> 7, longest prose run
90 -> 8, nothing-above-the-fold resolved. No content deleted — 1,780 words
relocated into three new pages, and four pages that already existed in that tree
were routed to for the first time.

Mode is `experiment` rather than `code` **because the tree had foreign WIP in the
exact file**: a live 38-line in-flight append documenting an inspect mode. A
branch would not have carried the uncommitted arm A, and switching that repo's
branch under an active session is the incident this method warns about. The
operator authorized the tree; the tree's state, discovered after, is what
capped the mode.

`docs-sync/rendered-surface-coupling` -> **unapplied**, and honestly so. No
managed project has a single authored documentation figure: 6 of 7 have zero
image references in any markdown, and the seventh's 22 are scraped web artifacts
under `data/artifacts/`, not authored docs. There is no seam to test against and
a simulation would have needed invented cases. Return condition: when a managed
project grows an authored figure in a maintained document.

That absence is the same fact as the subject's motivation, seen from the other
end — **a fleet that shows nothing has nothing to keep fresh.**

## Lead (banked, with a return condition)

The source ships a separately rendered social-preview image and never says why.
`multi-surface-degradation` now names the four-tier render ladder abstractly, but
nobody in this run verified what a package registry, a marketplace card or a
search result *actually* strips. Return condition: the next run whose fetch
budget is unspent and whose source touches publishing surfaces — that is a
one-fetch question with a factual answer, and it is the only place this subject
currently reasons rather than measures.
