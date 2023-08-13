import { InvalidPackageJsonError } from '@/utils/package-json'

export function getVersionInfo(version: string, outputPrefix: 'v' | '' | false) {
  const semverRegex = /^[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta)\.[0-9]+)?$/
  let inputPrefix: '' | 'v' = ''

  // If version starts with 'v', remove it.
  if (version.startsWith('v')) {
    inputPrefix = 'v'
    version = version.slice(1)
  }

  if (!semverRegex.test(version)) {
    throw new InvalidPackageJsonError(`Invalid semver: ${version}`)
  }

  const preReleaseRegex = /^[0-9]+\.[0-9]+\.[0-9]+-(alpha|beta)\.[0-9]+$/
  const isPreRelease = preReleaseRegex.test(version)

  const tokens = (isPreRelease ? version.split('-')[0] : version).split('.')
  const prefix: 'v' | '' = outputPrefix === false ? inputPrefix : outputPrefix
  const major = prefix + tokens[0]
  const minor = `${major}.${tokens[1]}`
  const patch = `${minor}.${tokens[2]}`
  version = prefix + version

  return {
    inputPrefix,
    isPreRelease,
    major,
    minor,
    patch,
    version
  }
}
