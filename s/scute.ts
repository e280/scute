
import {$} from "zx"
import {boolean, cli, command, deathWithDignity, list, param, string} from "@benev/argv"

deathWithDignity()

await cli(process.argv, {
	name: "🐢 scute",
	help: `lil buildy-bundly-buddy`,
	commands: command({
		args: [],
		params: {
			watch: param.flag("w", {help: `watch mode`}),
			in: param.default(list(string), "src,dist", {help: `dirs to read from`}),
			out: param.default(list(string), "dist", {help: `output dir`}),
			tsc: param.default(boolean, "yes", {help: `should we run tsc?`}),
			copy: param.default(list(string), "*.css,*.json,*.txt", {help: `what files should we copy verbatim?`}),
			bundle: param.default(boolean, "yes", {help: `should we bundle .bundle.js files?`}),
			html: param.default(boolean, "yes", {help: `should we build .html.js templates?`}),
			exclude: param.optional(string, {help: `what files should we ignore?`}),
			verbose: param.flag("v", {help: `should we log a bunch of crap?`}),
		},
		async execute({params}) {
			console.log(params)
			// await handleZxErrors(async() => {
			// 	await $`mkdir -p "${params.out}"`
			// 	await $`npm exec -- importly --host=node_modules < package-lock.json > "${params.out}/importmap.json"`
			// 	await $`rm -f "${params.out}/node_modules"`
			// 	await $`ln -s "$(realpath node_modules)" "${params.out}/node_modules"`
			// 	await $`npm exec -- tsc`
			// 	await turtleBundles(params.out, params.exclude, params.verbose)
			// })
		},
	}),
}).execute()

