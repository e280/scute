
import * as esbuild from "esbuild"
import {basename, dirname, join} from "path"

import {Params, Step} from "../types.js"
import {findPaths} from "../utils/find-paths.js"

export const scuteBundle: Step = {
	build: async params => {
		const bundles = await findBundles(params)
		await Promise.all(bundles.map(
			async bundle => esbuild.build({
				entryPoints: [bundle.in],
				outfile: bundle.out,
				bundle: true,
				minify: true,
				sourcemap: true,
			})
		))
	},

	watch: async params => {
		const bundles = await findBundles(params)
		const contexts = await Promise.all(bundles.map(async bundle => {
			const context = await esbuild.context({
				entryPoints: [bundle.in],
				outfile: bundle.out,
				bundle: true,
				minify: true,
				sourcemap: true,
			})
			await context.watch()
			return context
		}))
		return {
			stop: async() => {
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
			in: p.absolute,
			out: join(params.out, dir, name2),
		}
	})
}

