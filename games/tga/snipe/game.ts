import type { Game, Button } from "kaboomware"

const SPEED = 240

const shootGame: Game = {

	prompt: "Snipe!",
	author: "tga",
	hue: 0.5,

	onLoad: (k) => {
		k.loadRoot("assets/")
		k.loadSprite("desert", "sprites/desert.png")
		k.loadSprite("cactus", "sprites/cactus.png")
		k.loadSprite("barney", "sprites/barney.png")
		k.loadSound("shoot", "sounds/shoot.mp3")
	},

	onStart: (k) => {

		function shake(speed = 8) {
			let s = 0
			return {
				update() {
					if (s <= 0) return
					this.pos = k.Vec2.fromAngle(k.rand(0, 360)).scale(s)
					s = k.lerp(s, 0, speed * k.dt())
				},
				shake(to: number) {
					s += to
				},
			}
		}

		const scene = k.make([
			k.pos(),
			shake(),
		])

		scene.add([
			k.sprite("desert", { width: k.width(), height: k.height() }),
		])

		const cactusPos = [
			k.vec2(80, 40),
			k.vec2(480, 120),
			k.vec2(200, 300),
		]

		const barneyPos = k.choose(cactusPos).add(20, 10)

		const barney = scene.add([
			k.sprite("barney"),
			k.pos(barneyPos),
			k.area({ shape: new k.Rect(k.vec2(30, 0), 60, 60) }),
		])

		for (const p of cactusPos) {
			scene.add([
				k.sprite("cactus"),
				k.pos(p),
			])
		}

		let pos = k.vec2(400, 300)

		const dirs = {
			"left": k.LEFT,
			"right": k.RIGHT,
			"up": k.UP,
			"down": k.DOWN,
		}

		for (const dir in dirs) {
			k.onButtonDown(dir as Button, () => {
				pos = pos.add(dirs[dir].scale(k.dt() * SPEED))
			})
		}

		scene.onMouseMove(() => {
			pos = k.mousePos()
		})

		const ui = scene.add()

		ui.onDraw(() => {
			// TODO: this is invalidating the outside stencil
			k.drawSubtracted(() => {
				k.drawRect({
					pos: k.vec2(0, 0),
					width: k.width(),
					height: k.height(),
					color: k.rgb(0, 0, 0),
				})
			}, () => {
				k.drawCircle({
					pos: pos,
					radius: 120,
				})
			})
			k.drawLine({
				p1: k.vec2(0, pos.y),
				p2: k.vec2(k.width(), pos.y),
				width: 3,
				color: k.rgb(0, 0, 0),
			})
			k.drawLine({
				p1: k.vec2(pos.x, 0),
				p2: k.vec2(pos.x, k.height()),
				width: 3,
				color: k.rgb(0, 0, 0),
			})
			k.drawCircle({
				pos: pos,
				radius: 32,
				fill: false,
				outline: {
					width: 3,
					color: k.rgb(0, 0, 0),
				},
			})
			k.drawCircle({
				pos: pos,
				radius: 4,
				color: k.rgb(255, 0, 0),
			})
			k.drawCircle({
				pos: pos,
				radius: 120,
				fill: false,
				outline: {
					width: 8,
					color: k.rgb(100, 100, 100),
				},
			})
		})

		k.onButtonPress("action", () => {
			k.play("shoot")
			scene.shake(16)
			// TODO: bugged
			if (barney.hasPoint(pos)) {
				k.win()
				console.log("yes")
			} else {
				console.log("no")
			}
		})

		return scene

	},

}

export default shootGame
