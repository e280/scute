
<div align="center"><img alt="" width="512" src="./assets/scute.avif"/></div>

<br/>

> [!IMPORTANT]  
> scute doesn't work yet. it's not done. wip.

<br/>

# scute — your lil buildy bundly buddy
- `🐢 scute` cli is a zero-config static-site-generator
- `🕷️ spider` cli is a tiny simple multiplexer
- `@e280/scute` is a library for html templating

### get scute
- install scute in your project
  ```sh
  npm install @e280/scute
  ```
- run scute help to learn about it
  ```sh
  npx scute --help
  ```
- run spider help to learn about it
  ```sh
  npx spider --help
  ```

<br/>

## tldr — setup your app
1. setup your typescript app with your ts code in `s/` dir, and outputting to `x/` dir
1. setup a `tests.test.ts` test suite with [@e280/science](https://github.com/e280/science)
1. add these build and watch scripts to your npm package.json
    ```json
    {
      "build": "tsc && scute",
      "watch": "spider 'npx tsc -w' 'npx scute -w' 'node --watch x/tests.test.js'"
    }
    ```
1. write `.html.ts` files with default exported templates
1. write `.bundle.ts` files and they'll be bundled automatically
1. files like `.css` and `.json` will be copied automatically
1. you are now a cool person

<br/>

## `🐢 scute` — builds your website

**`scute --help`**

```
🐢 scute {params}
  lil buildy bundly buddy for your web projects
  - copies files like .css from s/ to x/
  - bundles .bundle.js entrypoints with esbuild
  - builds .html.js template js files

  --watch, -w, flag boolean
    watch mode

  --in, default string-list s,x
    dirs to read from

  --out, default string-list x
    output dir

  --copy, default string-list *.css,*.json,*.txt
    what files should we copy verbatim?

  --bundle, default boolean yes
    should we bundle .bundle.js files?

  --html, default boolean yes
    should we build .html.js templates?

  --exclude, optional string-list
    what files should we ignore?

  --verbose, -v, flag boolean
    should we log a bunch of crap?
```

<br/>

## `🕷️ spider` — tiny watch routine multiplexer

**`spider --help`**

```
🕷️ spider ...commands
  tiny terminal multiplexer for watch routines

  ...commands,
    shell commands to multiplex

    for example,
      $ spider "npx tsc -w" "npx scute -w"

    here, you will get two panes,
    - press 1 to see the tsc output
    - press 2 to see the scute output
    - press [ or h to shimmy left
    - press ] or l to shimmy right
```

<br/>

## scute html templating

as a static-site-generator, scute provides an html templating language, for you to write web pages.

> [!IMPORTANT]  
> TODO this section

