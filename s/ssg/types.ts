
import {Orb} from "./orb.js"
import {Html} from "./html.js"

export type FilePath = {
	relative: string
	directory: string
	absolute: string
	partial: string
}

/** open graph protocol social card, of type "website", see https://ogp.me/ */
export type SocialCard = {

	/** not actually part of the open graph protocol, might be a discord-specific thing */
	themeColor: string

	/** brand name or domain this content belongs to */
	siteName: string

	/** primary title */
	title: string

	/** a one or two sentence description */
	description: string

	/** url to the poster image */
	image: string

	/** canonical perma-url to this content */
	url?: string
}

/** open graph protocol social card, of type "website", see https://ogp.me/ */
export function asSocialCard(card: SocialCard) {
	return card
}

export type HtmlOptions = {
	strings: TemplateStringsArray | string[]
	values: any[]
}

export type RenderFn = (orb: Orb) => Promise<Html>
export type TemplateFn = (root: string, base: string) => Promise<Html>

export type ExeFn = (orb: Orb) => Promise<void>
export type ExeDefaultFn = (root: string, base: string) => Promise<void>

