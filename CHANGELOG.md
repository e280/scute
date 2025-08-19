
# `@e280/scute` changelog
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement

<br/>

## v0.0

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

