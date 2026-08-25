---
layer: technique
type: technique
subject: evidence-bound-visuals
technique: screenshots-claim-a-record
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [generating an interface or social-platform screenshot for a factual or promotional piece, a brief asks for a "realistic" screenshot of a real platform, deciding whether a generated mockup needs a label, reviewing generated frames that depict posts, messages, dashboards or live streams]
---

# Screenshots claim a record

This subject's opening grammar reads marks for the claims they make: an
axis claims precision, an arrow claims causation, a number claims that
somebody checked it, a person on screen claims a person. One more has
become cheap enough to need its own line:

> **A screenshot of a platform claims a record.**

A rendered interface — a post with a handle, a timestamp and 4,812 likes; a
chat thread; a live-stream frame with a viewer count and scrolling
comments; a dashboard with a week of figures — asserts that this state
*existed on that system at that time*. Text-capable image models now
produce these at photographic fidelity from a one-paragraph brief, and the
prompt libraries built around them rank "social media screenshot" and
"live-stream interface" among their most-used templates, complete with
guidance to lock the platform's idioms so the result is indistinguishable
from a capture. Every increment of that craft strengthens the assertion.
This is the subject's standing hazard — the violation looks like better
work — in the medium where it is currently easiest to commit.

The claim decomposes into three parts, each of which can be true or
invented independently: the **system** (a real platform, or a product you
own), the **actors** (real handles and faces, or invented ones), and the
**state** (the post, the counts, the messages). Laundering here is the
usual shape — a confidence field stripped in the render — but the field
that is stripped is *whether any of this happened*.

## Decision rules

- **When the depicted system is real and the state is invented, the frame
  is a fabricated record, and it is labelled or it is cut.** A generated
  "screenshot" of a public platform showing a post that was never posted,
  engagement that never accrued, or a message never sent may appear in a
  piece only as an explicit illustration — a visible, non-dismissible
  "simulated" mark on the frame itself, not in a caption the cut can
  drop. There is no grade to propagate, because there is no record.
- **When the system is yours and the state is a mockup, label the plane,
  not the pixels.** Product interfaces you own are legitimately rendered
  from a brief; the honesty obligation is the one a demo data plane
  carries — the viewer must be able to tell *demonstration* from
  *capture*, and a product shot in marketing is read as a capture unless
  told otherwise.
- **When the actors are real people, the frame needs their record or
  their absence.** A real handle on an invented post attributes words to a
  person. Invent the handle, or use the real post — there is no third
  option, and the
  [performer-claims-need-a-person](./performer-claims-need-a-person.md)
  rule is the same boundary one medium over: that one invents the witness,
  this one invents what the witness said.
- **When counts appear, they are figures, and the figure rule applies.**
  "12.4K views" is a number on screen that claims somebody checked it.
  Real counts come from the platform's record and are drawn by the
  compositor under
  [figure-must-cite-a-fact](./figure-must-cite-a-fact.md); invented counts
  are not permitted on a real platform's chrome at all, because the chrome
  is what makes them read as checked.
- **When the brief says "realistic" about a real platform, ask what it is
  for.** Realism is the right requirement for a UI concept, a tutorial, a
  parody clearly framed as one. It is the wrong requirement for anything
  that will be read as evidence — testimony, traction, a conversation that
  proves a point — and the brief should say which it is before the
  template is chosen. A prompt library cannot make this distinction; the
  editor must.

## What this does not settle

Where the *simulated* mark goes, how large, and whether a platform's own
policies on synthetic depictions apply to a given piece are editorial and
legal questions outside this subject. What is settled is narrower and
firm: the frame makes the claim whether or not anyone intended it, so the
decision is made at the brief, recorded with the frame, and enforced by
the same validator that rejects an uncited figure — a generated screenshot
with no *system / actors / state* provenance record is rejected as an
unchecked figure presented as a checked one.
