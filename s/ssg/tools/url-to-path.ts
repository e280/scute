
export function urlToPath(url: string) {
	return url
		.replace(/#.*$/, "")
		.replace(/\?.*$/, "")
}

