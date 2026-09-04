---
layer: application
type: application
subject: docs-sync
technique: translations-drift-against-the-product
stack: python
status: forged
verified_on: 2026-09-04
verified_against: python@3.12
---

# Two of four landing pages are checked for a retired platform, and the asymmetry is the record

Read against a public CLI at commit `da5044d2`, which ships four landing pages
— a primary in Chinese and three translations — for a tool whose channel set
has changed repeatedly across five releases. Version witness:
`.github/workflows/pytest.yml:41`.

Two tests in `tests/test_auth_guidance_policy.py` check the localized pages,
and neither compares a translation to its source. Both anchor to the product.

## The two halves, and where they differ

`test_localized_readmes_keep_current_bilibili_and_xhs_routes` (`:125-143`)
asserts against **all four** pages: the retired video-download route must be
absent, and the current three-backend routing line for the session-borrowing
channel must be present verbatim. Verified in the tree — the routing line
appears identically at `README.md:218` and `docs/README_ja.md:207`.

`test_localized_readmes_do_not_advertise_retired_channels` (`:145-151`) asserts
against **exactly two** — the Japanese and Korean pages — that two retired
platform names appear nowhere. Not the Chinese primary. Not the English page.

That asymmetry is the whole application. The two pages singled out are the ones
that could carry channels the primary page never listed, because they were
authored directly in their target language rather than derived from it. The
author knew which two, and the shape of the check is the only place that
knowledge is written down anywhere in the repository — there is no comment, no
changelog line, and no contributor note recording it.

## Why a source-pinned pipeline would have reported all four clean

The project has no translation tooling at all, but the counterfactual is worth
stating because it is the technique's central argument and this tree is a clean
instance of both failure modes at once.

A detector that pins each translated unit to the content hash of the source
revision it was derived from asks *is this still derived from what it claims to
be derived from*. Against these four pages it returns clean twice over, for two
independent reasons. The primary page does not list the retired platforms and
never did, so nothing derived from it went stale — **staleness relative to a
source that never carried the claim is zero**. And the Japanese and Korean
pages have no source unit to pin at all, so they are outside the measured
population entirely; a completeness board would count the units it knows about
and show green.

The retirement itself is recorded (`CHANGELOG.md:59-62`), with the upstream
issue link explaining that the platform's anti-scraping measures broke every
available open-source tool. The code moved. The primary page moved. Two
translations did not, and only a check anchored to the shipped channel set
could see it.

## What the realization cannot do

The assertions name two platforms as literal strings rather than deriving the
forbidden set from the channel registry — and the registry exists and is
already used as an authority by the contract tests, which enumerate it via
`get_all_channels()` (`tests/test_channel_contracts.py:16`). As written,
retiring a **third** channel silently leaves the localized pages unchecked for
it, and nothing goes red to say so. This is the technique's own
tautology-versus-drift trade landed on the fragile side: hand-written
assertions cannot go stale in the direction that matters (they will keep
catching these two forever) but they do not grow with the product, so their
coverage decays with every future retirement.

The checks are also capability-level by construction and buy exactly one thing:
no page advertises a channel that does not exist. A mistranslated caveat, an
inverted boundary statement, a promise rendered where the primary hedged — none
of these move any of these assertions. The project's separate pinning of
boundary sentences across the same four pages
([negative-claims-are-pinned](../techniques/negative-claims-are-pinned.md))
covers a slice of that second population, and the remainder needs a reader of
the language.
