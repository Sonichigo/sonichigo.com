#!/bin/bash

# Quick publish script for blog posts
# Usage: ./publish.sh "Post title or commit message"

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Publishing blog posts to Vercel...${NC}"

# Check if there are changes
if [[ -z $(git status -s) ]]; then
    echo "✅ No changes to publish"
    exit 0
fi

# Get commit message
COMMIT_MSG=${1:-"Update blog posts"}

echo -e "${BLUE}Adding files...${NC}"
git add data/posts/

echo -e "${BLUE}Committing...${NC}"
git commit -m "$COMMIT_MSG"

echo -e "${BLUE}Pushing to GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ Published! Vercel is deploying your changes...${NC}"
echo -e "${GREEN}🔗 Check deployment at: https://vercel.com/dashboard${NC}"
