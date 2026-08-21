---
layer: golden-path
type: golden-path
subject: multi-jurisdiction-hiring-compliance
status: forged
use_when: [hiring across more than one legal regime, configuring a workspace jurisdiction, deciding what a compliance surface may assert, planning conformance work against a regulation]
techniques:
  - regime-catalog-with-four-axes
  - codified-threshold-only-where-one-exists
  - tenant-scoped-legal-framing
  - provider-versus-deployer-duties
  - gap-register-with-owner-and-effort
  - framing-not-legal-advice-disclaimer
---

# Multi-jurisdiction hiring compliance

One hiring process runs against several bodies of law at once, and the law is
not a property of your company — it is a property of *where the work is, where
the candidate is, and who is asking*. The naive reading treats this as a
localisation problem: translate the privacy notice, swap a company address,
ship. The principal reading is that a jurisdiction determines **what claims your
product is allowed to make about itself**, and that most of the difficulty is
not implementing obligations but knowing precisely which ones exist, which are
merely believed to exist, and which have a number attached.

This subject owns the **regime map** and the craft of operating across regimes.
It does not own what the candidate is told at the moment of disclosure, it does
not own running a fairness test, and it does not own the decision record. Those
seams are named at the end.

## Law is data, not code

The single most expensive structural mistake is expressing jurisdictional rules
as branches. Once `if (region === …)` appears in three modules, the regime map
lives nowhere and everywhere: nobody can answer "what do we assert in this
country" without reading the whole system, and nobody can review a legal change
without a code review.

The correct shape is a **catalog**: one declarative table, one row per
jurisdiction, one column per axis of obligation, read by every surface that
needs to speak about law. A regime becomes a row, not a branch. Adding a
country is a data change; changing what a country requires is a one-line diff
that a non-engineer can read and a lawyer can be shown.

Two properties make the catalog usable everywhere it is needed. It must be
**pure reference data with no dependencies** — no data access, no server-only
imports — because the surfaces that read it include a candidate-facing page, a
recruiter dashboard, a background job and a test, and a catalog that can only be
read on one of them will be copied onto the others. And the instrument names in
it are **proper nouns, not translatable content**: a data-protection statute has
one name in every language. Store the names as plain strings and localise only
the connecting sentence, interpolating the names into it. A translated legal
instrument name is an instrument nobody can look up.

The four axes that
matter — the data-protection law candidate information is processed under, the
legal hook that makes the human-oversight guarantee binding, the
equal-opportunity framework the jurisdiction assesses hiring against, and the
named statutory adverse-impact test — are developed in
[regime-catalog-with-four-axes](./techniques/regime-catalog-with-four-axes.md).

The catalog carries an **as-of date and a review cadence**, prominently, in the
artifact itself. A regime map without a date is worse than none, because it is
confidently wrong in a domain where being out of date is the failure mode with
teeth. In the last three years effective dates have moved in both directions:
one comprehensive regime's employment provisions were rewritten and pushed back
more than a year while employers were already building against the original
date; another jurisdiction repealed and replaced its statute months before it
was due to bite, converting an audit mandate into a disclosure-and-human-review
mandate. Anything you wrote against the superseded version is now a liability
wearing a compliance badge.

## The null column is the most important column

Across every major regime today, exactly one axis is usually empty: almost no
jurisdiction has codified a numeric adverse-impact threshold. One long-standing
national convention does — a selection-rate ratio below four-fifths of the
most-selected group's rate, from a 1978 employee-selection guideline that
remains the reference point. Everything else imposes duties *without* a number:
prohibit discriminatory effect, publish impact ratios, provide human review,
disclose use, notify workers' representatives. Even the jurisdiction that most
famously mandates an annual independent bias audit and the **publication** of
impact ratios does not itself codify a pass line — the number everyone quotes
is borrowed from the older national convention and functions as a trigger for
attention, not a statutory verdict.

This distinction is the whole game, and it is the reason the axis is nullable
rather than defaulted. A product that fills the empty cell with a plausible
number has invented law. It will then enforce that invented number on a hiring
process, produce adverse outcomes justified by it, and hand a claimant a written
admission that the employer applied a standard the legislature declined to set.
The discipline of leaving it null — and rendering the null as *this jurisdiction
has not codified a threshold*, never as zero, never as a fallback to the one
regime that has — is
[codified-threshold-only-where-one-exists](./techniques/codified-threshold-only-where-one-exists.md).

