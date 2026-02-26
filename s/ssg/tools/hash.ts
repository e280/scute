
import {hex, txt} from "@e280/stz"
import {webcrypto} from "node:crypto"
import {readFile} from "node:fs/promises"

export async function hash(data: string | Uint8Array) {
	const d = typeof data === "string"
		? new Uint8Array(txt.toBytes(data))
		: new Uint8Array(data)
	const digest = await webcrypto.subtle.digest("SHA-256", d)
	return hex.fromBytes(new Uint8Array(digest))
}

/** return a local file's hash, otherwise null if the file doesn't exist */
export async function hashFile(filepath: string) {
	try { return await hash(await readFile(filepath)) }
	catch (e: any) { if (e?.code !== "ENOENT") throw e }
	return null
}

export async function detectChange(filepath: string, newPayload: string | Uint8Array) {
	const [newHash, oldHash] = await Promise.all([
		hash(newPayload),
		hashFile(filepath),
	])
	return (newHash !== oldHash)
}

