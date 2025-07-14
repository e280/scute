
import {$} from "zx"
import npath from "node:path"
import {fileURLToPath} from "node:url"

import {step} from "../types.js"
import {zxErrors} from "../utils/zx-errors.js"
import {findPaths} from "../utils/find-paths.js"

export const exeStep = step(async params => {
	const {logger} = params
	const {colors} = logger

	const paths = await findPaths(
		[...params.in, params.out],
		["**/*.exe.js"],
		params.exclude,
	)

	const pages = paths.map(path => ({in: path.relative}))

	const ourPath = fileURLToPath(import.meta.url)
	const cliPath = npath.resolve(npath.dirname(ourPath), "../x-exe.js")

	await Promise.all(pages.map(async page => {
		await zxErrors(async() => {
			await $`node ${cliPath} ${params.out} ${page.in}`
			await logger.log(`${colors.magenta(`exec`)} ${page.in}`)
		})
	}))
})

