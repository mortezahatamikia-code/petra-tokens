# 🎨 Petra color system — CSS Variable Reference

This document explains every CSS custom property used by Petra’s color systems.  
Overriding these variables allows you to completely reshape the look and feel of components
without touching their internal code.

---

## 🧱 How It Works

Each color system lives inside a `[data-color-system="…"]` block.  
The properties are plain CSS variables; you can redefine them in your own stylesheet
by targeting the same attribute, for example:

```css
[data-color-system="action"] {
  --p-bg-color: hotpink;
}
```

All variables are consumed automatically by the component’s own CSS and by the global
`state-styles` layer, so a single change propagates through hover, active, disabled,
and different variants.

---

## 🚀 Action System (`data-color-system="action"`)

Used for buttons, icon buttons, and clickable chips.  
The logic applies high-contrast fills with clear feedback on hover and active.

### Base State (Solid variant)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `var(--p-intent-base)` | Background colour of the solid button. |
| `--p-text-color` | `var(--p-intent-fg)` | Text colour (usually white). |
| `--p-border-color` | `transparent` | Border colour (invisible by default). |

### Hover State

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color-hover` | `var(--p-intent-hover)` | Background on hover (a shade darker). |
| `--p-text-color-hover` | `var(--p-intent-fg)` | Text colour on hover. |
| `--p-border-color-hover` | `transparent` | Border colour on hover. |

### Active / Pressed State

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color-active` | `var(--p-intent-active)` | Background when the button is being pressed. |
| `--p-text-color-active` | `var(--p-intent-fg)` | Text colour when pressed. |
| `--p-border-color-active` | `transparent` | Border colour when pressed. |

### Outline Variant (`data-variant="outline"`)

Overrides the solid tokens inside the component.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `transparent` | Transparent background. |
| `--p-text-color` | `var(--p-intent-base)` | Text matches the intent colour. |
| `--p-border-color` | `var(--p-intent-base)` | Border matches the intent colour. |
| `--p-bg-color-hover` | `var(--p-intent-base)` | Background fills with intent colour on hover. |
| `--p-text-color-hover` | `var(--p-neutral-0)` | Text becomes white on hover. |
| `--p-border-color-hover` | `var(--p-intent-base)` | Border stays intent colour. |
| `--p-bg-color-active` | `var(--p-intent-base)` | Background fills with intent colour when pressed. |
| `--p-text-color-active` | `var(--p-neutral-0)` | Text white when pressed. |
| `--p-border-color-active` | `var(--p-intent-base)` | Border stays intent colour. |

### Text / Ghost Variant (`data-variant="text"`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `transparent` | No background. |
| `--p-text-color` | `var(--p-intent-text)` | Text uses the intent’s “text” tone. |
| `--p-border-color` | `transparent` | No border. |
| `--p-bg-color-hover` | `var(--p-intent-light)` | Light tint appears on hover. |
| `--p-text-color-hover` | `var(--p-intent-text-hover, var(--p-intent-hover))` | Text darkens on hover. |
| `--p-border-color-hover` | `transparent` | No border on hover. |
| `--p-bg-color-active` | `transparent` | No background when pressed. |
| `--p-text-color-active` | `var(--p-intent-hover)` | Text darkens when pressed. |
| `--p-border-color-active` | `transparent` | No border when pressed. |

### Transparent Colour (`data-color="transparent"`)

When the `transparent` colour is used, all above tokens are reset to neutral tones.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `transparent` | |
| `--p-text-color` | `var(--p-neutral-500)` | Neutral grey text. |
| `--p-border-color` | `transparent` | |
| `--p-bg-color-hover` | `transparent` | |
| `--p-text-color-hover` | `var(--p-neutral-800)` | Darker text on hover. |
| `--p-border-color-hover` | `transparent` | |
| `--p-border-color` (outline) | `var(--p-neutral-500)` | Outline gets a neutral border. |
| `--p-text-color` (outline) | `var(--p-neutral-500)` | Text becomes neutral in outline mode. |

---

## 🏷️ Feedback System (`data-color-system="feedback"`)

Used for badges, alerts, toasts, and status indicators.  
Prioritises tinted backgrounds with high-contrast text.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `var(--p-intent-light)` | Tinted background (e.g., light green for success). |
| `--p-bg-color-hover` | `var(--p-intent-light)` | Same as background – no change on hover. |
| `--p-text-color` | `var(--p-intent-text)` | High-contrast text (dark green for success). |
| `--p-border-color` | `var(--p-intent-border)` | Border colour (often matches intent). |

