#!/usr/bin/env node

import {boolean, cli, command, deathWithDignity, list, param, string} from "@benev/argv"
import {scuteCopy} from "./steps/copy.js"
import {scuteHtml} from "./steps/html.js"
import {scuteBundle} from "./steps/bundle.js"

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
			out: param.default(list(string), "x", {help: `output dir`}),
			copy: param.default(list(string), "*.css,*.json,*.txt", {help: `what files should we copy verbatim?`}),
			bundle: param.default(boolean, "yes", {help: `should we bundle .bundle.js files?`}),
			html: param.default(boolean, "yes", {help: `should we build .html.js templates?`}),
			exclude: param.optional(list(string), {help: `what files should we ignore?`}),
			verbose: param.flag("v", {help: `should we log a bunch of crap?`}),
		},
		async execute({params}) {
			const log = (...m: any[]) => {
				if (params.verbose)
					console.log(...m)
			}

			log("scute build..")
			await scuteCopy.build(params)
			await scuteBundle.build(params)
			await scuteHtml.build(params)
			log("scute build done..")

			if (params.watch) {
				log("scute watch..")

				const watchers = await Promise.all([
					scuteCopy.watch(params),
					scuteBundle.watch(params),
					scuteHtml.watch(params),
				])

				onDeath(async() => {
					log("scute watch stop..")
					await Promise.all(watchers.map(async w => w.stop()))
					log("scute watch stopped..")
				})
			}
		},
	}),
}).execute()

