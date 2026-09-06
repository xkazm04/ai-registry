# conformance-checking

Coverage notes for `software-engineering/engineering-assessment/maturity-and-conformance/conformance-checking`.

## 2026-09-06 — `harbor-0906` (intake, `github:av/harbor` @ `4c20a82`)

Landed two techniques — `inline-predicate-rung-inference` (9th) and
`rule-registry-enumerated-fixtures` (10th) — plus two source-tree applications.

**Both sit against `declared-then-proven`'s assumption of two artifacts.** That
technique's proof ladder (presence / shape / execution) assumes a declaration
the project writes and a checker somebody else wrote, with the rung assigned
deliberately by the checker's author. The source collapses the pair: every
claim in a 593-entry specification carries its own inline shell predicate, so
there is no checker to drift into a transcriber — the failure `declared-then-proven`
exists to prevent is structurally removed, and the rung choice moves to the
claim's author with nowhere to record it.

The finding is measured rather than argued, and the measurement is the
technique's own subject: 543 of 593 claims (91.6%) carry a command, but
classified by the binary each actually **invokes**, 62.8% are text matches,
16.0% parse-and-assert, and only 20.8% execution. The headline coverage number
answers "has a command"; it is read as "is proven"; the two are five times
apart. The first classifier written for this got it wrong in the flattering
direction — matching a binary name anywhere in the command string rather than
at invocation position reported execution at 40% — and that error is now in the
technique as its instrument warning, because a rung classifier is written by
someone who already believes the spec is well proven.

