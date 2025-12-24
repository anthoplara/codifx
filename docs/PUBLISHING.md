# Codifx Publishing Guide

## Automated Publishing (Recommended)

Use the automated publish script for safe, streamlined releases:

```bash
npm run publish:package
```

### What the script does:

1. ✅ Checks current git branch
2. ✅ Checks for uncommitted changes
3. ✅ Prompts for version bump type (patch/minor/major)
4. ✅ Updates package.json version
5. ✅ Runs build (`npm run build`)
6. ✅ Creates git commit with version
7. ✅ Creates git tag (`v0.1.6`)
8. ✅ Publishes to npm
9. ✅ Pushes to remote repository

### Version Types:

-   **Patch** (0.1.5 → 0.1.6) - Bug fixes, minor changes
-   **Minor** (0.1.5 → 0.2.0) - New features, backward compatible
-   **Major** (0.1.5 → 1.0.0) - Breaking changes
-   **Custom** - Specify exact version

---

## Manual Publishing (Alternative)

If you prefer manual control:

### 1. Update Version

```bash
# Patch version
npm version patch

# Minor version
npm version minor

# Major version
npm version major

# Specific version
npm version 0.2.0
```

### 2. Build

```bash
npm run build
```

### 3. Commit & Tag

```bash
git add .
git commit -m "chore: release v0.1.6"
git tag -a v0.1.6 -m "Release v0.1.6"
```

### 4. Publish

```bash
npm publish
```

### 5. Push

```bash
git push origin main
git push origin v0.1.6
```

---

## Pre-publish Checklist

Before publishing, ensure:

-   [ ] All tests pass
-   [ ] README is up to date
-   [ ] CHANGELOG updated (if maintained)
-   [ ] No uncommitted changes
-   [ ] On correct branch (main/master)
-   [ ] Build successful (`npm run build`)
-   [ ] Version number makes sense

---

## Troubleshooting

### "You do not have permission to publish"

Login to npm:

```bash
npm login
```

### "Version already exists"

Bump version again:

```bash
npm version patch --no-git-tag-version
```

### "Build failed"

Fix build errors before publishing:

```bash
npm run build
```

### Undo unpublished release

If you bumped version but didn't publish:

```bash
git reset --hard HEAD~1
git tag -d v0.1.6
```

---

## Post-publish

After successful publish:

1. ✅ Check on npmjs.com: https://www.npmjs.com/package/codifx
2. ✅ Test installation: `npm install -g codifx@latest`
3. ✅ Verify version: `codifx --version`
4. ✅ Create GitHub release (optional)
