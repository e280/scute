
import {fileURLToPath} from "node:url"
import {relative} from "node:path"

import {Orb} from "./orb.js"
import {ExeDefaultFn, ExeFn, RenderFn, TemplateFn} from "./types.js"

export function template(importMetaUrl: string, fn: RenderFn): TemplateFn {
	return ({root, dest}) => {
		const mod = relative(process.cwd(), fileURLToPath(importMetaUrl))
		const orb = new Orb(root, mod, dest)
		return fn(orb)
	}
}

export function exe(importMetaUrl: string, fn: ExeFn): ExeDefaultFn {
	return ({root, dest}) => {
		const mod = relative(process.cwd(), fileURLToPath(importMetaUrl))
		const orb = new Orb(root, mod, dest)
		return fn(orb)
	}
}

