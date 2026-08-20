---
layer: golden-path
type: golden-path
subject: public-verdict-badge
status: forged
use_when: [publishing an assessment result as an embeddable artifact, designing a badge or seal endpoint, deciding what an embedder may restyle, setting cache policy for a public verdict surface, counting how often an embedded artifact was seen]
techniques:
  - verdict-honesty-qualifiers
  - neutral-state-vocabulary
  - customization-scope-guard
  - outcome-branched-cache
  - embed-snippet-contract
  - embed-reach-attribution
---

# The public verdict badge

A badge is a **third party's assessment of someone, published as a small
artifact that the assessed party pastes into their own public surface.** It is
tiny — a strip of pixels carrying a label, a value, and a colour — and it is,
by a wide margin, the most-read thing your assessment product will ever
produce. The full report has a readership measured in the people who cared
enough to click. The badge has a readership measured in everyone who ever
loaded the page it sits on. The ratio is routinely two or three orders of
magnitude, and it runs entirely in the direction of the artifact with the
least room to explain itself.

That asymmetry is the whole subject. Everything a principal practitioner does
here follows from one premise: **the badge is not a summary of the report; it
is an independent publication that will be read alone, by people who will
never see the report, in a context you do not control.** It therefore carries
its own honesty budget, its own refusal rules, and its own caching contract —
not inherited ones. A team that treats the badge as "the report's number, but
smaller" has already made the characteristic mistake, and every specific
failure below is a consequence of it.

Three parties share the artifact. The **assessor** computes the verdict and
owns its truth. The **subject** decides whether to embed it at all, and would
prefer it flattering. The **viewer** spends under a second on it and reads two
channels: the colour and the value. The subject's incentive and the viewer's
inattention point the same direction, and your artifact is the only thing
between them. Design as though the subject is optimizing and the viewer will
never click — because on the numbers, almost none of them do.

## Where this subject stops

Four neighbours own adjacent ground, and none of it is re-derived here.

[Scoring rubrics](../scoring-rubrics/scoring-rubrics.md) own the **production**
of the verdict — which dimensions participate, how they normalize, what the
number means, and how a rubric refuses to score a dimension it could not
measure. This subject begins one step later: the verdict exists, it is
correct, and it is now leaving your product with your name attached and none
of your context. Nothing here relitigates the score; everything here concerns
what may be *asserted* about it in fourteen characters.

[Signed artifacts & provenance](../signed-artifacts/signed-artifacts.md) own
provenance of build outputs — integrity of carried bytes, named signing
identity, admissibility on import. A badge is a *rendered claim about a
subject*, not a carried build output, and signing does not make it
trustworthy: being served only from the origin that computed it, and refusing
to assert what it cannot support, does.

[Usage analytics](../usage-analytics/usage-analytics.md) own **internal**
measurement — which product surfaces earn their maintenance cost. The reach
tally here observes a surface you do not own, through requests that mostly
never arrive, from headers you cannot trust. It is a *declared lower bound*,
never a usage metric, and it must not join instrumented product events in a
dashboard without that label travelling with it.

[Measurement honesty](../measurement-honesty/measurement-honesty.md) owns
lower-bound disclosure generally — establishing the direction of a number's
bias, and phrasing a floor so the phrasing survives a screenshot. This subject
applies that to one unusually lossy measurement and adds the defences a
*public, forgeable* surface needs on top.

## The badge is cropped, restyled, and read without its neighbours

Four facts about the environment drive every rule that follows, and each one
is routinely discovered the hard way.

**It gets cropped.** Screenshots, thumbnails, aggregator cards, and narrow
viewports keep the right-hand portion of a badge — the value — and lose the
left-hand label. Any qualifier that lives only in the label ("preview score",
"partial coverage") is therefore a qualifier that vanishes exactly when the
badge is most decontextualized. Qualifiers belong in the **value**.

**It gets restyled.** Whatever parameters your endpoint accepts, an embedder
will use, and will use to look their best. Some parameters are cosmetic;
others move meaning. Colour is not cosmetic. Hue is the single most-glanced
channel in the artifact, the one a viewer reads before parsing a glyph, and an
embedder who can render a failing verdict on bright green has undone every
other honesty guard the badge carries in one query parameter. The mirror-image
obligation applies to your own rendering: because hue carries so much of the
message, the verdict must **also** survive without it. A pass/fail pair
distinguished only by red and green is invisible to a substantial share of
viewers, so the verdict carries a redundant non-colour marker — a glyph, a
symbol, a word — inside the value.

