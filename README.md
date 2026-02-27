
<div align="center"><img alt="" width="256" src="https://i.imgur.com/Gm7Bj6q.png"/></div>

# 🐢 scute
> *buildy bundly buddies for websites and web apps*

```sh
npm install --save-dev @e280/scute
```

**`@e280/scute` contains three lil buddies:**
- 🪄 [#ssg](#ssg) — html templating library for static site generation
- 🐢 [#scute](#scute) — eponymous zero-config build cli
- 🐙 [#octo](#octo) — watch routine terminal multiplexer cli



<br/></br>
<a id="ssg"></a>

## 🪄 ssg — html templating library
> *library for static site generation*
- `template` fn is for 
- `html` fn is for writing html, and interleaving it with async js
- `orb` does path/url magic and hash-version cache-busting

### example homepage
- scute will auto-build modules with `.html.ts` or `.html.js` extension and a template default export
- let's make your `index.html.ts`
    ```ts
    import {template, html, dataSvgEmoji, socialCard} from "@e280/scute"

    export default template(import.meta.url, async orb => html`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width,initial-scale=1"/>
          <meta name="darkreader-lock"/>
          <style>@layer base{html{background:#000}}</style>

          <link rel="stylesheet" href="${orb.hashurl("main.css")}"/>
          <script type="module" src="${orb.hashurl("main.bundle.min.js")}"></script>

          <link rel="icon" href="${dataSvgEmoji("🐢")}"/>
          ${socialCard({
            themeColor: "#8FCC8F",
            title: "scute",
            description: "buildy bundly buddies",
            siteName: "https://e280.org/",
            image: `https://e280.org/assets/e.png`,
          })}
        </head>
        <body>
          <h1>🐢 hello world</h1>
        </body>
      </html>
    `)
    ```
    > *did you notice the `orb`? we must'nt yet speak of the all-powerful orb..*

### html tagged template literals
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

### placing templates inside others
- `partial.ts` — stay organized by separating out partial snippets into their own files
    ```ts
    export const partial = template(import.meta.url, async orb => html`
      <div>
        <img alt="" src="${orb.url("../images/turtle.avif")}"/>
      </div>
    `)
    ```
    - *orb.url is relative to our module, `partial.ts`*
- `page.html.ts` — we use `orb.place(partial)` to insert one template into another
    ```ts
    import {partial} from "./partial.js"

    export default template(import.meta.url, async orb => html`
      <!doctype html>
      <html>
        <head><title>scute</title></head>
        <body>
          <h1>scute is good</h1>

          <!-- proper partial placement, maintains pathing -->
          ${orb.place(partial)}
        </body>
      </html>
    `)
    ```

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

### `exe` executable scripts
- your `.exe.ts` modules will be automatically executed, and they must provide a default exported exe fn like this:
    ```ts
    import {exe} from "@e280/scute"

    export default exe(import.meta.url, async orb => {
      await orb.io.write("blog.txt", "lol")
    })
    ```
- this gives you access to an orb, which is useful for resolving paths relative to this module.
- eg, imagine a script like `blog.exe.ts` where you read hundreds of markdown files and emit a webpage for each, or something like that.



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
        dirs to read from. comma separated.

      --out, default string x
        output dir

      --bundle, default boolean yes
        should we bundle .bundle.js files?

      --copy, default string-list **/*.{css,woff2,json,txt,xml,csv,wasm,webmanifest,
      png,svg,webp,avif,jpg,jpeg,ico,webm,ogg,mp4,m4a}
        what files should we copy verbatim? semicolon separated globs.

      --html, default boolean yes
        should we build .html.js templates?

      --exe, default boolean yes
        should we execute .exe.js scripts?

      --debounce, default number 100
        milliseconds to wait before watch routine build

      --exclude, optional string-list
        what files should we ignore? semicolon separated globs.

      --verbose, -v, flag boolean
        should we log a bunch of crap?
    ```
- by default we use `s/` and `x/`, instead of `src/` and `dist/`. it's our weird e280 tradition.
    if you wanna be a normie, do this:
    ```sh
    scute --in="src" --out="dist"
    ```



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

