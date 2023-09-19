import kaboom from "kaboom"

import {
	EventController,
	GameObj,
	KaboomCtx,
	Key,
} from "kaboom"

import apl386FontBytes from "./fonts/apl386.woff2"
import coolSoundBytes from "./sounds/cool.mp3"
import screamSoundBytes from "./sounds/scream.mp3"
import timerSpriteUrl from "./sprites/timer.png"
import heartSpriteUrl from "./sprites/heart.png"

const GAME_TIME = 4
const BG_S = 0.27
const BG_L = 0.52

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

export type GameAPI = {
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

export type GameCtx = Pick<KaboomCtx, typeof gameAPIs[number]> & GameAPI

export type Game = {
	/**
	 * Prompt of the mini game!
	 */
	prompt: string,
	/**
	 * Name of the author of the game.
	 */
	author: string,
	/**
	 * Hue of the background color (saturation: 27, lightness: 52)
	 */
	hue?: number,
	/**
	 * Load assets.
	 */
	onLoad?: (k: LoadCtx) => void,
	/**
	 * Main entry of the game code. Should return a game object made by `k.make()` that contains the whole game.
	 *
	 * @example
	 * ```js
	 * ```
	 */
	onStart: (ctx: GameCtx) => GameObj,
}

export default function run(games: Game[]) {

	const k = kaboom({
		font: "apl386",
		canvas: document.querySelector("#game"),
		width: 800,
		height: 600,
	})

	let curHue = 0.46
	let curPat = "heart"

	k.setBackground(k.hsl2rgb(curHue, BG_S, BG_L))

	k.onDraw(() => {

		const color = k.hsl2rgb(curHue, BG_S, BG_L - 0.04)
		const spr = k.getSprite(curPat)

		if (!spr || !spr.data) return

		const w = spr.data.width
		const h = spr.data.height
		const gap = 32
		const pad = 100
		const speed = 40
		const ox = (k.time() * speed) % (w + gap)
		const oy = (k.time() * speed) % (h + gap)
		let offset = false

		for (let x = -pad; x < k.width() + pad; x += w + gap) {
			for (let y = -pad; y < k.height() + pad; y += h + gap) {
				k.drawSprite({
					sprite: spr.data,
					color: color,
					pos: k.vec2(x + ox, y + oy + (offset ? (h + gap) / 2 : 0)),
					fixed: true,
					anchor: "center",
				})
			}
			// TODO: not working
			// offset = !offset
		}

	})

	// TODO: scope asset name?
	k.loadFont("apl386", apl386FontBytes, {
		outline: 8,
		filter: "linear",
	})

	k.loadSound("cool", coolSoundBytes.buffer)
	k.loadSound("scream", screamSoundBytes.buffer)
	k.loadSprite("timer", timerSpriteUrl)
	k.loadSprite("heart", heartSpriteUrl)

	const game = k.add([
		k.fixed(),
	])

	const margin = 20

	const title = game.add([
		k.pos(margin, margin),
		k.scale(1),
		bounce(),
		k.z(100),
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
				const cycle = Math.PI * 2 / bouncing.speed
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

	game.add([
		k.sprite("timer"),
		k.pos(k.width() - marginRight / 2, k.height() - marginBottom * 3),
		k.anchor("center"),
	])

	const TIMER_BAR_HEIGHT = 400

	const timerBar = game.add([
		k.rect(16, TIMER_BAR_HEIGHT, { radius: 8 }),
		k.outline(4),
		k.pos(k.width() - marginRight / 2, k.height() - marginBottom - 88),
		k.color(k.hsl2rgb(curHue, BG_S, BG_L - 0.15)),
		k.anchor("bot"),
	])

	const gameBox = game.add([
		k.pos(marginLeft, marginTop),
		k.rect(gw, gh, { radius: 16 }),
		k.mask(),
	])

	game.add([
		{
			draw() {
				k.drawRect({
					pos: k.vec2(marginLeft, marginTop),
					width: gw,
					height: gh,
					radius: 8,
					fill: false,
					outline: {
						width: 4,
						color: k.rgb(0, 0, 0),
					},
				})
			},
		}
	])

	let curGame = 0

	function nextGame() {
		curGame = (curGame + 1) % games.length
		runGame(games[curGame])
	}

	function runGame(g: Game) {

		curHue = g.hue ?? k.rand(0, 1)
		k.setBackground(k.hsl2rgb(curHue, BG_S, BG_L))
		timerBar.color = k.hsl2rgb(curHue, BG_S, BG_L - 0.15)

		title.text = g.prompt
		title.bounce(2, 8)

		k.camPos(k.center())
		k.camRot(0)
		k.camScale(1, 1)

		gameBox.removeAll()

		const scene = gameBox.add([
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

		let time = 0

		const gameTimer = scene.onUpdate(() => {
			time += k.dt()
			timerBar.height = TIMER_BAR_HEIGHT * (1 - time / GAME_TIME)
			if (time >= GAME_TIME) {
				onTimeoutEvent.trigger()
				fail()
			}
		})

		const ctx = {}

		for (const api of gameAPIs) {
			ctx[api] = k[api]
		}

		// TODO: custom cam
		const api: GameAPI = {
			onButtonPress: (btn, action) => {
				if (btn === "action") {
					return k.EventController.join([
						scene.onKeyPress("space", action),
						scene.onMousePress("left", action),
					])
				}
				return scene.onKeyPress(btn, action)
			},
			onButtonRelease: (btn, action) => {
				if (btn === "action") {
					return k.EventController.join([
						scene.onKeyRelease("space", action),
						scene.onMouseRelease("left", action),
					])
				}
				return scene.onKeyRelease(btn, action)
			},
			onButtonDown: (btn, action) => {
				if (btn === "action") {
					return k.EventController.join([
						scene.onKeyDown("space", action),
						scene.onMouseDown("left", action),
					])
				}
				return scene.onKeyDown(btn, action)
			},
			onTimeout: (action) => onTimeoutEvent.add(action),
			onEnd: (action) => onEndEvent.add(action),
			succeed: succeed,
			fail: fail,
			difficulty: 0,
		}

		const gameScene = g.onStart({
			...ctx,
			width: () => gameBox.width,
			height: () => gameBox.height,
			mousePos: () => k.mousePos().sub(gameBox.pos),
			...api,
		} as unknown as GameCtx)

		scene.add(gameScene)

		// const speech = new SpeechSynthesisUtterance(g.prompt)
		// speechSynthesis.speak(speech)

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
