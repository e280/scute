
import {html} from "../ssg/html.js"

export default html.page(import.meta.url, async orb => html`
	<html>
		<head>
			<script type=module src="${orb.hashurl("main.bundle.js")}"></script>
		</head>
		<body>
			<h1>scute demo</h1>
			<p>${orb.packageVersion()}</p>
		</body>
	</html>
`)

