#!/usr/bin/env node
// petra-tokens/scripts/generate-tokens.mjs
// ============================================================
// Converts modular token JSONs (or petra-tokens.json) → 3 main root directories:
// 1. primitive/index.scss
// 2. semantic/index.scss
// 3. schemes/ (color/, size/, style/)
// All 3 directories are 100% auto-generated.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateColorSchemes } from './converters/color-schemes.mjs';
import { generateSizeSchemes } from './converters/size-schemes.mjs';
import { generateStyleSchemes } from './converters/style-schemes.mjs';
import { generateBasicSizeScheme } from './converters/basic-size.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_ROOT = path.resolve(__dirname, '..');
const JSON_PATH = path.join(TOKENS_ROOT, 'petra-tokens.json');
const MODULAR_TOKENS_DIR = path.join(TOKENS_ROOT, 'tokens');
const MODULAR_SCHEMES_DIR = path.join(MODULAR_TOKENS_DIR, 'schemes');

const PRIMITIVE_DIR = path.join(TOKENS_ROOT, 'primitive');
const SEMANTIC_DIR = path.join(TOKENS_ROOT, 'semantic');
const SCHEMES_DIR = path.join(TOKENS_ROOT, 'schemes');

// ── Token Helper Functions ─────────────────────────────────

function isTokenLeaf(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return true;
  if (typeof val === 'object' && '$value' in val) return true;
  return false;
}

function getTokenValue(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object' && '$value' in val) return val.$value;
  return val;
}

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
    if (isTokenLeaf(obj)) {
      map.set(`$.${collectionKey}.${keyPath.join('.')}`, getTokenValue(obj));
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
    walk(`${col.collection}.${col.mode || 'Mode 1'}`, col.variables, []);
  }
  return map;
}

/** Convert a ref like "$.Primitive Tokens.Mode 1.colors.blue.500"
 *  to a CSS var reference "var(--p-color-blue-500)" */
function refToCssVar(ref) {
  if (!ref || typeof ref !== 'string' || !ref.startsWith('$.')) return ref;
  const inner = ref.replace(/^\$\./, '');
  const modeMatch = inner.match(/^(.+?)\.(Mode \d+)\.(.+)$/);
  if (!modeMatch) return `/* unresolved: ${ref} */`;
  const collection = modeMatch[1].toLowerCase();
  let rest = modeMatch[3].split('.').join('-').replace(/danger/g, 'error');

  if (collection.includes('primitive')) {
    if (rest.startsWith('colors-')) rest = rest.replace(/^colors-/, 'color-');
    return `var(--p-${rest})`;
  }
  if (collection.includes('semantic')) return `var(--p-${rest})`;
  if (collection.includes('component')) return `var(--p-schema-${rest})`;
  return `var(--p-${rest})`;
}

// ── Layer 1: Primitive Tokens → primitive/index.scss ──────

function generatePrimitive(vars) {
  const lines = [
    '// AUTO-GENERATED — do not edit manually.',
    '// Source: tokens/primitive.json',
    ':root {',
  ];

  for (const [key, token] of Object.entries(vars.size || {})) {
    const val = getTokenValue(token);
    const name = slugify('size', key);
    lines.push(`  --p-${name}: ${pxToRem(val)}; /* ${val}px */`);
  }

  for (const [color, shades] of Object.entries(vars.colors || {})) {
    for (const [shade, token] of Object.entries(shades)) {
      const val = getTokenValue(token);
      const name = slugify('color', color === 'danger' ? 'error' : color, shade);
      lines.push(`  --p-${name}: ${val};`);
    }
  }

  for (const [key, token] of Object.entries(vars.weight || {})) {
    const val = getTokenValue(token);
    const name = slugify('weight', key);
    lines.push(`  --p-${name}: ${val};`);
  }

  lines.push('}');
  return lines.join('\n');
}

// ── Layer 2: Semantic Tokens → semantic/index.scss ───────

function generateSemantic(vars) {
  const lines = [
    '// AUTO-GENERATED — do not edit manually.',
    '// Source: tokens/semantic.json',
    ':root {',
  ];

  function walk(obj, pathParts) {
    if (obj === null || obj === undefined) return;
    if (isTokenLeaf(obj)) {
      const rawVal = getTokenValue(obj);
      const cssKey = pathParts.join('-').replace(/danger/g, 'error');
      const val = typeof rawVal === 'string' && rawVal.startsWith('$.')
        ? refToCssVar(rawVal)
        : rawVal;
      lines.push(`  --p-${cssKey}: ${val};`);
      return;
    }
    if (typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith('$')) continue;
        walk(v, [...pathParts, k]);
      }
    }
  }

  for (const [group, val] of Object.entries(vars)) {
    walk(val, [group]);
  }

  lines.push('}');
  return lines.join('\n');
}

