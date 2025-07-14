
import {$} from "zx"
import npath from "node:path"
import {fileURLToPath} from "node:url"

import {watch} from "../utils/watch.js"
import {Params, Step} from "../types.js"
import {zxErrors} from "../utils/zx-errors.js"
import {findPaths} from "../utils/find-paths.js"

export const scuteExe: Step = {
	build: execute,

	watch: async params => {
		const stop = watch({
			dirs: [params.out],
			patterns: ["**/*"],
			exclude: params.exclude,
			fn: async() => {
				try { await execute(params) }
				catch (error) {}
			},
		})
		return {stop}
	},
}

async function execute(params: Params) {
	const {logger} = params
	const {colors} = logger

	const pages = await findExes(params)
	const ourPath = fileURLToPath(import.meta.url)
	const cliPath = npath.resolve(npath.dirname(ourPath), "../x-exe.js")

	await Promise.all(pages.map(async page => {
		await zxErrors(async() => {
			await $`node ${cliPath} ${params.out} ${page.in}`
			await logger.log(`${colors.yellow(`exe `)} ${page.in}`)
		})
	}))
}

async function findExes(params: Params) {
	const paths = await findPaths(
		params.in,
		["**/*.exe.js"],
		params.exclude,
	)

	return paths
		.map(path => ({in: path.relative}))
}

