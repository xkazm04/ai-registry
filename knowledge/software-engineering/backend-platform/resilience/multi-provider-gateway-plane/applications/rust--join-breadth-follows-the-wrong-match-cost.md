---
layer: application
type: application
subject: multi-provider-gateway-plane
technique: join-breadth-follows-the-wrong-match-cost
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.85
---

# Two `continue`s that encode the whole breadth rule

`AlexsJones/llmfit` at `d19380bac5d82c5cd3080ff1afef6d1dc20615bf` joins a catalog
of ~9,250 models keyed by publisher path against each runtime's own naming
scheme. The presence-side rule the standard states is implemented in twelve lines
(`llmfit-core/src/providers.rs:336-358`), and its two `continue` statements are
the two halves of the rule:

```rust
for m in models {
    if m.is_cloud() {
        continue;
    }
    count += 1;
    let lower = m.name.to_lowercase();
    set.insert(lower.clone());

    let (family, tag) = lower
        .split_once(':')
        .unwrap_or((lower.as_str(), OLLAMA_DEFAULT_TAG));
    if tag != OLLAMA_DEFAULT_TAG {
        continue;
    }
    set.insert(family.to_string());
    for size in size_tokens_from_parameter_size(&m.details.parameter_size) {
        set.insert(format!("{family}:{size}"));
    }
}
```

**The first `continue` is "an entry that fails the join's predicate contributes
nothing at all."** A cloud-hosted entry is listed by the runtime but is not
installed locally; the doc comment (`providers.rs:320-325`) records what happened
without the guard — inserting such an entry's family stem *"would falsely mark
unrelated models as installed (#619)"*.

**The second `continue` is "an entry that already names the exact artifact
contributes only itself."** A sized tag is inserted verbatim and the loop stops.
Only an untagged or default-tagged install — where the size genuinely is unknown
— reaches the family stem. The comment carries the measurement that forced it
(`providers.rs:326-333`):

> A **sized** install (`qwen3:8b`) contributes its tag and nothing else: the tag
> already says exactly which weights are on disk, and adding the bare family stem
> made every catalog entry in that family look installed — one `qwen3:8b` marked
> 238 of 9,250 models, `Qwen3-235B-A22B` among them (#861).

238 of 9,250 from one install, including an entry roughly thirty times the size
of the artifact actually present. This is the number the standard cites, and this
tree is where it was measured.

## The derivation trap is here too, and it is documented

`size_tokens_from_parameter_size` (`providers.rs:295-317`) implements the
standard's warning that upstream size tokens are marketing rather than derived
values:

> Most tags carry the marketing size rather than the true count (`qwen2.5:14b`
> reports "14.8B"), hence the truncated form. Families tagged with a decimal
> (`qwen3:1.7b`, `solar:10.7b`) need the verbatim form as well. Counts below 1B
> are reported in "M" — `qwen3:0.6b` reports "596.05M" — and have no reliable tag
> form, so they yield nothing rather than a bogus `0b`.

Both forms are derived and both are inserted; the sub-1B case derives nothing
rather than a syntactically valid, semantically false key. That last clause is
the standard's "a bogus key is worse than a missing one" reached independently,
and the tree is the reason the standard states it.

## The structural fact: the inverted rule lives one bundle away

The strongest thing this tree says about the standard is not in the tree at all —
it is that the same join, built for a *priced total* rather than a presence
claim, is documented in this corpus with the **opposite** default, and both are
correct. Neither codebase could have discovered that on its own, because each one
only ever faced one cost direction. The technique exists because two trees with
one shared craft disagreed, and the disagreement turned out to be the finding.

## What this tree cannot show

The tree has no instrument for the standard's operator obligation — there is no
count of broad-key matches versus exact ones, so the early signal that an
upstream changed its naming scheme is unavailable here. The failure would present
as a slow drift toward everything looking installed, which is exactly what #861
was, discovered by a user rather than by a metric. That gap is real and is the
one thing this otherwise-exemplary realization does not carry.
