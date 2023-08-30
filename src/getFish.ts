import type { Key } from "kaboom"
import type { Game } from "./main"

const SPEED = 240

const getFishGame: Game = {
	prompt: "Get Fish!",
	author: "tga",
	onLoad: (k) => {
		k.loadSound("walk", "sounds/walk.mp3")
		k.loadSprite("fish", "sprites/fish.png")
		k.loadSprite("grass", "sprites/grass.png")
		k.loadAseprite("bao", "sprites/bao.png", "sprites/bao.json")
		k.loadAseprite("fire", "sprites/fire.png", "sprites/fire.json")
	},
	onStart: (k, api) => {
		const scene = k.make([])
		scene.add([
			k.sprite("grass", { width: api.width, height: api.height }),
		])
		scene.add([
			k.pos(320, 240),
			k.sprite("fire", { anim: "burn" }),
			k.area({ scale: 0.6 }),
			k.anchor("center"),
			"danger",
		])
		scene.add([
			k.pos(480, 120),
			k.sprite("fish"),
			k.area({ scale: 0.6 }),
			k.anchor("center"),
			"fish",
		])
		const bao = scene.add([
			k.pos(120, 380),
			k.sprite("bao", { anim: "run" }),
			k.area({ scale: 0.6 }),
			k.anchor("center"),
		])
		const dirs = {
			"left": k.LEFT,
			"right": k.RIGHT,
			"up": k.UP,
			"down": k.DOWN,
		}
		for (const dir in dirs) {
			bao.onKeyDown(dir as Key, () => {
				bao.move(dirs[dir].scale(SPEED))
			})
		}

		bao.onCollide("danger", () => {
			// TODO
			api.fail()
		})

		bao.onCollide("fish", () => {
			// TODO
			api.succeed()
		})

		const music = k.play("walk", {
			loop: true,
			volume: 0.2,
		})

		api.onEnd(() => {
			music.stop()
		})

		return scene

	},

}

export default getFishGame
