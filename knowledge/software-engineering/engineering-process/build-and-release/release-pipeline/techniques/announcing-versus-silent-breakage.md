---
layer: technique
type: technique
subject: release-pipeline
technique: announcing-versus-silent-breakage
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [planning the migration aids for a breaking release, a major version that removes nothing but changes a default, deciding what a breaking-change entry in the changelog is sufficient for, an upgrade whose own guide admits it may change results silently, a consumer upgraded cleanly and started producing different numbers, auditing which dependencies a project depends on beyond their written contract, choosing what to pin before taking a major version]
---

# Announcing breakage and silent breakage are different releases

A breaking release is planned as one object — a list of things that changed,
each owed a note. But the list splits in two along a line the author never has
to notice, because the line is not a property of the change. It is a property
of what happens in **the caller's process** when the change arrives:

- **It announces.** The symbol is gone and the lookup raises. The signature
  moved and the build fails. The type narrowed and the call no longer binds.
  The caller discovers the change by running, or by compiling, and discovers it
  at the exact site that needs editing.
- **It is silent.** The call still resolves, the signature still binds, the
  return still has the shape and the types it always had, and the values in it
  are still individually correct. Only the *result* is different. Nothing is
  red.

Everything a release does to help its callers migrate — the deprecation record,
the error that names the replacement, the removal list generated from the
declarations — is built for the first class. And the first class is the one
the caller would have found anyway.

## The investment inverts, for a structural reason

The announcing class is **enumerable at the API surface**. Removed symbols are
a list; the tooling can walk it, and each entry has somewhere to attach — a
declaration, a shim, a raise that carries the successor's name. That is why a
release can afford to make its errors the migration guide, and why doing so
feels like diligence: run the code, fix what breaks, repeat until quiet.

The silent class attaches to nothing. It is not a symbol that went away; it is
a *property* that went away, and no symbol ever carried the property, so there
is no declaration to hang a warning on and no site for a raise to fire at. It
therefore leaves the machinery entirely and arrives as prose — a paragraph in
an upgrade guide, which reaches the human who reads the guide and never reaches
the code.

One release makes the asymmetry legible. It shipped **two new exception types**
so that every removed method and every removed argument would raise an error
naming its replacement, and for the single change its own upgrade guide
describes as one that "may silently impact the results of your pipelines" — a
swapped default execution engine that withdrew the row-ordering of several
operations — it shipped a paragraph. The engineering went to the half that
announces itself. The prose went to the half that does not.

> The quiet rule: **run the code and fix what breaks** terminates. That is its
> appeal, and it is also the whole of its guarantee. It terminates when the
> announcing class is exhausted, which is not when the migration is done.

## The silent class is almost always a withdrawn emergent guarantee

It is worth naming where these changes come from, because it explains why they
cannot be enumerated from the diff.

Callers do not only depend on what a contract promises. They depend on what
they **observed**, and an implementation emits far more observable regularity
than its contract commits to: the order rows come back in, the value a default
happens to hold, the type an arithmetic edge case falls back to, whether an
iteration is stable. None of that was promised. All of it was depended on,
because it was there every time anyone looked.

Swapping the implementation withdraws the regularity and changes no symbol,
because no symbol ever carried it. Two consequences follow, and both are
operational:

- **The publisher cannot enumerate the silent class from the diff.** The diff
  touches the implementation; the dependence lives in callers the publisher
  cannot see. This is the same limit as
  [release-level-by-reader-reach](./release-level-by-reader-reach.md) — you
  cannot classify your own change — arriving from the other direction: there
  the reader's *construction* is unobservable, here the reader's *assumptions*
  are.
- **A major version does not help.** A major boundary authorises breaking
  removal, and the announcing class collects on that authorisation loudly. The
  silent class collects on it invisibly, at the same moment, under the same
  number.

## What an aid for the silent class looks like

It cannot key on a symbol, because there is no symbol. Three shapes work, and
the first two are the publisher's while the third is the consumer's.

**A restore switch, at a scope wider than the call site.** Ship the new
behaviour as the default and keep the old one reachable — per call, per
operation, and *per process*. The process-wide lever is the one that matters:
it lets a consumer take the release today, restore the old semantics globally,
and then migrate site by site with the switch as the ratchet, instead of
choosing between the whole release and none of it. The release above shipped
four levers across three scopes, which is the correct shape; what it did not
ship was any way to find the sites.

