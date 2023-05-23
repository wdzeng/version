import fs from 'node:fs'

import core from '@actions/core'

function getPackageJson() {
  try {
    return JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } catch (err: unknown) {
    console.trace(err)
    core.setFailed('Error reading package.json')
    process.exit()
  }
}

function isValidSemver(version: string): boolean {
  const semverRegex: RegExp =
    /^[0-9]+\.[0-9]+\.[0-9]+(\-(alpha|beta)\.[0-9]+)?$/
  return semverRegex.test(version)
}

function getVersions(version: string) {
  const preReleaseRegex: RegExp =
    /^[0-9]+\.[0-9]+\.[0-9]+\-(alpha|beta)\.[0-9]+$/
  const isPreRelease = preReleaseRegex.test(version)
  const tokens = (isPreRelease ? version.split['-'][0] : version).split('.')
  const major: string = tokens[0]
  const minor: string = tokens[1]
  const patch: string = tokens[2]
  return {
    major,
    minor: `${major}.${minor}`,
    patch: `${major}.${minor}.${patch}`,
    version,
    isPreRelease
  }
}

let outputPrefix = core.getInput('prefix') || 'false'
if (outputPrefix != 'v' && outputPrefix != '' && outputPrefix != 'false') {
  core.setFailed('Prefix must be on of "v", "false" or empty string')
  process.exit()
}

const packageJson = getPackageJson()

let version: string | undefined = packageJson.version
if (!version) {
  core.setFailed('Version not found')
  process.exit()
}
let versionPrefix = ''
if (version.startsWith('v')) {
  version = version.slice(1)
  versionPrefix = 'v'
}
if (!isValidSemver(version)) {
  core.setFailed('Invalid semver: ' + version)
  process.exit()
}

let author: any = packageJson.author || ''
if (typeof author === 'object') {
  if (!author.name) {
    core.setFailed('Author name not found')
    process.exit()
  }
  let _author = author.name
  if (author.email) {
    _author += ` <${author.email}>`
  }
  if (author.url) {
    _author += ` (${author.url})`
  }
  author = _author
}
if (typeof author !== 'string') {
  core.setFailed('Author must be a string')
  process.exit()
}

const description = packageJson.description || ''
if (typeof description !== 'string') {
  core.setFailed('Description must be a string')
  process.exit()
}

let license: any = packageJson.license || ''
if (typeof license === 'object') {
  if (!license.type) {
    core.setFailed('License type not found')
    process.exit()
  }
  license = license.type
}
if (typeof license !== 'string') {
  core.setFailed('License must be a string')
  process.exit()
}

outputPrefix = outputPrefix === 'false' ? versionPrefix : outputPrefix
core.setOutput('description', description)
core.setOutput('license', license)
core.setOutput('author', author)

const outputVersion = getVersions(version)
core.setOutput('major', outputPrefix + outputVersion.major)
core.setOutput('minor', outputPrefix + outputVersion.minor)
core.setOutput('patch', outputPrefix + outputVersion.patch)
core.setOutput('version', outputPrefix + outputVersion.version)
core.setOutput('pre-release', outputVersion.isPreRelease ? 'true' : 'false')
