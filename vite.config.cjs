// vite.config.cjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";
import { defineConfig } from "vite";
import fs from "fs/promises";
import postcss from "postcss";
import cssnano from "cssnano";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cssnanoAggressive = cssnano({
  preset: [
    "default",
    {
      discardComments: { removeAll: true },
      normalizeWhitespace: true,
      cssDeclarationSorter: true,
      reduceIdents: true,
      mergeRules: true,
      mergeIdents: true,
      minifyFontValues: { removeQuotes: true },
      minifyParams: true,
      normalizeUrl: true,
      svgo: true,
    },
  ],
});

function minifyScss(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(line => {
      const commentIndex = line.indexOf('//');
      if (commentIndex !== -1 && (commentIndex === 0 || line[commentIndex - 1] !== ':')) {
        return line.substring(0, commentIndex);
      }
      return line;
    })
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/\s+/g, ' ');
}

function copyAndMinifyTokens() {
  return {
    name: 'copy-and-minify-tokens',
    async writeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      await fs.rm(distDir, { recursive: true, force: true });
      await fs.mkdir(distDir, { recursive: true });

      const files = globSync('**/*.{scss,css}', {
        cwd: __dirname,
        ignore: ['dist/**', 'node_modules/**', 'index.js'],
        nodir: true
      });

      for (const file of files) {
        const srcPath = path.resolve(__dirname, file);
        const destPath = path.resolve(distDir, file);
        await fs.mkdir(path.dirname(destPath), { recursive: true });

        const content = await fs.readFile(srcPath, 'utf8');

        if (file.endsWith('.scss')) {
          const minified = minifyScss(content);
          await fs.writeFile(destPath, minified, 'utf8');
        } else if (file.endsWith('.css')) {
          const result = await postcss([cssnanoAggressive]).process(content, {
            from: srcPath,
            to: destPath,
          });
          await fs.writeFile(destPath, result.css, 'utf8');
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [
    copyAndMinifyTokens()
  ],
  build: {
    target: "esnext",
    lib: {
      // Use the real empty index.js file (must exist)
      entry: path.resolve(__dirname, 'index.js'),
      formats: ["es"],
    },
    minify: false,
    sourcemap: false
  }
});