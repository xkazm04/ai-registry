# Harvest brief — joining an existing bundle (2026-08-22)

You are a subject-worker for ONE subject of a Reference Knowledge Bundle that **already
exists**. Your dispatch prompt names your bundle, your subject, its class (`NEW` or
`EXTENDS`), its category and subcategory, its technique slugs, its named neighbours, and
the source-repo anchors a scout collected for you.

This is not [`forge-brief.md`](forge-brief.md). That brief is for founding a bundle, where
the taxonomy, the laws, the categories and the house voice are all still being decided.
Here every one of those is **already decided and you inherit it**. Founding is design work;
joining is fitting work, and the two fail in different ways.

Read [`docs/rkb-profile.md`](rkb-profile.md) for the format spec. Read
[`forge-brief.md`](forge-brief.md) for the file shapes, the frontmatter and the hard
rules — everything there still binds. This document states only what is *different* when
the bundle is already standing.

## The four rules that only apply when joining

### 1. Your neighbours exist, so the seam is your job

A founding wave draws its boundaries all at once and every subject is born knowing where
the next one starts. You are inserting into a corpus of subjects that were written without
you. Nobody but you will notice that your subject and the one next door both claim the
same ground.

Your dispatch names 1–3 **neighbours**. Before you write a line, open each one's golden
path and read it. Then your own golden path must carry a **boundary paragraph** in prose:
what your subject owns, what the neighbour owns, and the rule a reader uses to pick. Not a
list — a paragraph, in the corpus's voice.

If after reading the neighbours you conclude your subject *is* the neighbour, say so in
your report and stop. A worker that reports "this ground is already owned by X, and here
are the two techniques X is missing" has done the most valuable thing available to it. The
director will re-dispatch it as an EXTENDS. **This is a success, not a failure**, and it is
the single most common correct outcome of a harvest wave.

### 2. Match the voice, do not establish one

Read one nearby subject in full — a neighbour, not a random file — before drafting. The
corpus reads as one author, and a reviewer can pick out a differently-voiced document from
across a room. Concretely: declarative present tense; decision rules stated as rules ("when
X, do Y, because Z"); the failure mode of the naive reading named explicitly; no bullet
lists where a paragraph carries the argument; no summarising your golden path inside your
techniques.

### 3. The laws are closed and the categories are append-only

Cite only anchors that already exist in your bundle's `_laws.md`. A harvest does not mint
laws — a law earns its place by recurring across a whole wave, and only the director sees
the whole wave. If a rule keeps recurring in your material and no anchor fits, put it in
your report as a **proposed law** with the two or three places it recurred. Do not add it.

Likewise: never reorder a category, never rename one, never move a sibling. Your dispatch
already names your folder and the director has already written your entry into
`taxonomy.json`.

### 4. An EXTENDS worker owns the whole subject folder, and nothing outside it

If your class is `EXTENDS`, you are adding techniques (and usually an application) to a
subject somebody else wrote. You will edit that subject's golden path — its `techniques:`
list must stay identical to the set of files in its `techniques/` folder, so adding a file
without adding the line fails the gate, and the reverse fails it too.

That golden path is yours for the duration because exactly one worker is dispatched per
subject folder. Everything else in the bundle is not: not `_laws.md`, not `taxonomy.json`,
not `index.json`, not `index.md`, not another subject's files, not the READMEs. The
director regenerates the derived files once, at the end, over the whole wave.

When you extend a golden path, **add, do not rewrite**. The existing prose was reconciled
against a real tree by somebody who read it. Insert your technique into the declaration
list, and where the body needs a sentence to introduce the new concern, write that
sentence in the existing voice. A diff that rewrites paragraphs you were not sent to change
is a diff the director will revert wholesale rather than untangle.

## The two-phase order still decides whether this works

It is *more* tempting to skip here than in a founding wave, because a scout has already
handed you file:line anchors and reading them first feels efficient. It is not. A subject
drafted from anchors describes one repository in general-sounding words, and it reads like
it forever.

1. **Draft first, from practitioner knowledge.** The golden path and every technique,
   written as though the source repository did not exist. Your training data is the
   ceiling. If your dispatch marks you for web hardening, 2–4 targeted searches go here,
   before the draft, folded in as craft.
2. **Reconcile second.** Now open the anchors. Every claim lands as **confirmed** (cite it
   in an application), **deviation** (the repo falls short — the standard stays, and you do
   not lower it), or **upward lesson** (the repo taught you something your draft lacked —
   improve the draft and name it in your report).

The anchors your scout gave you were collected by someone who was not writing your
document. Expect a few to be approximate. **Re-open every line you cite and re-read it
before the citation ships** — a citation that was never re-checked is the one liability an
external-reconcile run measured and named. Where an anchor turns out to be wrong or thin,
say so in your report; a fabricated line number is worse than a missing one.

## Applications, on a harvest

One or two per subject, no more. `verified_on:` is today's date — it is the date **you**
resolved the citations, and it is a fact, not a formality. Add `verified_against:
<stack>@<major>` when you actually read the tree and its version is visible in a manifest;
omit it rather than guessing, and never put it on a `process` application, which has no
runtime.

Applications are the one layer where the product name, the framework, the file path and
the line number all belong. Use them freely there — and nowhere else.

## Your report

8–15 lines, and it is the review surface, not a receipt:

- files written, techniques count, applications count;
- the **boundary** you drew, in one sentence, against each named neighbour;
- every **upward lesson** the repo taught your draft;
- every **deviation** you recorded (the repo falling short of your standard);
- any **anchor that did not hold** when you re-opened it;
- any **proposed law** or cross-subject finding, as a proposal — never as an edit;
- your `node scripts/check-bundles.mjs` status for YOUR subject only. Mid-wave the gate is
  noisy by design: `taxonomy.json assigns X, no folder` is another worker's pending work.
