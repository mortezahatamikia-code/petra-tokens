#!/usr/bin/env node
// petra-tokens/scripts/generate-tokens.mjs
// ============================================================
// Converts petra-tokens.json → 3 main root directories:
// 1. primitive/index.scss
// 2. semantic/index.scss
// 3. schemes/ (color/, size/, style/)
// All 3 directories are 100% auto-generated and git-ignored.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_ROOT = path.resolve(__dirname, '..');
const ROOT_MONO   = path.resolve(TOKENS_ROOT, '..');
const JSON_PATH   = path.join(ROOT_MONO, 'petra-tokens.json');

const PRIMITIVE_DIR = path.join(TOKENS_ROOT, 'primitive');
const SEMANTIC_DIR  = path.join(TOKENS_ROOT, 'semantic');
const SCHEMES_DIR   = path.join(TOKENS_ROOT, 'schemes');

// ── Utilities ──────────────────────────────────────────────

function pxToRem(px) {
  return `${px / 16}rem`;
}

function slugify(...parts) {
  return parts
    .map(p => String(p).replace(/\./g, '-').replace(/[^a-zA-Z0-9-_]/g, '-'))
    .join('-')
    .toLowerCase();
}

// ── Reference Resolver ─────────────────────────────────────

function buildFlatMap(collections) {
  const map = new Map();

  function walk(collectionKey, obj, keyPath) {
    if (obj && typeof obj === 'object' && '$value' in obj) {
      map.set(`$.${collectionKey}.${keyPath.join('.')}`, obj.$value);
      return;
    }
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith('$')) continue;
        walk(collectionKey, v, [...keyPath, k]);
      }
    }
  }

  for (const col of collections) {
    walk(`${col.collection}.${col.mode}`, col.variables, []);
  }
  return map;
}

/** Convert a ref like "$.Primitive Tokens.Mode 1.colors.blue.500"
 *  to a CSS var reference "var(--p-color-blue-500)" */
function refToCssVar(ref) {
  if (!ref || !ref.startsWith('$.')) return ref;
  const inner = ref.replace(/^\$\./, '');
  const modeMatch = inner.match(/^(.+?)\.(Mode \d+)\.(.+)$/);
  if (!modeMatch) return `/* unresolved: ${ref} */`;
  const collection = modeMatch[1].toLowerCase();
  const rest       = modeMatch[3].split('.').join('-');

  if (collection.includes('primitive')) return `var(--p-${rest})`;
  if (collection.includes('semantic'))  return `var(--p-${rest})`;
  if (collection.includes('component')) return `var(--p-schema-${rest})`;
  return `var(--p-${rest})`;
}

// ── Layer 1: Primitive Tokens → primitive/index.scss ──────

function generatePrimitive(vars) {
  const lines = [
    '// AUTO-GENERATED — do not edit manually.',
    '// Source: petra-tokens.json → "Primitive Tokens"',
    ':root {',
  ];

  for (const [key, token] of Object.entries(vars.size || {})) {
    const name = slugify('size', key);
    lines.push(`  --p-${name}: ${pxToRem(token.$value)}; /* ${token.$value}px */`);
  }

  for (const [color, shades] of Object.entries(vars.colors || {})) {
    for (const [shade, token] of Object.entries(shades)) {
      const name = slugify('color', color, shade);
      lines.push(`  --p-${name}: ${token.$value};`);
    }
  }

  for (const [key, token] of Object.entries(vars.weight || {})) {
    const name = slugify('weight', key);
    lines.push(`  --p-${name}: ${token.$value};`);
  }

  lines.push('}');
  return lines.join('\n');
}

// ── Layer 2: Semantic Tokens → semantic/index.scss ───────

