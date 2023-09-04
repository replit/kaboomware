import esbuild from "esbuild"

const ctx = await esbuild.context({
	entryPoints: [ "example/main.ts" ],
	outfile: "example/bundle.js",
	bundle: true,
	sourcemap: true,
	keepNames: true,
	loader: {
		".png": "dataurl",
		".glsl": "text",
		".mp3": "binary",
		".ttf": "binary",
	},
})

await ctx.watch()

const { host, port } = await ctx.serve({
	servedir: "example",
})

console.log(`http://localhost:${port}`)
