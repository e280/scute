
import {globby} from "globby"
import {sep, join, resolve} from "path"
import {FilePath} from "../../ssg/types.js"

export async function findPaths(
		directories: string[],
		patterns: string[],
		excludes: string[],
	): Promise<FilePath[]> {

	return (await Promise.all(
		directories.map(async directory => {
			const fullpatterns = patterns.map(p => `${directory}/${p}`)
			const ignore = excludes.map(exclude => join(directory, exclude))
			const fullPaths = await globby(fullpatterns, {ignore})
			return fullPaths.map(relative => ({
				relative,
				directory,
				absolute: resolve(relative),
				partial: debasePath(directory, relative),
			}))
		})
	)).flat()
}

function debasePath(dir: string, path: string) {
	const d = dir + sep
	return path.startsWith(d)
		? path.slice(d.length)
		: path
}

