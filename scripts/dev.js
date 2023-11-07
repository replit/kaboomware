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
	await fs.rm("www", { recursive: true })
} catch {}
await fs.mkdir("www")
await fs.symlink(path.relative("www", `${dir}/assets`), "www/assets")
await fs.writeFile("www/index.html", html)

await ctx.watch()

const { port } = await ctx.serve({
	servedir: "www",
})

console.log(`http://localhost:${port}`)