function generateSemantic(vars) {
  const lines = [
    '// AUTO-GENERATED — do not edit manually.',
    '// Source: petra-tokens.json → "Semantic Tokens"',
    ':root {',
  ];

  function walk(obj, pathParts) {
    if (!obj || typeof obj !== 'object') return;
    if ('$value' in obj) {
      const cssKey = pathParts.join('-');
      const val    = typeof obj.$value === 'string' && obj.$value.startsWith('$.')
        ? refToCssVar(obj.$value)
        : obj.$value;
      lines.push(`  --p-${cssKey}: ${val};`);
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$')) continue;
      walk(v, [...pathParts, k]);
    }
  }

  for (const [group, val] of Object.entries(vars)) {
    walk(val, [group]);
  }

  lines.push('}');
  return lines.join('\n');
}

// ── Layer 3: Property Name Map ───────────────────────────────

const PROP_MAP = {
  'bg':                '--p-bg',
  'text':              '--p-text',
  'border':            '--p-border-color',
  'icon':              '--p-icon-color',
  'label-text':        '--p-label-color',
  'on':                '--p-text',
  'toggle':            '--p-toggle-indicator-color',
  'padding-x':         '--p-padding-x',
  'padding-y':         '--p-padding-y',
  'gap':               '--p-gap',
  'radius':            '--p-radius',
  'leading':           '--p-leading',
  'sub-text':          '--p-sub-text-size',
  'sub-leading':       '--p-sub-leading',
  'helper-text':       '--p-helper-color',
  'placeholder-text':  '--p-placeholder-color',
  'option-text':       '--p-option-color',
  'border-color':      '--p-border-color',
};
function cssProp(key) { return PROP_MAP[key] || `--p-${key}`; }

const STATE_NORM = { disable: 'disabled', hover: 'hover', active: 'active',
                     error: 'error', success: 'success', filled: 'filled',
                     disabled: 'disabled' };
function normState(s) { return STATE_NORM[s] || s; }

// ── 1. Color Schemes ─────────────────────────────────────────

