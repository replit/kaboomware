import type { Key } from "kaboom"
import type { Game, Button } from "kaboomware"

const SPEED = 240

const eatGame: Game = {

	prompt: "Eat!",
	author: "tga",
	hue: 0.75,

	onLoad: (k) => {
		k.loadSound("walk", "sounds/walk.mp3")
		k.loadSprite("grass", "sprites/grass.png")
		k.loadAseprite("fish", "sprites/fish.png", "sprites/fish.json")
		k.loadAseprite("bao", "sprites/bao.png", "sprites/bao.json")
		k.loadAseprite("cactus", "sprites/cactus.png", "sprites/cactus.json")
		k.loadAseprite("fire", "sprites/fire.png", "sprites/fire.json")
	},

	onStart: (k) => {

		let gotFish = false
		let hurt = false
		const scene = k.make()

		scene.add([
			k.sprite("grass", { width: k.width(), height: k.height() }),
		])

		scene.add([
			k.pos(320, 240),
			k.sprite("fire", { anim: "burn" }),
			k.area({ scale: 0.6 }),
			k.anchor("center"),
			"danger",
		])

		scene.add([
			k.pos(150, 170),
			k.sprite("cactus", { anim: "woohoo" }),
			k.area({ scale: 0.5 }),
			k.anchor("center"),
			"danger",
		])

		const fish = scene.add([
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
			k.onButtonDown(dir as Button, () => {
				if (gotFish || hurt) return
				bao.move(dirs[dir].scale(SPEED))
			})
		}

		bao.onCollide("danger", () => {
			k.lose()
			hurt = true
			bao.play("cry")
		})

		bao.onCollide("fish", () => {
			k.win()
			gotFish = true
			bao.play("woohoo")
			fish.play("eaten", { loop: false })
		})

		k.onTimeout(() => {
			bao.play("cry")
			bao.onUpdate(() => {
				k.camPos(k.camPos().lerp(bao.pos.add(30, -30), k.dt() * 2))
				k.camScale(k.camScale().lerp(k.vec2(5), k.dt() * 2))
			})
		})

		bao.onUpdate(() => {
			if (gotFish || hurt) {
				k.camPos(k.camPos().lerp(bao.pos.add(30, -30), k.dt() * 2))
				k.camScale(k.camScale().lerp(k.vec2(5), k.dt() * 2))
			}
		})

		const music = k.play("walk", {
			loop: true,
			volume: 0.2,
		})

		k.onEnd(() => {
			music.stop()
			k.camPos(k.center())
			k.camScale(1, 1)
		})

		return scene

	},

}

export default eatGame
