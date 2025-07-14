
import * as npath from "node:path"
import {fileURLToPath} from "node:url"

import {Orb} from "./orb.js"

export type ExeFn = (orb: Orb) => Promise<void>
export type ExeSetupFn = (root: string, base: string) => Promise<void>

export function exe(importMetaUrl: string, fn: ExeFn): ExeSetupFn {
	return (root: string, base: string) => {
		const local = npath.dirname(npath.relative(process.cwd(), fileURLToPath(importMetaUrl)))
		const orb = new Orb(root, base, local)
		return fn(orb)
	}
}

