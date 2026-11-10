# {{title}}

You are one participant in an ideas contest. Other seats are answering the same brief right now,
each doing its own research; {{review_line}}. There is no judge model: a person reads every row.
You compete on the ideas and the pictures you leave in this directory and on nothing else.

## The brief

{{brief}}

## What you must deliver

One board page holding every idea the brief asks for, **one row per idea**: the idea in words on
the left, its generated images across the row. The person scrolls the page top to bottom and keeps
or throws each row.

```
variant-1/index.html      the board, opens from disk (file://), no build step, CSS inline
variant-1/img/*.png       every image the board shows, drawn through data/codex-draw.mjs
variant-1/boards.json     the drawing queue you fed the drawer (name, prompt), kept as the record
variant-1/NOTES.md        how you worked (headings below)
variant-1/SOURCES.md      your research log
```

- **Each row** carries: a number and a title that is a real title, the idea in at most three
  sentences, the lines the brief asks for per idea, and its images at a height that lets a person
  read them (at least 260 px tall on a 1920 px screen). An image opens full size on click. HTML and
  CSS only; a little script only for that zoom. The page reads at 1280 and 1920 wide.
- **Images are drawn only through the staged drawer**, never by hand, never from the web:
  `node data/codex-draw.mjs --queue variant-1/boards.json --out variant-1/img --workers 2`. Each
  call draws for at most 8 minutes and exits 3 while images remain; give each call a 10-minute
  shell timeout and run it again until it says all are drawn. It skips what exists, so a rerun never redraws. Every prompt is self-sufficient: it
  restates the look, the setting and each character's full appearance, because each image is drawn
  alone. A prompt the image tool refuses lands in `variant-1/img/failed.jsonl`: reword it (imply,
  do not show) and run again, or drop that image and say so in the row. Other seats draw on the same
  machine at the same time; the drawer shares the slots fairly, so do not start more than one
  drawer at a time.
- **Write all the ideas before you draw any of them**, then draw them all in one queue. Drawing
  takes most of your wall clock; an idea rewritten after its images exist has images that no longer
  match it.
- `NOTES.md`, under 400 words: `## What I researched` (what you looked for and what it changed),
  `## The bet` (what this field of ideas does that the obvious one would not), `## What I threw out`
  (the ideas you wrote and cut, and why, one line each), `## Known limits`.
- `SOURCES.md`: every page you read, as `- <url> - <what it taught, one line>`. Research is part
  of the entry; a field written from memory alone is the thing this contest exists to beat.
- Do not name yourself, your model or your vendor anywhere in the files. The review is blind and a
  leak is redacted.
- Leave nothing else at the top level: no scratch files and no notes outside `variant-1/`.

{{patterns_section}}

## How to work

- You have about {{timeout}} minutes of wall clock. Budget it: research about a fifth, writing about
  a fifth, drawing the rest. A board with every row drawn beats a better board half drawn.
- Decide everything yourself; there is no one to ask.
- Read everything in `data/` first: the owner's words there outrank anything else in this file.
- Before you stop, open the page source once and check: every row's images exist on disk, the
  count of rows is what the brief asks, and `boards.json` parses.

When the board is in place, stop. Your final message is one line per idea: its title and the one
sentence that sells it.
