import esbuild from "esbuild"

esbuild.build({
	entryPoints: [ "src/kaboomware.ts" ],
	outfile: "dist/kaboomware.js",
	bundle: true,
	sourcemap: true,
	keepNames: true,
	loader: {
		".png": "dataurl",
		".glsl": "text",
		".mp3": "binary",
		".ttf": "binary",
	},
	minify: true,
})
