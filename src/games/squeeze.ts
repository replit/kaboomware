import type { Game } from "./../main"

const NUM_FLIES = 1
const FLY_SPEED = 400
const FLY_MARGIN = 160

const squeezeGame: Game = {

	prompt: "Squeeze!",
	author: "tga",

	onLoad: (k) => {
		k.loadSound("squeeze", "sounds/squeeze.mp3")
		k.loadSound("fly", "sounds/fly.mp3")
		k.loadSprite("wall", "sprites/wall.png")
		k.loadAseprite("hand", "sprites/hand.png", "sprites/hand.json")
		k.loadAseprite("fly", "sprites/fly.png", "sprites/fly.json")
	},

	onStart: (k) => {

		const buzzSound = k.play("fly", {
			loop: true,
			volume: 0.2,
		})

		const scene = k.make()

		scene.add([
			k.sprite("wall", { width: k.width(), height: k.height() }),
		])

		const makeFly = () => {
			const fly = k.make([
				k.pos(
					k.rand(FLY_MARGIN, k.width() - FLY_MARGIN),
					k.rand(FLY_MARGIN, k.height() - FLY_MARGIN),
				),
				k.sprite("fly", { anim: "fly" }),
				k.anchor("center"),
				"fly",
			])
			fly.onUpdate(() => {
				fly.pos.x += k.rand(-FLY_SPEED, FLY_SPEED) * k.dt()
				fly.pos.y += k.rand(-FLY_SPEED, FLY_SPEED) * k.dt()
			})
			return fly
		}

		for (let i = 0; i < NUM_FLIES; i++) {
			scene.add(makeFly())
		}

		const handOffset = k.vec2(-30, -140)

		const hand = scene.add([
			k.pos(k.mousePos().add(handOffset)),
			k.sprite("hand"),
		])

		hand.onUpdate(() => {
			hand.pos = k.mousePos().add(handOffset)
		})

		k.onButtonPress("action", () => {
			k.play("squeeze")
			hand.play("squeeze")
			for (const fly of scene.get("fly")) {
				const pos = hand.pos.sub(handOffset)
				if (pos.dist(fly.pos) <= 20) {
					fly.destroy()
					k.addKaboom(fly.pos)
					if (scene.get("fly").length === 0) {
						buzzSound.stop()
						k.succeed()
					}
					break
				}
			}
		})

		k.onButtonRelease("action", () => {
			hand.play("idle")
		})

		k.onEnd(() => {
			buzzSound.stop()
		})

		return scene

	},

}

export default squeezeGame
