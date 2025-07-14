
import {$} from "zx"
import npath from "node:path"
import {fileURLToPath} from "node:url"

import {step} from "../types.js"
import {zxErrors} from "../utils/zx-errors.js"
import {findPaths} from "../utils/find-paths.js"

export const htmlStep = step(async params => {
	const {logger} = params
	const {colors} = logger

	const paths = await findPaths(
		[...params.in, params.out],
		["**/*.html.js"],
		params.exclude,
	)

	const pages = paths.map(path => {
		const dir = npath.dirname(path.partial)
		const name = npath.basename(path.partial)
		const newpath = npath.join(dir, name.replace(/\.html\.js$/, ".html"))
		const relativeOutput = npath.join(params.out, newpath)
		return {in: path.relative, out: relativeOutput}
	})

	const ourPath = fileURLToPath(import.meta.url)
	const cliPath = npath.resolve(npath.dirname(ourPath), "../x-page.js")

	await Promise.all(pages.map(async page => {
		await zxErrors(async() => {
			await $`node ${cliPath} ${params.out} ${page.in} ${page.out}`
			await logger.log(`${colors.cyan(`html`)} ${page.out}`)
		})
	}))
})

