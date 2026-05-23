# sonichigo.com

Modern portfolio website with built-in markdown blog editor. Built with Next.js and deployed on Vercel.

## ✨ Features

- 🎨 **Modern Design**: Clean, professional portfolio layout with dark mode
- 📝 **Built-in Editor**: Write blog posts with markdown and live preview
- 🎤 **Talks Section**: Showcase speaking engagements with past/upcoming status
- 🌍 **Travels Map**: Interactive world map of your travels
- 🚀 **GitHub Integration**: Display pinned repositories
- 🔄 **RSS Feed**: Aggregate posts from Hashnode, Dev.to, Medium
- 📱 **Responsive**: Mobile-first design

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Writing Blog Posts

1. **Open the editor**: `http://localhost:3000/editor`
2. **Login**: Password from `.env.local` (default: `admin123`)
3. **Create/Edit**: Write posts with markdown and live preview
4. **Save**: Posts saved to `data/posts/*.md`
5. **Publish**: Run `./publish.sh "Your post title"`

### Deploy to Vercel

```bash
# Quick publish
./publish.sh "Add new blog post"

# Or manually
git add data/posts/
git commit -m "Add new blog post"
git push origin main
```

Vercel auto-deploys your changes! 🎉

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Vercel deployment guide
- **[EDITOR_GUIDE.md](EDITOR_GUIDE.md)** - Blog editor usage
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## 🛠️ Tech Stack

- Next.js 14, Tailwind CSS, TypeScript
- react-markdown, gray-matter
- Deployed on Vercel

## 📁 Structure

```
├── src/app/          # Pages & API routes
├── data/posts/       # Blog posts (markdown)
├── data/talks.md     # Speaking engagements
└── data/travels.md   # Travel data
```

## 🔧 Configuration

Create `.env.local`:

```bash
EDITOR_PASSWORD=your_secure_password
```

## 🔐 Security

- Editor is password-protected
- Local-only (not in production)
- Version controlled content

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 📞 Contact

- Website: [sonichigo.com](https://sonichigo.com)
- GitHub: [@sonichigo](https://github.com/sonichigo)

---

Built with ❤️ using Next.js