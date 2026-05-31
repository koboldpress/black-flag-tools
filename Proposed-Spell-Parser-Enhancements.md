## Black Flag Tools — Spell Parser Enhancements Summary (PR 1)

**NOTE**: I'm providing this document for Arbron's review. Please delete if this branch is merged with Main if you wish.

I'd like to take a stab coding these enhacements. Since they will be contained to this branch, you can code review, suggest changes, or reject the enhancement altogether.

### Enhancement Summaries

The following enhancements target `code/parsing/parser.mjs` and `code/parsing/types/spell.mjs` exclusively. No UI changes, no template changes, no conversion file changes. All changes are backward-compatible additions to the existing parsing pipeline.

**Commit structure:** One commit per enhancement into the `enhance/spell-parser` branch (to simply code revew).

**Source-only changes**: This PR will contain **source changes only**, confined to `code/parsing/*.mjs`. Code style will be enforced by the module's config.

---

### Enhancement 1 — Fix Leading Space in `consumeDescription`

**Summary:** Every paragraph produced by `consumeDescription()` currently begins with a superfluous leading space. The line `paragraph += " " + line` unconditionally prepends a space, including when the paragraph is empty and the first line is being added. The fix is a one-character conditional: only prepend a space when the paragraph already has content.

**Why**: Every spell and item description created by the parser contains a subtle data quality defect. While browsers collapse the leading space in rendered HTML, the raw field value stored on the item is incorrect — affecting any downstream processing, copy-paste workflows, or future enricher logic that operates on the stored string rather than the rendered output. Fixing this before the other enhancements land ensures they build on clean output.

**Risk: None.** Single-line change. Browsers collapse whitespace inside `<p>` tags, so this has been invisible in rendered output — but it's incorrect and produces slightly off results in copy-paste and programmatic text-processing workflows.

#### Additional Context

This may never be an issue in FoundryVTT. In one of the publishing companies I worked at, the majority of the HTML-based data contained this minor leading space defect that caused problematic downstream effects, which is why I am proposing that this be nipped in the bud, just in case.

When the parser creates a spell item in Foundry, it writes the description HTML into `system.description.value` on the item document stored in the database. That stored value looks like this (simplified):

```html
<p>You hurl a mote of fire at a creature...</p>
<p>At Higher Circles. When you cast this spell...</p>
```

Notice the space after the opening `<p>` tag on each paragraph. That space is **in the database record**, not just in a display buffer. It's part of the stored string.

**Why "subtle":** When Foundry renders this HTML in a browser, the browser's whitespace collapsing rules (`white-space: normal` on `<p>` elements) swallow the leading space silently. The rendered text looks perfectly fine. No user ever sees a gap. That's why it's subtle — you'd only discover it by inspecting the raw field value in `item.system.description.value` directly.

**Why "data quality defect":** The stored value is wrong relative to what was intended. The parser is supposed to produce clean HTML paragraphs — `<p>You hurl...</p>` — but instead produces `<p> You hurl...</p>`. The extra space is unintentional, serves no purpose, and should not be part of the data. Any code that operates on the raw string rather than rendered HTML — string comparisons, regex operations, enricher processing, export pipelines, programmatic text analysis — receives slightly incorrect input. It also means every item created by the parser carries this artifact indefinitely unless someone edits and re-saves the description.

---

### Enhancement 2 — Populate `system.description.short` and Blockquote the First Paragraph

**Summary:** The BF spell data model exposes `system.description.short` (confirmed in `ENRICHED_FIELDS` and the `prepareSpells` index), but the parser never populates it. The first paragraph of a spell's description is the canonical short description. This enhancement extracts it as plain text into `system.description.short` and also retains it in `system.description.value` wrapped in a `<blockquote>` tag (≤ 25 words) or `<em>` tag (> 25 words, flagging it for human review). The current `<em>`-wrapping behavior for short first paragraphs is replaced by this cleaner approach.

**Why**: Populate `system.description.short` and Blockquote-ing the first paragraph `system.description.short` is actively used by the BF system in two visible UI contexts — the class/subclass selection dialog and the spell list index — yet it is never populated by the parser. Every spell created through the parser has a blank short description that the user must fill in manually. This is a straightforward quality-of-life improvement that makes parsed spells immediately usable without post-parse editing.

