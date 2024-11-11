import typescript from 'rollup-plugin-typescript2';

/** @type {import('rollup').RollupOptions} */
export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [typescript()],
};
