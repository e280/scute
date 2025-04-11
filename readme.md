
<div align="center"><img alt="" width="512" src="./assets/scute.avif"/></div>

<br/>

# 🐢 scute
- scute is a little zero-config static site generator
- scute does html templating and hash-based cache-management
- scute does all the bundley stuff using rollup

### install scute into your project
```sh
npm install @e280/scute

# in your terminal, run scute with npx
npx scute --help

# in your package scripts, run scute nakedly
scute --help
```

### typical way to run scute
```sh
scute --tsc --bundle --importmap --html --copy="*.css"
```
- defaults
- `--watch="no"` — is this a watch routine?
- `--in="src,dist"` — where to read input files
- `--out="dist"` — where to emit output files
- `--tsc="no"` — should we run tsc?
- `--bundle="no"` — should we bundle ".bundle.js" entrypoints?
- `--importmap="no"` — should we generate an importmap.json?
- `--html="no"` — should we build ".html.js" templates?
- `--copy=""` — should we copy over assets?
- `--exclude=""` — what files should we ignore?
- `--verbose="no"` — should we log a bunch of crap?

