![logo](logo.png)

KaboomWare is a tool for making warioware-like mini games in Kaboom.

## Developing & Publishing a Mini Game

1. Create a fork of the KaboomWare

2. Clone your forked repo

```sh
$ git clone https://github.com/{your_github_id}/kaboomware
```

3. Install dependencies

```sh
$ npm install
```

4. Create a game with

```sh
$ npm run create {yourname}:{gamename}
# for example
$ npm run create wario:squeeze
```

> Note: Game name has to be ASCII characters with no space

This will create a folder at `games/{yourname}/{gamename}`, with

- `main.ts` - Game script
- `assets/` - All the assets that'll be used for the game

5. Run your game with

```sh
$ npm run dev {yourname}:{gamename}
```

6. Edit `games/{yourname/{gamename}/main.ts` and start developing the game!

A KaboomWare game is just a plain JavaScript object:

```ts
const squeezeGame = {

    // The prompt for the game that tells player what to do. Normally it'll be just a simple verb.
    prompt: "Squeeze!",

    // Name of the author.
    author: "tga",

    // Background color hue (0.0 - 1.0).
    hue: 0.46,

    // How long you want the game to run for.
    timer: 4,

    // Load assets for the game. The argument k is a limited version of the Kaboom context, only k.loadXXX() functions are enabled here.
    onLoad: (k) => {
        k.loadRoot("assets/")
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

7. Once you finished a game, submit a PR to the [kaboomware github repo](https://github.com/slmjkdbtl/kaboomware), using the naming format: `[Game] {yourname} - {gamename}`

One PR should only contain 1 game! Normally a game PR will always go through, unless it's oibviously unplayable.
