---
layer: application
type: application
subject: grounded-marketing-generation
technique: publishable-as-is-quality-gate
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# The publishable-as-is gate in the SEO prompt pipeline - and the demo fallback that breaks the never-invent rule

Verified against the open SEO agent (seven commands, reference specs, small Python
checkers) at commit `a47c1ecd57016568cc791d24af9d809768d8d5ab` (2026-09-06), and, for
the demo-fallback finding the dispatch asked to be verified honestly, against the
adtech workspace at `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08).

## The never-invent rules are instructed, and one part of them is structural

`CLAUDE.md` carries the three rules under "Hard rules": **Never invent proof** ("No
number, review, credential, or claim goes on any page unless the owner gave it to
you... A page written with no real proof says so at the top: `> Written without real
proof - swap in your numbers and reviews before publishing.`"); **If you can't find it,
ASK** ("Three failure modes, all banned: guessing a plausible value, leaving it empty
with no note, quietly skipping it. Every unanswered item ends up in the report as an
open question, never as a blank"); and **Label confidence on anything not documented**
("this is practitioner consensus, not documented ... behaviour"). `.claude/commands/
service-page.md` "The words" step 3 repeats it for the money page: "every claim
traceable to something I gave you - ask me for real numbers, reviews and credentials
before writing, and never invent one. Real reviews word for word."
`references/service-page-template.md:80` adds the proof gate: "5+ proof touches
minimum per page, every one traceable to proof-inventory. Count them before
registering."

The structural half is `code/check_page_done.py`. Its `STRINGS` list (lines 23-30)
fails a page on any surviving template value - `"From $000"`, `"(555) 010-0199"`,
`"Licence #000000"`, `"Customer name"`, `"Your City"` - and `PLACEHOLDER_PATTERNS`
(lines 33-44) adds shape-based catches for placeholders nobody listed: zeroed-out
numbers and prices, 555 phone numbers, lorem ipsum, literal TODO markers, instruction
text left on the page, `@example.` e-mail domains, template date placeholders in form
fields. It also fails on a non-200 response and on any dead internal link. This is a
deterministic gate against the template-leak class of fabrication: a placeholder
phone or price cannot reach `/publish`. It does not, and cannot, detect a *plausible*
invented value - a real-looking phone number the model made up passes - which is why
the pipeline's protection for invented values remains the instruction plus the owner's
review of the draft.

## The gate is loop-shaped and deterministic; the 9/10 gate is neither invoked nor checked

`service-page.md` "Register + verify" and `blog-post.md:49-58` name the exit gate
explicitly (`check_page_rhythm.py` then `check_page_done.py` for a post;
`check_page_done.py` for a service page) and state the loop rule: "the gate decides
when you're done, not you. Run the gate -> fix every failure -> run it again... never
present a failing site with an explanation attached." `check_page_rhythm.py` fails a
wall of text (more than 2 consecutive text-only blocks, paragraphs over 4 sentences,
more than 350 words without a visual, a 6-minute-plus post with no table of contents),
a money page with no form, and (`:148-149`) "a section [that] apologises for having no
proof - show the best true material instead." Its header records why it exists:
"Instructions get skipped. This does not." All of its caps are convention and the
file does not claim otherwise.

The **9 out of 10 quality gate** is declared in `CLAUDE.md` under "Two rules that
override everything else" - "Nothing gets published to a live site until it scores 9
out of 10 or higher... Rate it honestly and neutrally. Never inflate a score... Score
on: hook strength (specificity, numbers, tension), body structure, originality, and CTA
clarity." Searching the seven command files and the reference specs finds no
invocation of it: no command asks for the score, no checker reads one, `publish.md`'s
Step 0 gate is `check_site_complete.py`, and `blog-post.md:58` instructs the opposite -
"never declare a score." The rubric also rewards "numbers" under hook strength, which
pulls against the never-invent rule for a page written before proof arrived. This is
the structural fact the technique names: a self-scored numeric gate performed by the
model that wrote the copy, existing only as a sentence in a rules file and invoked by
nothing, is not a gate. The pipeline's real publish decision is the deterministic
checker loop plus the owner's yes on the draft, and the tree is better than its rules
file says.

Two smaller deviations. The "Written without real proof" banner is instructed but no
checker looks for it, so a page carrying it can pass `check_page_done.py` and reach
`/publish`. And the 5+ proof-touch count is instructed ("count them before
registering") with no script behind it.

## The demo ad fallback fabricates a shipping claim - verified, with the file corrected

The organic scout's "worse than standard" note says the demo ad fallback fabricates a
shipping claim against the tree's own law and points at `src/lib/catalog/generate.ts`.
Verified: **that file is clean.** `generate.ts:73-88` defines `FloorClaims`
(`freeShippingFrom`, `rating`, `returnDays`, `dispatchHours`) as "the ONLY source of
shipping / rating / returns / dispatch claims in the fallback copy - when a field is
absent the corresponding line is omitted entirely, so a shop never bulk-imports a
promise it didn't supply", and `buildAssetGroup` (`:95-174`) builds every claim line
conditionally (`:113`, `:130`, `:143`). Its two callers (`src/lib/catalog/ad-copy.ts:190`,
`src/components/app/modules/CatalogModule.tsx:290`) pass no `claims` at all, so the
floor never asserts a promise - and the brand context is never wired into it, which
means a shop that *does* offer free shipping cannot get the line either; a dead seam,
not a fabrication.

The fabrication lives one tool over, in the AI ads tool's demo path.
`src/lib/ai/tools/ads.ts:129-153` (`demoAds`) hardcodes `"Doprava zdarma od 999 Kč"`
("free shipping from 999 CZK") as a headline (`:135`), a description (`:142`), the
callout `"Doprava zdarma"` (`:144`) and the long headline (`:149`), plus `"Rychlé
dodání, snadné vrácení"` (fast delivery, easy returns) at `:141` - for any product,
any shop, with no field supplying the threshold. The same file's `AD_SYSTEM`
(`ads.ts:21-29`) instructs the model, via the shared `antiFabrication` fragment from
`_fragments.ts`, to promise no "specific discounts or numbers that were not supplied."
The demo output is what a keyless prospect sees first, and it ships a specific CZK
promise the system prompt three lines above forbids. The standard stands and the fix
is the one `generate.ts` already models: route `demoAds` through a conditional floor
that emits a shipping line only when a supplied `freeShippingFrom` exists.
