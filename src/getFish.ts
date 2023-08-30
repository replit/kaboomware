import type { Game } from "./main"

const getFishGame: Game = {
	prompt: "Get Fish!",
	author: "tga",
	onLoad: (k) => {
	},
	onStart: (k, api) => {
		const scene = k.make([])
		return scene
	},
}

export default getFishGame