## Statute and enforcement posture move independently

An underlying prohibition and the appetite to enforce it are separate variables,
and only one of them is stable. Guidance pages are withdrawn, agency priorities
are redirected by executive action, and a central authority may publicly
deprioritise the very liability theory a control was built to survive — while
the statute creating that liability sits untouched, and private litigation over
algorithmic screening grows regardless.

The rule that follows: **never key a control off enforcement appetite.** Build
against the duty, not against the probability of being asked — a control removed
because an agency stopped asking is one you must rebuild under discovery,
without the years of records it would have accumulated, and retention periods in
particular are set by the limitation period of the claim, not by the regulator's
current mood. For the catalog this means withdrawn guidance changes the
*guidance* column, if you keep one, and never the *framework* column.

## Whose duty is it

Modern AI regulation splits duties between the party that builds and places a
system on the market and the party that deploys it in its own hiring. The split
is not cosmetic. The builder owes risk management, data governance, technical
documentation, logging capability, accuracy and robustness, and the instructions
for use. The deployer owes use *in accordance with those instructions*,
competent human oversight with real authority to override, monitoring in
operation, notification of affected workers and their representatives, and
retention of the logs the system generates.

Two failures follow. A deployer who assumes the builder's conformance covers
them is uncovered on every duty that is irreducibly theirs — oversight
competence, worker notification, log retention — none of which a vendor can
discharge on their behalf. A builder who ships a capability without the
instructions, the log surface and the oversight affordances has made deployer
conformance impossible. And a platform that both builds the screening capability
and operates it for a customer wears both hats at once, and must map each duty
to a hat rather than averaging them.
[provider-versus-deployer-duties](./techniques/provider-versus-deployer-duties.md).

## Which jurisdiction applies is decided by the tenant, not the request

A compliance lookup is a *statement about who you are*, and it must be resolved
from the authenticated caller's own workspace configuration — never from a
region parameter in the request, never from browser locale, never from an
identifier the caller supplies.

Two failures make this non-negotiable. **Correctness:** a team configured for
one region will otherwise ship another region's legal framing to its own
candidates, and a candidate-facing artifact is the one thing you cannot un-send.
**Confidentiality:** if the caller can name the workspace whose posture is
returned, anyone with an account can enumerate every team's legal posture —
which jurisdictions they operate in, which obligations they have accepted, and
therefore where they are exposed. A compliance endpoint that takes a workspace
identifier is a competitive-intelligence endpoint.

Failing closed does not mean showing nothing. The destination is a **neutral
row**: a catalog entry for "spans jurisdictions, or not yet chosen" whose values
name the guarantee rather than any country's instrument — *the applicable local
data-protection law*, *a human decides; no solely-automated adverse decision*,
*applicable equal-opportunity law*. True everywhere, useful to a candidate,
asserting nothing you cannot support. Defaulting instead to whichever
jurisdiction is most common among your customers is this section's failure
wearing a reasonable-sounding disguise, and it is sticky: nobody re-reads a legal
claim that rendered successfully.

The hardest case is the candidate's own view, because a candidate is anonymous —
there is no session to scope by, and a page that fetches its own jurisdiction
cannot prove which organisation's opening it is showing. Resolve on the server
from the capability token the candidate already holds and hand it to the page as
data; any client-side lookup on an unauthenticated surface is either wrong or
leaky. [tenant-scoped-legal-framing](./techniques/tenant-scoped-legal-framing.md).

## Being useful about law without practising it

Both adjacent positions are wrong. Refusing to name any framework produces a
surface that helps nobody — "we take privacy seriously" is not usable by a
talent team answering a procurement questionnaire. Asserting conformance
produces a claim you cannot support, because certified conformance under most of
these regimes is a formal act with an assessment behind it and a sentence in a
product is not that act.

