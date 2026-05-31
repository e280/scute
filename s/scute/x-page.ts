#!/usr/bin/env node

import {pathToFileURL} from "node:url"
import {writeFile} from "node:fs/promises"
import {dirname, resolve} from "node:path"

import {TemplateFn} from "../ssg/types.js"
import {untab} from "../ssg/tools/untab.js"
import {detectChange} from "../ssg/tools/hash.js"

const [_a, _b, root, inpath, outpath] = process.argv

const modpath = pathToFileURL(resolve(inpath)).href
const mod = await import(modpath)
const pageSetup = mod.default as TemplateFn
if (!pageSetup)
	throw new Error(`html page template's default export is missing "${inpath}"`)

const template = await pageSetup(root, dirname(inpath))
const result = await template.render()
const final = untab(result).trim() + "\n"

if (await detectChange(outpath, final))
	await writeFile(outpath, final, "utf8")

