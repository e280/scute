
import {nap} from "@e280/stz"
import {Science, test, expect} from "@e280/science"

import {Orb} from "./orb.js"
import {Html, html} from "./html.js"
import {untab} from "./tools/untab.js"

export default Science.suite({
	"ergonomics": {
		"null and undefined injections do nothing": test(async() => {
			const expectedResult = "hello world"
			expect(html`hello${null} world`.toString()).is(expectedResult)
			expect(html`hello${undefined} world`.toString()).is(expectedResult)
			expect(html`hello${""} world`.toString()).is(expectedResult)
		}),
	},

	"async": {
		"injected promises are resolved": test(async() => {
			const expectedResult = "hello world!"
			const promise = Promise.resolve("world!")
			expect(await html`hello ${promise}`.render()).is(expectedResult)
		}),
		"injected promises can be nested": test(async() => {
			const expectedResult = "hello world!"
			const promise1 = Promise.resolve("world!")
			const promise2 = Promise.resolve(html`${promise1}`)
			expect(await html`hello ${promise2}`.render()).is(expectedResult)
		}),
		"injected promises are sanitized": test(async() => {
			const promise = Promise.resolve("<script>")
			expect((await html`hello ${promise}`.render()).includes("<script>")).not.ok()
		}),
		"non-promise values can be rendered via async render": test(async() => {
			expect(await html`hello ${"world!"}`.render()).is("hello world!")
		}),
		"multiple injections are ordered correctly": test(async() => {
			expect(await html`hello ${"world"}, ${"lmao"}`.render())
				.is("hello world, lmao")
			const slowPromise = nap(10).then(() => "hello")
			const fastPromise = Promise.resolve("world")
			expect(await html`${slowPromise} ${fastPromise}!`.render())
				.is("hello world!")
		}),
	},

	"sanitization": (() => {
		const isSanitized = (t: Html) => !t.toString().includes("<script>")
		return {
			"template itself is not sanitized": test(async() => {
				expect(!isSanitized(html`<script></script>`)).ok()
			}),
			"injected values are sanitized": test(async() => {
				expect(isSanitized(html`${"<script>"}`)).ok()
			}),
			"nested injected values are sanitized": test(async() => {
				expect(isSanitized(html`${html`${"<script>"}`}`)).ok()
			}),
			"injected array values are sanitized": test(async() => {
				expect(isSanitized(html`${["<script>"]}`)).ok()
			}),
			"object keys are sanitized": test(async() => {
				expect(isSanitized(html`${{"<script>": true}}`)).ok()
			}),
			"object values are sanitized": test(async() => {
				expect(isSanitized(html`${{a: "<script>"}}`)).ok()
			}),
			"object toString result is sanitized": test(async() => {
				expect(isSanitized(html`${{toString() {return "<script>"}}}`)).ok()
			}),
		}
	})(),

	"nesting": {
		"nested html functions must not be sanitized": async() => {
			const input = html`${html`<div></div>`}`
			const output = "<div></div>"
			expect(input.toString(), "nested html function is sanitized").is(output)
		},
		"multiple html functions can be nested": async() => {
			const input = html`${html`${html`${html`<div></div>`}`}`}`
			const output = "<div></div>"
			expect(input.toString()).is(output)
		},
		"nested injected values are sanitized": async() => {
			const input = html`${html`${`<script></script>`}`}`
			const output = "&lt;script&gt;&lt;/script&gt;"
			expect(input.toString(), "nested injected values are not sanitized").is(output)
		}
	},

	"arrays": {
		"arrays of values are joined together cleanly": test(async() => {
			const items = ["alpha", "bravo"]
			const output = html`${items}`.toString()
			expect(output, "arrays should be cleanly joined").is("alphabravo")
		}),
	},

	"versioning": {
		"adds file hash to url": test(async() => {
			const orb = new Orb("x", "x", "x")
			const url = await orb.hashurl("index.js")
			expect(/^(\S+)\?v=\S{8,64}$/.test(url)).ok()
		}),
		"adds file hash to url that already has a querystring": test(async() => {
			const orb = new Orb("x", "x", "x")
			const url = await orb.hashurl("index.js?lol=rofl")
			expect(/^(\S+)\?lol=rofl&v=\S{8,64}$/.test(url)).ok()
		}),
	},

	"untab": {
		"handles string without any tabbing": test(async() => {
			expect(untab("lol")).is("lol")
		}),
		"removes leading tabs from input": test(async() => {
			const result1 = untab(`
				lol
			`)
			const result2 = untab(`
				lol
				rofl
			`)
			expect(result1).is("\nlol\n")
			expect(result2).is("\nlol\nrofl\n")
		}),
		"retains nested tabbing": test(async() => {
			expect(
				untab(`
					lol
						rofl
							kek
					lmao
				`)
			).is("\nlol\n\trofl\n\t\tkek\nlmao\n")
			expect(
				untab(`
					lol

						rofl\n\t\t
							kek
					lmao
				`)
			).is("\nlol\n\n\trofl\n\n\t\tkek\nlmao\n")
		}),
	},

	"raw": {
		"raw values are not sanitized": test(async() => {
			const value = "script"
			const result = html`${html.raw(value)}`
			expect(result.toString()).is(value)
		}),
	},
})

