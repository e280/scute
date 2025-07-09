
<div align="center"><img alt="" width="512" src="./assets/scute.avif"/></div>

<br/>

> [!IMPORTANT]  
> scute doesn't work yet. it's not done. wip.

<br/>

# 🐢 scute

### lil buildy-bundly-buddy
- one simple command `scute` builds your web project
- runs typescript and does all the bundley stuff
- static site generator, with its own html templating language
- minimal and zero-config

### get scute
- install scute in your project
  ```sh
  npm install @e280/scute
  ```
- in your terminal, run scute help via npx
  ```sh
  npx scute --help
  ```
- in your package scripts, run scute help nakedly
  ```sh
  scute --help
  ```

<br/>

## scute cli to build your project

```sh
scute
```

options (defaults shown)
- `--watch="no"` — is this a watch routine?
- `--in="src,dist"` — where to read input files
- `--out="dist"` — where to emit output files
- `--tsc="yes"` — should we run tsc?
- `--bundle="yes"` — should we bundle ".bundle.js" entrypoints?
- `--html="yes"` — should we build ".html.js" templates?
- `--copy="*.css,*.json,*.txt"` — what files should we copy verbatim?
- `--exclude=""` — what files should we ignore?
- `--verbose="no"` — should we log a bunch of crap?

what does scute *actually* do?
1. runs typescript compiler `tsc`
1. copies files like `.css` from your `src` to your `dist`
1. builds `*.html.js` template js files
1. bundles `*.bundle.js` entrypoints with `esbuild`

<br/>

## scute html templating

as a static-site-generator, scute provides an html templating language, for you to write web pages.

> [!IMPORTANT]  
> TODO this section

