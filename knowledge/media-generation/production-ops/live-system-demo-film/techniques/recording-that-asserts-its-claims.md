---
layer: technique
type: technique
subject: live-system-demo-film
technique: recording-that-asserts-its-claims
status: forged
laws: [checkability-routes-the-pixel, output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [capturing a demo by driving a real system, deciding what a demo recorder should verify, a demo film shows behaviour the system no longer has, choosing a failure policy for a long capture run]
---

# Recording that asserts its claims

The recorder is also a test. Every claim the film makes about the system's
behaviour is asserted **while the take is being made**, against the same real
machinery that is producing the picture. This is not a convenience — it is the
reason the film is worth driving from a script at all. A capture that merely
performs the steps produces a recording whose truth nobody has checked, and a
recording that shows a safeguard being honoured while it was not honoured is
worse than no recording: it is a false attestation with production values, and
it will be believed precisely in proportion to how good it looks.

The framing that keeps this straight: the picture is the checkable part of the
artifact, which is exactly why it is captured rather than produced. A demo frame
is a claim a viewer could go and falsify. Anything in the film that only has to
*feel* right — a mood, an establishing scroll — is free; anything that states a
behaviour is a fact, and a fact that nothing checked is unverified, not verified.

## Assert on what the audience sees

The single most transferable rule: assert against the **rendered text**, not
against the arguments that were passed.

Asserting that the right call was made with the right parameters proves the
call. It does not prove the frame. A formatting defect between the call and the
screen — a figure rounded in the view layer, a label bound to the wrong field, a
state that renders one step behind — passes an argument-level assertion
perfectly and ships a frame that lies. The audience never sees the arguments.
They see a card, and what the card prints is the claim the film makes, so what
the card prints is what must be asserted.

The same rule disciplines the writing of assertions. "The card shows the
approval is pending" is checkable against a string on screen. "The approval
workflow was invoked" is a statement about the inside of the machine, and if it
is what the narration says, the narration is describing something the audience
cannot see — which is a script problem before it is an assertion problem.

## Every behavioural claim owes an assertion

Work from the narration, not from the code. For each beat, the sentence in the
line that states a behaviour is the assertion that beat owes. This mapping is
what stops the assertion set from drifting into a general-purpose test suite: a
demo recorder is not trying to cover the system, it is trying to cover **the
film's claims**, which is a much smaller and much more valuable set.

A beat whose line makes a claim that nothing asserts is an unmeasured beat, and
the run reports it as such. Coverage here is a real number — how many of the
film's behavioural claims are checked — and reporting it is the difference
between a recorder that verifies the film and one that verifies whatever was
easy.

**Derive the expected figures from the script, not from constants.** An
end-of-run assertion that the film staged two refusals should count the beats
whose script entry says a refusal is staged, and assert on that count. Writing
the two as a literal creates a second script — the assertion set — which then
has to be edited in step with the first and silently will not be. What is
non-negotiable is the *invariant* ("every refusal the script stages is recorded
as the user's decision"); how many of them this particular film contains is the
script's business, and the assertion should ask it.

## The failure policy: record it, carry on, fail at the end

A beat that throws is **recorded as an error and the take continues**.

This inverts the reflex every test harness trains, and the reason is economic
and specific to long captures. A take is serial and minutes long; the narration
it consumes has already been paid for; and the information a run produces is the
*whole list* of what broke, not the first item. Aborting on the first moved
control yields no film and exactly one defect, and then the operator fixes that
one, re-runs for another twenty minutes, and finds the second. Losing a
twenty-minute take to a single relocated button is the one outcome a recorder
must not have.

What carrying on must not become is tolerance. Three clauses hold the line:

1. **The error is recorded against its beat**, with what was expected and what
   was found, in the same record every other beat writes to.
2. **The beat still runs its narration and its hold.** The audience-facing
   result is the error state, which is honest; the take remains watchable as a
   diagnostic and the timing of every later beat is undisturbed, so the operator
   can see the rest of the film.
3. **The run fails at the end, naming every broken beat.** The take is not
   publishable. A recording produced by a failing run is a diagnostic artifact
   and must be treated as one — including by whatever publishes films, which
   takes its input from the run's verdict and not from the presence of a file.

Two failure kinds are worth distinguishing in the record because they mean
different things. An **assertion failure** says the system did something other
than what the film claims — a product defect, or a film that has gone out of
date. A **driving failure** — a control not found, a surface that did not
appear — usually says the script is stale against the system. The second is the
signal that makes a scheduled demo build valuable: it is the earliest, cheapest
notice that the product moved out from under the story.

## Practical shape of a take

- **One session, one surface, one capture.** A take that spans several windows
  or restarts the capture mid-run produces material the assembler has to
  reconcile; one continuous capture with logged offsets does not.
- **A pre-roll before the first beat, and it warms the system.** Capture and
  first paint both need a moment, and a film that starts one frame into its
  first action has lost the establishing frame. But the pre-roll's more valuable
  job is to visit every surface the film will visit, once, so that no beat pays a
  cold-start cost out of its own hold. A first navigation to a cold route can
  cost seconds, and **a beat that spends its hold on cold start is a beat whose
  picture arrives after its line** — the pacing formula cannot see it, because
  the hold elapsed exactly as computed. The pre-roll is on the capture, and every
  beat carries its own measured offset, so the assembler lays audio after it
  rather than over it.
- **Actions before typing, and both inside the hold.** Ordering within a beat is
  partly a legibility decision — navigate or focus first so the audience knows
  where to look, then produce the text they are meant to read — and partly a
  correctness one. An on-screen animation still running when a navigation lands
  is executing against a document that no longer exists, which surfaces as an
  intermittent, unattributable failure in an expensive take. Beats that both
  navigate and animate do the navigation first, every time.
- **The capture's own ambiguity is stated where it is created.** Where an offset
  can only be known within some tolerance — capture start, encoder latency — the
  recorder writes that tolerance down beside the offset rather than leaving the
  assembly step to discover it. A downstream step cannot measure an uncertainty
  that was settled upstream and not recorded.

## Decision rules

- When the narration states a behaviour, assert it in the same beat; when it
  states an impression, assert nothing and say so, because an assertion invented
  to make coverage look complete is maintenance with no evidentiary value.
- When choosing what to assert against, take the rendered string over the call,
  every time — the frame is the artifact.
- When a beat fails, record and continue; when the run ends with any recorded
  failure, fail the run and refuse to publish, with all failures named.
- When the same assertion breaks on every run against a moving surface, fix the
  script's grip on the system rather than weakening the assertion; a demo that
  asserts nothing it could get wrong has stopped being evidence.

## When not to use it

Beats that are pure atmosphere — a title, a credit plate, a slow pan across a
static page — should assert nothing. Assertions there cost maintenance and prove
nothing anybody doubted. And a film of a system that genuinely cannot be driven —
a physical installation, a third-party surface you may not automate — cannot use
this technique; there the honest move is to state in the boundary that the take
is one unverified run on a given date, rather than to imply the checking this
technique provides.
