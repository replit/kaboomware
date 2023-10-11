import type {
	KaboomCtx,
	Color,
	Vec2,
} from "kaboom"

export type Sampler<T> = T | (() => T)

export type ConfettiOpt = {
	gravity?: number,
	airDrag?: number,
	heading?: number,
	spread?: number,
	fade?: number,
	color?: Sampler<Color>,
	pos?: Sampler<Vec2>,
	count?: number,
}

export default function(k: KaboomCtx) {

	return (opt: ConfettiOpt = {}) => {
		// @ts-ignore
		const sample = <T>(s: Sampler<T>): T => typeof s === "function" ? s() : s
		for (let i = 0; i < 80; i++) {
			const p = k.add([
				k.pos(sample(opt.pos ?? k.vec2(0, 0))),
				k.choose([
					k.rect(k.rand(5, 20), k.rand(5, 20)),
					k.circle(k.rand(3, 10)),
				]),
				k.color(sample(opt.color ?? k.rgb(255, 255, 255))),
				k.opacity(1),
				k.lifespan(4),
				k.scale(1),
				k.anchor("center"),
				k.rotate(k.rand(0, 360)),
			])
			const spin = k.rand(2, 8)
			const gravity = opt.gravity ?? 800
			const airDrag = opt.airDrag ?? 0.9
			const heading = (opt.heading ?? 0) - 90
			const spread = opt.spread ?? 60
			const head = heading + k.rand(-spread / 2, spread / 2)
			const fade = opt.fade ?? 0.3
			const vel = k.rand(1000, 3000)
			let velX = Math.cos(k.deg2rad(head)) * vel
			let velY = Math.sin(k.deg2rad(head)) * vel
			let velA = k.rand(-200, 200)
			p.onUpdate(() => {
				const dt = k.dt()
				velY += gravity * dt
				p.pos.x += velX * dt
				p.pos.y += velY * dt
				p.angle += velA * dt
				p.scale.x = k.wave(-1, 1, k.time() * spin)
				p.opacity -= fade * dt
				velX *= airDrag
				velY *= airDrag
			})
		}
	}

}
