
import {fileURLToPath} from "node:url"

import {Orb} from "./orb.js"
import {ExeDefaultFn, ExeFn, RenderFn, TemplateFn} from "./types.js"
import { dirname, relative } from "node:path"

export function template(importMetaUrl: string, fn: RenderFn): TemplateFn {
	return (root: string, base: string) => {
		const local = dirname(relative(process.cwd(), fileURLToPath(importMetaUrl)))
		const orb = new Orb(root, base, local)
		return fn(orb)
	}
}

export function exe(importMetaUrl: string, fn: ExeFn): ExeDefaultFn {
	return (root: string, base: string) => {
		const local = dirname(relative(process.cwd(), fileURLToPath(importMetaUrl)))
		const orb = new Orb(root, base, local)
		return fn(orb)
	}
}

