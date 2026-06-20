import { readFileSync, writeFileSync } from 'node:fs'

const htmlPath = 'docs/index.html'
let html = readFileSync(htmlPath, 'utf-8')

// Remove type="module" and crossorigin, add defer for DOM readiness
html = html.replace(/<script type="module" crossorigin/g, '<script defer')

writeFileSync(htmlPath, html)
console.log('Fixed index.html: removed type="module", added defer')
