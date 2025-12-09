# Paramedical Knowledge Hub

A fast, SEO-friendly content website built with Astro and TypeScript, designed to host 1,000+ informational articles about general health and paramedical topics. This site is deployed on Cloudflare Pages and is optimized for performance, accessibility, and search engine visibility.

## 🎯 Project Overview

This website provides educational health and paramedical information for general audiences. **All content is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.**

## 🚀 Features

- **Fast Performance**: Built with Astro for optimal loading speeds
- **SEO Optimized**: Comprehensive meta tags, structured data, sitemap, and robots.txt
- **Content Collections**: Organized article management with Astro Content Collections
- **Responsive Design**: Mobile-first, accessible design
- **TypeScript**: Full type safety throughout the codebase
- **Cloudflare Ready**: Configured for Cloudflare Pages deployment
- **AdSense Ready**: Placeholder components for future ad integration

## 📁 Project Structure

```
.
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AdSlot.astro
│   │   ├── ArticleCard.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── MedicalDisclaimer.astro
│   │   ├── Pagination.astro
│   │   ├── TableOfContents.astro
│   │   └── Tag.astro
│   ├── content/
│   │   ├── articles/       # Article markdown files
│   │   └── config.ts       # Content collection schema
│   ├── layouts/
│   │   ├── ArticleLayout.astro
│   │   └── BaseLayout.astro
│   ├── pages/              # File-based routing
│   │   ├── articles/
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── disclaimer.astro
│   │   └── index.astro
│   ├── utils/              # Utility functions
│   └── config.ts           # Site configuration
├── scripts/
│   └── seed-placeholders.ts # Utility to generate placeholder articles
├── astro.config.mjs        # Astro configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm (or pnpm/yarn)
- Git

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:4321`

### Building for Production

```bash
npm run build
```

This will:
- Type-check the codebase
- Build the site for production
- Output to the `dist/` directory

### Preview Production Build

```bash
npm run preview
```

## 📝 Adding New Articles

### Manual Method

1. Create a new markdown file in `src/content/articles/`
2. Use the following frontmatter structure:

```yaml
---
title: Your Article Title
slug: your-article-slug
summary: A brief summary of the article (used in meta descriptions and previews)
category: physiotherapy  # One of: prevention, rehabilitation, physiotherapy, occupational_therapy, nutrition, mental_wellbeing, general_health, other
tags: ['tag1', 'tag2', 'tag3']
publishedAt: 2024-01-15
updatedAt: 2024-01-20  # Optional
readingTime: 8  # Optional, will be calculated automatically if not provided
featured: false  # Optional, set to true to feature on homepage
---
```

3. Write your article content in Markdown below the frontmatter

### Using the Seed Script

To generate placeholder articles:

```bash
npm run seed
```

This will create placeholder articles with lorem ipsum content. Replace the content with actual article text as needed.

## ⚙️ Configuration

### Site Configuration

Edit `src/config.ts` to customize:

- Site name and description
- Site URL
- Author information
- Category labels
- Social media links

### Changing the Site Name

1. Update `siteConfig.name` in `src/config.ts`
2. Update the site title in `src/components/Header.astro` if needed
3. Update meta tags in `src/layouts/BaseLayout.astro`

## 🎨 Customization

### Styling

The project uses scoped CSS in Astro components. To customize:

- **Colors**: Update color values in component `<style>` blocks
- **Typography**: Modify font sizes and families in `BaseLayout.astro`
- **Layout**: Adjust grid and flexbox properties in component styles

### Components

All components are in `src/components/`. They're designed to be:

- Reusable across pages
- Type-safe with TypeScript
- Accessible (ARIA labels, semantic HTML)
- Responsive (mobile-first design)

## 📊 SEO Features

- **Meta Tags**: Open Graph and Twitter Card tags on all pages
- **Structured Data**: JSON-LD for articles (Article schema)
- **Sitemap**: Automatically generated at `/sitemap.xml`
- **Robots.txt**: Available at `/robots.txt`
- **Canonical URLs**: Set on all pages
- **Semantic HTML**: Proper heading hierarchy and semantic elements

## 🎯 AdSense Integration

Ad placeholder components are included and ready for integration:

- `<AdSlot position="top-article" />` - Top of article pages
- `<AdSlot position="in-content" />` - Middle of article content
- `<AdSlot position="sidebar" />` - Sidebar on article pages
- `<AdSlot position="top-page" />` - Top of listing pages
- `<AdSlot position="bottom-page" />` - Bottom of pages

To integrate real AdSense:

1. Replace the placeholder content in `src/components/AdSlot.astro`
2. Add your AdSense code
3. Ensure ad dimensions match the placeholder sizes

## 🧹 Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## 🚢 Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed Cloudflare Pages deployment instructions.

## 📚 Content Guidelines

### Medical Disclaimer

**Important**: All content must include appropriate medical disclaimers. The `MedicalDisclaimer` component is automatically included on article pages, but ensure:

1. Content is educational only
2. No personalized medical advice
3. Clear statements encouraging professional consultation
4. Links to the Disclaimer page

### Article Structure

- Use clear, descriptive titles
- Include a compelling summary (used in previews and meta descriptions)
- Organize content with proper heading hierarchy (H2, H3)
- Use lists and formatting for readability
- Include relevant tags for discoverability

## 🔒 Legal and Safety

- **No Medical Advice**: Content is informational only
- **Clear Disclaimers**: Visible on all article pages
- **Professional Consultation**: Always encourage users to consult healthcare professionals
- **Privacy**: Consider adding a privacy policy page
- **Terms**: Consider adding terms of service

## 🐛 Troubleshooting

### Build Errors

- Ensure all articles have valid frontmatter
- Check that dates are in YYYY-MM-DD format
- Verify category values match those in `config.ts`

### Type Errors

- Run `npm run build` to see TypeScript errors
- Ensure article frontmatter matches the schema in `src/content/config.ts`

### Content Not Appearing

- Check that `publishedAt` date is in the past
- Verify the article file is in `src/content/articles/`
- Ensure the slug matches the filename (without .md)

## 📖 Resources

- [Astro Documentation](https://docs.astro.build)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines if applicable]

## 📧 Contact

For questions or feedback, please use the contact form on the website.

---

**Remember**: This site provides educational information only. Always consult qualified healthcare professionals for medical advice.

