import * as esbuild from "esbuild"

await esbuild.build({
	entryPoints: [ "src/kaboomware.ts" ],
	outfile: "dist/kaboomware.js",
	bundle: true,
	sourcemap: true,
	keepNames: true,
	loader: {
		".png": "dataurl",
		".mp3": "binary",
		".woff2": "binary",
	},
	minify: true,
})
