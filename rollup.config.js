import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import pkg from "./package.json"
import resolve from "rollup-plugin-node-resolve"

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
      babel({
        exclude: "node_modules/**",
      }),
      resolve(),
      commonjs(),
    ],
  },
]
