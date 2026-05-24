/**
 * OG Image Generator Script
 *
 * This script generates social media preview images (OG images) for:
 * 1. Default portfolio site image
 * 2. Default blog post image
 * 3. Individual blog post images based on frontmatter
 *
 * Usage:
 *   node scripts/generate-og-images.js
 *
 * Requirements:
 *   npm install canvas
 *
 * The script generates 1200x630px images optimized for Twitter/LinkedIn/Facebook sharing.
 */

const fs = require('fs');
const path = require('path');

// Simple HTML-based OG image generator (can be replaced with Canvas-based generation)
const generateOGImageHTML = (title, subtitle, tags = []) => {
  const tagsHTML = tags.length > 0
    ? `<div class="tags">${tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 60px;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 60px;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .title {
      font-size: 64px;
      font-weight: 800;
      color: #1a202c;
      line-height: 1.2;
      margin-bottom: 20px;
    }
    .subtitle {
      font-size: 32px;
      color: #4a5568;
      line-height: 1.4;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .author {
      font-size: 28px;
      color: #667eea;
      font-weight: 600;
    }
    .tags {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 20px;
    }
    .tag {
      background: #667eea;
      color: white;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div>
      <div class="title">${title}</div>
      <div class="subtitle">${subtitle}</div>
      ${tagsHTML}
    </div>
    <div class="footer">
      <div class="author">sonichigo.com</div>
    </div>
  </div>
</body>
</html>
`;
};

// Create directories
const publicDir = path.join(process.cwd(), 'public');
const ogImagesDir = path.join(publicDir, 'og-images');
const postsOgDir = path.join(ogImagesDir, 'posts');

[ogImagesDir, postsOgDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate default portfolio OG image HTML
const defaultHTML = generateOGImageHTML(
  'Animesh Pathak',
  'DevRel, OSS Contributor & Writer'
);
fs.writeFileSync(path.join(ogImagesDir, 'default.html'), defaultHTML);

// Generate default blog OG image HTML
const blogDefaultHTML = generateOGImageHTML(
  'Blog Posts',
  'Thoughts on DevRel, Open Source, and Building Tools'
);
fs.writeFileSync(path.join(ogImagesDir, 'blog-default.html'), blogDefaultHTML);

// Generate OG images for existing blog posts
const matter = require('gray-matter');
const postsDir = path.join(process.cwd(), 'data', 'posts');

if (fs.existsSync(postsDir)) {
  const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

  postFiles.forEach(file => {
    const slug = file.replace('.md', '');
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    const title = data.title || 'Untitled Post';
    const excerpt = data.description || data.excerpt || '';
    const tags = data.tags || [];

    const postHTML = generateOGImageHTML(title, excerpt, tags);
    fs.writeFileSync(path.join(postsOgDir, `${slug}.html`), postHTML);

    console.log(`Generated OG image HTML for: ${slug}`);
  });
}

console.log('\n✅ OG image HTML templates generated!');
console.log('\nNext steps:');
console.log('1. Install a screenshot tool or use an online service to convert HTML to PNG');
console.log('2. Or use the Vercel OG Image generation API in production');
console.log('3. HTML files are saved in public/og-images/ for reference');
console.log('\nFor automatic generation, consider using:');
console.log('  - @vercel/og (recommended for Next.js)');
console.log('  - node-canvas + custom rendering');
console.log('  - Puppeteer/Playwright for HTML->PNG conversion');
