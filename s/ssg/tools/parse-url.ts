
export function parseUrl(url: string) {
	let path = url
	let hash = ""
	let search = ""

	if (path.includes("#")) {
		const [first, ...rest] = path.split("#")
		path = first
		hash = "#" + rest.join("#")
	}

	if (path.includes("?")) {
		const [first, ...rest] = path.split("?")
		path = first
		search = "?" + rest.join("?")
	}

	return {path, hash, search}
}

