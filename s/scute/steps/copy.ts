
import {Logger} from "@e280/sten"
import {promises as fs} from "fs"
import {dirname, join, resolve} from "path"

import {Params, step} from "../types.js"
import {findPaths} from "../utils/find-paths.js"
import { detectChange } from "../../ssg/tools/hash.js"
import { readFile } from "fs/promises"

export const copyStep = step(async params => {
	const {logger} = params
	const ops = await findCopyOperations(params)
	await copy(logger, ops)
})

async function findCopyOperations(params: Params) {
	const paths = await findPaths(
		params.in,
		params.copy,
		params.exclude,
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

	if (await detectChange(op.out, await readFile(op.in))) {
		await fs.cp(op.in, op.out, {recursive: false})
		await logger.log(`${logger.colors.blue(`copy`)} ${op.out}`)
	}
	else {
		await logger.log(`${logger.colors.dim(logger.colors.blue(`copy`))} ${op.out}`)
	}
}

