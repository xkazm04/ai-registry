---
layer: application
type: application
subject: money-page-conversion-craft
technique: hero-proof-first-one-cta
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Hero proof-first in the adtech workspace: proof lines only for what is true today, one primary action, and a CTA destination allowlist

The Czech-first adtech marketing workspace (`systedo-case`, commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08) has two money pages of its
own - the product landing page and the generated experiment microsites - and both
realise the hero technique. The structural facts the tree proves are two: **the
proof line is restricted to present-tense truths by an explicit rule in the
component, with the reason recorded beside it**, and **a generated page's call to
action can point at only three URL schemes, enforced by a validator rather than a
prompt.** The tree also supplied the technique's "present tense" section as an upward
lesson.

## The hero: one primary action, a text-link secondary

`src/components/brand/landing/LandingHero.tsx:112-127` renders the hero's actions.
The comment at lines 113-114 states the rule: "'Start free' -> /app is the single
primary CTA; the no-login demo stays reachable as a text link." The primary is a
filled pill button (line 117); the demo link at lines 122-127 is an underlined text
link in the muted colour - the technique's "text link beside the button, never a
second button" realised as a visual hierarchy with one answer. The headline (lines
102-106) is the two-line product promise and the subhead (lines 108-110) the quick
answer; on a product page the "searched phrase" is the category promise rather than a
service keyword, which is the technique's headline rule applied to a non-local page.

## The proof line: only what is TRUE today

Lines 130-136 are the comment that became the technique's present-tense rule:

> Local-first proof lines - only what is TRUE today: free during validation
> (elevates what /cena states, no payment gateway is wired), and BYOM across 6
> vendors incl. a local [model runtime] with no analytics SDK in the tree ...
> Deliberately NOT an "open source" or self-hosting claim - that is a commitment,
> and self-hosting does not work yet.

The two proof lines rendered at lines 137-146 are each backed by a fact the comment
cites from the tree (the pricing page's own statement; the adapter file). The
rejected third line - "open source" - is the technique's textbook case of a
commitment in the proof position, and the workspace's reason ("that is a commitment,
and self-hosting does not work yet") is the reason the technique gives. This is a
confirmed claim and an upward lesson at once: the technique's draft had "checkable"
but not "present tense" until this comment.

Lines 12-20 make the same call for the channel pills. The comment: "Honest support
levels: [the dominant ad platform] is the only live-data connector; [the second
national platform] gets ad-copy limit checks; [two social networks] are social
publishing surfaces. The landing states each level rather than implying live
ingestion from all four." The `CHANNELS` array carries a `level` per channel and
lines 148-159 render "name · level" pills - the technique's "state the level at which
it is true rather than a logo wall of equal integrations".

## The proof band: computed figures, labelled as demo, never fine print

`src/components/brand/landing/LandingProof.tsx:34-47` builds the four proof figures
from `buildSnapshot("90d")` - the same function the dashboard renders - so the
homepage shows outcomes the product computes rather than claims typed into copy
(comment at lines 37-40: "the exact numbers the dashboard renders ... not a customer
testimonial (there are no real customers to quote)"). Lines 58-62 render the demo
badge with the comment "Unmissable demo-data label: the numbers below belong to a
fictional client, and that must never read as fine print", and lines 67-70 the note
naming the fictional client and domain beside the figures. For this subject the
relevant fact is the count: by the proof technique's rule these four figures are
illustrative and contribute zero to the five-touch gate, which the workspace's own
comment concedes by saying there are no real customers to quote. The labelling
discipline itself belongs to `honest-proof-and-illustrative-data`.

## The generated microsite: a CTA allowlist, and no numbers on the page

`src/lib/microsite/lp-page.ts:70-82` is the CTA-destination rule as a validator:

```ts
/** Only a CTA destination the operator can have meant. `tel:` and `mailto:` are the
 *  `isOperatorContact` set; `https:` joins them because a landing page's action is
 *  normally a signup URL. Plain `http:` is out ... and so is everything else -
 *  `javascript:`, `data:`, a bare string - which is dropped rather than rendered */
export function isOperatorTarget(value: unknown): value is string {
  const s = str(value);
  return s.length > 0 && s.length <= LP_ARM_LIMITS.target &&
    /^(tel:|mailto:|https:\/\/)[^\s<>"']+$/i.test(s);
}
```

A public sales page's one action has three legitimate destinations - a call, an
e-mail, a secure signup - and an invalid one is dropped, not rendered. The CTA text
is capped at 60 characters (`LP_ARM_LIMITS.cta`, line 38) and the bullet list at five
(line 37, comment at lines 29-31: "a landing page with a scrolling feature list is a
different page than the one that was drafted and previewed") - the five-visible
discipline as a field cap. The generated local page makes the same shape at
`src/lib/ai/tools/local-page.ts:167-177` with `cta: 120` and `sections: 4`, and the
prompt at line 117 forbids the model from emitting an address, phone or opening
hours - proof facts come from the business record, never from the generator, which is
the proof law in schema form.

Lines 17-19 of `lp-page.ts` record the boundary this subject keeps with
`landing-page-experiment-statistics`: "There is deliberately NO numeric field anywhere
in this payload. An experiment page that printed its own score would stop producing
independent trials." A hero on an experiment arm carries a proof line; it never
carries the arm's own result.