`rule-registry-enumerated-fixtures` extends `fixture-repo-testing` downward.
That technique pairs fixtures at repository granularity ("one per clause where
affordable") and mentions the per-rule fixture only in a closing clause, as the
fallback when a live path cannot be mutated. For a checker that is a **registry
of independent rules** rather than one program, the fallback is the primary
form and can be made structural: pair per rule id, enumerate the pairing from
the registry, and an unfixtured rule then fails discovery instead of review.

**The boundary was witnessed, not hypothesized.** The source's own suite has
four passes; the enumeration covers the declarative one, and a rule implemented
in code in another pass is bridged by a hand-maintained map inside the harness —
precisely the hole the enumeration was built to close, reopened one entry at a
time. It also produces a false reading in the other direction, which caught
this run first: the fixture directories show an unbroken numeric sequence with
one id missing, and the natural inference (a retired rule) is wrong.

Placement was not contested. Both techniques answer this subject's stated
question — what an executable verdict about a repository may claim — and
neither belongs in `quality-gates`, whose audience is the author who just broke
the build rather than an owner being assessed.

Applied: `bash--inline-predicate-rung-inference` (experiment, `better`,
ab-paired, 1.9x arm difference on the execution share) and
`deno--rule-registry-enumerated-fixtures` (simulation, `unmeasurable`,
structural-only — the instrument that would make it measurable is named, and it
is the union enumeration the technique recommends).

Shipped downstream: the second technique's seam in a managed desktop project —
22 gate scripts reachable from its `check:*` registry, 2 with a negative
control — now carries an enumerating ratchet and its own self-test.

## 2026-08-31 — `whatwg-html-0831` (intake, `github:whatwg/html` @ `778afd9`)

Landed `declared-deviation-register` (7th technique) plus a golden-path section,
"Some failures are decisions, and they need their own class", and one application
(`rust--declared-deviation-register`, simulation, `better`).

**Found by a corpus-wide empty, not by a gap in this subject.** `research-map`
returned `PRIOR ART: none` for `"intentional nonconformance"` and for
`"why we deviate"` across 341 subjects in 8 bundles. The method warns that a
near-empty is more dangerous than an empty, so the four nearest subjects were
opened before believing it: `vendored-fork-ledger` in `supply-chain` covers
copying and patching somebody's code (the guards *end*), `standard-versus-consumer-split`
in `knowledge-registry` covers what publishes versus what stays local,
`ipc-contract` explicitly disclaims public-API economics, and
`generated-from-provenance` in `repo-manifest-standard` reserves manifest space
for "intent, exceptions, deliberate deviations and their reasons" as *human
fields a synthesizer must not overwrite* — which is a write-protection rule, not
a publication rule. None of them holds this. The empty was real.

The home was contested and the argument is worth keeping. This subject's own
boundary statement pushes contract *declaration* to `repo-manifest-standard`
("declared there, proven here"), which reads as an exclusion. It is not, because
the register's function is arithmetic rather than declarative: an accepted
deviation is a **third finding class** in a checker's output, never a suppression
(which inflates the pass ratio by exactly the number of failures the team
accepted — the incentive backwards) and never an ordinary failure (which
calibrates a team to a permanent non-zero floor, after which nothing new is
visible). That consequence lands directly on `pass-ratio-comparability`'s stated
concern, which is why it belongs here and not next door.

The golden path's four outcome kinds — hard failure, failure, warning, unable to
check — sort findings by what the checker *knew*. The fifth sorts by what
somebody *decided*, and the new section says so without disturbing the ladder.

Shared root with `fabrication-economics`, landed the same run into
`quality-gates`: both are a true, known violation that must be declared in band
and must not be reported as news. **They were deliberately not merged**, against
the standing preference for synthesis, because the decision rules do not overlap
— an author who could not comply versus a maintainer who chose not to, with
different failure modes (an undetectable fabrication; a repair that reintroduces
the avoided problem) and different required fields. The discriminator is stated
in both files.

Uncontended on the board for the whole run.


## 2026-09-02 - intake (dora, run intake-dora-0902)

`declared-deviation-register` gained "Key the entry by the finding's
identity, never by its position" and cites `identity-survives-reuse`: a
waiver keyed by file:line:column is an index-based key that un-matches on
any unrelated edit above the site, and the accepted finding then
resurfaces as a regression with no visible cause. Key by rule plus symbol
or mutation name; where a position cannot be avoided, a non-matching entry
is reported loudly, never dropped. Source: a mutation-testing waiver
written as a line-pinned regex, caught by an adversarial review and
rewritten to key on the mutation's name. New application
`node--declared-deviation-register` (simulation, better, structural-only):
the fleet's ratchets already key by identity, and the application says
what that keying does not provide (no site, no motivation - a ratchet with
honest keys, not a register).

## 2026-09-03 - intake run `intake-boa-0903` (source: a language engine's conformance tester)

New technique **`edition-stratified-conformance`**, the eighth. `pass-ratio-comparability`
named the force ("a new standard version moves every score... two different measurements
sharing an axis") and stopped at refusal; the source showed the mechanism for a
specification that accumulates editions with an upstream suite that grows monthly: pin the
suite's revision beside the ignored list (reason classes: unimplemented / pending /
deliberate), classify each check by the maximum of its features' minimum editions from
one authoritative map and report cumulatively so older editions hold still, diff finding
sets by identity (newly passing, newly failing, new crashes, fixed crashes) with the
crash as its own class at the hard-failure rung, and post the diff beside the change
against a trunk baseline stored outside the repository, with the gate decision human
except for a named new crash. Applications: `rust--edition-stratified-conformance` (the
source tree, every move anchored) and `node--edition-stratified-conformance` (**code,
better, ab-paired**): the fleet's maturity index keyed its outcomes lane by rubric version
and its regression-alert lane by nothing - a rubric bump would have paged every org at
once - and a nine-line guard moved dispatches 1 -> 0 under the file's own suite. Lead
banked: spec-step comments as a per-line deviation register (`declared-then-proven`'s
neighbour), return condition a second stepped-specification implementation.

## 2026-09-04 - `gamedev-res` (intake, `github:Kavex/GameDev-Resources` @ `f7c89aa`)

No technique. One application - `applications/process--checker-false-positive-discipline.md`
- and it is a **confirmation**, which is the outcome worth recording.

`checker-false-positive-discipline` ends its decision rules with a warning it did
not evidence: *"Provide an exemption path, and make exemptions expire. Permanent
silent suppressions recreate the false-pass problem with paperwork."* A twelve-year
public curated index built the exemption path exactly as prescribed - declared in
the repository, a stated reason per entry in its own commit, host-scoped rather
than check-scoped, reviewable in one place - and omitted only expiry. Measurement:
**two of nine exempted hosts have no remaining row in the checked file**, the
clearer one exempted in 2020 for a service shut down in 2016 and still present
three years after its last link was removed.

The subject predicted the failure and the tree supplies the number. Also recorded:
one 2016 commit performs this technique's whole dispute procedure by hand - removes
a link that answered 500, exempts two hosts that answered 403, same change, status
code as the sole discriminator. The maintainer could always tell a true finding
from a narrowable detector. What had no clock on it was the artifact that telling
them apart produced.

This run's own instrument then reproduced the subject's canonical false positive:
a URL regex over raw markdown reported 6 dead citations, of which 5 were template
literals and regex fragments inside fenced code blocks - *"never pattern-match a
language you have a parser for"*, in this run, before the commit. Narrowed, not
deleted.
