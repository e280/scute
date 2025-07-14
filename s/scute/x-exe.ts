#!/usr/bin/env node

import npath from "node:path"
import {pathToFileURL} from "node:url"
import {ExeDefaultFn} from "../ssg/types.js"

const [_a, _b, root, inpath] = process.argv

const modpath = pathToFileURL(npath.resolve(inpath)).href
const mod = await import(modpath)
const exe = mod.default as ExeDefaultFn
if (!exe)
	throw new Error(`exe default export is missing "${inpath}"`)

await exe(root, npath.dirname(inpath))

