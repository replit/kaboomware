// example games:
// 1. squeeze! (mosquito flying, mouse control hand, space to squeeze)
// 2. find the target! (sniper find target, black screen, only middle center visible)
// 3. get the apple! (small platformer)
// 4. react! (throw poop / money, choose smile or mad)
// 5. dodge! (dodge fire balls)
// 6. eat! (cat avoid trap and eat fish)

import kaboom from "kaboom"
import type {
	GameObj,
	KaboomCtx,
} from "kaboom"
import squeezeGame from "./squeeze"
import getFishGame from "./getFish"

const TIME = 4

const k = kaboom({
	font: "apl386",
	canvas: document.querySelector("#game"),
	width: 640,
	height: 480,
})

k.loadFont("apl386", "fonts/apl386.ttf", {
	outline: 8,
	filter: "linear",
})

// TODO: limit ability
type GameKaboomCtx = KaboomCtx

export type API = {
	onActionPress: (action: () => void) => void,
	onActionRelease: (action: () => void) => void,
	onActionDown: (action: () => void) => void,
	onTimeout: (action: () => void) => void,
	onEnd: (action: () => void) => void,
	succeed: () => void,
	width: number,
	height: number,
	// difficulty: 0 | 1 | 2,
}

export type Game = {
	prompt: string,
	author: string,
	music?: string,
	onLoad?: (k: GameKaboomCtx) => void,
	onStart: (k: GameKaboomCtx, api: API) => GameObj,
}

const root = k.add([])

function runGame(g: Game) {

	if (g.music) {
		// k.play(g.music)
	}

	const scene = k.add([])

	const gameScene = g.onStart(k, {
		width: k.width(),
		height: k.height(),
		// TODO: also support click
		onActionPress: (action) => scene.onKeyPress("space", action),
		onActionRelease: (action) => scene.onKeyRelease("space", action),
		onActionDown: (action) => scene.onKeyDown("space", action),
		onTimeout: () => {
			// TODO
		},
		onEnd: () => {
			// TODO
		},
		succeed: () => {
			// TODO
		},
	})

	scene.add(gameScene)

	// const speech = new SpeechSynthesisUtterance(g.prompt)
	// speechSynthesis.speak(speech)

	const textMargin = 20

	scene.add([
		k.pos(textMargin, textMargin),
		k.z(100),
		k.text(g.prompt, {
			size: 40,
			width: k.width() - textMargin * 2,
			lineSpacing: 16,
			transform: (idx, ch) => ({
				pos: k.vec2(0, k.wave(-2, 2, k.time() * 4 + idx * 0.5)),
				scale: k.wave(1, 1.1, k.time() * 3 + idx),
				angle: k.wave(-3, 3, k.time() * 3 + idx),
			}),
		}),
	])

}

async function init() {

	const games = [
		squeezeGame,
		getFishGame,
	]

	for (const g of games) {
		if (g.onLoad) {
			g.onLoad(k)
		}
	}

	if (games.length === 0) {
		return
	}

	runGame(games[0])

}

init()
