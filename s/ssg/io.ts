
import {$} from "zx"
import {dirname} from "path"
import {writeFile, readFile} from "fs/promises"

const encoding = "utf-8"

export class Io {
	async read(path: string) {
		return readFile(path, encoding)
	}

	async write(path: string, text: string) {
		await $`mkdir -p "${dirname(path)}"`
		await writeFile(path, text.toString(), encoding)
	}

	async readJson(path: string) {
		return JSON.parse(await this.read(path))
	}

	async writeJson(path: string, json: any) {
		await this.write(path, JSON.stringify(json))
	}
}

