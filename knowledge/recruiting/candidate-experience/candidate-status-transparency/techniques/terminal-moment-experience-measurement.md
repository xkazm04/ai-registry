---
layer: technique
type: technique
subject: candidate-status-transparency
technique: terminal-moment-experience-measurement
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [instrumenting candidate experience, deciding when to ask a candidate to rate a process, publishing or withholding a candidate satisfaction figure]
---

# Terminal-moment experience measurement

The concern: "we treat candidates well" and "we do not ghost people" are the
two claims every hiring organisation makes and almost none measures. They are
structurally unfalsifiable from the inside — the badly-treated candidate does
not complain, they simply stop replying and tell people privately. Any honest
instrument therefore has to sample the population the process ends on, at the
moment it ends them.

The technique is a single-question experience measure fired **only at a
terminal outcome**, bound to one application, answerable once, and withheld
below a minimum sample. Each of those four constraints exists because of a
specific way the number otherwise becomes a lie.

## Why each constraint exists

- **Only at a terminal outcome.** Mid-process, the respondent does not yet
  know how the story ends, and their answer measures hope. Worse, an in-flight
  candidate has an obvious incentive to answer favourably to the party still
  deciding on them — which makes mid-process satisfaction systematically
  inflated, not merely noisy. The terminal moment is also the only one where
  the question is not a demand on someone who is trying to get a job.
- **One response per application.** The access key is a forwardable link in a
  candidate's hands. Without a per-application constraint enforced in the
  store, whoever is angriest — or whoever is most motivated to make the number
  look good — can submit repeatedly. A figure that can be stuffed is not a
  measurement; the uniqueness constraint is what makes it one.
- **Ask once, then stop.** A candidate who checks their status weekly must not
  be asked weekly. After answering, the surface thanks them and never raises
  the question again. Repeated asking of someone you just declined converts an
  instrument into a grievance.
- **Withhold below a minimum sample.** Under
  [a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis),
  an average over a handful of responses cannot support a claim about how an
  organisation treats people, and in a small hiring team it is also close to
  identifying who wrote it. Below the floor, render *insufficient responses* —
  a distinct verdict, never a blank, never a zero, never a neutral default,
  per [absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence).

## The procedure

1. **One question, one scale, plain language** — how the process felt, on a
   short numeric scale, with an optional free-text field. Long surveys at a
   decline moment do not get completed and their non-response is not random.
2. **Fire it from the terminal state on the candidate's own surface**, not as
   a separate outbound email. The person is already there, already knows the
   outcome, and no new channel has to be promised.
3. **Persist with a per-application uniqueness constraint in the store**, not
   in the page. The application is the primary key. Client-side "already
   answered" state is a cookie, and cookies are cleared. Let a resubmission
   *replace* rather than reject — people change their mind in the seconds
   before they send — and treat the rewritten answer as a new answer with a new
   timestamp rather than preserving the first one's.
4. **Refuse an out-of-window submission loudly; never store it quietly.** A
   response arriving while the application is still live must be rejected, not
   silently written, because a stored mid-process answer will be folded into a
   figure that claims to measure completed journeys and nobody will ever find
   it again.
5. **Never coerce a missing answer into a value.** An absent, empty or
   whitespace score is *not a response*; numeric coercion turns all three into
   a bottom-of-scale rating the candidate never chose, and a bottom rating is
   the most consequential value on the scale. Accept a real number or a
   non-empty trimmed string; everything else is absent input, per
   [absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence).
6. **Bound the free-text field.** The person writing into it holds only a link,
   not an account; an unbounded text column reachable by a link-holder is a
   write channel into your store. A cap generous enough for a real sentence is
   the whole defence needed.
7. **Record which terminal outcome it followed.** A satisfaction figure that
   cannot be split by declined-versus-hired is the average of two different
   populations and is dominated by whichever is larger — which flatters
   whoever hires a lot.
8. **Report the number with its denominator and its window, always.** The
   figure never travels without them.
9. **Track response rate as its own signal.** A collapsing response rate at
   the terminal moment usually means the terminal moment is arriving badly, or
   not arriving at all.

## Decision rules

- **When the sample is below the floor, withhold the figure entirely** — do
  not show it greyed, or "provisional", or with a caveat. A displayed number
  is a quoted number.
- **When a downstream consumer carries its own publish policy, expose the
  unfloored figure separately and label it as such.** A metric pack that
  *labels* a thin measure rather than hiding it needs the raw number; the
  display path needs the withheld one. Two named fields, never one field with
  a caller-supplied flag — the flag is what eventually publishes a figure over
  four responses.
- **When response rate is very low, treat the average as a claim about
  respondents, not candidates.** Non-response at a decline moment is strongly
  correlated with the thing being measured; the honest framing names that.
- **When the figure is used to judge an individual recruiter, stop.** Cohort
  sizes per recruiter are small, the outcome mix differs, and the incentive it
  creates is to decline fewer people slowly — the exact behaviour the subject
  exists to prevent. Measure the process.
- **When the number is bad, resist reframing it.** A terminal-moment measure
  samples the worst-served population by construction. That is why it is the
  only useful one, and comparing it to a customer-satisfaction benchmark
  drawn from happy users is a category error.

## When NOT to use it

- **Not mid-process, ever.** Covered above; it measures hope and incentive.
- **Not as a gate on anything the candidate needs.** The status view, the
  outcome and any data request must be fully available whether or not they
  answer. A survey wall in front of an outcome is coercion.
- **Not where volumes are genuinely tiny.** Below the floor the instrument
  cannot report, so the honest alternative at very small scale is a handful of
  real conversations, not a dashboard that will never populate.
