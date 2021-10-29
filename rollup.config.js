import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "package/index.js",
    output: {
      file: pkg.main,
      format: "cjs",
      exports: "named",
    },
    external: ["react"],
    plugins: [
      babel({ exclude: "node_modules/**" }),
      resolve({ preferBuiltins: true, mainFields: ["browser"] }),
      replace({ "process.env.NODE_ENV": JSON.stringify("production") }),
      commonjs(),
      terser(),
    ],
  },
];
