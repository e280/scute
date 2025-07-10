#!/usr/bin/env node

import {loop} from "@e280/stz"
import {Logger} from "@e280/sten"
import {parse} from "shell-quote"
import {cli, command, deathWithDignity} from "@benev/argv"

import readline from "node:readline"
import {spawn} from "node:child_process"

const logger = new Logger()
	.setShaper(Logger.shapers.errors())

const {colors} = logger

const {onDeath, pleaseExit} = deathWithDignity()

await cli(process.argv, {
	name: "🕷️ spider",
	help: `tiny terminal multiplexer for watch routines`,
	commands: command({
		args: [],
		params: {},
		extraArgs: {
			name: "commands",
			help: `
				shell commands to multiplex

				for example,
					$ spider "npx tsc -w" "npx scute -w"

				here, you will get two panes,
				- press 1 to see the tsc output
				- press 2 to see the scute output
				- press [ or h to shimmy left
				- press ] or l to shimmy right
			`,
		},
		async execute({extraArgs}) {
			type Pane = {
				command: string
				exe: string
				content: string[]
				proc: ReturnType<typeof spawn>
			}

			const panes: Pane[] = []
			let active = 0
			const getActivePane = () => {
				const pane = panes.at(active)
				if (!pane) throw new Error("invalid active pane")
				return pane
			}

			async function draw() {
				const pane = getActivePane()
				console.clear()
				await logger.log(pane.content.join(""))
				const nav = [...loop(panes.length)].map(index => {
					return active === index
						? colors.brightCyan(`[${index + 1}]`)
						: colors.blue(`${index + 1}`)
				}).join(" ")
				const cmd = pane.command.slice(0, 24)
				await logger.log(colors.blue(
					`\n🕷️ ${nav} ${colors.dim(colors.green(cmd))}`
				))
			}

			readline.emitKeypressEvents(process.stdin)
			process.stdin.setRawMode(true)

			process.stdin.on("keypress", async(key, data) => {
				const exitRequested = (
					(data.name === "q") ||
					(data.ctrl && data.name === "c")
				)

				if (exitRequested)
					await pleaseExit(0)

				if (key === "[" || key === "h") active = (active - 1 + panes.length) % panes.length
				if (key === "]" || key === "l") active = (active + 1) % panes.length
				if (key >= "1" && key <= String(panes.length)) active = parseInt(key) - 1

				draw()
			})

			for (const command of extraArgs) {
				const [exe, ...args] = parse(command).map(p => p.toString())
				const proc = spawn(exe, args, {env: process.env})
				const pane: Pane = {command, exe, proc, content: []}
				panes.push(pane)

				const append = (chunk: Buffer) => {
					pane.content.push(chunk.toString())
					pane.content = pane.content.slice(-128)
					if (getActivePane() === pane) draw()
				}

				proc.stdout.on("data", append)
				proc.stderr.on("data", append)

				proc.on("exit", code => {
					pane.content.push(`\n[spider] exited with code ${code}`)
					if (getActivePane() === pane) draw()
				})

				onDeath(() => void proc.kill("SIGTERM"))
			}
		},
	}),
}).execute()

