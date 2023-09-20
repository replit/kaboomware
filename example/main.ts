import run from "kaboomware"
import squeezeGame from "./games/squeeze"
import eatGame from "./games/eat"
import snipeGame from "./games/snipe"
import dodgeGame from "./games/dodge"

run([
	dodgeGame,
	squeezeGame,
	snipeGame,
	eatGame,
], {
	// dev: true,
})
