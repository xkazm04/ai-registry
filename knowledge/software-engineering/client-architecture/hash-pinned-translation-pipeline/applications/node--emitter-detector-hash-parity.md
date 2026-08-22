---
layer: application
type: application
subject: hash-pinned-translation-pipeline
technique: emitter-detector-hash-parity
stack: node
status: forged
verified_on: 2026-08-22
verified_against: node@22
---

# Two Node scripts, one hash, and a comment holding them together

The same guide-translation pipeline splits the hash across two dependency-free
Node scripts. `scripts/i18n/emit-source-hashes.mjs` is the **emitter**: it
produces the per-topic source-hash manifest that a translation run bakes into
each locale's `_meta.json`. `scripts/i18n/check-guide-translations.mjs` is the
**detector**: months later it recomputes the same hashes and compares. This is
the technique's two-program shape exactly, and the repository is candid about
what holds the two together.

## The contract, written as a comment

`emit-source-hashes.mjs:8-9`, in the file header:

```js
// The hash function must stay byte-identical to the one in
// check-guide-translations.mjs. If you change it here, change it there too.
```

The invariant is stated precisely and correctly. It is also the technique's
**"never" rung**: two independent implementations kept in sync by an
instruction to a future reader. Nothing fails if the instruction is not
followed. The person who breaks parity is at least as likely to be editing the
*other* file, and the comment lives only in this one.

The duplication is real and byte-identical today. `emit-source-hashes.mjs:20-22`:

```js
function hashContent(s) {
  return crypto.createHash("sha1").update(s, "utf8").digest("hex").slice(0, 12);
}
```

`check-guide-translations.mjs:44-46` is the same three lines, with one addition
worth copying — a doc comment declaring the threat model: *"sha1 of a string —
used purely as a content identity, not for security."* That single line is what
makes SHA-1 truncated to twelve hex characters the right call rather than a
lapse. This is a **freshness pin, not a signature**; collision resistance
against an adversary is not in the story, and a shorter digest keeps the
provenance file readable. Contrast the artifact-signing discipline's canonical
hashing, where the same truncation would be negligent — same arithmetic,
different question. The application layer is where that distinction should be
stated, and here it is stated in the right place.

## The duplication is wider than the hash function

The technique's warning that **input assembly is part of the contract** is the
live risk in this pair, because the two scripts duplicate far more than
`hashContent`. Both carry their own `parseContentFile` (`emit:24-33`,
`check:54-65`) and their own `parseTopicsFile` (`emit:35-47`, `check:72-86`),
each a pair of hand-written regular expressions over source modules — the
content extractor keyed on `"topic-id": \`…\`,` and the topics extractor on an
object literal with `id`, `title` and `description` in any order. The digest
input is then assembled identically in both:

- `emit-source-hashes.mjs:65` —
  `hashContent(JSON.stringify({ title: meta.title, description: meta.description, body }))`
- `check-guide-translations.mjs:120` —
  `JSON.stringify({ title: meta.title, description: meta.description, body })`

