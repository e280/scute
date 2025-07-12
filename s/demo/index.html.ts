
import {html} from "../ssg/html.js"
import {partial} from "./stuff/partial.js"

export default html.template(import.meta.url, async orb => html`
	<html>
		<head>
			<script type=module src="${orb.hashurl("main.bundle.js")}"></script>
			<link rel=stylesheet href="${orb.hashurl("main.css")}"/>
			${orb.inline("main.css")}
		</head>
		<body>
			<h1>scute demo</h1>

			<div>
				<p>/index.js hashurl ${orb.hashurl("/index.js")}</p>
				<p>/index.js path ${orb.path("/index.js")}</p>
			</div>

			<div class=partial>
				${orb.place(partial)}
			</div>
		</body>
	</html>
`)

