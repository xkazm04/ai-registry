# The practitioner's list

Loaded in Phase 1; applied in Phase 4 to one screen in one scenario. Each heuristic has the question
to ask and the evidence that counts. A proposal names exactly one of these. Product-specific
additions come from the overlay's `## Heuristics`, never from editing this file in a consumer.

## Core (any surface)

| heuristic | the question | evidence that counts |
|---|---|---|
| **first glance** | In the first second, does the screen say what it is and what it is for? | the largest element, the first line, the eyebrow; what a stranger would name the screen |
| **primary action** | Is there one obvious thing to do, and is it where the eye lands? | count of equal-weight actions; distance from focus to the action; whether the label says what happens |
| **orientation** | Does the user know where they are, where they came from and what comes next? | breadcrumb / rail / title; whether Back is predictable; whether progress is shown |
| **feedback** | Does every action answer immediately, and does every wait say how long? | pressed states; spinners with words; a status line that changes; silence longer than 1 s |
| **honesty** | Does the screen tell the truth about what the system did, knows, and does not know? | "no result" states; confidence shown where it is uncertain; stubs labelled as stubs |
| **cognitive load** | Is there one job on the screen, and can the eye hold what is shown? | element count; competing highlights; text over ~60 characters a line; more than 5 choices |
| **empty, error, edge** | What does the screen look like with nothing, with a failure, with too much? | the three states rendered; whether errors say what to do next |
| **consistency** | Does it obey the design doc and behave like its siblings? | the doc's rule quoted; a component used two ways; a label that changes name between screens |
| **recovery** | Can the user undo, go back, or start over without loss? | Back path; destructive actions confirmed; state preserved across the round trip |
| **copy** | Are the words the user's, active, specific, and short? | system nouns on screen; passive voice; labels that need the sentence to be understood |
| **accessibility** | Contrast, size, focus visibility, motion respect, alternatives to colour | minimum text size for the surface; focus ring visible at distance; reduced-motion honoured; colour never the only signal |
| **input economy** | How many inputs to the goal, and is each the cheapest input the surface has? | count of presses/taps/words; typing where a pick would do; a modal where a change would do |
| **latency honesty** | Is a slow operation shaped so the wait is used, not endured? | progressive reveal; what appears while waiting; whether the user can do anything meanwhile |
| **delight, spent once** | Is there one moment of craft, and is everything else quiet? | motion count; the one flourish; ornament with no job |

## Continuity (any product with more than one step)

Applied to a SEAM rather than a screen, and to a screen only in the question "what did the step
before this one leave me?". These are the rows that find a product whose screens are all built and
whose chain is broken - the failure no screen-by-screen walk can see, because it is on neither
screen.

| heuristic | the question | evidence that counts |
|---|---|---|
| **the payload crosses** | Does this step actually READ what the previous one wrote? | the writer and the reader named in code; a step that imports a fixture where it should read upstream output; a saved shape nothing consumes |
| **the thread is visible** | Can the user SEE the decision they made upstream, without navigating back to check? | the upstream choice shown on this screen; a step that starts blank after a step that produced something |
| **the work travels** | Does the user's own material reach the end, or does it stop somewhere and a stand-in continue? | which step last shows the user's input; where a generic sample takes over |
| **the ending exists** | Is there a final artefact the user leaves with, and can they reach it from here? | the export / publish / deliver path; what the last step's last button does |
| **no orphan step** | Does every step both consume and produce, or is one a cul-de-sac? | a step that writes nothing; a step whose output nothing reads |

## Living-room screen (10-foot UI, D-pad)

| heuristic | the question | evidence |
|---|---|---|
| **three metres** | Legible from the sofa: sizes, contrast, density? | smallest text on screen vs the platform minimum; number of items in view |
| **focus is the cursor** | Is the focused element unmistakable, and does every arrow press go where the eye expects? | focus styling; a focus trap; a jump that skips a visible item |
| **the remote's alphabet** | Up/Down/Left/Right/Select/Back/Menu/Play - is each one used as the platform's users expect? | Back that does not go back; Menu that does nothing; Left at the first column |
| **never type on the TV** | Does anything ask for a keyboard that a second device or a pick could supply? | on-screen keyboards; free text fields |
| **safe zone** | Is anything meaningful in the outer 5%? | measured positions of text and the focused element |
| **one band, one hero** | Is the screen's structure a composition or a list? (from the design doc, if it says so) | count of equal-weight regions; whether the hero is one element |

## Second device (phone as instrument)

| heuristic | the question | evidence |
|---|---|---|
| **instrument, not viewer** | Does the phone do what only it can (camera, touch, keyboard, mic) and leave showing to the big screen? | a phone screen that duplicates the TV's content |
| **glance and go** | Can the phone step be done without reading? | button labels; number of taps from open to done |
| **paired state** | Does the phone know what the TV is showing, and say so? | the mirror; a stale mirror; an action allowed when the TV cannot take it |
| **the hand-off** | When the action lands on the TV, does the phone confirm it, and does the TV acknowledge the phone? | a status line on both surfaces within a second |

## Conversational / AI surfaces

| heuristic | the question | evidence |
|---|---|---|
| **provenance** | Does the user know what produced this - a rule, a model, a person? | a label; a "why this" line |
| **the null answer** | Can the system say "I don't know" or "nothing here", and is that state designed? | the none state rendered and worded |
| **withholding** | Where the product's stance is to withhold (a tutor, a coach), does the screen make the withholding feel like help, not refusal? | wording of the hint; a visible path to more |
| **latency of thought** | When a model is thinking, does the screen say so in the product's voice? | the waiting state; whether the wait has a shape |

## Grading

- **Impact** `H`: the user would notice on first use, or it blocks the scenario's success signal.
  `M`: noticed on repeat use, or it costs an input every time. `L`: polish; nobody would report it.
- **Effort** `xs`: minutes, one file. `s`: an hour, a few files. `m`: a session, a component or a
  flow. `l`: more than a session, or it needs a design decision.
- **Order** the table by impact, then by effort ascending. An `H/xs` at the top is the point of the
  whole walk.

## Anti-patterns for the read itself

- Proposing taste. If the heuristic column is empty, the row is deleted.
- Re-proposing a decline in new words. Read the previous stop notes first.
- Reading the screen in general instead of in this scenario. The same screen can be right for one
  journey and wrong for the next; say which.
- Filling the table. Zero proposals is a finding.
- Fixing the design doc from inside a stop. Raise it; do not enact it.
- Reading a seam as if it were a screen. A seam's evidence is the data path - the payload, its
  writer, its reader - and a screenshot of either end proves nothing about it.
- Grading a stop `thin` or `fixture` by impression. Count the files, name the fixture it imports,
  or say `built`. A grade nobody can recheck is an opinion wearing a table's clothes.
