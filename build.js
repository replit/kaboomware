import esbuild from "esbuild"

esbuild.build({
	bundle: true,
	loader: {
		".png": "dataurl",
		".glsl": "text",
		".mp3": "binary",
		".ttf": "binary",
	},
	sourcemap: true,
	minify: true,
	keepNames: true,
	entryPoints: [ "src/kaboomware.ts" ],
	outfile: "dist/kaboomware.js",
})
