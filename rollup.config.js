import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { builtinModules, createRequire } from "module";
import dts from "rollup-plugin-dts";
import { glob } from 'glob';
import path from "path";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const getAllSourceModules = () => {
    return glob.sync([
      'src/*/index.ts',
      'src/*/*/index.ts'
    ]).map((module) => path.posix.normalize(module).replace(/\\/g, "/"));
}


export default [
	// Bundle for CommonJS and ESM with preserved module structure
	{
		input: ["index.ts", ...getAllSourceModules()],
		external: [...Object.keys(pkg.dependencies || {}), ...builtinModules],
		plugins: [
			resolve({ extensions: [".js", ".ts"], preferBuiltins: true, modulesOnly: true }),
			commonjs(),
			typescript({
				tsconfig: "./tsconfig.json",
				declaration: false,
				outDir: undefined,
				rootDir: "./",
				exclude: ["node_modules", "dist"],
			}),
		],
		output: [
			{
				dir: "dist/cjs",
				format: "cjs",
				sourcemap: true,
				preserveModules: true,
				preserveModulesRoot: "src",
				entryFileNames: "[name].cjs"
			},
			{
				dir: "dist/esm",
				format: "esm",
				sourcemap: true,
				preserveModules: true,
				preserveModulesRoot: "src",
			},
		],
	},
	// Generate declaration files
	{
		input: ["index.ts", ...getAllSourceModules()],
		external: [...Object.keys(pkg.dependencies || {}), ...builtinModules],
		plugins: [dts()],
		output: [
			{
				dir: "dist/types",
				preserveModules: true,
				preserveModulesRoot: ".",
			},
		],
	},
];
