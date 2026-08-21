---
layer: golden-path
type: golden-path
subject: blind-screening-and-redaction
status: forged
use_when: [producing an assessment against a masked document, deciding what a redactor may remove, a document cannot be masked safely, deciding when identity re-enters a hiring decision]
techniques:
  - identity-signal-inventory
  - preserve-substance-while-masking-identity
  - name-versus-role-headline-disambiguation
  - fail-closed-on-an-unmaskable-document
  - disclose-the-redaction-to-the-assessor
  - reattach-identity-only-after-the-verdict
---

# Blind screening and redaction

Blind screening is the production of an assessment against an identity-masked
document. That sentence is deliberately narrow, and the narrowness is the
subject. The instrument does one thing: it makes it *impossible for one reader,
at one stage, to have been influenced by who the candidate is*, because the
information was not in front of them. Everything else people attach to blind
screening — that it makes hiring fair, that it diversifies a pipeline, that it
substitutes for a fairness programme — is either a different intervention or an
empirical claim the evidence does not support.

The craft has two halves that pull against each other. One half removes: names,
contact details, links, gendered terms, age markers, everything that binds the
page to a person. The other half **preserves**: the team, the duration, the
scope, the verbs, the numbers — because an assessment produced against a
mutilated document is worse than no blind screening at all. A redactor that only
removes is easy to write and destroys the thing it was protecting. The judgment
calls live entirely in the second half.

## Be honest about what the evidence shows

A principal practitioner deploys this instrument with its evidence base stated,
not with its marketing.

The largest field evidence is discouraging. A national employment agency ran
anonymised applications against a control arm at scale; anonymisation did not
raise minority interview and hire rates and, among the participating firms,
lowered them. The mechanism matters more than the sign: masking removed the
context that let a *favourably disposed* recruiter read an employment gap or an
unfamiliar institution charitably. Where a reader was going to discount a
candidate, the mask helped; where a reader was going to make allowances, the
mask took the allowances away, and the second effect was larger. A separate
randomised shortlisting trial inside a large public service found the same
shape: de-identification removed an existing thumb *on the candidate's side* of
the scale. And the canonical screened-audition result that virtually every
blind-hiring pitch cites has been re-examined; its headline figure does not
survive its own standard errors, and some raw cells point the other way.

None of that makes blind screening worthless. It relocates the claim. What
survives scrutiny is a **procedural** claim, and it is a real one:

> This assessment was produced without the assessor having access to the
> candidate's identity.

That is verifiable, auditable, defensible to a regulator, and meaningful to a
candidate who suspects a name cost them a screen. What does not survive is the
outcome claim — that masking will change who gets hired, in your organisation,
in your direction. Where a team wants the outcome claim, they must measure it,
and measuring it is a different technique owned by a sibling subject: proving a
name makes no difference to a score is done by **perturbation** — scoring the
same document twice with the identity varied and comparing — not by masking.
Masking hides the signal; perturbation tests for it. A team that masks and then
declares itself unbiased has measured nothing.

Three further boundaries follow directly:

- **It masks a document, not a process.** Blind screening covers exactly one
  hop. Identity re-enters at the first conversation — a voice, a video tile, a
  name on a calendar invitation — and every downstream stage is unblinded.
  Where the mask covers one of five stages and the other four are the ones that
  actually rank people, the programme is decorative.
- **It does nothing about what was asked for.** A requirement for a specific
  national credential, a minimum years-since-graduation, a named institution,
  fluency phrased as nativeness — each keeps its full adverse impact whether or
  not the reader saw a name. Requirements are written before any document
  arrives; masking is applied after. Neighbouring subjects own the drafting of
  role requirements and the auditing of their impact, and a fairness programme
  that starts at redaction has started three steps too late.
- **It cannot outrun a leaky record.** A masked document inside an unmasked
  record is theatre: the file name, the document metadata, the surrounding
  profile card, the source channel, the recruiter's earlier note. Blind is a
  property of *what the assessor can see*, not of one artifact.

## The two-sided cost

Redaction is a lossy transform applied to the exact evidence the assessment
depends on. This gives it a failure mode most pipelines never look for: the
document still reads fluently after mutilation, so the assessor never notices.

Over-masking produces a confident assessment of a document with holes in it. Mask
every date and tenure becomes unreadable, so a decade of depth scores as an
unknown. Mask every organisation name and the assessor loses the ability to tell
a two-person effort from a fifty-team programme. Mask a role headline as though
it were a name and the document loses the single line that says what this person
does. In each case the score comes back lower — and lower for reasons that have
nothing to do with the candidate. Note the direction: **over-masking is not a
neutral safety margin, it is an adverse action with no author.**

Under-masking is the failure everyone anticipates, and it is the less common one
in practice precisely because it is the one people test for.

So the governing rule of the whole subject is: **remove the binding to a person;
preserve everything that carries capability.** Where a token does both, the
decision is made explicitly, per category, and recorded — never resolved by
turning the aggressiveness dial up.

## What is masked, in tiers

Identity signals are not one class. Grouping them by *how directly they bind*
gives the only decision rule that scales:

| Tier | Examples | Default |
| --- | --- | --- |
| **Direct identifiers** | name, contact details, personal links, photograph, national identifier | Always masked. No per-role discretion. |
| **Protected-attribute markers** | gendered terms and pronouns, age and birth year, nationality, marital and family status, religious or political affiliation, military service | Masked by default. A removal here is almost never load-bearing for capability. |
| **Correlates** | institution names, neighbourhood, hobbies, association memberships, the document's own language, graduation years | Per-role decision. This is where masking begins eating substance. |

