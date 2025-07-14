
import * as esbuild from "esbuild"
import {basename, dirname, join} from "path"

import {step} from "../types.js"
import {findPaths} from "../utils/find-paths.js"

export const bundleStep = step(async params => {
	const {logger} = params

	const paths = await findPaths(
		[...params.in, params.out],
		["**/*.bundle.js"],
		params.exclude,
	)

	const bundles = paths.map(p => {
		const dir = dirname(p.partial)
		const name1 = basename(p.partial)
		const name2 = name1.replace(/\.bundle\.js$/, ".bundle.min.js")
		return {
			in: p.relative,
			out: join(params.out, dir, name2),
		}
	})

	await Promise.all(bundles.map(async bundle => {
		await esbuild.build({
			entryPoints: [bundle.in],
			outfile: bundle.out,
			bundle: true,
			minify: true,
			sourcemap: true,
		})
		await logger.log(`${logger.colors.yellow(`bund`)} ${bundle.out}`)
	}))
})

