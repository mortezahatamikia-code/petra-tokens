// Color Schemes Generator
import { applyFieldColorRules } from './field.mjs';
import { applyToggleColorRules } from './toggle.mjs';

const PROP_MAP = {
  bg: '--p-bg',
  text: '--p-text',
  border: '--p-border-color',
  'padding-x': '--p-padding-x',
  'padding-y': '--p-padding-y',
  gap: '--p-gap',
  radius: '--p-radius',
  leading: '--p-leading',
  'sub-text': '--p-sub-text-size',
  'sub-leading': '--p-sub-leading',
  'placeholder-text': '--p-placeholder-color',
  'helper-text': '--p-helper-color',
  'label-text': '--p-label-color',
};

function cssProp(key, stateCtx = 'base', refOrVal) {
  if (stateCtx === 'disabled' || stateCtx === 'disable') {
    if (key === 'bg') return '--p-bg-disabled';
    if (key === 'text') return '--p-text-disabled';
    if (key === 'border') return '--p-border-color-disabled';
  }
  if (stateCtx === 'hover') {
    if (key === 'bg') return '--p-bg-hover';
    if (key === 'text') return '--p-text-hover';
    if (key === 'border') return '--p-border-color-hover';
  }
  if (stateCtx === 'active') {
    if (key === 'bg') return '--p-bg-active';
    if (key === 'text') return '--p-text-active';
  }
  return PROP_MAP[key] || `--p-${key}`;
}

const STATE_NORM = {
  disable: 'disabled',
  disables: 'disabled',
  hover: 'hover',
  active: 'active',
  error: 'error',
  success: 'success',
  filled: 'filled',
  disabled: 'disabled',
};
function normState(s) {
  return STATE_NORM[s] || s;
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

export function generateColorSchemes(componentVars, refToCssVar) {
  const schemesMap = new Map();

  function add(scheme, selector, propKey, refOrVal, stateCtx = 'base') {
    if (!schemesMap.has(scheme)) schemesMap.set(scheme, new Map());
    const schemeBlocks = schemesMap.get(scheme);
    if (!schemeBlocks.has(selector)) schemeBlocks.set(selector, []);
    const cssVal =
      typeof refOrVal === 'string' && refOrVal.startsWith('$.')
        ? refToCssVar(refOrVal)
        : String(refOrVal);
    const primaryProp = cssProp(propKey, stateCtx, refOrVal);
    const rule = `  ${primaryProp}: ${cssVal};`;
    const existing = schemeBlocks.get(selector);
    if (!existing.includes(rule)) {
      existing.push(rule);
    }
    if (stateCtx === 'disabled' || stateCtx === 'disable') {
      const baseProp = cssProp(propKey, 'base', refOrVal);
      if (baseProp !== primaryProp) {
        const baseRule = `  ${baseProp}: ${cssVal};`;
        if (!existing.includes(baseRule)) {
          existing.push(baseRule);
        }
      }
    }
  }

  const colorsObj = componentVars.colors || componentVars || {};
  for (const [scheme, schemeVal] of Object.entries(colorsObj)) {
    for (const [colorOrState, val] of Object.entries(schemeVal || {})) {
      if (!val) continue;
      if (isTokenLeaf(val)) {
        add(scheme, `[data-color-scheme="${scheme}"]`, colorOrState, getTokenValue(val));
        continue;
      }
      if (typeof val !== 'object') continue;

      const knownStates = new Set(['disabled', 'loading']);
      const isState = knownStates.has(colorOrState) || colorOrState.startsWith('disable');
      const stateStr = isState ? normState(colorOrState) : null;

      for (const [propOrState, propVal] of Object.entries(val)) {
        if (propOrState.startsWith('$')) continue;
        if (isTokenLeaf(propVal)) {
          let sel;
          if (isState) {
            if (stateStr === 'disabled') {
              sel = `:is([data-color-scheme="${scheme}"], [data-color-scheme="${scheme}"] *):is([data-state="disabled"], [data-state="loading"]), :is([data-state="disabled"], [data-state="loading"])`;
            } else if (stateStr === 'error') {
              sel = `[data-color-scheme="${scheme}"]:is([data-state="error"], [data-color="error"]), [data-color-scheme="${scheme}"] :is([data-state="error"], [data-color="error"]), :is([data-state="error"], [data-color="error"])`;
            } else {
              sel = `[data-color-scheme="${scheme}"]:is([data-state="${stateStr}"], [data-color="${stateStr}"]), [data-color-scheme="${scheme}"] :is([data-state="${stateStr}"], [data-color="${stateStr}"]), :is([data-state="${stateStr}"], [data-color="${stateStr}"])`;
            }
          } else {
            sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"]`;
          }
          add(scheme, sel, propOrState, getTokenValue(propVal), isState ? stateStr : 'base');
        } else if (propVal && typeof propVal === 'object') {
          const innerState = normState(propOrState);
          const knownInnerStates = new Set(['hover', 'active', 'disabled', 'error', 'filled', 'base']);
          const isInnerState = knownInnerStates.has(propOrState) || propOrState.startsWith('disable');

          for (const [leafProp, leafVal] of Object.entries(propVal)) {
            if (leafProp.startsWith('$') || !isTokenLeaf(leafVal)) continue;
            let sel;
            let stateCtx = 'base';
            if (isState) {
              if (stateStr === 'disabled') {
                sel = `[data-color-scheme="${scheme}"]:is([data-color="${colorOrState}"], :not([data-color])):is([data-state="disabled"], [data-state="loading"])`;
              } else {
                sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"]:is([data-state="${stateStr}"], [data-color="${stateStr}"])`;
              }
              stateCtx = stateStr;
            } else if (isInnerState) {
              const notDisabled = ':not([data-state="disabled"], [data-state="loading"])';
              const activeIs = ':is(:hover, [aria-pressed="true"], [data-state="active"], [data-active="true"])';
              if (innerState === 'hover') {
                sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"]${notDisabled}${activeIs}`;
                stateCtx = 'hover';
              } else if (innerState === 'active') {
                sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"]${notDisabled}:is(:active, [aria-pressed="true"], [data-state="active"], [data-active="true"])`;
                stateCtx = 'active';
              } else if (innerState === 'disabled') {
                sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"]:is([data-state="disabled"], [data-state="loading"])`;
                stateCtx = 'disabled';
              } else {
                sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"][data-state="${innerState}"]`;
                stateCtx = innerState;
              }
            } else {
              sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"]`;
            }
            add(scheme, sel, leafProp, getTokenValue(leafVal), stateCtx);
          }
        }
      }
    }
  }

  // Apply Field Color Scheme Rules
  if (!schemesMap.has('field')) schemesMap.set('field', new Map());
  applyFieldColorRules(schemesMap.get('field'));

  // Toggle Scheme Rules
  if (!schemesMap.has('toggle')) schemesMap.set('toggle', new Map());
  applyToggleColorRules(schemesMap.get('toggle'));

  return schemesMap;
}



