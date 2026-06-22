---
name: ui-ux-pro-max
description: Ultimate UI/UX design intelligence with 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 17 tech stacks, 161 industry reasoning rules, and automated design system generation. Use when designing UI, building design systems, selecting colors/typography, creating landing pages, or any UI/UX design decision.
---

# UI UX Pro Max — Design Intelligence Skill

## Overview
This skill provides instant access to a comprehensive UI/UX design knowledge base powered by the UI UX Pro Max database (95k+ GitHub stars). It includes structured databases for styles, colors, typography, product types, charts, UX guidelines, landing page patterns, icons, fonts, and industry-specific reasoning rules. The skill also includes Python search scripts (BM25 ranking algorithm) and an automated Design System Generator.

## When to Use This Skill
- Selecting a UI style (glassmorphism, minimalism, brutalism, neo-brutalism, bento grid, etc.)
- Choosing color palettes for specific product types
- Pairing fonts (headings + body) with Google Fonts imports
- Creating landing page structures and layouts  
- Building complete design systems with tokens
- Following UX best practices and avoiding anti-patterns
- Selecting chart types for data visualization
- Getting stack-specific UI guidelines (React, Next.js, Vue, Svelte, SwiftUI, Flutter, etc.)
- Generating design systems for specific product types
- Checking accessibility requirements per component type

## Quick Reference — Priority Ladder (P1–P10)

### P1: Accessibility (WCAG 2.1 AA)
- See `data/ux-guidelines.csv` — filter by category=accessibility
- Minimum contrast: 4.5:1 normal text, 3:1 large text
- Focus indicators visible, forms labeled, keyboard navigable
- 44×44px touch targets minimum

### P2: Design System (Tokens → Components)
- Use `scripts/search.py "<query>" --domain product` to find product patterns
- Use `scripts/search.py "<query>" --design-system` to generate complete system
- Three-layer tokens: primitive → semantic → component
- CSS custom properties as single source of truth

### P3: UI Styles (67 Styles)
- See `data/styles.csv` — full database with CSS variables, Tailwind configs, AI prompts
- Key styles: Minimalism, Glassmorphism, Neumorphism, Brutalism, Bento Grid, Skeuomorphism, Dark Mode, Flat Design, Claymorphism, Aurora UI, Cyberpunk, Neubrutalism, AI-Native, Spatial Design, Retro-Futurism

### P4: Color Palettes (161 Product Types)
- See `data/colors.csv` — each product type has primary, secondary, accent, background, surface, text, border palettes in Tailwind format
- See `data/products.csv` — maps product type → style, landing pattern, color palette

### P5: Typography (57 Font Pairings)
- See `data/typography.csv` — heading + body pairs with Google Fonts URLs, CSS imports, Tailwind configs
- See `data/google-fonts.csv` — 1500+ fonts with popularity, subsets, designers

### P6: Landing Pages (34 Patterns)
- See `data/landing.csv` — section orders, CTA placements, conversion optimization tips
- Patterns: Hero + Features + CTA, Hero + Social Proof + Pricing, Storytelling + Demo, etc.

### P7: UX Guidelines (99 Rules)
- See `data/ux-guidelines.csv` — Do/Don't/CSS examples across 9 categories
- Categories: accessibility, forms, navigation, layout, typography, color, interaction, performance, mobile

### P8: Charts & Data Visualization (25 Types)
- See `data/charts.csv` — accessibility grades (A–D), library recommendations (Chart.js, D3, Recharts, ECharts)

### P9: Tech Stack Guidelines (17 Stacks)
- See `data/stacks/` directory — per-framework UI guidelines
- React (53 rules), Next.js (52), Vue (49), Svelte (53), Astro (53), Nuxt.js (58), Nuxt UI (70), Angular (50), Laravel (50), Flutter (52), SwiftUI (50), HTML+Tailwind (55), shadcn/ui (60), React Native (51), Jetpack Compose (52), Three.js (50+), JavaFX (75)

### P10: AI-Generated Assets
- Icons: `data/icons.csv` — 105+ Phosphor icons with import code
- App Interface: `data/app-interface.csv` — iOS/Android/RN patterns
- Performance: `data/react-performance.csv` — 44 React perf patterns

## Python Search Scripts

### search.py — CLI Entry Point
Location: `scripts/search.py`
Usage:
```bash
python3 scripts/search.py "<query>"                           # Auto-detect domain
python3 scripts/search.py "<query>" --domain style            # Force domain
python3 scripts/search.py "<query>" --design-system           # Generate design system
python3 scripts/search.py "<query>" --design-system --persist -p "Project"  # Save to disk
python3 scripts/search.py "<query>" --stack react             # Stack-specific search
```

Outputs ANSI true-color terminal output with Unicode box-drawing characters and actual color swatches.

### core.py — BM25 Search Engine
Location: `scripts/core.py`
Zero-dependency BM25 implementation (k1=1.5, b=0.75). Searches across 11 domains with auto-detection via keyword scoring. Domains: style, product, color, typography, landing, chart, ux-guidelines, app-interface, react-performance, icon, ui-reasoning.

