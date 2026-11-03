---
layer: technique
type: technique
subject: streamer-dress-rehearsal
technique: through-the-broadcast-path
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [deciding where a rehearsal's evidence is read, building a test-fire or preview control in a streamer tool, checking that an overlay change reached the stream]
---

# Through the broadcast path

The viewer sees one thing: the picture the broadcasting software composes and sends. A
dress rehearsal is complete only when its events have travelled the same path a live
event travels — from the chat intake, through the tool's core, out to the overlay page,
into the broadcasting software's browser source, onto the composed scene — and the
result has been read **on that scene**. Every shorter path proves one component and
nothing about the chain.

## The commonest false rehearsal

Streamer tools grow local test controls: a "test fire" button inside a visuals panel, a
preview pane that animates an overlay, a green tick when a rule saves. Each is useful
while designing and each is a trap at rehearsal time, because it lights up on the
streamer's screen through a path that skips the core, the overlay server or the browser
source. The trap is concrete: a local test fire can animate perfectly in the tool while
the overlay on the stream stays dark, and the same burst sent through the core lights it.
A streamer who rehearsed with the local control goes live believing the visual works.

So the rehearsal's controls inject at the **input** end — generated chat, generated
contributions — and never at a component in the middle, and the rehearsal's evidence is
read at the **output** end. Local previews remain in the tool, labelled as previews, and
are not offered as the rehearsal's way of firing a feature.

The trap has a mirror image that a picture check alone does not catch. A test fire can
run inside the core and reach the real overlay, and still enter **below the routing**
that decides which features react to a live event. A visual preview that selects the
burst's own kind of contribution, rather than the kind the streamer configured, lights
the overlay for a visual that a live event of that kind would leave dark, or that no live
event would light at all. The picture is right and the feature is not. "Inside the core"
is therefore not the test. The test is whether the stimulus takes the same intake and
the same routing a live event takes.

## Reading the output

The scene the rehearsal uses is a scene in the streamer's own broadcasting software,
created for the rehearsal and owned by the tool, holding the same overlay sources the live
scene will hold. The rehearsal reports a scene name only once the broadcasting software
itself reports that scene exists; a scene the tool merely asked for is not a scene it can
claim. The check is then made on the composed picture — by the streamer's eye on the
software's preview, or by a capture compared against what the core says should be shown —
and it covers placement and legibility as well as presence, because an overlay that
renders in the centre under three others has not reached the viewer either.

Two properties of a capture decide what it can prove. First, **what it renders.** A
capture of one source renders that source alone, outside the scene's placement, scaling
and stacking order. It proves the overlay painted. It cannot show that the overlay sits
where it should or that another one covers it, and four overlays that each pass a source
capture can still compose into an unreadable pile. Placement and occlusion are read from
a capture of the **scene**, which renders the composition. Second, **when it renders.**
A browser-rendered source that is not on a showing scene is not painting, and a one-shot
capture can briefly mark it showing without giving the page time to paint. It then reads
blank, or reads a frame from before the change. Make the rehearsal scene show and wait
until the software reports its sources showing before you read it. A preview pane or a
projector counts as showing, so the scene does not have to be put on the output. Switch
the output scene only when nothing is being sent, because a rehearsal scene on the output
of a live stream is on the air.

## Procedure

1. Route every rehearsal stimulus through the tool's real intake and core, never into a
   component directly.
2. Create or reuse a rehearsal scene in the streamer's broadcasting software, owned by the
   tool and identified by what the software reports, and add the real overlay sources to
   it.
3. For each feature, name the visible result on the scene that proves it fired — a vote
   bar filling, a plate appearing after a seal, a visual climbing with a burst.
4. Run the scenario and check that result on the composed picture: the scene shown, its
   sources reported showing, and the capture taken of the scene, not of each source. Mark a feature whose
   result was not observed there as not observed, whatever the tool's own panel says
   ([law: unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass)).
5. Note the features whose overlay only exists after a state change — a draw plate that
   appears only once sealed — so "set everything up first, then rehearse" does not miss
   them.

## Decision rules

- **When a control fires a feature without passing the intake and routing a live event
  passes, it is a preview, not a rehearsal step.** Label it so and keep it off the
  rehearsal surface. That holds even when the preview runs in the core and reaches the
  real overlay.
- **When every source capture passes, placement is still unmeasured.** Only a capture of
  the scene can show it.
- **When the tool's state and the scene disagree, the scene is right about what viewers
  saw.** Debug the path, not the panel.
- **When an overlay is present but unreadable, the feature did not reach the viewer.**
  Placement and contrast are part of the path.

## When not to use it

Unit tests of an overlay's rendering, or of a feature's state machine, do not need the
broadcasting software and should not pay for it. This technique governs the end-to-end
rehearsal before going live, not every test a tool runs.
