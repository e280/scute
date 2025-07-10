
import {Step} from "../types.js"

export const scuteBundle: Step = {
	build: async params => {

	},

	watch: async params => {
		return {
			stop: async() => {},
		}
	},
}