**Risk: Low.** The change is confined to the `process` callback of `consumeDescription()`. The 25-word guard and the two-branch wrapping logic are deterministic. `<blockquote>` is confirmed on the BF HTML whitelist.

---

### Enhancement 3

Dropped from the project

---

### Enhancement 4 — Capture Reaction Trigger Condition in `consumeCasting()`

**Summary:** The BF data model has a `system.casting.condition` field (mapped from `activation.condition`) that surfaces as a hover tooltip on the activity in the character sheet's actions list. Reaction spells encode their trigger as trailing text after the action type on the Casting Time line — e.g., `1 reaction, when a creature you can see within 60 feet of you misses with a melee attack`. The current parser discards this text. The enhancement reads whatever follows the action type, strips the leading comma and whitespace, and stores it as `condition` in the returned object. The `{ value, type }` return shape is unchanged for non-reaction spells.

**Why**: The trigger condition is an important piece of information for a reaction spell in actual play — it tells the player when they can use it. BF already provides `system.casting.condition` specifically for this purpose and surfaces it as a tooltip on the character sheet's actions list. Currently that field is always blank for reaction spells created by the parser as present. Populating it automatically makes parsed reaction spells more playable without manual follow-up.

**Risk: Low.** The existing `consumeNumber()` + `consumeEnumPlurals()` sequence is unaffected. The condition extraction fires after both complete and cannot interfere with them. For spells with no trailing text, the condition is simply absent from the result and behavior is identical to today.

---

### Enhancement 5 — Handle Special Duration Types in `consumeDuration()`

**Summary:** Spells with non-numeric durations (Instantaneous, Until Dispelled, Until Destroyed or Dispelled, Until Dispelled or Triggered, Permanent, Special) currently produce `duration: { value: null, unit: null }`. The existing `consumeNumber()` + `consumeEnumPlurals()` logic only handles scalar durations (Rounds, Minutes, Hours, etc.) that pair a number with a unit word. A fallback is added that checks the raw line text against these six literal phrases — ordered most-specific-first to prevent prefix collisions — and maps each to its confirmed BF `duration.unit` key.

**Why**: Spells with non-numeric durations — Instantaneous being the most common — silently produce a blank duration field in the data even though is displays when the spell is first parsed. Instantaneous is arguably the most frequently occurring duration in the game. A spell sheet showing no duration where other duration types should appear is both incorrect and potentially confusing to players. The fix is low-risk and makes a meaningful improvement to the accuracy of parsed output across a large number of spells.

**Risk: Low.** The fallback only fires when scalar numeric duration parsing produces no match, so existing timed and combat durations are completely unaffected. Ordering the map most-specific-first ("Until Dispelled or Triggered" before "Until Dispelled") eliminates the only correctness risk.

---

### Enhancement 6 — Add Condition Reference Enrichers

**Summary:** The 14 standard BF conditions (Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious) appear frequently in spell and item descriptions as plain text. This enhancement adds a new entry to `Parser.enrichers` that converts condition names to `&Reference[conditionname apply=false]` syntax — confirmed as the correct BF Reference enricher format from `enrichReference` in the BF system source. The `apply=false` parameter suppresses the "apply condition" button that the enricher renders by default, since the condition is being described in text rather than triggered. Pseudo-conditions that lack a `reference` journal UUID (`bleeding`, `burning`, `cursed`, etc.) are excluded from the regex. A context-aware regex matches condition names only when preceded by a verb phrase ("is", "are", "becomes", "while") to prevent false positives on words like "prone" used outside a condition context. Because `parseEnrichers()` runs on every paragraph in `consumeDescription()`, this improvement applies automatically to all item types — spells, magic items, armor, weapons, and enchantments — with no additional code changes.

**Why**: This is a quality of life improvement. Condition names in spell descriptions are among the most interaction-heavy pieces of text in the game — GMs/players regularly need to look up what a condition does mid-session. The BF Reference enricher exists precisely to turn condition names into clickable journal links, but only if the text contains the enricher syntax. Since the parser currently produces plain text, every condition reference is currently static and unclickable. This enhancement closes that gap automatically for all item types, not just spells, making parsed descriptions significantly more useful at the table without any additional work from the user.

**Risk: Medium.** The regex needs more testing against representative spell text. The main risk is false negatives (missed matches due to unusual phrasing) rather than false positives, since the context-aware pattern is deliberately conservative.

