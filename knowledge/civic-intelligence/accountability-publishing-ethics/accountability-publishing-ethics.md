---
layer: golden-path
type: golden-path
subject: accountability-publishing-ethics
status: forged
use_when: [publishing automated findings that name real people, wording copy for an accountability surface, designing empty or outage states on pages about named entities, handling reader subscriptions and telemetry on a civic platform]
techniques:
  - lead-not-verdict-framing
  - severity-free-factual-framing
  - honest-empty-states
  - real-vs-illustrative-form-encoding
  - public-role-scope-limit
  - accountless-notification-privacy
---

# Accountability publishing ethics

An accountability platform publishes claims about real, named, living people —
politicians, officials, company officers — and it publishes them continuously,
without an editor reading every sentence before it renders. That combination is
the whole problem of this subject. In a newsroom, a human weighs each naming
decision against the profession's standards: presumption of innocence, the
right of reply, the line between public role and private life, the duty to
correct. On a data-driven surface those judgments cannot be made per-sentence
at publish time, so they must be made *once, structurally* — encoded in the
derivation code, the copy templates, the vocabulary, and the visual form — and
then enforced by the pipeline on every row it will ever emit.

The naive reading of this subject is "be careful what you write". The correct
reading is: **the ethics live in the system, not in the prose.** A platform
whose framing discipline is a style guide will drift the first time a new
surface paraphrases an old one; a platform whose framing discipline is a pure
function that emits gated copy cannot. Every rule below therefore has two
halves — the editorial principle, and the structural place it is enforced.

## The three audiences of every sentence

Each published sentence about a named person is read three ways at once:

- **By the reader**, who will take the strongest interpretation the words
  permit. "Flagged for review" reads as "guilty" unless the copy actively
  prevents it.
- **By the subject**, who has a legal and moral claim against any assertion
  the evidence does not carry. Defamation law does not care that a model, a
  join, or a tripwire produced the sentence.
- **By a future maintainer**, who will copy the sentence's framing into the
  next surface. The first accusation that ships becomes the template for ten
  more.

The craft is writing for all three: copy that a skimming reader cannot
over-read, that the named subject cannot truthfully call false, and that a
maintainer copying it inherits the discipline rather than the risk.

## The ladder of assertion

Not everything the pipeline produces has the same standing, and the copy must
say — explicitly, on the surface, next to the content — which rung a given
item stands on:

1. **A registry fact** — a dated, sourced record from a primary register: a
   contract, a filed role, a recorded vote. Publishable as fact, with its
   citation.
2. **A derived figure** — a deterministic computation over registry facts: a
   rate, a sum, a co-occurrence. Publishable as fact *about the data*, with
   its formula and coverage.
3. **A machine match** — a tripwire hit, a model verdict, a temporal
   coincidence. A *lead*: a candidate for human review, never asserted as a
   substantive connection, and by default not public at all.
4. **A human-verified finding** — a lead that passed a named human gate.
   Publishable, with the gate decision as part of its provenance.
5. **An interpretation** — "this suggests", "this pattern is consistent
   with". A separate, labeled act, never mixed into the factual layer.

Most published harm in this domain comes from rung inflation: a machine match
presented in the voice of a verified finding, a derived figure narrated into an
interpretation, a coincidence in time asserted as a relationship. The framing
techniques below exist to make rung inflation structurally difficult — the
copy for each rung is generated from the rung, not written per item.

## Symmetry is the non-partisanship guarantee

An accountability method earns trust not by tone but by coverage: it applies
to the whole population or to nothing, because any shortlist — even an
innocently motivated one — is an editorial act that the method cannot defend.
Two corollaries are easy to miss:

- **Absence of a finding is a finding.** "No detected conflicts" for a named
  person is a publishable, citable result with equal claim to surface — and it
  must be a *verified* negative (checked against the register that could have
  contained the tie), never an unqueried one. Over-claiming and under-claiming
  are both live failure modes.
- **Positive findings get equal weight in form, not just in existence.** If
  conflicts render as prominent badges and diligence renders as a footnote,
  the surface editorializes through typography. The quiet workhorse and the
  clean record get the same badge weight, the same tone, the same placement
  logic as the flagged tie.

Ranking is the subtlest symmetry leak. Any ordered list of review candidates
implies a judgment; ordering by "severity" *is* the platform pre-judging which
person's case is worst. Order instead by evidence completeness — which case
gives a human reviewer the most material to decide with — and disclose the
ordering rule verbatim beside the list.

