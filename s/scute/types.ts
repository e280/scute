
export type Params = {
	watch: boolean
	in: string[]
	out: string
	copy: string[]
	bundle: boolean
	html: boolean
	exclude?: string[]
	verbose: boolean
}

export type Step = {
	build(params: Params): Promise<void>
	watch(params: Params): Promise<Watcher>
}

export type Watcher = {
	stop(): Promise<void>
}

