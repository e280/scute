
import * as npath from "node:path"
import {fileURLToPath} from "node:url"

import {Orb} from "./orb.js"
import {html, Html} from "./html.js"
import {ExeDefaultFn, ExeFn, RenderFn, SocialCard, TemplateFn} from "./types.js"

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

export const ssg = {
	template: (importMetaUrl: string, fn: RenderFn): TemplateFn => {
		return (root: string, base: string) => {
			const local = npath.dirname(npath.relative(process.cwd(), fileURLToPath(importMetaUrl)))
			const orb = new Orb(root, base, local)
			return fn(orb)
		}
	},

	exe: (importMetaUrl: string, fn: ExeFn): ExeDefaultFn => {
		return (root: string, base: string) => {
			const local = npath.dirname(npath.relative(process.cwd(), fileURLToPath(importMetaUrl)))
			const orb = new Orb(root, base, local)
			return fn(orb)
		}
	},

	meta: {
		utf8: () => html`<meta charset="utf-8"/>`,
		viewport: () => html`<meta name="viewport" content="width=device-width,initial-scale=1"/>`,
		darkreaderDisable: () => html`<meta name="darkreader-lock"/>`,
		favicon: (href: string) => html`<link rel="icon" href="${href}"/>`,

		/** open graph protocol social card, of type "website", see https://ogp.me/ */
		socialCard: (card: SocialCard) => html`
			<meta name="theme-color" content="${card.themeColor}">
			<meta property="og:type" content="website">
			<meta property="og:site_name" content="${card.siteName}">
			<meta property="og:title" content="${card.title}">
			<meta property="og:description" content="${card.description}">
			<meta property="og:image" content="${card.image}">
			${card.url ? html`<meta property="og:url" content="${card.url}">` : null}
		`,
	},

	page(importMetaUrl: string, fn: TemplePageFn) {
		return ssg.template(importMetaUrl, async orb => {
			const options = await fn(orb)
			return html`
				<!doctype html>
				<html>
					<head>
						${ssg.meta.utf8()}
						${ssg.meta.viewport()}
						${options.dark ? ssg.meta.darkreaderDisable() : null}
						<title>${options.title}</title>
						${options.css && html`<style>${await orb.inject(options.css)}</style>`}
						${options.js && html`<script type=module src="${orb.hashurl(options.js)}"></script>`}
						${options.favicon && ssg.meta.favicon(await orb.hashurl(options.favicon))}
						${options.socialCard && ssg.meta.socialCard(options.socialCard)}
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

