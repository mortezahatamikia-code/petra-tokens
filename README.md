# 🎨 Petra Base Tokens (`@petra-base/tokens` v2.0)

پکیج سیستم توکن‌ها و دیزاین سیستم پترا. این پکیج بر اساس **۶ `data-*` Attribute اصلی** و **معماری ۳ لایه‌ای توکن‌ها (Primitive, Semantic, Schemes)** طراحی شده است.

---

## 🏛️ معماری سیستم توکن‌ها (3-Layer Architecture)

تمامی توکن‌ها از یک منبع حقیقت واحد به نام `petra-tokens.json` مشتق می‌شوند:

```
petra-tokens/
├── primitive/                 ← [لایه ۱] auto-generated (git-ignored)
│   └── index.scss             (--p-size-*, --p-color-*, --p-weight-*)
│
├── semantic/                  ← [لایه ۲] auto-generated (git-ignored)
│   └── index.scss             (--p-colors-primary-default, --p-text-sm, --p-radius-8px, ...)
│
├── schemes/                   ← [لایه ۳] auto-generated (git-ignored)
│   ├── size/                  (basic.scss, field.scss, toggle.scss, ...)
│   ├── color/                 (action.scss, field.scss, feedback.scss, toggle.scss, ...)
│   └── style/                 (global.scss, action.scss, field.scss, tab.scss, ...)
│
├── components/                ← استایل‌های چیدمان اختصاصی کامپوننت‌ها (button, input, badge, ...)
├── styles/                    ← ورودی‌های اصلی استایل‌ها و ابزارها
│   ├── style.scss             (فایل جامع لودکننده تمام لایه‌ها)
│   ├── animations.scss        (انیمیشن‌های سراسری)
│   ├── utilities.scss         (کلاس‌های کمکی)
│   └── theme/light.css        (متغیرهای تم پایه)
│
├── base.scss                  ← قوانین پایه سراسری (RTL/LTR, rounded, sharp, focus, states)
├── state-styles.scss          ← استایل واریانت‌های اصلی (solid, outline, text, ghost)
│
├── scripts/
│   └── generate-tokens.mjs    ← اسکریپت تولید اتوماتیک فایل‌های SCSS از JSON
│
└── petra-tokens.json          ← 🌟 تنها منبع حقیقت (Single Source of Truth)
```

---

## 📋 لیست و دلیل وجود فایل‌ها و پوشه‌ها

### 📁 پوشه‌های اصلی
| پوشه / فایل | دلیل وجود و نقش در سیستم | وضعیت Git |
|---|---|---|
| `petra-tokens.json` | منبع اصلی و خام تعریف تمام توکن‌ها در Figma / Design System | 🟢 Tracked |
| `scripts/generate-tokens.mjs` | اسکریپت پارسر JSON که توکن‌ها را به فایل‌های SCSS سه لایه تبدیل می‌کند | 🟢 Tracked |
| `primitive/` | **[لایه ۱]** متغیرهای اولیه خام بر روی `:root` (`--p-size-*`, `--p-color-*`) | 🔴 Ignored (Prebuild) |
| `semantic/` | **[لایه ۲]** متغیرهای معنایی بر روی `:root` (`--p-colors-primary-default`, ...) | 🔴 Ignored (Prebuild) |
| `schemes/` | **[لایه ۳]** قواعد CSS اسکیماها براساس `data-color-scheme`, `data-size-scheme`, `data-variant` | 🔴 Ignored (Prebuild) |
| `components/` | استایل‌های چیدمان درونی کامپوننت‌ها (مانند `button.scss`, `badge.scss`, `input-wrapper.scss`) | 🟢 Tracked |
| `styles/style.scss` | فایل جامعی که تمام لایه‌های ۱، ۲ و ۳ را به همراه ابزارها و تم یکجا import می‌کند | 🟢 Tracked |
| `base.scss` | قوانین سراسری جهت جهت‌نمایی (`dir="rtl/ltr"`), گوشه‌ها (`rounded`/`sharp`), فوکوس و وضعیت `disabled`/`loading` | 🟢 Tracked |
| `state-styles.scss` | استایل‌های بصری واریانت‌های اصلی (`solid`, `outline`, `text`, `ghost`) بر اساس `data-state` | 🟢 Tracked |

---

## 📋 ۶ `data-*` Attribute اصلی کنترل‌کننده DOM

دیزاین سیستم پترا از ۶ Attribute اصلی در DOM برای اعمال استایل‌ها استفاده می‌کند:

| # | Attribute | نقش | مثال‌ها |
|---|---|---|---|
| ۱ | `data-size-scheme` | گروه اندازه‌گذاری پایه | `basic`, `badge`, `toggle`, `field`, `otp` |
| ۲ | `data-color-scheme` | گروه رنگ‌بندی پایه | `action`, `field`, `feedback`, `content` |
| ۳ | `data-variant` | واریانت ظاهری (با قابلیت ترکیب چند مقدار با `~=`) | `solid`, `outline`, `text`, `ghost`, `sharp`, `rounded` |
| ۴ | `data-color` | رنگ اختصاصی | `primary`, `secondary`, `danger`, `success`, `neutral`, `info`, `warning` |
| ۵ | `data-state` | حالت‌های تعاملی | `base`, `hover`, `active`, `disabled`, `loading`, `error`, `success`, `filled` |
| ۶ | `data-scheme-variant` | زیر-اسکیماها | `dropdown`, `switch`, `checkbox`, `radio`, `count` |

### 🔄 اولویت اولویت‌بندی (Cascade Priority Order)
```
data-variant (style/schemes) > data-state > data-color > data-color-scheme > data-size > data-size-scheme > :root
```

---

## 🚀 نحوه استفاده (Usage Guide)

### ۱. استفاده در پروژه‌ها (Import)

```scss
// در SCSS اصلی پروژه یا فایل ورودی کامپوننت‌ها:
@use "@petra-base/tokens/styles/style.scss" as *;
```

یا در React / Vue:

```tsx
import "@petra-base/tokens/styles/style.scss";
```

### ۲. ساختار DOM و HTML

```html
<!-- نمونه دکمه (Button) -->
<button
  data-color-scheme="action"
  data-size-scheme="basic"
  data-size="base"
  data-color="primary"
  data-variant="solid rounded"
  data-state="base"
>
  Click Me
</button>
```

### ۳. توليد اتوماتیک توکن‌ها (Development & Build)

برای به‌روزرسانی توکن‌ها پس از تغییر `petra-tokens.json`:

```bash
# تولید فایل‌های SCSS از JSON
npm run generate

# بیلد نهایی پکیج
npm run build

# اعتبارسنجی عدم تغییر ناخواسته فایل‌های تولیدی با JSON
npm run test:snapshot
```
