import esbuild from "esbuild"

const ctx = await esbuild.context({
	bundle: true,
	loader: {
		".png": "dataurl",
		".glsl": "text",
		".mp3": "binary",
		".ttf": "binary",
	},
	keepNames: true,
	entryPoints: [ "examples/main.ts" ],
	outfile: "examples/main.js",
})

await ctx.watch()

const { host, port } = await ctx.serve({
	servedir: "examples",
})

console.log(`http://localhost:${port}`)
