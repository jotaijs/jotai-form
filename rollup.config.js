/* eslint
  @typescript-eslint/no-var-requires: 0,
  import/no-extraneous-dependencies: 0,
  global-require: 0,
*/

const typescript = require('rollup-plugin-typescript2');
const { minify } = require('rollup-plugin-esbuild');
const { dirname, resolve, join } = require('path');

/** @returns {import("rollup").RollupOptions[]} */
module.exports = function config() {
  const builder = configBuilder();

  const pkg = require('./package.json');

  return builder.merge(
    // core
    builder.buildUMD('./src/index.ts', pkg.name, 'dist'),
    builder.buildESM('./src/index.ts', 'dist'),

    // react
    builder.buildUMD('./src/react/index.ts', 'jotai-form-react', 'dist/react'),
    builder.buildESM('./src/react/index.ts', 'dist/react'),

    // utils - zod
    builder.buildUMD('./src/utils/zod.ts', 'jotai-form-zod', 'dist/utils/zod'),
    builder.buildESM('./src/utils/zod.ts', 'dist/utils/zod'),
  );
};

function configBuilder({ env } = {}) {
  /** @type {Partial<import("rollup").RollupOptions>} */

  const isDev = env || process.env.NODE_ENV !== 'production';

  const getCommonPlugins = (input, output) =>
    [
      !isDev ? minify() : false,
      typescript({
        cwd: process.cwd(),
        useTsconfigDeclarationDir: true,
        tsconfig: './tsconfig.json',
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
            target: 'esnext',
          },
        },
        tsconfigDefaults: {
          compilerOptions: {
            declarationDir: join(resolve(output), dirname(input)),
            declaration: true,
          },
          files: [input],
        },
      }),
    ].filter(Boolean);

  return {
    merge(...configs) {
      return [].concat(configs).flat(1);
    },
    /** @returns {import("rollup").RollupOptions[]} */
    buildESM(input, output) {
      const plugins = getCommonPlugins(input, output);

      return [
        {
          input,
          output: {
            globals: {
              react: 'React',
            },
            dir: output,
            format: 'es',
            entryFileNames: '[name].modern.js',
          },
          plugins: [...plugins],
        },
        {
          input,
          output: {
            globals: {
              react: 'React',
            },
            dir: output,
            format: 'es',
            entryFileNames: '[name].modern.mjs',
          },
          plugins: [...plugins],
        },
      ];
    },
    /** @returns {import("rollup").RollupOptions[]} */
    buildUMD(input, name, output) {
      const plugins = getCommonPlugins(input, output);
      return [
        {
          input,
          output: {
            globals: {
              react: 'React',
            },
            format: 'umd',
            dir: output,
            name,
            entryFileNames: '[name].umd.js',
          },
          plugins: [...plugins],
        },
      ];
    },
  };
}
