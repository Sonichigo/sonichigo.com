# Backups Directory

This directory stores automatic markdown backups of cached data.

## What's Stored Here

- `posts-backup-YYYY-MM-DD.md` - Blog posts from all sources
- `repos-backup-YYYY-MM-DD.md` - GitHub repositories
- `profile-backup-YYYY-MM-DD.md` - GitHub profile data

## How It Works

When the site caches data in IndexedDB, it also saves a markdown snapshot here for:

1. **Version Control** - Track content changes over time with git
2. **Human Readability** - Easy to browse without a database
3. **Backup** - Recover data if needed
4. **Debugging** - Verify what data was cached

## Auto-Generated

These files are automatically created by `/api/backup` when:
- Data is fetched and cached
- Content is updated (based on cache TTL)

## Git Tracking

**Option 1: Track backups in git** (recommended for archival)
```bash
git add backups/*.md
git commit -m "chore: update backups"
```

**Option 2: Ignore backups** (if you prefer clean repo)
```bash
# Already in backups/.gitignore
# Just don't add them to git
```

## Viewing Backups

### Via API
```bash
# List all backups
curl http://localhost:3000/api/backup | json_pp

# Download specific backup
curl http://localhost:3000/api/backup?filename=posts-backup-2026-03-30.md
```

### Via Filesystem
```bash
# View latest posts backup
cat backups/posts-backup-*.md | head -50

# Search for specific content
grep -i "database" backups/posts-backup-*.md
```

## Manual Cleanup

Backups are created daily. To clean old backups:

```bash
# Keep only last 30 days
find backups/ -name "*.md" -mtime +30 -delete

# Keep only latest 5 backups of each type
ls -t backups/posts-backup-*.md | tail -n +6 | xargs rm
```

## File Format

Each backup is a markdown file with metadata and content:

```markdown
# Posts Backup

**Last Updated:** 2026-03-30T10:00:00.000Z
**Total Posts:** 42

---

## 1. Post Title

- **URL:** https://...
- **Source:** hashnode
- **Published:** 2026-03-29
- **Tags:** tag1, tag2

> Post excerpt...
```

Simple, searchable, version-controllable. 🎯
