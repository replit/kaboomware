# Making Mini-Games with KaboomWare

KaboomWare is a tool for making warioware-like mini games in Kaboom.

## Developing a Mini Game

A KaboomWare game is just a plain JavaScript object:

```ts
const squeezeGame = {

    // The prompt for the game that tells player what to do. Normally it'll be just a simple verb.
    prompt: "Squeeze!",

    // Name of the author.
    author: "tga",

    // Background color hue (0.0 - 1.0).
    hue: 0.46,

    // Load assets for the game. The argument k is a limited version of the Kaboom context, only k.loadXXX() functions are enabled here.
    onLoad: (k) => {
        k.loadSound("fly", "sounds/fly.mp3")
        k.loadSprite("hand", "sprites/hand.png")
    },

    // Main entry point of the game. This function should return a GameObject that contains the game. The argument k is a limited version of the Kaboom context, plus a set of KaboomWare-specific APIs (see below)
    onStart: (k) => {

        // k.add() is disabled, use k.make() to make a game object and return
        const scene = k.make()

        // All game objects are added as children of the scene game object
        const hand = scene.add([
            k.pos(420, 240),
            k.sprite("hand"),
        ])

        // KaboomWare only supports 1 action button and 4 directional buttons. Use the KaboomWare-specific API k.onButtonXXX()
        k.onButtonPress("action", () => {
            hand.squeeze()
            if (gotIt) {
                // Tell KaboomWare player has succeeded and progress to the next game
                k.win()
            }
        })

        // Return the scene game object here and it'll get mounted to KaboomWare when this game starts.
        return scene

    },

}
```

The added API in `onStart()` is

```ts
type GameAPI = {
    // Register an event that runs once when a button is pressed.
    onButtonPress: (btn: Button, action: () => void) => EventController,
    // Register an event that runs once when a button is released.
    onButtonRelease: (btn: Button, action: () => void) => EventController,
    // Register an event that runs every frame when a button is held down.
    onButtonDown: (btn: Button, action: () => void) => EventController,
    // Register an event that runs once when timer runs out.
    onTimeout: (action: () => void) => EventController,
    // Register an event that runs once when game ends, either succeeded, failed or timed out.
    onEnd: (action: () => void) => EventController,
    // Run this when player succeeded in completing the game.
    win: () => void,
    // Run this when player failed.
    lose: () => void,
    // Current difficulty.
    difficulty: 0 | 1 | 2,
}

type Button =
    | "action"
    | "left"
    | "right"
    | "up"
    | "down"
```

To run the game, use the `kaboomware` pacakge

```ts
import run from "kaboomware"

run([
    squeezeGame,
], {
    // Dev mode disables the timer, so you can focus on working on the current game
    dev: true,
    // Scale of the canvas
    scale: 1,
})
```

For real world examples, check [here](https://github.com/slmjkdbtl/kaboomware/tree/master/example/games).

To run the examples:

```sh
$ git clone https://github.com/slmjkdbtl/kaboomware
$ cd kaboomware
$ npm install
$ npm run dev
$ open http://localhost:8000
```

Also try the [Replit template](https://replit.com/@slmjkdbtl/KaboomWare?v=1)

### Caveats

## Publishing a Mini Game

TODO
