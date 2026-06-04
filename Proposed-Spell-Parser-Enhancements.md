## Black Flag Tools — Spell Parser Enhancements Summary (PR 1)

**NOTE**: I'm providing this document for Arbron's review. Please delete if this branch is merged with Main if you wish.

I'd like to take a stab coding these enhacements. Since they will be contained to this branch, you can code review, suggest changes, or reject the enhancement altogether.

### Enhancement Summaries

The following enhancements target `code/parsing/parser.mjs` and `code/parsing/types/spell.mjs` exclusively. No UI changes, no template changes, no conversion file changes. All changes are backward-compatible additions to the existing parsing pipeline.

**Commit structure:** One commit per enhancement into the `enhance/spell-parser` branch (to simply code revew).

**Source-only changes**: This PR will contain **source changes only**, confined to `code/parsing/*.mjs`. Code style will be enforced by the module's config.

---

### Enhancement 1 — Tighten Paragraph Accumulation in `consumeDescription`

**Summary:** The line-accumulation loop in `consumeDescription()` reads `paragraph += " " + line`, which adds a space at the start of every new paragraph because it runs unconditionally — even when `paragraph` is still empty. The fix makes the space conditional: `paragraph += (paragraph ? " " : "") + line`.

**Why:** This doesn't actually change anything you can see today. Each paragraph gets `.trim()`ed before it's wrapped in `<p>`, so the leading space is stripped before anything gets stored. The output is byte-identical before and after.

The reason to ship it anyway is defensive. Right now the code relies on a downstream `.trim()` to clean up a space it never should have added. The fix makes the loop correct on its own, so if someone changes the code between the accumulation and the trim later — or reuses the accumulated value somewhere without trimming — the stray space won't sneak through.

**Risk: None.** Single-line change. Output is identical before and after, verified against a realistic spell. No current caller is affected.

**What this does not fix:** There are other whitespace issues elsewhere in the parser — specifically a regex operator-precedence issue in the list-item bullet stripper (`^•|-\s*` parses as `(^•) | (-\s*)`, which leaves a leading space when a paragraph starts with `•`) and doubled spaces that appear when input lines have trailing whitespace. Those are separate issues that Enhancement 1 does not address.

---

### Enhancement 2 — Populate `system.description.short` and Set Off the First Paragraph

**Summary:** The BF spell data model has a `system.description.short` field that the parser never fills in. This field shows up in the spell selection dialog and the spell list index, but every spell created by the parser leaves it blank. This fix grabs the first paragraph of the description, saves it as plain text in `system.description.short`, and also keeps it in the description body wrapped in a `<blockquote>` (25 words or fewer) or `<em>` (longer than 25 words). The old behavior — only wrapping the first paragraph in `<em>` when it was under 20 words — is replaced by this approach.

**Why:** Players and GMs see `system.description.short` every time they browse spells or open the selection dialog. Having it blank on every parsed spell means someone has to go back and fill it in by hand. Pulling it from the first paragraph is an easy win that makes parsed spells usable right away. Wrapping the same paragraph in the description body also helps visually separate the flavor text from the mechanical rules, which matches how the published books lay things out.

**Implementation note:** `<blockquote>` is a block-level HTML element, so `consumeDescription()` needed a small tweak: when the `process` callback returns something that starts with a block-level tag, the usual `<p>` wrapper is skipped. Without this, the output would be `<p><blockquote>…</blockquote></p>`, which is invalid HTML5. Everything else that uses `consumeDescription()` is unaffected — inline content like `<em>` still gets wrapped in `<p>` as before.

**Risk: Low.** The spell-side change only touches the `process` callback and behaves the same way every time. The change to `consumeDescription()` is backward-compatible — callers that don't use a `process` callback, or that return inline content, get the same output as before. `<blockquote>` is on the BF HTML whitelist.

**Note on input format:** `consumeDescription()` uses blank lines to separate paragraphs. If a paste has no blank lines between paragraphs, the whole description gets treated as one paragraph — meaning the entire thing ends up in `system.description.short` and gets wrapped as a single block. This is pre-existing behavior that this PR doesn't change. If that happens, add blank lines between paragraphs in the source text. A future enhancement could handle this automatically with heuristic paragraph detection.

---

### Enhancement 3

Dropped from the project

---

### Enhancement 4 — Capture Reaction Trigger Condition in `consumeCasting()`

**Summary:** The BF spell data model has a `system.casting.condition` field that displays as a hover tooltip on the spell's activity in the character sheet. Reaction spells put their trigger condition on the Casting Time line after the action type — e.g., `Casting Time: 1 reaction, when a creature you can see within 60 feet of you misses with a melee attack`. The parser was throwing that part away. This enhancement reads whatever is left on the line after the action type, strips the leading comma and whitespace, and saves it as `condition` on the returned object. If there's nothing there, the returned object stays the same as before.

**Why:** The trigger condition is useful information that a player needs to know about the reaction spell they are casting — it essentially tells them when they can use it. The field for it was always blank for spells created by the parser, so users had to fill it in manually after every import. This QoL enhancement takes care of it automatically.

**Risk: Low.** The existing parsing logic runs exactly the same as before. The condition is read after the action type is already captured, so the two can't interfere with each other. For non-reaction spells with nothing after the action type, the output is identical to today. The only minor risk is the punctuation-stripping pattern leaving a stray character at the start of the condition in unusual cases — easy to spot in testing and simple to fix.

---

### Enhancement 5 — Handle Special Duration Types in `consumeDuration()`

**Summary:** Spells with non-numeric durations — Instantaneous, Permanent, Until Dispelled, Until Dispelled or Triggered, and Until Destroyed or Dispelled — were producing `duration: { value: null, unit: null }` because the existing parsing logic only handles durations that start with a number. This enhancement adds an explicit phrase list that runs before `consumeEnumPlurals()`, maps each phrase to its correct BF duration key, and is ordered longest-match-first to prevent shorter phrases from matching the start of longer ones. Scalar durations like "1 minute" don't match any phrase in the list and fall through to the existing logic unchanged.

**Why:** Instantaneous is probably the most common duration in the game, and it was silently producing a blank duration field on every parsed spell. This enhancement is a small addition that makes a noticeable difference across a large number of spells that use non-numeric durations.

**Risk: Low.** The phrase list only runs when the existing number-based parsing finds nothing, so timed durations like "1 minute" or "8 hours" are completely unaffected. The longest-match-first ordering is the only thing that needs to be right, and it's been verified against all six phrases.

**Implementation note:** The phrase list runs _before_ `consumeEnumPlurals()`, not after. `makeLabels()` flattens BF's nested duration config and sorts entries alphabetically, which puts "Until Dispelled" before "Until Dispelled or Triggered" in the output. Without the explicit pre-check, `consumeEnumPlurals()` prefix-matches the shorter phrase and returns the wrong key for the longer one.

---

### Enhancement 6 — Add Condition Reference Enrichers

More to come

---

### Enhancement 7 — Detect AOE from Description Text

More to come

---

### Enhancement 8 — Build Spell Activities from Parsed Description

More to come

---

### Enhancement 9 — Broaden "At Higher Circles" Detection

More to come
