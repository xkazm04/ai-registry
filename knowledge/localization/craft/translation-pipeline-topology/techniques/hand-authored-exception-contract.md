---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: hand-authored-exception-contract
status: forged
laws: [the-source-locale-is-the-source-of-truth, clean-strings-stay-untouched]
shared_with: []
use_when: [a landing page deserves better than machine translation, deciding whether a hand-written translation should be a flag on the language registry, a committed human translation has drifted from the canonical page, choosing which pages qualify for hand authoring, the machine pipeline overwrote a human-written page]
---

# The hand-authored exception contract

A machine pipeline translates at scale but reads like a machine on the
pages where first impressions are made — the landing page, the per-language
README, the page a newcomer judges the whole project by. The exception:
those pages are hand-authored by a human, committed to the source branch
alongside the canonical content, and excluded from the machine flow. The
technique is not the exception itself — every project improvises one — but
the contract that keeps it from rotting.

## A second registry, deliberately separate

The set of languages with hand-authored pages lives in its own
hand-maintained module, independent of the machine registry. This looks
like duplication and is not, because the two registries answer different
questions. The machine registry answers "what does the pipeline build";
the exception registry answers "what did a human write and vouch for."
The sets legitimately diverge in both directions: a volunteer can
hand-write a landing page in a language the machine pipeline does not
build at all, and a fully machine-built language can lack any hand-authored
page. A flag on the machine registry cannot represent either case — it
would block a human contribution on machine readiness, or imply a machine
build where none exists. Two registries with different owners and
different truth conditions stay honest; one registry with a
mixed-semantics flag lies in one direction or the other.

The separation also protects the pages operationally: the machine flow
enumerates its targets from its own registry, so a hand-authored page is
never in the machine's write path and cannot be clobbered by a rerun —
the pipeline analog of
[clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched).
A human-written, human-vouched page is the cleanest string in the project;
a pipeline that can overwrite it has a topology bug, not a configuration
gap.

## What a committed hand-authored page promises

Committing a hand-authored translation is not a one-time act of generosity;
it is a standing contract with three clauses:

- **A quality claim.** The page asserts "a competent human wrote this,"
  which is precisely why it exists outside the machine flow. A
  hand-authored page that is worse than the machine output voids its own
  reason for being — quality is the admission criterion, not authorship.
- **An author.** Someone identifiable vouches for it and is the addressee
  when the canonical changes. An orphaned page has a quality claim nobody
  can renew.
- **An update obligation.** When the canonical page changes, the
  hand-authored translation is wrong until a human updates it, because
  [the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
  and a stale translation misrepresents it while still reading fluently.

The third clause is the one that fails silently. Machine output regenerates
on every run; a hand-authored page drifts, and the drift is invisible —
nothing about the page looks stale, and no reader of only that language can
tell. The contract therefore requires a staleness check: record, per
hand-authored page, which revision of the canonical it was written against,
and compare against the canonical's history — mechanically in CI or
periodically by hand. A canonical page newer than its translation's
recorded baseline is a finding addressed to the author; unanswered long
enough, the honest moves are a visible outdated marker or demotion back to
the machine flow. Silent staleness is the only unacceptable state.

## When to refuse the exception

Hand authoring is a promise to keep up, so refuse it where keeping up is
implausible:

- **Content that changes too often.** A page edited weekly outruns any
  volunteer's update obligation; the exception fits stable, high-visibility
  pages — the landing page, the project introduction — not release notes or
  living reference material. When in doubt, count the canonical page's
  recent change frequency before accepting the offer.
- **No named author.** A drive-by translation with nobody attached to the
  update obligation should be treated as a suggestion to the machine flow,
  not a committed exception.
- **Scope creep.** The exception is for a small set of pages per language.
  A contributor hand-translating dozens of interior pages is building a
  parallel corpus that will drift wholesale; the machine flow with human
  review is the sustainable shape for volume.

## Failure modes

- **The flag merge.** A refactor "simplifies" by folding the exception set
  into the machine registry as a boolean. Six months later the flag's
  meaning has blurred and nobody can say whether it marks what was built or
  what was vouched for. The two-registry shape is the simplification.
- **Baseline never recorded.** Pages are committed without noting the
  canonical revision they translate, making every future staleness
  question unanswerable except by full re-review.
- **The exception as backlog.** Languages are added to the exception
  registry aspirationally, before any page exists. The registry must list
  what has been written, not what is hoped for.
