---
layer: technique
type: technique
subject: candidate-status-transparency
technique: candidate-safe-status-projection
status: forged
laws: [say-only-what-the-record-holds, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [designing what a candidate may see about their own application, reviewing a candidate-facing payload for leakage, adding a field to an internal application record]
---

# Candidate-safe status projection

The concern: an internal application record is a rich, mutable, adversarially
readable object — identifiers, scores, stage history, recruiter notes,
requisition politics, unratified machine judgments. A candidate is entitled to
know where they stand. Handing them a filtered view of the record satisfies the
second while quietly failing the first, because a filter is a denylist and a
denylist loses to the next field someone adds.

The technique is to define a **separate, small, closed output type** — the
projection — and to make it the *only* thing that crosses the candidate
boundary. Not a view of the record: a different object, constructed from it.

## The procedure

1. **Enumerate the candidate-safe vocabulary first**, before looking at the
   internal record. Typically: received-at, a coarse phase, a short list of
   candidate-visible events with timestamps, a live/terminal flag, and any
   action expected of the candidate. Five to eight fields. If the list grows
   past a dozen you have started mirroring the pipeline.
2. **Define the projection as its own type**, with no field that shares a name
   or a shape with an internal identifier. Same-named fields invite a
   copy-through that nobody reviews.
3. **Build it by construction, never by omission.** The function takes the
   internal record and *writes out* each permitted field. A record gaining a
   new column changes nothing about what crosses the boundary — which is the
   whole property being bought.
4. **Enforce it at the boundary, not in the page.** The surface that serves the
   candidate emits the projection and cannot emit anything else. A page-level
   decision about what to render is a decision made by whoever last edited the
   page.
5. **Map coarse, then check the map.** Derive the phase from stage *role*, not
   from any display string (see the sibling technique). Test the map for the
   pairing that matters: no internal state may project to a phase that
   understates the candidate's actual progress.
6. **Assume the payload is public.** Whatever the projection emits should be
   safe if a stranger reads it, because the access key is a forwardable link.
   This is a testable property; "the page does not show it" is not.

## Decision rules

- **When a field is useful to the recruiter, exclude it by default.** The
  overlap between "helps us operate" and "the candidate is entitled to it" is
  small, and everything in the difference is machinery.
- **When a field is a machine judgment not yet ratified by a human, exclude
  it.** An unratified score shown to its subject becomes an adverse statement
  the organisation must defend, made by nobody. Disclosure of automated
  involvement and any explanation of it belongs to the disclosure sibling,
  which has its own redaction rules; this projection carries neither.
- **When the internal state is ambiguous, project the weaker claim.** "In
  progress" is true of almost everything; "we have received your application"
  is a claim about one specific early moment. Under
  [say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds),
  the safe default is the one that asserts least, not the one that sounds
  most welcoming.
- **When the record contains something about the requisition rather than the
  person** — a freeze, an internal appointment, a budget pull — project only
  its consequence for this application, never its cause.
- **When a number would be shown, ask what the candidate can do with it.**
  Position in a queue, applicant counts and match percentages change nothing
  the candidate can act on, and each one is a comparative claim about a person
  the moment it is read.

## What this technique does not own

It does not own the decision history or the AI disclosure — a sibling subject
owns the redacted reasoning a candidate may request, with its own, stricter
redaction pass. It does not own outbound message content or delivery; another
sibling owns whether a channel you promise actually exists. This technique
owns the shape of the self-service payload only.

## When NOT to use it

- **Internal previews.** A recruiter's "what does the candidate see?" view
  should render the *same* projection, not a privileged superset — otherwise
  nobody ever looks at the real thing. Use the projection; do not fork it.
- **A regulator's or a data-subject's full-record request.** That is a
  different obligation with a different scope, answered by the record itself
  under the consent-and-retention rules, not by this deliberately lossy view.
  Never let the projection become the answer to "give me everything you hold".
- **Where no candidate-facing surface exists.** Do not build the projection
  as a speculative data model. Its value comes from being enforced at a real
  boundary; unenforced, it is a naming convention that drifts.
