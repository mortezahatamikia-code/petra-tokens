# Token Architecture & System (Technical Deep Dive)

This document explains the internal mechanics of the `petra-ui` token system (`Base` → `Intent` → `Color System`). It is designed for engineers contributing to the core library or creating advanced custom components.

---

## 🏗 The 3-Layer Architecture

The system is built to solve a specific problem: **"Semantic conflict."**  
*Button Disabled* needs to be **Dark** (Gray-300).  
*Input Disabled* needs to be **Light** (Gray-100).  
*Both* are "Disabled". How do we share logic without styling quirks?

We solve this with a 3‑layer abstraction, now powered by a single set of **generic state tokens** and a **centralized state‑styles layer**.

### Layer 1: Base Variables (The "Palette")
**Location**: `src/assets/css/style.scss` & `tokens/base.scss`  
**Responsibility**: Raw Values only. No meaning.  
*   Defines: `--p-primary-500`, `--p-neutral-100`.  
*   *Developer Action*: Rarely touch this unless changing the global brand colors.

### Layer 2: Intent System (The "Meaning")
**Location**: `src/assets/css/tokens/intent.scss`  
**Responsibility**: Mapping a high-level *intent* (Primary, Success) to abstract *slots* (`base`, `light`, `text`).

**The Mixin (`@mixin apply-intent-variables`)**:
This SCSS mixin is the engine. It takes a palette color and assigns it to generic intent variables:
```scss
--p-intent-base:  [Main Color]   (e.g., Primary-500)
--p-intent-light: [Tint Color]   (e.g., Primary-100)
--p-intent-text:  [Contrast Color] (e.g., White or Primary-Dark)
```

**Why this matters**: Components never ask for "Primary". They ask for "Intent Base". This allows a component to switch from Primary to Danger just by changing the data attribute, without changing its internal CSS.

### Layer 3: Color Systems (The "Context")
**Location**: `src/assets/css/tokens/color-systems/*.scss`  
**Responsibility**: Resolving the Semantic Conflict. Each color system decides **what values** to assign to a small set of **generic state tokens** (`--p-bg-color`, `--p-text-color`, `--p-border-color` and their `-hover`, `-focus`, `-active`, `-disabled` variants). The actual application of these tokens to CSS properties is done by **`state-styles.scss`**, a global style layer that targets elements based on their `data-variant` attribute. This replaces the old approach where each variant had its own set of ad‑hoc tokens and a separate `variants.scss` file.

**The State Tokens (defined in `state-tokens.scss` with sensible defaults):**
- `--p-bg-color`, `--p-text-color`, `--p-border-color`
- `--p-bg-color-hover`, `--p-text-color-hover`, `--p-border-color-hover`
- `--p-bg-color-focus`, `--p-text-color-focus`, `--p-border-color-focus`
- `--p-bg-color-active`, `--p-text-color-active`, `--p-border-color-active`
- `--p-bg-color-disabled`, `--p-text-color-disabled`, `--p-border-color-disabled`

**How it works together:**  
color systems define the token values for each context (action, field, …).  
`state-styles.scss` consumes those tokens and writes the actual `background`, `color`, `border-color` rules for `[data-variant="solid"]`, `[data-variant="outline"]`, and `[data-variant="text"]`, including their `:hover`, `[data-active]`, and `[data-disabled]` states.  
Additionally, each color system may directly style its child components via `data-part` selectors (e.g., `[data-part="checkbox-box"]`), keeping the component CSS completely free of colour logic.

#### System A: Action (`data-color-system="action"`)
*   **For**: Buttons, IconButtons, Clickable Chips.
*   **Logic**: High contrast.
    *   Solid (default): `--p-bg-color: var(--p-intent-base)`, `--p-text-color: var(--p-intent-fg)`.
    *   Outline: overrides tokens to transparent background, intent‑coloured text/border.
    *   Text: overrides tokens to transparent background, subtle text, light hover background.
    *   **Disabled**: Uses Dark Gray tokens to clearly indicate “off” state.

#### System B: Field (`data-color-system="field"`)
*   **For**: Inputs, TextAreas, Selects.
*   **Logic**: Low friction.
    *   `--p-bg-color`: `neutral-100` (Subtle).
    *   `--p-border-color-focus`: `--p-intent-base`.
    *   **Disabled**: Uses Light Gray tokens, keeping forms clean.
    *   Sub‑elements like `label`, `helper`, `counter` are styled directly via `[data-part="…"]` selectors inside the color system.

#### System C: Feedback (`data-color-system="feedback"`)
*   **For**: Badges, Alerts, Toasts.
*   **Logic**: Information density.
    *   `--p-bg-color`: `--p-intent-light` (Tinted).
    *   `--p-text-color`: `--p-intent-text` (Dark text).
    *   **Reasoning**: A solid primary badge handles text poorly; a tinted badge is readable and "soft".

#### System D: Toggle (`data-color-system="toggle"`)
*   **For**: Checkbox, Radio, Switch.
*   **Logic**: Selection states.
    *   Unchecked: transparent background, neutral border.
    *   Checked / Indeterminate: intent‑coloured background, white indicator.
    *   **Disabled**: neutral grays.
    *   Directly controls `data-part` elements like `checkbox-box`, `radio-dot`, `switch-track`, etc.

