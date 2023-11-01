import type { Game, Button } from "kaboomware"

const SPEED = 240
const METEOR_SPEED = 480
const SPAWN_SPEED = 0.2

const game: Game = {

	prompt: "Dodge!",
	author: "tga",
	hue: 0.08,

	onLoad: (k) => {
		k.loadAseprite("stickman", "sprites/stickman.png", "sprites/stickman.json")
		k.loadAseprite("meteor", "sprites/meteor.png", "sprites/meteor.json")
		k.loadAseprite("bang", "sprites/bang.png", "sprites/bang.json")
	},

	onStart: (k) => {

		const scene = k.make([
			k.timer(),
		])

		let hurt = false

		scene.add([
			k.rect(k.width(), k.height()),
			k.color(k.rgb(255, 255, 255)),
		])

		const man = scene.add([
			k.sprite("stickman"),
			k.pos(400, 200),
			k.area(),
			k.z(50),
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
				if (hurt) return
				man.move(dirs[dir].scale(SPEED))
				man.frame = (man.frame + 1) % man.numFrames()
			})
		}

		scene.loop(SPAWN_SPEED, () => {
			const destY = k.rand(100, k.height() - 50)
			const m = scene.add([
				k.sprite("meteor", { anim: "fall" }),
				k.anchor("bot"),
				k.z(100),
				k.pos(man.pos.x + k.rand(-100, 100), -100),
			])
			const shadow = scene.add([])
			shadow.onDraw(() => {
				const r = 1 - (destY - m.pos.y) / 400
				k.drawEllipse({
					pos: k.vec2(m.pos.x, destY - 10),
					radiusX: 24 * r,
					radiusY: 16 * r,
					color: k.rgb(200, 200, 200),
				})
			})
			m.onUpdate(() => {
				m.pos.y += k.dt() * METEOR_SPEED
				if (m.pos.y >= destY) {
					m.destroy()
					shadow.destroy()
					scene.add([
						k.sprite("bang", { anim: "explode", animSpeed: 2, }),
						k.anchor("center"),
						k.pos(m.pos.x, m.pos.y - 10),
						k.lifespan(0.5),
						k.area(),
						k.z(200),
					])
					if (man.pos.dist(m.pos) <= 50) {
						hurt = true
						k.lose()
					}
				}
			})
		})

		k.onTimeout(() => k.win())

		return scene

	},

}

export default game
