# OG Images Directory

This directory is for storing static OG (Open Graph) images if needed.

## Current Implementation

The portfolio uses **dynamic OG image generation** via `/api/og` endpoint, so this directory is primarily for:

1. **Fallback images** - Static images to use if dynamic generation fails
2. **Custom post images** - Hand-crafted images for special posts
3. **Testing** - Reference images for design comparison

## Dynamic Generation (Current)

All social cards are automatically generated at:
```
/api/og?title=[Title]&subtitle=[Description]&type=[default|post]
```

**Advantages:**
- ✅ Automatic - No manual image creation needed
- ✅ Consistent - Same design across all posts
- ✅ Up-to-date - Changes reflected immediately
- ✅ No build step - Works on-demand
- ✅ Small bundle - No large image files in repo

## Static Images (Optional)

If you want to use custom static images for specific posts:

### 1. Create Image
- Size: 1200x630px
- Format: PNG or JPG
- Optimize for web (aim for <300KB)

### 2. Save Here
```
public/og-images/
├── default.png          # Homepage fallback
├── blog-default.png     # Blog listing fallback
└── posts/
    └── my-post-slug.png # Custom post image
```

### 3. Update Frontmatter
Add `ogImage` field to your post:
```yaml
---
title: My Special Post
ogImage: /og-images/posts/my-post-slug.png
---
```

### 4. Update Metadata
Edit `src/app/posts/[slug]/page.tsx`:
```typescript
const ogImage = post.ogImage || `/api/og?title=...`;
```

## Design Guidelines

When creating custom images:

- **Dimensions**: 1200x630px (1.91:1 ratio)
- **Safe area**: 50px margin from edges
- **Text size**: Minimum 40px for readability
- **Contrast**: High contrast for visibility
- **Brand**: Include "sonichigo.com" branding
- **Format**: PNG for graphics, JPG for photos
- **Size**: Under 300KB (under 1MB max)

## Tools for Creating OG Images

- **Figma** - [figma.com](https://figma.com)
- **Canva** - [canva.com](https://canva.com)
- **OG Image Playground** - [og-playground.vercel.app](https://og-playground.vercel.app)
- **Social Image Generator** - [github.com/vercel/satori](https://github.com/vercel/satori)

## Testing Static Images

1. Place image in this directory
2. Access directly: `http://localhost:3000/og-images/your-image.png`
3. Test with social validators
4. Deploy and verify

## Current Strategy

**Recommended approach** (current):
- Use dynamic generation for 95% of content
- Reserve static images for special/featured posts only
- Keep repo size small
- Maintain design consistency automatically

**Static approach** (alternative):
- More control over each image
- Requires manual creation
- Larger repo size
- More maintenance overhead
- Better for unique/branded campaigns
