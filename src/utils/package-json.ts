import fs from 'node:fs'

import { CustomError } from 'ts-custom-error'

export class InvalidPackageJsonError extends CustomError {}

type JsonObject = Record<string, unknown>

function isJsonObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object'
}

function requirePackageJsonFieldIsStringType(packageJson: Record<string, unknown>, field: string) {
  if (field in packageJson && typeof packageJson[field] !== 'string') {
    throw new InvalidPackageJsonError(`Field "${field}" must be a string.`)
  }
}

export interface PackageJson {
  author?: string | { name: string; email?: string; url?: string }
  description?: string
  license?: string | { type: string }
  version: string
}

export function loadPackageJson(packageJsonPath: string): PackageJson {
  // @ts-expect-error: JSON.parse accepts buffer type.
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath)) as unknown

  if (!isJsonObject(packageJson)) {
    throw new InvalidPackageJsonError('File package.json must be an object.')
  }

  // Validate author field.
  if ('author' in packageJson) {
    if (isJsonObject(packageJson.author)) {
      const author = packageJson.author
      if (!('name' in author)) {
        throw new InvalidPackageJsonError('Field "author" or "author.name" must be a string.')
      }
      if (typeof author.name !== 'string') {
        throw new InvalidPackageJsonError('Field "author.name" must be a string.')
      }
      if (author.email && typeof author.email !== 'string') {
        throw new InvalidPackageJsonError('Field "author.email" must be a string.')
      }
      if (author.url && typeof author.url !== 'string') {
        throw new InvalidPackageJsonError('Field "author.url" must be a string.')
      }
    } else if (typeof packageJson.author !== 'string') {
      throw new InvalidPackageJsonError('Field "author" or "author.name" must be a string.')
    }
  }

  // Validate description and license fields.
  requirePackageJsonFieldIsStringType(packageJson, 'license')
  requirePackageJsonFieldIsStringType(packageJson, 'description')

  // Validate version field.
  if (!('version' in packageJson)) {
    throw new InvalidPackageJsonError('Field "version" is required in package.json.')
  }
  requirePackageJsonFieldIsStringType(packageJson, 'version')

  // @ts-expect-error: type is checked.
  return packageJson as PackageJson
}