async function main() {
  let primitiveVars = {};
  let semanticVars = {};
  let componentColors = {};
  let componentSize = {};
  let componentStyle = {};
  let collectionsForMap = [];

  const primitiveJsonPath = path.join(MODULAR_TOKENS_DIR, 'primitive.json');
  const hasModular = fs.existsSync(primitiveJsonPath);

  if (hasModular) {
    console.log(`📖 Reading modular tokens from ${MODULAR_TOKENS_DIR}...`);
    primitiveVars = JSON.parse(fs.readFileSync(primitiveJsonPath, 'utf8'));
    semanticVars = JSON.parse(fs.readFileSync(path.join(MODULAR_TOKENS_DIR, 'semantic.json'), 'utf8'));
    componentColors = JSON.parse(fs.readFileSync(path.join(MODULAR_SCHEMES_DIR, 'colors.json'), 'utf8'));
    componentSize = JSON.parse(fs.readFileSync(path.join(MODULAR_SCHEMES_DIR, 'size.json'), 'utf8'));
    componentStyle = JSON.parse(fs.readFileSync(path.join(MODULAR_SCHEMES_DIR, 'style.json'), 'utf8'));

    collectionsForMap = [
      { collection: 'Primitive Tokens', mode: 'Mode 1', variables: primitiveVars },
      { collection: 'Semantic Tokens', mode: 'Mode 1', variables: semanticVars },
      { collection: 'Component Tokens', mode: 'Mode 1', variables: { colors: componentColors, size: componentSize, style: componentStyle } },
    ];
  } else {
    console.log(`📖 Reading ${JSON_PATH}...`);
    const raw = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
    const cols = {};
    for (const c of raw) cols[c.collection] = c;

    primitiveVars = cols['Primitive Tokens']?.variables ?? {};
    semanticVars = cols['Semantic Tokens']?.variables ?? {};
    const componentVars = cols['Component Tokens']?.variables ?? {};
    componentColors = componentVars.colors || {};
    componentSize = componentVars.size || {};
    componentStyle = componentVars.style || {};
    collectionsForMap = raw;
  }

  const flatMap = buildFlatMap(collectionsForMap);
  console.log(`  ✓ ${flatMap.size} token references indexed`);

  fs.mkdirSync(PRIMITIVE_DIR, { recursive: true });
  fs.mkdirSync(SEMANTIC_DIR, { recursive: true });
  fs.mkdirSync(path.join(SCHEMES_DIR, 'color'), { recursive: true });
  fs.mkdirSync(path.join(SCHEMES_DIR, 'size'), { recursive: true });
  fs.mkdirSync(path.join(SCHEMES_DIR, 'style'), { recursive: true });

  console.log('⚙️  Generating 1. primitive/index.scss...');
  fs.writeFileSync(path.join(PRIMITIVE_DIR, 'index.scss'), generatePrimitive(primitiveVars));
  if (fs.existsSync(path.join(PRIMITIVE_DIR, '_primitive.scss'))) {
    fs.unlinkSync(path.join(PRIMITIVE_DIR, '_primitive.scss'));
  }

  console.log('⚙️  Generating 2. semantic/index.scss...');
  fs.writeFileSync(path.join(SEMANTIC_DIR, 'index.scss'), generateSemantic(semanticVars));
  if (fs.existsSync(path.join(SEMANTIC_DIR, '_semantic.scss'))) {
    fs.unlinkSync(path.join(SEMANTIC_DIR, '_semantic.scss'));
  }

  console.log('⚙️  Generating 3. schemes/color/*.scss...');
  for (const [schemeName, blocksMap] of generateColorSchemes(componentColors, refToCssVar)) {
    const lines = [`// AUTO-GENERATED — color-scheme="${schemeName}"`, ''];
    for (const [sel, props] of blocksMap) {
      if (!props.length) continue;
      lines.push(`${sel} {`, ...props, '}', '');
    }
    fs.writeFileSync(path.join(SCHEMES_DIR, 'color', `${schemeName}.scss`), lines.join('\n'));
  }

  console.log('⚙️  Generating 3. schemes/size/*.scss...');
  for (const [schemeName, blocksMap] of generateSizeSchemes(componentSize, refToCssVar)) {
    const lines = [`// AUTO-GENERATED — size-scheme="${schemeName}"`, ''];
    for (const [sel, props] of blocksMap) {
      if (!props.length) continue;
      lines.push(`${sel} {`, ...props, '}', '');
    }
    fs.writeFileSync(path.join(SCHEMES_DIR, 'size', `${schemeName}.scss`), lines.join('\n'));
  }
  fs.writeFileSync(path.join(SCHEMES_DIR, 'size', 'basic.scss'), generateBasicSizeScheme(componentSize, refToCssVar));

  console.log('⚙️  Generating 3. schemes/style/*.scss...');
  for (const [schemeName, blocksMap] of generateStyleSchemes(componentStyle, refToCssVar)) {
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
