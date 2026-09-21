---
layer: technique
type: technique
subject: english
technique: typography-and-capitalization
status: forged
laws: [the-authority-is-a-hypothesis]
shared_with: []
use_when: [setting dash, quote and case policy for English copy, reviewing typography in an English catalog derived from another language, scripting mechanical typography checks]
---

# Typography and capitalization

Typography is where a source language leaks hardest and where review by reading is least
reliable: nobody reading for meaning notices a space before a question mark or a low opening
quote. It is also where authorities contradict each other most openly. This technique holds
both halves: a declared system per row, and rules that are mechanically checkable and belong in
a script rather than in a reviewer's attention.

## EN-CASE · Apply the declared case per element class

> **Trigger** — headings, titles, buttons, labels, navigation, tabs, page titles.
> **Rule** — one declared case per element class. The technology-guide default is sentence
> case for all of them. Title case is legitimate only when declared for a whole element class.
> Product and feature names keep their termbase casing in either system.
> **Source** — sentence case: Microsoft, Google, GOV.UK, Atlassian, Material, Shopify. Title
> case per element: Apple (either system, held per element), Mailchimp (global navigation).
> Headline case: Chicago, AP. No evidence either performs better; a public-sector usability test
> found no change in trust.
> **Exceptions** — none; the defect is mixing, or Title Case that nobody declared.

✗ *Create New Project* beside *Invite team members* → ✓ *Create new project* · *Invite team
members*. Title Case On Every Word is also a characteristic artifact of translating label by
label, where each string arrives with no neighbours to agree with.

## EN-END-PUNCT · No full stop on headings, titles, buttons or labels

> **Trigger** — a full stop closing a heading, button, label or single-phrase list item.
> **Rule** — omit it; keep a question mark. In lists, full stops only when every item is a
> complete sentence, never mixed within one list; no full stop on items of three words or fewer.
> **Source** — Microsoft, Google, GOV.UK. Tooltips are a documented contradiction (Microsoft app
> guidance ends them with a period; Atlassian does not): declare.
> **Exceptions** — multi-sentence component bodies; a declared display style that ends
> marketing headlines with a full stop, held on every headline.

✗ *Billing settings.* → ✓ *Billing settings*.

## EN-DASH · Use the declared dash system, and ration it

> **Trigger** — any em dash, en dash, spaced hyphen or double hyphen in prose.
> **Rule** — one system, declared: US closed em dash (*word—word*); AP spaced em dash
> (*word — word*); UK spaced en dash (*word – word*). Never a hyphen or double hyphen as a dash.
> More than one per paragraph, or the dash as the default joint between clauses, is a finding:
> use a colon for an explanation, parentheses for an aside, a full stop for a new idea, a comma
> for an appositive.
> **Source** — Chicago, Microsoft, Google, Apple (closed em); AP (spaced em); New Hart's Rules
> (spaced en).
> **Exceptions** — a standalone no-data glyph in a table cell; numeric ranges (EN-RANGE).

✗ *Setup is fast — connect a source — and reports arrive — daily.* → ✓ *Setup is fast. Connect a
source and reports arrive daily.*

The em dash is not a machine tell: human writers use it at widely varying rates. Density is the
signal. A product may declare no dash at all; that ban is a house ruling, recorded with this
rule and preferably gated, because a documented dash rule decays within days once parallel
writers who never read it add strings.

## EN-RANGE · Write ranges with "to" in prose

> **Trigger** — a numeric, date or time range.
> **Rule** — *to* in running text (*9am to 5pm*, *10 to 20 users*); a closed en dash only in
> tables and tight UI. Never mix *from* with a dash.
> **Source** — GOV.UK, Microsoft, Atlassian (screen readers announce *to* correctly); Google
> uses a hyphen in its own system.

✗ *Open from 9–17* → ✓ *Open 9am to 5pm*.

## EN-QUOTES · Curly quotes and apostrophes in rendered copy

