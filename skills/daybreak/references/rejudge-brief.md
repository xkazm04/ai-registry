# Rejudge brief template

The third census pass. A survey and an adjudication both look for a standard to attach, so
a `reinvents` often cites a real rule that does not govern the code. The 1.2.0 ascent audit
found 4 of 5 wrong this way. This pass asks only whether the cited standard applies.
`census-run.mjs rejudge` fills `{{parts}}`. 1.4.1: an accusation names the failure its rule guards against and the line where the input that reaches it originates; code checks the line exists. 1.4.0 also listed input types that clear a part, and the judges cleared six true accusations by quoting that list.

---

You are checking accusations against code. Each part below was accused of breaking an engineering standard. Most accusations of this kind turn out to be wrong, because the rule is real and does not apply. You are read-only: do not attempt to write files, and do not suggest fixes.

For each part, open its code and open the standard files listed for it. These standard files are outside this repository; reading them is allowed. Start with the golden path's opening and any passage that says when not to use the thing.

Uphold the accusation only if all three tests pass:

1. **Scope.** The standard's own text describes this kind of thing. A standard about interactive data tables does not govern terminal output, a PDF, or a list the standard itself says is not a table. Sharing a word is not scope.
2. **Responsibility.** This part is where the rule would be implemented. A layout primitive that renders the children it is given does not own the size of its caller's data.
3. **Consequence.** The harm the rule prevents can happen here, from an input this code really receives. A rule about unbounded rows needs a source that can really grow large; a rule about data in flight needs a request that is really in flight while the user looks. See the trigger rule below.

Give each part one verdict:

- `reinvents`: all three tests pass and the code breaks the rule. Copy into `rule` one sentence verbatim from a listed standard file, unchanged, that states the broken rule, and fill `guards`, `trigger`, `triggerFile` and `harm`. If you cannot find such a sentence and such a line, the verdict is not `reinvents`.
- `follows`: the standard governs this part and the code obeys it.
- `not-governed`: a test failed. Name the failed test in `why`.

Each part names where an accusation may quote from ("Accuse from"). When that is one technique's file, the claim was about that technique: judge the part on it, and use the other files only to decide whether it applies. A different shortcoming elsewhere in the standard is not this part's accusation.

Every accusation must show how its harm happens in this code. First write in `guards` the failure the broken rule exists to prevent, in this code's terms (for example: a reviewer acts on rows left over from a page that failed to load). Then trace a real input to that failure. Copy into `trigger` one exact line where the input originates (a fetch or query, a request handler, a user event, a subscription, a file or message read from outside), and put that line's file in `triggerFile` when it is not the part's own file. A line that only passes data along, such as a prop or a parameter, is not an origin: follow it. Say in `harm`, in one sentence, who is hurt and how.

Decide the consequence test by following that input through the code, not by the kind of input it is. A capped, cached or server-rendered input can still reach the failure the rule guards against, and an external one may never reach it. If the input you traced cannot reach that failure here, answer `not-governed` and say in `why` where the path stops.

{{parts}}

End your final message with exactly one fenced JSON block and nothing after it. Give one verdict per part, using its id exactly:

```json
{"verdicts":[{"id":"...","verdict":"reinvents","rule":"verbatim sentence","guards":"the failure the rule prevents, in this code's terms","trigger":"exact line where the input originates","triggerFile":"src/path/when/not/the/part's/file.ts","harm":"who is hurt and how","why":null},{"id":"...","verdict":"not-governed","rule":null,"why":"consequence: a failed request clears the rows before the error renders, so stale rows never show"}]}
```
