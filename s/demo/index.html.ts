
import {html} from "../ssg/html.js"
import {partial} from "./stuff/partial.js"

export default html.template(import.meta.url, async orb => html`
	<html>
		<head>
			<script type=module src="${orb.hashurl("main.bundle.js")}"></script>
			<link rel=stylesheet href="${orb.hashurl("main.css")}"/>
		</head>
		<body>
			<h1>scute demo</h1>
			<p>${orb.packageVersion()}</p>

			<div>
				<p>url: ${orb.url("main.css")}</p>
				<p>path: ${orb.path("main.css")}</p>
			</div>

			<div class=partial>
				${orb.template(partial)}
			</div>
		</body>
	</html>
`)

