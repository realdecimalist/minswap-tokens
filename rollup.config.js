import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import copy from "rollup-plugin-copy";

const externalRegex = /^[./]/;

const name = require("./package.json").main.replace(/\.js$/, "");

const bundle = (config) => ({
  ...config,
  input: "src/index.ts",
  external: (id) => !externalRegex.test(id),
});

export default [
  bundle({
    plugins: [
      esbuild(),
      copy({
        targets: [{ src: "src/tokens/**/*", dest: "build/tokens" }],
      }),
    ],
    output: [
      {
        file: `${name}.js`,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: `${name}.es.js`,
        format: "es",
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: "es",
    },
  }),
];
