# 🎨 Petra Token System (v2.0)

The **Petra Design System** token package is built upon a **3-Layer Token Architecture** and **Component-Specific Schemes**.  
All tokens are derived from **`petra-tokens.json`** (the single source of truth) and compiled into SCSS via `scripts/generate-tokens.mjs`.

---

## 🔒 Immutable Source of Truth — `petra-tokens.json`

> [!CAUTION]
> **`petra-tokens.json` must NEVER be edited manually.**  
> This file is the authoritative export from **Figma** (via the design team's token pipeline). Any manual edits will be overwritten on the next Figma sync.
>
> **Allowed workflow:**
> 1. Designer updates tokens in Figma.
> 2. New `petra-tokens.json` is exported and committed.
> 3. `npm run generate` is run to regenerate all SCSS scheme files.
>
> If you need to change a token value, coordinate with the design team in Figma — not in this file.

---

## 📐 Schema Architecture Rules

> [!IMPORTANT]
> The following rules govern how CSS is written and generated for all scheme files (`schemes/color/`, `schemes/size/`, `schemes/style/`):
>
> ### Rule 1 — Schema-Scoped Changes
> CSS rules that belong to a specific scheme **must live inside that scheme's SCSS file**.  
> ❌ Do NOT place action-scheme shadow rules in `base.scss` or `state-styles.scss`.  
> ✅ Place them in `schemes/style/action.scss` (generated from `style-schemes.mjs`).
>
> ### Rule 2 — No Component Classes in Schemes
> Scheme selectors **must use only `data-*` attributes**. Component CSS class names (e.g. `.p-btn`, `.p-badge`) are **forbidden** inside scheme files.  
> ❌ `[data-style-scheme="action"], .p-btn { ... }`  
> ✅ `[data-style-scheme="action"][data-variant~="solid"] { ... }`
>
> ### Rule 3 — Short Selectors via Modern CSS
> Use **`:is()`** and **`:not(a, b, c)`** (selector list) to avoid repetitive chaining.  
> ❌ `[data-style-scheme="action"]:not([data-variant~="flat"]):not([data-variant~="outline"]):not([data-variant~="ghost"])`  
> ✅ `[data-style-scheme="action"]:not([data-variant~="flat"], [data-variant~="outline"], [data-variant~="ghost"])`
>
> ### Rule 4 — Variants Are Mutually Exclusive with `solid`
> `flat`, `outline`, `ghost`, and `text` are **base variants** — they replace `solid`, not supplement it.  
> A button must carry **exactly one** of: `solid | flat | outline | ghost | text` in its `data-variant`.  
> `rounded` and `sharp` are **modifier variants** and may be combined freely.

---

## 📁 Directory Structure

```text
petra-tokens/
├── petra-tokens.json          ← Figma Raw Export (Single Source of Truth)
├── tokens/                    ← [Modular Cleaned JSON Tokens]
│   ├── primitive.json         ← Layer 1 Raw Size, Colors, Weights
│   ├── semantic.json          ← Layer 2 Semantic Colors, Text, Leading, Radius, Border
│   └── schemes/               ← Layer 3 Component Specific Schemes
│       ├── colors.json        (action, field, feedback/badge, chip, toggle, content, divider, range)
│       ├── size.json          (basic, field, toggle, badge, otp)
│       └── style.json         (action, field, badge, chip, toggle, global, tab, stepper, pagination, ...)
│
├── primitive/index.scss       ← [Layer 1] Raw Variables (--p-size-*, --p-color-*)
├── semantic/index.scss        ← [Layer 2] Semantic Tokens (--p-colors-primary-default, ...)
│
├── schemes/                   ← [Layer 3] Component Specific Schemes
│   ├── color/                 (action, field, feedback/badge, chip, toggle, content, divider, range)
│   ├── size/                  (basic, field, toggle, badge, otp)
│   └── style/                 (action, field, badge, chip, toggle, global, tab, stepper, pagination, ...)
│
├── components/                ← Component Layout Styles (Layout only — no hardcoded colors)
│   ├── button.scss
│   ├── badge.scss
│   ├── chip.scss
│   ├── input-wrapper.scss
│   ├── checkbox.scss
│   ├── radio.scss
│   └── switch.scss
│
├── styles/
│   ├── style.scss             ← Main Entry Point (Imports all layers)
│   ├── sp-utilities.scss      ← Utility Classes (psz-*, spacing)
│   └── animations.scss        ← Global Animations
│
├── base.scss                  ← Global Base Rules (RTL/LTR, rounded/sharp, focus-visible)
├── state-styles.scss          ← Core Variant Styles (solid, flat, outline, text, ghost)
│
└── scripts/
    ├── clean-tokens-json.mjs  ← Cleans petra-tokens.json & splits into tokens/*.json
    └── generate-tokens.mjs    ← Reads tokens/*.json → Compiles SCSS Schemes
```

---

## 🏛️ 3-Layer Token Architecture

### Layer 1 — Primitive (`primitive/index.scss`)

Raw, foundational CSS variables defined on `:root`. This layer contains **no semantic meaning**:

```scss
:root {
  /* Sizes (size.N × 4px) */
  --p-size-0:   0rem;      /* 0px   */
  --p-size-1:   0.25rem;   /* 4px   */
  --p-size-2:   0.5rem;    /* 8px   */
  --p-size-3:   0.75rem;   /* 12px  */
  --p-size-4:   1rem;      /* 16px  */
  --p-size-3-5: 0.875rem;  /* 14px  */
  --p-size-4-5: 1.125rem;  /* 18px  */
  /* ... up to size-32 */

  /* Base Palette Colors */
  --p-color-blue-100: #e6efff;
  --p-color-blue-500: #4985ff;
  --p-color-blue-600: #1b62ff;
  --p-color-gray-400: #9ca3af;
  --p-color-white-default: #ffffff;
  /* ... other base colors */
}
```

---

### Layer 2 — Semantic (`semantic/index.scss`)

Semantic variables on `:root` referencing Layer 1 primitives:

```scss
:root {
  /* Primary Colors */
  --p-colors-primary-muted:   var(--p-color-blue-100);
  --p-colors-primary-faint:   var(--p-color-blue-300);
  --p-colors-primary-default: var(--p-color-blue-500);
  --p-colors-primary-deep:    var(--p-color-blue-600);  /* for hover */
  --p-colors-primary-on:      var(--p-color-white-default);

  --p-colors-disabled-default: var(--p-color-gray-400);
  --p-colors-disabled-on:      var(--p-color-white-default);
  --p-colors-disabled-muted:   var(--p-color-gray-300);
  --p-colors-disabled-subtle:  var(--p-color-gray-100);

  --p-colors-surface-default:    var(--p-color-white-default);
  --p-colors-surface-on:         var(--p-color-gray-700);
  --p-colors-surface-variant:    var(--p-color-gray-50);
  --p-colors-surface-on-variant: var(--p-color-gray-600);

  /* Typography */
  --p-text-xs:   var(--p-size-3);      /* 12px */
  --p-text-sm:   var(--p-size-3-5);    /* 14px */
  --p-text-base: var(--p-size-4);      /* 16px */
  --p-text-lg:   var(--p-size-4-5);    /* 18px */
  --p-text-xl:   var(--p-size-5);      /* 20px */

  /* Border Radii */
  --p-radius-0px:   0rem;
  --p-radius-4px:   0.25rem;
  --p-radius-8px:   0.5rem;
  --p-radius-12px:  0.75rem;
  --p-radius-full:  624.9375rem;
}
```

---

## 🏷️ Standard Variable Naming Conventions (CSS Custom Properties)

All component SCSS files (`components/*.scss`) must consume **standardized CSS custom properties** generated by the 3-Layer Token Architecture (`primitive`, `semantic`, and `schemes`). Non-standard or component-prefixed variable names (e.g. `--p-field-label-helper-color` or `--p-field-bg-color`) are strictly forbidden.

### Standard Variable Reference Table:

| CSS Variable Name | Role / Purpose | Example Value |
|---|---|---|
| `--p-bg` | Component Background Color | `var(--p-colors-surface-variant)` |
| `--p-text` | Main Text Color | `var(--p-colors-surface-on)` |
| `--p-label-color` | Label Text Color | `var(--p-colors-surface-on)` |
| `--p-helper-color` | Helper Text, Sub-text, and Counter Color | `var(--p-colors-neutral-default)` |
| `--p-placeholder-color` | Placeholder Text Color | `var(--p-colors-neutral-default)` |
| `--p-border-color` | Container Border Color | `var(--p-colors-neutral-faint)` |
| `--p-font-size` | Font Size | `var(--p-text-base)` |
| `--p-font-weight` | Font Weight | `var(--p-weight-medium)` (`500`) |
| `--p-leading` | Line Height | `var(--p-leading-24px)` |
| `--p-sub-text-size` | Sub-text / Helper Font Size | `var(--p-text-xs)` |
| `--p-sub-leading` | Sub-text / Helper Line Height | `var(--p-leading-16px)` |
| `--p-padding-x` | Horizontal Padding | `var(--p-size-4)` |
| `--p-padding-y` | Vertical Padding | `var(--p-size-2)` |
| `--p-gap` | Element Spacing / Gap | `var(--p-size-2)` |
| `--p-radius` | Border Radius | `var(--p-radius-8px)` |
| `--p-icon-size` | Icon Size | `var(--p-size-5)` |
| `--p-shadow` | Box Shadow | `var(--p-shadow-default)` |
| `--p-shadow-hover` | Hover Box Shadow (Basic Size Scheme) | `var(--p-shadow-sm)` (`xs`/`sm`) / `var(--p-shadow-default)` (`base`/`md`/`lg`/`xl`) |
| `--p-min-height` | Element Min/Fixed Height | `var(--p-size-10)` |
| `--p-min-width` | Element Min/Fixed Width | `0` |

> [!NOTE]
> **Hover Shadow Token (`--p-shadow-hover`)**:  
> `--p-shadow-hover` is dynamically set by `data-size-scheme="basic"` based on `data-size` (`xs` and `sm` map to `var(--p-shadow-sm)`, while `base`, `md`, `lg`, and `xl` map to `var(--p-shadow-default)`). Interactive components such as **Button** and **Input** opt-in to hover elevation using `box-shadow: var(--p-shadow-hover)`. Components that do not require hover shadows do not consume this variable.

---

### Layer 3 — Schemes (`schemes/`)

Component-specific schemes built from Figma token paths using the standard naming structure:

```text
kind / scheme / variant? / group? / state? / prop
```

#### 🧩 Figma Token Path Structure:

- **`kind`** (Scheme Kind):
  - `colors` → **Color Scheme** (`schemes/color/*.scss`)
  - `size` → **Size Scheme** (`schemes/size/*.scss`)
  - `style` → **Style Scheme** (`schemes/style/*.scss`)
- **`scheme`** (Scheme Name): Name of the scheme, e.g. `action`, `field`, `badge`, `chip`, `toggle`, `global`, etc. (defaults to `default` if omitted).
- **`variant`** (Visual Variant - Optional): Visual variant name, e.g. `outline`, `solid`, `sharp`, `rounded`, `switch`, etc.
- **`group`** (Group / Sub-part - Optional):
  - In `color` kind: Color group (`primary`, `secondary`, `error`, `success`, `info`, `warning`, `neutral`, `common`).
  - In `size` kind: Size group (`sm`, `base`, `lg`, `xl`).
  - In `style` kind: Sub-part / sub-group (`menu`, `scroll`, `card`, `item`, etc.).
- **`state`** (Interaction / Visual State - Optional): Interaction/visual state (`hover`, `active`, `disabled`, `filled`, `error`, `success`, `selected`). Omitted means default/base state.
- **`prop`** (Target Property - Required): Target CSS property (`bg`, `text`, `border`, `icon`, `label-text`, `padding-x`, `padding-y`, `gap`, `radius`, `leading`, `sub-text`, etc.).

---

#### ⚡ Scheme Roles & Override Priority:

| Scheme | DOM Attribute | Role | Priority |
|---|---|---|---|
| **Color Scheme** | `data-color-scheme` | Base color mapping (`bg`, `text`, `border`, `label`) based on `data-color` | Base Layer 3 |
| **Size Scheme** | `data-size-scheme` | Base layout (`padding`, `gap`, `font-size`, `height`) based on `data-size` | Base Layer 3 |
| **Style Scheme** | `data-style-scheme` | **High-priority overrides** for specific variants, sub-parts, or special states | **Highest Override (`Style > Color/Size`)** |

> [!IMPORTANT]
> **Key Design Rule for `style` Schemes:**  
> `style` schemes do **not** re-define all properties for a component. They strictly specify **only the properties that differ** for specific variants or states (e.g. in `field`, default background and border are set by `color/field`, while border and background overrides for `outline` variant are specified in `style/field/outline/...`).

---

## 📋 Comprehensive Component Scheme Matrix

| Component | Color Scheme | Size Scheme | Style Scheme | Supported Colors |
|---|---|---|---|---|
| **Button** | `action` | `basic` | `action` | primary, secondary, error, success, info, warning, neutral |
| **Badge / Patch** | `feedback` | `badge` | `badge` | primary, secondary, error, success, info, warning, neutral |
| **Chip** | `feedback` (color) | `badge` | `chip` | — (fixed chip color, not color-based) |
| **Input Wrapper** | `field` | `field` → `basic` | `field` | neutral (default) |
| **Base Text Input** | `field` | `field` → `basic` | `field` | neutral |
| **Input** | `field` | `field` → `basic` | `field` | neutral |
| **Textarea** | `field` | `field` → `basic` | `field` | neutral |
| **OTP Input** | `field` | `otp` | `otp` | — |
| **Checkbox** | `toggle` | `toggle` | `toggle` | primary (selected state) |
| **Radio** | `toggle` | `toggle` | `toggle` | primary (selected state) |
| **Switch** | `toggle` | `toggle` | `toggle` | primary (on state) |
| **Divider** | `divider` | — (style scheme only) | `divider` | — |
| **Tab** | — | — | `tab` | primary (selected) |
| **Pagination** | — | — | `pagination` | primary, secondary, ... (selected) |
| **Stepper** | — | — | `stepper` | — |
| **Progress Bar** | — | — | `progress` | primary (fill color) |
| **Circular Progress** | — | — | `circular-progress` | — |
| **Avatar** | — | — | — | — (no scheme) |
| **Accordion** | — | — | — | — (no scheme) |
| **Card** | `content` | — | `content` | — |
| **Toast** | — | — | — | — (no scheme) |
| **Dialog** | — | — | — | — (no scheme) |
| **Select / Combobox** | `field` | `field` → `basic` | `field` | neutral |

---

## 📋 Scheme Details from `petra-tokens.json`

### `colors.action` ← `schemes/color/action.scss`

```json
"action": {
  "disabled": { "bg": "disabled.default", "text": "disabled.on" },
  "primary":  { "bg": "primary.default", "text": "primary.on",
                "hover": { "bg": "primary.deep", "text": "primary.on" } },
  "secondary":{ "bg": "secondary.default", "text": "secondary.on",
                "hover": { "bg": "secondary.deep" } },
  "error":   { "bg": "error.default", "text": "error.on",
                "hover": { "bg": "error.deep" } },
  ...
}
```

### `colors.badge` ← `schemes/color/badge.scss` (and feedback)

```json
"badge": {
  "primary":   { "bg": "primary.default",   "on": "primary.on" },
  "secondary": { "bg": "secondary.default", "on": "secondary.on" },
  "success":   { "bg": "success.default",   "on": "success.on" },
  "error":    { "bg": "error.default",    "on": "error.on" },
  "info":      { "bg": "info.default",      "on": "info.on" },
  "warning":   { "bg": "warning.default",   "on": "warning.on" },
  "neutral":   { "bg": "neutral.default",   "on": "neutral.on" }
}
```

### `colors.chip` ← `schemes/color/chip.scss`

```json
"chip": {
  "bg":   "surface.default",
  "text": "surface.on-variant",
  "icon": "neutral.base",
  "disable": { "bg": "surface.default", "text": "disabled.default", "icon": "neutral.faint" }
}
```

### `style.chip` ← `schemes/style/chip.scss`

```json
"chip": {
  "outline": {
    "bg": "surface.variant", "text": "surface.on-variant", "border": "neutral.soft",
    "hover": { "bg": "surface.default", "border": "surface.default" },
    "disable": { "bg": "disabled.subtle", "text": "disabled.default", "border": "disabled.muted" }
  }
}
```

---

## 🏗️ Interactive State Architecture

> [!IMPORTANT]
> ### Key Principle
>
> | State | Mechanism | Explanation |
> |---|---|---|
> | `disabled` | `[data-state="disabled"]` | Received from JS — CSS applies styles |
> | `loading` | `[data-state="loading"]` | Handled like disabled |
> | `hover` | `:hover` pseudo-class | **Native CSS — Zero JS** |
> | `active` | `:active` pseudo-class | **Native CSS — Zero JS** |
> | `focus` | `:focus-visible` pseudo-class | **Native CSS — Zero JS** |
>
> ❌ **Never** use `data-state="hover"` or `data-state="active"`.

---

## 📋 7 Standard DOM `data-*` Attributes

| # | Attribute | Role | Valid Values |
|---|---|---|---|
| 1 | `data-color-scheme` | Color scheme group | `action`, `field`, `badge`, `feedback`, `toggle`, `content`, `divider`, `range` |
| 2 | `data-size-scheme` | Size scheme group | `basic`, `badge`, `toggle`, `field`, `otp` |
| 3 | `data-style-scheme` | Override and special effects | `action`, `field`, `chip`, `badge`, `toggle`, `tab`, `pagination`, `stepper`, `progress`, `circular-progress`, `divider`, `content`, `global`, `state`, `otp` |
| 4 | `data-variant` | Visual variant (combinable) | `solid`, `outline`, `text`, `ghost`, `flat`, `rounded`, `sharp` |
| 5 | `data-color` | Primary color | `primary`, `secondary`, `error`, `success`, `info`, `warning`, `neutral`, `transparent` |

> [!IMPORTANT]
> **Deprecation of Legacy Size Classes (`.psz-*`)**:  
> Legacy size class selectors (such as `.psz-sm`, `.psz-md`, `.psz-lg`, `.psz-xl`) in component layout SCSS files are deprecated and removed. All component size rules must target DOM attribute selectors exclusively: `[data-size="sm"]`, `[data-size="md"]`, `[data-size="base"]`, `[data-size="lg"]`, and `[data-size="xl"]`.

---

## 🔄 Cascade Priority

```text
[data-style-scheme] > [data-variant]:hover/:active > [data-state="disabled"] >
[data-color] > [data-color-scheme] > [data-size] > [data-size-scheme] > :root
```

---

## 🚀 HTML Examples

### Button:
```html
<button
  data-color-scheme="action"
  data-size-scheme="basic"
  data-style-scheme="action"
  data-size="base"
  data-color="primary"
  data-variant="solid rounded"
  class="p-btn"
>
  Click Me
</button>

<!-- Disabled Button -->
<button data-color-scheme="action" data-size-scheme="basic"
  data-style-scheme="action" data-size="base" data-color="primary"
  data-variant="solid" data-state="disabled" disabled class="p-btn">
  Disabled
</button>
```

### Badge:
```html
<span
  data-color-scheme="feedback"
  data-size-scheme="badge"
  data-style-scheme="badge"
  data-color="success"
  data-variant="solid rounded"
  class="p-badge"
>
  Active
</span>
```

### Chip:
```html
<div
  data-color-scheme="feedback"
  data-size-scheme="badge"
  data-style-scheme="chip"
  data-variant="outline rounded"
  class="p-chip"
>
  Tag
</div>
```

### Input:
```html
<div
  data-color-scheme="field"
  data-size-scheme="basic"
  data-style-scheme="field"
  data-size="base"
  data-variant="outline rounded"
  data-state="base"
  class="p-input-wrapper"
>
  <input class="p-input" placeholder="Enter text..." />
</div>
```

---

## ⚙️ Universal Token Generator Engine (`generate-tokens.mjs` & `schema-extractor.mjs`)

The single source of truth for all design system tokens is **`petra-tokens.json`**.  
The universal token parser **`scripts/converters/schema-extractor.mjs`** dynamically extracts tokens according to the Figma Path Formula:

```text
kind / scheme / variant? / group? / state? / prop
```

### 🎯 DOM Element Targeting & Ambiguity Clarification Policy:

- **100% Extraction Mandate**: Every single token defined under a component scheme (e.g. `field`, `action`, `toggle`, etc.) in `petra-tokens.json` MUST be extracted into SCSS custom properties. No token property may be skipped or ignored.
- **Root & Descendant Scoping**: Attribute schemes (`data-color-scheme`, `data-size-scheme`, `data-style-scheme`) are set on component root elements (e.g. `.p-input-wrapper`). Container properties (background, border, border-size, radius, padding) also target inner elements (e.g. `.p-input-inner-wrapper`) via descendant selectors (`[data-style-scheme="field"] [data-variant~="outline"]`).
- **Mandatory Ambiguity Clarification**: If any token property leaf (such as `placeholder-text`, `label-helper`, `option-text`, `menu`, `scroll`, etc.) has an uncertain or ambiguous DOM target location, the AI developer MUST proactively ask the user to clarify its exact target element in the component structure BEFORE finalizing SCSS variable assignments.

The script automatically generates 100% of the following SCSS files:

1. **`primitive/index.scss`**: Layer 1 raw variables (sizes, colors, font weights)
2. **`semantic/index.scss`**: Layer 2 semantic variables (semantic color names, typography, radii)
3. **`schemes/`**: Layer 3 component-specific schemes (`color/`, `size/`, `style/`)

> [!IMPORTANT]
> Directories `primitive`, `semantic`, and `schemes` are automatically generated and should NOT be edited manually. Any modifications must be made in `petra-tokens.json`, followed by running the generator script.

---

## 🛠️ Development Workflow

```bash
# 1. Clean raw token JSON from Figma/designer ($type, $description, $scopes metadata removal)
npm run clean:json

# 2. Run the token generator to regenerate SCSS files
npm run generate

# 3. Build the package
npm run build

# 4. Run tests
npm run test
```

---

## ⚠️ CSS Bridge Variables (Inter-layer Bridge)

These CSS custom properties are assigned by Layer 3 schemes and consumed by `state-styles.scss`:

| CSS Variable | Role | Where Assigned |
|---|---|---|
| `--p-bg` | Base background | color scheme |
| `--p-text` | Base text color | color scheme |
| `--p-border-color` | Base border color | style scheme |
| `--p-bg-hover` | `:hover` background | color/style scheme |
| `--p-text-hover` | `:hover` text color | color/style scheme |
| `--p-border-color-hover` | `:hover` border color | style scheme |
| `--p-bg-active` | `:active` background | style scheme |
| `--p-padding-x` | Horizontal padding | size scheme |
| `--p-padding-y` | Vertical padding | size scheme |
| `--p-gap` | Inter-element gap | size scheme |
| `--p-radius` | Border radius | size scheme |

---

## 🛠️ Scripts & Converters Reference

Detailed purpose and function of each script in `scripts/` and `scripts/converters/`:

| Script File | Purpose & Role | Description & Functionality | Output File(s) |
|---|---|---|---|
| **`scripts/generate-tokens.mjs`** | Main Orchestrator | Reads `petra-tokens.json`, builds flat token maps, and invokes all scheme converters. | `primitive/index.scss`, `semantic/index.scss`, `schemes/**/index.scss` |
| **`scripts/clean-tokens-json.mjs`** | JSON Sanitizer | Cleans raw Figma exports by stripping non-essential metadata (`$type`, `$description`, `$scopes`). Reduces file size ~54%. | `petra-tokens.json` |
| **`scripts/converters/schema-extractor.mjs`** | Universal Scheme Engine | Universal token parser using path formula `kind/scheme/variant?/group?/state?/prop`. Supports descendant scoping. | Core Engine |
| **`scripts/converters/basic-size.mjs`** | Basic Size Converter | Dynamically parses `size.basic` tokens from JSON for Buttons, Inputs, Fields, generating responsive breakpoint selectors. | `schemes/size/basic.scss` |
| **`scripts/converters/color-schemes.mjs`** | Color Scheme Converter | Generates Layer 3 component color schemes (`action`, `field`, `badge`, `chip`, `toggle`, `content`, `divider`, `range`). | `schemes/color/*.scss` |
| **`scripts/converters/size-schemes.mjs`** | Size Scheme Converter | Generates Layer 3 component size schemes (`otp`, `toggle`, etc.). | `schemes/size/*.scss` |
| **`scripts/converters/style-schemes.mjs`** | Style Scheme Converter | Generates Layer 3 high-priority variant style schemes (`action`, `field`, `chip`, `toggle`, `tab`, etc.). | `schemes/style/*.scss` |
| **`scripts/converters/field.mjs`** | Field Color Helper | Provides base focus-ring and base color fallback rules for `field` input scheme. | Consumed by `color-schemes.mjs` |