What you can honestly do is **frame**: name the instruments that apply, state
which of your behaviours corresponds to which duty, and mark the boundary
explicitly — these are framing references, not legal advice and not a claim of
certified conformance. That disclaimer is the load-bearing sentence that makes
everything above it publishable, and its placement and wording are engineering
decisions with failure modes:
[framing-not-legal-advice-disclaimer](./techniques/framing-not-legal-advice-disclaimer.md).

## A trust surface must admit gaps

The instinct on a public compliance page is to list only what is done. This is
the instinct that gets a company sued for misrepresentation rather than for
non-conformance, and it also destroys the page's usefulness internally: a page
that admits nothing cannot be used to plan.

A credible posture states, per obligation, one of *met*, *partial*, or *not
met* — and for anything short of met, an owner and an effort estimate. That
turns the artifact into a plan. It also forces the hardest admissions into the
open: that hiring AI sits in the highest risk tier a regime defines, that a
derogation the regime offers has been examined and **refused** rather than
quietly taken, and that a specific duty is currently unmet with a named person
accountable for it.

Refusing an available derogation deserves its own note. Where a regime allows
an exemption — narrow-task, preparatory, purely procedural — taking it is
cheap and reads as compliance. But the exemption is assessed against what the
system actually does, not what you classify it as; a screening capability that
influences who advances is not preparatory whatever you call it. Recording the
refusal, with the reasoning, is worth more under scrutiny than the exemption
was worth in effort saved.
[gap-register-with-owner-and-effort](./techniques/gap-register-with-owner-and-effort.md).

## What the naive reading gets wrong

- **"Pick the strictest regime and apply it everywhere."** Appealing, and wrong
  in both directions. Regimes conflict: one jurisdiction's mandatory retention
  collides with another's erasure right; one requires notifying worker
  representatives where another has none. And "strictest" is not a total order
  — a regime with a numeric ratio is stricter on one axis and silent on three.
  Applying an unrelated jurisdiction's numeric threshold to a candidate it does
  not cover is inventing law, not being cautious.
- **"Compliance is a checkbox at the end."** The obligations that bite are
  structural — human oversight with genuine override authority, logs that
  survive the retention window, an impact assessment done *before* deployment.
  None of these can be added after the fact, because they are statements about
  what happened, and by then it already happened.
- **"The vendor handles it."** Covered above; the deployer's duties are
  irreducible.
- **"We disclose, so we are fine."** Disclosure regimes are the cheapest tier
  and the fastest growing — several jurisdictions now require only that a job
  advertisement or a candidate notice say AI is used to screen, assess or
  select, without prescribing form or detail. Satisfying them is not evidence
  about anything else, and a thin disclosure satisfying one regime can fall
  short of another's requirement that the notice arrive a set number of days
  before use and enumerate the characteristics assessed.
- **"Our jurisdiction column is a display string."** If a rule keys off the
  label a user typed rather than a stable regime identifier, renaming a
  workspace's region silently changes what the product asserts about the law.

## Seams

Three sibling subjects share borders with this one, and duplicating them is how
a regime map turns into a second, worse copy of each.

**What the candidate is told** — the wording, timing and content of an AI
disclosure and of the explanation owed for an individual decision — belongs to
the candidate-disclosure subject. This subject supplies only the *inputs* that
disclosure consumes: which framework and which data law this workspace's
jurisdiction names. The disclosure names them; it does not choose them.

**Running the test** — cohort construction, proxy detection, sample-size
refusal, the mechanics of computing a selection-rate ratio — belongs to the
adverse-impact subject. This subject decides only *whether a threshold exists
to compare against, and which one*. A ratio computed correctly and judged
against an invented line is still an invented judgment.

**The record** — actor attribution, sealing, retention windows, reconsideration
paths — belongs to the decision-audit subject. This subject determines the
retention *duration* a jurisdiction imposes and which duties require a log to
exist at all; the audit subject determines what the log contains and how it is
proven intact.

Two further borders lie outside this domain entirely. The mechanics of tenancy,
session authentication and data access are general engineering concerns and
belong to that practice; what this subject contributes is the *hiring judgment*
that a workspace's legal posture is confidential because it binds an
organisation's identity to its hiring exposure. Likewise, model routing,
telemetry and degradation handling are general concerns; what belongs here is
that a degraded run does not change which jurisdiction's framing is displayed.
