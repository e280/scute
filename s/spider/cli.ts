#!/usr/bin/env node

import {parse} from "shell-quote"
import readline from "node:readline"
import {spawn} from "node:child_process"
import {cli, command, deathWithDignity} from "@benev/argv"

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

			function draw() {
				const pane = getActivePane()
				console.clear()
				console.log(pane.content.join(""))
				console.log(`\n[🕷️ spider ${active + 1}/${panes.length} ${pane.command.slice(0, 24)}]`)
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