Not every signal is removed by editing spans. Some are removed by **choosing what
you send**: the reliable way to keep a photograph, a signature and a document's
visual styling away from an assessor is to hand over extracted, masked text
rather than the original artifact. Channel substitution is the strongest tool in
the kit precisely because it does not depend on the redactor recognising
anything — but it is also why the fallback to sending the original must be
closed off, since the fallback silently restores every signal at once.

The third tier is where teams go wrong in both directions. Masking institution
names removes a genuine class and age signal — and also removes the reader's
ability to calibrate an unfamiliar qualification. The defensible middle is to
mask the *name* while preserving the *level and field* of the qualification, so
the assessment still knows what was studied and to what depth. Similar reasoning
applies to graduation years: the year is an age proxy, the *duration* is
capability, and a redactor that can express "a four-year period" without
expressing "1998–2002" keeps the substance and drops the marker.

Tier three should also be a **per-role** setting, not a global maximum. A role
where the institution genuinely bears on the assessment and a role where it is
pure noise deserve different masks, and the choice is a hiring decision made in
advance, in the open, by a named owner — not a default nobody remembers setting.

## The load-bearing distinctions

**Masking is not deletion, and not anonymisation.** A mask replaces a span with a
typed placeholder that says *something was here and what kind of thing it was*.
Deletion leaves a hole that reads as absence, and an absence in a hiring document
is read as a deficiency. A typed placeholder is the difference between "this
candidate lists no employer" and "an employer name stood here". Separately,
masking a screening copy is a fairness control, not a privacy guarantee: it says
nothing about retention or re-identification of the stored original, which a
governance sibling owns.

**A mask is irreversible downstream; a masked assessment is discardable.** You
cannot un-see an identity that leaked into an assessor's context, but you can
always throw away an assessment produced on a document you were not confident
was clean. That asymmetry is the whole argument for failing closed: when the
redactor cannot vouch for a document — an image-only scan, an unparseable
layout, a format that would have to be handed to an outside service in the
clear — the blind run refuses. It does not "do its best". A best-effort blind
run is the one artifact in this subject that can cause the harm it exists to
prevent, because it carries the *label* of a blind assessment.

Refusing must never strand the candidate. A refusal routes to a human path with
an honest reason; the candidate's application keeps moving. A fairness control
that becomes a queue is a new unfairness.

**A blind run has three outcomes, not two.** The binary reading — blind or not
blind — hides the case that matters most in practice: the document was masked,
but the mask is known to be incomplete. A name that is a single token, is
lowercase, sits below the fold, or is written in a script the masker does not
cover will pass straight through into the text the assessor reads. The honest
states are *masked*, *partially masked — identity may have reached the assessor,
verify*, and *could not mask — refused*. The middle state is not a failure to
tidy away; it is the state where the pipeline must specifically refrain from
claiming a redaction it did not achieve, because that claim is a fairness and
compliance statement about a real person. And the signal driving it must be an
explicit recorded fact — "a name was found and masked" — never something a
caller is expected to infer from the absence of a category in a list.

**A masked assessment must announce itself.** This is the most-skipped step and
the one with the sharpest consequence. A recruiter handed an assessment with no
marking reads it at full fidelity — including its silences. "No leadership
evidence found" means something different when the reader knows that a category
of content was removed before the assessment ran. So a masked assessment carries
its provenance: that it was masked, which categories were masked, and how much
was removed. Without that disclosure the reader silently over-trusts a document
with holes in it, and the redaction has converted an unknown into an apparent
finding.

The assessor also needs an instruction, not just a label: **do not attempt to
infer or reconstruct anything that was masked.** A capable reader — human or
model — will happily guess a gender from a hobby, a nationality from a language,
an age from a technology generation. A blind pipeline that permits reconstruction
has masked the page and not the process, and its identity fields must come back
empty rather than filled with a guess.

**Ordering is a fairness property.** Redaction happens before the assessment;
identity is re-attached only after the verdict is sealed. The dangerous version
is a system that runs blind, then permits an unblinded re-run and keeps whichever
result the reader preferred — which is worse than never masking, because the
choice is now made *knowing* both answers. Re-attachment binds a sealed verdict
to a person; it never reopens it. If the verdict must be revised after identity
returns, the revision is a new, attributed decision with its own author.

One point that looks like plumbing and is not: a blind assessment and an
unblinded assessment of the same document are **different assessments** and must
never share a cache identity. If the mode is missing from whatever key decides
reuse, a candidate can receive a verdict that was produced with their name in
view and stamped as blind, or the reverse — an unauditable fairness claim
attached to the wrong artifact. Mode belongs in the identity of the result, and
that is a fairness fact wearing a caching costume.

## Failure modes of the naive reading

- **A name list and a pattern match.** Names are not a closed set, and the
  patterns that catch them catch ordinary words. Every serious redactor is a
  negotiation between recall and collateral damage, resolved per language and
  per token class — not by one clever expression.
- **Masking the role headline.** The line at the top of a document is usually a
  role, occasionally a name, and a redactor that treats position as proof
  removes the most informative line on the page.
- **Aggressiveness as a dial.** Teams under-confident in a redactor turn it up,
  and get a document that scores badly for reasons no one can name.
- **Blind on the page, identified everywhere else.** Metadata, file naming, the
  surrounding record, and the assessor's own memory of last week's screen.
- **Sending the original away to prepare it.** Any hop that handles the unmasked
  document is a hop where identity can reach the assessor, so blind mode must
  fail closed rather than route the original through an uncontrolled channel.
- **Blind screening as the fairness programme.** The instrument covers one
  reader at one stage and says nothing about who was invited, what was required,
  or who was interviewed. Sold as a programme, it displaces the work that would
  have changed an outcome.

Held to its real scope, blind screening is a good instrument: a narrow, cheap,
auditable guarantee about one hop, whose value comes entirely from being
truthfully described.
