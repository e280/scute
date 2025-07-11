
import braces from "braces"
import chokidar from "chokidar"
import {debounce} from "@e280/stz"
import {minimatch} from "minimatch"

export function watch(
		dirs: string[],
		patterns: string[],
		exclude: string[],
		fn: () => Promise<void>,
	) {

	let busy = false

	const isAllowed = (path: string) => {
		const isExcluded = exclude
			.flatMap(pattern => braces(pattern))
			.flatMap(pattern => [pattern, pattern + "/**"])
			.some(pattern => minimatch(path, pattern))

		const isMatching = patterns
			.flatMap(pattern => braces(pattern))
			.flatMap(pattern => [pattern, pattern + "/**"])
			.some(pattern => minimatch(path, pattern))

		const greenlight = isMatching && !isExcluded

		if (greenlight)
			console.log("watch got change", path)

		return greenlight
	}

	const watcher = chokidar.watch(dirs, {ignored: isAllowed})
		.on("all", debounce(500, async() => {
			if (busy) return undefined
			busy = true
			try { await fn() }
			finally { busy = false }
		}))

	return () => watcher.close()
}

