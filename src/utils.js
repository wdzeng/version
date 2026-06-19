import fs from 'node:fs'

export function parsePackageJson() {
  let ret
  try {
    ret = JSON.parse(fs.readFileSync('package.json'))
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('package.json not found')
    }

    if (err instanceof SyntaxError) {
      throw new Error('Cannot parse package.json as JSON')
    }

    // unknown error
    throw new Error(`Error reading package.json: ${err.message}`)
  }

  if (ret === null || typeof ret !== 'object') {
    throw new TypeError('package.json must be an object')
  }

  return ret
}

export function parseAuthor(author) {
  if (!author) {
    return ''
  }

  if (typeof author === 'string') {
    return author
  }

  if (typeof author !== 'object') {
    throw new TypeError('Author must be a string or an object')
  }

  let ret = ''
  if (!author.name) {
    throw new Error('Author name not found in package.json')
  }

  if (typeof author.name !== 'string') {
    throw new TypeError('Author name must be a string')
  }
  ret += author.name

  if (author.email) {
    if (typeof author.email !== 'string') {
      throw new TypeError('Author email must be a string')
    }
    ret += ` <${author.email}>`
  }

  if (author.url) {
    if (typeof author.url !== 'string') {
      throw new TypeError('Author url must be a string')
    }
    ret += ` (${author.url})`
  }

  return ret
}

export function parseDescription(descriptionValue) {
  if (!descriptionValue) {
    return ''
  }

  if (typeof descriptionValue !== 'string') {
    throw new TypeError('Description must be a string')
  }

  return descriptionValue
}

export function parseLicense(license) {
  if (!license) {
    return ''
  }

  if (typeof license === 'string') {
    return license
  }

  if (typeof license !== 'object') {
    throw new TypeError('License must be a string or an object')
  }

  if (!license.type) {
    throw new Error('License type not found in package.json')
  }

  if (typeof license.type !== 'string') {
    throw new TypeError('License type must be a string')
  }

  return license.type
}

export function parseVersion(version, prefix) {
  if (prefix !== '' && prefix !== 'false' && prefix !== 'v') {
    throw new Error(
      `Prefix must be one of "v", "false" or empty string: ${prefix}`
    )
  }

  if (!version) {
    throw new Error('Version not found in package.json')
  }

  if (typeof version !== 'string') {
    throw new TypeError('Version must be a string')
  }

  if (prefix === 'false') {
    prefix = version.startsWith('v') ? 'v' : ''
  }
  if (version.startsWith('v')) {
    version = version.slice(1)
  }

  const semverRegex = /^\d+\.\d+\.\d+(-(alpha|beta)\.\d+)?$/
  if (!semverRegex.test(version)) {
    throw new Error(`Invalid semver: ${version}; should match ${semverRegex}`)
  }

  const preReleaseRegex = /^\d+\.\d+\.\d+-(alpha|beta)\.\d+$/
  const isPreRelease = preReleaseRegex.test(version)
  const tokens = (isPreRelease ? version.split('-')[0] : version).split('.')
  const major = tokens[0]
  const minor = tokens[1]
  const patch = tokens[2]

  return {
    major: `${prefix}${major}`,
    minor: `${prefix}${major}.${minor}`,
    patch: `${prefix}${major}.${minor}.${patch}`,
    version: `${prefix}${version}`,
    'pre-release': String(isPreRelease)
  }
}
