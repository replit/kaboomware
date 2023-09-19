import run from "kaboomware"
import squeezeGame from "./games/squeeze"
import eatGame from "./games/eat"
import snipeGame from "./games/snipe"

run([
	snipeGame,
	squeezeGame,
	eatGame,
], {
	// dev: true,
})
