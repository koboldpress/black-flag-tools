## Black Flag Tools — Spell Parser Enhancements Summary (PR 1)

**NOTE**: I'm providing this document for Arbron's review. Please delete if this branch is merged with Main if you wish.

I'd like to take a stab coding these enhacements. Since they will be contained to this branch, you can code review, suggest changes, or reject the enhancement altogether.

### Enhancement Summaries

The following enhancements target `code/parsing/parser.mjs` and `code/parsing/types/spell.mjs` exclusively. No UI changes, no template changes, no conversion file changes. All changes are backward-compatible additions to the existing parsing pipeline.

**Commit structure:** One commit per enhancement into the `enhance/spell-parser` branch (to simply code revew).

**Source-only changes**: This PR will contain **source changes only**, confined to `code/parsing/*.mjs`. Code style will be enforced by the module's config.

---

### Enhancement 1 — Tighten Paragraph Accumulation in `consumeDescription`

**Summary:** The line-accumulation loop in `consumeDescription()` reads `paragraph += " " + line`, which prepends a space unconditionally — including on the first line of a new paragraph, when `paragraph` is still empty. The upate makes the space conditional on the paragraph already having content: `paragraph += (paragraph ? " " : "") + line`.

**Why:** In the current code this is a latent issue rather than an observable one. Each paragraph is `.trim()`ed before being wrapped in `<p>` (line 159 of `parser.mjs`), so the transient leading space is stripped before storage and the stored field value is clean. The fix produces byte-identical output today.

The reason to ship it is purely defensive. The current pattern works because a downstream .trim() happens to strip the transient leading space. The fix makes the loop self-contained, so future changes between the accumulation and the trim — or callers that reuse the accumulated value without trimming — won't reintroduce the artifact.

**Risk: None.** Output is identical before and after — verified against the realistic spell. Single-line change with no behavioral consequences for any current caller.

**What this does _not_ fix:** Stray whitespace artifacts do exist in stored descriptions from other paths in the parser — notably a regex operator-precedence bug in the list-item bullet stripper (`^•|-\s*` parses as `(^•) | (-\s*)`, leaving a leading space when a paragraph starts with `•`), and doubled spaces produced when input lines carry trailing whitespace. Those are separate defects; Enhancement 1 does not address them.

---

### Enhancement 2 — Populate `system.description.short` and Set Off the First Paragraph

**Summary:** The BF spell data model exposes `system.description.short`, but the parser never populates it. The first paragraph of a spell's description is the canonical short description. This enhancement extracts it as plain text into `system.description.short` and also retains it in `system.description.value`, set off as a `<blockquote>` (≤ 25 words) or `<em>` (> 25 words, flagging longer openings for human review). The previous behavior — wrapping first paragraphs in `<em>` only when under 20 words — is replaced by this approach.

**Why:** `system.description.short` is actively used by the BF system in visible UI contexts including the spell selection dialog and the spell list index. Every spell currently created through the parser has a blank short description that the user must fill in manually. Populating it from the first paragraph is a straightforward quality-of-life improvement that makes parsed spells immediately usable without post-parse editing. Wrapping the same paragraph in the description body visually distinguishes the spell's narrative opening from its mechanical text, mirroring the formatting convention of the published source books.

**Implementation note:** Because `<blockquote>` is a block-level element, `consumeDescription()` in `parser.mjs` also needs a small adjustment: when the `process` callback returns content that begins with a block-level tag, the surrounding `<p>` wrapper is skipped. Without this, the output would be `<p><blockquote>…</blockquote></p>`, which is invalid HTML5. Inline wrappers like `<em>` still receive the `<p>` wrap as before, so every other caller of `consumeDescription()` is unaffected.

**Risk: Low.** The spell-side change is confined to the `process` callback and is deterministic. The shared change to `consumeDescription()` is backward-compatible: callers that don't pass a `process` callback, or whose callbacks return inline content, get byte-identical output. `<blockquote>` is confirmed on the BF HTML whitelist.

**Note on input format**: The parser's existing `consumeDescription()` uses blank lines as paragraph separators in the spell's description. When a paste contains no blank lines between paragraphs, the entire description is merged into one paragraph and treated as the first paragraph for purposes of the short-description extraction and wrap rules. This is pre-existing behavior unchanged by this PR; users who paste from sources without blank-line paragraph separators (e.g., Markdown raw text) should add blank lines between paragraphs. A future enhancement could add heuristic paragraph detection.

---

### Enhancement 3

Dropped from the project

---

### Enhancement 4 — Capture Reaction Trigger Condition in `consumeCasting()`

More to come

---

### Enhancement 5 — Handle Special Duration Types in `consumeDuration()`

More to come

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
