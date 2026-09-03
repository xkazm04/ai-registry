# conformance-checking

Coverage notes for `software-engineering/engineering-assessment/maturity-and-conformance/conformance-checking`.

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