function generateColorSchemes(componentVars) {
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

  for (const [scheme, schemeVal] of Object.entries(componentVars.colors || {})) {
    for (const [colorOrState, val] of Object.entries(schemeVal || {})) {
      if (!val || typeof val !== 'object') continue;
      if ('$value' in val) {
        add(scheme, `[data-color-scheme="${scheme}"]`, colorOrState, val.$value);
        continue;
      }
      const knownStates = new Set(['disabled','error','success','filled','active']);
      const isState = knownStates.has(colorOrState) || colorOrState.startsWith('disable');
      const stateStr = isState ? normState(colorOrState) : null;

      for (const [propOrState, propVal] of Object.entries(val)) {
        if (propOrState.startsWith('$')) continue;
        if (propVal && '$value' in propVal) {
          const sel = isState
            ? `[data-color-scheme="${scheme}"][data-state="${stateStr}"]`
            : `[data-color-scheme="${scheme}"][data-color="${colorOrState}"]`;
          add(scheme, sel, propOrState, propVal.$value);
        } else if (propVal && typeof propVal === 'object') {
          const innerState = normState(propOrState);
          const knownInnerStates = new Set(['hover','active','disabled','error','success','filled','base']);
          const isInnerState = knownInnerStates.has(propOrState) || propOrState.startsWith('disable');

          for (const [leafProp, leafVal] of Object.entries(propVal)) {
            if (leafProp.startsWith('$') || !leafVal?.$value) continue;
            let sel;
            if (isState) {
              sel = `[data-color-scheme="${scheme}"][data-state="${stateStr}"]`;
            } else if (isInnerState) {
              sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"][data-state="${innerState}"]`;
            } else {
              sel = `[data-color-scheme="${scheme}"][data-color="${colorOrState}"]`;
            }
            add(scheme, sel, leafProp, leafVal.$value);
          }
        }
      }
    }
  }

  if (!schemesMap.has('field')) schemesMap.set('field', new Map());
  const fieldBlocks = schemesMap.get('field');
  fieldBlocks.set('[data-color-scheme="field"]', [
    ...(fieldBlocks.get('[data-color-scheme="field"]') || []),
    '  --p-border-color-focus: var(--p-intent-base);',
    '  --p-ring-color-focus: var(--p-intent-light);',
    '  --p-field-label-color: var(--p-text);',
    '  --p-field-label-helper-color: var(--p-helper-color);',
    '  --p-field-counter-color: var(--p-helper-color);',
    '  --p-field-helper-color: var(--p-helper-color);',
    '  --p-field-container-border-color: var(--p-border-color);',
  ]);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="label"]', ['  color: var(--p-field-label-color);']);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="label-helper"]', ['  color: var(--p-field-label-helper-color);']);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="counter"]', ['  color: var(--p-field-counter-color);']);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="helper"]', ['  color: var(--p-field-helper-color);']);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="container"]', ['  border-color: var(--p-field-container-border-color);']);

  if (!schemesMap.has('toggle')) schemesMap.set('toggle', new Map());
  const toggleBlocks = schemesMap.get('toggle');
  toggleBlocks.set('[data-color-scheme="toggle"]', [
    ...(toggleBlocks.get('[data-color-scheme="toggle"]') || []),
    '  --p-border-color-hover: var(--p-intent-base);',
    '  --p-ring-color-focus: var(--p-intent-light);',
    '  --p-checkbox-bg: var(--p-bg);',
    '  --p-checkbox-border-color: var(--p-border-color);',
    '  --p-checkbox-label-color: var(--p-text);',
    '  --p-checkbox-tic-color: var(--p-toggle-indicator-color);',
    '  --p-checkbox-mixed-line-color: var(--p-toggle-indicator-color);',
    '  --p-radio-bg: var(--p-bg);',
    '  --p-radio-border-color: var(--p-border-color);',
    '  --p-radio-label-color: var(--p-text);',
    '  --p-radio-dot-color: var(--p-toggle-indicator-color);',
    '  --p-switch-track-bg: var(--p-bg);',
    '  --p-switch-bg-inner-bg: var(--p-bg);',
    '  --p-switch-indicator-bg: var(--p-toggle-indicator-color);',
  ]);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-box"]', ['  background-color: var(--p-checkbox-bg);', '  border-color: var(--p-checkbox-border-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-box"]', ['  background-color: var(--p-radio-bg);', '  border-color: var(--p-radio-border-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-label"]', ['  color: var(--p-checkbox-label-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-label"]', ['  color: var(--p-radio-label-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-tic"]', ['  stroke: var(--p-checkbox-tic-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-mixed-line"]', ['  background-color: var(--p-checkbox-mixed-line-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-dot"]', ['  background-color: var(--p-radio-dot-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-track"]', ['  background-color: var(--p-switch-track-bg);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-bg-inner"]', ['  background-color: var(--p-switch-bg-inner-bg);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-indicator"]', ['  background-color: var(--p-switch-indicator-bg);']);

  return schemesMap;
}

// ── 2. Size Schemes ──────────────────────────────────────────

