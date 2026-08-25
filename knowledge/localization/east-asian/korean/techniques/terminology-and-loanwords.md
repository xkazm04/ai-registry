---
layer: technique
type: technique
subject: korean
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [building or auditing a Korean termbase, deciding whether a product term transliterates or translates, settling a loanword's Hangul spelling]
---

# Terminology and loanwords

Korean draws on three lexical strata — native Korean, Sino-Korean (한자어),
and loanwords (외래어, mostly from English in the software domain) — and the
craft is knowing which stratum a term belongs to *by its role*, then
spelling the loanwords by a rule rather than by ear. Two authorities govern:
the National Institute of Korean Language (국립국어원), whose loanword
orthography (외래어 표기법, promulgated 1986 and maintained by a standing
deliberation committee) fixes official Hangul spellings; and settled tech
usage, which diverges from the standard in known, listable ways. Both are
citable; neither wins automatically.

## KO-LOANWORD-SPLIT · things borrow, actions translate

**Rule.** The productive default for software vocabulary:

- A term naming a **kind of thing** in the product's world — especially a
  short tab/section label or a product metaphor — is **borrowed**: a Hangul
  transliteration with no native substitute (템플릿, 트리거, 워크플로,
  이벤트, 스킬, 모니터). Korean tech vocabulary is loanword-native; a
  "purer" translation of an established tech noun reads more foreign than
  the loanword, not less.
- A term naming an **action, process, state, or judgment** applied to those
  things uses the **naturalized Sino-Korean** word (저장 save, 삭제 delete,
  검토 review, 승인 approval, 배포 deployment, 실행 run, 초안 draft,
  설정 settings).

The rule is binary on purpose: the drift mode it prevents is a translator
inventing a third option mid-catalog — reaching for 금고 where the termbase
says 볼트, or 역량 where it says 기능. One concept, one rendering: the
termbase row wins over any individually-defensible alternative, and a
translator who believes a row is wrong flags it for a recorded ruling
instead of silently diverging.

**Semantic near-miss traps** worth pre-loading into any termbase: 인증서
(certificate) is not "credential" (자격 증명); 치료/치유 (medical healing)
is not system "healing" (복구); 광고 (advertise) is not "promote" in the
rank sense (승격); 일정 (calendar appointment) is the wrong "schedule" for a
recurring automation (스케줄). Each pair is a real observed confusion, not a
hypothetical.

## KO-TRANSLIT · spell loanwords by the standard, then record the exceptions

**Rule.** Default every loanword's Hangul spelling to the National
Institute's loanword orthography and its published deliberation rulings —
that is what makes a spelling citable rather than a taste vote. The
standard's decisions that most often surprise translators, and therefore
most repay anchoring:

- **No long-vowel doubling**: 워크플로 not 워크플로우, 윈도 not 윈도우
  (standard), 팔로 not 팔로우.
- **콘텐츠** not 컨텐츠; **메시지** not 메세지; **애플리케이션** not
  어플리케이션; **디렉터리** not 디렉토리; **릴리스** not 릴리즈;
  **라이선스** not 라이센스.
- No initial doubled consonants for foreign sounds (서비스 not 써비스,
  게임 not 께임) — tensed spellings read as slangy emphasis.

Everyday usage defies several of these (윈도우 and 컨텐츠 are arguably more
common in the wild than the standard forms), so the second half of the rule
is mandatory: **count the catalog, pick per term, and record the ruling in
the termbase with the standard cited either way.** A product may side with
usage against the Institute — that is legitimate exactly when written down;
an unrecorded mixture of 워크플로 and 워크플로우 in one catalog is a defect
regardless of which form the product would have chosen.

## KO-KONGLISH · domestic pseudo-English is a false-friend layer

**Rule.** Korean has an established stock of Konglish — English-derived
words whose meaning shifted domestically (핸드폰 "hand phone" = mobile,
노트북 = laptop, 아이쇼핑 = window shopping, 서비스 = a freebie in retail
contexts, 미팅 = often a blind date in casual registers). Two directions of
failure: rejecting a fully-naturalized Konglish term for the "correct"
English loan (노트북 is the word for laptop; 랩톱 reads like a spec sheet),
and importing an English word assuming its English sense survives
(개인정보 is "privacy" in the settings-label sense; 프라이버시 exists but is
narrower). Decision rule: for consumer-facing words, the naturalized Korean
term — Konglish or not — beats etymological correctness; for
developer-facing technical terms, the standard transliteration of the
international term wins.

## KO-UNTRANSLATED · some terms stay Latin, as names

**Rule.** Brand names, protocol names, file-format names, and product
features treated as proper names stay in Latin script with original casing,
particles attached directly (see spacing-and-typography, KO-LATIN). The
termbase marks these explicitly as *untranslated*, because the default pull
of a diligent translator is to transliterate everything — and a feature
name transliterated in half the catalog and Latin in the other half is the
predictable result of leaving the column blank. The test for
Latin-vs-transliteration: would a Korean tech publication write it in
Latin? API, OAuth, URL stay Latin; generic nouns that happen to be English
(template, trigger) transliterate.

## When not to apply

The specific termbase — which rendering THIS product uses for vault,
capability, or its own feature names — is the consuming product's artifact,
never this subject's. What transplants is the split rule, the standard's
spelling defaults with their known usage divergences, and the discipline
that every divergence from the Institute's spelling is a recorded ruling
with a citation, not an accumulated accident.
