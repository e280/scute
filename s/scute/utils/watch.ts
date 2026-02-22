
import braces from "braces"
import chokidar from "chokidar"
import {debounce} from "@e280/stz"
import {minimatch} from "minimatch"

export function watch(o: {
		debounce: number
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

	const fn = debounce(o.debounce, async() => {
		if (busy) return undefined
		busy = true
		try { await o.fn() }
		catch (err) { console.error("[scute] error", err) }
		finally { busy = false }
	})

	const watcher = chokidar.watch(o.dirs, {ignoreInitial: true})
		.on("all", (_event, path: string) => {
			if (isAllowed(path))
				void fn()
		})

	return () => watcher.close()
}

