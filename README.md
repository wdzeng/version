# Version Action

GitHub action for determining project's version.

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

Note that it is user's responsibility to download repository or call actions/checkout workflow.

## Inputs

- `prefix`
  - `v`: add a `v` to version prefix if not present
  - empty string: if `v` is present then removes it
  - `false`: remain unchanged fetched from package.json

## Outputs

- `major`: major version of project
- `minor`: minor version of project
- `patch`: patch version of project
- `version`: version of project
- `pre-release`: whether the version is a pre-release
