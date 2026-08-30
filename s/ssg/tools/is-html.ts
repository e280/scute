
import {is} from "@e280/stz"
import {Html} from "../html.js"
import {htmlSymbol} from "./html-symbol.js"

export function isHtml(x: any): x is Html {
	return is.object(x) && x[htmlSymbol] === true
}

