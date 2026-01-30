# AGENTS

This repository is currently empty (no files detected in `/home/mdanshin/src/gems`).
Treat all commands below as conditional templates until real build files exist.

## Cursor and Copilot rules
- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.
- If those files are added later, summarize them here and follow them.

## How to discover build/lint/test commands
- Look for `README*`, `Makefile`, `justfile`, or `Taskfile.yml` first.
- Detect language/tooling via top-level files (examples below).
- Prefer repo-provided scripts over guesses.
- Update this file with exact commands once known.

### Common build files to check
- Node: `package.json`, `pnpm-lock.yaml`, `yarn.lock`.
- Python: `pyproject.toml`, `setup.cfg`, `requirements.txt`.
- Go: `go.mod`.
- Rust: `Cargo.toml`.
- Java: `pom.xml`, `build.gradle`, `build.gradle.kts`.
- .NET: `*.sln`, `*.csproj`.
- Ruby: `Gemfile`.
- PHP: `composer.json`.

## Build commands (fill in once detected)
- Node: `npm run build` or `pnpm build` (use script names in `package.json`).
- Python: `python -m build` or `python -m pip install -e .` for editable.
- Go: `go build ./...`.
- Rust: `cargo build`.
- Java: `mvn -q -DskipTests package` or `./gradlew build`.
- .NET: `dotnet build`.
- Ruby: `bundle exec rake build`.
- PHP: `composer install` (build step varies).

## Lint/format commands (fill in once detected)
- Node: `npm run lint`, `npm run format`, or `pnpm lint`.
- Python: `ruff check .`, `ruff format .`, `black .`, `flake8`.
- Go: `golangci-lint run` or `go vet ./...`.
- Rust: `cargo fmt --check`, `cargo clippy -- -D warnings`.
- Java: `./gradlew check` or `mvn -q -DskipTests checkstyle:check`.
- .NET: `dotnet format`, `dotnet build /warnaserror`.
- Ruby: `bundle exec rubocop`.
- PHP: `vendor/bin/phpcs`, `vendor/bin/phpstan`.

## Test commands
- Prefer repo scripts like `npm test`, `make test`, or `./gradlew test`.
- If none exist, use language defaults below.

### Single-test patterns (examples, choose matching tool)
- Node + Jest: `npx jest path/to/test --runInBand`.
- Node + Vitest: `npx vitest path/to/test -t "case name"`.
- Node + Mocha: `npx mocha path/to/test --grep "case"`.
- Python + Pytest: `pytest path/to/test.py -k "case"`.
- Python + unittest: `python -m unittest path.to.TestCase.test_name`.
- Go: `go test ./path -run TestName`.
- Rust: `cargo test test_name -- package::module`.
- Java + JUnit: `mvn -Dtest=ClassName#method test`.
- Gradle: `./gradlew test --tests "pkg.Class.method"`.
- .NET: `dotnet test --filter "FullyQualifiedName~TestName"`.
- Ruby + RSpec: `bundle exec rspec path/to/spec.rb:123`.
- PHP + PHPUnit: `vendor/bin/phpunit path/to/Test.php --filter testName`.

## Code style guidelines
These guidelines apply unless the repo defines stricter rules.

### General
- Match existing patterns and file organization.
- Keep changes minimal and localized.
- Prefer small, composable functions over large ones.
- Use descriptive names; avoid single-letter variables outside loops.
- Avoid magic numbers; use constants or config.
- Keep public APIs stable; add deprecations before breaking changes.

### Imports
- Order imports consistently: standard library, third-party, local.
- Use absolute imports unless local conventions say relative.
- Group imports by blank lines only when style requires it.
- Avoid unused imports; keep import lists minimal.
- Prefer explicit imports over wildcards.

### Formatting
- Use the repo formatter if present; do not reformat unrelated code.
- Keep line length consistent with project defaults.
- Favor trailing commas when the formatter expects them.
- Avoid alignment with spaces; let formatter handle alignment.
- Keep one statement per line; avoid clever one-liners.

### Types and interfaces
- Prefer explicit types at module boundaries and public functions.
- Use type inference inside small scopes.
- Favor narrow types; avoid `any`/`interface{}` where possible.
- Validate untrusted input before use.
- Model nullable values explicitly (e.g., `Option`, `null | T`).

### Naming
- Use nouns for data structures and verbs for actions.
- Boolean names should read as true/false (e.g., `isReady`).
- For collections, use plural nouns.
- For constructors/factories, use `NewX`/`createX` style as appropriate.
- Keep acronyms consistent with existing casing.

### Error handling
- Fail fast for programmer errors; return errors for runtime issues.
- Preserve original errors; wrap with context instead of replacing.
- Avoid swallowing errors; log or return them.
- Use typed errors or error codes where patterns exist.
- Do not use exceptions for normal control flow.

### Logging
- Use structured logging if available; include key context.
- Avoid logging secrets or PII.
- Use appropriate levels (debug/info/warn/error).
- Do not add noisy logs in hot paths.

### Testing
- Keep tests deterministic; avoid time-based flakiness.
- Prefer table-driven tests where idiomatic.
- Name tests after behavior, not implementation.
- Assert on outputs and side effects, not internal state.
- Use minimal fixtures; clean up resources.

### Performance
- Measure before optimizing; avoid speculative micro-optimizations.
- Watch for N+1 calls and unnecessary allocations.
- Prefer streaming/iterative processing for large data.

### Security
- Treat external input as untrusted; validate and sanitize.
- Avoid shell injection; use argument arrays where possible.
- Store secrets in env vars or secret stores, not in code.
- Redact sensitive data in logs and errors.

### Configuration
- Use env vars or config files; avoid hard-coded paths.
- Provide sane defaults; document required settings.
- Keep config schema backward compatible.

### Documentation
- Update README or in-code docs when behavior changes.
- Keep comments high-signal; explain why, not what.
- Add examples for new public APIs.

### Git hygiene
- Do not rewrite history unless explicitly asked.
- Keep commits focused; separate refactors from behavior changes.
- Do not add generated files unless repo already tracks them.

## Maintenance
- When real tooling is added, replace templates above with exact commands.
