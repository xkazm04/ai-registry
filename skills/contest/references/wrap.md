# Wrap - what a decided contest keeps

`contest.mjs wrap` is the hygiene step after the owner decides. It is a dry run unless `--apply`,
and it is idempotent: a second run finishes what the first could not, and keeps everything the
first archived.

```
node <skill>/scripts/contest.mjs wrap --id <slug> [--apply] [--lessons <file|text>]
                                      [--close "<the owner's reason>"] [--release-winner]
```

## The family

`wrap` takes any member's id and works on the whole family: the first round, its reveal and every
refinement or fuse round linked by `parent`. A round with no round after it is a **leaf**. The
family is decided when every leaf has a winner or a combined decision. A reveal is a mastering round,
so its parent's verdict covers it.

| Family | Decided? |
|---|---|
| shortlist, then `-r2` with a winner | yes |
| winner, then a `-r2` with no verdict | no: the round after the winner is still pending |
| winner, plus a `-reveal` with no verdict | yes |
| first round marked `--close "<reason>"` | yes: closed with no winner is a decision |

An undecided family is left untouched; `wrap` exits 3 and names the open rounds. Never `--close`
on the host's own judgement. Use it only when the owner said the contest is over, and quote them.

## What stays, per member

- `contest.json` (now with `wrapped`: date, bytes before and after, kept keys, missing shots),
  `BRIEF.md`, `manifest.json`, `runs/blind-map.json`;
- `judging/` verdicts, `JUDGE-*.md` and the scoreboard; `runs/<seat>/record.json`, `final.md`,
  `command.json` and any log under 1 MB; `runs/verdict-host-visual.json` and `runs/visual/report.json`;
- each seat's `PARTICIPANT.md` (what that seat was asked) and the `*.md` of the staged `data/`;
- per variant, `archive/<letter>-<n>/`: every Markdown file the seat wrote, with paths preserved;
  `page-text.md`, the words of `index.html` (and `page-text-<path>.md` for any other page), because
  a design contest's variant is a report and a screenshot holds only its first screen;
  `why-this-design.md` (the reveal round's `id="reveal"` section as text); and `shots/`. These are
  the variant's screenshots, moved out of `runs/` by name (`<letter>-<n>-...`). The first wrap,
  before page text existed, kept nine design reports as their one-page notes only;
- the **source of every winner and combined variant**, and of its mastered version in the reveal
  (the reveal keeps the parent's letters, so the parent's C/2 is the reveal's C/2), untouched inside, plus its seat's `data/`
  (the page loads `../data`) and the seat's other scratch, with rebuildable trees pruned. The
  promotion (step 9) captures its contract from that live page. `--release-winner` archives it like
  any other variant once the promotion is done;
- the scratch of every seat a kept variant **descends from**, through each round's `lineage`, with
  rebuildable trees pruned. habit-garden's round-3 winner ran on its round-2 seat's Unity spike:
  `Assets`, `Packages` and the core projects stay, and the 7.4 GB `Library` cache goes.

## What goes

- every other variant's implementation, after its notes and screenshots are archived;
- the blinded copies under `judging/entries/`, the `seed/` copies of a refinement round, and the
  `reference/`, `own/`, `others/` and `data/` copies in seat workspaces;
- strays in losing seats (anything that is not `PARTICIPANT.md` or a variant);
- the staged material in `data/`, apart from its Markdown;
- judge workspaces left outside the arena, and stream logs (`.log`, `.jsonl`, `.txt`) over 1 MB;
- rebuildable trees anywhere outside a kept variant: `node_modules`, `.venv`, `__pycache__`,
  framework caches, `dist`/`build` beside a `package.json`, `target` beside a `Cargo.toml`, and
  a Unity `Library`/`Temp`/`Logs`/`obj` beside `Assets` and `ProjectSettings`.

Links and junctions are unlinked, never entered: a junctioned `node_modules` points at a real
checkout. Files the host put beside a contest (an owner review, a build script, a host build) are
listed in `WRAP.md` and left alone.

## No screenshot, no deletion

A variant with no screenshot keeps its source and its blinded copy, and `wrap` prints the visual
pass to run (`visual-pass.py` or `visual-pass.mjs` on the member directory). A contest decided from
the owner's browser often has none, so the second pass is common. Run the pass, then wrap again.
A blank or error-page screenshot is still a screenshot. Look at one per member before the second
`--apply`.

The page text is read from the HTML file, without running it. A design report keeps its argument
(30 to 98 thousand characters each in the first backfill). A prototype that renders its words from
JavaScript keeps little more than its labels. For those, the visual pass writes the live
`document.body.innerText` to `runs/visual/<letter>-<n>-text.txt` (since 1.9.0), and wrap moves it to
`archive/<letter>-<n>/rendered-text.md`. In the first backfill, about 40 prototypes that had been shot
before that existed kept only their screenshots and notes.

Byte-identical screenshots of one variant are kept once (`load` first). In the first backfill, the
visual pass's `probe` frame matched the `load` frame for every pair.

The dry run's "after" excludes what `--apply` writes (page text, `WRAP.md`, the archive page), so
the applied figure lands a few hundred KB higher.

## After `--apply`

- `gallery.html` becomes the unblinded archive page: one card per variant with its state, seat,
  screenshot and notes, and a link to the source where it was kept;
- `WRAP.md` records the decision, a variant table, the removals by kind, the host files left alone,
  and `--lessons` (first round only);
- each vault note `contests/<id>.md` that exists gains or replaces a `## Wrapped` section, with
  the bytes, the archive link, the kept sources and the lessons;
- both routers link the kept source, else the screenshot, else the archive page;
- the contest refuses `run`, `plan`, `collect`, `judge`, `reveal`, `refine` and `verdict`.
  `status`, `router`, `aggregate` and `wrap` still work.
