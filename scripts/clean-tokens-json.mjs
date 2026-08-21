import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKENS_ROOT = path.resolve(__dirname, '..');
const defaultJsonPath = path.resolve(TOKENS_ROOT, 'petra-tokens.json');
const targetFile = process.argv[2] ? path.resolve(process.argv[2]) : defaultJsonPath;

if (!fs.existsSync(targetFile)) {
  console.error(`❌ Error: File not found at ${targetFile}`);
  process.exit(1);
}

const originalSize = fs.statSync(targetFile).size;
const jsonRaw = fs.readFileSync(targetFile, 'utf8');
const data = JSON.parse(jsonRaw);

let removedType = 0;
let removedDescription = 0;
let removedScopes = 0;
let removedOtherDollarKeys = 0;
let collapsedValues = 0;

function cleanObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key === '$type') {
        removedType++;
      } else if (key === '$description') {
        removedDescription++;
      } else if (key === '$scopes') {
        removedScopes++;
      } else if (key.startsWith('$') && key !== '$value') {
        removedOtherDollarKeys++;
      }
    }

    if ('$value' in obj) {
      collapsedValues++;
      return cleanObject(obj.$value);
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;
      cleaned[key] = cleanObject(value);
    }
    return cleaned;
  }
  return obj;
}

const cleanedData = cleanObject(data);

// 1. Write cleaned monolithic petra-tokens.json
const outputJson = JSON.stringify(cleanedData, null, 2);
fs.writeFileSync(targetFile, outputJson, 'utf8');
const newSize = fs.statSync(targetFile).size;
const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

// 2. Split into modular tokens/ directory
const tokensDir = path.join(TOKENS_ROOT, 'tokens');
const schemesDir = path.join(tokensDir, 'schemes');
fs.mkdirSync(tokensDir, { recursive: true });
fs.mkdirSync(schemesDir, { recursive: true });

const cols = {};
if (Array.isArray(cleanedData)) {
  for (const c of cleanedData) {
    if (c.collection) cols[c.collection] = c.variables || {};
  }
}

const primitiveVars = cols['Primitive Tokens'] || {};
const semanticVars = cols['Semantic Tokens'] || {};
const componentVars = cols['Component Tokens'] || {};

const componentColors = componentVars.colors || {};
const componentSize = componentVars.size || {};
const componentStyle = componentVars.style || {};

fs.writeFileSync(path.join(tokensDir, 'primitive.json'), JSON.stringify(primitiveVars, null, 2), 'utf8');
fs.writeFileSync(path.join(tokensDir, 'semantic.json'), JSON.stringify(semanticVars, null, 2), 'utf8');
fs.writeFileSync(path.join(schemesDir, 'colors.json'), JSON.stringify(componentColors, null, 2), 'utf8');
fs.writeFileSync(path.join(schemesDir, 'size.json'), JSON.stringify(componentSize, null, 2), 'utf8');
fs.writeFileSync(path.join(schemesDir, 'style.json'), JSON.stringify(componentStyle, null, 2), 'utf8');

console.log(`✅ Successfully cleaned & split tokens JSON!`);
console.log(`📍 Monolithic: ${targetFile} (${(newSize / 1024).toFixed(1)} KB, ${reduction}% reduction)`);
console.log(`📂 Modular Files:`);
console.log(`   ├── tokens/primitive.json (${(fs.statSync(path.join(tokensDir, 'primitive.json')).size / 1024).toFixed(1)} KB)`);
console.log(`   ├── tokens/semantic.json (${(fs.statSync(path.join(tokensDir, 'semantic.json')).size / 1024).toFixed(1)} KB)`);
console.log(`   └── tokens/schemes/`);
console.log(`       ├── colors.json (${(fs.statSync(path.join(schemesDir, 'colors.json')).size / 1024).toFixed(1)} KB)`);
console.log(`       ├── size.json (${(fs.statSync(path.join(schemesDir, 'size.json')).size / 1024).toFixed(1)} KB)`);
console.log(`       └── style.json (${(fs.statSync(path.join(schemesDir, 'style.json')).size / 1024).toFixed(1)} KB)`);
console.log(`🗑️  Metadata Removed: ${removedType + removedDescription + removedScopes + removedOtherDollarKeys} fields (${collapsedValues} values collapsed)`);
