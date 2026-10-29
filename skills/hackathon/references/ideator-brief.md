# Hackathon pre-round - propose {{ideas}} projects

You are one of several independent seats in the pre-round of a hackathon. Every seat gets
this same brief and works alone. The owner will read every seat's ideas on one board,
blind - no seat names - and shortlist the few projects that get built. Each shortlisted
project is then built by one seat, in a git worktree of this repository, against a hard
wall clock of **{{hours}} hours**.

Your job now is **ideas, not code.** Do not edit, build or install anything in this
repository. Read it as much as you need to. A short read-only probe that settles whether an
idea can work at all is allowed: list an installed tool, print a version, time one load.
Don't start servers, write files or call paid services, and cite what a probe showed in the
idea's `grounding`.

## The track

{{track}}

## What exists today

The host scouted the area and wrote a dossier at `.hackathon/DOSSIER.md`. Read it first.
It saves you time, but it isn't complete: confirm anything your idea depends on in the code
itself, and name the files you read.

{{dossier}}

## What a good hackathon project is

- **A track is broad on purpose.** The owner didn't pick a feature. Your ideas should
  range across it: different users, different moments, different surfaces (a headless
  service, a UI, or both). Ten variations of one idea count as one idea.
- **It has to fit the clock.** A builder has {{hours}} hours. In the first
  {{baseline_frac_pct}}% of that, a **baseline** must run end to end on real code paths.
  The remaining time goes into **mastery**: design, execution quality, the details that
  make it feel finished. Features come only if time is left. An idea whose baseline alone
  needs the full clock is the wrong size. So is one whose finished version a user wouldn't
  notice.
- **Ground it in this repository.** Reuse what exists. Name the modules, services and
  surfaces it builds on (`grounding`). A project that ignores the codebase belongs in
  another hackathon.
- **Make one real bet.** `insight` is the non-obvious reason this would work when the
  obvious approach doesn't. A good insight makes the owner say "I hadn't thought of that".
- **Be honest about the risks.** Name the thing most likely to sink it inside the clock.

{{taste}}

## Deliverable

Write exactly {{ideas}} ideas to `{{out}}` as JSON:

```json
{
  "seat_notes": "one paragraph: how you read the track and what range you aimed for",
  "ideas": [
    {
      "title": "short name, at most 8 words",
      "pitch": "two sentences: what it is and who it is for",
      "user_moment": "the moment it matters: who does what, and what they see or hear",
      "insight": "the non-obvious bet",
      "surface": "frontend | backend | both",
      "baseline": "what runs end to end in the first part of the clock",
      "mastery": "how the remaining time makes it excellent, not just bigger",
      "stretch": ["features only if time is left"],
      "grounding": ["path/or/module - what it reuses"],
      "risks": "what most likely sinks it inside the clock"
    }
  ]
}
```

Do not sign your work. Don't name yourself, your model or your vendor anywhere: the board
is blind. When the file is written, check that it parses as JSON. Then end your turn with a
one-line summary. If you cannot write files, put the whole JSON document in your final
message inside one ```json fence.