function generateSizeSchemes(componentVars) {
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

  for (const [sizeName, sizeProps] of Object.entries(componentVars.otp || {})) {
    const sel = `[data-size-scheme="otp"][data-size="${sizeName}"]`;
    for (const [prop, propVal] of Object.entries(sizeProps || {})) {
      if (!prop.startsWith('$') && propVal?.$value) add('otp', sel, prop, propVal.$value);
    }
  }

  for (const [prop, propVal] of Object.entries(componentVars?.toggle?.common || {})) {
    if (!prop.startsWith('$') && propVal?.$value) {
      add('toggle', `[data-size-scheme="toggle"]`, prop, propVal.$value);
    }
  }

  if (!schemesMap.has('toggle')) schemesMap.set('toggle', new Map());
  const toggleSizeBlocks = schemesMap.get('toggle');
  toggleSizeBlocks.set('[data-size-scheme="toggle"]', [
    ...(toggleSizeBlocks.get('[data-size-scheme="toggle"]') || []),
    '  --psz-sub: calc((var(--p-size, 2.5rem) / 2) - 0.25rem);',
    '  --p-toggle-gap: 0.5rem;',
    '  --p-checkbox-width: var(--psz-sub);',
    '  --p-checkbox-height: var(--psz-sub);',
    '  --p-radio-width: var(--psz-sub);',
    '  --p-radio-height: var(--psz-sub);',
    '  --p-switch-track-width: var(--p-size, 2.5rem);',
    '  --p-switch-track-height: calc(var(--psz-sub) + var(--p-padding-y, 0.625rem));',
    '  --p-switch-indicator-width: var(--psz-sub);',
    '  --p-switch-indicator-height: var(--psz-sub);',
    '  --p-switch-indicator-transform: translateX(0);',
    '  --p-switch-indicator-transform-checked: translateX(calc(var(--p-direction-sign, 1) * (100% - var(--psz-sub))));',
  ]);
  toggleSizeBlocks.set('[data-size-scheme="toggle"] [data-part="switch-indicator-wrapper"]', ['  transform: var(--p-switch-indicator-transform);']);
  toggleSizeBlocks.set('[data-size-scheme="toggle"] [data-part="checkbox-box"], [data-size-scheme="toggle"] [data-part="radio-box"]', ['  width: var(--p-checkbox-width);', '  height: var(--p-checkbox-height);', '  min-width: 0;']);
  toggleSizeBlocks.set('[data-size-scheme="toggle"] [data-part="switch-track"]', ['  min-width: var(--p-switch-track-width);', '  min-height: var(--p-switch-track-height);']);
  toggleSizeBlocks.set('[data-size-scheme="toggle"] [data-part="switch-indicator"]', ['  width: var(--p-switch-indicator-width);', '  height: var(--p-switch-indicator-height);']);
  toggleSizeBlocks.set('[data-size-scheme="toggle"][data-state="checked"] [data-part="switch-indicator-wrapper"], [data-size-scheme="toggle"] [data-state="checked"] [data-part="switch-indicator-wrapper"]', ['  transform: var(--p-switch-indicator-transform-checked);']);

  if (!schemesMap.has('field')) schemesMap.set('field', new Map());
  const fieldSizeBlocks = schemesMap.get('field');
  fieldSizeBlocks.set('[data-size-scheme="field"]', ['  --p-field-border-width: 1px;']);
  fieldSizeBlocks.set('[data-size-scheme="field"][data-scheme-variant="otp"]', ['  width: var(--p-size, auto) !important;', '  min-width: var(--p-size, auto) !important;']);

  return schemesMap;
}

// ── 3. Style Schemes (Highest Priority — Override Layer) ─────

