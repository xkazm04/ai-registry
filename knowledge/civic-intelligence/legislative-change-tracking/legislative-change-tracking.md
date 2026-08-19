---
layer: golden-path
type: golden-path
subject: legislative-change-tracking
status: forged
use_when:
  - following a bill from introduction to statute
  - reconstructing which statutes a bill amends
  - detecting overlap between pending bills
  - dating procedural steps for publication
techniques:
  - statute-citation-extraction
  - amendment-instruction-grammar
  - statute-collision-clustering
  - committee-routing-reconstruction
  - sponsorship-and-rapporteur-roles
  - bill-fate-dating
---

# Legislative change tracking

Legislative change tracking is the reconstruction of what a legislature is doing
to the law: which bills exist, what statutes each one would amend, who is pushing
it, which committees hold it, where two pending bills are about to edit the same
provision, and — with honest dates — how far each has actually travelled toward
the statute book. The naive reading treats this as a lookup problem: surely the
register records what a bill amends, who wrote it, and when each step happened.
It records none of those things cleanly. A principal practitioner starts from the
opposite assumption: **every fact you want is encoded indirectly, in free text,
in event tables without dates, in signature lists, and in open code spaces the
publisher never finished documenting** — and the craft is a set of disciplined
reconstructions, each of which knows exactly what it cannot know.

The subject matters because its outputs are claims about named legislators and
about the law itself. "This bill amends the tax statute", "this member sponsored
it", "it was referred to committee on this date", "it became law as number N" —
each of these, published wrongly, is not a bug but a false public statement.
That is why every technique in this subject carries a refusal path: what to emit
when the reconstruction cannot be made honestly.

## The register lies by omission, not by commission

A legislature's print register is usually accurate about what it directly
records — a print exists, it has a number, events occurred. The traps are in
what it does *not* structurally record:

- **The bill→statute link is free text.** There is typically no structured
  field saying which statutes a bill amends. The link lives inside the bill's
  official title and body as legal citations, in a national citation convention,
  and must be extracted — with the convention's near-miss collections (treaty
  series, regulatory gazettes that share the numbering shape) explicitly
  excluded, because a citation that matches the shape but points into a
  different collection creates a confidently wrong edge.
- **Event tables carry codes, not meanings.** Procedural status is an enum the
  publisher documents partially; live dumps carry values no documentation
  covers. The correct posture is a closed mapping plus an explicit "unknown"
  member — never a fold of undocumented codes into the weakest real status,
  which converts "we don't know" into a factual procedural claim.
- **Dates live one join away.** The table that says *what* happened (a
  committee assignment, a publication) often carries no date; the date sits on
  a linked history step. Which step's date you pick is an editorial decision,
  and the register's row order is not a defensible one.
- **Authorship fields are unreliable.** The print's own "author" column may be
  empty for exactly the bills you care about; real authorship lives in the
  signature table, with an order that distinguishes the responsible first
  signatory from members who joined later. Attribution from the wrong field
  silently drops or misassigns credit.

None of these are defects to patch upstream. They are the permanent shape of
parliamentary open data, and the pipeline is designed around them.

## The load-bearing distinctions

**A citation is not an instruction.** A statute number appearing in a bill's
text proves only that the drafter *pointed* at that statute — as context, as a
cross-reference, as quoted existing law. An amendment *instruction* says what to
DO to a provision ("in § N, replace the words…", "§ N is repealed"). The
drafting conventions of novelization are a small closed grammar, which makes the
distinction decidable in deterministic code. Everything downstream — the
amendment graph, collision detection, impact claims — is only as honest as this
distinction, because the incidental-mention class dominates raw matches.

**An omnibus bill is several bills in one envelope.** A single print can amend
many statutes, each in its own article. Any per-provision analysis that treats
the bill's text as one flat document will cross-contaminate: provision numbers
from statute A will appear to collide with the same numbers in statute B. The
bill must be partitioned per target statute before any provision-level claim is
made, and blocks that name no statute of their own go into an explicit
"unknown" bucket rather than being attributed by proximity.

