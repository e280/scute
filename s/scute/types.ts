
import {Logger} from "@e280/sten"

export type Params = {
	watch: boolean
	in: string[]
	out: string
	copy: string[]
	bundle: boolean
	html: boolean
	exe: boolean
	debounce: number
	exclude: string[]
	verbose: boolean
	logger: Logger
}

export type Step = (params: Params) => Promise<void>

export const step = (fn: Step) => fn

