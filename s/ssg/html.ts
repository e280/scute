
import * as npath from "node:path"
import {fileURLToPath} from "node:url"
import {Orb} from "./orb.js"

export type HtmlOptions = {
	strings: TemplateStringsArray | string[]
	values: any[]
}

export type RenderFn = (orb: Orb) => Promise<Html>
export type TemplateFn = (root: string, base: string) => Promise<Html>

export class Html {
	static html = html

	#strings: string[]
	#values: any[]

	constructor({strings, values}: HtmlOptions) {
		this.#strings = [...strings]
		this.#values = values
	}

	#process_value(value: any): string {
		return value instanceof Html
			? value.toString()
			: html.escape(value.toString())
	}

	async #process_async_value(value: any): Promise<string> {
		return value instanceof Html
			? await value.render()
			: html.escape(value.toString())
	}

	toString() {
		return this.#strings.reduce(
			(previous, current, index) => {
				const value = this.#values[index] ?? ""
				const safeValue = Array.isArray(value)
					? value.map(this.#process_value).join("")
					: this.#process_value(value)
				return previous + current + safeValue
			},
			""
		)
	}

	async render() {
		const results = await Promise.all(this.#strings.map(async(string, index) => {
			const value = await this.#values[index] ?? ""
			const safeValue = Array.isArray(value)
				? (await Promise.all(value.map(this.#process_async_value))).join("")
				: await this.#process_async_value(value)
			return string + safeValue
		}))
		return results.join("")
	}
}

export function html(strings: TemplateStringsArray, ...values: any[]): Html {
	return new Html({strings, values})
}

html.raw = (value: string) => new Html({strings: [value], values: []})

html.escape = (text: string) => text
	.replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;")

html.maybe = <V>(value: V, realize: (value: V) => any) => (
	value
		? realize(value)
		: undefined
)

html.attr = {
	bool: (attr: string, value: boolean) => (
		value ? attr : ""
	),
	maybe: (attr: string, value: string | undefined) => (
		value !== undefined
			? html`${attr}="${value}"`
			: ""
	),
}

html.template = (importMetaUrl: string, fn: RenderFn): TemplateFn => {
	return (root: string, base: string) => {
		const local = npath.dirname(npath.relative(process.cwd(), fileURLToPath(importMetaUrl)))
		const orb = new Orb(root, base, local)
		return fn(orb)
	}
}

