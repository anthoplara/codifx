#!/bin/bash

# Codifx Publishing Script
# Automates version bump, build, git commit/tag, and npm publish

set -e  # Exit on error

echo "🚀 Codifx Publishing Script"
echo "============================="
echo ""

# Check npm authentication
echo "⏳ Checking npm authentication..."
if ! npm whoami &> /dev/null; then
    echo "❌ Not logged in to npm"
    echo "   Please run: npm login"
    echo ""
    exit 1
fi

npm_user=$(npm whoami)
echo "✅ Logged in as: $npm_user"
echo ""

# Check if we're on main/master branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
    echo "⚠️  Warning: You are on branch '$current_branch'"
    echo "   It's recommended to publish from main/master branch"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
    read -p "   Commit changes before publishing? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "   Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "❌ Publishing cancelled. Please commit or stash changes first."
        exit 1
    fi
fi

# Get current version
current_version=$(node -p "require('./package.json').version")
echo "📦 Current version: $current_version"
echo ""

# Calculate example versions
IFS='.' read -r major minor patch <<< "$current_version"
next_patch="$major.$minor.$((patch + 1))"
next_minor="$major.$((minor + 1)).0"
next_major="$((major + 1)).0.0"

# Ask for version type
echo "Select version bump type:"
echo "  1) patch  ($current_version → $next_patch)  - Bug fixes"
echo "  2) minor  ($current_version → $next_minor)  - New features"
echo "  3) major  ($current_version → $next_major)  - Breaking changes"
echo "  4) custom - Enter version manually"
echo ""
read -p "Choice (1-4): " version_choice

case $version_choice in
    1)
        version_type="patch"
        ;;
    2)
        version_type="minor"
        ;;
    3)
        version_type="major"
        ;;
    4)
        read -p "Enter new version (e.g., 0.2.0): " custom_version
        version_type="$custom_version"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "⏳ Bumping version ($version_type)..."

# Bump version
if [ "$version_choice" = "4" ]; then
    npm version "$custom_version" --no-git-tag-version
else
    npm version "$version_type" --no-git-tag-version
fi

new_version=$(node -p "require('./package.json').version")
echo "✅ Version bumped: $current_version → $new_version"
echo ""

# Clean
echo "⏳ Cleaning dist directory..."
npm run clean
echo "✅ Dist cleaned"
echo ""

# Build
echo "⏳ Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Obfuscate
echo "⏳ Obfuscating JavaScript files..."
echo ""

# Count total files
total_files=$(find dist -name "*.js" -type f | wc -l | tr -d ' ')
echo "Found $total_files JavaScript files to obfuscate"
echo ""

# Create backup
temp_backup_dir=$(mktemp -d)
cp -R dist/ "$temp_backup_dir/"
echo "✅ Backup created"
echo ""

# Process each file
current_file=0
while IFS= read -r file; do
    current_file=$((current_file + 1))
    filename=$(basename "$file")
    
    printf "  [%d/%d] %s... " "$current_file" "$total_files" "$filename"
    
    # Obfuscate the file in-place
    if npx javascript-obfuscator "$file" \
        --output "$file" \
        --compact true \
        --control-flow-flattening true \
        --control-flow-flattening-threshold 0.75 \
        --dead-code-injection true \
        --dead-code-injection-threshold 0.4 \
        --string-array true \
        --string-array-threshold 0.75 \
        --string-array-encoding 'base64' \
        --string-array-rotate true \
        --string-array-shuffle true \
        --self-defending true \
        --rename-globals false \
        --reserved-names '^require$,^exports$,^module$' 2>&1 | grep -q "Obfuscating"; then
        echo "✓"
    else
        echo "✗ FAILED"
        echo ""
        echo "❌ Obfuscation failed for $filename"
        echo "   Restoring from backup..."
        rm -rf dist
        mv "$temp_backup_dir" dist
        exit 1
    fi
done < <(find dist -name "*.js" -type f)

# Clean up backup
rm -rf "$temp_backup_dir"

echo ""
echo "✅ All $total_files files obfuscated successfully"
echo ""

# Git commit and tag
echo "⏳ Creating git commit and tag..."
git add package.json package-lock.json
git commit -m "chore: release v$new_version"
git tag -a "v$new_version" -m "Release v$new_version"
echo "✅ Git commit and tag created"
echo ""

# Confirm before publishing
echo "🎯 Ready to publish!"
echo "   Version: v$new_version"
echo "   Registry: npmjs.com"
echo ""
read -p "Proceed with npm publish? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled"
    echo "   Note: Version was bumped and committed. To undo:"
    echo "   git reset --hard HEAD~1"
    echo "   git tag -d v$new_version"
    exit 1
fi

# Publish to npm
echo ""
echo "⏳ Publishing to npm..."
npm publish

if [ $? -ne 0 ]; then
    echo "❌ npm publish failed!"
    echo "   The version was bumped and committed but not published."
    echo "   Fix the issue and run: npm publish"
    exit 1
fi

echo ""
echo "✅ Successfully published to npm!"
echo ""

# Push to git
read -p "Push to remote repository? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⏳ Pushing to remote..."
    git push origin "$current_branch"
    git push origin "v$new_version"
    echo "✅ Pushed to remote"
fi

echo ""
echo "🎉 Publish complete!"
echo "   Version: v$new_version"
echo "   Package: https://www.npmjs.com/package/codifx"
echo ""
