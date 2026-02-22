#!/usr/bin/env node

import npath from "node:path"
import {pathToFileURL} from "node:url"

import {TemplateFn} from "../ssg/types.js"
import {untab} from "../ssg/tools/untab.js"
import {writeIfDifferent} from "../ssg/tools/write-if-different.js"

const [_a, _b, root, inpath, outpath] = process.argv

const modpath = pathToFileURL(npath.resolve(inpath)).href
const mod = await import(modpath)
const pageSetup = mod.default as TemplateFn
if (!pageSetup)
	throw new Error(`html page template's default export is missing "${inpath}"`)

const template = await pageSetup(root, npath.dirname(inpath))
const result = await template.render()
const final = untab(result).trim() + "\n"
await writeIfDifferent(outpath, final)