### Neutral Override

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `var(--p-neutral-0)` | White background for neutral badges. |
| `--p-bg-color-hover` | `var(--p-neutral-0)` | Stays white on hover. |
| `--p-text-color` | `var(--p-neutral-500)` | Grey text. |
| `--p-border-color` | `var(--p-neutral-200)` | Light border. |

### Outline Variant (non‑neutral / non‑secondary)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `var(--p-bg-color-soft)` | Soft tinted background (same as light). |
| `--p-bg-color-hover` | `var(--p-bg-color-soft)` | No change on hover. |

---

## 📝 Field System (`data-color-system="field"`)

Used for inputs, textareas, selects, and their wrappers.  
Low-friction, often with light backgrounds and prominent focus rings.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `var(--p-neutral-100)` | Light grey background. |
| `--p-text-color` | `var(--p-neutral-800)` | Dark text for readability. |
| `--p-border-color` | `var(--p-neutral-300)` | Subtle border. |
| `--p-bg-color-hover` | `var(--p-bg-color)` | Background unchanged on hover. |
| `--p-border-color-hover` | `var(--p-border-color)` | Border unchanged on hover. |
| `--p-border-color-focus` | `var(--p-intent-base)` | Border colour on focus (e.g., blue ring). |
| `--p-ring-color-focus` | `var(--p-intent-light)` | Box‑shadow ring colour on focus. |
| `--p-bg-color-disabled` | `var(--p-neutral-100)` | Background when disabled. |
| `--p-text-color-disabled` | `var(--p-neutral-400)` | Text colour when disabled. |
| `--p-border-color-disabled` | `var(--p-neutral-200)` | Border colour when disabled. |
| `--p-text-color-muted` | `var(--p-neutral-500)` | Helper / counter text colour. |
| `--p-text-color-muted-disabled` | `var(--p-neutral-300)` | Helper / counter text when disabled. |

### Validation / Coloured State

When a field has `data-color` (e.g., `danger`, `success`) the following override the base tokens:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `var(--p-intent-light)` | Light tinted background. |
| `--p-border-color` | `var(--p-intent-base)` | Intent-coloured border. |
| `--p-border-color-focus` | `var(--p-intent-base)` | Focus border matches intent. |
| `--p-border-color-hover` | `var(--p-intent-base)` | Hover border matches intent. |
| (text colour) | `var(--p-intent-text)` | All text inherits the intent’s contrast colour, except the label stays neutral. |

### Sub‑part Variables

Instead of styling parts directly, the field system exposes specific variables mapped to the child elements:

| Selector | Property | Variable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `[data-part="label"]` | `color` | `--p-field-label-color` | `var(--p-text-color)` | Label colour. |
| `[data-part="label-helper"]` | `color` | `--p-field-label-helper-color` | `var(--p-text-color-muted)` | Small text beside the label. |
| `[data-part="counter"]` | `color` | `--p-field-counter-color` | `var(--p-text-color-muted)` | Character counter colour. |
| `[data-part="helper"]` | `color` | `--p-field-helper-color` | `var(--p-text-color-muted)` | Help text below the input. |
| `[data-part="container"]` | `border-color` | `--p-field-container-border-color` | `var(--p-border-color)` | Input wrapper border. |

These variables are overridden in states like `[data-disabled]` or when specific intents are used.

### Outline Variant

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color-hover` | `transparent` | Prevents background changes on hover. |

---

## 🔘 Toggle System (`data-color-system="toggle"`)

Covers Checkbox, Radio, and Switch.  
Unifies their colour logic under a single system.

### Common Tokens

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `transparent` | Background of checkbox/radio box (unchecked). |
| `--p-text-color` | `var(--p-neutral-800)` | Label text colour. |
| `--p-border-color` | `var(--p-neutral-500)` | Border of checkbox/radio box. |
| `--p-toggle-indicator-color` | `var(--p-intent-base)` | Colour of the checkmark / dot / knob. |
| `--p-border-color-hover` | `var(--p-intent-base)` | Border on hover. |
| `--p-ring-color-focus` | `var(--p-intent-light)` | Focus ring colour. |

### Checked / Indeterminate State

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color` | `var(--p-intent-base)` | Background fills with intent colour. |
| `--p-border-color` | `var(--p-intent-base)` | Border matches intent. |
| `--p-text-color` | `var(--p-intent-base)` | Label becomes intent-coloured (checked only). |
| `--p-toggle-indicator-color` | `var(--p-neutral-0)` | Indicator turns white. |

