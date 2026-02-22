
import {readFile, writeFile} from "node:fs/promises"
import {hash} from "../../scute/utils/hash.js"

export async function writeIfDifferent(filepath: string, payload: string) {
	const payloadHash = await hash(payload)

	let existingHash: string | undefined
	try {
		const existingText = await readFile(filepath, "utf-8")
		existingHash = await hash(existingText)
	}
	catch (e: any) {
		if (e?.code !== "ENOENT") throw e
	}

	if (payloadHash !== existingHash)
		await writeFile(filepath, payload, "utf-8")
}

