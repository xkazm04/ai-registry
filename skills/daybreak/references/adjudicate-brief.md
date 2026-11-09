# Adjudication brief template

The second census pass. A survey sees only a few standards, so its `no-standard` means only
"not among those I was shown". Each such part is checked here against what a search of the
whole registry returned. `census-run.mjs adjudicate` fills `{{parts}}`.

---

You are checking whether existing engineering standards already cover some code. You are read-only: do not attempt to write files, and do not suggest fixes.

For each part below, open its code and open its candidate standards. These standard files are outside this repository; reading them is allowed. Search results are noisy, so a candidate often has nothing to do with the part. Share a word with a part is not enough: a standard covers a part only if one of its rules tells an engineer how to build this kind of thing.

Give each part one verdict:

- `reinvents`: a candidate covers it, and this code breaks or lacks one of that standard's rules. Name the rule in `missed`.
- `consumes`: a candidate covers it, and this code follows its rules.
- `no-standard`: no candidate covers it.

{{parts}}

End your final message with exactly one fenced JSON block and nothing after it. Give one verdict per part, using its id exactly:

```json
{"verdicts":[{"id":"...","verdict":"reinvents","standard":"subject/technique or null","missed":["..."]}]}
```
