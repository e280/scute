
import {createHash} from "node:crypto"

import {Io} from "./io.js"
import {html} from "./html.js"
import {TemplateFn} from "./types.js"
import {Resolver} from "./tools/resolver.js"
import {parseUrl} from "./tools/parse-url.js"

export class Orb extends Resolver {

	/** utils for reading/writing text files */
	io = new Io(this)

	/**
	 * attach a hash version url query param
	 *  - looks like "?v=d34da7f7b122"
	 *  - it actually hashes the content of the real file
	 */
	hashurl = async(pathy: string) => {
		const url = this.url(pathy)
		const text = await this.io.read(pathy)
		const hash = createHash("sha256")
			.update(text)
			.digest("hex")
		const parsed = parseUrl(url)
		const params = new URLSearchParams(parsed.search)
		params.set("v", hash.slice(0, 12))
		return parsed.path + "?" + params.toString() + parsed.hash
	}

	/** read the text from location and inject it inline directly */
	inject = async(pathy: string) => {
		const text = await this.io.read(pathy)
		return html.raw(text)
	}

	/** insert a template into this one, passing the pathing info */
	async place(fn: TemplateFn) {
		return fn(this.root, this.base)
	}

	/** yoink the "version" string from your package.json */
	packageVersion = async(pathy = "$/package.json") => {
		const packageJson = await this.io.readJson(pathy)
		return packageJson.version as string
	}
}

