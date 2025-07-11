#!/usr/bin/env node

import {parse} from "shell-quote"
import {debounce, defer, loop} from "@e280/stz"
import {colorful as colors, Logger} from "@e280/sten"
import {cli, command, deathWithDignity} from "@benev/argv"

import readline from "node:readline"
import {spawn} from "node:child_process"

const {onDeath, pleaseExit} = deathWithDignity()

const logger = new Logger()
	.setWriter(Logger.writers.console())
	.setShaper(Logger.shapers.errors())

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
				- press [ or h or j to shimmy left
				- press ] or l or k to shimmy right
			`,
		},
		async execute({extraArgs}) {
			type Pane = {
				command: string
				exe: string
				content: string[]
				proc: ReturnType<typeof spawn>
			}

			const notes: string[] = []

			const panes: Pane[] = []
			let active = 0
			const getActivePane = () => {
				const pane = panes.at(active)
				if (!pane) throw new Error("invalid active pane")
				return pane
			}

			const draw = debounce(0, async() => {
				const pane = getActivePane()

				console.clear()
				for (const _ of loop(process.stdout.rows))
					await logger.log("")

				await logger.log(pane.content.join(""))

				const nav = [...loop(panes.length)].map(index => {
					return active === index
						? colors.brightCyan(`[${index + 1}]`)
						: colors.blue(` ${index + 1} `)
				}).join("")
				const cmd = truncateCommand(pane.command)
				const pid = colors.green(pane.proc.pid?.toString() ?? "-")
				const cmdline = colors.dim(colors.green(cmd))
				await logger.log(`🕷️ ${nav} ${pid} ${cmdline}`)
				if (notes.length) {
					for (const note of notes)
						await logger.log(note)
				}
			})

			readline.emitKeypressEvents(process.stdin)
			process.stdin.setRawMode(true)

			process.stdin.on("keypress", async(key, data) => {
				const exitRequested = (
					(data.name === "q") ||
					(data.ctrl && data.name === "c")
				)

				if (exitRequested)
					await pleaseExit(0)

				if (key === "[" || key === "h" || key === "j") active = (active - 1 + panes.length) % panes.length
				if (key === "]" || key === "l" || key === "k") active = (active + 1) % panes.length
				if (key >= "1" && key <= String(panes.length)) active = parseInt(key) - 1

				await draw()
			})

			for (const command of extraArgs) {
				const [exe, ...args] = parse(command).map(p => p.toString())
				const proc = spawn(exe, args, {env: process.env})
				const pane: Pane = {command, exe, proc, content: []}
				panes.push(pane)

				const append = async(chunk: Buffer) => {
					const string = chunk.toString()
					if (/\x1B\[2J/g.test(string)) // clear pane
						pane.content = []
					const s = string
						.replace(/\x1B\[2J/g, "")       // clear screen
						.replace(/\x1B\[\d+;\d+H/g, "") // cursor move
						.replace(/\x1B\[H/g, "")        // alternate cursor move
					pane.content.push(s)
					pane.content = pane.content.slice(-128)
					if (getActivePane() === pane)
						await draw()
				}

				proc.stdout.on("data", append)
				proc.stderr.on("data", append)

				proc.on("exit", async(code, signal) => {
					pane.content.push(`\n🕷️ subprocess exited ${code} ${signal}`)
					if (getActivePane() === pane)
						await draw()
				})
			}

			onDeath(async() => {
				const waiting: Promise<void>[] = []
				for (const pane of panes) {
					pane.proc.kill("SIGTERM")
					await draw()
					const deferred = defer<void>()
					waiting.push(deferred.promise)
					pane.proc.on("exit", async() => {
						const flag = colors.blue(`closed`)
						const pid = colors.green(pane.proc.pid?.toString() ?? "-")
						const cmdline = colors.dim(colors.green(truncateCommand(pane.command)))
						notes.push(`🕷️ ${flag} ${pid} ${cmdline}`)
						await draw()
						deferred.resolve()
					})
				}
				await Promise.all(waiting)
				await draw()
			})
		},
	}),
}).execute()

function truncateCommand(cmd: string) {
	return cmd.length > 32
		? cmd.slice(0, 32) + ".."
		: cmd
}

