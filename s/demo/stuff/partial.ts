
import {html} from "../../ssg/html.js"

export const partial = html.template(import.meta.url, async orb => html`
	<p>root: ${orb.root}</p>
	<p>base: ${orb.base}</p>
	<p>local: ${orb.local}</p>
	<hr/>
	<p>url: ${orb.hashurl("../main.css")}</p>
	<p>path: ${orb.path("../main.css")}</p>
`)