`JSON.stringify` over an object literal is doing the composite-scope work the
technique asks for: fixed field order (insertion order, identical in both
files), unambiguous separators (JSON's own quoting and escaping), and a
declared encoding by way of `update(s, "utf8")`. It is a defensible
canonicalization. But it is defensible **twice**, in two places, and a change
to either regex — a tolerated whitespace variant, a newly permitted field
order — silently changes what gets hashed on one side only. Everything from
reading the file to formatting the digest is duplicated; nothing about it is
shared.

There is no test vector anywhere: no fixture pinning a known input to
`"89b406357e3c"`, nothing either script asserts at startup. The comment is the
entire mechanism.

## Measured: perfect parity, identical blindness

The comment at `emit-source-hashes.mjs:8-9` has in fact been obeyed. Both
extractors are byte-identical today. And both are wrong, in the same way, on
9% of the corpus.

The shared content pattern is `/"([a-z][a-z0-9-]+)":\s*\`([\s\S]*?)\`\s*,/g`
(`emit:27`, `check:59`). Bodies are template literals, so a code span inside a
body appears in source as an *escaped* backtick — and the non-greedy capture
happily treats one as the closing delimiter whenever it is followed by a comma.
`content/agents-prompts.ts:5` contains the prose `click \`Create Agent\`,` and
the match ends there.

Measured over `src/data/guide/content/*.ts` on 2026-08-22, comparing the
shipped pattern's capture against an escape-aware walk to each body's true
closing backtick: **11 of 116 English bodies are truncated (9.5%)**. The worst
is `creating-a-new-agent` at **110 of 1,778 raw source characters — 6.2%
hashed**, meaning 94% of that topic is outside the pin permanently. The rest
range from 28.0% (`schedule-triggers`) to 80.3%
(`exporting-and-importing-memories`), with `adding-a-new-credential` at 32.4%
of 5,779 characters and `understanding-the-interface` at 71.7% of 2,949.

Nothing about this is visible from the outside. The digests are the correct
shape and length, the two programs agree exactly, `--strict` would behave
consistently, and a hand-written test vector over a short body would pass. An
English edit inside any truncated tail moves nothing, so those units report
**fresh forever** — the failure lands in the direction that looks healthiest.
This is the technique's *parity is necessary and not sufficient* clause with a
number attached: parity was enforced on the hash function and never on the
extraction that feeds it, and enforcing it perfectly is exactly what produced
two programs that are reliably, identically blind.

The fix is the coverage assertion, not more parity: compare each captured body
against the length of the field it came from and fail on a shortfall — which in
this tree turns eleven silent prefixes into eleven loud errors on the next run.

## The positive control, measured the same day

Worth putting beside the negative result, because it says where this pipeline's
real risk sits. Extracting bodies with the escape-aware walk on both sides and
comparing the ordered sequence of `:::` directive fences — the renderer's
meta-language, which the prompt at `translate-guide-subagent-prompt.md:125-137`
forbids translating — gives **1,378 of 1,508 (locale, topic) body pairs
byte-identical, 91.4%**, across thirteen locales.

The 130 mismatches are not scatter. They are **exactly ten topics × thirteen
locales, and the same ten topics in every single locale** — which is the
fingerprint of the *English* side having moved after the translation pass, not
of any translator getting the structure wrong. All ten are recorded in the
provenance ledger, so all ten are hash-comparable; two of them
(`adding-a-new-credential`, `understanding-the-interface`) are also among the
eleven truncated bodies, so part of their structural change sits inside the
region the pin cannot see.

Read together: the model subagents preserved the renderer's meta-language
essentially perfectly, by prompt discipline alone, with nothing in the
repository parsing locale bodies to check them — and the only structural
divergence in 1,508 pairs is source drift, uniform across locales, which is the
exact population this subject exists to name. A pipeline whose translated
structure is that clean and whose freshness signal is blind on 9% of the corpus
is an honest picture of where the craft's risk actually lies: not in the
translation, in the bookkeeping.

Both figures were measured by walking each template literal to its true closing
backtick with escape handling, over the thirteen locale directories and ten
English category modules present on 2026-08-22; they count `(locale, topic)`
pairs present on both sides, and neither figure is a claim about prose quality.

## The fix this tree is one file away from

The technique's preferred rung is available here at low cost. Both scripts are
plain ESM run by the same Node, in the same repository, with no dependencies:
lifting `hashContent`, `parseContentFile`, `parseTopicsFile` and the
`JSON.stringify` assembly into a single `scripts/i18n/source-hash.mjs` that
both import removes the parity question rather than managing it, and lets
`emit-source-hashes.mjs:8-9` be deleted rather than obeyed. A fixture asserting
one known topic's digest would then guard the shared function itself.

Until that happens, note what the failure would look like in this tree: the
detector already reports 40 stale topics per locale
(`docs/harness/ambiguity-ui-scan-2026-07-16/localized-guide-content.md:9`), and
a parity break would report **all 116** — a number nobody in this repository
has a baseline for. The technique's self-suspicion threshold is worth adding
alongside the fix: when the stale fraction approaches the corpus size, report a
suspected instrument change rather than a work order.

## What the emitter carries beside the digest

`emit-source-hashes.mjs:60-70` builds the manifest, and it carries the
technique's legible-dimensions advice without being told to:

```js
hashes[topicId] = {
  hash: hashContent(JSON.stringify({ title: meta.title, description: meta.description, body })),
  title: meta.title,
  descriptionLength: meta.description.length,
  bodyLength: body.length,
};
```

`title`, `descriptionLength` and `bodyLength` are not inputs to the digest and
are not authoritative. They exist so that a human comparing two manifests can
see *what moved and roughly how much* without diffing two source revisions —
and so that a parser regression that starts matching empty bodies shows up as a
column of `bodyLength: 0` rather than as a corpus of plausible hex. The whole
manifest is wrapped with a `generated` timestamp at `:72`.

## Deviation: the digest is transcribed by the translating model

The pin's last hop is the pipeline's weakest. `scripts/i18n/translate-guide-subagent-prompt.md`
hands the source-hash manifest to a translating subagent as one of its inputs
(`:41-42`), and instructs the agent to write the provenance file itself
(`:92-109`), with `"translatedFromHash": "<HASH from the source-hashes
manifest>"` at `:102` and a working step at `:193` — *"Finally, produce
`_meta.json` with the source hashes from step 1."*

That routes 116 opaque twelve-character digests, per locale, through a
generative step whose failure mode is exactly transcription. One wrong
character yields a syntactically perfect record for a unit that will report
stale forever, be re-translated on every run, never become fresh, and give no
indication why. The technique's rule — **the tooling writes the pin; never
route an exact identifier through a generative step** — is a mechanical fix
here: have the orchestrator merge the emitter's manifest into `_meta.json`
after the subagent returns its prose, and drop the hash section from the prompt
entirely.

The same file shows two smaller provenance deviations. `translator` is a
**locale-level** field, not per-unit (`prompt:99` and every
`src/data/guide/locales/<lang>/_meta.json:5`), so a later pass that
re-translates four topics with a different agent either overwrites the identity
of the other 112 or leaves it stale — the "what else did that pass produce?"
question stops being answerable at the first incremental run. And the value is
a **literal in the prompt template** — `"translator": "claude-opus-4-7"` — so
the record states the model the template's author expected rather than the one
that ran.

## What the prompt gets right

Worth recording, because it is the craft half of the pipeline and it is good:
the prompt's translate / do-not-translate taxonomy (`:111-166`) is an explicit,
enumerated contract — every custom directive fence, `[recommended]` badges,
`color=#XXXXXX` attributes, emphasis markers, link URLs, table pipes, anything
inside backticks, an explicit brand and product list, an explicit technical-term
list, and the topic ids themselves as identifiers that are *"never translate,
never change"* (`:159-161`). Stable unit identity, spelled out to the agent
that would otherwise localize it.

The self-verification block at `:195-212` asks the agent to confirm its own
output before returning — and every one of its six checks is a **shape** check:
file prologue and epilogue strings, valid JSON, topic-id keys matching English
byte-for-byte, every id present in `topics.ts`, every id present in each
category file. Nothing verifies that the prose was derived from the source it
was given. That is not a criticism of the prompt so much as the subject's
central claim showing up one layer deeper than expected: the shape check is
what every layer builds, including the translator's own.
