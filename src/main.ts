// example games:
// 1. squeeze! (mosquito flying, mouse control hand, space to squeeze)
// 2. find the target! (sniper find target, black screen, only middle center visible)
// 3. get the apple! (small platformer)
// 4. react! (throw poop / money, choose smile or mad)
// 5. dodge! (dodge fire balls)

import kaboom from "kaboom"
import type {
	GameObj, KaboomCtx,
} from "kaboom"

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

type API = {
	onActionPress: (action: () => void) => void,
	onActionRelease: (action: () => void) => void,
	onActionDown: (action: () => void) => void,
	onTimeout: (action: () => void) => void,
	onEnd: (action: () => void) => void,
	succeed: () => void,
	width: number,
	height: number,
	k: GameKaboomCtx,
	// difficulty: 0 | 1 | 2,
}

type Game = {
	prompt: string,
	author: string,
	music?: string,
	onLoad?: () => void,
	onStart: (api: API) => GameObj,
}

const testGame: Game = {
	prompt: "squeeze!",
	author: "tga",
	music: "sounds/music.mp3",
	onLoad: () => {
		k.loadSound("squeeze", "sounds/squeeze.mp3")
		k.loadSound("fly", "sounds/fly.mp3")
		k.loadSprite("kitchen", "sprites/kitchen.jpg")
		k.loadAseprite("hand", "sprites/hand.png", "sprites/hand.json")
		k.loadAseprite("fly", "sprites/fly.png", "sprites/fly.json")
	},
	onStart: (api) => {
		const FLY_SPEED = 400
		const FLY_MARGIN = 200
		const buzzSound = k.play("fly", {
			loop: true,
			volume: 0.2,
		})
		const scene = k.make([])
		scene.add([
			k.sprite("kitchen", { width: api.width, height: api.height }),
		])
		const makeFly = () => {
			const fly = k.make([
				k.pos(
					k.rand(FLY_MARGIN, api.width - FLY_MARGIN),
					k.rand(FLY_MARGIN, api.height - FLY_MARGIN),
				),
				k.sprite("fly"),
				k.anchor("center"),
				"fly",
			])
			fly.play("fly", { speed: 10 })
			fly.onUpdate(() => {
				fly.pos.x += k.rand(-FLY_SPEED, FLY_SPEED) * k.dt()
				fly.pos.y += k.rand(-FLY_SPEED, FLY_SPEED) * k.dt()
			})
			return fly
		}
		scene.add(makeFly())
		scene.add(makeFly())
		scene.add(makeFly())
		const handOffset = k.vec2(-30, -140)
		const hand = scene.add([
			k.pos(k.mousePos().add(handOffset)),
			k.sprite("hand"),
		])
		hand.onUpdate(() => {
			hand.pos = k.mousePos().add(handOffset)
		})
		api.onActionPress(() => {
			k.play("squeeze")
			hand.frame = 1
			for (const fly of scene.get("fly")) {
				const pos = hand.pos.sub(handOffset)
				if (pos.dist(fly.pos) < 32) {
					fly.destroy()
					k.addKaboom(fly.pos)
					if (scene.get("fly").length === 0) {
						buzzSound.stop()
						api.succeed()
					}
				}
			}
		})
		api.onActionRelease(() => {
			hand.frame = 0
		})
		api.onEnd(() => {
			buzzSound.stop()
		})
		return scene
	},
}

const root = k.add([])

function runGame(g: Game) {

	if (g.music) {
		// k.play(g.music)
	}

	const scene = k.add([])

	const gameScene = g.onStart({
		k: k,
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
			size: 32,
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
		testGame,
	]

	for (const g of games) {
		if (g.onLoad) {
			g.onLoad()
		}
	}

	if (games.length === 0) {
		return
	}

	runGame(games[0])

}

init()
