---
layer: technique
type: technique
subject: public-verdict-badge
technique: embed-snippet-contract
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [generating copy-paste embed code, a badge parameter has a server-side default, writing alternative text for a published verdict]
---

# Embed snippet contract

The snippet is the few lines a subject copies out of your product and pastes
into a page they own. It is the most durable thing you will ever hand a user:
it survives redesigns, migrations, and — routinely — the subject's own memory
of what it meant. Once pasted, nobody edits it again for years. So the snippet
is not a convenience feature; it is a **contract, authored on the subject's
behalf, that will be enforced against them by every viewer of their page.**

The generator's job is to make that contract say what its author would have
said if they had thought about it for an hour.

## Pin every meaning-bearing parameter, even the defaults

The cardinal rule: **a parameter that changes what the badge asserts is
written explicitly into the generated snippet, even when it equals the current
server default.**

The reasoning is about time, not about correctness today. A gating badge —
"passes the bar" — is meaningless without the bar. If the snippet omits it and
relies on the service default, then the badge on that page asserts whichever
bar the service happens to hold in two years: *a bar the badge's author never
saw and never chose, which changes silently under them.* The day you raise the
default, thousands of pages flip from pass to fail, authored by nobody. The
day you lower it, you have quietly upgraded everyone's claim about themselves.
Neither is a change you are entitled to make on someone else's page.

The version of this that bites soonest is subtler than a policy change on your
side. Where the default is *derived* — computed from a classification of the
subject, so that different kinds of subject get different default bars — the
badge's meaning changes whenever the classification changes, which can happen
because the subject added a directory. Nobody edited the snippet, nobody
edited the service, and the public claim moved. A derived default is the
strongest possible argument for pinning: it drifts without an author on either
side.

This is [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
applied to an embed: the artifact travels, so its predicate — the bar, the
rubric version, the qualifier policy — travels inside it, in the request that
produces it.

Defaults remain right for cosmetic parameters. Style, label, scale: omit them,
let them drift, nobody is harmed when the badge shape modernizes.

The corollary is a versioning obligation: because snippets pin, old pinned
values must keep resolving. A meaning parameter is part of your public
interface the moment it appears in a generated snippet, and removing a
supported value is a breaking change to pages you cannot edit. Enumerate the
supported values in one place and derive both the generator and the endpoint's
parser from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a generator that can emit a value the endpoint no longer accepts is a factory
for permanently broken embeds.

## Alternative text is a second rendering, not a description

The text alternative is what a screen-reader user, a text-mode client, an
aggregator that strips images, and every crawler receives *instead of* your
carefully composed pixels. It is therefore the full claim again, in words —
including the qualifier — and not a description of an image.

- Bad: "badge" / "status badge" / "an image showing the score".
- Good: "preview score 82 of 100 — assessed by <the assessing service>".

The value string and its qualifier come from the same formatter that composes
the rendered value, so a wording change cannot land in one and not the other.
If your endpoint also serves a structured variant, that is a third consumer of
the same formatter, not a third place to phrase the claim.

## The link target is part of the artifact

A badge that links nowhere is a claim with no audit path; a badge that links
to a page that will not exist next year is worse, because the dead link
outlives the report. The rules:

- **Link to a stable, canonical report address for the subject** — an address
  derived from the subject's durable identity, not from a run identifier, a
  session, or a share token.
- **The link must be publicly reachable.** A target that demands
  authentication converts every curious viewer into a bounce and tells them
  the claim is unauditable.
- **Never embed a secret in the snippet.** Generated snippets are pasted into
  public pages by construction; any token in one is a published token. If the
  badge needs a key to render, the badge should not be public.

## Offer both common markup forms, generated

Subjects paste into at least two kinds of surface: lightweight markup
documents and hypertext. Generate both, side by side, from one model of the
snippet, with copy affordances. Hand-adapting between forms is where subjects
drop the link, mangle the alternative text, or hardcode a stale value — and a
subject who hardcodes the *number* rather than the image has permanently
frozen a verdict on a public page under your name.

Addresses in a generated snippet are **absolute**. A relative address works on
the page that generated it and nowhere the snippet is actually going.

Three additional details earn their place in the generator:

- **Any adjacent snippet that states the same bar is built from the same
  policy object.** A page that offers both an embed snippet and a
  copy-paste pipeline configuration is publishing two claims about one bar; if
  they are written independently, the public page ends up advertising a bar
  the enforcement does not apply. Derive both renderings from one policy
  value, and enumerate the per-condition fragments once.

- **Show a live preview beside the snippet**, rendered from the same
  parameters the snippet contains — a preview built from different rendering
  inputs is a demonstration of something the embedder is not about to get.
  The one permitted difference is a marker parameter that excludes the
  preview from the reach tally: your own generator page would otherwise
  manufacture impressions for every subject anyone typed into it. Keep that
  marker out of the copied snippet.
- **Refuse to generate for a subject whose badge would be neutral**, or
  generate it with the neutral state visible in the preview and an explanatory
  line. Handing someone a snippet that renders `unknown` on their front page,
  with no explanation, produces a support ticket and a deleted embed.

## Procedure

1. **Classify every endpoint parameter** as meaning-bearing or cosmetic.
2. **Emit all meaning-bearing parameters explicitly** in the generated
   snippet, defaults included.
3. **Derive the parameter vocabulary and the generator from one source**, and
   commit to keeping previously emitted values resolvable.
4. **Compose alternative text from the shared value formatter**, qualifier
   included.
5. **Resolve the link from durable subject identity** to a public report
   address.
6. **Generate every supported markup form** from one snippet model, and
   preview from the identical address.

## When not to use this

- **Not for internal dashboards**, where the consumer is a template you can
  edit and defaults are the right economy.
- **Not as a reason to expose meaning parameters at all.** The strongest
  design is often to have *no* caller-settable bar — one published rubric, one
  meaning — in which case there is nothing to pin and nothing to drift. Pin
  only what you were unable to remove.
