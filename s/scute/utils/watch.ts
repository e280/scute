
import braces from "braces"
import npath from "node:path"
import chokidar from "chokidar"
import {debounce} from "@e280/stz"
import {minimatch} from "minimatch"
import { scuteConstants } from "../constants.js"

export function watch(o: {
		dirs: string[]
		patterns: string[]
		exclude: string[]
		fn: () => Promise<void>
	}) {

	let busy = false

	const isAllowed = (path: string) => {
		const isExcluded = o.exclude
			.flatMap(pattern => braces(pattern))
			.flatMap(pattern => [pattern, pattern + "/**"])
			.some(pattern => minimatch(path, pattern))

		const isMatching = o.patterns
			.flatMap(pattern => braces(pattern))
			.flatMap(pattern => [pattern, pattern + "/**"])
			.some(pattern => minimatch(path, pattern))

		return isMatching && !isExcluded
	}

	const ms = scuteConstants.watchDebounceMs

	const watcher = chokidar.watch(o.dirs, {ignoreInitial: true})
		.on("all", debounce(ms, async(_event, path: string) => {
			if (!isAllowed(path))
				return undefined
			if (busy) return undefined
			busy = true
			try { await o.fn() }
			finally { busy = false }
		}))

	return () => watcher.close()
}

