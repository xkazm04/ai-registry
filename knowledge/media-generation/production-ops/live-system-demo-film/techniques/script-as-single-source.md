---
layer: technique
type: technique
subject: live-system-demo-film
technique: script-as-single-source
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [structuring the script for a driven demo film, a caption disagrees with the narration, a rewritten line has to invalidate its generated audio, deciding what belongs in a demo script and what does not]
---

# The script as single source

One machine-readable artifact holds every beat of the film: its identity, who
speaks it, the line that is spoken, what the beat must show, and how long its
picture needs regardless of the line. Four consumers derive from that one
artifact and from nothing else — the narration synthesiser, the harness that
drives the system, the captions, and the cost-and-runtime estimate. A rule
implemented in a second place is a second script, and a second script diverges
from the first at the very first edit.

## Four consumers, one artifact

The consumers are worth listing because the temptation is different for each.
The synthesiser wants the line, and nothing else feels like it belongs to it.
The driving harness wants the actions, and the line looks like commentary it can
ignore. The captions want the line *plus* a presentation rule, and the caption
rule is the classic thing to write where the captions are rendered. The estimate
wants the line and the settle, and it is usually built last, by someone who
copies the pacing arithmetic rather than importing it.

Every one of those temptations produces the same defect: two places that must
agree, no mechanism that makes them, and a divergence that surfaces in the
finished film rather than in the build. The caption case is the sharpest,
because it is a *rule* and not a value — "prefix the line with the speaker when
the speaker is not the narrator" is one sentence of logic, and when the overlay
renders it and the assembler also renders it, the film acquires two caption
styles the day one of them is adjusted. Derive the caption text once, in the
script's own module, and let both surfaces call it.

## Identity is the join key

The beat's identifier is what ties a line to its clip, its capture offset, its
assertion record, its caption and its cost. Three properties follow:

- **Ids are stable.** Renumbering beats renames every generated asset, and the
  next run either re-synthesises the whole film or, worse, silently matches new
  ids to old audio. Prefer identifiers that describe the beat rather than its
  position, so inserting a beat costs nothing.
- **Ids are meaningful to a human**, because the per-beat re-narration command
  takes one, and an operator who has to look up which number is the pricing
  scene will not use the command.
- **Ids survive a rewrite of the line.** This is the point that makes the next
  section necessary: the identity deliberately does not change when the words
  do, so identity cannot be what proves a clip is current.

## Stale-asset detection: the sharpest rule in the subject

A rewritten line keeps its beat id, so the generated clip keeps its name and
stays exactly where it was. Presence on disk therefore proves nothing. Without a
freshness check, the next run reads a twelve-second recording of the old line,
holds the picture for twelve seconds under a four-second line, and produces a
film that is wrong in a way **no participant can see**: the recorder cannot see
it, because it faithfully held for as long as the clip claimed; the reviewer
watching the capture alone hears nothing; and the defect is discovered at
assembly, as audio sitting over the wrong beat, with every beat after it
displaced.

The mechanism is a manifest written at synthesis time. Each clip records what
was **actually read aloud** — the exact text submitted for synthesis — alongside
which voice read it and with what settings. Freshness is then a comparison of
that recorded text against the line as it now stands, and a clip that cannot
prove the match is stale by definition. The two disciplines that make the check
usable:

- **Compare the submitted form, not the authored form.** If the script adapts a
  line before synthesis — expanding a figure, adding a pause mark, stripping
  presentation — then the manifest holds the adapted text and the check must
  adapt the current line the same way before comparing. Comparing the authored
  line against the adapted record reports every beat stale forever, and a check
  that always fires is a check nobody reads.
- **Voice identity is part of freshness.** A clip read by a voice the script no
  longer casts for that speaker is stale even when the words match, because the
  film's role legibility depends on who reads what.
- **Scope the check to what the manifest actually claims.** A beat the manifest
  never mentions is not stale — it is unnarrated, which is a different state with
  a different remedy. This matters the moment a production has more than one
  script over the same system (a long take and a short cut, two languages): a
  manifest written for one script says nothing whatever about the other's beats,
  and a check that reads silence as staleness will condemn a perfectly good set
  of clips every time the other script is narrated.

The check's verdict is a state of the run, not a warning in a log. An unverified
clip is unmeasured, and a delivery run with unmeasured clips does not pass.

## What the script owns, and what it does not

The script owns **what is said** and **what must be shown**, and the minimum the
picture needs. It does not own how anything looks: the explanatory chrome's
styling, the caption's typography, the assembler's fades are presentation and
they live with their renderers. Keeping the script free of presentation is what
lets it be read as a document — a reviewer can read the film before it exists,
and a beat list read aloud in a room is the cheapest structural review
available.

It also does not own the fixture. The state the demo runs against is the stage,
declared separately, because the same script should be runnable against a
replaced stage; a script that embeds fixture values has fused the two and cannot
be pointed at the real system when the real system is ready.

## Decision rules

- When a rule must be applied by two surfaces, put it in the script's own module
  and have both call it; when only one surface applies it, it still goes there,
  because the second surface always arrives.
- When a line is rewritten, the beat id stays and the clip is invalidated by the
  freshness check; when a beat is genuinely a different beat, give it a new id,
  because reusing an id to mean something else defeats every record keyed on it.
- When the freshness check is noisy, fix the normalisation, never relax the
  check — a check tuned down to stop firing is worse than no check, because it
  is trusted.
- When you are unsure whether something belongs in the script, ask whether two
  consumers need it. One consumer's private detail belongs to that consumer;
  anything two of them must agree about belongs to the script.

## When not to use it

A three-beat clip does not need a script artifact; the structure costs more than
the film. The technique earns its keep at the point where the film has enough
beats that a human cannot hold the whole timing in mind, or where it will be
re-run — and those two conditions arrive together. It is also the wrong shape for
a film whose actions cannot be expressed as data at all: heavily improvised
exploration, or a walkthrough whose whole value is an expert's unscripted
digressions. That film is a recording of a person, not a build of a system, and
it should be produced as one.
