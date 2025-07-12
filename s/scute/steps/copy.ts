
import {Logger} from "@e280/sten"
import {promises as fs} from "fs"
import {dirname, join, resolve} from "path"

import {watch} from "../utils/watch.js"
import {Params, Step} from "../types.js"
import {findPaths} from "../utils/find-paths.js"

export const scuteCopy: Step = {
	build: async params => {
		const {logger} = params
		const ops = await findCopyOperations(params)
		await copy(logger, ops)
	},

	watch: async params => {
		const {logger} = params

		const copyFromDirs = params.in
			.filter(p => resolve(p) !== resolve(params.out))

		const stop = watch({
			dirs: copyFromDirs,
			patterns: params.copy,
			exclude: params.exclude,
			fn: async() => {
				const ops = await findCopyOperations(params)
				await copy(logger, ops)
			},
		})

		return {stop: async() => stop()}
	},
}

async function findCopyOperations(params: Params) {
	const paths = await findPaths(
		params.in,
		params.copy,
		params.exclude ?? [],
	)

	return paths
		.map(path => {
			const relativeOutput = join(params.out, path.partial)
			if (resolve(relativeOutput) === resolve(path.relative))
				return undefined
			return {in: path.relative, out: relativeOutput}
		})
		.filter(p => !!p)
}

async function copy(logger: Logger, ops: {in: string, out: string}[]) {
	await Promise.all(ops.map(op => copyWithParents(logger, op)))
}

async function copyWithParents(logger: Logger, op: {in: string, out: string}) {
	const dir = dirname(op.out)
	await fs.mkdir(dir, {recursive: true})
	await fs.cp(op.in, op.out, {recursive: false})
	await logger.log(`${logger.colors.magenta(`copy`)} ${op.out}`)
}

