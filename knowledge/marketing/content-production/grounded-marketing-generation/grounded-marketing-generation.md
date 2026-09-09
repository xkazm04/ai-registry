---
layer: golden-path
type: golden-path
subject: grounded-marketing-generation
status: forged
use_when: [designing a prompt that writes ad copy or posts or replies for a business, deciding what a marketing generator may read and may never invent, choosing whether a bad output is repaired in code or sent back to the model, setting up a judge and a drift threshold for generated marketing output]
techniques:
  - generation-reads-the-data-spine
  - never-invent-proof-price-or-contact
  - structural-anti-fabrication-over-instruction
  - deterministic-clamp-vs-model-reprompt
  - publishable-as-is-quality-gate
  - judge-rubric-and-drift-thresholds
---

# Grounded marketing generation

A model asked to write an ad, an article, a post, a reply or a channel plan for a
small business will produce something fluent on the first try. Fluency is not the
problem. The problem is that the fluent output will contain a free-shipping threshold
the shop never offered, a "4.9 from 212 reviews" nobody counted, a phone number, a
delivery date, a discount, a competitor's price - each of them plausible, each of them
a lie the business now has to catch before it goes live, and each of them the reason
most marketers stop trusting generated copy after the second week.

This subject owns the **generation contract**: what the model reads, what it may never
invent, how the prohibition is made structural rather than merely instructed, which
violations are repaired deterministically and which earn a re-prompt, what "publishable
as-is" means at the gate, and how the output is judged and watched for drift. It does
not own what a public surface is allowed to show - `honest-proof-and-illustrative-data`
decides that, including the labelling of illustrative numbers. It does not own how the
business sounds - `brand-voice-capture` owns voice; this subject only says where the
voice block enters the prompt. Format-specific craft (headline angles, article
skeletons, reply doctrine, channel registers) lives with `responsive-search-ad-craft`,
`content-brief-and-article-composition`, `speed-to-lead-and-assisted-reply` and
`channel-native-social-and-repurposing`; the contract here is what those formats share.

## The output is conditioned, not inspired

The load-bearing distinction is between a model that *knows about* the business and a
model that is *conditioned on* the business's own data. A prompt that says "write for
a Czech-market plumber" invites the model to fill every slot from its training
distribution - the average plumber's claims, the average plumber's prices. A prompt
that carries the business's catalog, its measured channel performance, its mined
lessons and its own voice constraints, and nothing else, leaves the model only the
job of composing, which is the job it is good at.

Everything the generation reads is therefore a **data spine**, assembled before the
prompt and handed to the model as fact. The spine has a precedence order: what the
business recorded wins over what a scan inferred, which wins over nothing at all. A
value the product itself wrote as a placeholder - a seed catalog's "Sample service A",
a starter category, a fill-me-in row - is not a fact about this business and grounds
nothing; it is filtered at the boundary, not trusted to a caveat. The incident behind
that rule is exact: a tenant whose plan told him to write an article about the sample
service his catalog had shipped with. Grounding is handed to the model as fact, so
only facts may ground.

