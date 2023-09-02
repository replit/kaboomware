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

const GAME_TIME = 4

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

type LoadCtx = Pick<KaboomCtx, typeof loadAPIs[number]>

type GameCtx = Pick<KaboomCtx, typeof gameAPIs[number]> & {
	/**
	 * Register an event that runs once when the action button ("space" key or left mouse click) is pressed.
	 */
	onActionPress: (action: () => void) => EventController,
	/**
	 * Register an event that runs once when the action button ("space" key or left mouse click) is released.
	 */
	onActionRelease: (action: () => void) => EventController,
	/**
	 * Register an event that runs every frame when the action button ("space" key or left mouse click) is held down.
	 */
	onActionDown: (action: () => void) => EventController,
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

const games = [
	getFishGame,
	squeezeGame,
]

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
		onActionPress: (action) => k.EventController.join([
			scene.onKeyPress("space", action),
			scene.onMousePress("left", action),
		]),
		onActionRelease: (action) => k.EventController.join([
			scene.onKeyRelease("space", action),
			scene.onMouseRelease("left", action),
		]),
		onActionDown: (action) => k.EventController.join([
			scene.onKeyDown("space", action),
			scene.onMouseDown("left", action),
		]),
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

async function init() {

	const ctx = {}

	for (const api of loadAPIs) {
		ctx[api] = k[api]
	}

	for (const g of games) {
		if (g.onLoad) {
			g.onLoad(ctx as LoadCtx)
		}
	}

	if (games.length === 0) {
		return
	}

	runGame(games[0])

}

init()
