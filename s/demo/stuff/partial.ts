
import {html} from "../../ssg/html-fn.js"
import {template} from "../../ssg/template.js"

export const partial = template(import.meta.url, async orb => html`
	<p>root ${orb.root}</p>
	<p>base ${orb.base}</p>
	<p>local ${orb.local}</p>
	<p>../main.css hashurl ${orb.hashurl("../main.css")}</p>
	<p>../main.css path ${orb.path("../main.css")}</p>
`)