### Disabled State

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--p-bg-color-disabled` | `var(--p-neutral-300)` | Box background (if checked) |
| `--p-border-color-disabled` | `var(--p-neutral-300)` | Box border |
| `--p-text-color-disabled` | `var(--p-neutral-400)` | Label text |
| `--p-toggle-indicator-color-disabled` | `var(--p-neutral-0)` | Indicator colour (white) |
| `--p-bg-color` (disabled, checked) | `var(--p-neutral-400)` | Box background when disabled & checked |

### Switch‑Specific Overrides

Switch uses `[data-part="switch-wrapper"]` to fine‑tune its track and knob colours.

| Condition | Variable | Default |
| :--- | :--- | :--- |
| Off, not disabled | `--p-bg-color` | `var(--p-neutral-100)` |
| Not disabled | `--p-toggle-indicator-color` | `var(--p-neutral-0)` (knob stays white) |
| Disabled | `--p-bg-color` | `var(--p-neutral-200)` |
| Disabled & checked | `--p-bg-color` | `var(--p-primary-700)` |

### Part Variables and Mappings

These variables are mapped to the child elements to allow point-specific overrides:

| Selector | Property | Variable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `[data-part="checkbox-box"]` | `background-color` / `border-color` | `--p-checkbox-bg` / `--p-checkbox-border-color` | `var(--p-bg-color)` / `var(--p-border-color)` | Checkbox box. |
| `[data-part="radio-box"]` | `background-color` / `border-color` | `--p-radio-bg` / `--p-radio-border-color` | `var(--p-bg-color)` / `var(--p-border-color)` | Radio box. |
| `[data-part="checkbox-label"]` | `color` | `--p-checkbox-label-color` | `var(--p-text-color)` | Label colour. |
| `[data-part="radio-label"]` | `color` | `--p-radio-label-color` | `var(--p-text-color)` | Label colour. |
| `[data-part="checkbox-tic"]` | `stroke` | `--p-checkbox-tic-color` | `var(--p-toggle-indicator-color)` | Checkmark colour. |
| `[data-part="checkbox-mixed-line"]` | `background-color` | `--p-checkbox-mixed-line-color` | `var(--p-toggle-indicator-color)` | Indeterminate line. |
| `[data-part="radio-dot"]` | `background-color` | `--p-radio-dot-color` | `var(--p-toggle-indicator-color)` | Radio dot. |
| `[data-part="radio-box"][data-state="checked"][data-variant="thick"]` | `box-shadow` | `--p-radio-thick-shadow-color` | `var(--p-toggle-indicator-color)` | Thick variant ring. |
| `[data-part="switch-track"]` | `background-color` | `--p-switch-track-bg` | `var(--p-bg-color)` | Switch track. |
| `[data-part="switch-bg-inner"]` | `background-color` | `--p-switch-bg-inner-bg` | `var(--p-bg-color)` | Switch sliding background. |
| `[data-part="switch-indicator"]` | `background-color` | `--p-switch-indicator-bg` | `var(--p-toggle-indicator-color)` | Switch knob. |

### Focus Visible

| Selector | Property | Variable | Default |
| :--- | :--- | :--- | :--- |
| `[data-part="checkbox-box"]` | `border-color` / `box-shadow` | `--p-checkbox-border-color-focus` / `--p-checkbox-shadow-focus` | `var(--p-border-color-hover)` / `0 0 0 2px var(--p-ring-color-focus)` |
| `[data-part="radio-box"]` | `border-color` / `box-shadow` | `--p-radio-border-color-focus` / `--p-radio-shadow-focus` | `var(--p-border-color-hover)` / `0 0 0 2px var(--p-ring-color-focus)` |
| `[data-part="switch-track"]` | `border-color` / `box-shadow` | `--p-switch-border-color-focus` / `--p-switch-shadow-focus` | `var(--p-border-color-hover)` / `0 0 0 2px var(--p-ring-color-focus)` |

---

## 🛠 Customising an color system

1. In your own stylesheet, target the interaction attribute:
   ```css
   [data-color-system="action"] {
     --p-bg-color: teal;
     --p-text-color: white;
   }
   ```
2. Variants are overridden with the `data-variant` selector inside the same block:
   ```css
   [data-color-system="action"] [data-variant="outline"] {
     --p-bg-color: transparent;
     --p-border-color: teal;
   }
   ```
3. For state‑specific overrides, you can redefine the `-hover`, `-active`, `-disabled` tokens similarly.

All components that use this color system will automatically pick up the new values
without any further code changes.

---

## 📦 Where to Go Next

- **Intent Layer**: the `--p-intent-*` variables are defined in `tokens/intent.scss` and can be themed globally.
- **Size Systems**: modify dimensions by overriding variables in `[data-size-system="…"]` blocks (see separate documentation).

For any questions, check the main **Token System Documentation** or open an issue on GitHub.
