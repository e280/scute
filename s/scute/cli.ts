#!/usr/bin/env node

import {resolve} from "path"
import {Logger} from "@e280/sten"
import {boolean, cli, command, deathWithDignity, list, number, param, string} from "@benev/argv"

import {Params} from "./types.js"
import {watch} from "./utils/watch.js"
import {exeStep} from "./steps/exe.js"
import {copyStep} from "./steps/copy.js"
import {htmlStep} from "./steps/html.js"
import {bundleStep} from "./steps/bundle.js"
import {scuteConstants} from "./constants.js"
import { copyableExtensions } from "./utils/copyable-extensions.js"

const {onDeath} = deathWithDignity()

await cli(process.argv, {
	name: "🐢 scute",
	readme: "https://github.com/e280/scute",
	help: `
		zero-config static site generator
		- bundles .bundle.js files with esbuild
		- copies files like .css and .json
		- builds .html.js template files
		- executes .exe.js scripts
	`,
	commands: command({
		args: [],
		params: {
			watch: param.flag("w", {help: `watch mode`}),
			in: param.default(list(string, ";"), "s", {help: `dirs to read from (; separated)`}),
			out: param.default(string, "x", {help: `output dir`}),
			bundle: param.default(boolean, "yes", {help: `should we bundle .bundle.js files?`}),
			copy: param.default(list(string, ";"), `**/*.{${copyableExtensions.join(",")}}`, {help: `what files should we copy verbatim? (; separated globs)`}),
			html: param.default(boolean, "yes", {help: `should we build .html.js templates?`}),
			exe: param.default(boolean, "yes", {help: `should we execute .exe.js scripts?`}),
			debounce: param.default(number, "100", {help: `milliseconds to wait before watch routine build`}),
			exclude: param.optional(list(string, ";"), {help: `what files should we ignore? (; separated globs)`}),
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
				exclude: [...scuteConstants.globalExcludes, ...(p.exclude ?? [])],
			}

			const logBasics = async() => {
				for (const p of params.in.filter(p => !params.out.includes(p)))
					await logger.log(`${logger.colors.dim("in")}   ${resolve(p)}`)
				await logger.log(`${logger.colors.dim("out")}  ${resolve(params.out)}`)
			}

			async function build() {
				const start = Date.now()

				if (params.bundle)
					await bundleStep(params)

				if (params.copy)
					await copyStep(params)

				if (params.html)
					await htmlStep(params)

				if (params.exe)
					await exeStep(params)

				return Math.round(Date.now() - start)
			}

			// watch mode
			if (params.watch) {
				await logger.log(logger.colors.brightGreen(`🐢 scute watch`))
				await logBasics()

				let count = 0

				const stop = watch({
					debounce: params.debounce,
					dirs: [...params.in, params.out],
					exclude: params.exclude,
					patterns: ["**/*"],
					fn: async() => {
						count++
						await logger.log()
						await logger.log(logger.colors.dim(`#${count}`))
						const time = await build()
						await logger.log(`${logger.colors.dim(`time`)} ${time} ms`)
					},
				})

				onDeath(stop)
			}

			// build mode
			else {
				await logger.log(logger.colors.brightGreen(`🐢 scute build`))
				await logBasics()
				await logger.log()
				const time = await build()
				await logger.log(`${logger.colors.dim(`time`)} ${time} ms`)
			}
		},
	}),
}).execute()

