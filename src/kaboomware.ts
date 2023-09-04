import kaboom from "kaboom"

import type {
    EventController,
	GameObj,
	KaboomCtx,
	Key,
} from "kaboom"

// @ts-ignore
import apl386FontBytes from "./fonts/apl386.ttf"
// @ts-ignore
import coolSoundBytes from "./sounds/cool.mp3"
// @ts-ignore
import screamSoundBytes from "./sounds/scream.mp3"

const GAME_TIME = 4

const loadAPIs = [
	"loadSprite",
	"loadSpriteAtlas",
	"loadAseprite",
	"loadPedit",
	"loadBean",
	"loadJSON",
	"loadSound",
	"loadFont",
	"loadBitmapFont",
	"loadShader",
	"loadShaderURL",
	"load",
	"loadProgress",
] as const

const gameAPIs = [
	"make",
	"pos",
	"scale",
	"rotate",
	"color",
	"opacity",
	"sprite",
	"text",
	"rect",
	"circle",
	"uvquad",
	"area",
	"anchor",
	"z",
	"outline",
	"body",
	"doubleJump",
	"move",
	"offscreen",
	"follow",
	"shader",
	"timer",
	"fixed",
	"stay",
	"health",
	"lifespan",
	"state",
	"fadeIn",
	"play",
	"rand",
	"randi",
	"dt",
	"time",
	"vec2",
	"rgb",
	"hsl2rgb",
	"choose",
	"chance",
	"easings",
	"map",
	"mapc",
	"wave",
	"deg2rad",
	"rad2deg",
	"clamp",
	"mousePos",
	"mouseDeltaPos",
	"addKaboom",
	"camPos",
	"camScale",
	"camRot",
	"center",
	"isFocused",
	"isTouchscreen",
	"LEFT",
	"RIGHT",
	"UP",
	"DOWN",
] as const

export type Button =
	| "action"
	| "left"
	| "right"
	| "up"
	| "down"

export type LoadCtx = Pick<KaboomCtx, typeof loadAPIs[number]>

export type GameCtx = Pick<KaboomCtx, typeof gameAPIs[number]> & {
	/**
	 * Register an event that runs once when a button is pressed.
	 */
	onButtonPress: (btn: Button, action: () => void) => EventController,
	/**
	 * Register an event that runs once when a button is released.
	 */
	onButtonRelease: (btn: Button, action: () => void) => EventController,
	/**
	 * Register an event that runs every frame when a button is held down.
	 */
	onButtonDown: (btn: Button, action: () => void) => EventController,
	/**
	 * Register an event that runs once when timer runs out.
	 */
	onTimeout: (action: () => void) => void,
	/**
	 * Register an event that runs once when game ends, either succeeded, failed or timed out.
	 */
	onEnd: (action: () => void) => EventController,
	/**
	 * Run this when player succeeded in completing the game.
	 */
	succeed: () => void,
	/**
	 * Run this when player failed.
	 */
	fail: () => void,
	/**
	 * Width of the viewport.
	 */
	width: () => number,
	/**
	 * Height of the viewport.
	 */
	height: () => number,
	/**
	 * Current difficulty.
	 */
	difficulty: 0 | 1 | 2,
}

export type Game = {
	prompt: string,
	author: string,
	onLoad?: (k: LoadCtx) => void,
	onStart: (ctx: GameCtx) => GameObj,
}

export default function run(games: Game[]) {

	const k = kaboom({
		font: "apl386",
		canvas: document.querySelector("#game"),
		width: 640,
		height: 480,
	})

	k.loadFont("apl386", apl386FontBytes, {
		outline: 8,
		filter: "linear",
	})

	k.loadSound("cool", coolSoundBytes.buffer)
	k.loadSound("scream", screamSoundBytes.buffer)

	function buttonToKey(btn: Button) {
		if (btn === "action") return "space"
		return btn
	}

	let curGame = 0
	const root = k.add()

	function nextGame() {
		curGame = (curGame + 1) % games.length
		runGame(games[curGame])
	}

	function runGame(g: Game) {

		k.camPos(k.center())
		k.camRot(0)
		k.camScale(1, 1)

		root.removeAll()

		const scene = root.add([
			k.timer(),
		])

		const onEndEvent = new k.Event()
		const onTimeoutEvent = new k.Event()
		let done = false

		const succeed = () => {
			if (done) return
			done = true
			gameTimer.cancel()
			onTimeoutEvent.clear()
			k.play("cool")
			scene.wait(2, () => {
				nextGame()
				onEndEvent.trigger()
			})
		}

		const fail = () => {
			if (done) return
			done = true
			gameTimer.cancel()
			onTimeoutEvent.clear()
			k.play("scream")
			scene.wait(2, () => {
				nextGame()
				onEndEvent.trigger()
			})
		}

		const gameTimer = scene.wait(GAME_TIME, () => {
			onTimeoutEvent.trigger()
			fail()
		})

		const ctx = {}

		for (const api of gameAPIs) {
			ctx[api] = k[api]
		}

		const gameScene = g.onStart({
			...ctx,
			width: () => k.width(),
			height: () => k.height(),
			onButtonPress: (btn, action) => scene.onKeyPress(buttonToKey(btn), action),
			onButtonRelease: (btn, action) => scene.onKeyRelease(buttonToKey(btn), action),
			onButtonDown: (btn, action) => scene.onKeyDown(buttonToKey(btn), action),
			onTimeout: (action) => onTimeoutEvent.add(action),
			onEnd: (action) => onEndEvent.add(action),
			succeed: succeed,
			fail: fail,
		} as unknown as GameCtx)

		scene.add(gameScene)

		const speech = new SpeechSynthesisUtterance(g.prompt)
		speechSynthesis.speak(speech)

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

	const loadCtx = {}

	for (const api of loadAPIs) {
		loadCtx[api] = k[api]
	}

	for (const g of games) {
		if (g.onLoad) {
			g.onLoad(loadCtx as LoadCtx)
		}
	}

	if (games[0]) {
		runGame(games[0])
	}

}
