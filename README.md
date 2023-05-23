# Version Action

GitHub action for determining project's version.

This action not only tells the project version, but also other information like author, license and description.

## Prerequisites

- The project must have a package.json at root directory.
- The project version is a semver.
- Only support alpha and beta for pre-release versions.

## Usage

```yml
jobs:
  build:
    name: Get version
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: wdzeng/version@v1
```

Note that it is user's responsibility to download repository or call `actions/checkout` workflow.

## Inputs

- `prefix`
  - `v`: add a `v` to version prefix if not present
  - empty string: if `v` is present then removes it
  - `false`: (default) remain unchanged fetched from package.json

## Outputs

- `major`: major version of project
- `minor`: minor version of project
- `patch`: patch version of project
- `version`: version of project
- `pre-release`: `true` if the version is a pre-release; else `false`
- `author`: project author; empty string if not stated in package.json
- `license`: project license; empty string if not stated in package.json
- `description`: project description; empty string if not stated in package.json

## Examples

If the version in package.json is `1.0.0` and input `prefix` is an empty string:

- `output.major`: `1`
- `output.minor`: `1.0`
- `output.patch`: `1.0.0`
- `output.version`: `1.0.0`
- `output.pre-release`: `false`

If the version in package.json is `1.0.0-alpha.1` and input `prefix` is an empty string:

- `output.major`: `1`
- `output.minor`: `1.0`
- `output.patch`: `1.0.0`
- `output.version`: `1.0.0-alpha.1`
- `output.pre-release`: `true`

If the `author` in package.json is `foo`:

```json
"author": "foo"
```

- `output.author`: `foo`

If the `author` in package.json is a dict:

```json
"author": {
  "name": "foo",
  "email": "foo@example.com",
  "url": "https://example.com/"
}
```

- `output.author`: `foo <foo@example.com> (https://example.com/)`
