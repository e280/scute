
import {html} from "./html-fn.js"
import {SocialCard} from "./types.js"

export const utf8 = () => html`<meta charset="utf-8"/>`
export const viewport = () => html`<meta name="viewport" content="width=device-width,initial-scale=1"/>`
export const darkreaderDisable = () => html`<meta name="darkreader-lock"/>`
export const favicon = (href: string) => html`<link rel="icon" href="${href}"/>`

/** open graph protocol social card, of type "website", see https://ogp.me/ */
export const socialCard = (card: SocialCard) => html`
	<meta name="theme-color" content="${card.themeColor}">
	<meta property="og:type" content="website">
	<meta property="og:site_name" content="${card.siteName}">
	<meta property="og:title" content="${card.title}">
	<meta property="og:description" content="${card.description}">
	<meta property="og:image" content="${card.image}">
	${card.url ? html`<meta property="og:url" content="${card.url}">` : null}
`

