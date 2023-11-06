import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import * as path from "path"

const author = process.argv[2]
const game = process.argv[3]

if (!author || !game) {
	console.error("Must specify author and game name")
	console.error("$ npm run dev <author> <game>")
	process.exit(1)
}

const dir = `games/${author}/${game}`

const ctx = await esbuild.context({
	entryPoints: [ "src/dev.ts" ],
	outfile: "www/bundle.js",
	bundle: true,
	sourcemap: true,
	keepNames: true,
	format: "esm",
	loader: {
		".png": "dataurl",
		".mp3": "binary",
		".woff2": "binary",
	},
	alias: {
		"game": `./${dir}/game`,
	},
})

try {
	await fs.unlink("www/assets")
} catch {}
await fs.symlink(path.relative("www", `${dir}/assets`), "www/assets")

await ctx.watch()

const { port } = await ctx.serve({
	servedir: "www",
})

console.log(`http://localhost:${port}`)
