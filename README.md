# Version Action

GitHub action for getting project's version.

This action not only tells the project version, but also other information like author, license and
description. These information are fetched from the package.json file.

## Prerequisites

The project must have a package.json at the root directory. The package.json file must be an object
which satisfies the following interface, as documented in the
[doc](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#license):

```ts
interface PackageJson {
  version: string
  author?: string | { name: string; email?: string; url?: string }
  description?: string
  license?: string
}
```

The `version` field in package.json must be a [semver](https://semver.org/), with an optional prefix
`v`.

For pre-releases, only alpha and beta are allowed. The version format must be `X.X.X-alpha|beta.X`,
where each `X` is a number.

## Usage

```yml
jobs:
  build:
    name: Get version
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: wdzeng/version@v1
        with:
          prefix: ''
          push: 'false'
```

Note that it is user's responsibility to download repository or call `actions/checkout` workflow.

## Inputs

All inputs are optional.

- `prefix`: the prefix to be prepended (could be an empty string); a special value `false` indicates
  using the prefix in `version` field in package.json.
- `push`: whether to push tags the remote; tag names are decided by the version outputs; must be one
  of the following options.
  - `false` (default): don't push any tag.
  - `one`: only push the version tag.
  - `all`: for pre-releases, the effect is same as `one`; for production releases, also
    force push major and minor tags.
- `push-target`: the target (branch name or commit hash) to set tag(s); no effect when `push` is
  `false`; default to [`$GITHUB_REF`](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).

## Outputs

- `major`: major version of project
- `minor`: minor version of project
- `patch`: patch version of project
- `version`: version of project
- `pre-release`: `true` if the version is a pre-release; else `false`
- `author`: project author; empty string if not stated in package.json
- `description`: project description; empty string if not stated in package.json
- `license`: project license; empty string if not stated in package.json

### Version Output Examples

If the `version` field in package.json is `1.0.0` (or `v1.0.0`) and input `prefix` is an empty
string:

- `output.major`: `1`
- `output.minor`: `1.0`
- `output.patch`: `1.0.0`
- `output.version`: `1.0.0`
- `output.pre-release`: `false`

If the `version` field in package.json is `1.0.0`/`v1.0.0` and input `prefix` is `false`:

- `output.major`: `1`/`v1`
- `output.minor`: `1.0`/`v1.0`
- `output.patch`: `1.0.0`/`v1.0.0`
- `output.version`: `1.0.0`/`v1.0.0`
- `output.pre-release`: `false`/`false`

If the `version` field in package.json is `1.0.0-alpha.1` (or `v1.0.0-alpha.1`) and input `prefix`
is `v`:

- `output.major`: `v1`
- `output.minor`: `v1.0`
- `output.patch`: `v1.0.0`
- `output.version`: `v1.0.0-alpha.1`
- `output.pre-release`: `true`

### Author Output Examples

If the `author` field in package.json is `foo`:

- `output.author`: `foo`

If the `author` field in package.json is an object:

```json
{
  "author": {
    "name": "foo",
    "email": "foo@example.com",
    "url": "https://example.com/"
  }
}
```

- `output.author`: `foo <foo@example.com> (https://example.com/)`

## Push Behavior

The action force pushes major tag, minor tag, and `latest`/`edge` tag. The action does not force
push version tag, so it is user's responsibility to ensure such tag does not exist.

Assume the `version` output is `1.0.0`:

- If `push` is `one` and `push-target` is `release`, the action sets and pushes tag `1.0.0` (not
  force) at the last commit on `release` branch.
- If `push` is `all`, `push-target` is unset (an empty string), and the action is triggered by the
  `push` event on `main` branch, the action sets and pushes tags `1` (force), `1.0` (force) and
  `1.0.0` (not force) to the latest commit at `main` branch.

Assume the `version` output is `v1.0.0-alpha.0`:

- If `push` is `one` and `push-target` is `release`, the action sets and pushes tag `v1.0.0-alpha.0`
  (not force) at the last commit on `release` branch.
- If `push` is `all`, `push-target` is unset (an empty string), and the action is triggered by the
  `push` event on `main` branch, the action sets and pushes tag `v1.0.0-alpha.0` (not force) to the
  latest commit at `main` branch.
