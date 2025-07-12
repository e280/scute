
<div align="center"><img alt="" width="512" src="./assets/scute.avif"/></div>

<br/>

# scute — your lil buildy bundly buddy
- 🪄 `@e280/scute` is a library for html templating
- 🐢 `scute` cli is a zero-config static-site-generator
- 🐙 `octo` cli is a tiny terminal multiplexer for watch routines

### get scute
- install scute in your project
  ```sh
  npm install @e280/scute
  ```
- run scute help to learn about it
  ```sh
  npx scute --help
  ```
- run octo help to learn about it
  ```sh
  npx octo --help
  ```

<br/>

## tldr — setup your app
1. understand — these are not requirements — this is just the golden path we like for our stuff
1. setup your typescript app with your ts code in `s/` dir, and outputting to `x/` dir
1. install a server like `http-server` for previewing your app in development
1. setup a `tests.test.ts` test suite with [@e280/science](https://github.com/e280/science)
1. add these build and watch scripts to your npm package.json
    ```json
    "scripts": {
      "build": "rm -rf x && tsc && scute -v",
      "test": "node x/tests.test.js",
      "watch": "npm run build && octo 'scute -vw' 'tsc -w' 'node --watch x/tests.test.js' 'http-server x'"
    }
    ```
1. write `.html.ts` files with default exported templates
1. write `.bundle.ts` files and they'll be bundled automatically
1. files like `.css` and `.json` will be copied automatically
1. now it's official, you are a cool person
    - `npm run build` — run your project build
    - `npm run watch` — start a watch routine

<br/>

## 🪄 scute html templating

### tldr `s/index.html.ts`

`temple.page` is a boilerplate helper for whipping up webpages. it makes an <html> document.

```ts
import {temple, html} from "@e280/scute"

export default temple.page(import.meta.url, orb => ({
  title: "cool website",

  // optional
  css: "main.css", // css file injected as <style>
  dark: true, // disable darkreader

  // content for your <head>
  head: html`
    <script type="module" src="${orb.hashurl("main.bundle.js")}"></script>
  `,

  // opengraph social card (optional)
  socialCard: {
    themeColor: "#8FCC8F",
    title: "scute",
    description: "lil buildy bundly buddy",
    siteName: "https://e280.org/",
    image: `https://e280.org/assets/e.png`,
  },

  // content for your <body>
  body: html`
    <h1>incredi website</h1>
  `,
}))
```

> *did you notice the `orb`? we must'nt speak of the all-powerful orb, yet..*

### html
- import `html`
  ```ts
  import {html} from "@e280/scute"
  ```
- basic html usage
  ```ts
  html`<div>hello</div>`
  ```
- it turns an Html instance
  ```ts
  const h = html`<div>hello</div>`
  h.toString() // "<div>hello</div>"
  ```
- strings are safely sanitized
  ```ts
  html`<div>${"<evil/>"}</div>`.toString()
    // "<div>&lt;evil/&gt;</div>"
  ```
- `html.raw` to circumvent sanitization
  ```ts
  html`<div>${html.raw("<evil/>")}</div>`.toString()
    // "<div><evil/></div>"
  ```
- `html.render` is async and resolves promised inject values
  ```ts
  await html`<div>${Promise.resolve("async magic")}</div>`.render()
    // "<div>async magic</div>"
  ```
  the rendering is handled automatically by the scute cli

### html partials

`partial.ts`
```ts
import {html} from "@e280/scute"

export const partial = html.template(import.meta.url, async orb => html`
  <div>
    <img alt="" src="${orb.url("../images/turtle.avif")}"/>
  </div>
`)
```

> *omg, orb.url is relative to `partial.ts`?? this orb must contain unspeakable power..*

### html pages

scute automatically builds html pages with the `.html.ts` or `.html.js` extension, which must export a default `html.template`.

`page.html.ts`
```ts
import {html} from "@e280/scute"
import {partial} from "./partial.js"

export default html.template(import.meta.url, async orb => html`
  <!doctype html>
  <html>
    <head>
      <title>scute</title>
    </head>
    <body>
      <h1>scute is good</h1>
      ${orb.place(partial)}
    </body>
  </html>
`)
```

> *`orb.place` to insert one template into another, while maintaining relative pathing..*

### 🔮 the almighty orb

every template gets an `Orb` instance,
- the orb's superpower is dealing with paths and urls
- the orb allows you to reference files *relative to the current template module*,  
  regardless of how you import html partials from all around your codebase.  
  *this should impress you.*  

the orb has magic pathing conventions,
- 🧙‍♂️ ***important!*** all orb functions that expect path strings respect these conventions
- `"main.css"` — relative to the *current template module*
- `"./main.css"` — relative to the *current template module* (same as above)
- `"/main.css"` — relative to the *server root* (aka, your scute --out dir, maybe `x/`)
- `"$/main.css"` — relative to the build process *current working directory*

orb provides these pathing functions,
- `orb.url("main.css")`  
  this *outputs* a browser url relative to the *page* (not partial).  
  don't get confused here! the *input* is relative following the magic conventions. the *output* is page-relative.  
  eg, you can use these urls as `<script>` `src` and such.  
- `orb.path("main.css")`  
  this *outputs* a filesystem path relative to the *current working directory.*  
  eg, you can use these paths in node `readFile` calls and such.  
- `orb.hashurl("main.css")` — 🧙‍♂️ ***important!***  
  like `orb.url`, but it attaches a hash-version query param to the url.  
  looks like `main.css?v=cdd9738a8eda`.  
  this allows the browser to properly cache that exact version of the content.  
  anything using `orb.hashurl` will not have stale caching problems in your deployments.  
  yes, it's reading the target file on disk and producing a sha256 hash of it.  

orb also provides these fns,
- `orb.inject("main.css")`  
  read the contents of that file, and inject it raw without sanitization.  
  used to insert text directly, like <style>, <script>, json, stuff like that.  
- `orb.place(partial)`  
  prepare a partial template for insertion into this template, preserving relative pathing magic.  
- `orb.packageVersion()`  
  returns the `version` string found in your `package.json`.  

orb also provides a convenient `orb.io` facility,
- `orb.io.read("main.css")` — read a text file
- `orb.io.write("main.css", "* {}")` — write a text file
- `orb.io.readJson("$/package.json")` — read and parse a json file
- `orb.io.writeJson("$/package.json", {})` — write json to a file

<br/>

## 🐢 scute cli — builds your web app

**`scute --help`**

```
🐢 scute {params}
  lil buildy bundly buddy for your web projects
  - copies files like .css
  - bundles .bundle.js files with esbuild
  - builds .html.js template files

  --watch, -w, flag boolean
    watch mode

  --in, default string-list s
    dirs to read from

  --out, default string x
    output dir

  --copy, default string-list **/*.css,**/*.json,**/*.txt
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

> [!TIP]  
> the default follows our convention of using s/ and x/ instead of src/ and dist/,  
> but if you wanna be a normie, do this:  
> ```sh
> scute --in="src" --out="dist"
> ```

<br/>

## 🐙 octo cli — tiny watch routine multiplexer

**`octo --help`**

```
🐙 octo ...commands
  tiny terminal multiplexer for watch routines

  ...commands,
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
```

here's a typical watch routine with octo
```sh
octo \
  "scute --verbose --watch" \
  "tsc -w" \
  "node --watch x/tests.test.ts" \
  "http-server x"
```

