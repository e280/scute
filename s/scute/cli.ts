#!/usr/bin/env node

import {resolve} from "path"
import {dedupe} from "@e280/stz"
import {Logger} from "@e280/sten"
import {boolean, cli, command, deathWithDignity, list, param, string} from "@benev/argv"

import {Params} from "./types.js"
import {scuteCopy} from "./steps/copy.js"
import {scuteHtml} from "./steps/html.js"
import {scuteBundle} from "./steps/bundle.js"
import {scuteConstants} from "./constants.js"

const {onDeath} = deathWithDignity()

await cli(process.argv, {
	name: "🐢 scute",
	help: `
		zero-config static site generator
		- copies files like .css
		- bundles .bundle.js files with esbuild
		- builds .html.js template files
	`,
	commands: command({
		args: [],
		params: {
			watch: param.flag("w", {help: `watch mode`}),
			in: param.default(list(string), "s", {help: `dirs to read from`}),
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
				in: dedupe([...p.in, p.out]),
				logger,
				exclude: [...scuteConstants.globalExcludes, ...(p.exclude ?? [])],
			}

			const logBasics = async() => {
				for (const p of params.in.filter(p => !params.out.includes(p)))
					await logger.log(`${logger.colors.dim("in")}   ${resolve(p)}`)
				await logger.log(`${logger.colors.dim("out")}  ${resolve(params.out)}`)
			}

			// watch mode
			if (params.watch) {
				await logger.log(logger.colors.brightGreen(`🐢 scute watch`))
				await logBasics()

				const watchers = [
					await scuteBundle.watch(params),
					await scuteCopy.watch(params),
					await scuteHtml.watch(params),
				]

				onDeath(async() => {
					await Promise.all(watchers.map(async w => w.stop()))
				})
			}

			// build mode
			else {
				await logger.log(logger.colors.brightGreen(`🐢 scute build`))
				await logBasics()
				await scuteBundle.build(params)
				await scuteCopy.build(params)
				await scuteHtml.build(params)
			}
		},
	}),
}).execute()

