
import {page} from "./page.js"
import {SocialCard} from "./types.js"
import {exe, template} from "./template.js"
import {darkreaderDisable, favicon, socialCard, utf8, viewport} from "./snippets.js"

export const ssg = {
	template,
	exe,
	page,
	meta: {utf8, viewport, darkreaderDisable, favicon, socialCard},
}

