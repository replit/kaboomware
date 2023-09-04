// example games:
// 1. squeeze! (mosquito flying, mouse control hand, space to squeeze)
// 2. find the target! (sniper find target, black screen, only middle center visible)
// 3. get the apple! (small platformer)
// 4. react! (throw poop / money, choose smile or mad)
// 5. dodge! (dodge fire balls)
// 6. eat! (cat avoid trap and eat fish)

import squeezeGame from "./games/squeeze"
import getFishGame from "./games/getFish"
import run from "./../src/kaboomware"

run([
	squeezeGame,
	getFishGame,
])
