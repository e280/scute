
import {hex, txt} from "@e280/stz"
import {webcrypto} from "node:crypto"

export async function hash(text: string) {
	const data = new Uint8Array(txt.toBytes(text))
	const digest = await webcrypto.subtle.digest("SHA-256", data)
	return hex.fromBytes(new Uint8Array(digest))
}

