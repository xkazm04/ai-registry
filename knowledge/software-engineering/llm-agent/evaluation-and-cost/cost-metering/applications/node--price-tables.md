---
layer: application
type: application
subject: cost-metering
technique: price-tables
stack: node
applied: code
ab_verdict: better
proof: ab-paired
verified_on: 2026-09-02
verified_against: node@24
---

# Two price tables, one vendor promotion, and a key that moved without its number

Two Next.js 16 applications metering the same vendor's flash-tier model, read
on 2026-09-02 — the day that vendor shipped a point release — at commits
`e772dd52` and `ad007e37`. Both declare `"engines": {"node": "24.x"}`, which
is the pin. They were opened to answer one question: what does a table have to
do when a model id moves under it. They disagree about half of it, on the
record, and the disagreement is the useful part.

## 1. The same promotion, booked two opposite ways, both argued

The vendor shipped the successor at its predecessor's introductory rate, with
a published expiry and a 2x step on a named date. Three tables in this fleet
had to decide what to store, and they did not agree:

- The first books **the introductory rate**, and its comment says why: the
  figure feeds an on-screen spend estimate that is "what an org is actually
  billed today", so "carrying the standard rate now would overstate every cost
  and therefore every ROI figure derived from it".
- The second books **the standard rate**, and its comment says why with equal
  force — it does the same for another vendor's promotional tier, "booked at
  the standard rate deliberately so cost comparisons don't silently improve
  when the promo lapses".

Neither is wrong. They are answering different questions with the same field,
which is exactly the split the technique now names: a rate shown as current
spend and a rate used to rank candidates are not the same number, and a table
serving both without saying which it is doing cannot be audited by anyone who
was not there. The evidence that this is a real fork and not a style
difference is that both files argue it, in prose, unprompted, in opposite
directions.

## 2. The alarm that is a test rather than a comment

The first application implements the mechanism the technique describes, and
it is worth reading because it also states the trade it accepted. The table
has no date dimension — "adding one for a single temporary promo would put a
clock inside a pure lookup" — so the schedule lives in the suite instead: a
test that throws once the current date passes the expiry, with the message
"update the MODEL_PRICES row to inPerMTok: 1.5, outPerMTok: 7.5 and update
this test's expectations". The replacement rate travels in the failure, so
acting on it is an edit and not an investigation.

The successor landed onto the *same* promotion, inheriting the original expiry
rather than opening a fresh window, which is what made the guard's shape
matter: it had to become a set rather than a single row. That generalized in
one line and is the reason the technique now says the guard covers the rows on
the schedule, not the row.

## 3. The structural fact: an existence check that cannot see the defect

The second application produced the finding neither file was written to
produce, and it is negative.

Its rate rows for this vendor are keyed by **the constant that names the
current model**, not by a literal identifier. A test asserts that every model
the router can select has a rate row, and the repo's own comment calls that
join "CHECKED, not conventional". When the model constant moved from the
preview id to the successor, the key followed automatically, the assertion
stayed green, and the rate underneath it still described the preview — pricing
the new model at `0.075 / 0.3` against its actual `0.75 / 3.75`. **A tenfold
understatement, behind a passing test, with no unpriced row and no warning.**

Nobody designed that. It falls out of the join being computed rather than
literal, and it is the sharpest available demonstration that an existence
check over a computed key proves a row exists for the current model and never
that the row is that model's. The two claims are indistinguishable in the
assertion and diverge the instant the constant moves.

## 4. A/B

The arms were run on the tree, not reasoned about.

- **A** — move the model constant, change nothing else. The first application's
  shipped-defaults test fails with `no built-in rate for default model`, which
  its own comment had predicted ("a single unpriced model nulls the whole org's
  /usage estimate"). One failure. The second application's model-pin gate
  reports one finding naming the constant that moved. Its rate test does **not**
  fail — this is the defect in §3, and A is where it is visible as a silence.
- **B** — add the rate row, extend the dated guard to cover both rows, correct
  the computed-key rate. Both gates green: 45 and 8 assertions respectively,
  and the full suites at 2176 passing and unit-green.

Verdict **better**, on the narrow claim the technique makes: the table's
defects are systemic and its guards are cheap. Worth recording that the guard
which caught the most was the one asserting a *default* had a price, and the
guard that caught nothing was the one asserting the *join* was complete.

## 5. What this realization cannot do

Neither table prices the thing that actually moved. The vendor's successor
costs the same per token and spends more of them, so both applications will
report an unchanged cost basis while the bill rises, and both are correct to.
Nothing here is instrumented to notice: a rate table is the wrong instrument
for a change in tokens per task, and reading a flat rate as a flat cost is the
error these files make available. The metering ledger beside them can see it;
the table cannot, and should not be extended to try.
