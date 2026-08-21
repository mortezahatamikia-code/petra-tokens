// Basic Size Scheme Generator (Button, Input, Field size tokens derived from petra-tokens.json)

const PROP_MAP = {
  'text': '--p-font-size',
  'text-weight': '--p-font-weight',
  'label-text-weight': '--p-label-weight',
  'leading': '--p-leading',
  'sub-text': '--p-sub-text-size',
  'sub-leading': '--p-sub-leading',
  'padding-x': '--p-padding-x',
  'padding-y': '--p-padding-y',
  'gap': '--p-gap',
  'radius': '--p-radius',
  'icon': '--p-icon-size',
  'min-height': '--p-min-height',
  'min-width': '--p-min-width',
  'shadow': '--p-shadow',
};

function cssProp(key) {
  return PROP_MAP[key] || `--p-${key}`;
}

function getTokenValue(val) {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'object' && '$value' in val) return val.$value;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
  return undefined;
}

export function generateBasicSizeScheme(componentVars, refToCssVar) {
  const basicObj = componentVars?.size?.basic || componentVars?.basic || (componentVars?.common ? componentVars : {});
  // Tailwind CSS v4 standard responsive breakpoints (40rem = 640px, 48rem = 768px, 64rem = 1024px, 80rem = 1280px, 96rem = 1536px)
  const BREAKPOINTS = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem' };
  const lines = ['// AUTO-GENERATED — size-scheme="basic" (Button/Input/Field sizes)', ''];

  // 1. Common size properties (font weights)
  if (basicObj.common) {
    lines.push('[data-size-scheme="basic"] {');
    for (const [prop, valObj] of Object.entries(basicObj.common)) {
      const rawVal = getTokenValue(valObj);
      if (prop.startsWith('$') || rawVal === undefined) continue;
      const cssVal = refToCssVar ? refToCssVar(rawVal) : rawVal;
      lines.push(`  ${cssProp(prop)}: ${cssVal};`);
    }
    lines.push('}', '');
  }

  // 2. Per-size properties (xs, sm, base, md, lg, xl)
  const sizeKeys = Object.keys(basicObj).filter(k => k !== 'common' && !k.startsWith('$'));
  // Ensure 'md' alias is present if 'base' exists
  if (basicObj.base && !basicObj.md) {
    basicObj.md = basicObj.base;
    if (!sizeKeys.includes('md')) sizeKeys.push('md');
  }

  const DEFAULT_MIN_SIZES = {
    xs: 'var(--p-size-8)',
    sm: 'var(--p-size-9)',
    base: 'var(--p-size-10)',
    md: 'var(--p-size-10)',
    lg: 'var(--p-size-11)',
    xl: 'var(--p-size-12)',
  };

  for (const sizeKey of sizeKeys) {
    const sizeProps = basicObj[sizeKey] || {};
    const sel = `:is([data-size-scheme="basic"][data-size~="${sizeKey}"], [data-size-scheme="basic"] [data-size~="${sizeKey}"])`;
    lines.push(`${sel} {`);

    let hasMinHeight = false;
    let hasMinWidth = false;
    for (const [prop, valObj] of Object.entries(sizeProps)) {
      const rawVal = getTokenValue(valObj);
      if (prop.startsWith('$') || rawVal === undefined) continue;
      if (prop === 'min-height' || prop === 'height') hasMinHeight = true;
      if (prop === 'min-width' || prop === 'width') hasMinWidth = true;
      const cssVal = refToCssVar ? refToCssVar(rawVal) : rawVal;
      lines.push(`  ${cssProp(prop)}: ${cssVal};`);
    }
    if (!hasMinHeight && DEFAULT_MIN_SIZES[sizeKey]) {
      lines.push(`  --p-min-height: ${DEFAULT_MIN_SIZES[sizeKey]};`);
    }
    if (!hasMinWidth && DEFAULT_MIN_SIZES[sizeKey]) {
      lines.push(`  --p-min-width: ${DEFAULT_MIN_SIZES[sizeKey]};`);
    }
    const isSmall = (sizeKey === 'xs' || sizeKey === 'sm');
    // Reference CSS variables defined in base.scss — no hardcoded shadow values and no circular definitions.
    const shadowVal = isSmall ? 'var(--p-shadow-sm)' : 'var(--p-shadow-default)';
    lines.push(`  --p-shadow: ${shadowVal};`);
    lines.push('}', '');
  }

  // 3. Responsive Breakpoints
  for (const [bp, w] of Object.entries(BREAKPOINTS)) {
    lines.push(`@media (min-width: ${w}) {`);
    for (const sizeKey of sizeKeys) {
      const sizeProps = basicObj[sizeKey] || {};
      const bpSel = `:is([data-size-scheme="basic"][data-size~="${bp}\\:${sizeKey}"], [data-size-scheme="basic"] [data-size~="${bp}\\:${sizeKey}"])`;
      lines.push(`  ${bpSel} {`);

      let hasMinHeight = false;
      let hasMinWidth = false;
      for (const [prop, valObj] of Object.entries(sizeProps)) {
        const rawVal = getTokenValue(valObj);
        if (prop.startsWith('$') || rawVal === undefined) continue;
        if (prop === 'min-height' || prop === 'height') hasMinHeight = true;
        if (prop === 'min-width' || prop === 'width') hasMinWidth = true;
        const cssVal = refToCssVar ? refToCssVar(rawVal) : rawVal;
        lines.push(`    ${cssProp(prop)}: ${cssVal};`);
      }
      if (!hasMinHeight && DEFAULT_MIN_SIZES[sizeKey]) {
        lines.push(`    --p-min-height: ${DEFAULT_MIN_SIZES[sizeKey]};`);
      }
      if (!hasMinWidth && DEFAULT_MIN_SIZES[sizeKey]) {
        lines.push(`    --p-min-width: ${DEFAULT_MIN_SIZES[sizeKey]};`);
      }
      const isSmallBp = (sizeKey === 'xs' || sizeKey === 'sm');
      const shadowValBp = isSmallBp ? 'var(--p-shadow-sm)' : 'var(--p-shadow-default)';
      lines.push(`    --p-shadow: ${shadowValBp};`);
      lines.push(`  }`);
    }
    lines.push('}', '');
  }

  return lines.join('\n');
}
