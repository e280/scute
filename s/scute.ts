
// import {$} from "zx"
// import {cli, command, deathWithDignity} from "@benev/argv"
//
// const {onDeath} = deathWithDignity()
//
// await cli(process.argv, {
// 	name: "turtle",
// 	help: `🐢 static site generator.`,
// 	commands: {
//
// 		build: command({
// 			help: `
// 				run a standard typescript app build.
// 				generate an importmap.json, create a symlink to node_modules, run your ts build, and bundle up your ".bundle.js" files to produce ".bundle.min.js" files.
// 			`,
// 			args: [],
// 			params: buildparams,
// 			async execute({params}) {
// 				// await handleZxErrors(async() => {
// 				// 	await $`mkdir -p "${params.out}"`
// 				// 	await $`npm exec -- importly --host=node_modules < package-lock.json > "${params.out}/importmap.json"`
// 				// 	await $`rm -f "${params.out}/node_modules"`
// 				// 	await $`ln -s "$(realpath node_modules)" "${params.out}/node_modules"`
// 				// 	await $`npm exec -- tsc`
// 				// 	await turtleBundles(params.out, params.exclude, params.verbose)
// 				// })
// 			},
// 		}),
//
// 	},
// }).execute()

