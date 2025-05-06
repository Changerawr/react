# Contributing to @changerawr/react

Thank you for your interest in contributing to the Changerawr React SDK! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/changerawr/react.git
   cd react
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes
2. Run the linter to ensure code quality:
   ```bash
   npm run lint
   ```
3. Run tests to ensure your changes don't break existing functionality:
   ```bash
   npm test
   ```
4. Build the package to ensure it compiles correctly:
   ```bash
   npm run build
   ```
5. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add new feature xyz"
   ```

## Pull Request Process

1. Update the README.md or documentation with details of changes if appropriate
2. Ensure all tests pass and the build succeeds
3. Submit a pull request to the main repository

## Release Process

The release process is automated using GitHub Actions. Here's how to create a new release:

1. Update the version in `package.json` according to [Semantic Versioning](https://semver.org/):
    - `MAJOR` version for incompatible API changes
    - `MINOR` version for functionality added in a backward compatible manner
    - `PATCH` version for backward compatible bug fixes

2. Update the `CHANGELOG.md` file with the changes for the new version

3. Commit these changes:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to x.x.x"
   ```

4. Create a tag for the new version:
   ```bash
   git tag vx.x.x
   ```

5. Push the changes and the tag:
   ```bash
   git push origin main
   git push origin vx.x.x
   ```

6. The GitHub Actions workflow will automatically:
    - Build the package
    - Run tests
    - Update the version to match the tag
    - Publish to NPM and GitHub Packages
    - Create a GitHub Release

## Setting Up Secrets

For the automated release process to work, you need to set up the following secrets in your GitHub repository:

1. `NPM_TOKEN`: An NPM access token with publish permissions
    - Generate it from your NPM account settings
    - Add it to your repository's secrets in Settings > Secrets and variables > Actions

GitHub automatically provides the `GITHUB_TOKEN` secret, which is used for publishing to GitHub Packages and creating releases.

## Code Style

- Use TypeScript for all code
- Follow the existing code style and structure
- Write comprehensive JSDoc comments for all public APIs
- Include unit tests for all new functionality

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.