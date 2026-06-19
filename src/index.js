import { getInput, setOutput } from '@actions/core'

import {
  parseAuthor,
  parseDescription,
  parseLicense,
  parsePackageJson,
  parseVersion
} from './utils'

const packageJson = parsePackageJson()
const author = parseAuthor(packageJson.author)
const description = parseDescription(packageJson.description)
const license = parseLicense(packageJson.license)
const versionPrefix = getInput('prefix') || ''
const version = parseVersion(packageJson.version, versionPrefix)
setOutput('description', description)
setOutput('license', license)
setOutput('author', author)
setOutput('version', version.version)
setOutput('major', version.major)
setOutput('minor', version.minor)
setOutput('patch', version.patch)
setOutput('pre-release', version['pre-release'])