function generateStyleSchemes(componentVars) {
  const styleMap = new Map();

  function add(scheme, selector, propKey, refOrVal) {
    if (!styleMap.has(scheme)) styleMap.set(scheme, new Map());
    const schemeBlocks = styleMap.get(scheme);
    if (!schemeBlocks.has(selector)) schemeBlocks.set(selector, []);
    const cssVal = (typeof refOrVal === 'string' && refOrVal.startsWith('$.'))
      ? refToCssVar(refOrVal)
      : String(refOrVal);
    schemeBlocks.get(selector).push(`  ${cssProp(propKey)}: ${cssVal};`);
  }

  const styleObj = componentVars?.style || {};

  if (styleObj.global) {
    for (const [variant, val] of Object.entries(styleObj.global)) {
      if (val?.$value) {
        add('global', `[data-variant~="${variant}"]`, 'radius', val.$value);
      }
    }
  }

  if (styleObj.action) {
    for (const [variant, variantVal] of Object.entries(styleObj.action)) {
      for (const [colorOrCommon, colorVal] of Object.entries(variantVal || {})) {
        if (!colorVal || typeof colorVal !== 'object') continue;
        for (const [prop, propVal] of Object.entries(colorVal)) {
          if (prop.startsWith('$')) continue;
          if (propVal && '$value' in propVal) {
            const sel = colorOrCommon === 'common'
              ? `[data-variant~="${variant}"]`
              : `[data-variant~="${variant}"][data-color="${colorOrCommon}"]`;
            add('action', sel, prop, propVal.$value);
          } else if (propVal && typeof propVal === 'object') {
            for (const [stateOrProp, stateVal] of Object.entries(propVal)) {
              if (stateVal && '$value' in stateVal) {
                const state = normState(stateOrProp);
                const sel = colorOrCommon === 'common'
                  ? `[data-variant~="${variant}"][data-state="${state}"]`
                  : `[data-variant~="${variant}"][data-color="${colorOrCommon}"][data-state="${state}"]`;
                add('action', sel, prop, stateVal.$value);
              } else if (stateVal && typeof stateVal === 'object') {
                for (const [leafProp, leafVal] of Object.entries(stateVal)) {
                  if (leafVal?.$value) {
                    const state = normState(stateOrProp);
                    const sel = colorOrCommon === 'common'
                      ? `[data-variant~="${variant}"][data-state="${state}"]`
                      : `[data-variant~="${variant}"][data-color="${colorOrCommon}"][data-state="${state}"]`;
                    add('action', sel, leafProp, leafVal.$value);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  for (const [groupName, groupVal] of Object.entries(styleObj)) {
    if (groupName === 'global' || groupName === 'action') continue;
    if (!groupVal || typeof groupVal !== 'object') continue;

    function walkStyle(obj, keyPath) {
      if (!obj || typeof obj !== 'object') return;
      if ('$value' in obj) {
        const lastKey = keyPath[keyPath.length - 1];
        const sel = `[data-variant~="${groupName}"]`;
        add(groupName, sel, lastKey, obj.$value);
        return;
      }
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith('$')) continue;
        walkStyle(v, [...keyPath, k]);
      }
    }

    walkStyle(groupVal, [groupName]);
  }

  return styleMap;
}

function generateBasicSizeScheme() {
  const SIZES = {
    xs:   { text:'var(--p-text-xs)',   px:'0.5rem',  py:'0.25rem',  gap:'0.25rem',  radius:'var(--p-radius-4px)',  h:'1.5rem',  minW:'1.5rem'  },
    sm:   { text:'var(--p-text-sm)',   px:'0.75rem', py:'0.375rem', gap:'0.375rem', radius:'var(--p-radius-4px)',  h:'2rem',    minW:'2rem'    },
    base: { text:'var(--p-text-base)', px:'1rem',    py:'0.5rem',   gap:'0.5rem',   radius:'var(--p-radius-8px)',  h:'2.5rem',  minW:'2.5rem'  },
    lg:   { text:'var(--p-text-lg)',   px:'1.25rem', py:'0.625rem', gap:'0.5rem',   radius:'var(--p-radius-8px)',  h:'3rem',    minW:'3rem'    },
    xl:   { text:'var(--p-text-xl)',   px:'1.5rem',  py:'0.75rem',  gap:'0.75rem',  radius:'var(--p-radius-12px)', h:'3.5rem',  minW:'3.5rem'  },
  };
  const BREAKPOINTS = { sm:'640px', md:'768px', lg:'1024px', xl:'1280px', '2xl':'1536px' };

  const lines = ['// AUTO-GENERATED — size-scheme="basic" (Button/Input sizes)', ''];
  for (const [size, v] of Object.entries(SIZES)) {
    lines.push(`[data-size-scheme="basic"][data-size="${size}"] {`);
    lines.push(`  --p-text:      ${v.text};`);
    lines.push(`  --p-padding-x: ${v.px};`);
    lines.push(`  --p-padding-y: ${v.py};`);
    lines.push(`  --p-gap:       ${v.gap};`);
    lines.push(`  --p-radius:    ${v.radius};`);
    lines.push(`  height: ${v.h};`);
    lines.push(`  min-width: ${v.minW};`);
    lines.push('}', '');
  }

  for (const [bp, w] of Object.entries(BREAKPOINTS)) {
    lines.push(`@media (min-width: ${w}) {`);
    for (const [size, v] of Object.entries(SIZES)) {
      lines.push(`  [data-size-scheme="basic"][data-size="${bp}\\:${size}"] {`);
      lines.push(`    --p-text:      ${v.text};`);
      lines.push(`    --p-padding-x: ${v.px};`);
      lines.push(`    --p-padding-y: ${v.py};`);
      lines.push(`    --p-gap:       ${v.gap};`);
      lines.push(`    --p-radius:    ${v.radius};`);
      lines.push(`    height: ${v.h};`);
      lines.push(`    min-width: ${v.minW};`);
      lines.push(`  }`);
    }
    lines.push('}', '');
  }
  return lines.join('\n');
}

async function main() {
  console.log('📖 Reading petra-tokens.json...');
  const raw = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

  const cols = {};
  for (const c of raw) cols[c.collection] = c;

  const primitiveVars = cols['Primitive Tokens']?.variables ?? {};
  const semanticVars  = cols['Semantic Tokens']?.variables  ?? {};
  const componentVars = cols['Component Tokens']?.variables ?? {};

  const flatMap = buildFlatMap(raw);
  console.log(`  ✓ ${flatMap.size} token references indexed`);

  fs.mkdirSync(PRIMITIVE_DIR, { recursive: true });
  fs.mkdirSync(SEMANTIC_DIR,  { recursive: true });
  fs.mkdirSync(path.join(SCHEMES_DIR, 'color'), { recursive: true });
  fs.mkdirSync(path.join(SCHEMES_DIR, 'size'),  { recursive: true });
  fs.mkdirSync(path.join(SCHEMES_DIR, 'style'), { recursive: true });

  console.log('⚙️  Generating 1. primitive/index.scss...');
  fs.writeFileSync(path.join(PRIMITIVE_DIR, 'index.scss'), generatePrimitive(primitiveVars));
  // Remove old _primitive.scss if exists
  if (fs.existsSync(path.join(PRIMITIVE_DIR, '_primitive.scss'))) {
    fs.unlinkSync(path.join(PRIMITIVE_DIR, '_primitive.scss'));
  }

  console.log('⚙️  Generating 2. semantic/index.scss...');
  fs.writeFileSync(path.join(SEMANTIC_DIR, 'index.scss'), generateSemantic(semanticVars));
  // Remove old _semantic.scss if exists
  if (fs.existsSync(path.join(SEMANTIC_DIR, '_semantic.scss'))) {
    fs.unlinkSync(path.join(SEMANTIC_DIR, '_semantic.scss'));
  }

  console.log('⚙️  Generating 3. schemes/color/*.scss...');
  for (const [schemeName, blocksMap] of generateColorSchemes(componentVars)) {
    const lines = [`// AUTO-GENERATED — color-scheme="${schemeName}"`, ''];
    for (const [sel, props] of blocksMap) {
      if (!props.length) continue;
      lines.push(`${sel} {`, ...props, '}', '');
    }
    fs.writeFileSync(path.join(SCHEMES_DIR, 'color', `${schemeName}.scss`), lines.join('\n'));
  }

  console.log('⚙️  Generating 3. schemes/size/*.scss...');
  for (const [schemeName, blocksMap] of generateSizeSchemes(componentVars)) {
    const lines = [`// AUTO-GENERATED — size-scheme="${schemeName}"`, ''];
    for (const [sel, props] of blocksMap) {
      if (!props.length) continue;
      lines.push(`${sel} {`, ...props, '}', '');
    }
    fs.writeFileSync(path.join(SCHEMES_DIR, 'size', `${schemeName}.scss`), lines.join('\n'));
  }
  fs.writeFileSync(path.join(SCHEMES_DIR, 'size', 'basic.scss'), generateBasicSizeScheme());

  console.log('⚙️  Generating 3. schemes/style/*.scss...');
  for (const [schemeName, blocksMap] of generateStyleSchemes(componentVars)) {
    const lines = [`// AUTO-GENERATED — style-scheme (variant="${schemeName}")`, ''];
    for (const [sel, props] of blocksMap) {
      if (!props.length) continue;
      lines.push(`${sel} {`, ...props, '}', '');
    }
    fs.writeFileSync(path.join(SCHEMES_DIR, 'style', `${schemeName}.scss`), lines.join('\n'));
  }

  console.log('✅ Done generating (primitive/index.scss, semantic/index.scss, schemes/*)!');
}

main().catch(e => { console.error(e); process.exit(1); });
