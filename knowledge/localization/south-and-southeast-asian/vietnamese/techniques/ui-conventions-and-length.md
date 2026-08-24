---
layer: technique
type: technique
subject: vietnamese
technique: ui-conventions-and-length
status: forged
laws: [every-finding-cites-an-anchor]
shared_with: []
use_when: [setting length budgets for Vietnamese UI strings, reviewing casing in a vi catalog, fixing wrapping and truncation of Vietnamese labels]
---

# UI conventions & length

Vietnamese UI text obeys two conventions that both run *against* the English
source's visual habits — no Title Case, and asymmetric length — plus one layout
fact unique to a language that writes every word as space-separated syllables.
All three produce mechanical, greppable defects, which makes this technique the
cheapest one in the subject to audit exhaustively.

## VI-SENTENCE-CASE · sentence case everywhere; Title Case is a defect

**Trigger:** any string whose English source is Title Cased — menu items,
buttons, dialog titles, headers.
**Rule:** capitalize the first character of the string; everything after is
lowercase except proper nouns. Select All → Chọn tất cả, never Chọn Tất Cả.
Vietnamese has no noun capitalization and no title-casing convention at all —
mirrored source capitals are the most visible machine-translation tell in a vi
catalog. Microsoft's guide dedicates a table of Do/Don't pairs to exactly this.
For a translated feature name inside a sentence, capitalize the first word of
the compound only (Hiện Khởi động nhanh for "Unhide Quick Start") — the
capital marks where the name begins, the lowercase tail keeps it Vietnamese.
**Exception:** untranslated proper names and acronyms keep source casing (API,
PivotTable).

## VI-PROPER · proper-noun capitalization has two patterns

**Trigger:** place names, personal names, institutional names in vi text.
**Rule:** multi-syllable proper names capitalize *every syllable*: Việt Nam,
Hà Nội, Sài Gòn (Việt nam is wrong — the syllables are equal constituents of
one name). Institutional and document-title compounds capitalize the first
letter of each *constituent phrase*, not each syllable: Bộ Lao động - Thương
binh và Xã hội (Microsoft's guide, capitalization section). The two patterns
coexist; applying the every-syllable rule to institutions (or the
first-element rule to place names) is the recognizable over-application.
Sentence-initial position adds nothing — the rules above already govern.

## VI-LENGTH · budget long for nouns, short for verbs

**Trigger:** length-constrained slots — buttons, tabs, badges, table headers,
narrow columns.
**Rule:** Vietnamese length is asymmetric by word class. Descriptive and
compound nouns run **+40–60% characters** over English, with worst cases near
+90% (credential → thông tin xác thực), because precise concepts come from
multi-syllable Sino-Vietnamese compounds. Single imperative verbs run **at or
below** English length (Save → Lưu, Cancel → Hủy, Delete → Xóa). So: buttons
and actions need no extra room; labels, headers, and empty-state noun phrases
need real slack. A blanket +30% expansion budget — the common i18n default —
is simultaneously too generous for half the catalog and too tight for the
other half. When a compound noun cannot fit its slot, the ladder is: choose a
shorter established synonym → keep the English loan for that slot (recorded as
a slot-level ruling) → widen the slot. **Never** the two false economies:
truncating a compound mid-word, or inventing an initialism — Vietnamese
acronyms exist (UBND, TP.HCM) but only *established* ones decode; a
manufactured one is noise, and dropping syllables or diacritics to save space
manufactures nonwords (see diacritics-and-typography).

## VI-WRAP · spaces inside words are not break points

**Trigger:** any wrapping, truncating, or ellipsizing container holding
Vietnamese text.
**Rule:** every Vietnamese word is one or more space-separated syllables —
quản trị viên ("administrator") is one word, three tokens. Whitespace-based
line breaking will happily sever it after quản trị, which reads as broken
text, not as a wrapped word; character-count truncation with an ellipsis can
end mid-syllable-cluster, which is worse. Defenses, in order of preference:
keep short labels unwrappable (nowrap) and size the container instead; place
non-breaking spaces inside multi-syllable words in known-narrow slots, and
always between a numeral and its unit or classifier (10 phút, {count} mục) so
the quantity phrase survives as a unit; shorten the term per the VI-LENGTH
ladder rather than trusting the wrap. Line breaking that is aware of
Vietnamese word boundaries needs a dictionary, and most rendering stacks do
not carry one — assume the naive behavior and write the catalog defensively.
**Exception:** long running prose (descriptions, help text) wraps freely — a
mid-word break in a paragraph is a minor blemish; the rule's force is in
chrome, where the broken fragment *is* the whole visible string.

## Auditing this technique

Every rule here is mechanically checkable: Title Case by regex against
multi-capital sequences, proper-name casing against a small gazetteer, length
against slot budgets, wrap hazards by token count in known-narrow keys. A sweep
should therefore report counts, not impressions — and each finding cites its
rule ID per
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor).
