import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import * as path from "path"

const [author, game] = (process.argv[2] ?? "").split(":")

if (!author || !game) {
	console.error("Must specify author and game name")
	console.error("$ npm run dev {author}:{game}")
	process.exit(1)
}

const dir = `games/${author}/${game}`

const code = `
import kaboomware from "kaboomware"
import game from "./../${dir}/game"

kaboomware([
	game,
], {
	dev: true,
	letterbox: true,
	background: [0, 0, 0],
})
`.trim()

const html = `
<!DOCTYPE html>
<html>
<head>
	<title>kaboomware</title>
</head>
<body>
	<script src="bundle.js" type="module"></script>
</body>
</html>
`.trim()

try {
	await fs.rm(".tmp", { recursive: true })
} catch {}
await fs.mkdir(".tmp", { recursive: true })
await fs.writeFile(".tmp/main.ts", code)
await fs.writeFile(".tmp/index.html", html)
await fs.symlink(path.relative(".tmp", `${dir}/assets`), ".tmp/assets")

const ctx = await esbuild.context({
	entryPoints: [ ".tmp/main.ts" ],
	outfile: ".tmp/bundle.js",
	bundle: true,
	sourcemap: true,
	keepNames: true,
	format: "esm",
	loader: {
		".png": "dataurl",
		".mp3": "binary",
		".woff2": "binary",
	},
})

await ctx.watch()

const { port } = await ctx.serve({
	servedir: ".tmp",
})

console.log(`http://localhost:${port}`)
