# Version Action

GitHub action for determining project's version.

## Usage

```yml
jobs:
  build:
    name: Get version
    runs-on: ubuntu-latest
    steps:
      - uses: wdzeng/version@v1
```

## Inputs

- `pure`: whether the prefix `v` should be removed from outputs

## Outputs

- `major`: major version of project
- `minor`: minor version of project
- `version`: version of project
