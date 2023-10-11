import kaboom from "kaboom"

import type {
	KaboomOpt,
	EventController,
	GameObj,
	KaboomCtx,
	Key,
	Color,
	Vec2,
} from "kaboom"

import apl386FontBytes from "./fonts/apl386.woff2"
import coolSoundBytes from "./sounds/cool.mp3"
import screamSoundBytes from "./sounds/scream.mp3"
import timerSpriteUrl from "./sprites/timer.png"
import heartSpriteUrl from "./sprites/heart.png"
import useConfetti from "./confetti"

const GAME_TIME = 4
export const BG_S = 0.27
export const BG_L = 0.52

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
	"lerp",
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
	"drawSprite",
	"drawText",
	"formatText",
	"drawRect",
	"drawLine",
	"drawLines",
	"drawTriangle",
	"drawCircle",
	"drawEllipse",
	"drawUVQuad",
	"drawPolygon",
	"drawFormattedText",
	"drawMasked",
	"drawSubtracted",
	"pushTransform",
	"popTransform",
	"pushTranslate",
	"pushScale",
	"pushRotate",
	"pushMatrix",
	"LEFT",
	"RIGHT",
	"UP",
	"DOWN",
	"addKaboom",
	"debug",
	"Timer",
	"Line",
	"Rect",
	"Circle",
	"Polygon",
	"Vec2",
	"Color",
	"Mat4",
	"Quad",
	"RNG",
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
	onTimeout: (action: () => void) => EventController,
	/**
	 * Register an event that runs once when game ends, either succeeded, failed or timed out.
	 */
	onEnd: (action: () => void) => EventController,
	/**
	 * Run this when player succeeded in completing the game.
	 */
	win: () => void,
	/**
	 * Run this when player failed.
	 */
	lose: () => void,
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

export type Opts = {
	/**
	 * Development mode (no timer).
	 */
	dev?: boolean,
	scale?: KaboomOpt["scale"],
	letterbox?: KaboomOpt["letterbox"],
	background?: KaboomOpt["background"],
	canvas?: KaboomOpt["canvas"],
	root?: KaboomOpt["root"],
	stretch?: KaboomOpt["stretch"],
	pixelDensity?: KaboomOpt["pixelDensity"],
	crisp?: KaboomOpt["crisp"],
	gamepads?: KaboomOpt["gamepads"],
	maxFPS?: KaboomOpt["maxFPS"],
}

export type KaboomWareCtx = {
	onChange: (action: (g: Game) => void) => EventController,
	curGame: () => Game,
}

