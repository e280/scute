
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
	splitting: boolean
	verbose: boolean
	logger: Logger
	"also-watch": string[]
}

export type Step = (params: Params) => Promise<void>

export const step = (fn: Step) => fn

