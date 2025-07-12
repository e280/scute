
import npath, {posix as u} from "node:path"
import {createHash} from "node:crypto"

import {Io} from "./io.js"
import {html, TemplateFn} from "./html.js"
import {parseUrl} from "./tools/parse-url.js"

export class Orb {
	constructor(

		/** server root directory, from the cwd, eg "x" */
		public root: string,

		/** anchor directory where urls are based, from the cwd, eg "x/demo" */
		public base: string,

		/** current template module directory, from the cwd, eg "x/demo/stuff" */
		public local: string,
	) {}

	/** utils for reading/writing text files */
	io = new Io()

	/**
	 * resolve a url for the web browser
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
	 * resolve a file path for the serverside
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

	/**
	 * attach a hash version url query param
	 *  - looks like "?v=d34da7f7b122"
	 *  - it actually hashes the content of the real file
	 */
	hashurl = async(pathy: string) => {
		const url = this.url(pathy)
		const path = this.path(pathy)
		const text = await this.io.read(path)
		const hash = createHash("sha256")
			.update(text)
			.digest("hex")
		const parsed = parseUrl(url)
		const params = new URLSearchParams(parsed.search)
		params.set("v", hash.slice(0, 12))
		return parsed.path + "?" + params.toString() + parsed.hash
	}

	/** read the text from location and inject it inline directly */
	inline = async(pathy: string) => {
		const text = await this.io.read(this.path(pathy))
		return html.raw(text)
	}

	/** insert a template into this one, passing the pathing info */
	async place(fn: TemplateFn) {
		return fn(this.root, this.base)
	}

	/** yoink the "version" string from your package.json */
	packageVersion = async(pathy = "$/package.json") => {
		const packageJson = await this.io.readJson(this.path(pathy))
		return packageJson.version as string
	}
}

