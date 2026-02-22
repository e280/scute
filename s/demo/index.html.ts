
import {html} from "../ssg/html-fn.js"
import {partial} from "./stuff/partial.js"
import {template} from "../ssg/template.js"

export default template(import.meta.url, async orb => html`
	<html>
		<head>
			<script type=module src="${orb.hashurl("main.bundle.min.js")}"></script>
			<link rel=stylesheet href="${orb.hashurl("main.css")}"/>
		</head>
		<body>
			<h1>scute demo v${orb.packageVersion()}</h1>

			<h2>path tests</h2>
			<div>
				<p>
					<strong>/index.js</strong>
					<code>${orb.path("/index.js")}</code>
				</p>
				<p>
					<strong>/index.js (hashurl)</strong>
					<code>${orb.hashurl("/index.js")}</code>
				</p>
				<p>
					<strong>../scute/types.js</strong>
					<code>${orb.path("../scute/types.js")}</code>
				</p>
				<p>
					<strong>$/x/scute/types.js</strong>
					<code>${orb.path("$/x/scute/types.js")}</code>
				</p>
			</div>

			<h2>partial test</h2>
			<div class=partial>
				${orb.place(partial)}
			</div>

			<h2>orb.inject test</h2>
			<code>
				${orb.inject("main.css")}
			</code>
		</body>
	</html>
`)

