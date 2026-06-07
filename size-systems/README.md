# 📏 Petra Size System — CSS Variable Reference

This document explains every CSS custom property and selector used by Petra’s size systems.  
Overriding these variables allows you to control dimensions, spacing, and internal layout
without touching component source code.

---

## 🧱 How It Works

Each size system is activated by adding a `data-size-system` attribute to a component
(or its wrapper). The rules inside the corresponding SCSS file then override global
spacing / dimension variables **only for that context**.

```html
<div data-size-system="toggle"> … </div>
```

All variables are consumed automatically by the components that belong to that system.

---

## 🗂️ Content System (`data-size-system="content"`)

Used for **Card** and similar content containers that need more generous internal spacing.

### Padding Overrides

| Variable | Default (global) | Value in Content | Description |
| :--- | :--- | :--- | :--- |
| `--p-padding-x-sm` | 0.375rem (6px) | **unchanged** | Horizontal padding XS/SM |
| `--p-padding-y-sm` | 0.25rem (4px) | **0.375rem (6px)** | Vertical padding XS/SM |
| `--p-padding-x-md` | 0.5rem (8px) | **unchanged** | Horizontal padding MD |
| `--p-padding-y-md` | 0.375rem (6px) | **0.5rem (8px)** | Vertical padding MD |
| `--p-padding-x-lg` | 0.625rem (10px) | **unchanged** | Horizontal padding LG |
| `--p-padding-y-lg` | 0.5rem (8px) | **0.625rem (10px)** | Vertical padding LG |
| `--p-padding-x-xl` | 0.625rem (10px) | **0.75rem (12px)** | Horizontal padding XL |
| `--p-padding-y-xl` | 0.5rem (8px) | **0.75rem (12px)** | Vertical padding XL |

*Horizontal paddings are unchanged; vertical paddings are increased for a more
spacious feel inside cards.*

### Gap Overrides

| Variable | Default (global) | Value in Content | Description |
| :--- | :--- | :--- | :--- |
| `--p-gap-sm` | 0.25rem (4px) | **0.5rem (8px)** | Gap XS/SM |
| `--p-gap-md` | 0.25rem (4px) | **0.625rem (10px)** | Gap MD |
| `--p-gap-lg` | 0.375rem (6px) | **0.75rem (12px)** | Gap LG |
| `--p-gap-xl` | 0.375rem (6px) | **1rem (16px)** | Gap XL |

---

## 🏷️ Feedback System (`data-size-system="feedback"`)

Used for **Badge**, **Alert**, and similar compact status indicators.  
Makes the component ultra‑compact by reducing padding and gap.

| Variable | Default (global) | Value in Feedback | Description |
| :--- | :--- | :--- | :--- |
| `--p-padding-x-md` | 0.5rem (8px) | **0.25rem (4px)** | Horizontal padding |
| `--p-padding-y-md` | 0.375rem (6px) | **0.25rem (4px)** | Vertical padding |
| `--p-gap-md` | 0.25rem (4px) | **0.25rem (4px)** | Gap (unchanged, but included for completeness) |

*Only the MD size tokens are overridden because badges typically use the MD size.*

---

## 🔘 Toggle System (`data-size-system="toggle"`)

Used for **Checkbox**, **Radio**, and **Switch**.  
The most complex size system because it must:

- Calculate the inner box size (`--psz-sub`) from the component height.
- Apply that size to boxes, knobs, and tracks.
- Handle the sliding animation of the switch knob.

### Core Derived Variable

| Variable | Formula | Description |
| :--- | :--- | :--- |
| `--psz-sub` | `calc((var(--psz-src-size) / 2) - 0.25rem)` | Sub‑size used for checkbox box, radio circle, and switch knob. |

`var(--psz-src-size)` is the component height, provided by the global `psz‑{size}` utility
(e.g., `psz‑md` sets `--psz-src-size` to `var(--p-size-md)`, which is 40px).  
So for MD: `(40px / 2) – 4px = 16px`.

### Dimension Mappings

| Selector | Property | Value | Description |
| :--- | :--- | :--- | :--- |
| `[data-part="checkbox-box"]`, `[data-part="radio-box"]` | `width`, `height` | `var(--psz-sub)` | The clickable box/circle. |
| `[data-part="checkbox-box"]`, `[data-part="radio-box"]` | `min-width` | `0` | Prevents Tailwind’s forced min‑width from overriding the sub‑size. |
| `[data-part="switch-track"]` | `min-width` | `var(--psz-src-size)` | Track is as wide as the component is tall. |
| `[data-part="switch-track"]` | `min-height` | `calc(var(--psz-sub) + var(--p-padding-y-lg))` | Track height = knob height + constant padding. |
| `[data-part="switch-indicator"]` | `width`, `height` | `var(--psz-sub)` | The sliding knob. |

### Switch Knob Animation

| Selector | Property | Value |
| :--- | :--- | :--- |
| `[data-part="switch-indicator-wrapper"]` | `transform` | `translateX(0)` (default, off) |
| `[data-state="checked"] [data-part="switch-indicator-wrapper"]` | `transform` | `translateX(calc(100% - var(--psz-sub)))` (on) |

The indicator wrapper slides from `0` to `100% – knob width`, centering the knob inside the track.

---

## 🛠 Customising a Size System

1. In your own stylesheet, target the size system attribute:
   ```css
   [data-size-system="toggle"] {
     --psz-sub: calc((var(--psz-src-size) / 2) - 0.5rem); /* make boxes smaller */
   }
   ```
2. You can also override the individual part dimensions:
   ```css
   [data-size-system="toggle"] [data-part="switch-indicator"] {
     width: 20px;
     height: 20px;
   }
   ```
3. For adding a completely new size system, create a new `[data-size-system="your-name"]`
   block and assign `data-size-system="your-name"` to any component that accepts it.

All components that use this size system will automatically pick up the new values
without any further code changes.