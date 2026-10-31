---
layer: application
type: application
subject: multi-provider-event-normalization
technique: per-provider-usage-extractors
stack: rust
status: forged
verified_on: 2026-10-15
counterpart: external
---

# Usage from harness transcripts: a disjoint tuple, a three-state label (cass)

The tree is the connector crate behind cass (coding_agent_session_search),
franken-agent-detection, which parses the session files of several dozen coding-agent
harnesses into one record type (about forty connector modules). cass 0.10.0 pins this crate by exact version and git
revision. Read at commit `6b337ba434b7`; the toolchain pin is a nightly of 2026-08-31; the crate version is
`Cargo.toml:3 "version"` (0.3.10), whose declared minimum compiler is
`Cargo.toml:5 "1.85"` and whose toolchain file pins a dated nightly. All paths below
are relative to this crate's root. Nothing was executed.

This is a reader-side realization: the extractor reads usage that a harness already
wrote to disk, not a live provider response, so it meets the provider shapes through a
second layer of harness-specific encodings. That makes the technique's case stronger,
and it puts one of the tree's choices in direct conflict with refuse-to-derive.

## One extractor per harness, dispatched by a known identity

A single dispatcher matches on the agent slug the connector already knows and calls a
per-harness extractor; it never sniffs the payload to guess the producer
(`src/connectors/token_extraction.rs:858 "pub fn extract_tokens_for_agent("`). About a
dozen harness families have their own arm; every other harness falls through to an
empty default and, if its message has text, to the estimate described below
(`src/connectors/token_extraction.rs:1085 "_ => ExtractedTokenUsage::default(),"`). That
fall-through is refuse-to-derive's "unknown provider" case answered with an estimate
instead of null. Each explicit extractor names its fields and carries the knowledge no
generic walker could:

- **Cumulative versus per-turn.** One harness writes both a per-turn usage block and a
  session-cumulative total; attaching the cumulative one per turn would double-count in
  every sum (`src/connectors/codex.rs:236 "is CUMULATIVE across the session and"`). The
  extractor reads the per-turn block only
  (`src/connectors/token_extraction.rs:622 "is cumulative"`), the comment claims the
  shape was checked against live history across eight months
  (`src/connectors/codex.rs:234 "verified against live 2026-01..2026-08 history"`), and
  when several usage events follow one assistant turn the last one wins
  (`src/connectors/codex.rs:453 "last write wins"`).
- **Repeated usage across records.** One reply in another harness spans several file
  records that each repeat the full usage. The connector keeps the two identity strings
  a host needs to dedupe by and drops the bodies
  (`src/connectors/claude_code.rs:337 "Keep only the identity strings hosts need to dedupe"`).
  The extractor itself does not dedupe; a grep of the cass host for a consumer of those
  identity keys found none, so whether the dedupe happens is unverified from either tree.
- **Impossible subsets are declined.** Where a harness reports cache counts as a subset
  of input, the extractors check that the subset does not exceed the total before
  subtracting, and keep the known input intact when it does
  (`src/connectors/token_extraction.rs:690 "An impossible cache subset must not inflate the known prompt"`).
  This is the technique's boundary invariant, placed in the extractor rather than at the
  ingest boundary.
- **Negative counts are filtered, not clamped**, in the newer extractors
  (`src/connectors/token_extraction.rs:241 ".filter(|count| *count >= 0)"`), which is
  refuse-to-derive's rule for implausible values.

## The convention is disjoint, not inclusive

The technique's tuple is inclusive: input is the whole prompt, cached input a sub-count
of it. This tree chose the opposite and states it. The total is the sum of four
buckets, input, output, cache reads and cache writes
(`src/connectors/token_extraction.rs:400 "Compute total tokens from all components."`;
`src/connectors/token_extraction.rs:414 "total = total.saturating_add(v);"`), which is
correct only if those buckets are disjoint. The extractors for inclusive reporters
convert toward that: one normalizes a harness's summary into disjoint totals
(`src/connectors/token_extraction.rs:655 "into disjoint totals"`) because its prompt
includes cached input (`src/connectors/token_extraction.rs:656 "The prompt includes cached input"`);
another notes that its SDK input counts include both cache buckets
(`src/connectors/token_extraction.rs:193 "SDK input counts include both cache buckets"`)
and subtracts them (`src/connectors/token_extraction.rs:250 "input.checked_sub(cached)"`).