> **Trigger** — straight quotes or apostrophes in rendered text; low-high quotes (`„…“`).
> **Rule** — curly marks in rendered copy; straight marks only in code, units and input
> examples. US: double outside, single inside. UK: commonly single outside, double inside.
> **Source** — Chicago; New Hart's Rules. Straight-quote rules in developer style guides are
> driven by code and fonts and do not transfer to rendered marketing pages.

✗ `„Start now“` · `Don't` in a rendered heading → ✓ *“Start now”* · *Don’t*.

## EN-ELLIPSIS · One ellipsis form, for continuation only

> **Trigger** — three periods, or an ellipsis used for drama.
> **Rule** — one character form catalog-wide. In UI only for a command that opens further input
> (*Export…*) or a progress state (*Saving…*); never for suspense in marketing prose.
> **Source** — Microsoft, Apple.

✗ *And then... everything changed.* → ✓ *Then the report arrived.*

## EN-SPACING · No space before ? ! : ;

> **Trigger** — a space before a question mark, exclamation mark, colon or semicolon; double
> spaces; a number wrapped away from its unit.
> **Rule** — no space before those marks; single spaces; a non-breaking space between a number
> and its unit.
> **Source** — Chicago, New Hart's Rules. The space before the mark is a French habit and a
> frequent Central European one.

✗ *Ready ? Start now !* → ✓ *Ready? Start now.*

## EN-COMPOUND · Separate verb forms from noun forms

> **Trigger** — *login*, *signup*, *setup*, *checkout*, *backup* used as verbs, or the reverse.
> **Rule** — verbs are open (*log in*, *sign up*, *set up*, *check out*, *back up*); nouns and
> adjectives are closed or hyphenated as declared (*login page*, *sign-up* or *signup*,
> *setup*). Write *email* and lowercase *internet*.
> **Source** — Microsoft, Google.

✗ *Signup to setup your account* → ✓ *Sign up to set up your account*.

## EN-AMPERSAND · "and", not "&", in running text and headings

> **Trigger** — `&` in a sentence, heading or button.
> **Rule** — write *and*.
> **Source** — Microsoft, Google, GOV.UK.
> **Exceptions** — names that contain the sign; tight tabular labels where declared.

✗ *Plans & pricing* → ✓ *Plans and pricing*.

## EN-LATIN · Plain words for Latin abbreviations

> **Trigger** — *e.g.*, *i.e.*, *etc.*, *vs.*, *via* in running text.
> **Rule** — *for example*, *that is*, *such as*, *and more* or a complete list, *compared with*.
> **Source** — GOV.UK, Microsoft; screen readers read some abbreviations literally, and many
> readers confuse the first two.
> **Exceptions** — tight tables where declared.

✗ *Connect a source, e.g. a CRM, ERP, etc.* → ✓ *Connect a source such as your CRM or ERP.*

## EN-CAPITALS · Capitalize proper categories; lowercase "you"

> **Trigger** — lowercase days, months, languages or nationalities; capitalized *You* or *Your*
> mid-sentence.
> **Rule** — capitalize days, months, languages and nationalities; lowercase *you* and *your*.
> **Source** — Chicago; every English style guide. The courtesy capital is a leak from languages
> that capitalize the formal pronoun.

✗ *Your report arrives every monday in czech.* / *We will contact You* → ✓ *Your report arrives
every Monday in Czech.* / *We'll contact you.*

## Using the set

Script this class before any reader sees the catalog: EN-SPACING, EN-QUOTES, EN-ELLIPSIS,
EN-AMPERSAND, EN-LATIN, EN-CAPITALS and the presence half of EN-DASH are character patterns with
few legitimate exceptions. EN-CASE and EN-END-PUNCT need the element class, so they check
per component type rather than per string. Dash density needs a count per paragraph and a
reviewer's eye on the survivors. Count the catalog against each declared row before blocking on
it ([the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis)).

When NOT to apply: code, commands and input examples, which keep straight quotes and literal
characters; quoted third-party names; data exports; and a no-data glyph, which is a design
token rather than punctuation.
