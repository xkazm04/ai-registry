# Settle brief template

The last judging pass. A part lands in `unverified` when two judges disagreed about an
accusation, or when a judge could not back its own claim with a quoted rule or code line.
The 1.4.1 ascent audit found 4 of 10 such parts were clear calls nobody made: a CLI with no
retry, a terminal benchmark chart, a sample-data table, a review flow that visibly follows its
standard. This pass shows a third judge both arguments and asks it to decide. Its verdict
counts only when it is backed the same way as every other verdict. `census-run.mjs judge`
fills `{{parts}}`.

---

You are the last judge on parts that earlier judges could not settle. Each part below was either accused of breaking an engineering standard and then contested by a second judge, or claimed by a judge who could not back the claim. Both earlier arguments are shown. They may both be wrong. You are read-only: do not attempt to write files, and do not suggest fixes.

For each part, open its code and open the standard files listed for it. These standard files are outside this repository; reading them is allowed. Start with the golden path's opening and any passage that says when not to use the thing. Then read the earlier arguments and check each factual claim they make against the code: a claim about what calls what, or what is cached, or where data comes from, is true only if you find it.

A standard governs a part only if three tests pass:

1. **Scope.** The standard's own text describes this kind of thing. Sharing a word is not scope.
2. **Responsibility.** This part is where the rule would be implemented. A script a developer runs by hand, such as a seed, a benchmark or a one-off tool, is responsible for a rule only when it already does what the rule governs: one that retries owns the retry rule, one that never retries does not, because the person running it sees the failure and runs it again.
3. **Consequence.** The harm the rule prevents can happen here, from an input this code really receives.

Give each part one verdict:

- `reinvents`: all three tests pass and the code breaks the rule. Copy into `rule` one sentence verbatim from a listed standard file, and fill `guards`, `trigger`, `triggerFile` and `harm` as described below.
- `follows`: the standard governs this part and the code obeys it. Copy into `rule` one sentence verbatim from a listed standard file, and into `evidence` one exact line from the part's file that shows the rule being met.
- `not-governed`: a test failed. Start `why` with the failed test's name (`scope:`, `responsibility:` or `consequence:`) and say what in the code or the standard shows it.
- `unsure`: only when the code itself does not decide it, for example when the answer depends on how large a customer's data gets. Say in `why` which fact would decide it. A part you have not read is not `unsure`.

Most of these parts are not hard. A script that never retries is not governed by a retry rule. A terminal printout is not a product chart. A table of fixed sample rows has no data that can grow. Decide those.

Each part names where an accusation may quote from ("Accuse from"). When that is one technique's file, the claim was about that technique: judge the part on it, and use the other files only to decide whether it applies. A different shortcoming elsewhere in the standard is not this part's accusation.

Every accusation must show how its harm happens in this code. First write in `guards` the failure the broken rule exists to prevent, in this code's terms. Then trace a real input to that failure. Copy into `trigger` one exact line where the input originates (a fetch or query, a request handler, a user event, a subscription, a file or message read from outside), and put that line's file in `triggerFile` when it is not the part's own file. A line that only passes data along, such as a prop or a parameter, is not an origin: follow it. Say in `harm`, in one sentence, who is hurt and how. Decide the consequence test by following that input through the code, not by the kind of input it is.

{{parts}}

End your final message with exactly one fenced JSON block and nothing after it. Give one verdict per part, using its id exactly:

```json
{"verdicts":[{"id":"...","verdict":"not-governed","rule":null,"why":"scope: a CLI script that prints and exits; the retry standard governs request wrappers that retry"},{"id":"...","verdict":"reinvents","rule":"verbatim sentence","guards":"the failure the rule prevents, in this code's terms","trigger":"exact line where the input originates","triggerFile":null,"harm":"who is hurt and how","why":null}]}
```
