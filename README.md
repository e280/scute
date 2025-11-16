
<div align="center"><img alt="" width="256" src="https://i.imgur.com/Gm7Bj6q.png"/></div>

# 🐢 scute
> *buildy bundly buddies for websites and web apps*

```sh
npm install --save-dev @e280/scute
```

**`@e280/scute` contains three lil buddies:**
- 🐢 [#scute](#scute) — eponymous zero-config build cli
- 🪄 [#ssg](#ssg) — html templating library for static site generation
- 🐙 [#octo](#octo) — watch routine terminal multiplexer cli



<br/></br>

### 👷 project setup
> *"the golden path."*  
> *just an example of how we like to setup our projects*  
1. we setup our typescript apps with ts code in `s/` dir, and outputting to `x/` dir
1. we install a server like `http-server` for previewing our app in development
1. we setup a `tests.test.ts` test suite with [@e280/science](https://github.com/e280/science)
1. we add these scripts to package.json
    ```json
    "scripts": {
      "build": "rm -rf x && tsc && scute -v",
      "test": "node x/tests.test.js",
      "watch": "npm run build && octo 'scute -vw' 'tsc -w' 'node --watch x/tests.test.js' 'http-server x'"
    }
    ```
1. now we can run these commands
    - `npm run build` — run your project build
    - `npm run watch` — start a watch routine
    - `npm run test` — run our test suite



<br/></br>
<a id="scute"></a>

## 🐢 scute cli
> *zero-config build tool and static site generator*
- `scute` command builds your project
- `scute -v` for verbose mode so you can see what's up
- `scute -vw` for watch mode
- `scute --help`
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

      --debounce, default number 100
        milliseconds to wait before watch routine build

      --exclude, optional string-list
        what files should we ignore?

      --verbose, -v, flag boolean
        should we log a bunch of crap?
    ```
- by default we use `s/` and `x/`, instead of `src/` and `dist/`. it's our weird e280 tradition.
    if you wanna be a normie, do this:
    ```sh
    scute --in="src" --out="dist"
    ```



<br/></br>
<a id="ssg"></a>

## 🪄 `ssg` html templating library
> *library for static site generation*
```ts
import {ssg, html} from "@e280/scute"
```
- `ssg` is a toolkit for templating and paths and stuff
- `html` is for writing html, and interleaving it with async js
- `orb` does path/url magic and hash-version cache-busting

### `ssg.page` quickstart homepage
- make a web page. it makes an <html> document. let's make `index.html.ts`
    ```ts
    export default ssg.page(import.meta.url, async orb => ({
      title: "cool website",
      js: "main.bundle.min.js",
      css: "main.css",
      dark: true,
      favicon: "/assets/favicon.png",

      head: html`
        <meta name="example" value="whatever"/>
      `,

      socialCard: {
        themeColor: "#8FCC8F",
        title: "scute",
        description: "buildy bundly buddies",
        siteName: "https://e280.org/",
        image: `https://e280.org/assets/e.png`,
      },

      body: html`
        <h1>incredi website</h1>
      `,
    }))
    ```
    > *did you notice the `orb`? we must'nt yet speak of the all-powerful orb..*
- `ssg.page` is just sugar which produces an ordinary `TemplateFn`

### `html` templating
- html templating fns, with protection against injection attacks
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
- `html.raw` to circumvent sanitization *(🚨 allowing injection attacks, lol)*
  ```ts
  html`<div>${html.raw("<evil/>")}</div>`.toString()
    // "<div><evil/></div>"
  ```
- `html.render` produces a string. it's async and resolves injected promises
  ```ts
  await html`<div>${Promise.resolve("async magic")}</div>`.render()
    // "<div>async magic</div>"
  ```
  the rendering is handled automatically by the scute cli

### `ssg.template` pages
- `ssg.template` produces a `TemplateFn`.  
    if it's the default export, and your module has a `.html.ts` or `.html.js` extension, the scute build cli will automatically build the `.html` page.
- `page.html.ts`
    ```ts
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

### `ssg.template` partials
- we can inject one ssg template into another. let's make `partial.ts`
    ```ts
    export const partial = ssg.template(import.meta.url, async orb => html`
      <div>
        <img alt="" src="${orb.url("../images/turtle.avif")}"/>
      </div>
    `)
    ```
    - *orb.url is relative to our module, `partial.ts`*

### 🔮 the almighty orb
> *relative paths and urls*

#### every template gets an orb
- the orb's superpower is dealing with paths and urls
- the orb allows you to reference files *relative to the current template module*,  
  regardless of how you import html partials from all around your codebase.  
  *this should impress you.*  

#### orb pathing fns
- **`orb.url("main.css")`** — 🧙‍♂️ ***important!*** *for clientside browser urls!*  
  this *outputs* a browser url relative to the *page* (not partial).  
  don't get confused here! the *input* is relative following the magic conventions. the *output* is page-relative.  
  eg, you can use these urls as `<script>` `src` and such.  
- **`orb.path("main.css")`** — 🧙‍♂️ ***important!*** *for serverside filesystem paths!*  
  this *outputs* a filesystem path relative to the *current working directory.*  
  eg, you can use these paths in node `readFile` calls and such.  
- **`orb.hashurl("main.css")`** — 🧙‍♂️ ***important!*** *saves you from browser cache problems!*  
  like `orb.url`, but it attaches a hash-version query param to the url.  
  looks like `main.css?v=cdd9738a8eda`.  
  this allows the browser to properly cache that exact version of the content.  
  anything using `orb.hashurl` will not have stale caching problems in your deployments.  
  yes, it's reading the target file on disk and producing a sha256 hash of it.  

#### orb's magic pathing conventions
- 🧙‍♂️ ***important!*** all orb functions that expect path strings respect these conventions
- `"main.css"` — relative to the *current template module*
- `"./main.css"` — relative to the *current template module* (same as above)
- `"/main.css"` — relative to the *server root* (aka, your scute --out dir, maybe `x/`)
- `"$/main.css"` — relative to the build process *current working directory*

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

### `ssg.exe` executable scripts
- your `.exe.ts` modules will be automatically executed, and they must provide a default exported exe fn like this:
    ```ts
    export default ssg.exe(import.meta.url, async orb => {
      await orb.io.write("blog.txt", "lol")
    })
    ```
- this gives you access to an orb, which is useful for resolving paths relative to this module.
- eg, imagine a script like `blog.exe.ts` where you read hundreds of markdown files and emit a webpage for each, or something like that.



<br/></br>
<a id="octo"></a>

## 🐙 octo cli
> *tiny watch routine terminal multiplexer*
- `octo 'scute -vw' 'tsc -w'` command runs your watch routine
- each subcommand gets its own pane
- press `[` and `]` to shimmy between panes, q to quit
- **`octo --help`**
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
- here's a typical 4-pane watch routine with octo
    ```sh
    octo \
      "scute --verbose --watch" \
      "tsc -w" \
      "node --watch x/tests.test.ts" \
      "http-server x"
    ```



<br/><br/>
<a id="e280"></a>

## 🧑‍💻 scute is by e280
reward us with github stars  
build with us at https://e280.org/ but only if you're cool  

<br/><br/>

