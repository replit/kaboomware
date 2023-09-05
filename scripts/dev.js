import * as esbuild from "esbuild"

const ctx = await esbuild.context({
	entryPoints: [ "example/main.ts" ],
	outfile: "example/dist/bundle.js",
	bundle: true,
	sourcemap: true,
	keepNames: true,
	loader: {
		".png": "dataurl",
		".mp3": "binary",
		".woff2": "binary",
	},
	alias: {
		"kaboomware": "./src/kaboomware",
	}
})

await ctx.watch()

const { host, port } = await ctx.serve({
	servedir: "example",
})

console.log(`http://localhost:${port}`)
