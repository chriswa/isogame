/*

Custom Node Module Resolver

Rationale:
  Support for ECMAScript Modules (ESM) is available with some caveats:
  - in some modern browsers with <script type="module">
  - in Node with `node --experimental-modules`, with file extensions of '.mjs'
  - in VSCode code intel, but only with file extensions of '.js' (or jsx, ts, tsx) (this is due to TypeScript, which provides VSCode's JS code intel)
  Node and VSCode have conflicting requirements.

  One simple solution is to force Node to interpret all '.js' files as ESM within a directory structure, while allowing (most/all) npm dependencies using default rules

  See https://nodejs.org/api/esm.html#esm_loader_hooks

*/

import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

const baseURL = new URL('file://')
baseURL.pathname = `${process.cwd()}/`

export async function resolve(specifier, parentModuleURL = baseURL, defaultResolver) {
  //console.log("*** mjs-loader.mjs: resolving - ", specifier, parentModuleURL)
  const parentFilename = parentModuleURL.toString().match(/[^\/]+$/)
  const importFilename = specifier.match(/[^\/]+$/)[0]

  console.log(chalk.grey(`(mjs-loader) ${parentFilename} imports "${importFilename}"`))

  const isESM = (specifier[0] === '.' || specifier[0] === '/') // naive?
  
  if (isESM) {
    const finalPath = (new URL(specifier, parentModuleURL).pathname).replace(/^\//, '')
    if (!fs.existsSync(finalPath)) {
      console.log(chalk.red(    `(mjs-loader) import failure!`))
      console.log(chalk.magenta(`               ${parentModuleURL.toString()}`))
      console.log(chalk.red(    `             attempted to import`))
      console.log(chalk.magenta(`               ${specifier}`))
      console.log(chalk.red(    `             which was not found at`))
      console.log(chalk.magenta(`               ${finalPath}`))
    }
    return {
      url: new URL(specifier, parentModuleURL).href,
      format: 'esm',
    }
  }
  else {
    return defaultResolver(specifier, parentModuleURL)
  }
}
