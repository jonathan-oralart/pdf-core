# Agent Instructions

Scope: `/Users/jonathan/Developer/pdf-core`.

## Dependent Tools

Local consumers of `@oralart/pdf-core`:

- [Raycast LMS](/Users/jonathan/Developer/lms/raycast_lms)
- [LMS Svelte userscript](/Users/jonathan/Developer/tampermonkey/lms-svelte)
- [iOS LMS](/Users/jonathan/Developer/lms/ios_lms)

## Release Workflow

Make and validate `pdf-core` changes first. For publishable changes, bump `deno.json`, run `deno task check`, commit only the `pdf-core` changes, and push `main`. GitHub Actions publishes to JSR from `.github/workflows/publish.yml`.

Before updating dependents, wait until the npm bridge exposes the new package version:

```bash
npm view @jsr/oralart__pdf-core version --registry=https://npm.jsr.io
```

## Updating Dependents

- Raycast LMS: update `@oralart/pdf-core`, run the repo-local `$post-task` skill from `.codex/skills/post-task`, then make a focused commit. The skill handles lint/fix, changelog, package version bump, and publish.
- LMS Svelte userscript: update `@oralart/pdf-core`, bump the userscript `version` in `vite.config.ts`, run `npm run build`, commit, then push.
- iOS LMS: update the dependency under `server/`, run the relevant server validation such as `npm test`, then commit. Do not push unless explicitly requested.
