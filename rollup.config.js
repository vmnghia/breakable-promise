import typescript from 'rollup-plugin-typescript2';

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'umd',
      name: 'FragilePromise'
    },
    plugins: [typescript()],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'es',
    },
    plugins: [typescript()],
  },
];