**A collision is a lead, not a finding.** Two pending bills issuing
instructions against the same provision of the same statute is a fact worth
surfacing — it predicts drafting conflict, sequencing fights, and last-writer
effects. But whether they *substantively* conflict requires reading them.
Machine-detected overlap is triage input for a human; publishing it as
"conflict" asserts something the code never established.

**A step's date belongs to that step.** When a print reaches its strongest
recorded status through several events, the honest date is the *earliest* event
at that *strongest* status — the first moment the print demonstrably held the
state you are reporting. Never borrow a weaker step's date to fill a gap:
"referred · on the day it was merely proposed for referral" is a false claim
about when the referral happened. If the strongest status has no dated event,
report the status undated. Undated-but-true beats dated-but-invented, every
time.

**Roles have rank.** Sponsorship is not a set; it is an ordered signature list
in which position one carries responsibility and later signatures carry
association, with a further flag for members who joined after submission.
Rapporteur (the member assigned to analyze and report on the bill) is a
different role again, arising in several procedural places — plenary
designation, committee assignment, follow-up documents — with different
evidentiary weight: the committee-level rapporteur is the strongest "did the
analytical work" signal. Flattening these into "involved with the bill"
destroys the only attribution structure the record actually supports.

## Fate, and the dignity of refusing a date

A bill's fate — its current procedural state, and for enacted bills its
publication as a numbered statute — is the subject's terminal claim and its most
dangerous one, because a statute citation built from a broken publication date
carries the fault into a law number. Source dumps contain impossible dates:
century typos, month thirteen, days that do not exist. The rule is refuse, keep,
count: refuse the derived citation whole (never repair the date — a repaired
value is an invented value), keep the bill and its procedural state (those are
independently attested), and increment a counter so the corpus-level total of
refusals is reportable instead of silent. Plausibility bounds are anchored to
the day the dump was *retrieved*, not to "now" at render time — a publication is
a past event, and the ceiling travels with the data.

## Failure modes of the naive reading

- **Trusting the shape of a citation.** Same number-slash-year shape, different
  collection — a treaty, not a statute. Every extraction needs the negative
  lookahead for the near-miss collections, learned from measured false edges.
- **Counting mentions as amendments.** The incidental class (a bill's own
  internal article numbers, cross-references, quoted text) is the single
  largest source of false amendment edges and false collisions.
- **Guessing at unknown codes.** Folding an undocumented status code into the
  nearest real status publishes a procedural claim nobody made.
- **Dating by dump order.** When ties are broken by whatever order the
  publisher wrote the file, the product's dates change when the dump is
  re-exported. Deterministic tie-breaks (earliest at strongest) are the only
  dates worth printing.
- **Attributing from the convenient column.** The field that is populated is
  not necessarily the field that is authoritative; verify which table the
  legislature actually maintains for authorship before crediting anyone.
- **Underclaiming silently.** Free-text extraction of omnibus bills
  undercounts amendment targets by construction (titles abbreviate; annexes
  hide). An honest pipeline states its extraction method's known undercount
  rather than presenting the extracted graph as complete.

## How the techniques compose

Citation extraction builds the candidate bill→statute edges from free text;
the instruction grammar upgrades candidates to genuine amendment claims and
kills the incidental class; collision clustering partitions omnibus bills per
statute and surfaces same-provision overlap between pending bills as leads;
committee routing reconstructs where each bill sits and with what formal
status; sponsorship and rapporteur roles reconstruct who is responsible for
and who is analyzing each bill; and fate dating closes the loop from
introduction to statute with dates that can each defend themselves. The order
matters: instruction discrimination and per-statute partitioning must run
before any collision or impact claim, and every layer's refusal states
("unknown" committee status, undated strongest step, refused publication)
must survive to the published surface rather than being tidied away.
