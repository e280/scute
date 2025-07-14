
import {$} from "zx"
import {dirname} from "path"
import {Resolver} from "./tools/resolver.js"
import {writeFile, readFile} from "fs/promises"

const encoding = "utf-8"

export class Io {
	constructor(public resolver: Resolver) {}

	async read(pathy: string) {
		const path = this.resolver.path(pathy)
		return readFile(path, encoding)
	}

	async write(pathy: string, text: string) {
		const path = this.resolver.path(pathy)
		await $`mkdir -p "${dirname(path)}"`
		await writeFile(path, text.toString(), encoding)
	}

	async readJson(pathy: string) {
		const path = this.resolver.path(pathy)
		return JSON.parse(await this.read(path))
	}

	async writeJson(pathy: string, json: any) {
		const path = this.resolver.path(pathy)
		await this.write(path, JSON.stringify(json))
	}
}

