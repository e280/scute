#!/usr/bin/env node

import {resolve} from "node:path"
import {pathToFileURL} from "node:url"
import {ExeDefaultFn} from "../ssg/types.js"

const [_a, _b, root, inpath] = process.argv

const modpath = pathToFileURL(resolve(inpath)).href
const mod = await import(modpath)
const exe = mod.default as ExeDefaultFn
if (!exe)
	throw new Error(`exe default export is missing "${inpath}"`)

await exe({
	root,
	dest: inpath,
})

