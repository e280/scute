
import npath, {posix as u} from "node:path"
import {parseUrl} from "./parse-url.js"

export class Resolver {
	constructor(

		/** server root directory, from the cwd, eg "x" */
		public root: string,

		/** anchor directory where urls are based, from the cwd, eg "x/demo" */
		public base: string,

		/** current template module directory, from the cwd, eg "x/demo/stuff" */
		public local: string,
	) {}

	/**
	 * resolve a CLIENTSIDE url for the web browser
	 *  - paths starting with "/" is relative to the root dir like x/
	 *  - paths starting with "$/" is relative to the shell current working directory
	 *  - all other paths are relative to this local .html.js file
	 */
	url = (pathy: string) => {
		const bridge = (from: string, to: string) => u.normalize(npath.relative(
			npath.resolve(this.base),
			npath.resolve(npath.join(from, to)),
		))

		if (pathy.startsWith("/"))
			return bridge(this.root, pathy.slice(1))

		else if (pathy.startsWith("$/"))
			return bridge(process.cwd(), pathy.slice(2))

		else
			return bridge(this.local, pathy)
	}

	/**
	 * resolve a SERVERSIDE file path
	 *  - paths starting with "/" is relative to the root dir like x/
	 *  - paths starting with "$/" is relative to the shell current working directory
	 *  - all other paths are relative to this local .html.js file
	 */
	path = (pathy: string) => {
		const bridge = (from: string, to: string) => npath.relative(
			process.cwd(),
			npath.resolve(npath.join(from, parseUrl(to).path)),
		)

		if (pathy.startsWith("/"))
			return bridge(this.root, pathy.slice(1))

		else if (pathy.startsWith("$/"))
			return bridge(process.cwd(), pathy.slice(2))

		else
			return bridge(this.local, pathy)
	}
}

