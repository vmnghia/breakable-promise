import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'umd',
      name: 'FragilePromise',
      compact: true
    },
    plugins: [typescript(), terser()],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'es',
      compact: true
    },
    plugins: [typescript(), terser()],
  },
];
