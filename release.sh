#!/bin/bash

# Release script for nestjs-custom-module
# Usage: ./release.sh [major|minor|patch] or ./release.sh v1.2.3

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: v${CURRENT_VERSION}${NC}"

# Parse version parts
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Determine new version
if [ -z "$1" ]; then
    echo -e "${RED}Usage: ./release.sh [major|minor|patch] or ./release.sh v1.2.3${NC}"
    exit 1
elif [ "$1" == "major" ]; then
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
elif [ "$1" == "minor" ]; then
    MINOR=$((MINOR + 1))
    PATCH=0
elif [ "$1" == "patch" ]; then
    PATCH=$((PATCH + 1))
elif [[ "$1" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Custom version provided (with or without 'v' prefix)
    NEW_VERSION="${1#v}"
    IFS='.' read -r MAJOR MINOR PATCH <<< "$NEW_VERSION"
else
    echo -e "${RED}Invalid argument. Use: major, minor, patch, or a version like v1.2.3${NC}"
    exit 1
fi

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
TAG="v${NEW_VERSION}"

echo -e "${GREEN}New version: ${TAG}${NC}"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}You have uncommitted changes. Committing them...${NC}"
    git add .
    git commit -m "chore: prepare release ${TAG}"
fi

# Update version in package.json
npm version "$NEW_VERSION" --no-git-tag-version

# Commit the version bump
git add package.json package-lock.json 2>/dev/null || git add package.json
git commit -m "chore: bump version to ${TAG}"

# Create annotated tag
git tag -a "$TAG" -m "Release ${TAG}"

# Push commits and tag
echo -e "${YELLOW}Pushing to origin...${NC}"
git push origin main
git push origin "$TAG"

echo -e "${GREEN}✅ Released ${TAG} successfully!${NC}"
echo -e "${GREEN}Install with: npm i github:thutgtz/nestjs-custom-module#${TAG}${NC}"
