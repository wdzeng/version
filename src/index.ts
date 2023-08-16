import * as core from '@actions/core'

import { pushTags, setTag } from '@/utils/git'
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

function getOutput(packageJsonPath: string, prefix: string | false): Output {
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

function push(tags: 'one' | 'all', target: string, output: Output): void {
  setTag(output.version, target, false)
  if (tags === 'all' && output['pre-release'] === 'false') {
    setTag(output.major, target, true)
    setTag(output.minor, target, true)
  }
  pushTags([output.version], false)
  if (tags === 'all' && output['pre-release'] === 'false') {
    pushTags([output.major, output.minor], true)
  }
}

function main(): void {
  // Do output.
  const inputPrefix = core.getInput('prefix')
  const prefix: string | false = inputPrefix === 'false' ? false : inputPrefix
  const output = getOutput('package.json', prefix)
  for (const [key, value] of Object.entries(output)) {
    core.setOutput(key, value)
  }

  // Do push.
  const inputPush = core.getInput('push')
  if (inputPush !== 'false' && inputPush !== 'one' && inputPush !== 'all') {
    core.setFailed(`Input "push" must be one of "false", "one" or "all"; got ${inputPush}.`)
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const inputPushTarget = core.getInput('push-target') || process.env.GITHUB_REF!
  inputPush !== 'false' && push(inputPush, inputPushTarget, output)
}

main()
