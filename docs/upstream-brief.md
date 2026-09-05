# Upstream brief — re-reading a tree we already mined (2026-09-04)

You are running a **delta re-scan**: an `/intake` over a repository this registry has
already mined, at a newer commit, because `scripts/upstream-check.mjs` reported it due.

This is not a first scan. Read [`.claude/skills/intake/SKILL.md`](../.claude/skills/intake/SKILL.md)
for the procedure — every phase, every corroboration rule, every landing shape still
binds. This document states only what is **different** when the tree has been read
before, and adds one obligation a first scan does not carry.

Your dispatch names the repository, its pinned commit, the prior source note, the
subjects that note moved, and the `rescan_when:` condition with the reason it fired.

---

## The yield law: a delta's product is reversals

Measured on 2026-09-01, re-scanning OpenWiki five days after its first mine:

> **A delta's unique product is not new features — it is reversals**, because a reversal
> is a design decision that production tested and found wrong. Everything else in a
> seven-day window is already-covered or thin.

That run predicted "a high catch rate, 2–4 landings, and at least one amendment
corroborated by the vendor moving to our position", said the prediction out loud before
the triage table, and got exactly that. It found the source had reversed the one detail
this corpus had rejected — omission as a retraction signal — and shipped the shape the
technique already prescribed.

**Say your expected yield out loud before Phase 5**, in the same form. A delta that
deviates from the prediction is telling you something about the source class, and that
deviation is a finding worth the scorecard row whether the landings arrive or not.

## The four rules that only apply to a delta

### 1. Read the prior source note first, all of it

Not the frontmatter. The declines, the already-covered table, the untriaged rows, the
cross-references. OpenWiki's run recorded it plainly: *"the prior note is the most
important input to this one, and reading it first changed the whole shape of the run."*

Half of what a delta surfaces was already proposed and ruled on once. A candidate the
prior note declined is not a new candidate; it is a decline whose **return condition**
you should check. Re-proposing it without naming the prior ruling is the failure the
whole sources ledger exists to prevent.

### 2. Sweep in reversal order, not in tree order

A first scan sweeps by yield class. A delta sweeps by where a reversal would show:

1. **The changed operating documents.** A tool that documents itself with itself has
   first-party practitioner pages whose revisions are paid-for failure modes.
2. **The changelog's `Fixed` list** — and only the Fixed list on the first pass. Two
   runs in this vault took their shipped technique from a Fixed entry.
3. **The diff of anything the prior note cited by `file:line`.** See rule 3.
4. Everything else, last. The README was read last in the OpenWiki run and mined for
   nothing; that is the normal result.

### 3. Re-open every citation this repository's commit backs — **not optional**

163 application files in this corpus assert things about code at an external commit,
across 33 distinct shas. `check-currency.mjs` ages our own `verified_on` dates and has
no opinion about an external pin. When the tree moves under one, nothing notices.

So before you propose anything, take the subjects the prior note moved, find the
applications that cite this repository's commit, and open each cited location at the new
commit. Three outcomes, all of them acceptable:

| what you find | what you do |
| --- | --- |
| the cited lines still exist and still say what the application says | re-pin to the new commit, note the re-verification date |
| they moved or changed shape but the claim holds | re-pin, rewrite the citation, keep the claim |
| the claim no longer holds | **withdraw it**, and say so in the note — a correction is a landing |

If `upstream-check.mjs` reported `pin-unreachable` or `rewritten`, this rule is the
entire reason you were dispatched. Do it before anything else.

**A delta run that lands no technique but repairs three citations is a successful run.**
Say that in the scorecard row rather than reporting a zero.

### 4. Inherit every other discipline; invent none

Phase 4's prior-art map, Phase 6's verification, Phase 7's landing shapes, **Phase 7.5's
apply and A/B against a connected project**, Phase 7.6's direction pass, the
`librarian/applied.md` row per landed technique or flipped rule, Phase 8's ship
confirmation, Phase 9's note. All unchanged.

This lane exists to make an existing run happen on a clock. If you find yourself writing
a new procedure, you have left the brief.

---

## What you write back

A new source note under the existing convention — `<date>-<slug>-v2.md`, or `-v3`, or
the version if the tree names one (`2026-09-01-openwiki-v050.md`). Its frontmatter adds
three fields to the standard set:

```yaml
source: repository (vendor, re-scanned as a version delta)
prior_scan: <date> - [[<prior note slug>]]
delta: <base>..<head> - N files, +A / -D, T days
citations_reopened: <n checked> / <n re-pinned> / <n withdrawn>
rescan_when: "<the next condition — mandatory, see below>"
```

**`rescan_when:` is mandatory on a delta note.** A re-scan that banks no next condition
has spent the run and left the lane with nothing to fire on. State an upstream event
where you can (a named PR landing, a flag leaving a debug gate, a release section
appearing), and a date fallback in the form the ledger can read — `; or 8 weeks elapse
(2026-11-06)` — because `upstream-check.mjs` decides only two clauses mechanically, a
release landing and a deadline date, and reports everything else as `undecidable` for a
human. A prose-only condition is never wrong, but it never fires by itself either.

Then update the repository's row in [`librarian/upstream.md`](../librarian/upstream.md)
by re-running `node scripts/upstream-check.mjs --ledger`.

## Where this lane stops

- **It does not scan trees we have never mined.** That is the watchlist's Track A and
  the harvest queue.
- **It does not grade the tree.** No maturity score, no adoption number. Movement and
  citation validity only.
- **It does not touch a Track B counterpart.** Those belong to `/reconcile`, which pins
  and re-pins them on its own terms.