That is a legitimate choice, and the technique's real rule survives it: one convention,
stated, with every extractor converting into it. The tree breaks the rule in one place.
For the harness whose cached input is a subset of input
(`src/connectors/codex.rs:264 "SUBSET of input_tokens"`), the extractor neither subtracts
nor maps the cached figure; it keeps it verbatim under a key the total ignores
(`src/connectors/codex.rs:268 "unknown keys are ignored by total computation"`). The
grand total stays right, which is what the comment is protecting. But that harness's
input bucket is now inclusive while every other extractor's is exclusive, and its
cache-read bucket is empty though the wire reported a value. A consumer that prices the
tuple (input at the input rate, cache reads at the cached rate) charges every cached
token from that harness at full input rate, the over-bill mirror of the under-bill the
technique describes. The same thing happens on any record whose cache split was declined
as impossible: the input kept intact is the inclusive figure, inside a tuple whose
convention is exclusive (`src/connectors/token_extraction.rs:254 "Invalid/overflowing subsets remain available in compact metadata"`).
Neither case is flagged on the record.

## Three states of provenance, and the conflict with refuse-to-derive

Every extracted tuple carries a label: reported by the API, estimated, or suppressed.

**Suppressed** is the state the registry lacks. It marks rows whose usage is real but
counted on another row: fork-copied rows whose usage was already counted
(`src/connectors/token_extraction.rs:1005 "marks fork-copied rows with"`), a request-finish
row whose counts belong to its start row
(`src/connectors/token_extraction.rs:164 "usage.data_source = TokenDataSource::Suppressed;"`),
display-only messages. A suppressed row gets neither counts nor an estimate
(`src/connectors/token_extraction.rs:1089 "Explicit suppressed state: no API data AND no content-based"`),
and the type's documentation says consumers must exclude it from both totals
(`src/connectors/token_extraction.rs:16 "Consumers must exclude"`). This is the honest
spelling for "measured elsewhere", distinct from both zero and unknown.

**Estimated** is where the tree and refuse-to-derive disagree, and the disagreement is
real. When an extractor finds no usage and the message has text, the dispatcher
manufactures counts from character length divided by four
(`src/connectors/token_extraction.rs:1094 "has_token_data() && !content.is_empty()"`;
`src/connectors/token_extraction.rs:10 "Estimated from content character count"`),
assigning user text to input and everything else to output
(`src/connectors/token_extraction.rs:847 "usage.input_tokens = Some(estimated);"`). By
refuse-to-derive's test (could two honest senders with identical wire data have
different true values?) this is a guess, and the technique's answer is to store null.
The tree's answer is to label it. The cass host calls this dispatcher while writing its
message rows and persists the label beside the counts, so the estimate does sit on the
ingest path, which refuse-to-derive reserves for translation. What the label buys is
separability: a consumer that sums only reported rows gets measured totals. What it
costs: on a harness that attaches real usage to assistant turns only, the user messages
of the same session receive estimates for prompt text the reported input already
contains, so any consumer that adds the two populations double-counts. The label makes
that avoidable, not impossible.

The same file follows refuse-to-derive's canonical case exactly where it matters most:
a harness that reports only a total does not have it split into input and output
(`src/connectors/token_extraction.rs:711 "alone cannot identify input/output categories"`),
and for a harness whose cache semantics are unknown the cache figures stay metadata
(`src/connectors/token_extraction.rs:877 "metadata because Kimi's additive/subset semantics are unknown"`).
So the tree refuses to derive a split and does derive a count. The line it draws is
between inventing structure (refused) and approximating magnitude (allowed, labelled).

One defect sits at the edge of the label. The enum's default variant is the estimated
one (`src/connectors/token_extraction.rs:12 "Estimated,"`, under the default attribute
on the line above), and several extractors start from the default
(`src/connectors/token_extraction.rs:1085 "_ => ExtractedTokenUsage::default(),"`). A
message with no usage and no text therefore leaves the dispatcher labelled estimated
with every count null: absence spelled as an estimate that was never made.

## What the realization cannot do

- Give the input bucket one meaning across harnesses, for the reason above.
- Assert the sub-count invariant at the record boundary. The check lives inside some
  extractors, declines silently, and is absent from the ones that read subset fields
  without converting them.
- Dedupe repeated per-record usage itself; it delegates that to a host that, as far as
  could be found, does not do it.
- Distinguish "no usage, no text" from "estimated".

## What the tree's shape says about the technique

It confirms the core rule at a harder boundary than the technique imagines: harnesses
that each re-encode provider usage their own way still yield to one small extractor per
family and a dispatcher keyed on known identity, where the family has an extractor at
all. It shows the inclusive
target is a choice, not a law: a disjoint target works when every extractor converts,
and fails in exactly the technique's predicted way where one does not. It adds a
suppressed state the registry should have, for usage that is real but counted
elsewhere. And it disagrees with refuse-to-derive on estimates in a way the registry
should record rather than resolve by fiat: the tree's label keeps estimates separable,
refuse-to-derive keeps them out, and the double-count hazard above is the price of the
tree's choice.
