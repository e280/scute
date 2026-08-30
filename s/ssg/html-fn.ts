
import {Html} from "./html.js"
import {isHtml} from "./tools/is-html.js"

export function html(strings: TemplateStringsArray, ...values: any[]): Html {
	return new Html({strings, values})
}

html.is = isHtml

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

