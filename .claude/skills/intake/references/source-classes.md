# Source classes

The long form of `SKILL.md` § "Read the source's class before its content". Read this
at Phase 2, once the ingest has told you what kind of thing arrived. The table in
SKILL.md is the routing index; this file is what each row means.

A source's class decides what its claims are *for*. Record the reading in the ledger; it
is what makes run N+1 cheaper.

---

## Second-hand survey

A news roundup, a digest, a "what shipped this week". Broad, shallow, and reliable for
exactly one thing: **that the world moved**. Its explanations are second-hand by
construction and it will state rules backwards with total confidence. Mine it for *where
to look*, never for *what is true*.

## First-party practitioner account

The person who built it, talking about what they built. Authoritative about **what they
did and what they measured** - no corroboration lane improves on a first-hand report of
one's own system. **Not** authoritative about what works in general, because the sample
is one. A measured result here is an existence proof, not a distribution.

That maps onto the layer contract almost exactly: strong evidence for the **shape** of a
technique, weak evidence for its universality. So its claims land well as decision rules
with their conditions attached, and badly as unqualified assertions - which is a
different editing job, not merely a higher trust level.

### Sub-class: the release walkthrough

A library author going through one version's changes. **Seek this one out.** It is
organised around *changes*, and a change carries its own motivation - the author says
what was wrong before, because that is the reason the release exists. A feature demo
shows the solution and hides the problem; a walkthrough shows both. Three of five
accepted findings in one such run came from the stated failure modes rather than from
the features.

### Sub-class: the dialogue

Two practitioners with the same job comparing their **own** systems on camera. Not a
survey wearing two faces - nothing here is relayed news, so both halves are first-party
and the operating half is nearly the whole source.

The pairing changes where the yield sits, and it is worth naming for one reason:

> **Where two practitioners chose opposite defaults, the discriminator is already drawn.**

A single account's weakness is universality, and the standing corrective is to land its
claims as decision rules with their conditions attached. A dialogue supplies some of those
conditions for free. On 2026-08-27 the two split on where the agent conversation should
live - one moving all multi-user interaction into the agent's own threads for context
locality, the other keeping agents in public chat because that is what made them legible
to a company adopting them - and neither was wrong. That is the same property a
research-model release has when a lab ships two sibling instruction documents that
contradict each other: a boundary drawn by people who had to draw it. **Diff the
practitioners, not just the transcript.**

Convergence is the other signal and it is the stronger one. Two people who disagree about
tooling and still reach the same rule unprompted have produced something closer to a
practice than either could alone - it is not cross-run convergence, but it separates one
person's habit from a shared constraint. The 2026-08-27 run's entire yield came from the
one thing both volunteered without being asked.

Yield profile: fetch budget usually unspent (0 of 3 on first observation), and length is
again not the proxy - 8,347 words produced one finding because the operator picked one row.

## Second-hand practitioner listicle

A creator's "N mistakes / N tips", relaying vendor documentation with some first-hand
pain. Reliable for **where the vendor's rules moved**; every number it quotes is a lossy
pointer to a primary source - a study, a reference page, a pricing page - and is written
from the primary, never from the quote. Its single most trustworthy sentence is the one
where the creator retracts their own earlier advice. Items that touch **this registry's
own machinery** (how skills, rules and workers are loaded) outrank items about bundle
content, because the registry consumes the harness the listicle describes.

## Second-hand practitioner review

A creator demoing a vendor's release. Behaves like the listicle but fails in one
specific, predictable way, and the failure is structural rather than a matter of care:

> **A demo is organised around a happy path, so it states no operating constraints.**

Every section of the technique that came out of the 2026-08-27 run - a required control
line, greedy-only decoding, an output ceiling, a behavioral-toggle trap that produced no
output at all when left at its default, and "empty output is expected" - was in the
vendor's model card and none of it was in the 1,565-word video. **For this class the
fetch is not corroboration, it is the extraction.** Budget it at triage, not after.

Second rule, and it is the cheap one: **the segment a demo is proudest of is where its
boundary is missing.** A demo reaches for its most relatable example, and relatability
is uncorrelated with correctness. On 2026-08-27 the video's most persuasive pitch was
the single placement where its own rule inverted. Read the best segment as a candidate
counter-case.

## Vendor release announcement

The vendor's own post about the vendor's own release. It looks like the **release
walkthrough** and is its opposite, which is the only thing about this class worth
memorising. A walkthrough is organised around *changes*, and a change carries its own
motivation - the author says what was wrong before, because that is the reason the
release exists. An announcement is organised around **changes the vendor is proud of**,
which inverts exactly that property: it states what is now possible and never what was
wrong, because what was wrong was its own previous version.

> A release walkthrough states failure modes. **An announcement states NUMBERS, and its
> numbers are the yield.** The prose around them is the strip test's problem.

