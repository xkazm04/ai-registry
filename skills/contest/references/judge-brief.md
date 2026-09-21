# Judging: {{title}}

You are one judge on a blind panel. The entries below were produced by different seats
answering the same brief; you do not know which, and you must not try to find out. Stay
inside this directory, read only `entries/` and this file, and never open another judge's
`verdict-*.json`. Score what is in front of you.

## The idea the participants were given

{{brief}}

## Entries

{{entries}}

Each variant is `entries/<letter>/variant-<n>/index.html` with a `NOTES.md` beside it and the
shared input data under `entries/<letter>/data/`. Read the notes, then the source. You have no
browser: judge the interaction and visual design from the code as a senior front-end reviewer
would - what it renders on load, what happens on hover, select, zoom, resize, what the data
volume does to the layout, whether the failure states exist. When a variant cannot run (missing
file, syntax error, a data path that cannot resolve, a hard dependency that is not there),
mark it `broken` and say why; do not score it.

## The rubric

Score every variant 1 to 10 on each dimension. Use the whole scale: 5 is competent, 8 is
something you would show a client, 10 is the best you have seen for this problem.

| Dimension | What a 10 looks like |
|---|---|
| wow | the first three seconds make a stranger lean in; ambition in the visual language, not decoration |
| clarity | the whole dataset is present and the screen still reads; density is designed, not endured |
| wayfinding | at every level the user knows where they are, what is above, what is below, how to get back, how to find one thing |
| interaction | motion and feedback carry meaning; hover, focus, select, expand, zoom all answer the user |
| craft | it works on first load, at any window size, with no broken state; performance is felt, not promised |
| concept | the metaphor fits the material and would not be the obvious first idea |
| utility | the owner would open this tomorrow to do the real task: body text is comfortable to read, heavy content has room, the practical path is the short one |

Judge against the brief, not against your own taste for a different product. A variant that
solves the stated problem plainly beats one that dazzles at a problem nobody set.

## What you write

Write `{{verdict_file}}` in this directory - valid JSON, nothing else in the file:

```json
{
  "judge": "{{judge_id}}",
  "entries": {
    "A": {
      "variants": [
        {
          "n": 1,
          "concept": "<its concept name from NOTES.md>",
          "scores": { "wow": 7, "clarity": 8, "wayfinding": 6, "interaction": 7, "craft": 8, "concept": 7, "utility": 7 },
          "strengths": "<two or three sentences naming what is specifically good, citing the file and element>",
          "weaknesses": "<two or three sentences naming what specifically fails, citing the file and element>",
          "broken": false
        }
      ],
      "entry_note": "<one sentence on this entry's three variants as a set: did it bring three ideas or one?>"
    }
  },
  "ranking": ["B/2", "A/1", "C/3"],
  "patterns": [
    { "statement": "<one design philosophy that made the strong variants strong, stated so it transfers to a different dataset>", "variants": ["B/2", "A/1"] }
  ],
  "anti_patterns": [
    "<one thing the weak variants share, stated so a future participant can avoid it>"
  ]
}
```

`ranking` lists every scored variant, best first. `patterns` and `anti_patterns` are the part
of your verdict that outlives this contest: three to five of each, each a transferable idea,
none a restatement of the rubric.

Your final message is the ranking and one sentence on why the top variant won.
