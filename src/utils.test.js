import { fs, vol } from 'memfs'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  parseAuthor,
  parseDescription,
  parseLicense,
  parsePackageJson,
  parseVersion
} from './utils'

vi.mock('node:fs', () => ({ ...fs, default: fs }))

describe('parsePackageJson', () => {
  beforeEach(() => {
    vol.reset()
  })

  test('happy path', () => {
    vol.fromJSON({ 'package.json': JSON.stringify({ name: 'test-package' }) })

    expect(parsePackageJson('package.json')).toEqual({ name: 'test-package' })
  })

  test('throws error when package.json not found', () => {
    expect(() => parsePackageJson('package.json')).toThrow(
      'package.json not found'
    )
  })

  test('throws error when package.json is not valid JSON', () => {
    vol.fromJSON({ 'package.json': 'invalid json' })

    expect(() => parsePackageJson('package.json')).toThrow(
      'Cannot parse package.json as JSON'
    )
  })

  test('throws error when package.json is not an object', () => {
    vol.fromJSON({ 'package.json': 'null' })

    expect(() => parsePackageJson('package.json')).toThrow()
  })
})

describe('parseAuthor', () => {
  test('returns empty string when author is not provided', () => {
    expect(parseAuthor(undefined)).toBe('')
  })

  test('returns author string when author is a string', () => {
    expect(parseAuthor('John Doe')).toBe('John Doe')
  })

  test('returns author string when author is an object', () => {
    const inputs = [
      {
        author: { name: 'John Doe' },
        expected: 'John Doe'
      },
      {
        author: { name: 'John Doe', email: 'me@johndoe.me' },
        expected: 'John Doe <me@johndoe.me>'
      },
      {
        author: { name: 'John Doe', url: 'https://johndoe.me' },
        expected: 'John Doe (https://johndoe.me)'
      },
      {
        author: {
          name: 'John Doe',
          email: 'me@johndoe.me',
          url: 'https://johndoe.me'
        },
        expected: 'John Doe <me@johndoe.me> (https://johndoe.me)'
      }
    ]

    for (const { author, expected } of inputs) {
      expect(parseAuthor(author)).toBe(expected)
    }
  })

  test('throws error when author is an object without name', () => {
    expect(() => parseAuthor({ email: 'me@johndoe.me' })).toThrow()
  })

  test('throws error when author is an object with non-string name', () => {
    expect(() => parseAuthor({ name: 123 })).toThrow()
  })

  test('throws error when author is an object with non-string email', () => {
    expect(() => parseAuthor({ name: 'John Doe', email: 123 })).toThrow()
  })

  test('throws error when author is an object with non-string url', () => {
    expect(() => parseAuthor({ name: 'John Doe', url: 123 })).toThrow()
  })

  test('throws error when author is not a string or an object', () => {
    expect(() => parseAuthor(123)).toThrow()
  })
})

describe('parseDescription', () => {
  test('returns empty string when description is not provided', () => {
    expect(parseDescription(undefined)).toBe('')
  })

  test('returns description string when description is a string', () => {
    expect(parseDescription('This is a test package')).toBe(
      'This is a test package'
    )
  })

  test('throws error when description is not a string', () => {
    expect(() => parseDescription(123)).toThrow()
  })
})

describe('parseLicense', () => {
  test('returns empty string when license is not provided', () => {
    expect(parseLicense(undefined)).toBe('')
  })

  test('returns license string when license is a string', () => {
    expect(parseLicense('MIT')).toBe('MIT')
  })

  test('return license string when license is an object with type', () => {
    expect(parseLicense({ type: 'MIT' })).toBe('MIT')
  })

  test('throws error when license is not a string or an object', () => {
    expect(() => parseLicense(123)).toThrow()
  })

  test('throws error when license is an object without type', () => {
    expect(() => parseLicense({})).toThrow()
  })

  test('throws error when license is an object with non-string type', () => {
    expect(() => parseLicense({ type: 123 })).toThrow()
  })
})

describe('parseVersion', () => {
  describe('happy path', () => {
    function getResult(version, prefix) {
      const dashIndex = version.indexOf('-')
      const isPreRelease = dashIndex !== -1
      const versionWithoutPreRelease = isPreRelease
        ? version.slice(0, dashIndex)
        : version
      const [major, minor, patch] = versionWithoutPreRelease.split('.')
      return {
        version: `${prefix}${version}`,
        major: `${prefix}${major}`,
        minor: `${prefix}${major}.${minor}`,
        patch: `${prefix}${major}.${minor}.${patch}`,
        'pre-release': String(isPreRelease)
      }
    }

    const inputs = ['1.2.3', '1.2.3-alpha.0', '1.2.3-beta.0'].flatMap(v => [
      [v, '', getResult(v, '')],
      [v, 'v', getResult(v, 'v')],
      [v, 'false', getResult(v, '')],
      [`v${v}`, '', getResult(v, '')],
      [`v${v}`, 'v', getResult(v, 'v')],
      [`v${v}`, 'false', getResult(v, 'v')]
    ])

    test.for(inputs)(
      "parseVersion('%s', '%s')",
      ([version, prefix, expected]) => {
        expect(parseVersion(version, prefix)).toEqual(expected)
      }
    )
  })

  test('throws error when version is not provided', () => {
    expect(() => parseVersion(undefined, '')).toThrow()
    expect(() => parseVersion(undefined, 'v')).toThrow()
    expect(() => parseVersion(undefined, 'false')).toThrow()
  })

  test('throws error when version is not a string', () => {
    expect(() => parseVersion(123, '')).toThrow()
    expect(() => parseVersion(123, 'v')).toThrow()
    expect(() => parseVersion(123, 'false')).toThrow()
  })

  describe('throws error when version is not a valid semver', () => {
    const inputs = [
      '1',
      '1.2',
      '1.2.3.4',
      '1.2.3-alpha',
      '1.2.3-beta',
      '1.2.3.alpha.0',
      '1.2.3.beta.0',
      '1.2.3-rc.0'
    ]

    test.for(inputs)("parseVersion('[v]%s') throws error", ([version]) => {
      expect(() => parseVersion(version, '')).toThrow()
      expect(() => parseVersion(version, 'v')).toThrow()
      expect(() => parseVersion(version, 'false')).toThrow()
      expect(() => parseVersion(`v${version}`, '')).toThrow()
      expect(() => parseVersion(`v${version}`, 'v')).toThrow()
      expect(() => parseVersion(`v${version}`, 'false')).toThrow()
    })
  })
})
