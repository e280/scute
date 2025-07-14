
![](https://i.imgur.com/baTzJDX.jpeg)

<br/>

# 🐢 scute

scute is little static site generator and build tool for websites and web apps.

```sh
npm install @e280/scute
```

### 🐢🐙🪄 three lil buildy bundly buddies

#### 🪄 `ssg` html templating
- `ssg` has some important top-level templating fns
- `html` for async templating, interleaving async js with your html
- `orb` does path/url magic and hash-version cache-busting

#### 🐢 `scute` cli is a zero-config static site generator
- `scute` command builds your project
- bundles your `.bundle.ts` modules, generating `.bundle.min.js` files
- copies files like `.css` and `.json` over to your out dir
- builds your `.html.ts` modules, generating `.html` files
- executes your `.exe.ts` modules, arbitrary build-time scripts

#### 🐙 `octo` cli is a tiny watch routine multiplexer
- `octo 'scute -wv' 'tsc -w'` command runs your watch routine
- each subcommand gets its own pane
- press `[` and `]` to shimmy between panes, q to quit

<br/>

## 🏃 tldr — setup your app
1. understand — these are not requirements — this is just the golden path we like for our stuff
1. setup your typescript app with your ts code in `s/` dir, and outputting to `x/` dir
1. install a server like `http-server` for previewing your app in development
1. setup a `tests.test.ts` test suite with [@e280/science](https://github.com/e280/science)
1. add these scripts to your npm package.json
    ```json
    "scripts": {
      "build": "rm -rf x && tsc && scute -v",
      "test": "node x/tests.test.js",
      "watch": "npm run build && octo 'scute -wv' 'tsc -w' 'node --watch x/tests.test.js' 'http-server x'"
    }
    ```
1. now it's official, you are a cool person
    - `npm run build` — run your project build
    - `npm run watch` — start a watch routine

<br/>

## 🪄 `ssg` and html templating

### quick homepage `index.html.ts`

`ssg.page` is a boilerplate helper for whipping up webpages. it makes an <html> document.

```ts
import {ssg, html} from "@e280/scute"

export default ssg.page(import.meta.url, async orb => ({
  title: "cool website",

  // optional
  js: "main.bundle.min.js", // js module entrypoint
  css: "main.css", // css file injected as <style>
  dark: true, // disable darkreader
  favicon: "/assets/favicon.png",

  // content for your <head>
  head: html`
    <meta name="example" value="whatever"/>
  `,

  // opengraph social card (optional)
  socialCard: {
    themeColor: "#8FCC8F",
    title: "scute",
    description: "buildy bundly buddies",
    siteName: "https://e280.org/",
    image: `https://e280.org/assets/e.png`,
  },

  // content for your <body>
  body: html`
    <h1>incredi website</h1>
  `,
}))
```

> *did you notice the `orb`? we must'nt yet speak of the all-powerful orb..*

> [!TIP]  
> scute doesn't care if you're using typescript or not.  
> if you have `index.html.ts`, scute actually operates on your emitted `index.html.js` file.  
> for this readme we'll refer to `.ts` source modules, but if you're using plain js, that's fine too.  


### html
- import `html`
  ```ts
  import {html} from "@e280/scute"
  ```
- basic usage
  ```ts
  html`<div>hello</div>`
  ```
- it returns an `Html` instance
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
import {ssg, html} from "@e280/scute"

export const partial = ssg.template(import.meta.url, async orb => html`
  <div>
    <img alt="" src="${orb.url("../images/turtle.avif")}"/>
  </div>
`)
```

> *omg, orb.url is relative to `partial.ts`? this orb must contain unspeakable power..*

### html pages

scute automatically builds html pages with the `.html.ts` or `.html.js` extension, which must export a default `html.template`.

`page.html.ts`
```ts
import {ssg, html} from "@e280/scute"
import {partial} from "./partial.js"

export default ssg.template(import.meta.url, async orb => html`
  <!doctype html>
  <html>
    <head>
      <title>scute</title>
      <script type="module" src="${orb.hashurl("main.bundle.min.js")}"></script>
    </head>
    <body>
      <h1>scute is good</h1>
      ${orb.place(partial)}
    </body>
  </html>
