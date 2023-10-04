import run from "kaboomware"
import squeezeGame from "./games/squeeze"
import eatGame from "./games/eat"
import snipeGame from "./games/snipe"
import dodgeGame from "./games/dodge"

run([
	eatGame,
	dodgeGame,
	squeezeGame,
	snipeGame,
], {
	dev: true,
	canvas: document.querySelector("#game"),
})
