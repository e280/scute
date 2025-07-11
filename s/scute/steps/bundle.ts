
import * as esbuild from "esbuild"
import {basename, dirname, join} from "path"

import {Params, Step} from "../types.js"
import {findPaths} from "../utils/find-paths.js"

export const scuteBundle: Step = {
	build: async params => {
		const {logger} = params
		await logger.log(`  bundles..`)
		const bundles = await findBundles(params)

		await Promise.all(bundles.map(async bundle => {
			await logger.log(`    in "${bundle.in}"`)
			await esbuild.build({
				entryPoints: [bundle.in],
				outfile: bundle.out,
				bundle: true,
				minify: true,
				sourcemap: true,
			})
			await logger.log(`    out "${bundle.out}"`)
		}))
	},

	watch: async params => {
		const {logger} = params
		await logger.log(`  watch bundles..`)
		const bundles = await findBundles(params)
		const contexts = await Promise.all(bundles.map(async bundle => {
			await logger.log(`    in "${bundle.in}"`)
			const context = await esbuild.context({
				entryPoints: [bundle.in],
				outfile: bundle.out,
				bundle: true,
				minify: true,
				sourcemap: true,
				logLevel: params.verbose
					? "info"
					: "silent",
			})
			await context.watch()
			await logger.log(`    out "${bundle.out}"`)
			return context
		}))
		await logger.log(`    bundles being watched: ${contexts.length}`)
		return {
			stop: async() => {
				await logger.log(`  stopping ${contexts.length} bundles..`)
				await Promise.all(contexts.map(
					async context => context.dispose()
				))
			},
		}
	},
}

async function findBundles(params: Params) {
	const paths = await findPaths(
		params.in,
		["**/*.bundle.js"],
		params.exclude ?? [],
	)

	return paths.map(p => {
		const dir = dirname(p.partial)
		const name1 = basename(p.partial)
		const name2 = name1.replace(/\.bundle\.js$/, ".bundle.min.js")
		return {
			in: p.relative,
			out: join(params.out, dir, name2),
		}
	})
}

