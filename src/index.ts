import * as core from '@actions/core'

import { loadPackageJson } from '@/utils/package-json'
import { getVersionInfo } from '@/utils/semver'

interface Output {
  'author': string
  'description': string
  'license': string
  'major': string
  'minor': string
  'patch': string
  'pre-release': 'true' | 'false'
  'version': string
}

function main(packageJsonPath: string, prefix: 'v' | '' | false): Output {
  const packageJson = loadPackageJson(packageJsonPath)

  let author = packageJson.author ?? ''
  if (typeof author === 'object') {
    let _author = author.name
    if (author.email) {
      _author += ` <${author.email}>`
    }
    if (author.url) {
      _author += ` (${author.url})`
    }
    author = _author
  }

  const description = packageJson.description ?? ''

  let license = packageJson.license ?? ''
  if (typeof license === 'object') {
    license = license.type
  }

  const version = getVersionInfo(packageJson.version, prefix)

  return {
    author,
    description,
    license,
    'major': version.major,
    'minor': version.minor,
    'patch': version.patch,
    'pre-release': version.isPreRelease ? 'true' : 'false',
    'version': version.version
  }
}

const inputPrefix = core.getInput('prefix') || false
if (inputPrefix != 'v' && inputPrefix != '' && inputPrefix !== false) {
  core.setFailed('Prefix must be on of "v", "false" or empty string')
  process.exit(1)
}

const output = main('package.json', inputPrefix)
for (const [key, value] of Object.entries(output)) {
  core.setOutput(key, value)
}