---

## 📐 Sizing Bridge & Responsive System (`psz-sizes.scss`)

While color tokens manage visual aesthetics, layout sizing is managed by the responsive **bridge sizing system** in `tokens/psz-sizes.scss`.

### 1. Sizing Bridge Variables (`--psz-*`)
To decouple concrete component layouts from specific size scales, Petra-UI uses size-invariant CSS custom properties (bridge variables):
- `--psz-px`: Padding X
- `--psz-py`: Padding Y
- `--psz-gap`: Element gap
- `--psz-sub-ts`: Sub-text font-size
- `--psz-sub-tl`: Sub-text line-height
- `--psz-radius`: Border radius
- `--psz-src-size`: Base height/dimension

Components apply size-invariant classes like `.psz-p` (padding), `.psz-p-tight` (half padding), `.psz-p-slim` (quarter vertical padding), and `.psz-gap-tight` to style their layout, consuming these `--psz-*` custom properties.

### 2. Sizing Cascade Mixin
The engine of the sizing system is the `@mixin psz-size-class($size)` in `psz-sizes.scss`. When a size class like `.psz-md` or `.psz-sm` is applied:
1. It maps concrete design tokens (e.g., `--p-padding-x-md`, `--p-padding-y-md`) to the local bridge variables.
2. It sets the element's font-size, line-height, gap, height, and min-width.
3. Sub-components nested inside automatically inherit the updated bridge variables.

### 3. Responsive Layout Sizes
SCSS generates responsive variants (e.g., `sm:psz-xs`, `md:psz-lg`) inside standard CSS media queries (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`). This allows the layout sizes to cascade responsively on the client side natively.

---

## 👩‍💻 Developer Guide

### 1. How the Cascade Works
When you render `<Badge color="success" />`:

1.  **HTML**: Output is `<div data-color="success" data-color-system="feedback">`.
2.  **Intent Layer (`intent.scss`)**: The `[data-color="success"]` selector fires.
    *   It sets `--p-intent-base` = `Green-500`.
    *   It sets `--p-intent-light` = `Green-100`.
3.  **color system (`feedback.scss`)**: The `[data-color-system="feedback"]` selector fires.
    *   It reads the intent variables and sets the generic state tokens, e.g.:
        - `--p-bg-color: var(--p-intent-light)` (Green-100)
        - `--p-text-color: var(--p-intent-text)`
4.  **State Styles Layer (`state-styles.scss`)**: The `[data-variant="solid"]` rule (or the variant applied) takes those tokens and assigns `background`, `color`, `border` to the element. It also handles hover, active, and disabled pseudo‑classes by reading the corresponding `-hover`, `-active`, `-disabled` tokens.
5.  **Component Layer (`badge.scss`)**: No colour/style code. The component just sets layouts, sizes, etc. All visual states are handled by the color system and the global state styles.

### 2. How to Add a New Color (e.g., "Purple")
1.  **Define Palette**: Add `--p-purple-500`, `--p-purple-100` etc. in `style.scss`.
2.  **Register Intent**: In `intent.scss`, add:
    ```scss
    *[data-color="purple"] {
      @include apply-intent-variables(
        var(--p-purple-500), // base
        …,
        var(--p-purple-100), // light
        …
      );
    }
    ```
3.  **Use**: pass `color="purple"` to *any* component. It will automatically work as a Purple Button, Purple Input focus, or Purple Badge tint.

### 3. Debugging Issues
*   **"My component is black/white/invisible!"**
    *   Check `data-color-system`. If missing, the component won’t pick up any color system, and the generic state tokens might still be at their defaults (likely transparent or inherited).
    *   Check `data-color`. If missing, it may default to Neutral or Transparent.
*   **"My Disabled state looks wrong."**
    *   Look at which color system is active. Are you using `action` for an Input? You should be using `field`. Each system defines its own disabled tokens.

### 4. Overriding Locally
If you need a one-off override, you don't need to break the system. Just override the generic state tokens locally:
```tsx
<div style={{ "--p-bg-color": "red" }} className="p-badge ...">
```
Or via class:
```css
.my-custom-badge {
  --p-bg-color: pink;   /* Overrides the system's resolved bg */
}
```
Because `state-styles.scss` uses these CSS variables, any change to them will immediately affect all states (including hover, focus, etc.) consistently.

---

## 🧱 Core File Reference

| File | Purpose |
| :--- | :--- |
| `tokens/base.scss` | Global shape/disabled helpers. |
| `tokens/intent.scss` | Maps colors (Primary, Danger) to semantic slots. |
| `tokens/state-tokens.scss` | Default values for the generic state tokens. |
| `tokens/state-styles.scss` | Applies generic tokens to `data-variant` elements. |
| `tokens/color-systems/*.scss` | Defines token values per color system context and directly styles sub‑parts. |
| `tokens/psz-sizes.scss` | Generates size classes (`psz-{size}`) and responsive variants via bridge variables. |
| `tokens/size-systems/*.scss` | Responsive dimension overrides for specific component groups. |