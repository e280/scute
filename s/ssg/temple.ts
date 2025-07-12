
import {Orb} from "./orb.js"
import {html, Html} from "./html.js"
import {SocialCard} from "./types.js"

export type TemplePageFn = (o: Orb) => Promise<{
	title: string
	body: Html
	css?: string
	head?: Html
	dark?: boolean
}>

export const temple = {
	meta: {
		utf8: () => html`<meta charset="utf-8"/>`,
		viewport: () => html`<meta name="viewport" content="width=device-width,initial-scale=1"/>`,
		darkreaderDisable: () => html`<meta name="darkreader-lock"/>`,

		/** open graph protocol social card, of type "website", see https://ogp.me/ */
		socialCard: (card: SocialCard) => html`
			<meta name="theme-color" content="${card.themeColor}">
			<meta property="og:type" content="website">
			<meta property="og:site_name" content="${card.siteName}">
			<meta property="og:title" content="${card.title}">
			<meta property="og:description" content="${card.description}">
			<meta property="og:image" content="${card.image}">
			${card.url
				? html`<meta property="og:url" content="${card.url}">`
				: null}
		`,
	},

	page(importMetaUrl: string, fn: TemplePageFn) {
		return html.template(importMetaUrl, async orb => {
			const options = await fn(orb)
			const css = options.css
				? html`<style>${await orb.inline(options.css)}</style>`
				: null
			return html`
				<!doctype html>
				<html>
					<head>
						${temple.meta.utf8()}
						${temple.meta.viewport()}
						${options.dark ? temple.meta.darkreaderDisable() : null}
						<title>${options.title}</title>
						${css}
						${options.head}
					</head>
					<body>
						${options.body}
					</body>
				</html>
			`
		})
	},
}

