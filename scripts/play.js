import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import * as path from "path"

const games = process.argv.slice(2).map((g) => {
	const [author, game] = g.split(":")
	if (!author || !game) {
		console.error("Incorrect format")
		console.error("$ npm run play {author}:{game} {author}:{game} ...")
		process.exit(1)
	}
	return { author, game }
})

if (games.length === 0) {
	process.exit(0)
}

const code = `
import kaboomware from "kaboomware"

${games.map(({ author, game }, i) => {
	return `import game${i} from "./../games/${author}/${game}/game"`
}).join("\n")}

kaboomware([
${games.map(({ author, game }, i) => {
	return `\t{ ...game${i}, urlPrefix: "games/${author}/${game}/" },`
}).join("\n")}
], {
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
await fs.symlink(path.relative(".tmp", "games"), ".tmp/games")

// TODO: assets

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
