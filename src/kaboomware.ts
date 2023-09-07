import kaboom from "kaboom"

import type {
	EventController,
	GameObj,
	KaboomCtx,
	Key,
} from "kaboom"

import apl386FontBytes from "./fonts/apl386.woff2"
import coolSoundBytes from "./sounds/cool.mp3"
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
	"width",
	"height",
	"mousePos",
	"mouseDeltaPos",
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
	"addKaboom",
	"debug",
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
		width: 800,
		height: 600,
	})

	// k.setBackground(132, 101, 236)

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

	const ui = k.add([
		k.fixed(),
		k.z(100),
	])
	const margin = 20

	const title = ui.add([
		k.pos(margin, margin),
		k.scale(1),
		bounce(),
		k.text("", {
			size: 40,
			width: k.width() - margin * 2,
			lineSpacing: 16,
			// transform: (idx, ch) => ({
				// pos: k.vec2(0, k.wave(-2, 2, k.time() * 6 + idx * 0.5)),
				// scale: k.wave(1, 1.1, k.time() * 6 + idx),
				// angle: k.wave(-3, 3, k.time() * 6 + idx),
			// }),
		}),
	])

	function bounce() {
		let time = 0
		let bouncing = null
		return {
			require: [ "scale" ],
			bounce(scale: number = 1.2, speed: number = 1) {
				time = 0
				bouncing = {
					scale: scale,
					speed: speed,
				}
			},
			update() {
				if (!bouncing) return
				time += k.dt()
				let s = k.wave(1, bouncing.scale, time * bouncing.speed)
				// TODO: why
				const cycle = (Math.PI * 1.5) / bouncing.speed
				if (time >= cycle) {
					bouncing = null
					time = 0
					s = 1
				}
				this.scaleTo(s)
			},
		}
	}

	// TODO: use title.height
	const marginTop = 40 + margin * 2 + 4
	const marginBottom = margin
	const marginLeft = margin
	const marginRight = 80
	const gw = k.width() - marginLeft - marginRight
	const gh = k.height() - marginTop - marginBottom

	const root = k.add([
		k.pos(marginLeft, marginTop),
		k.mask(),
		k.rect(gw, gh, { radius: 16 }),
	])

	let curGame = 0

	function nextGame() {
		curGame = (curGame + 1) % games.length
		runGame(games[curGame])
	}

	function runGame(g: Game) {

		title.text = g.prompt
		title.bounce(2, 4)

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
			width: () => root.width,
			height: () => root.height,
			mousePos: () => k.mousePos().sub(root.pos),
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
