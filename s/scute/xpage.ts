#!/usr/bin/env node

import npath from "node:path"
import {pathToFileURL} from "node:url"

import {Io} from "../ssg/io.js"
import {TemplateFn} from "../ssg/html.js"
import {untab} from "../ssg/tools/untab.js"

const [_a, _b, root, inpath, outpath] = process.argv

const modpath = pathToFileURL(npath.resolve(inpath)).href
const mod = await import(modpath)
const pageSetup = mod.default as TemplateFn
if (!pageSetup)
	throw new Error(`html page template's default export is missing "${inpath}"`)

const io = new Io()
const template = await pageSetup(root, npath.dirname(inpath))
const result = await template.render()
const final = untab(result).trim() + "\n"
await io.write(outpath, final)

