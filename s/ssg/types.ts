
import {Orb} from "./orb.js"
import {Html} from "./html.js"

export type FilePath = {
	relative: string
	directory: string
	absolute: string
	partial: string
}

export type Pathing = {
	root: string
	dest: string
}

/** open graph protocol social card, of type "website", see https://ogp.me/ */
export type SocialCard = {

	/** primary title */
	title: string

	/** one or two sentence description */
	description: string

	/** defaults to "website" but maybe you'd like to set "article" */
	type?: string

	/** brand name this content belongs to */
	siteName?: string

	/** hex color code (not actually part of the open graph protocol, might be a discord-specific thing) */
	themeColor?: string

	/** url to the poster image */
	image?: string

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
export type TemplateFn = (pathing: Pathing) => Promise<Html>

export type ExeFn = (orb: Orb) => Promise<void>
export type ExeDefaultFn = (pathing: Pathing) => Promise<void>

