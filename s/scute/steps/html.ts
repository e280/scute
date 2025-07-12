
import {$} from "zx"
import npath from "node:path"
import {fileURLToPath} from "node:url"

import {watch} from "../utils/watch.js"
import {Params, Step} from "../types.js"
import {findPaths} from "../utils/find-paths.js"

export const scuteHtml: Step = {
	build: buildWebsite,

	watch: async params => {
		const stop = watch({
			dirs: [params.out],
			patterns: ["**/*"],
			exclude: params.exclude,
			fn: async() => buildWebsite(params),
		})
		return {stop}
	},
}

async function buildWebsite(params: Params) {
	const {logger} = params
	const {colors} = logger

	const pages = await findHtmlPages(params)
	const ourPath = fileURLToPath(import.meta.url)
	const cliPath = npath.resolve(npath.dirname(ourPath), "../xpage.js")

	await Promise.all(pages.map(async page => {
		await $`node ${cliPath} ${params.out} ${page.in} ${page.out}`
		await logger.log(`${colors.cyan(`html`)} ${page.out}`)
	}))
}

async function findHtmlPages(params: Params) {
	const paths = await findPaths(
		params.in,
		["**/*.html.js"],
		params.exclude ?? [],
	)

	return paths
		.map(path => {
			const dir = npath.dirname(path.partial)
			const name = npath.basename(path.partial)
			const newpath = npath.join(dir, name.replace(/\.html\.js$/, ".html"))
			const relativeOutput = npath.join(params.out, newpath)
			return {in: path.relative, out: relativeOutput}
		})
		.filter(p => !!p)
}

