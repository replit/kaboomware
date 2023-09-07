import type { Game, Button } from "kaboomware"

const SPEED = 240

const shootGame: Game = {

	prompt: "Snipe!",
	author: "tga",

	onLoad: (k) => {
	},

	onStart: (k) => {

		const scene = k.make()

		return scene

	},

}

export default shootGame
