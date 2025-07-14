
import {ssg} from "../ssg/ssg.js"

export default ssg.exe(import.meta.url, async orb => {
	await orb.io.write("blog.txt", "lol")
})

