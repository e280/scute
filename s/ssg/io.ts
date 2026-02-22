
import {$} from "zx"
import {dirname} from "node:path"
import {readFile} from "node:fs/promises"

import {Html} from "./html.js"
import {Resolver} from "./tools/resolver.js"
import {writeIfDifferent} from "./tools/write-if-different.js"

export class Io {
	constructor(public resolver: Resolver) {}

	async read(pathy: string) {
		const path = this.resolver.path(pathy)
		return readFile(path, "utf-8")
	}

	async write(pathy: string, text: string | Html) {
		const path = this.resolver.path(pathy)
		await $`mkdir -p "${dirname(path)}"`
		await writeIfDifferent(path, text.toString())
	}

	async readJson(pathy: string) {
		return JSON.parse(await this.read(pathy))
	}

	async writeJson(pathy: string, json: any) {
		await this.write(pathy, JSON.stringify(json))
	}
}

