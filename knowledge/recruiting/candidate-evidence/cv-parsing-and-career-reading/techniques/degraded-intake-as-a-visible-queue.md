---
layer: technique
type: technique
subject: cv-parsing-and-career-reading
technique: degraded-intake-as-a-visible-queue
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-candidates-process-never-stalls-on-your-constraints, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [a document fails to parse or normalise, designing intake error handling, deciding what happens to a candidate the pipeline could not read]
---

# Degraded intake as a visible queue

Some documents will not parse. The rate is low — a few percent of intake in most
systems — and that is exactly why it is handled badly: invisible in aggregate, total for
the individual. The technique converts a class of silent engineering failures into a
recruiter-facing work item, and it is the smallest change in this subject with the
largest fairness effect.

## The rule

**A document the pipeline could not normalise produces a persisted, visible task
carrying a machine-readable reason. It never produces a thin candidate record, and it
never produces only a log line.**

Three failures are being prevented, and they are distinct:

- **Scoring the fragment.** A record built from two hundred characters of noise is
  scored as a candidate with little to say. The pipeline's own damage becomes the
  candidate's result, which is [absence of evidence is not
  evidence](../../../_laws.md#absence-of-evidence-is-not-evidence) at its most expensive.
- **Dropping the application.** The candidate believes they applied. Nothing exists.
  This is the failure that turns up months later as a complaint nobody can answer.
- **Logging it.** A log line is not a queue. Nobody reads worker logs looking for
  people, and no operational review will ever surface a failure rate nobody is
  accountable for.

The candidate's own action must not fail because of your constraints — [a candidate's
process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
The application is accepted, the record exists, and the *system* carries the defect.

## The state

Degraded is a flag on the record plus a reason from a closed vocabulary — unreadable
encoding, image-only document, recovered text below the quality floor, unsupported
format, protected file, extraction limit exceeded, model unavailable on the enrichment
step. The reason drives three things: what the recruiter is told, what the candidate can
be asked for, and what a reprocessing pass can select on. A free-text reason serves none
of them.

Persist it in two places at once: a **flag with its reason on the record**, so the work
item is discoverable by anyone looking at the candidate, and an **event in the
timeline**, so the degradation is countable. The event must still count as an
application received — a funnel that classifies degraded intake as "not an application"
under-reports exactly the channel that is failing, and the resulting metric argues
against fixing it.

Degrade the layer, not the run: when a cheap preparatory stage fails but an expensive
path could still complete the analysis, downgrade the stage, record why, and continue.
Aborting the whole run because the pre-pass threw converts a partial capability into a
total failure for that candidate.

Two properties matter more than the vocabulary itself:

- **Degraded is not a terminal state.** It is a task with an owner and an exit. It clears
  when a re-parse succeeds, when a human transcribes or replaces the document, or when a
  recruiter records a decision on the fragment they read themselves.
- **Degraded excludes the record from automated adverse handling.** A candidate whose
  document could not be read is shielded from ranking-driven rejection and from bulk
  actions, because [uncertainty resolves toward the
  candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate) — and because the
  population whose documents fail is not random. Unusual formats, non-Latin scripts,
  scans, and templates from other markets are over-represented, so a silent failure mode
  here is a demographic filter with no author.

## Re-application is the candidate's only edit button

For most candidates there is no self-service way to correct a bad record except to apply
again. That makes re-submission an *update* path, and it carries two rules:

- **Merge fill-only, do not replace.** A second application with a thinner answer set
  must not erase the richer earlier record. Backfill the fields that were empty — a
  contact address arriving on the second attempt is often the entire point of
  re-applying — and leave populated fields standing. The one thing that is rebuilt
  wholesale is the derived profile, and only when the new submission actually carries a
  document, or when the existing record is a degraded stub with nothing to lose.
- **Identity for merging is the strongest signal available, and a name is not it.** Two
  people share a name; an address or an issued token is theirs. Key the merge on the
  strongest identifier present, fall back explicitly, and where no stable identifier
  exists do not merge at all — collapsing two real applicants onto one record is a worse
  failure than a duplicate row.
- **A failed rebuild touches nothing.** If the new extraction degrades, the previously
  good record stands unchanged and the failure becomes a queue item. A partial overwrite
  turns a retry into data loss for the person least equipped to notice it.

Tell the candidate what happened in terms they can act on — "we could not read your
file, please resend it in another format" — and never in terms of the internal reason
code. A candidate who can fix it in thirty seconds is the cheapest resolution path the
queue has, and the only one that does not cost a recruiter's time.

## Reprocessing is an obligation, not a nicety

Extraction quality is a property of the parser version. When the extractor materially
improves — a new format, a repair for a damage class, a language added — the records it
previously degraded are a known, enumerable cohort that was disadvantaged by a defect
you have now fixed. Re-run them. Stamp every extracted record with the parser version
that produced it so the cohort is selectable at all, and re-parse in place rather than
creating a second competing record for the same person.

Watch the degraded rate as an operational metric, split by format, language and source
channel. A rising rate in one slice is a regression; a persistently high rate in one
slice was never a regression, it is a population you have been quietly failing since
launch.

## When not to use this

Do not route a *content* judgment through this queue. Degraded means the pipeline could
not read the document, not that the document was weak, suspicious or off-target — those
are assessment and authenticity outcomes with their own paths, and mixing them turns a
technical queue into an unaccountable rejection channel. Equally, do not raise a task for
a transient failure that a bounded retry will clear; queue it only once the retries are
exhausted, or you will train recruiters to ignore the queue, which is the only way this
technique actually fails.
