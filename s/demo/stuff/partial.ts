
import {html} from "../../ssg/html-fn.js"
import {template} from "../../ssg/template.js"

export const partial = template(import.meta.url, async orb => html`
	<p>root <code>${orb.root}</code></p>
	<p>dest <code>${orb.dest}</code></p>
	<p>mod <code>${orb.mod}</code></p>
	<p>../main.css hashurl <code>${orb.hashurl("../main.css")}</code></p>
	<p>../main.css path <code>${orb.path("../main.css")}</code></p>
`)

