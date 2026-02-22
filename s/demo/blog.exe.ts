
import {exe} from "../ssg/template.js"

export default exe(import.meta.url, async orb => {
	await orb.io.write("blog.txt", "lol")
})

