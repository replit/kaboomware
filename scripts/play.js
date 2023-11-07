import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import * as path from "path"

const games = process.argv.slice(2)

if (games.length === 0) {
	process.exit(0)
}
