
import * as esbuild from "esbuild"
import {step} from "../types.js"
import {findPaths} from "../utils/find-paths.js"

export const bundleStep = step(async params => {
	const {logger} = params

	const paths = await findPaths(
		[...params.in, params.out],
		["**/*.bundle.js"],
		params.exclude,
	)

	const entryPoints = paths.map(p => ({
		in: p.relative,
		out: p.partial.replace(/\.bundle\.js$/, ".bundle.min"),
	}))

	if (entryPoints.length === 0)
		return

	const {metafile} = await esbuild.build({
		entryPoints,
		outdir: params.out,
		entryNames: "[dir]/[name]",
		bundle: true,
		splitting: params.splitting,
		sourcemap: params.sourcemap,
		minify: params.minify,
		format: "esm",
		target: "es2023",
		platform: "browser",
		legalComments: "linked",
		loader: {".css": "text"},
		metafile: true,
	})

	const bunds = new Set<string>()
	const chnks = new Set<string>()

	for (const path of Object.keys(metafile.outputs)) {
		if (path.startsWith("chunks/") && !path.includes(".LEGAL"))
			bunds.add(path)
		else
			chnks.add(path)
	}

	for (const path of bunds)
		await logger.log(`${logger.colors.yellow("bund")} ${path}`)

	if (chnks.size > 0)
		await logger.log(`${logger.colors.yellow("chnk")} ${chnks.size} chunks`)
})

