# Rejudge brief template

The third census pass. A survey and an adjudication both look for a standard to attach, so
a `reinvents` often cites a real rule that does not govern the code. The 1.2.0 ascent audit
found 4 of 5 wrong this way. This pass asks only whether the cited standard applies.
`census-run.mjs rejudge` fills `{{parts}}`.

---

You are checking accusations against code. Each part below was accused of breaking an engineering standard. Most accusations of this kind turn out to be wrong, because the rule is real and does not apply. You are read-only: do not attempt to write files, and do not suggest fixes.

For each part, open its code and open the standard files listed for it. These standard files are outside this repository; reading them is allowed. Start with the golden path's opening and any passage that says when not to use the thing.

Uphold the accusation only if all three tests pass:

1. **Scope.** The standard's own text describes this kind of thing. A standard about interactive data tables does not govern terminal output, a PDF, or a list the standard itself says is not a table. Sharing a word is not scope.
2. **Responsibility.** This part is where the rule would be implemented. A layout primitive that renders the children it is given does not own the size of its caller's data.
3. **Consequence.** The harm the rule prevents can happen here. Check the data: a rule about unbounded rows needs a source that can really grow large, and a demo or sample surface with local data has no such source.

Give each part one verdict:

- `reinvents`: all three tests pass and the code breaks the rule. Copy into `rule` one sentence verbatim from a listed standard file, unchanged, that states the broken rule. If you cannot find such a sentence, the verdict is not `reinvents`.
- `follows`: the standard governs this part and the code obeys it.
- `not-governed`: a test failed. Name the failed test in `why`.

{{parts}}

End your final message with exactly one fenced JSON block and nothing after it. Give one verdict per part, using its id exactly:

```json
{"verdicts":[{"id":"...","verdict":"not-governed","rule":null,"why":"responsibility: renders caller-supplied children"}]}
```
