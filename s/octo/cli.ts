#!/usr/bin/env node

import {parse} from "shell-quote"
import {debounce, defer, count} from "@e280/stz"
import {colorful as colors, Logger} from "@e280/sten"
import {cli, command, deathWithDignity} from "@benev/argv"

import {resolve} from "node:path"
import readline from "node:readline"
import {spawn} from "node:child_process"

const {onDeath, pleaseExit} = deathWithDignity()

const logger = new Logger()
	.setWriter(Logger.writers.console())
	.setShaper(Logger.shapers.errors())

await cli(process.argv, {
	name: "🐙 octo",
	help: `tiny terminal multiplexer for watch routines`,
	commands: command({
		args: [],
		params: {},
		extraArgs: {
			name: "commands",
			help: `
				each command gets its own pane that you can flip between.

				for example,
					$ octo "scute -vw" "tsc -w"

				this will give you two panes,
					- press 1 to see the scute output
					- press 2 to see the tsc output
					- press [ or h or j to shimmy left
					- press ] or l or k to shimmy right
					- press backspace to clear the pane
					- press q or ctrl+c to quit

				local npm bin is available,
					$ scute -vw      # GOOD this works
					$ npx scute -vw  # BAD npx is unnecessary
			`,
		},
		async execute({extraArgs}) {
			if (extraArgs.length === 0) {
				await logger.error(`octo requires at least one command, get some --help`)
				process.exit(1)
			}

			type Pane = {
				command: string
				exe: string
				content: string[]
				proc: ReturnType<typeof spawn>
				exited: boolean
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
				for (const _ of count(process.stdout.rows))
					await logger.log("")

				await logger.log(pane.content.join(""))

				const nav = [...count(panes.length)].map(index => {
					return active === index
						? colors.brightCyan(`[${index + 1}]`)
						: colors.blue(` ${index + 1} `)
				}).join("")
				const cmd = truncateCommand(pane.command)
				const pid = colors.green(pane.proc.pid?.toString() ?? "-")
				const cmdline = colors.dim(colors.green(cmd))
				await logger.log(`🐙 ${nav} ${pid} ${cmdline}`)
				if (notes.length) {
					for (const note of notes)
						await logger.log(note)
				}
			})

			readline.emitKeypressEvents(process.stdin)
			process.stdin.setRawMode(true)

			process.stdin.on("keypress", async(s, key) => {
				const exitRequested = (
					(key.name === "q") ||
					(key.ctrl && key.name === "c")
				)

				if (exitRequested)
					await pleaseExit(0)

				if (s === "[" || s === "h" || s === "j") active = (active - 1 + panes.length) % panes.length
				if (s === "]" || s === "l" || s === "k") active = (active + 1) % panes.length
				if (s >= "1" && s <= String(panes.length)) active = parseInt(s) - 1

				if (key.name === "backspace")
					getActivePane().content = []

				await draw()
			})

			const localBin = resolve("node_modules/.bin")

			for (const command of extraArgs) {
				const [exe, ...args] = parse(command).map(p => p.toString())
				const proc = spawn(exe, args, {
					env: {
						...process.env,
						PATH: `${localBin}:${process.env.PATH}`,
						FORCE_COLOR: "1",
					},
					detached: true,
					stdio: ["pipe", "pipe", "pipe"],
				})
				const pane: Pane = {command, exe, proc, exited: false, content: []}
				panes.push(pane)

				const screenClearing = [
					/x1B\[2J/g,
					/\x1Bc/g,
					/\x0C/g,
				]

				const append = async(chunk: Buffer) => {
					const string = chunk.toString()
					if (screenClearing.some(r => r.test(string))) // clear pane
						pane.content = []
					let s = string
						.replace(/\x1B\[\d+;\d+H/g, "") // cursor move
						.replace(/\x1B\[H/g, "")        // alternate cursor move
						.replace(/\x1B\[0f/g, "")       // also cursor home (used by some CLIs)
						.replace(/\x1B\[3J/g, "")            // clear scrollback (sometimes used)
						.replace(/\x1B\[0f/g, "")            // alternate cursor home
						.replace(/\x1B\[\?1049[hl]/g, "")    // alt screen buffer on/off
					for (const r of screenClearing)
						s = s.replace(r, "")
					pane.content.push(s)
					pane.content = pane.content.slice(-128)
					if (getActivePane() === pane)
						await draw()
				}

				proc.stdout.on("data", append)
				proc.stderr.on("data", append)

				proc.on("exit", async(code, signal) => {
					pane.exited = true
					pane.content.push(`\n🐙 subprocess exited code ${code}, signal ${signal}`)
					if (getActivePane() === pane)
						await draw()
				})
			}

			async function logKilled(pane: Pane, already: boolean) {
				const flag = colors.blue(
					already
						? `dead`
						: `kill`
				)
				const pid = colors.green(pane.proc.pid?.toString() ?? "-")
				const cmdline = colors.dim(colors.green(truncateCommand(pane.command)))
				notes.push(`🐙 ${flag} ${pid} ${cmdline}`)
				await draw()
			}

			onDeath(async() => {
				const waiting: Promise<void>[] = []
				for (const pane of panes) {
					if (pane.proc.killed || pane.exited) {
						await logKilled(pane, true)
						continue
					}
					pane.proc.kill("SIGTERM")
					await draw()
					const deferred = defer<void>()
					waiting.push(deferred.promise)
					pane.proc.on("exit", async() => {
						await logKilled(pane, false)
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