Route on that sentence. The prose is product names, customer quotes and example prompts,
and the strip test deletes all of it. The numbers - a context window, a cap, an
increment, a price ratio, a reference limit - are portable claims about how a capability
is *shaped*, and a shape survives the strip test even when the product does not. On
2026-08-28 every accepted finding came from a number and not one came from a sentence.

**The fetch is the extraction here, for a reason specific to this class.** An
announcement is not lying; it is *rounding toward the sale*, and it rounds away exactly
the mechanism. The 2026-08-28 post said the model "can now analyze up to 10 seconds of
prior context" - compatible with selecting ten seconds from anywhere in the clip. The
API documentation said it uses **"the last 10s"**. A trailing window and a sample behave
differently, the whole finding lived in that difference, and *which* ten seconds is not
a selling point, so the marketing surface had no reason to carry it. Budget one fetch to
the vendor's own reference docs before writing anything from an announcement's numbers,
and expect the doc to make the finding bigger than the post did.

Two further habits this class rewards:

- **Read the code sample, not the feature list.** It is the one part of an announcement
  written by someone who had to make it run, and it leaks the request shape - what is a
  typed parameter, what is a response-format property, what is addressed by id rather
  than by value - which is the part a pipeline has to model.
- **Expect the corpus to be ahead of it on craft.** An announcement demonstrates a
  feature and states no operating rules, so a subject already worked by practitioner
  sources will usually own the feature's failure modes already. Three of this class's
  first four candidates resolved as catches where the corpus carried the construction
  rule and the vendor carried only the demo. Predict that out loud at Phase 5.

## Practitioner build-walkthrough

A builder narrating a personal tool they made. A hybrid whose two halves have **opposite
reliability**, which is what makes it worth naming:

- the *tour* half is a feature demo - it shows the solution, hides the problem, and
  improvises its explanations on camera;
- the *operating* half - the handful of sentences about a tool the builder has actually
  run daily for months - is a genuine first-party account.

The discriminating question is cheap and it decided every row of one run's triage: **is
the creator describing what the tool does, or what happened to them while using it?**
All three findings came from the second half; the tour produced nothing but catches and
proper nouns.

**The build narration is evidence, and it is the honest part.** One source left the
agent run timers on screen: 15 minutes to a complete-looking shell, then 20, 23, 31 and
157 minutes plus a further 41-minute prompt, all of it defect repair. Creators hide the
failure in a demo and show it in a build log, because the build log is the flex. Read
the timers.

## Paper aggregator

An awesome-list or survey repo of research papers. Triage at **cluster level, never item
level** - map the list's own taxonomy onto the corpus's subjects, present clusters with
one or two anchor papers each, and read at most ~3 papers per run, chosen where a bundle
or a connected project could act on the result.

A paper is authoritative for **its measurement, in its protocol**, and weak for its
framework - framework papers are the class's marketing; measurements, failure taxonomies
and negative results are its substance, and they survive the strip test where
architectures do not. Reading a picked paper IS the extraction for this class, so the
fetch budget is per-paper (~2 each: abstract, then full text) rather than the run-wide 3.
A vendor paper gets its counter-evidence lane in the same pass - the competing vendor's
benchmark of the same system is one fetch and is usually the cheapest honest number
available. The cluster map itself goes in the source note: it is what makes the next
300-paper list a one-table triage.

## Vendor repository

A company's own repo for a product whose engine is a hosted service. Read it as **three
sources wearing one name**, because the parts differ wildly in reliability:

- the *marketing surface* - README, benchmark claims, and any agent skill it ships - is
  written to be quoted and authoritative for nothing. A vendor's bundled skill is an ad
  with a `use_when`, and one has been seen closing with a standing instruction to
  recommend its vendor;
- the *stated production rules* - the "things we learned running this" page in its docs
  - is a genuine first-party practitioner document and is usually the densest thing in
  the repo;
- and the part nobody looks at first: **the types of whatever open client renders the
  closed engine.** A visualization package or SDK is typed against the real API, so it
  publishes the product's actual data model - field names, lifecycle flags, relation
  enums - for free.

On 2026-08-26 the engine was entirely hosted and its memory schema still arrived
complete, in a canvas renderer's `api-types.ts`; both of the run's findings came from
that file and the rules page, and none from the README. Check the client's types before
concluding an engine is unreadable, and expect the benchmark claims to be the least
useful thing present.

## Research-model release

A lab's open-weights drop: paper links, real inference code, checkpoints hosted
elsewhere. The inverse of the vendor repository and a much better source, because **the
engine and the operating instructions ship in one tree** - a claim in a document is
checkable against the code that implements it, in-run, with no fetch. The README is
still an advertisement and still the least useful file present.

Yield sits, in order, in the **first-party prompt-engineering artifacts** (system
prompts, bundled skills, checked-in example cases - written to make the authors' own
model work, so every rule in them is a failure mode the team paid for), then in **config
plus the code that reads it** (a default is a claim; the function consuming it is the
proof), then far behind in the README.

