import * as fs from "fs/promises"

const author = process.argv[2]
const game = process.argv[3]

if (!author || !game) {
	console.error("Must specify author and game name")
	console.error("$ npm run dev <author> <game>")
	process.exit(1)
}

const dir = `games/${author}/${game}`

const template = `
import type { Game, Button } from "kaboomware"

const game: Game = {

	prompt: "Squeeze!",
	author: "wario",
	hue: 0.6,

	onLoad: (k) => {
		// Load your assets here
	},

	onStart: (k) => {
		const scene = k.make()
		return scene
	},

}

export default game
`.trim()

const isDir = (path) =>
	fs
		.stat(path)
		.then((stat) => stat.isDirectory())
		.catch(() => false)

if (await isDir(dir)) {
	console.error(`Game already exists at ${dir}!`)
	process.exit(1)
}

await fs.mkdir(dir, { recursive: true })
await fs.mkdir(`${dir}/assets`, { recursive: true })
await fs.writeFile(`${dir}/game.ts`, template)

console.log(`Game created at ${dir}!`)
