// example games:
// 1. squeeze! (mosquito flying, mouse control hand, space to squeeze)
// 2. find the target! (sniper find target, black screen, only middle center visible)
// 3. get the apple! (small platformer)
// 4. react! (throw poop / money, choose smile or mad)
// 5. dodge! (dodge fire balls)
// 6. eat! (cat avoid trap and eat fish)

import kaboom from "kaboom"
import type {
    EventController,
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

k.loadSound("cool", "sounds/cool.mp3")
k.loadSound("scream", "sounds/scream.mp3")

// TODO: limit ability
type GameKaboomCtx = KaboomCtx

export type API = {
	onActionPress: (action: () => void) => EventController,
	onActionRelease: (action: () => void) => EventController,
	onActionDown: (action: () => void) => EventController,
	onTimeout: (action: () => void) => void,
	onEnd: (action: () => void) => EventController,
	succeed: () => void,
	fail: () => void,
	width: number,
	height: number,
	// difficulty: 0 | 1 | 2,
}

export type Game = {
	prompt: string,
	author: string,
	onLoad?: (k: GameKaboomCtx) => void,
	onStart: (k: GameKaboomCtx, api: API) => GameObj,
}

const games = [
	getFishGame,
	squeezeGame,
]

let curGame = 0
let scene = null

function nextGame() {
	curGame = (curGame + 1) % games.length
	runGame(games[curGame])
}

function runGame(g: Game) {

	if (scene) {
		scene.destroy()
	}

	scene = k.add([
		k.timer(),
	])

	const onEndEvent = new k.Event()

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
		onEnd: (action) => onEndEvent.add(action),
		succeed: () => {
			k.play("cool")
			// TODO
			scene.wait(2, () => {
				nextGame()
				onEndEvent.trigger()
			})
		},
		fail: () => {
			k.play("scream")
			// TODO
			scene.wait(2, () => {
				nextGame()
				onEndEvent.trigger()
			})
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
				pos: k.vec2(0, k.wave(-2, 2, k.time() * 6 + idx * 0.5)),
				scale: k.wave(1, 1.1, k.time() * 6 + idx),
				angle: k.wave(-3, 3, k.time() * 6 + idx),
			}),
		}),
	])

}

async function init() {

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
