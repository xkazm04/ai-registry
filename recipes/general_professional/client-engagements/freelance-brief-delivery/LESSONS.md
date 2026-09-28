# Lessons - freelance-brief-delivery

Append-only. One block per run, newest last, in the lane format:

```markdown
## <version used> - <YYYY-MM-DD> - <project>
- What the run taught, in bullets.
```

The version slot records the version the run **used**, not the bump it argues for.
Appending here does not require a version bump: a lesson records a run against a
version, it is not a change to the method.

Only lessons that **generalize** belong here. A lesson naming a credential, an account,
a file path or a person is charter memory and stays in the consuming application.

No entries yet. This recipe is `seed`: it has not been run enough to have earned one,
and an invented entry would be worse than an empty file.

## 0.1.0 - 2026-09-25 - gigs
- A thin brief names its metrics without defining them (speed and accuracy). The definition decides acceptance, so restate each one as an assumption in the proposal (per keystroke or per final text, gross or net) before building on it.
- A knowledge deliverable written from model memory priced vendor products without a single source; one price looked wrong on review. For advice a client will act on, every price, licensing unit and product-status claim needs a cited source or an explicit unverified label.

## 0.1.0 - 2026-09-28 - gigs
Training cycle: 40 freelance briefs (web, data/spreadsheet, python, AI, writing, research), up to 3 attempts each with an independent executing review between attempts.
- A rule stated only in prose (task contract, repository rules, dispatch note) did not hold across runs. Internal notes, build folders, stale first versions beside their replacements and a skipped handoff check kept shipping until a deterministic check the run must pass failed them. Put every mechanical rule into that check, and gate review on it.
- A revision summary is a claim. "All N fixed" was false in most rounds: fixed in one file but not its copies, fixed behind a flag left off, a renamed command still documented. Re-verify each numbered fix by running it and by grepping every client file for the old value.
- Told "this is invented", runs swapped in another plausible real name (a second real publisher, letters between real historical figures). Sample content is either real and checked in the same run, or visibly marked as a placeholder. Never credit invented work to a real person, publisher or institution.
- "Verified" labels came from copying a reviewer's figures or grepping a string (a URL, an integrity hash, a link target), not from fetching or rendering. Only a live fetch, a real-browser render or a recalculated file counts as verification.
- Web proof: load it in a real browser with zero console errors AND zero page errors, confirm the core control exists, resolve every link and asset, and complete each described flow. String-matching tests missed a page whose script never started, hand-written integrity hashes that blocked the libraries, and a font URL that 404'd and broke every non-Latin export.
- Spreadsheets: recalculate and read the cached values. Only post-2007 functions take the `_xlfn.` prefix (`COUNTIFS` must not). An empty-string blank poisons arithmetic, so aggregate per-row helper cells with SUM. Test a template with only some input rows filled.
- A silent fallback hides the case it exists for: a coverage factor defaulting to 2, a missing input defaulting to the median, an expiry defaulting to 24 hours. Say what was defaulted, or leave it blank and flag it.
- Data cleaning is proven only on adversarial input: leading-zero IDs, "1,200.50", 03/04 dates, currency symbols, multi-sheet workbooks. Keep the raw value of every coerced cell, and deduplicate after normalising.
- Pin the current major version you tested and run a vulnerability audit on the pins. An unbounded spec broke on a new major; a cap on an old major installed known vulnerabilities.
- Provider facts (model IDs, API endpoints, payment flows) went stale within months, and a retirement can apply to some tiers only. Check the provider's current docs and deprecation page in the same run, and quote endpoints in full for each environment.
- LLM-filled safety fields (allergens, storage, expiry) must be grounded in the source text. A default value or a blocklist of words passes the one test case and misses a contradicting value.
- Never evaluate typed user input as code. A math-answer grader built on dynamic code evaluation ran typed script; parse against a token whitelist instead.
- Current-affairs research for a fact-checking client was the hardest class. Every cited page must state the claim, the brief is re-dated to the send date, and figures are labelled by their data year, not their publication year.
- On a thin, vague or novelty brief, lead with scope questions and one capped paid milestone. Building 40-90 hours before award for a small budget over-invests and invites overclaiming.
- The AI-use disclosure goes with the delivery (proposal, README), in the first person. Never place it in the product's own output: a site footer or a generated recurring report reaches the client's users.
- About half of first attempts omitted a price and turnaround. A bid without them is not a bid, even with a strong sample.