**A probe the consumer runs against their own code**, keyed on the consumption
*pattern* rather than on any name. The publisher knows the pattern precisely —
they withdrew the guarantee, so they know what depending on it looks like — and
only the consumer has the call sites. "Find every aggregation whose result is
consumed in order without being re-sorted" is a grep the publisher can write
once and every consumer can run. A breaking-change entry that describes the
change is prose; a breaking-change entry that ships the query for finding your
own exposure is a migration aid. This is the deliverable most silent changes
never get, and it is cheap.

**On the consumer's side: pin the regularity you rely on, with a test that
perturbs it.** The reason the silent class ships green through a suite is that
assertions are written against values and shapes, and the silent class changes
neither. A test that looks its rows up by key cannot see an ordering change; a
test that reads one field cannot see a correspondence change. The test that
sees it is the one that feeds the producer's output back in a **different
arrival order** and requires the same answer. Where the dependence is on a
guarantee the contract never made, that test is the only place the dependence
is written down at all.

## The assertion style decides what the suite can see

This is the part that makes the silent class survive a good test suite, and it
is worth stating on its own because it is invisible in review.

A suite that looks rows up by key — find the row whose status is this, read the
field named that — is asserting on **values**, and it is *correct* to write it
that way: keyed lookups are robust against irrelevant reordering, which is
usually exactly what you want. But robustness against reordering and blindness
to reordering are the same property. Where the order is load-bearing, every
keyed assertion in the file is silent about it, however many of them there are.

Measured on a desktop application's spend rollup, whose emitted order is
established by an explicit comparator over the full grouping key rather than by
the query (neither query carries an ordering clause): weakening that comparator
to a non-total one — the exact shape of the silent change, with the row count,
the values and the multiset all unchanged and only the sequence moving —
changed the emitted sequence and failed **0 of 6** of the module's tests. The
module's single ordering assertion covered one term of three, and covered it in
one arrival direction only. Adding one test that feeds two permutations through
the comparator and requires the same sequence back caught all three weakenings.

The general form: **count the assertions that would still pass.** If the answer
is "all of them", the property is not tested, it is merely true.

## Decision rules

- **Classify every entry in a breaking release by what the caller's process
  does when it meets it**: raises, fails to build, or returns something
  different. The third class is the one that needs the work.
- **A breaking-change note is sufficient for the announcing class and never
  for the silent one.** The announcing class had a mechanism; the note is a
  courtesy. The silent class has only the note.
- **Ship a restore switch at process scope** for any change that alters results
  without raising, so the release can be adopted before every site is migrated.
- **Ship the probe, not just the paragraph.** The publisher can write the query
  that finds exposure; the consumer cannot, because they do not know what
  changed underneath.
- **Where a regularity is load-bearing and unpromised, pin it consumer-side
  with a perturbation test.** An optional guard is an absent one
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)), and a
  guarantee nobody wrote down is optional by default.
- **Before believing a suite covers a behaviour, ask which assertions would
  survive the behaviour changing.** Keyed lookups survive reordering; value
  checks survive correspondence errors.
- **"Run it and fix what breaks" is a completion criterion for one class
  only.** Say which class, or it reads as a migration plan.

## When not to use this

A release with no silent entries needs none of this, and most patch releases
genuinely have none — the split is worth running, not worth ceremony. Do not
spend the probe on a regularity the contract actually promises: there the
change is a straightforward break and the announcing machinery applies, or
should. And the consumer-side perturbation test is owed to *load-bearing*
regularities only; pinning every incidental order a producer happens to emit
freezes the implementation and produces a suite that fails on every legitimate
refactor, which teaches reviewers to bless its diff unread.

Retiring a named symbol on a stated clock is
[deprecation-by-version-arithmetic](./deprecation-by-version-arithmetic.md), and
choosing the version number the release carries is
[release-level-by-reader-reach](./release-level-by-reader-reach.md). This
technique is about neither: it is about the entries in the release that no
version number and no deprecation record can reach.