---

### Enhancement 7 — Detect AOE from Description Text

**Summary:** `consumeRange()` only reads area-of-effect data from the Range line itself (e.g., `Range: 60 feet (15-foot cube)`). Many spells specify their AoE in the description body instead (e.g., _Fireball_: `Range: 150 feet`, with `20-foot-radius sphere` in the description). A new static method `Parser.parseAOEFromText(text)` scans for shape + size patterns in the raw description text and returns `{ size, type, unit }`. It is called in `parseSpell()` after `consumeRange()` — only when `template.type` is still unset — so the Range line always takes priority. Type keys are resolved against `CONFIG.BlackFlag.areaOfEffectTypes.localized` (the same lookup used by `consumeRange()`) rather than hardcoded, so future BF additions appear automatically. The same helper is also called from `parseMagicItem()` for wands, staves, and rods that describe AoE effects in their description text.

**Why**: Area of effect is mechanically important — it determines targeting in combat, interacts with cover rules, and affects how the GM adjudicates spell placement on the grid. Many spells describe their AoE in the description body rather than the Range line, meaning the AoE template field is blank for spells like Fireball after parsing. A blank AoE field means the spell cannot be used with Foundry's measurement tools without manual correction. Detecting AoE from the description text makes parsed spells work correctly on the virtual tabletop immediately.

**Risk: Medium.** The raw pre-description text is scanned once before `consumeDescription()` is called and does not affect description output. The only risk is the detection regex producing false positives on unusual phrasing, which is mitigated by the Range-line-takes-priority guard.

---

### Enhancement 8 — Build Spell Activities from Parsed Description

**Summary:** The parser already adds `[[/save]]`, `[[/check]]`, `[[/damage]]`, and `[[/heal]]` enrichers to description text via `Parser.enrichers`. However, it never creates a `system.activities` entry on the spell — meaning saves, checks, and damage are interactive links only, with no mechanical activity backing them. This enhancement scans `system.description.value` after `consumeDescription()` for the same signal patterns already used by the enrichers, then constructs the appropriate activity object using the confirmed field paths from the `*ActivityConversion` classes. Priority order: save (with optional damage parts and `onSave: "half"` when applicable) → skill or ability check → heal → damage-only. A new `buildSpellActivities()` helper handles the detection and construction. Guard rails prevent activity creation when the detected DC or ability key fails validation, and the function never overwrites existing activities.

**Why**: Without a `system.activities entry`, a parsed spell has no mechanical behavior in Foundry — it is effectively a text document with clickable roll links. The GM or player must manually create the activity, configure the save or check, set the damage formula and type, and wire everything together before the spell functions in play. For a tool whose purpose is to reduce manual data entry, this is the most significant gap in the current parser. Building activities automatically from the parsed description makes the difference between a spell that requires substantial post-parse configuration and one that works correctly out of the box, mostly.

**Risk: High.** This is the most structurally significant change in the project. The activity schema must exactly match what BF expects at runtime. The `SaveActivityConversion`, `CheckActivityConversion`, `HealActivityConversion`, and `DamageActivityConversion` class paths are the authoritative source of truth for all field paths, and the implementation references them directly. Thorough testing against the spell bank in the project plan is essential before submission.

---

### Enhancement 9 — Broaden "At Higher Circles" Detection

**Summary:** The existing regex `/^\s*At Higher Circles\./i` requires a literal period after "Circles". Source text from some publications uses a colon instead (`At Higher Circles:`), causing the bold/italic formatting to be silently skipped. The regex is broadened to `/^\s*At Higher Circles[.:]/i` and the replacement uses a capturing group to preserve whichever punctuation mark was found.

**Why**: This is a Quality of Life enhancement. The "At Higher Circles" paragraph is the scaling mechanic for higher-circle spell slots — it appears on a percentage of non-cantrip spells and is frequently referenced during play. The current parser silently skips the bold/italic formatting when source text uses a colon instead of a period after "Circles", which is common in at least one major publication. The result is a paragraph that visually blends into the body text rather than standing out as a distinct mechanical section. The fix is trivial and the visual improvement is meaningful for usability.

**Risk: None.** One-line regex change. The capturing group replacement is safe and the broadened character class `[.:]` adds exactly one additional match case.