`)
```

> *`orb.place` to insert one template into another, while maintaining relative pathing..*

<br/>

### 🔮 the almighty orb

#### every template gets an orb
- the orb's superpower is dealing with paths and urls
- the orb allows you to reference files *relative to the current template module*,  
  regardless of how you import html partials from all around your codebase.  
  *this should impress you.*  

#### orb's magic pathing conventions
- 🧙‍♂️ ***important!*** all orb functions that expect path strings respect these conventions
- `"main.css"` — relative to the *current template module*
- `"./main.css"` — relative to the *current template module* (same as above)
- `"/main.css"` — relative to the *server root* (aka, your scute --out dir, maybe `x/`)
- `"$/main.css"` — relative to the build process *current working directory*

#### orb pathing functions
- **`orb.url("main.css")`**  
  this *outputs* a browser url relative to the *page* (not partial).  
  don't get confused here! the *input* is relative following the magic conventions. the *output* is page-relative.  
  eg, you can use these urls as `<script>` `src` and such.  
- **`orb.path("main.css")`**  
  this *outputs* a filesystem path relative to the *current working directory.*  
  eg, you can use these paths in node `readFile` calls and such.  
- **`orb.hashurl("main.css")` — 🧙‍♂️ ***important!*****  
  like `orb.url`, but it attaches a hash-version query param to the url.  
  looks like `main.css?v=cdd9738a8eda`.  
  this allows the browser to properly cache that exact version of the content.  
  anything using `orb.hashurl` will not have stale caching problems in your deployments.  
  yes, it's reading the target file on disk and producing a sha256 hash of it.  

#### more orb fns
- **`orb.place(partial)`**  
  prepare a partial template for insertion into this template, preserving relative pathing magic.  
- **`orb.inject("main.css")`**  
  read the contents of that file, and inject it raw without sanitization.  
  used to insert text directly, like <style>, <script>, json, stuff like that.  
- **`orb.packageVersion()`**  
  returns the `version` string found in your `package.json`.  

#### orb.io file operations
- **`orb.io.read("main.css")`** — read a text file
- **`orb.io.write("main.css", "* {}")`** — write a text file
- **`orb.io.readJson("$/package.json")`** — read and parse a json file
- **`orb.io.writeJson("$/package.json", {})`** — write json to a file

<br/>

### `ssg.exe` executable scripts

your `.exe.ts` modules will be automatically executed, and they must provide a default exported exe fn like this:
```ts
import {ssg} from "@e280/scute"

export default ssg.exe(import.meta.url, async orb => {
  await orb.io.write("blog.txt", "lol")
})
```

this gives you access to an orb, which is useful for resolving paths relative to this module.

like, imagine a script like `blog.exe.ts` where you read hundreds of markdown files and emit a webpage for each, or anything like that.

<br/>

## 🐢 scute cli — zero-config static site generator

**`scute --help`**

```
🐢 scute {params}
  readme https://github.com/e280/scute
  zero-config static site generator
  - bundles .bundle.js files with esbuild
  - copies files like .css and .json
  - builds .html.js template files
  - executes .exe.js scripts

  --watch, -w, flag boolean
    watch mode

  --in, default string-list s
    dirs to read from

  --out, default string x
    output dir

  --bundle, default boolean yes
    should we bundle .bundle.js files?

  --copy, default string-list **/*.css,**/*.json,**/*.txt
    what files should we copy verbatim?

  --html, default boolean yes
    should we build .html.js templates?

  --exe, default boolean yes
    should we execute .exe.js scripts?

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
      $ octo "scute -wv" "tsc -w"

    this will give you two panes,
      - press 1 to see the scute output
      - press 2 to see the tsc output
      - press [ or h or j to shimmy left
      - press ] or l or k to shimmy right
      - press backspace to clear the pane
      - press q or ctrl+c to quit

    local npm bin is available,
      $ scute -wv      # GOOD this works
      $ npx scute -wv  # BAD npx is unnecessary
```

here's a typical 4-pane watch routine with octo
```sh
octo \
  "scute --verbose --watch" \
  "tsc -w" \
  "node --watch x/tests.test.ts" \
  "http-server x"
```

