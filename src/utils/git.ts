import { execSync } from 'node:child_process'

export function setTag(tagName: string, target: string, force: boolean): void {
  const command = `git tag ${force ? '-f ' : ''}${tagName} ${target}`
  execSync(command)
}

export function pushTags(tagNames: string[], force: boolean): void {
  const command = `git push ${force ? '-f ' : ''}origin ${tagNames.join(' ')}`
  execSync(command)
}
