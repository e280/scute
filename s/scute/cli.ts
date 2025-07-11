#!/usr/bin/env node

import {resolve} from "path"
import {Logger} from "@e280/sten"
import {boolean, cli, command, deathWithDignity, list, param, string} from "@benev/argv"

import {Params} from "./types.js"
import {scuteCopy} from "./steps/copy.js"
import {scuteHtml} from "./steps/html.js"
import {scuteBundle} from "./steps/bundle.js"

const globalExcludes = [
	"**/node_modules/**",
	"**/.git/**",
]

const {onDeath} = deathWithDignity()

await cli(process.argv, {
	name: "🐢 scute",
	help: `
		lil buildy bundly buddy for your web projects
		- copies files like .css from s/ to x/
		- bundles .bundle.js entrypoints with esbuild
		- builds .html.js template js files
	`,
	commands: command({
		args: [],
		params: {
			watch: param.flag("w", {help: `watch mode`}),
			in: param.default(list(string), "s,x", {help: `dirs to read from`}),
			out: param.default(string, "x", {help: `output dir`}),
			copy: param.default(list(string), "**/*.css,**/*.json,**/*.txt", {help: `what files should we copy verbatim?`}),
			bundle: param.default(boolean, "yes", {help: `should we bundle .bundle.js files?`}),
			html: param.default(boolean, "yes", {help: `should we build .html.js templates?`}),
			exclude: param.optional(list(string), {help: `what files should we ignore?`}),
			verbose: param.flag("v", {help: `should we log a bunch of crap?`}),
		},
		async execute({params: p}) {
			const logger = new Logger()
				.setShaper(Logger.shapers.errors())

			if (!p.verbose)
				logger.setWriter(Logger.writers.void())

			const params: Params = {
				...p,
				logger,
				exclude: [...globalExcludes, ...(p.exclude ?? [])],
			}

			await logger.log(`scute build..`)

			await logger.log(`  paths..`)
			for (const p of params.in)
				await logger.log(`    in "${resolve(p)}"`)
			await logger.log(`    out "${resolve(params.out)}"`)

			await scuteCopy.build(params)
			await scuteBundle.build(params)
			await scuteHtml.build(params)

			if (params.watch) {
				await logger.log(`\nscute watch..`)

				const watchers = [
					await scuteCopy.watch(params),
					await scuteBundle.watch(params),
					await scuteHtml.watch(params),
				]

				onDeath(async() => {
					await logger.log(`scute watch stop..`)
					await Promise.all(watchers.map(async w => w.stop()))
					await logger.log(`scute watch stopped..`)
				})
			}
		},
	}),
}).execute()

