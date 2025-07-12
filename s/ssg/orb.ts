
import * as npath from "node:path"
import {createHash} from "node:crypto"

import {Io} from "./io.js"
import {html, PageSetupFn} from "./html.js"

export class Orb {
	backToRoot: string
	backToWorking: string

	constructor(public root: string, public local: string) {
		this.backToRoot = npath.relative(local, root)
		this.backToWorking = npath.relative(local, "./")
	}

	/** utils for reading/writing text files */
	io = new Io()

	/**
	 * resolve a relative path
	 *  - paths starting with "/" is relative to the output dir like x/
	 *  - paths starting with "$/" is relative to the shell current working directory
	 *  - all other paths are relative to this local .html.js file
	 */
	rel = (pathy: string): {url: string, path: string} => {
		if (pathy.startsWith("/")) {
			const substance = pathy.slice(1)
			return {
				url: `${this.backToRoot}/${substance}`,
				path: npath.join(substance, this.root),
			}
		}
		else if (pathy.startsWith("$/")) {
			const substance = pathy.slice(2)
			return {
				url: `${this.backToWorking}/${substance}`,
				path: npath.normalize(substance),
			}
		}
		else {
			return {
				url: pathy,
				path: npath.join(npath.dirname(this.local), pathy),
			}
		}
	}

	/**
	 * attach a hash version url query param
	 *  - looks like "?v=d34da7f7b122"
	 *  - it actually hashes the content of the real file
	 */
	hashurl = async(pathy: string) => {
		const {path, url} = this.rel(pathy)
		const text = await this.io.read(path)
		const hash = createHash("sha256")
			.update(text)
			.digest("hex")
		const u = new URL(url, "http://localhost/")
		u.searchParams.set("v", hash.slice(0, 12))
		return u.pathname + u.search + u.hash
	}

	/** read the text from location and inject it inline directly */
	inline = async(path: string) => {
		const text = await this.io.read(path)
		return html.raw(text)
	}

	/** insert another page into this one */
	async page(fn: PageSetupFn) {
		return fn(this.root)
	}

	/** yoink the "version" string from your package.json */
	packageVersion = async() => {
		const packageJson = await this.io.readJson("package.json")
		return packageJson.version as string
	}
}