**It gets cached.** Between your origin and the viewer sit image proxies,
aggregator caches, and browsers, and they will honour your directives for a
long time and your intentions not at all. A cache lifetime is therefore not a
performance setting; it is a statement of **how long you are willing for this
claim to be true on someone else's page after it stops being true on yours.**

**It gets hammered.** A public artifact on a popular page is fetched by
crawlers relentlessly, most of it for subjects that do not exist. That traffic
shape makes negative caching necessary and makes it dangerous, because the
same mechanism that shields you from crawlers will pin a wrong answer in front
of real viewers if it is allowed to cache the wrong kind of miss.

## What a badge may assert

The badge's honesty rule is stronger than the report's, because the badge has
no room for the sentence that would have saved it. Three assertions are
permitted, and everything else is a neutral state:

1. **A resolved verdict.** The assessment ran to completion over sufficient
   evidence, for this subject, now. It renders as a value with its verdict
   colour and nothing else.
2. **A resolved verdict with a qualifier.** The verdict is real but its scope
   is narrower than a reader would assume — a preview over partial input, a
   result computed from a bounded sample, a figure that is deliberately stale.
   The qualifier is part of the value string, and it is the discipline of
   [verdict-honesty-qualifiers](techniques/verdict-honesty-qualifiers.md).
3. **A neutral state.** There is no verdict to publish — not yet, not for this
   viewer, not for this shape of subject. Neutral states get their own closed
   vocabulary and their own visual register, deliberately unmistakable for
   either a pass or a fail:
   [neutral-state-vocabulary](techniques/neutral-state-vocabulary.md).

The load-bearing insight is that these three are not a spectrum with a natural
fallback. The tempting default — when in doubt, qualify — is wrong, and the
line where it becomes wrong is sharp: **a qualifier can honestly narrow a
claim, but it cannot rescue a claim about the wrong kind of thing.** A single
subject's provisional result, labelled provisional, is an honest artifact: the
reader now knows what they are looking at, and the thing they are looking at
exists. An average computed across many provisional results is not a
provisional average — it is a number about nothing, because no aggregate of
previews previews anything. There is no adjective that makes it honest.
Provenance, at that point, is a **refusal**, not a suffix: the badge renders a
neutral state instead of a qualified number.

The test, applied to every proposed qualifier: *if it were removed, would the
remaining claim be merely over-broad, or about a thing that does not exist?*
Over-broad is qualifiable. About-nothing is refusable.

Refusal has three other standing triggers, each of them a leak in disguise if
you get it wrong:

- **Privacy.** A private subject's verdict is never disclosed on a public
  endpoint — not qualified, not partially, not by rendering a distinguishable
  "private" state that a probe can use as an oracle. Public endpoint, public
  corpus, per-row opt-out honoured; everything else is the same neutral
  "unknown" a nonexistent subject gets.
- **Absence.** A subject nobody has assessed gets a neutral state, and the
  badge endpoint **never triggers the assessment**. A read-only public surface
  that can start work is a free, anonymous, crawler-amplified job queue
  pointed at your most expensive code path.
- **Failure.** An instrument that could not run is not a verdict of any
  colour. It is a transient neutral state with a short life, and the
  distinction between "genuinely no such subject" and "our side broke" is what
  the cache policy is branched on
  ([outcome-branched-cache](techniques/outcome-branched-cache.md)).

## The surface you hand to embedders is a contract

Two artifacts leave your product alongside the image, and both are underrated.

The **snippet** — the few lines a subject copies into their page — silently
decides what their badge will mean for years. Its cardinal rule: *every
parameter that changes the meaning of the verdict must be explicit in the
generated snippet, even when it is also the server default.* A snippet that
omits a threshold inherits whichever threshold your service happens to hold
later, which is to say the badge asserts a bar its author never saw and never
chose, and that changes under them silently. Defaults are for convenience
parameters; meaning parameters are pinned.
[embed-snippet-contract](techniques/embed-snippet-contract.md) covers the
whole surface, including the alternative text — which is what a screen reader
and a text-mode viewer receive *instead of* your carefully honest pixels, and
which is therefore not decoration but a second rendering of the same claim.

A second, easily missed obligation lives at the same seam. Where the verdict is
a *gate* — pass or fail against a bar — the badge is one of several surfaces
asserting that bar, alongside whatever actually enforces it in a pipeline and
whatever an administrator configured. Those surfaces must resolve the bar from
one authority, and a caller-supplied parameter may only ever **tighten** it,
never weaken it. Get this wrong and the badge on a public page announces a
confident pass against a bar the organization already raised — or, worse, any
embedder mints a green verdict by relaxing a threshold in a query string.

