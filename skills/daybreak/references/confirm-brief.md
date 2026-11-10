# Confirm brief template

A judging pass. A survey's `consumes` is an unbacked compliment: audited, 2 of 5 cited a
standard that had nothing to do with the code. Each `consumes` that names a standard must be
shown to follow it. `census-run.mjs judge` fills `{{parts}}`. 1.4.1: an accusation names the failure its rule guards against and the line where the input that reaches it originates; code checks the line exists. 1.4.0 also listed input types that clear a part, and the judges cleared six true accusations by quoting that list.

---

You are checking compliments against code. Each part below was said to follow an engineering standard. Many of these claims turn out to be empty, either because the standard has nothing to do with the code or because nobody checked the code against it. You are read-only: do not attempt to write files, and do not suggest fixes.

For each part, open its code and open the standard files listed for it. These standard files are outside this repository; reading them is allowed. Start with the golden path's opening and any passage that says when not to use the thing.

First decide whether a listed standard governs this part at all. It governs only if its own text describes this kind of thing and this part is where its rules would be implemented. A standard about what a metric means does not govern how its chart is drawn. A memoized value in a hook is not a table. More than one standard may be listed, and the cited one may be the wrong one: judge against whichever governs.

Then give each part one verdict:

- `follows`: the standard governs it and the code obeys. Copy into `rule` one sentence verbatim from a listed standard file, and into `evidence` one exact line from the part's file that shows the rule being met.
- `reinvents`: the standard governs it and the code breaks a rule whose harm can really happen here: a user or caller is hurt, or a stated failure occurs. A preference about how code is organized, with no such harm in this part, does not count. Copy the broken rule into `rule`, verbatim from a listed standard file, and fill `guards`, `trigger`, `triggerFile` and `harm`.
- `not-governed`: the standard does not govern this part. Say why in `why`.

If you cannot find such a sentence and such a line, do not answer `follows`.

Each part names where an accusation may quote from ("Accuse from"). When that is one technique's file, the claim was about that technique: judge the part on it, and use the other files only to decide whether it applies. A different shortcoming elsewhere in the standard is not this part's accusation.

Every accusation must show how its harm happens in this code. First write in `guards` the failure the broken rule exists to prevent, in this code's terms (for example: a reviewer acts on rows left over from a page that failed to load). Then trace a real input to that failure. Copy into `trigger` one exact line where the input originates (a fetch or query, a request handler, a user event, a subscription, a file or message read from outside), and put that line's file in `triggerFile` when it is not the part's own file. A line that only passes data along, such as a prop or a parameter, is not an origin: follow it. Say in `harm`, in one sentence, who is hurt and how.

Decide the consequence test by following that input through the code, not by the kind of input it is. A capped, cached or server-rendered input can still reach the failure the rule guards against, and an external one may never reach it. If the input you traced cannot reach that failure here, answer `not-governed` and say in `why` where the path stops.

{{parts}}

End your final message with exactly one fenced JSON block and nothing after it. Give one verdict per part, using its id exactly:

```json
{"verdicts":[{"id":"...","verdict":"follows","rule":"verbatim sentence","evidence":"exact line of code","why":null},{"id":"...","verdict":"reinvents","rule":"verbatim sentence","guards":"the failure the rule prevents, in this code's terms","trigger":"exact line where the input originates","triggerFile":null,"harm":"who is hurt and how","why":null}]}
```