export default function kaboomware(games: Game[], opt: Opts = {}): KaboomWareCtx {

	const k = kaboom({
		...opt,
		font: "apl386o",
		width: 800,
		height: 600,
	})

	const confetti = useConfetti(k)
	const onChangeEvent = new k.Event<[Game]>()

	let curHue = 0.46
	let curPat = "heart"

	// TODO: scope asset name
	k.loadFont("apl386", apl386FontBytes, { filter: "linear" })
	k.loadFont("apl386o", apl386FontBytes, { outline: 8, filter: "linear" })
	k.loadSound("cool", coolSoundBytes.buffer)
	k.loadSound("scream", screamSoundBytes.buffer)
	k.loadSprite("timer", timerSpriteUrl)
	k.loadSprite("heart", heartSpriteUrl)

	const loadCtx = {}

	// TODO: report error msg when calling forbidden functions
	for (const api of loadAPIs) {
		loadCtx[api] = k[api]
	}

	for (const g of games) {
		if (g.onLoad) {
			g.onLoad(loadCtx as LoadCtx)
		}
	}

	const game = k.add([
		k.fixed(),
		k.pos(),
		shake(),
	])

	game.onDraw(() => {

		const bg = k.hsl2rgb(curHue, BG_S, BG_L)
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

		k.drawRect({
			width: k.width(),
			height: k.height(),
			color: bg,
		})

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

	const bloodEye = k.add([
		k.rect(k.width(), k.height()),
		k.color(255, 0, 0),
		k.z(1000),
		k.opacity(0),
	])

	bloodEye.onUpdate(() => {
		bloodEye.opacity = k.lerp(bloodEye.opacity, 0, k.dt())
	})

	let score = 0
	let curGame = 0

	k.onLoad(() => {

		function nextGame() {
			curGame = (curGame + 1) % games.length
			runGame(games[curGame])
		}

		function runGame(g: Game) {

			onChangeEvent.trigger(g)

			if (g.prompt.length > 12) {
				throw new k.KaboomError("Prompt cannot exceed 12 characters!")
			}

			game.removeAll()
			curHue = g.hue ?? k.rand(0, 1)

			const margin = 20

			const title = game.add([
				k.pos(margin, margin),
				k.scale(1),
				bounce(),
				k.z(100),
				k.text(g.prompt, {
					size: 40,
					// width: k.width() - margin * 2,
					lineSpacing: 16,
					transform: (idx, ch) => ({
						pos: k.vec2(0, k.wave(-1, 1, k.time() * 4 + idx * 0.5)),
						scale: k.wave(1, 1.05, k.time() * 4 + idx),
						angle: k.wave(-2, 2, k.time() * 4 + idx),
					}),
				}),
			])

			// title.bounce(2, 8)

			const author = k.make([
				k.pos(12, 8),
				k.text(`by ${g.author}`, { size: 28, font: "apl386" }),
			])

			const authorBox = game.add([
				k.pos(margin + title.width + 16, margin + 4),
				k.rect(
					author.width + author.pos.x * 2,
					author.height + author.pos.y * 2,
					{ radius: 16 },
				),
				k.color(k.hsl2rgb(curHue, BG_S, BG_L - 0.15)),
			])

			authorBox.add(author)

			const marginTop = title.height + margin * 2 + 4
			const marginBottom = margin
			const marginLeft = margin
			const marginRight = 80
			const gw = k.width() - marginLeft - marginRight
			const gh = k.height() - marginTop - marginBottom

			game.add([
				k.sprite("timer"),
				k.pos(k.width() - marginRight / 2, k.height() - marginBottom * 3),
				k.anchor("center"),
				k.scale(),
				{
					update() {
						this.scaleTo(k.wave(1, 1.05, k.time() * 8))
					},
				}
			])

			const TIMER_BAR_HEIGHT = 400

			const timerBar = game.add([
				k.rect(16, TIMER_BAR_HEIGHT, { radius: 8 }),
				k.outline(4),
				k.pos(k.width() - marginRight / 2, k.height() - marginBottom - 88),
				k.color(k.hsl2rgb(curHue, BG_S, BG_L - 0.15)),
				k.opacity(1),
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
							radius: 16,
							fill: false,
							outline: {
								width: 4,
								color: k.rgb(0, 0, 0),
							},
						})
					},
				}
			])

			const scene = gameBox.add([
				k.timer(),
			])

			const onEndEvent = new k.Event()
			const onTimeoutEvent = new k.Event()
			let done = false

			const win = () => {
				if (done) return
				done = true
				gameTimer.cancel()
				onTimeoutEvent.clear()
				k.play("cool")
				score += 1
				scene.wait(2, () => {
					nextGame()
					onEndEvent.trigger()
				})
			}

			const lose = () => {
				if (done) return
				bloodEye.opacity = 0.5
				game.shake(24)
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
				const r = time / GAME_TIME
				timerBar.height = TIMER_BAR_HEIGHT * (1 - r)
				if (r >= 0.6) {
					timerBar.opacity = k.wave(0.5, 1, time * 16)
				}
				if (time >= GAME_TIME) {
					onTimeoutEvent.trigger()
					// TODO
					lose()
				}
			})

			if (opt.dev) {
				gameTimer.cancel()
			}

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
				win: win,
				lose: lose,
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

		if (games[0]) {
			runGame(games[0])
		}

	})

	function shake() {
		let shake = 0
		return {
			shake(s) {
				shake = s
			},
			update() {
				shake = k.lerp(shake, 0, k.dt() * 4)
				this.pos = k.Vec2.fromAngle(k.rand(0, 360)).scale(shake)
			},
		}
	}

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

	return {
		onChange: (action) => onChangeEvent.add(action),
		curGame: () => games[curGame],
	}

}