## What the reader's absence must never say

Empty, missing, and broken states are published claims too. A detail page that
answers a temporary backend outage with "this person does not exist" has made
a false statement about a named individual. A dashboard that renders zero for
a metric that was never measured has fabricated a fact. A demo figure shown
without visible marking is a fabricated statistic the moment one reader
mistakes it for a measurement. The standard: every state a surface can be in —
loaded, empty, unmeasured, unavailable, illustrative — is a distinct claim,
and each must be *true*. Genuine absence gets a genuine not-found; outage gets
an honest "temporarily unreadable, the record exists"; unmeasured gets
"not measured", visually distinct from zero; and sample data carries its
sample-ness in its visual form, because the caption is the first thing a
skimming reader drops.

## Privacy runs in both directions

The subject's privacy: the platform holds public officials accountable for
public roles, and private life is out of scope, always — family, health,
lawful private conduct do not enter the graph even when a source offers them.
The *reader's* privacy is the half that data platforms forget: a civic reader's
follow list — which politicians they watch — is itself sensitive political
data. A subscription mechanism that requires no account is the strong default,
but statelessness is not automatically privacy: a list of followed entities in
a request, joined with an address, is a fingerprint, and it will leak through
telemetry by default unless scrubbed deliberately. Design the notification
path so the server never *stores* who watches whom, and audit what the
observability stack copies out of requests on its own.

## What the field's standards add

Professional codes converge on duties that a structural system must translate
rather than skip: **presumption of innocence** (never publish judgment on an
unadjudicated matter — the ladder's rung labels are this duty, mechanized);
**right of reply and correction** (a permanent address per claim, a published
correction history, and a visible route for a named subject to contest — the
method being public is what makes the contest fair); and **accountability for
process** (publish the method, the weights, and the recompute path, so a
critic can disagree with the method instead of alleging bad faith). A platform
that cannot show *how* a sentence about a person was produced has no answer
when that person calls it false.

## Failure modes this standard exists to prevent

- **The narrated verdict** — a machine match rendered in the grammar of guilt
  ("MP X funneled contracts to…") because a template chose vivid over true.
- **The severity theater** — candidates ranked "critical/high/medium",
  converting an evidence queue into a public indictment order.
- **The leaked worksheet** — a reviewer's free-text note copied into a public
  feed; working material published as finding.
- **The 404 defamation** — infrastructure trouble rendered as "no such
  person".
- **The invisible demo** — illustrative numbers distinguishable from real
  ones only by a caption nobody reads, or an outage page that reads as an
  editorial choice.
- **The asymmetric lens** — conflicts surfaced for one party's members with
  more prominence, or positive findings structurally absent.
- **The private-life drift** — a public-role platform ingesting a divorce
  record because the source happened to include it.
- **The helpful fingerprint** — follow lists, alert subscriptions, or query
  histories accumulating server-side "for convenience" on a platform whose
  readers include journalists and the subjects themselves.
- **The invented sentence** — a notification layer summarizing records into
  new prose with new dates or amounts; every delta shown to a reader must be
  a literal record with its provenance, even at the cost of showing one twice.

## The techniques

- [lead-not-verdict-framing](techniques/lead-not-verdict-framing.md) — the
  structural separation of machine candidates from human findings: gated copy,
  gated surfaces, the review console as the only promotion path.
- [severity-free-factual-framing](techniques/severity-free-factual-framing.md)
  — writing and ordering findings without a severity axis; evidence
  completeness as the honest sort; the rule text carried verbatim beside the
  results.
- [honest-empty-states](techniques/honest-empty-states.md) — making every
  absent, unavailable, and unmeasured state a true statement; outage is never
  nonexistence, missing is never zero.
- [real-vs-illustrative-form-encoding](techniques/real-vs-illustrative-form-encoding.md)
  — sample and demo data marked in visual form, not caption alone; the
  page-level outage notice.
- [public-role-scope-limit](techniques/public-role-scope-limit.md) — the
  public-role boundary as an ingestion rule, not an editorial preference;
  symmetry across parties and across positive/negative findings.
- [accountless-notification-privacy](techniques/accountless-notification-privacy.md)
  — subscriptions without accounts, the address-as-fingerprint problem,
  telemetry scrubbing, and never inventing prose in the notification layer.
