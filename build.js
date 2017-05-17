#!/usr/bin/env node
'use strict'

const fs = require('fs')
const config = require('./build-config')

const browsers = ['chrome', 'opera', 'firefox', 'edge']
const distDir = './dist'
// no need to get into cleanup business
fs.existsSync(distDir) || fs.mkdirSync(distDir)

// decide what all to build
const toBuild = process.argv.slice(2)
let buildTargets = []
if (toBuild.length === 0 || (toBuild.length === 1 && toBuild[0] === 'all')) {
  buildTargets = browsers
} else {
  buildTargets = toBuild
}

// write required files in browser dist directory
const manifests = config['manifest']
let manifest = {}
buildTargets.forEach((browser) => {
  if (!browsers.includes(browser)) {
    console.error(`${browser} browser not supported yet`)
    return // this is for next in forEach loop
  }

  manifest = Object.assign({}, manifests['common'], (manifests[browser] || {}))
  if (browser === 'edge') {
    // Edge doesn't like 'run-at' yet
    manifest['content_scripts'].forEach((cs) => { delete cs['run-at'] })
  }

  const browserDistDir = `${distDir}/${browser}`
  fs.existsSync(browserDistDir) || fs.mkdirSync(browserDistDir)
  fs.writeFileSync(`${browserDistDir}/manifest.json`, JSON.stringify(manifest, null, 2))

  // copy required files
  const includeFiles = (config['include_files'][browser] || []).concat(config['include_files']['common'])
  includeFiles.forEach((f) => {
    fs.createReadStream(f).pipe(fs.createWriteStream(`${browserDistDir}/${f}`))
  })
})
