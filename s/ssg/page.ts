
import {Orb} from "./orb.js"
import {Html} from "./html.js"
import {html} from "./html-fn.js"
import {SocialCard} from "./types.js"
import {template} from "./template.js"
import {darkreaderDisable, favicon, socialCard, utf8, viewport} from "./snippets.js"

export type TemplePageFn = (o: Orb) => Promise<{
	title: string
	body: Html
	js?: string
	css?: string
	favicon?: string
	head?: Html
	dark?: boolean
	socialCard?: SocialCard
}>

/** @deprecated we now discourage use of this helper, better to just write a full html document yourself */
export function page(importMetaUrl: string, fn: TemplePageFn) {
	return template(importMetaUrl, async orb => {
		const options = await fn(orb)
		return html`
			<!doctype html>
			<html>
				<head>
					${utf8()}
					${viewport()}
					${options.dark ? darkreaderDisable() : null}
					<title>${options.title}</title>
					${options.css && html`<style>${await orb.inject(options.css)}</style>`}
					${options.js && html`<script type=module src="${orb.hashurl(options.js)}"></script>`}
					${options.favicon && favicon(await orb.hashurl(options.favicon))}
					${options.socialCard && socialCard(options.socialCard)}
					${options.head}
				</head>
				<body>
					${options.body}
				</body>
			</html>
		`
	})
}