The spine also carries **provenance**. A measured number arrives as measured; an
illustrative one arrives labelled, and the label changes the instruction ("write more
generally; do not build the copy on these results"). A mined lesson arrives with the
evidence that produced it and is retrieved for relevance and diversity, because a
library of near-duplicate wins fills every grounding slot with one lesson restated. A
pinned lesson is re-checked against fresh data before it grounds anything, because a
"scale this campaign" that the campaign has since fallen below is worse than no lesson.

## The short list of what may never be invented

No number, price, discount, guarantee, certification, delivery date, address, phone,
e-mail, review, review count, rating, credential, competitor fact or "as seen in"
appears in generated output unless the business supplied it. This is
[never invent proof](../../_laws.md#never-invent-proof) at the point of generation.
The list is short on purpose: it is the set of things a reader would act on and a
regulator or a customer would hold the business to.

The right behaviour on a missing item is never a plausible value and never a silent
blank. It is one of two things: an **open question** put to the owner ("what is your
free-shipping threshold, if any?"), or an **explicitly empty slot** the surface renders
as empty. A page written before proof arrived says so at the top, in a form that cannot
be mistaken for copy, and the generated text around the hole says less rather than
padding. A disclaimer wrapped around a fabricated number is not a third option.

Two corollaries. A generated *recommendation* obeys the same rule: it derives every
threshold from the numbers it was handed and says how, and never imports an external
benchmark or "industry standard" the data did not contain. And a generated *reply* to
a customer never promises a price, a date, a discount or an outcome that is not in its
sources, and names the risk it took whenever it touched money, health, law, a
complaint or a number - a non-empty risk list is a stronger safety lever than any
confidence score the same model reports about itself.

## Instruction is necessary and insufficient

Every generation prompt carries the anti-fabrication sentence. Keep it as one
centralised fragment reused verbatim, so the rule cannot drift between tools and a
change to it is one deliberate diff that re-proves every prompt it feeds. But the
sentence is the floor, and the contract is built above it, in structure:

- **Schemas that cannot carry the thing.** An experiment page's output type is prose
  only, so there is nowhere to put a conversion rate. An ad schema has headline and
  description arrays and a rationale, and no price field.
- **Validators that drop what was not requested.** A clustering step discards any
  keyword not in its input; an arm-writing step keeps the first answer per arm id and
  refuses two arms with the same headline. Entities the request did not contain never
  reach the output, whatever the model added.
- **Deterministic floors that assert only supplied values.** A fallback that writes ad
  copy without a model emits a shipping, rating, returns or dispatch line only when the
  corresponding field was supplied; an absent field omits the line entirely. The same
  floor must govern the *demo* path, which is where this discipline is most often
  forgotten - a demo fallback that hardcodes a free-shipping threshold contradicts the
  system prompt three lines above it, and a demo is the first thing a prospect reads.
- **Grounding filtered at the boundary.** Sample catalogs ground nothing; placeholder
  values are stripped by marker; unconfirmed competitors from a scan are excluded, not
  caveated.
- **Provenance decided per request.** The illustrative flag is set by the caller who
  knows which dataset was loaded, never inferred by the model from the numbers.

The test for whether a rule is structural: remove the instruction sentence from the
prompt and ask whether the fabricated value could still reach the published surface.
If it could, the rule was only instructed.

## Two kinds of bad output, two kinds of repair

A validator on model output produces violations of two natures, and the mistake is to
treat them alike. A headline over its character limit, a list over its count, a
trailing space, a casing slip - these are **clampable**: the normalizer that runs
anyway fixes them deterministically and for free. Paying for a second model call to
fix a length overrun buys double latency and double spend to produce what the clamp
would have produced, and when the second call fails the code falls back to the clamp
regardless, silently. A missing required field, an arm with no headline, two arms with
the same opening, a language that ignored the locale override, an invented entity the
validator can detect - these **need the model**, and earn exactly one re-prompt.

The split is a contract on the violation *vocabulary*: every clampable violation is
phrased by one helper in one shape, and the partition matches that shape exactly and
nothing looser, because the expensive failure is skipping a repair the model genuinely
needed. When the re-prompt does fire, it carries the full violation list - the call is
already paid for - and the repaired parse is re-checked once; a second failure is
reported, never retried into a third call. Telemetry then tells the truth about what
happened: repaired, clamped instead of re-prompted, combined usage of both calls, and a
corrupt-or-truncated status distinct from success, so an output that parsed but is
broken never reads as healthy downstream.

## Publishable as-is is the bar, and it is checked

The output of a marketing generator is judged by one question: could the marketer
upload it unchanged? For ad copy that means every asset within the platform's limits,
angles that are genuinely distinct rather than one line reworded, at least one direct
call to action, the brand present when the brand was supplied, no unbacked superlative,
discount or number, no filler keywords. For a page it means every placeholder frame
resolved or removed, every template string gone, every internal link resolving, and a
proof gate of several real proof touches each traceable to what the owner gave. For a
reply it means the answer is in the first sentence and the risk list is empty or the
reply waits for a person. [A gate before money and copy](../../_laws.md#a-gate-before-money-and-copy)
is the law; the gate here is its generation-side instance.

Three properties of a good gate. It is **deterministic where it can be**: a checker
that fails on a zeroed-out price, a placeholder phone pattern, an example e-mail domain,
a surviving frame label or a dead link catches the class of fabrication that is
actually a template leak, and it does so without a model. It is **loop-shaped**: the
gate decides when the work is done, the author fixes and re-runs until it passes, and
a failing output is never presented with an explanation attached. And it is **honest
about self-scoring**: a numeric "rate this nine out of ten" gate performed by the same
model that wrote the copy is the weakest form of gate this subject recognises - useful
as a structured self-review, never as the publish decision, and never in place of a
checker or a human eye. A gate that exists only as a sentence in a rules file and is
invoked by no command is not a gate.

## The judge, the baseline, and the drift you cannot see per cell

Once generation is running, its quality is a measured quantity with a threshold, not a
feeling. The measurement is an off-line judged run: each operation's output, scored on
a fixed rubric - overall, relevance to the brief, correctness and constraint adherence,
task and structure adherence, language and tone on brand - on a one-to-ten scale, by
several judge calls whose median is taken, and with the judge held to one model so two
cells are comparable. When the judge shares a vendor with the model under test, the
home-team bias is disclosed beside the score, not hidden.

The number then acquires two thresholds. A **floor** says "not terrible" and catches an
operation collapsing; it cannot catch a prompt edit that takes one operation from 8.5 to
7.0 or a model swap that takes every operation down most of a point with nothing red.
So the scores the product ships with are **recorded as a baseline**, per operation and
per serving model, and every later bake is compared against them twice: per cell, with
a maximum drop sized above judge variance, and across the mean, with a smaller maximum
that is the only rule able to see uniform drift. The baseline records which model each
column was measured on and where the product declares the model it serves, so a model
swap fails on the swap rather than when somebody next spends half an hour on a matrix.
Moving the baseline needs a written reason in a changelog, for the same reason a golden
prompt fingerprint does: re-recording a number is how a regression is absorbed. The
measurement's age is reported too, because a scorecard older than the model line-up
describes a product that no longer exists. Whether a drift threshold is measured or
convention is stated in the technique - the per-cell drop and the mean drop are
convention sized from observed judge variance, not a published constant.

The last measured lesson concerns **tiers**. A cheaper model degrades in two ways that
look different in the output: it ignores hard constraints (character limits, then the
clamp truncates mid-word and specifics are lost) and it drops grounding (the specific
becomes generic). The safe downgrade boundary is not "creative versus constrained"; it
is **categorical versus numeric**: a pure regrouping task survives the cheap tier, and
anything that must carry numbers or specifics does not. That is a benchmarked finding
in one product line, and it transfers as a hypothesis to test, not as a law.

## Failure modes of the naive reading

- **The instructed-only prohibition.** One sentence in the system prompt and a schema
  with a free-text field for everything. Read the demo path.
- **The seed that grounds.** A sample catalog, a starter category, a placeholder row
  handed to the model as the business's facts.
- **The re-prompt for a length overrun.** Double the cost to obtain the clamp's output.
- **The clamp for a missing field.** A normalizer that pads or silently drops what the
  model failed to return, so the validator never sees it.
- **The self-scored gate.** The author awards itself the passing score, on a rubric
  that has no line for fabrication.
- **The floor without a baseline.** Every operation loses most of a point after a
  model swap and the build stays green.
- **The judge that wandered.** A fallback provider scores half the cells with a
  different judge and the comparison across cells is void.
- **The confidence number as safety.** A fast-tier model reports high confidence on a
  health complaint with an empty risk list; the risk list, not the confidence, is what
  the auto-send gate must read.

## Seams

`honest-proof-and-illustrative-data` owns what a public surface may display and how an
illustrative number is labelled; this subject only ensures the generator receives the
provenance bit and obeys it. `brand-voice-capture` owns the voice profile and its
maturity; this subject says the voice enters on the user prompt, not the system prompt,
so the golden fingerprint holds. `responsive-search-ad-craft` owns headline angles and
platform limits as craft; `content-brief-and-article-composition` owns the article
skeleton; `speed-to-lead-and-assisted-reply` owns autonomy and consent for replies;
`landing-page-experiment-statistics` owns the experiment whose arms this subject only
insists are written together and kept distinct. `client-reporting-and-data-provenance`
owns the reporting side of "not measured is not zero"; here the rule appears as
grounding that omits rather than zero-fills.
