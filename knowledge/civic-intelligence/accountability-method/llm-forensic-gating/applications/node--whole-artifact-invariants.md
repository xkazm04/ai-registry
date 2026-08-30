---
layer: application
type: application
subject: llm-forensic-gating
technique: whole-artifact-invariants
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Invariant-guarded rewrites of Czech bill prose (Node)

Politicas rewrites already-published analyst prose in place — jargon sweeps,
identifier migrations — and its case-loop scripts carry the invariants as
their own preconditions on their own output. Two batches implement the family
independently, which is what makes it a technique rather than one script's
habit. The doctrine itself is written down at
`memory/whole-artifact-invariants-beat-pattern-gates.md` (36 lines), including
the incident: four audit rounds over batch-015 in which "every code gate was
green — schema, language gate, jargon regexes, all of it" while the artifact
carried a municipally-owned company presented as a private tie, an amount
rewritten from „paušální dávkou 15 000 Kč" into „dřívějším zpracováním 000
Kč", two fabricated bill quotations, and sponsor counts that did not add up.

## Digits, with the allowlist as a transform

`scripts/case-loops/law/archive/sweep-old27-015.ts:138-173` is the digit
invariant. The comparison is over `(s.match(/\d+/g) ?? []).sort()` (`:142`) —
a sorted **multiset**, not a set — and the allowlist is assembled from the
input text rather than declared as a list of numbers, so it can only excuse
digits the rewrite actually had a reason to touch: identifiers inside
`(psp:person:NNNN)` and two `pspId NNNN` shapes (`:143-146`), effect indices
in `unstatedEffects[N]` (`:157`), and the property values of three enumerated
bespoke sentence rewrites (`:158-161`).

The transform case is the load-bearing one. A bill's internal urn
`bill:tisk:NNNN` is legitimately replaced by the public `cislo`, so `:148-155`
pushes the urn's digits onto `droppedIds` **and** pushes the public number
onto `addedCisla`, which is then concatenated into the expected multiset at
`:170`. Removing the internal digit is not waived; it is paid for by requiring
the public one. `droppedIds.splice(i, 1)` at `:166` consumes each allowance
exactly once, so an allowlisted shape occurring twice does not excuse three
deletions. On mismatch the script throws with both multisets printed
(`:172-173`) — it does not emit and flag.

## Syntax, asserted relatively

`:174-180` is the relative framing, with the reason in the comment: N10/N11
were "splice wounds a whole-string structural check catches".
`parenSkew` (`:177`) is the absolute difference between opener and closer
counts, and the assertion is `parenSkew(t) > parenSkew(r.text)` — worsening,
not imbalance, because Czech legal prose legitimately carries unmatched
closers such as „písm. m)". `midStops` (`:179`) counts `/\.\s+\p{Ll}/gu`
matches and asserts the same direction. Both use `\p{Ll}` with the `u` flag
rather than an ASCII class, which is the technique's Unicode rule encoded
rather than narrated.

Note the ordering: the per-string gates run first — `lawJargonIssues(t)` and
`czechCopyOrNull(t)` at `:135-137` — and the invariants run after, on the same
string, before the row is pushed to `patched` at `:181`. Both classes gate one
emit point, which is the composition the golden path describes.

## The second sighting, and the quotation half

`scripts/case-loops/law/archive/evidence-coordinate-apply-018.ts` applies a
different migration under the same discipline, and its header (`:1-14`)
states the guards as a numbered contract citing the batch that taught each
one — "batch-015: pattern rewrites corrupt what they cannot see". Its digit
guard (`:62-93`) is directional rather than conservative, because this
migration deliberately *adds* figures: a digit may be removed only if it
occurred inside a line/cache-reference substring of `before`, and an added
digit must appear in coordinate or URL context. The header comment at `:62`
records the hardening — "a MULTISET, not a Set (a Set passed any…)" — which
is the technique's multiset rule re-learned in the field.

Quotation locatability appears here in both of its forms. `spansOf`
(`:97-112`) extracts top-level guillemet spans with depth tracking, because
Czech legislative quotations nest and "the flat regex left inter-quotation
connectives unguarded"; every span of `before` must survive verbatim in
`after` (`:113-115`). The stronger form follows at `:116-142`: the cached
print is read (`readCachedBillText`, `:119`), normalised with
`.normalize("NFC").replace(/\s+/g, " ")` (`:121`), and every article or part
coordinate the rewrite *introduces* must be found in that normalised source —
with the article's own span then required to contain the point and section
numbers the sentence claims for it. That is arithmetic closure's sibling:
a positional claim checked against the payload rather than against itself.

## Deviations

1. **Per-script, not shared.** Both implementations are inline in the pass
   that needs them. The digit invariant is written twice with different
   allowlist semantics, and the second one's multiset lesson had to be
   re-learned rather than inherited. The technique asks for the assertions
   to live where the pass emits; it does not ask for them to be copied, and a
   shared helper taking `(before, after, allowances)` would have carried the
   Set-versus-multiset fix across both sites at once.
2. **Arithmetic closure is doctrine, not code.** The memory file names it as
   the third invariant and the audit that produced it applied it by hand;
   neither script asserts a stated count against the source payload. Of the
   four, it is the one still enforced by a human reading.
3. **The reference implementation lives under `archive/`.** The path the
   memory file cites — `scripts/case-loops/law/sweep-old27-015.ts` — has since
   moved to `scripts/case-loops/law/archive/`, so the doctrine's own pointer
   is stale. A canonical, non-archived home is what turns "the batch that did
   it properly" into a pattern the next batch starts from.
   **Since first documented (2026-08-30):** this is fixed. Commit `74fdcf2`
   ("tame workers in config, graduate the number ratchet, un-quiet the commit
   rung") updated the memory file's own pointer to
   `scripts/case-loops/law/archive/sweep-old27-015.ts` and added the note
   "the batch-015 sweep was retired to `archive/` once its pass shipped; the
   invariants are the durable part, not the script's location" — closing the
   staleness this deviation flagged, though the reference script still lives
   under `archive/` rather than a canonical non-archived home.
