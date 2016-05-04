# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.2.0] - 2016-05-04
### Added
- Code coverage
- Possibility to require `json` files through config.
- Possibility to overwrite config according to the actual `NODE_ENV`.

### Changed
- *BREAKING*: Refactored everything to be TypeScript.
- Reloading and usage of config is now static on a class.

## [0.1.7] - 2016-01-14
### Added
- Possibility to parse empty or single element arrays from environmental variables.

## [0.1.6] - 2015-10-21
### Added
- Array parsing feature for environment variables.

### Changed
- Tests

### Removed
- `isStage` and `isProduction` since the environments aren't based on those variables. The only one you should use is `isDebug` as it is used by nodeJS itself (nodeJS determines production mode with `NODE_ENV === 'production'`).

## [0.1.5] - 2015-09-28
### Added
- Feature to redirect environment variables.



[Unreleased]: https://github.com/smartive/node-application-config/compare/v0.2.0...develop
[0.2.0]: https://github.com/smartive/node-application-config/compare/v0.1.7...v0.2.0
[0.1.7]: https://github.com/smartive/node-application-config/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/smartive/node-application-config/compare/v0.1.4...v0.1.6
[0.1.5]: https://github.com/smartive/node-application-config/tree/v0.1.4