The **customization surface** decides who may restyle what. The workable line
is not "no customization" — embedders have legitimate needs, and a badge that
clashes with every page is a badge that gets replaced by a hand-drawn one you
control even less. The line is **scope**: cosmetic dimensions are open,
meaning-bearing channels are closed, and the closed set is enforced at the
render layer rather than in documentation.
[customization-scope-guard](techniques/customization-scope-guard.md) is the
discipline, and its sharpest specific rule is that a colour parameter may be
offered *for neutral states only* — where there is no verdict for a hue to
misrepresent — and never for a verdict fill.

## Caching is an honesty mechanism wearing a performance costume

Every public badge endpoint needs aggressive caching; the traffic will not
survive otherwise. The mistake is to express that need as one blanket
lifetime, because the four outcomes a badge endpoint produces have completely
different truth half-lives. A resolved verdict is stable for hours and cheap
to serve stale. A customized rendering of the same verdict is just as stable
but must **not** be shared-cached, because shared caches in front of an image
endpoint commonly key on path alone — one embedder's private styling would
then be served to everyone else's viewers. A neutral "not assessed"
should expire fast, because it becomes wrong the moment somebody runs the
assessment, and staleness here punishes the exact user who just did the work.
A transient failure must barely be cached at all — and, critically, must never
be **negative-cached**, because a negative cache entry born from a five-second
outage will show "unknown" to every viewer of a popular page for the entire
window. Only a *genuine* miss may be negative-cached. That branch is the
technique.

## Counting reach without lying about it

You will want to know how often the badge was seen, and the subject will want
to know too, because "seen by N people" is the argument for embedding it. The
number is unrecoverable in principle: caching proxies — including the ones
your own long lifetimes create — absorb the overwhelming majority of
impressions before they become a request you can count. So the tally is
published as a **declared lower bound**, with the absorbing mechanism named,
declared at the source of the number rather than at the render site.

The second half is that the surface is *forgeable*: the only signal telling
you where an impression happened is a referrer header any client may invent.
Uncapped, that mints unbounded rows — a fabricated popularity metric and a
write-amplification vector in one. A per-subject cap on distinct attributed
sources is the structural fix; refusing to attribute is the honest fallback.
[embed-reach-attribution](techniques/embed-reach-attribution.md) carries both
halves.

## What good looks like, compressed

- Every qualifier the badge carries is inside the **value**, and survives the
  badge being cropped to its right half.
- Neutral states come from one closed vocabulary, render in a register no
  viewer confuses with pass or fail, and are the same for "does not exist" and
  "private".
- No aggregate is published as a qualified number when its members are
  themselves provisional — it renders neutral, and the refusal is documented
  where the endpoint is defined, not in a ticket.
- The public endpoint is strictly read-only: it never starts an assessment,
  never touches a non-public subject, and honours per-subject exclusion.
- Cache lifetime is a function of the outcome, with negative caching reserved
  for genuine misses and explicitly forbidden for transient failures.
- The customization surface names its open dimensions positively; a verdict
  fill is not among them, the restriction is enforced in code, and the verdict
  stays legible without hue via a glyph or word inside the value.
- Where the verdict is a gate, every surface asserting the bar resolves it
  from one authority, and caller parameters may only tighten it.
- The generated snippet pins every meaning-bearing parameter explicitly and
  ships alternative text that repeats the full claim, qualifier included.
- The reach tally is phrased as a floor wherever it renders, names caching as
  the absorbing mechanism, and is capped per subject against forged sources.

## The techniques

- [verdict-honesty-qualifiers](techniques/verdict-honesty-qualifiers.md) —
  where a qualifier must live for it to survive cropping, which claims a
  qualifier can narrow, and the class of claim it can never repair.
- [neutral-state-vocabulary](techniques/neutral-state-vocabulary.md) — the
  closed set of non-verdict states, their visual register, and why "private"
  and "absent" must be indistinguishable.
- [customization-scope-guard](techniques/customization-scope-guard.md) —
  separating cosmetic dimensions from meaning-bearing channels, and enforcing
  the split at the render layer.
- [outcome-branched-cache](techniques/outcome-branched-cache.md) — cache
  lifetime as a claim's permitted staleness, branched by outcome, with
  negative caching reserved for genuine misses.
- [embed-snippet-contract](techniques/embed-snippet-contract.md) — the copied
  snippet as a pinned contract: explicit meaning parameters, honest
  alternative text, a stable link target.
- [embed-reach-attribution](techniques/embed-reach-attribution.md) — the
  impression tally as a declared lower bound over an untrusted, mostly
  invisible surface, capped against forgery.
