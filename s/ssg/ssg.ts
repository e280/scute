
import {page} from "./page.js"
import {SocialCard} from "./types.js"
import {exe, template} from "./template.js"
import {darkreaderDisable, favicon, emojiSvg, socialCard, utf8, viewport} from "./snippets.js"

/** @deprecated now you should just import stuff like 'template', 'socialCard', directly */
export const ssg = {
	template,
	exe,
	page,
	meta: {utf8, viewport, darkreaderDisable, favicon, emojiSvg, socialCard},
}

