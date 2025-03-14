import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['cjs', 'esm', 'iife'],
    entry: ['./src/index.ts', './src/cli.ts'],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
});