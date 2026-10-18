// Bundles a TypeScript tool with esbuild and runs it in Node.
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const entry = process.argv[2];
if (!entry) { console.error('usage: node tools/run-ts.mjs <file.ts> [args]'); process.exit(1); }
mkdirSync('.cache', { recursive: true });
const out = path.resolve('.cache', path.basename(entry).replace(/\.ts$/, '.mjs'));
await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error', define: { __DEV__: 'true' } });
process.argv.splice(2, 1);
await import(pathToFileURL(out).href);
