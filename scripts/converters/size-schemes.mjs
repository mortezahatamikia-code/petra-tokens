// Size Schemes Generator
import { applyFieldSizeRules } from './field.mjs';
import { applyToggleSizeRules } from './toggle.mjs';

const PROP_MAP = {
  'bg': '--p-bg',
  'text': '--p-font-size',
  'font-size': '--p-font-size',
  'border': '--p-border-color',
  'padding-x': '--p-padding-x',
  'padding-y': '--p-padding-y',
  'gap': '--p-gap',
  'radius': '--p-radius',
  'leading': '--p-leading',
  'icon': '--p-icon-size',
  'icon-size': '--p-icon-size',
  'sub-text': '--p-sub-text-size',
  'sub-leading': '--p-sub-leading',
};

function cssProp(key) {
  return PROP_MAP[key] || `--p-${key}`;
}

function isTokenLeaf(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return true;
  if (typeof val === 'object' && '$value' in val) return true;
  return false;
}

function getTokenValue(val) {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'object' && '$value' in val) return val.$value;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
  return undefined;
}

export function generateSizeSchemes(componentVars, refToCssVar) {
  const schemesMap = new Map();

  function add(scheme, selector, propKey, refOrVal) {
    if (!schemesMap.has(scheme)) schemesMap.set(scheme, new Map());
    const schemeBlocks = schemesMap.get(scheme);
    if (!schemeBlocks.has(selector)) schemeBlocks.set(selector, []);
    const cssVal = (typeof refOrVal === 'string' && refOrVal.startsWith('$.'))
      ? refToCssVar(refOrVal)
      : String(refOrVal);
    schemeBlocks.get(selector).push(`  ${cssProp(propKey)}: ${cssVal};`);
  }

  const sizeObj = componentVars.size || componentVars || {};

  // OTP Size Scheme
  for (const [sizeName, sizeProps] of Object.entries(sizeObj.otp || {})) {
    const sel = `[data-size-scheme="otp"][data-size="${sizeName}"]`;
    for (const [prop, propVal] of Object.entries(sizeProps || {})) {
      const rawVal = getTokenValue(propVal);
      if (!prop.startsWith('$') && rawVal !== undefined) add('otp', sel, prop, rawVal);
    }
  }

  // Badge Size Scheme
  const badgeSizeObj = sizeObj.badge || {};
  for (const [subVariant, propsObj] of Object.entries(badgeSizeObj)) {
    if (!propsObj || typeof propsObj !== 'object') continue;
    let sel;
    if (subVariant === 'default') {
      sel = `[data-size-scheme="badge"]`;
    } else {
      sel = `[data-size-scheme="badge"][data-variant~="${subVariant}"]`;
    }
    for (const [prop, propVal] of Object.entries(propsObj)) {
      const rawVal = getTokenValue(propVal);
      if (!prop.startsWith('$') && rawVal !== undefined) {
        add('badge', sel, prop, rawVal);
      }
    }
  }

  // Toggle Size Scheme (extract all sizes: sm, base, lg, xl and common)
  const BREAKPOINTS = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem' };
  for (const [sizeName, sizeProps] of Object.entries(sizeObj.toggle || {})) {
    if (sizeName === 'common') {
      for (const [prop, propVal] of Object.entries(sizeProps || {})) {
        const rawVal = getTokenValue(propVal);
        if (!prop.startsWith('$') && rawVal !== undefined) {
          add('toggle', `[data-size-scheme="toggle"]`, prop, rawVal);
        }
      }
    } else {
      const sel = `:is([data-size-scheme="toggle"][data-size~="${sizeName}"], [data-size-scheme="toggle"] [data-size~="${sizeName}"])`;
      for (const [prop, propVal] of Object.entries(sizeProps || {})) {
        const rawVal = getTokenValue(propVal);
        if (!prop.startsWith('$') && rawVal !== undefined) {
          add('toggle', sel, prop, rawVal);
        }
      }
    }
  }

  if (!schemesMap.has('toggle')) schemesMap.set('toggle', new Map());
  applyToggleSizeRules(schemesMap.get('toggle'));

  if (!schemesMap.has('field')) schemesMap.set('field', new Map());
  applyFieldSizeRules(schemesMap.get('field'));

  return schemesMap;
}
