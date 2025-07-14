
import {ssg} from "../../ssg/ssg.js"
import {html} from "../../ssg/html.js"

export const partial = ssg.template(import.meta.url, async orb => html`
	<p>root ${orb.root}</p>
	<p>base ${orb.base}</p>
	<p>local ${orb.local}</p>
	<p>../main.css hashurl ${orb.hashurl("../main.css")}</p>
	<p>../main.css path ${orb.path("../main.css")}</p>
`)

