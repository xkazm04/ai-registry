---
layer: technique
type: technique
subject: english
technique: ui-and-landing-microcopy
status: forged
laws: [one-concept-one-rendering]
shared_with: []
use_when: [writing or reviewing English buttons, errors, empty states, labels and links, reviewing a hero line or page title, rendering a source-language UI string as an English component]
---

# UI and landing microcopy

Component copy is where English is shortest and where each word does the most work. A button, an
error or a link is read in isolation, often by a screen reader and always under time pressure,
and the same component recurs across the product, so one inconsistent label becomes a hundred.
The rules here are component-shaped: each names the element class it governs. Where a string
arrives from a source language, it is rendered as the English component, not translated as a
phrase; a source noun label becomes an English verb when the component is a button.

## EN-BUTTON · Start buttons and calls to action with a specific verb

> **Trigger** — a button or call to action.
> **Rule** — a specific verb plus its object or outcome, two to four words. Buttons are verbs even
> when the source label was a noun or gerund. The same action carries the same label everywhere
> ([one concept, one rendering](../../../_laws.md#one-concept-one-rendering)).
> **Source** — Microsoft, Google, Apple, GOV.UK, Mailchimp.
> **Exceptions** — platform dialog pairs (*OK* / *Cancel*).

✗ *Submit* · *Click here* · *Let's go!* · *Registration* → ✓ *Start free trial* · *Download
report* · *Sign up*.

## EN-CTA-PERSON · Hold one person across a flow's calls to action

> **Trigger** — *my* and *your* in the calls to action of one flow.
> **Rule** — choose one and hold it through the flow.
> **Source** — the defect is mixing; which person converts better is contested practitioner lore
> without a reliable measurement, so do not cite either as a performance rule.

✗ *Start my trial* beside *Create your account* → ✓ *Start your trial* · *Create your account*.

## EN-ERROR · Say what happened and what to do

> **Trigger** — an error message, validation message or failure toast.
> **Rule** — plain words for what happened and the next step; no blame, no jokes, no *Oops*, no
> bare *Invalid* or *Error*; keep the user's input; place the message next to its source.
> **Source** — NN/g (2023 error-message guidelines); Apple; Microsoft, including its app
> guidance.
> **Exceptions** — security-sensitive messages (sign-in failure does not say which field was
> wrong).

✗ *Oops! Invalid input.* → ✓ *Enter a date after today.* ✗ *Upload failed.* → ✓ *The file is
larger than 10 MB. Compress it or choose another file.*

## EN-EMPTY-STATE · Say why it is empty and give one first action

> **Trigger** — a list, table, dashboard or search with no content.
> **Rule** — one line on why it is empty, one action that fills it.
> **Source** — NN/g; Microsoft; Atlassian.
> **Exceptions** — a filtered view (say which filter hides the results).

✗ *No data.* → ✓ *No invoices yet. Create your first invoice.*

## EN-LABEL · Never a placeholder as the only label

> **Trigger** — a form field whose only label is placeholder text.
> **Rule** — a persistent visible label; placeholder text may add an example or format hint.
> **Source** — NN/g (2014, 2018): placeholders vanish on input, strain memory and read as
> pre-filled.
> **Exceptions** — a single-field search with a search icon and button.

✗ a field showing only *Email address* in grey → ✓ label *Work email*, hint *name@company.com*.

## EN-LINK · Link text states its destination

> **Trigger** — *click here*, *here*, a bare *Learn more*, a raw URL as link text.
> **Rule** — link text that makes sense out of context and front-loads the destination; *select*,
> not *click*, for device neutrality.
> **Source** — WCAG 2.2 success criterion 2.4.4 Link Purpose (In Context), Level A; Microsoft,
> Google, GOV.UK.
> **Exceptions** — repeated *Learn more* links that carry an accessible name naming the
> destination.

✗ *To see pricing, click here.* → ✓ *See pricing for teams.*

## EN-TAGLINE · The hero line says what the product does and how it differs

> **Trigger** — the main headline of a home or landing page; *Welcome to X*.
> **Rule** — apply the name-swap test: strip the names from your line and competitors' lines; if
> readers cannot tell who does what, rewrite. *Welcome to X* carries no information.
> **Source** — NN/g homepage guidance. Page structure and positioning are marketing concerns;
> this rule flags only the wording.

✗ *Welcome to the future of work.* → ✓ *Payroll for teams across the EU, filed in every country
for you.*

## EN-LIST-PARALLEL · One grammatical form per list, two to seven items

> **Trigger** — a list mixing verbs, nouns and sentences; a list of one or of more than seven.
> **Rule** — one form per list (all imperatives, all noun phrases, or all sentences); split long
> lists into groups.
> **Source** — Microsoft, Google, GOV.UK.
> **Exceptions** — reference lists (countries, integrations).

✗ *Import contacts · Reporting · You can export* → ✓ *Import contacts · Build reports · Export
data*.

## EN-META-TITLE · Front-load the distinctive term; brand last

> **Trigger** — a page title or social title.
> **Rule** — the distinctive term first, the brand last, in the declared case, inside the display
> budget. The budget is approximate: search engines rewrite titles. Keyword choice is a
> marketing concern.
> **Source** — Google search documentation on title links; NN/g on front-loading.

✗ *Home | Brand — Welcome* → ✓ *Invoice software for agencies | Brand*.

## EN-GENERIC-PRONOUN · Remove the generic "he" by walking the ladder in order

> **Trigger** — *he*, *his*, *he/she*, *s/he* for a person whose gender is unknown or irrelevant
> (*the user*, *each admin*).
> **Rule** — take the first rung that fits: (1) address the reader as *you*; (2) make the noun
> plural; (3) replace the pronoun with *the* or *a*; (4) name the role again; (5) use *person*;
> (6) singular *they*. Never *he/she* or *s/he*. Singular *they* is correct English; it sits last
> because every rung above it removes the pronoun instead of replacing it.
> **Source** — one major technology style guide's bias-free communication chapter, which gives
> the order; most guides give only the prohibition. The order is the finding.
> **Exceptions** — a named person's own pronouns; quoted text; legal defined terms.

✗ *Each admin sees his invoices once he/she signs in.* → ✓ (1) *You see your invoices once you
sign in.* · (2) *Admins see their invoices once they sign in.*

## EN-INCLUSIVE · Bias-coded technical terms are a termbase ruling, not a tone choice

> **Trigger** — *master/slave* for replication or control, *whitelist/blacklist*, *hangs* for a
> program that stops responding, *demilitarized zone* for a network segment, and terms of the
> same class.
> **Rule** — *primary/replica* (or the pair the domain uses), *allowlist/blocklist*, *stops
> responding*, *perimeter network*. Record the replacement once with the old term as forbidden
> and enforce it mechanically
> ([one concept, one rendering](../../../_laws.md#one-concept-one-rendering)). The ruling is
> variant-independent: US and UK catalogs hold the same one.
> **Source** — four published terminology catalogs converge on the class (surveyed 2026-09).
> **Exceptions** — an external identifier, command, API or configuration name we do not own,
> quoted exactly; one mention of the old term so that searchers find the new one.

✗ *Add the address to the whitelist. If the app hangs, restart the master node.* → ✓ *Add the
address to the allowlist. If the app stops responding, restart the primary node.*

## EN-READABILITY · A readability score is an alarm, never a target

> **Trigger** — a readability grade computed on UI copy or used as an acceptance threshold.
> **Rule** — compute it only on body blocks of 100 or more words, as an alarm that prompts a
> reader's look; never as a target, never on fragments.
> **Source** — formulas count syllables and sentence length, so a three-word label of long
> technical terms can score at a postgraduate grade; rewriting to lower a score does not raise
> comprehension.
> **Exceptions** — none; a regulated plain-language requirement specifies its own method.

✗ *Rewrite "Enterprise-grade observability infrastructure" to reach grade 8* → ✓ leave the
label; check the 300-word explainer beneath it.

## Using the set

Review components by class, not by page: all buttons together, all errors together, so
inconsistency is visible. EN-BUTTON, EN-LINK and EN-LABEL are checkable per component;
EN-ERROR and EN-EMPTY-STATE need the context of what failed; EN-TAGLINE and EN-META-TITLE need
competitors' lines beside them. EN-INCLUSIVE runs mechanically from the termbase;
EN-GENERIC-PRONOUN needs a writer to walk the ladder. Review on the rendered page, not a spreadsheet: *Order* and
*Close* are nouns or verbs depending on where they sit.

When NOT to apply: platform-owned strings the operating system supplies; legal notices; and
marketing strategy questions (what the hero should claim, which keyword the title targets), which
belong to the marketing side and are out of scope for a language review.