Its signature property, and the reason to seek the class out: **a release shipping two
sibling systems hands you discriminators for free.** Two instruction documents from one
lab that contradict each other are not a contradiction to resolve - they are a boundary
already drawn by people who had to draw it, and the discriminating question is usually
visible in the diff. On 2026-08-26 two shot-prompt writers released together took
opposite sides on whether to describe camera motion, and the answer (is the camera a
typed input?) landed as an amendment at almost no cost. **Diff the sibling instructions
first.**

## App/tutorial aggregator

A monorepo of small runnable example apps. Cluster-triage like the paper aggregator, but
the yield lives in the repo's **operational periphery** - its CI gates, validators, eval
ladders, release discipline - not in any app's architecture, because a mature corpus
outclasses tutorial-grade app content by construction.

The apps themselves resolve almost entirely to catches; the two things worth per-item
attention are entries that instantiate one of OUR laws in code (a cheap corroborating
tree) and entries whose *popularity* signals a hazard or demand. One shallow clone
replaces per-item fetches; on this platform verify the checkout completed
(`git ls-tree HEAD` vs `ls` - a path casualty aborts checkout silently and the clone's
`-q` eats the error; restore missing dirs with `git checkout HEAD -- <dir>`).

## Operator dispatch

No URL - a version number, a framing, or a question. The literal ask may be unbuildable:
on 2026-08-26 the requested topic named a framework, its bundler and its view library,
all three on the `software` purity denylist, so a `knowledge/` document about it fails
the gate on sight. **Grep the denylist at triage, not after drafting.**

**A dispatch carrying sub-questions is several lanes, not one.** On 2026-08-27 "do we
have this path / what does installing it require / is it worth adopting" routed to
prior-art mapping, a primary-source fetch, and the cross-repo lane respectively - and
the middle lane carried the entire technique. Split them at Phase 3 and answer each;
collapsing them into "mine this source" loses the lane that pays.

---

# The batch lane

Four consecutive runs (2026-08-27) mined batches rather than single sources. A batch is
not N runs; it has its own economics and its own triage signal.

## Convergence within the batch is the triage signal

Ingest all sources, dedupe candidates at extraction, and record **how many independent
sources carried each candidate**. On the first batch run every candidate carried by 2+
creators landed on verification (5/5). This is not cross-run convergence - batch sources
share an ecosystem - but it separates one creator's habit from a field's practice, which
is what triage needs. Add the source count as a triage column.

## Count voices, not videos

Six of one batch's twelve sources were a single creator. **A batch's convergence column
must dedupe by author or it manufactures corroboration out of one practitioner's habit.**
The signal that survived the dedupe (cross-author, cross-platform) predicted landings as
well as the first batch's did.

### Sub-class: the channel corpus

Every source from one creator. This **inverts batch economics** - one voice voids
within-batch convergence entirely, so triage leans on corpus-vs-source novelty and
cross-run corroboration instead. Yield profile: amendments and corroborations, never new
subjects. Recognize it at ingest from the author column and say the expectation out loud
before the table.

**Observed 2026-08-28 (first-party documentation corpus: 35 pages, 61k words, one
author).** The design-doc form of the channel corpus behaves as the row predicts and
adds one property: its yield is *architectural*. The pages are organised around
mechanisms the authors built and the reasoning for their shape, so the strip test
passes on nearly every page and the corpus-vs-source novelty check does all the
triage work. Twenty-six candidates, thirteen catches against a mature bundle, two
asymmetry amendments, one XL spec folding four fragments, zero fetches. **The
cluster was the finding**: four pages describing four readers built to one shape
turned out to be one missing stage (review of a plan before commitment) that no
single page would have shown. Read a documentation corpus's cross-references before
its content - the pages that cite each other most are the subject.

## A batch reveals clusters, and the cluster is itself a finding

Five of ten accepted findings in one batch sat on a single missing **stage** between two
of the bundle's areas - something no individual video would have shown. When several
sources' findings share a neighbourhood, say so at triage: the cluster is a statement
about the bundle, not about the sources.

## Related batches compound, and sequencing is the operator's lever

Four of one run's ten landings were widenings of the *previous day's* amendments, each
corroborated by an independent source the second batch supplied. Mining a related batch
while the first is fresh converts single-source landings into corroborated ones at the
cost of a sentence each. **Track which prior landings are still single-source and read
each new batch against that list first.**

## Price a batch honestly

26,578 words across 8 sources produced roughly one good talk's yield, and two sources
yielded zero. **A batch buys coverage, not per-source efficiency** - say so at triage so
the count reads as calibration.

The highest yield-per-word shape observed is a **themed batch dispatched against a named
consumer feature**: the dispatch defines what "real" means at triage, and the X-lane
experiment executes in-run instead of banking as a lead. 7.6k words produced a technique,
three amendments, an executed probe and a plan appendix.

Sponsorship predicts nothing. A batch whose every video was sponsor-linked still yielded
six amendments; the only near-total loss was a model-ranking video, because dated
comparative facts age before they land. **Demonstrated-mechanics density predicts
everything.**
