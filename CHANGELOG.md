
# `@e280/scute` changelog
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement



<br/><br/>

## v0.4

### v0.4.0
- 🟥 delete all previously deprecated stuff
- 🟥 swap order, so that `exe` scripts happen *before* `.html.ts` are generated
- 🍏 esbuild configured to load `.json` as json, and `.css` as text.
- 🟥 reworked orb/resolver pathing
  - 🟥 orb/resolver now has `root`, `dest`, and `mod` paths
  - 🟥 orb/resolver `url` and `hashurl` methods now accept optional `rooted` boolean
  - 🍏 added "@/path/from/dest" pathy form



<br/><br/>

## v0.3

### v0.3.2
- 🍏 add --splitting option to scute cli, for esbuild

### v0.3.1
- 🍏 improve socialcard optionals

### v0.3.0
- 🟥 moved octo to its own package! see https://github.com/e280/octo



<br/><br/>

## v0.2

### v0.2.2
- 🍏 fix readme on templating

### v0.2.1
- 🔶 deprecate `emojiSvg` in favor of `dataSvgEmoji` or `svgEmoji`
    ```ts
    // old bad
    html`<link rel="icon" href="${emojiSvg("🗿")}"/>`

    // new good
    html`<link rel="icon" href="${dataSvgEmoji("🗿")}"/>`

    // new good
    html`<link rel="icon" href="data:image/svg+xml,${svgEmoji("🗿")}"/>`
    ```

### v0.2.0
- 🟥 glob cli flags are now semicolon delimited.
  - `--copy="**/*.css;**/*.json"`
  - `--exclude="**/*.css;**/*.json"`
- 🍏 more extensive default --copy files



<br/><br/>

## v0.1

### v0.1.5
- 🍏 scute now avoids unnecessary writes whenever possible (checking file hashes)
- 🍏 update dependencies

### v0.1.4
- 🍏 update dependencies

### v0.1.3
- 🔶 deprecated 'ssg', and uprooted all its exports, eg,
  - `ssg.template` is now also exported as just `template`, same with `page`, `exe`, etc
  - same with all metas like `ssg.meta.viewport` is now available as `viewport`, etc
- 🔶 deprecated `page` helper, prefer to just let people write their own html doc
- 🍏 added new `emojiSvg` snippet which produces a data svg out of the provided emoji -- great for insta-favicons!
- 🍏 only write out templating results when genuine changes are detected (cuts down on mtime noise)
- 🍏 rework readme
- 🍏 updated dependencies

### v0.1.2
- 🍏 add `--debounce` param to watch routine
- 🍏 updated dependencies

### v0.1.1
- 🍏 updated dependencies

### v0.1.0
- 🍏 improve readme
- 🍏 updated dependencies



<br/><br/>

## v0.0

### v0.0.0
- 🍏 updated dependencies

### v0.0.0-8
- 🍏 enable esbuild code splitting for dynamic imports

### v0.0.0-7
- 🍏 update dependencies
- 🍏 formalize package exports

### v0.0.0-6
- 🍏 add these options to the esbuild bundles
  ```json
	format: "esm",
	target: "es2023",
	platform: "browser",
	```

### v0.0.0-5
- 🍏 update dependencies

### v0.0.0-4
- 🍏 fix `orb.packageJson` and io `readJson` and `writeJson` pathing issue

### v0.0.0-3
- 🟥 rename `temple` to `ssg`
- 🟥 move `exe` to `ssg.exe`
- 🟥 move `html.template` to `ssg.template`
- 🍏 add `js` option to `ssg.page`

### v0.0.0-2
- 🍏 add `.exe.js` script execution and `exe` exported fn
- 🍏 reworked watch routine, now has deterministic order

### v0.0.0-1
- 🍏 first release

