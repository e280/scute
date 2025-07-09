
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

*run this command to build your project*
```sh
scute
```

`--help`
```
🐢 scute {params}
  the lil buildy-bundly-buddy that builds your web projects.
  - runs typescript compiler
  - copies files like .css from s/ to x/
  - builds .html.js template js files
  - bundles .bundle.js entrypoints with esbuild

  --watch, -w, flag boolean
    watch mode

  --in, default string-list s,x
    dirs to read from

  --out, default string-list x
    output dir

  --tsc, default boolean yes
    should we run tsc?

  --copy, default string-list *.css,*.json,*.txt
    what files should we copy verbatim?

  --bundle, default boolean yes
    should we bundle .bundle.js files?

  --html, default boolean yes
    should we build .html.js templates?

  --exclude, optional string
    what files should we ignore?

  --verbose, -v, flag boolean
    should we log a bunch of crap?
```

<br/>

## scute html templating

as a static-site-generator, scute provides an html templating language, for you to write web pages.

> [!IMPORTANT]  
> TODO this section

