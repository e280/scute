
import {relative, join, dirname, normalize} from "node:path"
import {parseUrl} from "./parse-url.js"
import {Pathing, TemplateFn} from "../types.js"

export class Resolver implements Pathing {
	constructor(

		/** server root directory, from the cwd, eg "x" */
		public root: string,

		/** template module path, from cwd, eg "x/demo/index.html.js" */
		public mod: string,

		/** destination path where output is intended, from cwd, eg "x/demo/index.html" */
		public dest: string,
	) {}

	/**
	 * resolve a CLIENTSIDE url for the web browser
	 *  - "/" paths are relative to the root dir like x/
	 *  - "$/" paths are relative to the shell current working directory
	 *  - "@/" paths are relative to the dest output file (.html)
	 *  - all other paths are relative to the template module (.html.js)
	 *  - we output a path relative to dest unless rooted bool is set true (default false)
	 */
	url = (pathy: string, rooted = false) => {
		const parsed = parseUrl(pathy)
		pathy = parsed.path

		const bridge = (from: string, to: string) => normalize(
			rooted
				? "/" + relative(this.root, join(from, to))
				: relative(dirname(this.dest), join(from, to))
		).replace(/\\/g, "/") + parsed.search + parsed.hash

		if (pathy.startsWith("/"))
			return bridge(this.root, pathy.slice(1))

		else if (pathy.startsWith("$/"))
			return bridge("", pathy.slice(2))

		else if (pathy.startsWith("@/"))
			return bridge(dirname(this.dest), pathy.slice(2))

		else
			return bridge(dirname(this.mod), pathy)
	}

	/**
	 * resolve a SERVERSIDE file path
	 *  - "/" paths are relative to the root dir like x/
	 *  - "$/" paths are relative to the shell current working directory
	 *  - "@/" paths are relative to the dest output file (.html)
	 *  - all other paths are relative to the template module (.html.js)
	 */
	path = (pathy: string) => {
		const bridge = (from: string, to: string) => normalize(
			join(
				from,
				parseUrl(to).path,
			)
		)

		if (pathy.startsWith("/"))
			return bridge(this.root, pathy.slice(1))

		else if (pathy.startsWith("$/"))
			return bridge("", pathy.slice(2))

		else if (pathy.startsWith("@/"))
			return bridge(dirname(this.dest), pathy.slice(2))

		else
			return bridge(dirname(this.mod), pathy)
	}

	/** execute a template under this resolver's pathing */
	async place(fn: TemplateFn) {
		return fn(this)
	}
}