### design_system.py — Design System Generator
Location: `scripts/design_system.py` (~800 lines)
Multi-step pipeline:
1. Product type matching from query
2. Reasoning rule matching (161 rules)
3. Parallel BM25 searches (style, color, typography, landing)
4. Priority keyword scoring for best matches
5. Assembly: pattern + style + colors + typography + effects + anti-patterns
6. Output: ANSI true-color terminal + Markdown format
7. --persist flag: saves to design-system/<project>/MASTER.md with page-level overrides

## CSV Database Reference

### data/styles.csv
Columns: style_name, description, css_variables, tailwind_config, ai_prompt, checklist, best_for, avoid_for
Contains 67 complete UI styles with implementation details.

### data/colors.csv  
Columns: product_type, primary, secondary, accent, background, surface, text_primary, text_secondary, border, success, warning, error, info
161 product types with full Tailwind color palettes.

### data/typography.csv
Columns: pairing_name, heading_font, body_font, google_fonts_url, css_import, tailwind_config, best_for
57 font pairings with ready-to-use import code.

### data/products.csv
Columns: product_type, category, recommended_style, landing_pattern, color_palette, complexity
145 product types mapped to design recommendations.

### data/charts.csv
Columns: chart_type, description, best_for, accessibility_grade, library_recommendation, alternatives
25 chart types with accessibility scores A-D.

### data/landing.csv
Columns: pattern_name, sections, cta_placement, conversion_tips, best_for
34 landing page patterns with section ordering.

### data/ux-guidelines.csv
Columns: category, guideline, do_example, dont_example, css_example, wcag_ref
99 UX rules with concrete code examples.

### data/ui-reasoning.csv
Columns: product_category, reasoning_rules, decision_rules_json, anti_patterns, checklist
161 industry-specific reasoning rules for automated design decisions.

### data/icons.csv
Columns: icon_name, category, phosphor_import, usage_context
105+ Phosphor icons organized by category.

### data/google-fonts.csv
Columns: family, category, popularity, subsets, designers, variable_axes
1500+ Google Fonts with full metadata.

### data/app-interface.csv
Columns: platform, guideline, implementation, code_example
30 app UI guidelines for iOS/Android/React Native.

### data/react-performance.csv
Columns: pattern, description, solution, code_example, impact
44 React/Next.js performance optimization patterns.

### data/stacks/*.csv (17 files)
Each stack file: columns vary by framework, but all contain guideline, implementation, code_example.
React, Next.js, Vue, Svelte, Astro, Nuxt.js, Nuxt UI, Angular, Laravel, Flutter, SwiftUI, HTML+Tailwind, shadcn/ui, React Native, Jetpack Compose, Three.js, JavaFX.

## Design System Generator Workflow

When asked to design a UI or create a design system:

1. **Identify the product type** — search `data/products.csv` for matching categories
2. **Run design system generation** — `python3 scripts/search.py "<product description>" --design-system`
3. **Review recommendations** — pattern, style, colors, typography, effects, anti-patterns
4. **Apply stack guidelines** — search `data/stacks/<framework>.csv` for implementation rules
5. **Check UX guidelines** — cross-reference `data/ux-guidelines.csv` for relevant rules
6. **Select charts if needed** — `data/charts.csv` for data visualization choices
7. **Persist if multi-page** — `--persist` flag to save MASTER.md + page overrides

## Integration with OpenCode Agents

### uiux-designer agent
This skill is the primary knowledge source for the uiux-designer agent. When the uiux-designer needs to:
- Choose a UI style → consult `data/styles.csv`
- Pick colors → consult `data/colors.csv` + `data/products.csv`  
- Select fonts → consult `data/typography.csv`
- Design landing pages → consult `data/landing.csv`
- Follow UX rules → consult `data/ux-guidelines.csv`
- Generate design system → run `scripts/search.py --design-system`
- Implement with framework → consult `data/stacks/<framework>.csv`

### code-reviewer agent  
When reviewing UI code, cross-reference against UX guidelines and anti-patterns in `data/ux-guidelines.csv` and `data/ui-reasoning.csv`.

### ui-reviewer agent
Use `data/ux-guidelines.csv` checklist items as visual regression test criteria.

## Key Principles

1. **Search First**: Always check the CSV databases before making design decisions. The databases contain battle-tested patterns.
2. **Product-First**: Match the design to the product type — a healthcare app needs different aesthetics than a gaming platform.
3. **Reasoning-Driven**: The 161 reasoning rules in `data/ui-reasoning.csv` encode industry best practices.
4. **Stack-Aware**: UI implementation varies by framework — always check stack-specific guidelines.
5. **Accessibility by Default**: WCAG 2.1 AA compliance is non-negotiable. UX guidelines CSV flags accessibility violations.
6. **Token-Based**: Use design tokens (CSS custom properties), never magic values.
7. **Persist for Reuse**: Use `--persist` to save design systems for multi-session AI workflows.
